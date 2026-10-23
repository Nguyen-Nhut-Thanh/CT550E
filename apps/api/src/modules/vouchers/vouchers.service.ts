import { BadRequestException, Injectable, NotFoundException, } from '@nestjs/common';
import type { VoucherPayload } from 'shared';
import { PrismaService } from '../../infrastructure/database/prisma.service';
@Injectable()
export class VouchersService {
    constructor(private readonly prisma: PrismaService) { }
    async validatePublicVoucher(code: string, rawAmount: string) {
        const amount = Number(rawAmount);
        if (!code?.trim() || !Number.isFinite(amount) || amount < 0) {
            throw new BadRequestException('Mã giảm giá hoặc giá trị đơn không hợp lệ.');
        }
        const voucher = await this.prisma.vouchers.findFirst({
            where: {
                code: code.trim(),
                status: 1,
                start_date: { lte: new Date() },
                expiry_date: { gte: new Date() },
            },
        });
        if (!voucher || voucher.used_count >= voucher.usage_limit || amount < Number(voucher.min_order_value)) {
            throw new BadRequestException('Mã giảm giá không hợp lệ hoặc chưa đủ điều kiện áp dụng.');
        }
        let discount = voucher.discount_type === 'percentage'
            ? amount * Number(voucher.discount_value) / 100
            : Number(voucher.discount_value);
        if (voucher.discount_type === 'percentage' && voucher.max_discount_amount != null) {
            discount = Math.min(discount, Number(voucher.max_discount_amount));
        }
        discount = Math.min(Math.max(discount, 0), amount);
        return {
            voucher_id: voucher.voucher_id,
            code: voucher.code,
            discount_amount: discount,
            final_amount: amount - discount,
        };
    }
    private async ensureExists(id: number) {
        const voucher = await this.prisma.vouchers.findUnique({
            where: { voucher_id: id },
        });
        if (!voucher) {
            throw new NotFoundException('Không tìm thấy voucher');
        }
        return voucher;
    }
    private normalizeCode(code?: string) {
        return code?.trim().toUpperCase();
    }
    private normalizePayload(data: VoucherPayload) {
        return {
            code: data.code ? this.normalizeCode(data.code) : undefined,
            discount_type: data.discount_type,
            discount_value: data.discount_value !== undefined ? Number(data.discount_value) : undefined,
            min_order_value: data.min_order_value !== undefined && data.min_order_value !== null
                ? Number(data.min_order_value)
                : undefined,
            max_discount_amount: data.max_discount_amount !== undefined && data.max_discount_amount !== null
                ? Number(data.max_discount_amount)
                : undefined,
            usage_limit: data.usage_limit !== undefined && data.usage_limit !== null
                ? Number(data.usage_limit)
                : undefined,
            start_date: data.start_date ? new Date(data.start_date) : undefined,
            expiry_date: data.expiry_date ? new Date(data.expiry_date) : undefined,
            status: data.status !== undefined ? Number(data.status) : undefined,
        };
    }
    async findAll() {
        return this.prisma.vouchers.findMany({
            orderBy: { created_at: 'desc' },
        });
    }
    async findOne(id: number) {
        return this.ensureExists(id);
    }
    async create(data: VoucherPayload) {
        const payload = this.normalizePayload(data);
        const existing = await this.prisma.vouchers.findUnique({
            where: { code: payload.code },
        });
        if (existing) {
            throw new BadRequestException('Mã voucher này đã tồn tại');
        }
        return this.prisma.vouchers.create({
            data: {
                code: payload.code!,
                discount_type: payload.discount_type!,
                discount_value: payload.discount_value!,
                min_order_value: payload.min_order_value ?? 0,
                max_discount_amount: payload.max_discount_amount,
                usage_limit: payload.usage_limit ?? 100,
                start_date: payload.start_date!,
                expiry_date: payload.expiry_date!,
                status: payload.status ?? 1,
            },
        });
    }
    async update(id: number, data: VoucherPayload) {
        await this.ensureExists(id);
        const payload = this.normalizePayload(data);
        if (payload.code) {
            const existing = await this.prisma.vouchers.findUnique({
                where: { code: payload.code },
            });
            if (existing && existing.voucher_id !== id) {
                throw new BadRequestException('Mã voucher này đã tồn tại');
            }
        }
        return this.prisma.vouchers.update({
            where: { voucher_id: id },
            data: payload,
        });
    }
    async remove(id: number) {
        await this.ensureExists(id);
        return this.prisma.vouchers.delete({
            where: { voucher_id: id },
        });
    }
}
