import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma, vouchers } from '@prisma/client';
import { MEMBERSHIP_TIERS, membershipDiscount, voucherAudienceAllows, voucherAudienceLabel, type VoucherPayload } from 'shared';
import { getAccountUserId } from '../../common/auth/account-user';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Injectable()
export class VouchersService {
    constructor(private readonly prisma: PrismaService) {}

    async validateForAccount(accountId: number, code: string, rawAmount: string) {
        return this.validatePublicVoucher(code, rawAmount, await getAccountUserId(this.prisma, accountId, 'Không tìm thấy người dùng.'));
    }

    async validatePublicVoucher(code: string, rawAmount: string, userId?: number) {
        const amount = Number(rawAmount);
        if (!code?.trim() || !rawAmount?.trim() || !Number.isFinite(amount) || amount <= 0) throw new BadRequestException('Mã giảm giá hoặc giá trị đơn không hợp lệ.');
        const voucher = await this.prisma.vouchers.findFirst({
            where: {
                code: code.trim().toUpperCase(),
                OR: [{ owner_user_id: null }, ...(userId ? [{ owner_user_id: userId }] : [])],
                status: 1, start_date: { lte: new Date() }, expiry_date: { gt: new Date() },
            },
        });
        if (!voucher || voucher.used_count >= voucher.usage_limit || amount < Number(voucher.min_order_value)) throw new BadRequestException('Mã giảm giá không hợp lệ hoặc chưa đủ điều kiện áp dụng.');
        const membership = userId ? await this.prisma.memberships.findUnique({ where: { user_id: userId }, select: { tier: true } }) : null;
        if (!voucherAudienceAllows(voucher.eligible_tiers, userId ? membership?.tier ?? 'bronze' : null)) {
            throw new BadRequestException(userId ? `Voucher chỉ áp dụng cho: ${voucherAudienceLabel(voucher.eligible_tiers)}.` : 'Vui lòng đăng nhập để kiểm tra hạng thành viên được dùng voucher này.');
        }
        const discount = membershipDiscount({ discount_type: voucher.discount_type, discount_value: Number(voucher.discount_value), min_order_value: Number(voucher.min_order_value), max_discount_amount: voucher.max_discount_amount === null ? null : Number(voucher.max_discount_amount) }, amount);
        return { voucher_id: voucher.voucher_id, code: voucher.code, discount_amount: discount, final_amount: amount - discount };
    }

    private normalizePayload(data: VoucherPayload) {
        if (data.eligible_tiers !== undefined && (!Array.isArray(data.eligible_tiers) || data.eligible_tiers.length > 5 || new Set(data.eligible_tiers).size !== data.eligible_tiers.length || data.eligible_tiers.some(tier => !MEMBERSHIP_TIERS.some(item => item.id === tier)))) {
            throw new BadRequestException('Đối tượng áp dụng không hợp lệ.');
        }
        const payload = {
            code: data.code !== undefined ? String(data.code).trim().toUpperCase() : undefined,
            discount_type: data.discount_type,
            discount_value: data.discount_value !== undefined ? Number(data.discount_value) : undefined,
            min_order_value: data.min_order_value != null ? Number(data.min_order_value) : undefined,
            max_discount_amount: data.max_discount_amount === null ? null : data.max_discount_amount !== undefined ? Number(data.max_discount_amount) : undefined,
            usage_limit: data.usage_limit !== undefined ? Number(data.usage_limit) : undefined,
            start_date: data.start_date ? new Date(data.start_date) : undefined,
            expiry_date: data.expiry_date ? new Date(data.expiry_date) : undefined,
            status: data.status !== undefined ? Number(data.status) : undefined,
            eligible_tiers: data.eligible_tiers,
        };
        if (payload.code !== undefined && (!/^[A-Z0-9_-]{1,50}$/.test(payload.code))) throw new BadRequestException('Mã voucher cần 1–50 ký tự chữ, số, gạch ngang hoặc gạch dưới.');
        if (payload.discount_type !== undefined && !['percentage', 'fixed', 'fixed_amount'].includes(payload.discount_type)) throw new BadRequestException('Loại giảm giá không hợp lệ.');
        for (const value of [payload.discount_value, payload.min_order_value, payload.max_discount_amount]) if (value != null && (!Number.isFinite(value) || value < 0 || value > 9_999_999_999)) throw new BadRequestException('Giá trị tiền không hợp lệ.');
        if (payload.usage_limit !== undefined && (!Number.isSafeInteger(payload.usage_limit) || payload.usage_limit < 1 || payload.usage_limit > 2147483647)) throw new BadRequestException('Số lượng voucher không hợp lệ.');
        if (payload.status !== undefined && ![0, 1].includes(payload.status)) throw new BadRequestException('Trạng thái voucher không hợp lệ.');
        if ([payload.start_date, payload.expiry_date].some(date => date && Number.isNaN(date.getTime()))) throw new BadRequestException('Thời gian voucher không hợp lệ.');
        return payload;
    }

    private validateDiscount(type: string, value: number, start: Date, end: Date) {
        if (value <= 0 || (type === 'percentage' && value > 100)) throw new BadRequestException('Mức giảm phải lớn hơn 0, phần trăm không vượt quá 100.');
        if (end <= start) throw new BadRequestException('Ngày hết hạn phải sau ngày bắt đầu.');
    }

    private async ensureExists(id: number) {
        if (!Number.isSafeInteger(id) || id < 1) throw new BadRequestException('Mã voucher không hợp lệ.');
        const voucher = await this.prisma.vouchers.findUnique({ where: { voucher_id: id } });
        if (!voucher) throw new NotFoundException('Không tìm thấy voucher.');
        return voucher;
    }

