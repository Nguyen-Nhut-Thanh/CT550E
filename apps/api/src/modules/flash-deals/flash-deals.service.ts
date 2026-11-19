import { BadRequestException, Injectable, NotFoundException, } from '@nestjs/common';
import type { FlashDealItem, FlashDealPayload, FlashDealTourRecord } from 'shared';
import { applyDiscount } from 'shared';
import { slugify } from "shared";
import { toNumber } from "../../common/utils/numbers";
import { PrismaService } from '../../infrastructure/database/prisma.service';
@Injectable()
export class FlashDealsService {
    constructor(private readonly prisma: PrismaService) { }
    private roundToThousand(amount: number): number {
        return Math.round(amount / 1000) * 1000;
    }
    private async ensureScheduleExists(scheduleId: number) {
        const schedule = await this.prisma.tour_schedules.findUnique({
            where: { tour_schedule_id: scheduleId },
        });
        if (!schedule) {
            throw new NotFoundException('Không tìm thấy lịch khởi hành');
        }
        return schedule;
    }
    private normalizePayload(data: FlashDealPayload) {
        return {
            tour_schedule_id: data.tour_schedule_id !== undefined
                ? Number(data.tour_schedule_id)
                : undefined,
            discount_type: data.discount_type,
            discount_value: data.discount_value !== undefined
                ? Number(data.discount_value)
                : undefined,
            start_date: data.start_date ? new Date(data.start_date) : undefined,
            end_date: data.end_date ? new Date(data.end_date) : undefined,
            status: data.status !== undefined ? Number(data.status) : undefined,
        };
    }
    private validateFlashDeal(discountType?: string, discountValue?: number, schedulePrice?: number) {
        if (discountType !== undefined && !['percentage', 'fixed_amount', 'fixed'].includes(discountType)) {
            throw new BadRequestException('discount_type không hợp lệ, phải là percentage hoặc fixed_amount/fixed');
        }
        if (discountValue !== undefined && discountValue <= 0) {
            throw new BadRequestException('discount_value phải lớn hơn 0');
        }
        if (discountType === 'percentage' && discountValue !== undefined && discountValue > 100) {
            throw new BadRequestException('Phần trăm giảm không được vượt quá 100%');
        }
        if (discountType !== 'percentage' && discountValue !== undefined && schedulePrice !== undefined && schedulePrice > 0 && discountValue >= schedulePrice) {
            throw new BadRequestException('Giảm giá không được lớn hơn hoặc bằng giá gốc của lịch trình');
        }
    }
    async findAllAdmin() {
        return this.prisma.tour_schedules.findMany({
            include: {
                tours: {
                    select: {
                        name: true,
                        code: true,
                        base_price: true,
                        tour_id: true,
                        status: true,
                        tour_images: { select: { image_url: true }, orderBy: { is_cover: 'desc' }, take: 1 },
                        tour_destinations: { select: { locations: { select: { location_id: true, name: true } } } },
                    },
                },
                flash_deals: true,
                schedule_promotions: true,
                _count: {
                    select: { bookings: true },
                },
            },
            orderBy: { start_date: 'asc' },
        });
    }
    async create(data: FlashDealPayload) {
        const payload = this.normalizePayload(data);
        const existing = await this.prisma.flash_deals.findUnique({
            where: { tour_schedule_id: payload.tour_schedule_id },
        });
        if (existing) {
            throw new BadRequestException('Lịch khởi hành này đã có flash deal rồi');
        }
        const schedule = await this.ensureScheduleExists(payload.tour_schedule_id!);
        this.validateFlashDeal(payload.discount_type, payload.discount_value, Number(schedule.price || 0));
        const startDate = payload.start_date || new Date();
        return this.prisma.flash_deals.create({
            data: {
                tour_schedule_id: payload.tour_schedule_id!,
                discount_type: payload.discount_type!,
                discount_value: payload.discount_value!,
                start_date: startDate,
                end_date: schedule.start_date,
                status: payload.status ?? 1,
            },
        });
    }
    async update(id: number, data: FlashDealPayload) {
        const payload = this.normalizePayload(data);
        const existing = await this.prisma.flash_deals.findUnique({
            where: { deal_id: id },
            include: { tour_schedules: true },
        });
        if (!existing) {
            throw new NotFoundException('Không tìm thấy flash deal');
        }
        const discountType = payload.discount_type ?? existing.discount_type;
        const discountValue = payload.discount_value ?? Number(existing.discount_value);
        const schedulePrice = Number(existing.tour_schedules?.price || 0);
        this.validateFlashDeal(discountType, discountValue, schedulePrice);

        return this.prisma.flash_deals.update({
            where: { deal_id: id },
            data: payload,
        });
    }
    async remove(id: number) {
        return this.prisma.flash_deals.delete({
            where: { deal_id: id },
        });
    }
    async getFlashDeals(limit = 8): Promise<{
        items: FlashDealItem[];
        total: number;
        fetched_at: string;
    }> {
        const now = new Date();
        const deals = await this.prisma.flash_deals.findMany({
            where: {
                status: 1,
                start_date: { lte: now },
                end_date: { gte: now },
                tour_schedules: {
                    status: 1,
                    start_date: { gte: now },
                    tours: { status: 1 },
                },
            },
            include: {
                tour_schedules: {
                    include: {
                        departure_location: true,
                        tour_schedule_amenities: { where: { kind: 'promotion', is_visible: true }, select: { content: true } },
                        tours: {
                            include: {
                                departure_locations: true,
                                transports: true,
                                tour_images: {
                                    where: { is_cover: 1 },
                                    take: 1,
                                },
                            },
                        },
                        tour_schedule_prices: {
                            where: { passenger_type: 'adult' },
                            take: 1,
                        },
                    },
                },
            },
            orderBy: { end_date: 'asc' },
            take: limit,
        });
        const items: FlashDealItem[] = deals.map((deal) => {
            const schedule = deal.tour_schedules;
            const tour = schedule.tours as FlashDealTourRecord;
            const originalPrice = toNumber(schedule.tour_schedule_prices[0]?.price ?? schedule.price);
            const discountValue = toNumber(deal.discount_value);
            const salePrice = this.roundToThousand(applyDiscount(originalPrice, deal.discount_type, discountValue));
            const discountPercent = deal.discount_type === 'percentage'
                ? discountValue
                : (originalPrice > 0 ? Math.round((discountValue / originalPrice) * 100) : 0);
            const seatsLeft = Math.max(toNumber(schedule.quota) - toNumber(schedule.booked_count), 0);
            const slug = slugify(tour.name);
            return {
                deal_id: deal.deal_id,
                schedule_id: schedule.tour_schedule_id,
                tour_id: tour.tour_id,
                code: schedule.code || tour.code,
                name: tour.name,
                slug,
                cover_image_url: schedule.cover_image_url || tour.tour_images[0]?.image_url || null,
                image_url: tour.tour_images[0]?.image_url || null,
                departure_name: schedule.departure_location.name,
                start_date: schedule.start_date.toISOString(),
                end_date: schedule.end_date.toISOString(),
                duration_text: `${tour.duration_days}N${tour.duration_nights}Đ`,
                original_price: originalPrice,
                sale_price: salePrice,
                discount_value: toNumber(deal.discount_value),
                discount_type: deal.discount_type,
                seats_left: seatsLeft,
                discount_percent: discountPercent,
                countdown_to: deal.end_date.toISOString(),
                link: `/tours/${tour.tour_id}`,
                promotion_info: schedule.tour_schedule_amenities[0]?.content || null,
                transport_type: tour.transports?.name || null,
            };
        });
        return {
            items,
            total: items.length,
            fetched_at: new Date().toISOString(),
        };
    }
}
