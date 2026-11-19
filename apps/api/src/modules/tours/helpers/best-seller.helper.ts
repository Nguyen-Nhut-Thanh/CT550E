import type { BestSellerStat } from 'shared';
import type { PrismaService } from '../../../infrastructure/database/prisma.service';

/**
 * Lấy danh sách thống kê lượt đặt và hành khách cho từng tour để xếp hạng Best Seller
 */
export async function queryBestSellerStats(prisma: PrismaService): Promise<BestSellerStat[]> {
    return prisma.$queryRaw<BestSellerStat[]>`
        SELECT
            ts.tour_id,
            COUNT(b.booking_id)::int AS booking_count,
            COALESCE(SUM(b.adult_count + b.child_count + b.infant_count), 0)::int AS passenger_count
        FROM bookings b
        INNER JOIN tour_schedules ts
            ON ts.tour_schedule_id = b.tour_schedule_id
        WHERE b.status <> 'cancelled'
        GROUP BY ts.tour_id
        ORDER BY passenger_count DESC, booking_count DESC, ts.tour_id DESC
    `;
}

/**
 * Lấy danh sách ID các tour đang có lịch còn chỗ được sắp xếp theo thứ hạng Best Seller
 */
export async function getBestSellerTourIds(
    prisma: PrismaService,
    today: Date = new Date(),
): Promise<number[]> {
    const activeSchedules = await prisma.tour_schedules.findMany({
        where: {
            status: 1,
            start_date: {
                gte: today,
            },
            tours: {
                status: 1,
            },
        },
        select: {
            tour_schedule_id: true,
            tour_id: true,
            quota: true,
            booked_count: true,
        },
    });
    const availableSchedules = activeSchedules.filter(
        (schedule) => (schedule.quota || 0) > (schedule.booked_count || 0),
    );
    if (availableSchedules.length === 0) {
        return [];
    }
    const availableTourIds = new Set(availableSchedules.map((s) => s.tour_id));
    const bestSellerStats = await queryBestSellerStats(prisma);
    const rankedTourIds = bestSellerStats
        .filter((stat) => availableTourIds.has(stat.tour_id))
        .map((stat) => stat.tour_id);
    const missingAvailableTourIds = Array.from(availableTourIds).filter(
        (tourId) => !rankedTourIds.includes(tourId),
    );
    return [...rankedTourIds, ...missingAvailableTourIds];
}
