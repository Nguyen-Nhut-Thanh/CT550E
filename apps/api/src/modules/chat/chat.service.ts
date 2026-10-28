import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import type { ChatActor, ChatContextCard, ChatContextInput, JwtChatPayload, SendPayload } from 'shared';
import { PrismaService } from '../../infrastructure/database/prisma.service';
@Injectable()
export class ChatService {
    constructor(private readonly prisma: PrismaService) { }
    async actor(payload: Pick<JwtChatPayload, 'sub' | 'accountId'>): Promise<ChatActor> {
        if (!Number.isSafeInteger(payload?.sub) || payload.sub < 1)
            throw new UnauthorizedException('Phiên đăng nhập không hợp lệ');
        const user = await this.prisma.users.findUnique({
            where: { user_id: payload.sub }, include: { accounts: { select: { status: true } } },
        });
        if (!user || user.accounts.status !== 1 || (payload.accountId !== undefined && user.account_id !== payload.accountId)) {
            throw new UnauthorizedException('Phiên đăng nhập không hợp lệ');
        }
        return { userId: user.user_id, accountId: user.account_id, isStaff: user.is_staff, fullName: user.full_name };
    }
    requireStaff(actor: ChatActor) {
        if (!actor.isStaff)
            throw new ForbiddenException('Chỉ nhân viên được thực hiện');
    }
    async authorize(id: number, actor: ChatActor) {
        if (!Number.isSafeInteger(id) || id < 1)
            throw new BadRequestException('Hội thoại không hợp lệ');
        const conversation = await this.prisma.conversations.findUnique({ where: { conversation_id: id } });
        if (!conversation)
            throw new NotFoundException('Không tìm thấy hội thoại');
        if (!actor.isStaff && conversation.user_id !== actor.userId)
            throw new ForbiddenException('Không có quyền truy cập hội thoại');
        return conversation;
    }
    async getOrCreateConversation(actor: ChatActor) {
        if (actor.isStaff)
            throw new BadRequestException('Hãy chọn hội thoại của khách hàng');
        return this.prisma.$transaction(async (tx) => {
            // Serialize creation per customer without discarding legacy history.
            await tx.$executeRaw `SELECT pg_advisory_xact_lock(8421, ${actor.userId}::integer)`;
            return await tx.conversations.findFirst({ where: { user_id: actor.userId }, orderBy: { conversation_id: 'desc' } })
                ?? tx.conversations.create({ data: { user_id: actor.userId, status: 'IN_PROGRESS' } });
        });
    }
    async list(actor: ChatActor) {
        const rows = await this.prisma.conversations.findMany({
            where: actor.isStaff ? {} : { user_id: actor.userId },
            include: {
                users: { select: { user_id: true, full_name: true, avatar_url: true, ...(actor.isStaff ? { phone: true, address: true, created_at: true, accounts: { select: { email: true } } } : {}) } },
                assigned_staff: { select: { user_id: true, full_name: true } },
                _count: { select: { messages: { where: { is_read: false, sender_role: actor.isStaff ? 'USER' : { in: ['ADMIN', 'STAFF'] } } } } },
            }, orderBy: [{ last_message_at: 'desc' }, { conversation_id: 'desc' }],
        });
        return rows.map(({ _count, ...row }) => ({ ...row, unread_count: _count.messages }));
    }
    async staff(actor: ChatActor) {
        this.requireStaff(actor);
        return this.prisma.users.findMany({ where: { is_staff: true, accounts: { status: 1 } }, select: { user_id: true, full_name: true }, orderBy: { full_name: 'asc' } });
    }
    async messages(id: number, actor: ChatActor, before?: number, after?: number) {
        await this.authorize(id, actor);
        if ([before, after].some(value => value !== undefined && (!Number.isSafeInteger(value) || value < 1)) || (before && after)) {
            throw new BadRequestException('Mốc tin nhắn không hợp lệ');
        }
        const rows = await this.prisma.messages.findMany({
            where: { conversation_id: id, ...(before ? { message_id: { lt: before } } : after ? { message_id: { gt: after } } : {}) },
            orderBy: { message_id: after ? 'asc' : 'desc' }, take: 31,
        });
        const hasMore = rows.length > 30;
        const items = rows.slice(0, 30);
        if (!after)
            items.reverse();
        return { items, has_more: hasMore, next_cursor: items.length ? items[after ? items.length - 1 : 0].message_id : null };
    }
    async contexts(id: number, actor: ChatActor) {
        await this.authorize(id, actor);
        const rows = await this.prisma.messages.findMany({
            where: { conversation_id: id, message_type: 'CONTEXT' },
            orderBy: { message_id: 'desc' }, select: { context: true },
        });
        const seen = new Set<string>();
        return rows.flatMap(row => {
            const card = row.context as unknown as ChatContextCard | null;
            if (!card || !['tour', 'booking'].includes(card.kind)) return [];
            const key = card.kind + ':' + card.id;
            if (seen.has(key)) return [];
            seen.add(key);
            return [card];
        });
    }
    private async context(input: ChatContextInput | undefined, owner: number): Promise<ChatContextCard> {
        if (!input || Boolean(input.tour_id) === Boolean(input.booking_id))
            throw new BadRequestException('Chọn một tour hoặc đơn đặt tour');
        const id = input.tour_id ?? input.booking_id;
        if (!Number.isSafeInteger(id) || id! < 1)
            throw new BadRequestException('Thông tin tư vấn không hợp lệ');
        if (input.tour_id) {
            const tour = await this.prisma.tours.findFirst({ where: { tour_id: input.tour_id, status: 1 }, select: { name: true, summary: true, cuisine_info: true, transport_info: true, transports: { select: { name: true } }, tour_type: true, rating_avg: true, rating_count: true, tour_destinations: { orderBy: { visit_order: 'asc' }, take: 1, select: { locations: { select: { name: true } } } }, base_price: true, duration_days: true, duration_nights: true, cut_off_hours: true, tour_schedules: { where: { status: 1, start_date: { gte: new Date() } }, orderBy: [{ start_date: 'asc' }, { tour_schedule_id: 'asc' }], include: { flash_deals: true, tour_schedule_hotels: { select: { hotels: { select: { star_rating: true } } } } } }, tour_images: { orderBy: [{ is_cover: 'desc' }, { sort_order: 'asc' }], take: 1, select: { image_url: true } } } });
            if (!tour)
                throw new NotFoundException('Tour không còn hiển thị');
            const schedule = tour.tour_schedules.find(item => item.quota > item.booked_count && item.start_date.getTime() - Date.now() >= (tour.cut_off_hours || 24) * 3600000);
            if (!schedule) throw new BadRequestException('Tour chưa có lịch khởi hành còn chỗ phù hợp');
            const originalPrice = Number(schedule.price);
            const deal = schedule.flash_deals;
            const price = deal?.status === 1 ? Math.max(0, Math.round(deal.discount_type === 'percentage' ? originalPrice * (1 - Number(deal.discount_value) / 100) : originalPrice - Number(deal.discount_value))) : originalPrice;
            const stars = [...new Set(schedule.tour_schedule_hotels?.map(item => item.hotels.star_rating) || [])].sort();
            return { ...(tour.summary ? { summary: tour.summary } : {}), ...(tour.tour_destinations?.[0] ? { destination: tour.tour_destinations[0].locations.name } : {}), ...(tour.transport_info || tour.transports?.name ? { transport: tour.transport_info || tour.transports?.name } : {}), ...(tour.cuisine_info ? { meals: tour.cuisine_info } : {}), ...(stars.length ? { hotel: stars.map(star => star + ' sao').join(' - ') } : {}), ...(tour.rating_count ? { rating: Number(tour.rating_avg), rating_count: tour.rating_count } : {}), ...(tour.tour_type ? { category: tour.duration_days === 1 ? 'Tour trong ngày' : tour.tour_type === 'international' ? 'Tour quốc tế' : 'Tour trong nước' } : {}), ...(price < originalPrice ? { original_price: originalPrice } : {}), kind: 'tour', id: input.tour_id, title: tour.name, url: `/tours/${input.tour_id}`, image_url: schedule.cover_image_url || tour.tour_images[0]?.image_url, price, schedule_id: schedule.tour_schedule_id, departure_date: schedule.start_date.toISOString(), duration: `${tour.duration_days} ngày ${tour.duration_nights} đêm` };
        }
        const booking = await this.prisma.bookings.findFirst({ where: { booking_id: input.booking_id, user_id: owner }, include: { tour_schedules: { select: { tours: { select: { name: true } } } } } });
        if (!booking)
            throw new ForbiddenException('Đơn đặt tour không thuộc khách hàng này');
        return { kind: 'booking', id: booking.booking_id, title: `Đơn #${booking.booking_id} · ${booking.tour_schedules.tours.name}`, url: `/booking/result?booking_id=${booking.booking_id}` };
    }
    async send(actor: ChatActor, data: SendPayload) {
        if (!data || typeof data.content !== 'string')
            throw new BadRequestException('Tin nhắn không hợp lệ');
        const conversation = await this.authorize(data.conversation_id, actor);
        const type = data.message_type ?? 'TEXT';
        if (!['TEXT', 'IMAGE', 'CONTEXT'].includes(type))
            throw new BadRequestException('Loại tin nhắn không hợp lệ');
        if (data.client_message_id !== undefined && (typeof data.client_message_id !== 'string' || !/^[\w-]{8,64}$/.test(data.client_message_id)))
            throw new BadRequestException('Mã tin nhắn không hợp lệ');
        const content = data.content.trim();
        if (type !== 'CONTEXT' && (!content || content.length > 4000))
            throw new BadRequestException('Tin nhắn phải có từ 1 đến 4000 ký tự');
        if (type === 'IMAGE') {
            let url: URL;
            try {
                url = new URL(content);
            }
            catch {
                throw new BadRequestException('Ảnh không hợp lệ');
            }
            if (url.protocol !== 'https:' || url.hostname !== 'res.cloudinary.com' || !url.pathname.startsWith(`/${process.env.CLOUDINARY_NAME}/image/upload/`) || !url.pathname.includes('/travel_v2/chat_images/'))
                throw new BadRequestException('Hãy tải ảnh qua chức năng chat');
        }
        const context = type === 'CONTEXT' ? await this.context(data.context, conversation.user_id) : undefined;
        return this.prisma.$transaction(async (tx) => {
            await tx.$queryRaw `SELECT conversation_id FROM conversations WHERE conversation_id = ${data.conversation_id} FOR UPDATE`;
            const current = await tx.conversations.findUniqueOrThrow({ where: { conversation_id: data.conversation_id } });
            if (data.client_message_id) {
                const existing = await tx.messages.findUnique({ where: { conversation_id_client_message_id: { conversation_id: data.conversation_id, client_message_id: data.client_message_id } } });
                if (existing) {
                    if (existing.sender_id !== actor.userId)
                        throw new ConflictException('Mã tin nhắn đã được sử dụng');
                    return existing;
                }
            }
            const message = await tx.messages.create({ data: {
                    conversation_id: data.conversation_id, sender_id: actor.userId, sender_role: actor.isStaff ? 'STAFF' : 'USER',
                    message_type: type, content: context?.title ?? content, client_message_id: data.client_message_id, ...(context ? { context } : {}),
                } });
            let assignee = current.assigned_staff_id;
            if (!actor.isStaff && assignee) {
                const active = await tx.users.findFirst({ where: { user_id: assignee, is_staff: true, accounts: { status: 1 } }, select: { user_id: true } });
                if (!active)
                    assignee = null;
            }
            await tx.conversations.update({ where: { conversation_id: data.conversation_id }, data: {
                    last_message: type === 'IMAGE' ? '[Hình ảnh]' : message.content.slice(0, 200), last_message_at: message.created_at,
                    status: 'IN_PROGRESS', assigned_staff_id: actor.isStaff ? actor.userId : assignee, resolved_at: null,
                } });
            return message;
        });
    }
    async manage(id: number, actor: ChatActor, action: string, staffId?: number) {
        this.requireStaff(actor);
        await this.authorize(id, actor);
        return this.prisma.$transaction(async (tx) => {
            await tx.$queryRaw `SELECT conversation_id FROM conversations WHERE conversation_id = ${id} FOR UPDATE`;
            const current = await tx.conversations.findUniqueOrThrow({ where: { conversation_id: id } });
            let target = actor.userId;
            if (action === 'transfer') {
                const staff = Number.isSafeInteger(staffId) ? await tx.users.findFirst({ where: { user_id: staffId, is_staff: true, accounts: { status: 1 } } }) : null;
                if (!staff)
                    throw new BadRequestException('Nhân viên nhận không hợp lệ');
                target = staff.user_id;
            }
            else if (!['claim', 'close', 'reopen'].includes(action))
                throw new BadRequestException('Thao tác không hợp lệ');
            return tx.conversations.update({ where: { conversation_id: id }, data: { assigned_staff_id: target, status: action === 'close' ? 'CLOSED' : 'IN_PROGRESS', resolved_at: action === 'close' ? new Date() : null } });
        });
    }
    async read(id: number, actor: ChatActor, through?: number) {
        const conversation = await this.authorize(id, actor);
        if (!Number.isSafeInteger(through) || through! < 1)
            throw new BadRequestException('Mốc đã đọc không hợp lệ');
        return this.prisma.messages.updateMany({ where: { conversation_id: id, message_id: { lte: through }, is_read: false, sender_role: actor.isStaff ? 'USER' : { in: ['ADMIN', 'STAFF'] } }, data: { is_read: true } });
    }
}
