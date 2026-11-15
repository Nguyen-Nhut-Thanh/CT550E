import type { BestSellerStat } from 'shared';
import type { PrismaService } from '../../infrastructure/database/prisma.service';

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