    // One transaction publishes the voucher and its in-account notifications together.
    private async notifyAudience(tx: Prisma.TransactionClient, voucher: vouchers): Promise<number> {
        if (voucher.status !== 1 || voucher.expiry_date <= new Date() || voucher.owner_user_id !== null) return 0;
        const tierFilter: Prisma.usersWhereInput = voucher.eligible_tiers.length ? {
            OR: [{ membership: { is: { tier: { in: voucher.eligible_tiers } } } }, ...(voucher.eligible_tiers.includes('bronze') ? [{ membership: { is: null } }] : [])],
        } : {};
        const money = (value: number) => `${value.toLocaleString('vi-VN')}đ`;
        const date = (value: Date) => value.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
        const discount = voucher.discount_type === 'percentage' ? `${Number(voucher.discount_value)}%${voucher.max_discount_amount === null ? '' : `, tối đa ${money(Number(voucher.max_discount_amount))}`}` : money(Number(voucher.discount_value));
        const message = `Mã ${voucher.code}: giảm ${discount} cho tiền tour, đơn từ ${money(Number(voucher.min_order_value))}. Hiệu lực từ ${date(voucher.start_date)} đến ${date(voucher.expiry_date)}. Áp dụng cho ${voucherAudienceLabel(voucher.eligible_tiers)}. Chương trình có ${voucher.usage_limit} lượt sử dụng chung, tùy số lượt còn lại.`;
        let cursor = 0, count = 0;
        while (true) {
            const customers = await tx.users.findMany({ where: { ...tierFilter, user_id: { gt: cursor }, is_staff: false, accounts: { status: 1 } }, select: { user_id: true }, orderBy: { user_id: 'asc' }, take: 500 });
            if (!customers.length) break;
            const inserted = await tx.membership_notifications.createMany({ data: customers.map(user => ({ user_id: user.user_id, voucher_id: voucher.voucher_id, event_key: `voucher:${voucher.voucher_id}:${user.user_id}`, title: `Ưu đãi mới: ${voucher.code}`, message })), skipDuplicates: true });
            count += inserted.count;
            cursor = customers[customers.length - 1].user_id;
        }
        return count;
    }

    async findAll() {
        const vouchers = await this.prisma.vouchers.findMany({ where: { owner_user_id: null }, include: { _count: { select: { notifications: true } } }, orderBy: { created_at: 'desc' } });
        return vouchers.map(voucher => ({ ...voucher, notification_count: voucher._count.notifications }));
    }
    async findOne(id: number) { return this.ensureExists(id); }

    async create(data: VoucherPayload) {
        const payload = this.normalizePayload(data);
        if (!payload.code || !payload.discount_type || payload.discount_value === undefined || !payload.start_date || !payload.expiry_date) throw new BadRequestException('Vui lòng nhập đầy đủ thông tin voucher.');
        this.validateDiscount(payload.discount_type, payload.discount_value, payload.start_date, payload.expiry_date);
        const record = { code: payload.code, discount_type: payload.discount_type, discount_value: payload.discount_value, min_order_value: payload.min_order_value ?? 0, max_discount_amount: payload.max_discount_amount, usage_limit: payload.usage_limit ?? 100, start_date: payload.start_date, expiry_date: payload.expiry_date, status: payload.status ?? 1, eligible_tiers: payload.eligible_tiers ?? [] };
        try {
            return await this.prisma.$transaction(async tx => {
                const voucher = await tx.vouchers.create({ data: record });
                const notification_count = await this.notifyAudience(tx, voucher);
                return { ...voucher, notification_count };
            }, { timeout: 30_000 });
        } catch (error) {
            if ((error as { code?: string }).code === 'P2002') throw new BadRequestException('Mã voucher này đã tồn tại.');
            throw error;
        }
    }

    async update(id: number, data: VoucherPayload) {
        await this.ensureExists(id);
        const payload = this.normalizePayload(data);
        return this.prisma.$transaction(async tx => {
            await tx.$queryRaw`SELECT voucher_id FROM vouchers WHERE voucher_id = ${id} FOR UPDATE`;
            const current = await tx.vouchers.findUnique({ where: { voucher_id: id } });
            if (!current) throw new NotFoundException('Không tìm thấy voucher.');
            if (current.used_count && Object.entries(payload).some(([key, value]) => key !== 'status' && value !== undefined)) throw new BadRequestException('Voucher đã sử dụng chỉ có thể đổi trạng thái.');
            const expires = payload.expiry_date ?? current.expiry_date;
            if (payload.status === 1 && current.status !== 1) {
                if (expires <= new Date()) throw new BadRequestException('Voucher đã hết hạn, không thể mở lại.');
                if (current.used_count >= (payload.usage_limit ?? current.usage_limit)) throw new BadRequestException('Voucher đã hết lượt, không thể mở lại.');
            }
            this.validateDiscount(payload.discount_type ?? current.discount_type, payload.discount_value ?? Number(current.discount_value), payload.start_date ?? current.start_date, expires);
            const voucher = await tx.vouchers.update({ where: { voucher_id: id }, data: payload });
            const notification_count = current.status !== 1 && voucher.status === 1 ? await this.notifyAudience(tx, voucher) : 0;
            return { ...voucher, notification_count };
        }, { timeout: 30_000 });
    }

    async remove(id: number) {
        const voucher = await this.ensureExists(id);
        if (voucher.used_count) throw new BadRequestException('Không thể xóa voucher đã được sử dụng.');
        return this.prisma.vouchers.delete({ where: { voucher_id: id } });
    }
}
