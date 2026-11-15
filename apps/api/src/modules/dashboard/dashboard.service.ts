import { Injectable } from '@nestjs/common';
import type {
    ComprehensiveAnalytics,
    CustomerVipItem,
    DashboardChartPoint,
    DashboardKpi,
    DashboardReportRow,
    DashboardStats,
    DashboardStatusBreakdown,
    DashboardTimeRange,
    DashboardTopTour,
    ReviewAnalytics,
    StaffPerformanceItem,
    TourTypeStat,
    VoucherAnalytics,
} from 'shared';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { escapeCsv, escapeXml, getSectionTableData } from './dashboard-export.helper';

const VIETNAM_OFFSET_MS = 7 * 60 * 60 * 1000;

function toVietnamDate(d: Date): Date {
    return new Date(d.getTime() + VIETNAM_OFFSET_MS);
}

function startOfVietnamDay(year: number, month: number, date: number): Date {
    return new Date(Date.UTC(year, month, date, 0, 0, 0, 0) - VIETNAM_OFFSET_MS);
}

function getVietnamDateKey(d: Date): string {
    const vn = new Date(d.getTime() + VIETNAM_OFFSET_MS);
    return `${vn.getUTCFullYear()}-${String(vn.getUTCMonth() + 1).padStart(2, '0')}-${String(vn.getUTCDate()).padStart(2, '0')}`;
}

@Injectable()
export class DashboardService {
    constructor(private readonly prisma: PrismaService) { }
    private readonly revenueStatuses = ['completed', 'paid'] as const;
    private calculateTrend(current: number, previous: number): number {
        if (previous === 0)
            return current > 0 ? 100 : 0;
        const trend = ((current - previous) / previous) * 100;
        return parseFloat(trend.toFixed(1));
    }
    private getTimeBounds(range: DashboardTimeRange = 'month') {
        const now = new Date();
        const vn = toVietnamDate(now);
        const vnYear = vn.getUTCFullYear();
        const vnMonth = vn.getUTCMonth();
        const vnDate = vn.getUTCDate();

        let startDate: Date;
        let prevStartDate: Date;
        let prevEndDate: Date;
        switch (range) {
            case '7d': {
                startDate = startOfVietnamDay(vnYear, vnMonth, vnDate - 6);
                prevStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
                prevEndDate = startDate;
                break;
            }
            case '30d': {
                startDate = startOfVietnamDay(vnYear, vnMonth, vnDate - 29);
                prevStartDate = new Date(startDate.getTime() - 30 * 24 * 60 * 60 * 1000);
                prevEndDate = startDate;
                break;
            }
            case 'year': {
                startDate = startOfVietnamDay(vnYear, 0, 1);
                prevStartDate = startOfVietnamDay(vnYear - 1, 0, 1);
                prevEndDate = startDate;
                break;
            }
            case 'month':
            default: {
                startDate = startOfVietnamDay(vnYear, vnMonth, 1);
                prevStartDate = startOfVietnamDay(vnYear, vnMonth - 1, 1);
                prevEndDate = startDate;
                break;
            }
        }
        return { startDate, prevStartDate, prevEndDate, now };
    }
    async getStats(rangeParam?: string): Promise<DashboardStats> {
        const range: DashboardTimeRange = rangeParam === '7d' || rangeParam === '30d' || rangeParam === 'year'
            ? rangeParam
            : 'month';
        const { startDate, prevStartDate, prevEndDate, now } = this.getTimeBounds(range);
        const [currentRevenueAgg, prevRevenueAgg, currentBookingsCount, prevBookingsCount, activeToursCount, totalToursCount, currentUsersCount, prevUsersCount, totalLocationsCount, statusGroups, recentBookingsRaw, allPeriodBookings, topToursRaw,] = await Promise.all([
            // Doanh thu hiện tại
            this.prisma.bookings.aggregate({
                where: {
                    status: { in: [...this.revenueStatuses] },
                    created_at: { gte: startDate },
                },
                _sum: { total_amount: true },
            }),
            // Doanh thu kỳ trước
            this.prisma.bookings.aggregate({
                where: {
                    status: { in: [...this.revenueStatuses] },
                    created_at: { gte: prevStartDate, lt: prevEndDate },
                },
                _sum: { total_amount: true },
            }),
            // Số đơn hiện tại
            this.prisma.bookings.count({ where: { created_at: { gte: startDate } } }),
            // Số đơn kỳ trước
            this.prisma.bookings.count({
                where: { created_at: { gte: prevStartDate, lt: prevEndDate } },
            }),
            // Tour đang hoạt động
            this.prisma.tours.count({ where: { status: 1 } }),
            // Tổng số tour
            this.prisma.tours.count(),
            // Khách hàng mới hiện tại
            this.prisma.users.count({ where: { created_at: { gte: startDate } } }),
            // Khách hàng kỳ trước
            this.prisma.users.count({
                where: { created_at: { gte: prevStartDate, lt: prevEndDate } },
            }),
            // Tổng địa điểm
            this.prisma.locations.count(),
            // Phân bổ trạng thái đơn đặt trong kỳ
            this.prisma.bookings.groupBy({
                by: ['status'],
                where: { created_at: { gte: startDate } },
                _count: { booking_id: true },
            }),
            // Đơn hàng mới nhất (8 đơn)
            this.prisma.bookings.findMany({
                take: 8,
                orderBy: { created_at: 'desc' },
                include: {
                    users: {
                        select: {
                            full_name: true,
                            phone: true,
                            accounts: { select: { email: true } },
                        },
                    },
                    tour_schedules: {
                        include: {
                            tours: {
                                select: {
                                    tour_id: true,
                                    name: true,
                                    code: true,
                                },
                            },
                        },
                    },
                },
            }),
            // Đơn hàng trong kỳ để build biểu đồ timeline
            this.prisma.bookings.findMany({
                where: { created_at: { gte: startDate } },
                select: {
                    created_at: true,
                    total_amount: true,
                    status: true,
                },
                orderBy: { created_at: 'asc' },
            }),
            // Top tour có lượt đặt cao nhất (thống kê tổng hợp tối ưu qua SQL)
            this.prisma.$queryRaw<{ tour_id: number; bookings_count: number; revenue: number }[]>`
                SELECT
                    ts.tour_id,
                    COUNT(b.booking_id)::int AS bookings_count,
                    COALESCE(SUM(CASE WHEN b.status IN ('completed', 'paid') THEN b.total_amount ELSE 0 END), 0)::numeric AS revenue
                FROM bookings b
                JOIN tour_schedules ts ON ts.tour_schedule_id = b.tour_schedule_id
                WHERE b.created_at >= ${startDate} AND b.created_at <= ${now} AND b.status NOT IN ('cancelled', 'canceled')
                GROUP BY ts.tour_id
                ORDER BY bookings_count DESC, revenue DESC
                LIMIT 10
            `,
        ]);
        const totalRevenue = Number(currentRevenueAgg._sum.total_amount || 0);
        const prevRevenue = Number(prevRevenueAgg._sum.total_amount || 0);
        const revenueTrend = this.calculateTrend(totalRevenue, prevRevenue);
        const bookingsTrend = this.calculateTrend(currentBookingsCount, prevBookingsCount);
        const usersTrend = this.calculateTrend(currentUsersCount, prevUsersCount);
        // Tính phân bổ trạng thái
        const statusBreakdown: DashboardStatusBreakdown = {
            pending: 0,
            paid: 0,
            completed: 0,
            cancelled: 0,
        };
        for (const group of statusGroups) {
            const statusKey = group.status.toLowerCase();
            if (statusKey === 'pending')
                statusBreakdown.pending += group._count.booking_id;
            else if (statusKey === 'paid')
                statusBreakdown.paid += group._count.booking_id;
            else if (statusKey === 'completed')
                statusBreakdown.completed += group._count.booking_id;
            else if (statusKey === 'cancelled' || statusKey === 'cancel_requested') {
                statusBreakdown.cancelled += group._count.booking_id;
            }
        }
        const successfulBookings = statusBreakdown.paid + statusBreakdown.completed;
        const conversionRate = currentBookingsCount > 0
            ? parseFloat(((successfulBookings / currentBookingsCount) * 100).toFixed(1))
            : 0;
        const kpis: DashboardKpi = {
            totalRevenue,
            revenueTrend,
            totalBookings: currentBookingsCount,
            bookingsTrend,
            activeTours: activeToursCount,
            totalTours: totalToursCount,
            newUsers: currentUsersCount,
            usersTrend,
            totalLocations: totalLocationsCount,
            paidBookings: statusBreakdown.paid,
            pendingBookings: statusBreakdown.pending,
            cancelledBookings: statusBreakdown.cancelled,
            completedBookings: statusBreakdown.completed,
            conversionRate,
        };
        // Tạo các mốc thời gian cho biểu đồ (Chart points)
        const chart = this.generateChartData(range, startDate, now, allPeriodBookings);
        // Xử lý danh sách đơn hàng gần đây
        const recentBookings = recentBookingsRaw.map((b) => ({
            id: `BK${b.booking_id.toString().padStart(4, '0')}`,
            bookingId: b.booking_id,
            customer: b.users?.full_name || b.contact_name,
            customerEmail: b.contact_email || b.users?.accounts?.email || 'N/A',
            customerPhone: b.contact_phone || b.users?.phone || 'N/A',
            tour: b.tour_schedules?.tours?.name || 'Tour du lịch',
            tourCode: b.tour_schedules?.tours?.code || b.tour_schedules?.code || 'N/A',
            date: b.created_at.toISOString(),
            departureDate: b.tour_schedules?.start_date
                ? b.tour_schedules.start_date.toISOString()
                : null,
            amount: Number(b.total_amount),
            status: b.status,
            paxCount: (b.adult_count || 1) + (b.child_count || 0) + (b.infant_count || 0),
        }));
        // Xử lý top tour (đã tổng hợp từ SQL)
        const topTourIds = topToursRaw.map(s => s.tour_id);
        const topToursDetails = topTourIds.length > 0 ? await this.prisma.tours.findMany({
            where: { tour_id: { in: topTourIds } },
            include: {
                tour_images: {
                    where: { is_cover: 1 },
                    take: 1,
                    select: { image_url: true },
                },
            },
        }) : [];
        const topToursMap = new Map(topToursDetails.map(t => [t.tour_id, t]));
        const topTours: DashboardTopTour[] = topToursRaw
            .map((s): DashboardTopTour | null => {
                const t = topToursMap.get(s.tour_id);
                if (!t) return null;
                return {
                    tourId: t.tour_id,
                    name: t.name,
                    code: t.code,
                    featuredImage: t.tour_images[0]?.image_url || null,
                    bookingsCount: s.bookings_count,
                    revenue: Number(s.revenue || 0),
                    rating: Number(t.rating_avg || 5.0),
                    priceFrom: Number(t.base_price || 0),
                };
            })
            .filter((t): t is DashboardTopTour => t !== null);

        if (topTours.length === 0) {
            const fallbackTours = await this.prisma.tours.findMany({
                where: { status: 1 },
                take: 5,
                include: {
                    tour_images: {
                        where: { is_cover: 1 },
                        take: 1,
                        select: { image_url: true },
                    },
                },
            });
            for (const t of fallbackTours) {
                topTours.push({
                    tourId: t.tour_id,
                    name: t.name,
                    code: t.code,
                    featuredImage: t.tour_images[0]?.image_url || null,
                    bookingsCount: 0,
                    revenue: 0,
                    rating: Number(t.rating_avg || 5.0),
                    priceFrom: Number(t.base_price || 0),
                });
            }
        }
        return {
            timeRange: range,
            kpis,
            chart,
            statusBreakdown,
            recentBookings,
            topTours,
            // Flattened fields for backwards compatibility with old components
            totalRevenue,
            revenueTrend,
            bookingsThisMonth: currentBookingsCount,
            bookingsTrend,
            activeTours: activeToursCount,
            newUsers: currentUsersCount,
            usersTrend,
        };
    }
    private generateChartData(range: DashboardTimeRange, startDate: Date, endDate: Date, bookings: Array<{
        created_at: Date;
        total_amount: unknown;
        status: string;
    }>): DashboardChartPoint[] {
        const points: DashboardChartPoint[] = [];
        const vnDayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

        if (range === '7d' || range === '30d') {
            const dayCount = range === '7d' ? 7 : 30;
            const dateMap = new Map<string, {
                revenue: number;
                bookings: number;
                label: string;
            }>();
            for (let i = 0; i < dayCount; i++) {
                const curVn = new Date(startDate.getTime() + VIETNAM_OFFSET_MS + i * 24 * 60 * 60 * 1000);
                const key = `${curVn.getUTCFullYear()}-${String(curVn.getUTCMonth() + 1).padStart(2, '0')}-${String(curVn.getUTCDate()).padStart(2, '0')}`;
                const label = range === '7d'
                    ? `${vnDayNames[curVn.getUTCDay()]} (${curVn.getUTCDate()}/${curVn.getUTCMonth() + 1})`
                    : `${curVn.getUTCDate()}/${curVn.getUTCMonth() + 1}`;
                dateMap.set(key, { revenue: 0, bookings: 0, label });
            }
            for (const b of bookings) {
                const key = getVietnamDateKey(new Date(b.created_at));
                const entry = dateMap.get(key);
                if (entry) {
                    entry.bookings++;
                    if (this.revenueStatuses.includes(b.status as any)) {
                        entry.revenue += Number(b.total_amount || 0);
                    }
                }
            }
            dateMap.forEach((val, key) => {
                points.push({
                    date: key,
                    label: val.label,
                    revenue: val.revenue,
                    bookings: val.bookings,
                });
            });
        }
        else if (range === 'month') {
            const startVn = toVietnamDate(startDate);
            const endVn = toVietnamDate(endDate);
            const vnYear = startVn.getUTCFullYear();
            const vnMonth = startVn.getUTCMonth();
            const daysInMonth = new Date(Date.UTC(vnYear, vnMonth + 1, 0)).getUTCDate();
            const currentDay = Math.min(endVn.getUTCDate(), daysInMonth);
            const dateMap = new Map<string, {
                revenue: number;
                bookings: number;
                label: string;
            }>();
            for (let day = 1; day <= currentDay; day++) {
                const key = `${vnYear}-${String(vnMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const label = `${day}/${vnMonth + 1}`;
                dateMap.set(key, { revenue: 0, bookings: 0, label });
            }
            for (const b of bookings) {
                const key = getVietnamDateKey(new Date(b.created_at));
                const entry = dateMap.get(key);
                if (entry) {
                    entry.bookings++;
                    if (this.revenueStatuses.includes(b.status as any)) {
                        entry.revenue += Number(b.total_amount || 0);
                    }
                }
            }
            dateMap.forEach((val, key) => {
                points.push({
                    date: key,
                    label: val.label,
                    revenue: val.revenue,
                    bookings: val.bookings,
                });
            });
        }
        else if (range === 'year') {
            const startVn = toVietnamDate(startDate);
            const currentYear = startVn.getUTCFullYear();
            const monthMap = new Map<number, {
                revenue: number;
                bookings: number;
                label: string;
            }>();
            for (let m = 0; m < 12; m++) {
                monthMap.set(m, { revenue: 0, bookings: 0, label: `Thg ${m + 1}` });
            }
            for (const b of bookings) {
                const bVn = toVietnamDate(new Date(b.created_at));
                if (bVn.getUTCFullYear() === currentYear) {
                    const m = bVn.getUTCMonth();
                    const entry = monthMap.get(m);
                    if (entry) {
                        entry.bookings++;
                        if (this.revenueStatuses.includes(b.status as any)) {
                            entry.revenue += Number(b.total_amount || 0);
                        }
                    }
                }
            }
            monthMap.forEach((val, m) => {
                points.push({
                    date: `${currentYear}-${String(m + 1).padStart(2, '0')}`,
                    label: val.label,
                    revenue: val.revenue,
                    bookings: val.bookings,
                });
            });
        }
        return points;
    }
    async getReport(): Promise<DashboardReportRow[]> {
        const bookings = await this.prisma.bookings.findMany({
            orderBy: { created_at: 'desc' },
            take: 200,
            include: {
                users: {
                    select: {
                        full_name: true,
                        phone: true,
                        accounts: {
                            select: { email: true },
                        },
                    },
                },
                tour_schedules: {
                    include: {
                        tours: {
                            select: { name: true, code: true },
                        },
                    },
                },
            },
        });
        return bookings.map((b) => ({
            bookingId: `BK${b.booking_id.toString().padStart(4, '0')}`,
            bookingDate: b.created_at.toISOString().split('T')[0],
            customerName: b.users?.full_name || b.contact_name,
            email: b.contact_email || b.users?.accounts?.email || 'N/A',
            phone: b.contact_phone || b.users?.phone || 'N/A',
            tourName: b.tour_schedules?.tours?.name || 'N/A',
            tourCode: b.tour_schedules?.tours?.code || b.tour_schedules?.code || 'N/A',
            departureDate: b.tour_schedules?.start_date
                ? b.tour_schedules.start_date.toISOString().split('T')[0]
                : 'N/A',
            amount: Number(b.total_amount),
            status: b.status,
            pax: (b.adult_count || 1) + (b.child_count || 0) + (b.infant_count || 0),
        }));
    }
    async getReportCsv(): Promise<string> {
        const rows = await this.getReport();
        const headers = [
            'Mã Đơn',
            'Ngày Đặt',
            'Khách Hàng',
            'Email',
            'Số Điện Thoại',
            'Tên Tour',
            'Mã Tour',
            'Ngày Khởi Hành',
            'Số Khách',
            'Tổng Tiền (VNĐ)',
            'Trạng Thái',
        ];
        const lines = [
            headers.join(','),
            ...rows.map((r) => [
                escapeCsv(r.bookingId),
                escapeCsv(r.bookingDate),
                escapeCsv(r.customerName),
                escapeCsv(r.email),
                escapeCsv(r.phone),
                escapeCsv(r.tourName),
                escapeCsv(r.tourCode),
                escapeCsv(r.departureDate),
                escapeCsv(r.pax),
                escapeCsv(r.amount),
                escapeCsv(r.status),
            ].join(',')),
        ];
        // Thêm BOM để Excel đọc đúng tiếng Việt có dấu
        return `\uFEFF${lines.join('\r\n')}`;
    }

    private resolveDateBounds(rangeParam?: string, fromParam?: string, toParam?: string) {
        const now = new Date();
        let startDate: Date;
        let endDate: Date = now;
        let prevStartDate: Date;
        let prevEndDate: Date;

        if (fromParam && toParam) {
            const [fYear, fMonth, fDate] = fromParam.split('-').map(Number);
            const [tYear, tMonth, tDate] = toParam.split('-').map(Number);
            startDate = startOfVietnamDay(fYear, fMonth - 1, fDate);
            endDate = new Date(Date.UTC(tYear, tMonth - 1, tDate, 23, 59, 59, 999) - VIETNAM_OFFSET_MS);
            const duration = Math.max(1, endDate.getTime() - startDate.getTime());
            prevStartDate = new Date(startDate.getTime() - duration);
            prevEndDate = startDate;
        } else {
            const range: DashboardTimeRange =
                rangeParam === '7d' || rangeParam === '30d' || rangeParam === 'year'
                    ? rangeParam
                    : 'month';
            const bounds = this.getTimeBounds(range);
            startDate = bounds.startDate;
            prevStartDate = bounds.prevStartDate;
            prevEndDate = bounds.prevEndDate;
            endDate = bounds.now;
        }

        return { startDate, endDate, prevStartDate, prevEndDate, now };
    }

    async getComprehensiveAnalytics(
        rangeParam?: string,
        fromParam?: string,
        toParam?: string,
    ): Promise<ComprehensiveAnalytics> {
        const { startDate, endDate, prevStartDate, prevEndDate, now } = this.resolveDateBounds(
            rangeParam,
            fromParam,
            toParam,
        );

        // Batch 1: Tài chính & Đơn hàng
        const [
            currentRevenueAgg,
            prevRevenueAgg,
            currentBookingsCount,
            prevBookingsCount,
            completedBookingsCount,
            cancelledBookingsCount,
            vnpayPaymentsAgg,
            periodBookings,
        ] = await Promise.all([
            // 1. Doanh thu hiện tại
            this.prisma.bookings.aggregate({
                where: {
                    status: { in: [...this.revenueStatuses] },
                    created_at: { gte: startDate, lte: endDate },
                },
                _sum: { total_amount: true },
            }),
            // 2. Doanh thu kỳ trước
            this.prisma.bookings.aggregate({
                where: {
                    status: { in: [...this.revenueStatuses] },
                    created_at: { gte: prevStartDate, lt: prevEndDate },
                },
                _sum: { total_amount: true },
            }),
            // 3. Tổng số đơn hiện tại
            this.prisma.bookings.count({
                where: { created_at: { gte: startDate, lte: endDate } },
            }),
            // 4. Tổng số đơn kỳ trước
            this.prisma.bookings.count({
                where: { created_at: { gte: prevStartDate, lt: prevEndDate } },
            }),
            // 5. Đơn hoàn thành
            this.prisma.bookings.count({
                where: {
                    status: 'completed',
                    created_at: { gte: startDate, lte: endDate },
                },
            }),
            // 6. Đơn đã hủy
            this.prisma.bookings.count({
                where: {
                    status: 'cancelled',
                    created_at: { gte: startDate, lte: endDate },
                },
            }),
            // 7. Giao dịch VNPAY thành công
            this.prisma.payments.aggregate({
                where: {
                    method: 'vnpay',
                    status: 'completed',
                    paid_at: { gte: startDate, lte: endDate },
                },
                _count: true,
                _sum: { amount: true },
            }),
            // 8. Toàn bộ đơn trong kỳ để dựng biểu đồ & phân tích tour
            this.prisma.bookings.findMany({
                where: {
                    created_at: { gte: startDate, lte: endDate },
                },
                select: {
                    booking_id: true,
                    status: true,
                    total_amount: true,
                    created_at: true,
                    tour_schedule_id: true,
                    tour_schedules: {
                        select: {
                            tour_id: true,
                            tours: {
                                select: {
                                    tour_type: true,
                                },
                            },
                        },
                    },
                },
            }),
        ]);

        // Batch 2: Tour & Lịch trình
        const [
            totalToursCount,
            activeToursCount,
            totalSchedulesCount,
            completedSchedulesCount,
            toursByTypeAgg,
            topToursRaw,
        ] = await Promise.all([
            this.prisma.tours.count(),
            this.prisma.tours.count({ where: { status: 1 } }),
            this.prisma.tour_schedules.count({
                where: { start_date: { gte: startDate, lte: endDate } },
            }),
            this.prisma.tour_schedules.count({
                where: { end_date: { lte: now, gte: startDate } },
            }),
            this.prisma.tours.groupBy({
                by: ['tour_type'],
                where: { status: 1 },
                _count: { tour_id: true },
            }),
            this.prisma.$queryRaw<
                Array<{
                    tour_id: number;
                    name: string;
                    code: string;
                    featured_image: string | null;
                    bookings_count: number;
                    revenue: number;
                    base_price: number;
                }>
            >`
                SELECT
                    t.tour_id,
                    t.name,
                    t.code,
                    (SELECT image_url FROM tour_images WHERE tour_id = t.tour_id AND is_cover = 1 LIMIT 1) AS featured_image,
                    COUNT(b.booking_id)::int AS bookings_count,
                    COALESCE(SUM(CASE WHEN b.status IN ('completed', 'paid') THEN b.total_amount ELSE 0 END), 0)::float8 AS revenue,
                    COALESCE(t.base_price, 0)::float8 AS base_price
                FROM tours t
                INNER JOIN tour_schedules ts ON ts.tour_id = t.tour_id
                INNER JOIN bookings b ON b.tour_schedule_id = ts.tour_schedule_id AND b.created_at >= ${startDate} AND b.created_at <= ${endDate}
                WHERE t.status = 1
                GROUP BY t.tour_id, t.name, t.code, t.base_price
                ORDER BY revenue DESC, bookings_count DESC
                LIMIT 10;
            `,
        ]);

        // Batch 3: Nhân sự & Điều hành
        const [
            totalStaffCount,
            activeStaffCount,
            staffProfiles,
            topStaffRaw,
        ] = await Promise.all([
            this.prisma.employee_profiles.count(),
            this.prisma.employee_profiles.count({ where: { status: 'active' } }),
            this.prisma.employee_profiles.findMany({
                select: { position: true, status: true },
            }),
            this.prisma.$queryRaw<
                Array<{
                    userId: number;
                    fullName: string | null;
                    phone: string | null;
                    email: string | null;
                    roles: string[];
                    status: string;
                    assignedCount: number;
                    completedCount: number;
                }>
            >`
                SELECT
                    u.user_id AS "userId",
                    COALESCE(u.full_name, 'Chưa đặt tên') AS "fullName",
                    u.phone,
                    a.email,
                    COALESCE(sc.roles, ARRAY[]::varchar[]) AS "roles",
                    sc.status,
                    COUNT(sc.assignment_id)::int AS "assignedCount",
                    COUNT(CASE WHEN sc.status = 'confirmed' OR (ts.end_date IS NOT NULL AND ts.end_date <= ${now}) THEN 1 END)::int AS "completedCount"
                FROM schedule_crew sc
                INNER JOIN users u ON u.user_id = sc.user_id
                LEFT JOIN accounts a ON a.account_id = u.account_id
                LEFT JOIN tour_schedules ts ON ts.tour_schedule_id = sc.tour_schedule_id
                GROUP BY u.user_id, u.full_name, u.phone, a.email, sc.roles, sc.status
                ORDER BY "completedCount" DESC, "assignedCount" DESC
                LIMIT 15;
            `,
        ]);

        // Batch 4: Khách hàng & Hội viên
        const [
            totalUsersCount,
            newUsersCount,
            usersByTier,
            topVipAgg,
        ] = await Promise.all([
            this.prisma.users.count(),
            this.prisma.users.count({
                where: { created_at: { gte: startDate, lte: endDate } },
            }),
            this.prisma.memberships.groupBy({
                by: ['tier'],
                _count: { user_id: true },
            }),
            this.prisma.bookings.groupBy({
                by: ['user_id'],
                where: {
                    status: { in: [...this.revenueStatuses] },
                },
                _sum: { total_amount: true },
                _count: { booking_id: true },
                _max: { created_at: true },
                orderBy: {
                    _sum: { total_amount: 'desc' },
                },
                take: 10,
            }),
        ]);

        // Batch 5: Marketing & Đánh giá
        const [
            voucherAgg,
            vouchersActive,
            voucherDiscountAgg,
            reviewsCount,
            reviewsRatingAgg,
            reviewsGrouped,
        ] = await Promise.all([
            this.prisma.vouchers.aggregate({
                _count: true,
                _sum: { used_count: true },
            }),
            this.prisma.vouchers.count({ where: { status: 1 } }),
            this.prisma.bookings.aggregate({
                where: {
                    voucher_id: { not: null },
                    status: { in: [...this.revenueStatuses] },
                },
                _sum: { discount_amount: true },
            }),
            this.prisma.reviews.count(),
            this.prisma.reviews.aggregate({
                _avg: { rating: true },
            }),
            this.prisma.reviews.groupBy({
                by: ['rating'],
                _count: { review_id: true },
            }),
        ]);

        const currentRevenue = Number(currentRevenueAgg._sum.total_amount || 0);
        const prevRevenue = Number(prevRevenueAgg._sum.total_amount || 0);
        const revenueTrend = this.calculateTrend(currentRevenue, prevRevenue);
        const bookingsTrend = this.calculateTrend(currentBookingsCount, prevBookingsCount);
        const averageOrderValue = currentBookingsCount > 0 ? Math.round(currentRevenue / currentBookingsCount) : 0;

        // Xây dựng biểu đồ chuỗi thời gian (múi giờ Việt Nam UTC+7)
        const dateMap = new Map<string, { revenue: number; bookings: number }>();
        const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const isLongRange = daysDiff > 60;

        for (const b of periodBookings) {
            const vnKey = getVietnamDateKey(new Date(b.created_at));
            const key = isLongRange ? vnKey.slice(0, 7) : vnKey;

            const entry = dateMap.get(key) || { revenue: 0, bookings: 0 };
            entry.bookings += 1;
            if (this.revenueStatuses.includes(b.status as any)) {
                entry.revenue += Number(b.total_amount || 0);
            }
            dateMap.set(key, entry);
        }

        const chart: DashboardChartPoint[] = Array.from(dateMap.entries())
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([dateKey, val]) => ({
                date: dateKey,
                label: isLongRange ? `T${dateKey.split('-')[1]}/${dateKey.split('-')[0]}` : `${dateKey.split('-')[2]}/${dateKey.split('-')[1]}`,
                revenue: val.revenue,
                bookings: val.bookings,
            }));

        // Thống kê theo loại tour (Trong nước, Ngoài nước, Quốc tế)
        const typeMap: Record<string, { label: string; count: number; revenue: number; bookings: number }> = {
            domestic: { label: 'Trong nước', count: 0, revenue: 0, bookings: 0 },
            outbound: { label: 'Ngoài nước', count: 0, revenue: 0, bookings: 0 },
            international: { label: 'Quốc tế', count: 0, revenue: 0, bookings: 0 },
        };

        for (const agg of toursByTypeAgg) {
            const key = (agg.tour_type || 'domestic').toLowerCase();
            const target = typeMap[key] || typeMap.domestic;
            target.count += agg._count.tour_id;
        }

        for (const b of periodBookings) {
            const tType = ((b.tour_schedules?.tours as any)?.tour_type || 'domestic').toLowerCase();
            const target = typeMap[tType] || typeMap.domestic;
            target.bookings += 1;
            if (this.revenueStatuses.includes(b.status as any)) {
                target.revenue += Number(b.total_amount || 0);
            }
        }

        const byType: TourTypeStat[] = Object.entries(typeMap).map(([type, val]) => ({
            type,
            label: val.label,
            count: val.count,
            revenue: val.revenue,
            bookingsCount: val.bookings,
        }));

        // Top 10 tour bán chạy (từ SQL aggregation)
        const topTours: DashboardTopTour[] = topToursRaw.map((t) => ({
            tourId: t.tour_id,
            name: t.name,
            code: t.code,
            featuredImage: t.featured_image,
            bookingsCount: Number(t.bookings_count || 0),
            revenue: Number(t.revenue || 0),
            priceFrom: Number(t.base_price || 0),
        }));

        // Thống kê nhân sự theo vai trò
        const roleCounts: Record<string, number> = {};
        for (const p of staffProfiles) {
            const pos = p.position || 'Nhân viên';
            roleCounts[pos] = (roleCounts[pos] || 0) + 1;
        }

        const byRole = Object.entries(roleCounts).map(([role, count]) => ({
            role,
            label: role,
            count,
        }));

        // Hiệu suất nhân sự (Top Staff từ SQL aggregation)
        const topStaff: StaffPerformanceItem[] = topStaffRaw.map((s) => ({
            userId: s.userId,
            fullName: s.fullName || 'Chưa đặt tên',
            phone: s.phone,
            email: s.email,
            roles: s.roles || [],
            assignedCount: Number(s.assignedCount || 0),
            completedCount: Number(s.completedCount || 0),
            status: s.status,
        }));

        // Khách hàng theo hạng
        const tierLabels: Record<string, string> = {
            bronze: 'Đồng',
            silver: 'Bạc',
            gold: 'Vàng',
            platinum: 'Bạch Kim',
            diamond: 'Kim Cương',
        };
        const byTier = usersByTier.map((t) => ({
            tier: t.tier || 'bronze',
            label: tierLabels[t.tier] || t.tier || 'Đồng',
            count: t._count.user_id,
        }));

        // Top 10 khách hàng VIP (Query tổng hợp trực tiếp từ DB)
        const vipUserIds = topVipAgg.map((v) => v.user_id);
        const vipUsers = vipUserIds.length
            ? await this.prisma.users.findMany({
                where: { user_id: { in: vipUserIds } },
                select: {
                    user_id: true,
                    full_name: true,
                    phone: true,
                    membership: { select: { tier: true } },
                    accounts: { select: { email: true } },
                },
            })
            : [];
        const vipUserMap = new Map(vipUsers.map((u) => [u.user_id, u]));

        const topVip: CustomerVipItem[] = topVipAgg.map((v) => {
            const u = vipUserMap.get(v.user_id);
            const tierKey = u?.membership?.tier || 'bronze';
            return {
                userId: v.user_id,
                fullName: u?.full_name || 'Khách hàng',
                email: u?.accounts?.email || 'N/A',
                phone: u?.phone || 'N/A',
                membershipTier: tierLabels[tierKey] || tierKey || 'Đồng',
                totalBookings: v._count.booking_id,
                totalSpent: Number(v._sum.total_amount || 0),
                lastBookingDate: v._max.created_at ? v._max.created_at.toISOString().split('T')[0] : null,
            };
        });

        // Đánh giá & Review Analytics
        const starsCount = { star1: 0, star2: 0, star3: 0, star4: 0, star5: 0 };
        let satisfiedCount = 0;
        for (const rg of reviewsGrouped) {
            const r = rg.rating;
            const c = rg._count.review_id;
            if (r === 1) starsCount.star1 = c;
            if (r === 2) starsCount.star2 = c;
            if (r === 3) starsCount.star3 = c;
            if (r === 4) { starsCount.star4 = c; satisfiedCount += c; }
            if (r === 5) { starsCount.star5 = c; satisfiedCount += c; }
        }

        const satisfactionRate = reviewsCount > 0 ? Math.round((satisfiedCount / reviewsCount) * 100) : 100;

        return {
            timeRange: rangeParam || 'month',
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            financials: {
                totalRevenue: currentRevenue,
                revenueTrend,
                totalBookings: currentBookingsCount,
                bookingsTrend,
                completedBookings: completedBookingsCount,
                cancelledBookings: cancelledBookingsCount,
                averageOrderValue,
                vnpayTransactions: vnpayPaymentsAgg._count || 0,
                vnpayVolume: Number(vnpayPaymentsAgg._sum.amount || 0),
            },
            chart,
            tours: {
                totalTours: totalToursCount,
                activeTours: activeToursCount,
                totalSchedules: totalSchedulesCount,
                completedSchedules: completedSchedulesCount,
                byType,
                topTours,
            },
            workforce: {
                totalStaff: totalStaffCount,
                activeStaff: activeStaffCount,
                byRole,
                topStaff,
            },
            customers: {
                totalUsers: totalUsersCount,
                newUsers: newUsersCount,
                byTier,
                topVip,
            },
            marketing: {
                vouchers: {
                    totalIssued: voucherAgg._count || 0,
                    totalUsed: Number(voucherAgg._sum.used_count || 0),
                    totalDiscountAmount: Number(voucherDiscountAgg._sum.discount_amount || 0),
                    activeCount: vouchersActive,
                },
                reviews: {
                    totalReviews: reviewsCount,
                    averageRating: reviewsRatingAgg._avg.rating ? parseFloat(reviewsRatingAgg._avg.rating.toFixed(1)) : 5.0,
                    satisfactionRate,
                    starsCount,
                },
            },
        };
    }

    async getComprehensiveExcel(rangeParam?: string, fromParam?: string, toParam?: string): Promise<string> {
        const data = await this.getComprehensiveAnalytics(rangeParam, fromParam, toParam);

        const buildWorksheet = (sheetName: string, headers: string[], rows: (string | number)[][]): string => {
            const headerCells = headers
                .map((h) => `<Cell ss:StyleID="Header"><Data ss:Type="String">${escapeXml(h)}</Data></Cell>`)
                .join('');
            const bodyRows = rows
                .map((row) => {
                    const cells = row
                        .map((cell) => {
                            const isNum = typeof cell === 'number';
                            const type = isNum ? 'Number' : 'String';
                            const style = isNum ? ' ss:StyleID="Number"' : '';
                            return `<Cell${style}><Data ss:Type="${type}">${escapeXml(cell)}</Data></Cell>`;
                        })
                        .join('');
                    return `<Row>${cells}</Row>`;
                })
                .join('');

            return `
            <Worksheet ss:Name="${escapeXml(sheetName)}">
                <Table>
                    <Row ss:Height="24">${headerCells}</Row>
                    ${bodyRows}
                </Table>
            </Worksheet>`;
        };

        const sections: Array<'kpi' | 'revenue' | 'tours' | 'workforce' | 'customers' | 'marketing'> = [
            'kpi',
            'revenue',
            'tours',
            'workforce',
            'customers',
            'marketing',
        ];
        const sheetsXml = sections
            .map((sec) => {
                const { title, headers, rows } = getSectionTableData(sec, data);
                return buildWorksheet(title, headers, rows);
            })
            .join('\n');

        return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#1E293B"/>
  </Style>
  <Style ss:ID="Header">
   <Alignment ss:Vertical="Center" ss:Horizontal="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#004C99"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#005BFF" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="Number">
   <Alignment ss:Horizontal="Right"/>
   <NumberFormat ss:Format="#,##0"/>
  </Style>
 </Styles>
 ${sheetsXml}
</Workbook>`;
    }

    async getSectionCsv(
        section: string,
        rangeParam?: string,
        fromParam?: string,
        toParam?: string,
    ): Promise<string> {
        const data = await this.getComprehensiveAnalytics(rangeParam, fromParam, toParam);
        const { headers, rows } = getSectionTableData(section, data);
        const lines = [headers.join(','), ...rows.map((r) => r.map(escapeCsv).join(','))];
        return `\uFEFF${lines.join('\r\n')}`;
    }
}
