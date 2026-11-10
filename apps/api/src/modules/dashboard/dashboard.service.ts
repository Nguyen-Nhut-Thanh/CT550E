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
@Injectable()
export class DashboardService {
    constructor(private readonly prisma: PrismaService) { }
    private readonly revenueStatuses = ['confirmed', 'completed', 'paid'] as const;
    private calculateTrend(current: number, previous: number): number {
        if (previous === 0)
            return current > 0 ? 100 : 0;
        const trend = ((current - previous) / previous) * 100;
        return parseFloat(trend.toFixed(1));
    }
    private getTimeBounds(range: DashboardTimeRange = 'month') {
        const now = new Date();
        let startDate: Date;
        let prevStartDate: Date;
        let prevEndDate: Date;
        switch (range) {
            case '7d': {
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0, 0);
                prevStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
                prevEndDate = startDate;
                break;
            }
            case '30d': {
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29, 0, 0, 0, 0);
                prevStartDate = new Date(startDate.getTime() - 30 * 24 * 60 * 60 * 1000);
                prevEndDate = startDate;
                break;
            }
            case 'year': {
                startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
                prevStartDate = new Date(now.getFullYear() - 1, 0, 1, 0, 0, 0, 0);
                prevEndDate = startDate;
                break;
            }
            case 'month':
            default: {
                startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
                prevStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
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
            // Top tour có lượt đặt cao nhất
            this.prisma.tours.findMany({

                include: {
                    tour_images: {
                        where: { is_cover: 1 },
                        take: 1,
                        select: { image_url: true },
                    },
                    tour_schedules: {
                        include: {
                            bookings: {
                                where: { created_at: { gte: startDate, lte: now }, status: { not: 'cancelled' } },
                                select: {
                                    total_amount: true,
                                    status: true,
                                },
                            },
                        },
                    },
                },
            }),
        ]);
        const totalRevenue = Number(currentRevenueAgg._sum.total_amount || 0);
        const prevRevenue = Number(prevRevenueAgg._sum.total_amount || 0);
        const revenueTrend = this.calculateTrend(totalRevenue, prevRevenue);
        const bookingsTrend = this.calculateTrend(currentBookingsCount, prevBookingsCount);
        const usersTrend = this.calculateTrend(currentUsersCount, prevUsersCount);
        // Tính phân bổ trạng thái
        const statusBreakdown: DashboardStatusBreakdown = {
            confirmed: 0,
            pending: 0,
            paid: 0,
            completed: 0,
            cancelled: 0,
        };
        for (const group of statusGroups) {
            const statusKey = group.status.toLowerCase();
            if (statusKey === 'confirmed')
                statusBreakdown.confirmed += group._count.booking_id;
            else if (statusKey === 'pending')
                statusBreakdown.pending += group._count.booking_id;
            else if (statusKey === 'paid')
                statusBreakdown.paid += group._count.booking_id;
            else if (statusKey === 'completed')
                statusBreakdown.completed += group._count.booking_id;
            else if (statusKey === 'cancelled' || statusKey === 'cancel_requested') {
                statusBreakdown.cancelled += group._count.booking_id;
            }
        }
        const successfulBookings = statusBreakdown.confirmed + statusBreakdown.paid + statusBreakdown.completed;
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
            confirmedBookings: statusBreakdown.confirmed,
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
        // Xử lý top tour
        const topTours: DashboardTopTour[] = topToursRaw
            .map((t) => {
            let tourBookingsCount = 0;
            let tourRevenue = 0;
            for (const schedule of t.tour_schedules) {
                for (const booking of schedule.bookings) {
                    tourBookingsCount++;
                    if (this.revenueStatuses.includes(booking.status as any)) {
                        tourRevenue += Number(booking.total_amount || 0);
                    }
                }
            }
            return {
                tourId: t.tour_id,
                name: t.name,
                code: t.code,
                featuredImage: t.tour_images[0]?.image_url || null,
                bookingsCount: tourBookingsCount,
                revenue: tourRevenue,
                rating: Number(t.rating_avg || 5.0),
                priceFrom: Number(t.base_price || 0),
            };
        })
            .sort((a, b) => b.bookingsCount - a.bookingsCount || b.revenue - a.revenue || a.tourId - b.tourId);
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
        if (range === '7d' || range === '30d') {
            const dayCount = range === '7d' ? 7 : 30;
            const dateMap = new Map<string, {
                revenue: number;
                bookings: number;
                label: string;
            }>();
            for (let i = 0; i < dayCount; i++) {
                const d = new Date(startDate);
                d.setDate(d.getDate() + i);
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                const label = range === '7d'
                    ? `${['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d.getDay()]} (${d.getDate()}/${d.getMonth() + 1})`
                    : `${d.getDate()}/${d.getMonth() + 1}`;
                dateMap.set(key, { revenue: 0, bookings: 0, label });
            }
            for (const b of bookings) {
                const d = new Date(b.created_at);
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
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
            // Nhóm theo các ngày trong tháng hiện tại
            const daysInMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();
            const currentDay = Math.min(endDate.getDate(), daysInMonth);
            const dateMap = new Map<string, {
                revenue: number;
                bookings: number;
                label: string;
            }>();
            for (let day = 1; day <= currentDay; day++) {
                const key = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const label = `${day}/${startDate.getMonth() + 1}`;
                dateMap.set(key, { revenue: 0, bookings: 0, label });
            }
            for (const b of bookings) {
                const d = new Date(b.created_at);
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
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
            // 12 tháng
            const currentYear = startDate.getFullYear();
            const monthMap = new Map<number, {
                revenue: number;
                bookings: number;
                label: string;
            }>();
            for (let m = 0; m < 12; m++) {
                monthMap.set(m, { revenue: 0, bookings: 0, label: `Thg ${m + 1}` });
            }
            for (const b of bookings) {
                const d = new Date(b.created_at);
                if (d.getFullYear() === currentYear) {
                    const m = d.getMonth();
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
        const escapeCsv = (val: string | number) => {
            const str = String(val ?? '');
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };
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
            startDate = new Date(`${fromParam}T00:00:00`);
            endDate = new Date(`${toParam}T23:59:59.999`);
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
                    status: 'success',
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
            toursWithBookings,
        ] = await Promise.all([
            this.prisma.tours.count(),
            this.prisma.tours.count({ where: { status: 1 } }),
            this.prisma.tour_schedules.count({
                where: { start_date: { gte: startDate, lte: endDate } },
            }),
            this.prisma.tour_schedules.count({
                where: { end_date: { lte: now, gte: startDate } },
            }),
            this.prisma.tours.findMany({
                select: {
                    tour_id: true,
                    name: true,
                    code: true,
                    tour_type: true,
                    base_price: true,
                    tour_images: {
                        where: { is_cover: 1 },
                        take: 1,
                        select: { image_url: true },
                    },
                },
            }),
        ]);

        // Batch 3: Nhân sự & Điều hành
        const [
            totalStaffCount,
            activeStaffCount,
            staffProfiles,
            crewAssignments,
        ] = await Promise.all([
            this.prisma.staff_profiles.count(),
            this.prisma.staff_profiles.count({ where: { status: 1 } }),
            this.prisma.staff_profiles.findMany({
                select: { position: true, status: true },
            }),
            this.prisma.schedule_crew.findMany({
                include: {
                    user: {
                        select: {
                            user_id: true,
                            full_name: true,
                            phone: true,
                            accounts: { select: { email: true } },
                        },
                    },
                    schedule: {
                        select: {
                            start_date: true,
                            end_date: true,
                        },
                    },
                },
            }),
        ]);

        // Batch 4: Khách hàng & Hội viên
        const [
            totalUsersCount,
            newUsersCount,
            usersByTier,
            vipBookings,
        ] = await Promise.all([
            this.prisma.users.count(),
            this.prisma.users.count({
                where: { created_at: { gte: startDate, lte: endDate } },
            }),
            this.prisma.memberships.groupBy({
                by: ['tier'],
                _count: { user_id: true },
            }),
            this.prisma.bookings.findMany({
                where: {
                    status: { in: [...this.revenueStatuses] },
                },
                select: {
                    user_id: true,
                    total_amount: true,
                    created_at: true,
                    users: {
                        select: {
                            user_id: true,
                            full_name: true,
                            phone: true,
                            membership: { select: { tier: true } },
                            accounts: { select: { email: true } },
                        },
                    },
                },
            }),
        ]);

        // Batch 5: Marketing & Đánh giá
        const [
            voucherAgg,
            vouchersActive,
            reviewsCount,
            reviewsRatingAgg,
            reviewsGrouped,
        ] = await Promise.all([
            this.prisma.vouchers.aggregate({
                _count: true,
                _sum: { used_count: true },
            }),
            this.prisma.vouchers.count({ where: { status: 1 } }),
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

        // Xây dựng biểu đồ chuỗi thời gian
        const dateMap = new Map<string, { revenue: number; bookings: number }>();
        const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const isLongRange = daysDiff > 60;

        for (const b of periodBookings) {
            const date = new Date(b.created_at);
            const key = isLongRange
                ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
                : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

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
        const tourRevenueMap = new Map<number, { revenue: number; bookings: number }>();
        for (const b of periodBookings) {
            const tid = b.tour_schedules?.tour_id;
            if (!tid) continue;
            const current = tourRevenueMap.get(tid) || { revenue: 0, bookings: 0 };
            current.bookings += 1;
            if (this.revenueStatuses.includes(b.status as any)) {
                current.revenue += Number(b.total_amount || 0);
            }
            tourRevenueMap.set(tid, current);
        }

        const typeMap: Record<string, { label: string; count: number; revenue: number; bookings: number }> = {
            domestic: { label: 'Trong nước', count: 0, revenue: 0, bookings: 0 },
            outbound: { label: 'Ngoài nước', count: 0, revenue: 0, bookings: 0 },
            international: { label: 'Quốc tế', count: 0, revenue: 0, bookings: 0 },
        };

        for (const t of toursWithBookings) {
            const typeKey = (t.tour_type || 'domestic').toLowerCase();
            const target = typeMap[typeKey] || typeMap['domestic'];
            target.count += 1;
            const stats = tourRevenueMap.get(t.tour_id);
            if (stats) {
                target.revenue += stats.revenue;
                target.bookings += stats.bookings;
            }
        }

        const byType: TourTypeStat[] = Object.entries(typeMap).map(([type, val]) => ({
            type,
            label: val.label,
            count: val.count,
            revenue: val.revenue,
            bookingsCount: val.bookings,
        }));

        // Top 10 tour bán chạy
        const topTours: DashboardTopTour[] = toursWithBookings
            .map((t) => {
                const stats = tourRevenueMap.get(t.tour_id) || { revenue: 0, bookings: 0 };
                return {
                    tourId: t.tour_id,
                    name: t.name,
                    code: t.code,
                    featuredImage: t.tour_images?.[0]?.image_url || null,
                    bookingsCount: stats.bookings,
                    revenue: stats.revenue,
                    priceFrom: Number(t.base_price || 0),
                };
            })
            .filter((t) => t.bookingsCount > 0 || t.revenue > 0)
            .sort((a, b) => b.revenue - a.revenue || b.bookingsCount - a.bookingsCount)
            .slice(0, 10);

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

        // Hiệu suất nhân sự (Top Staff)
        const staffMap = new Map<number, StaffPerformanceItem>();
        for (const c of crewAssignments) {
            if (!c.user) continue;
            const uid = c.user.user_id;
            const item = staffMap.get(uid) || {
                userId: uid,
                fullName: c.user.full_name || 'Chưa đặt tên',
                phone: c.user.phone,
                email: c.user.accounts?.email,
                roles: c.roles || [],
                assignedCount: 0,
                completedCount: 0,
                status: c.status,
            };
            item.assignedCount += 1;
            if (c.status === 'confirmed' || (c.schedule?.end_date && new Date(c.schedule.end_date) <= now)) {
                item.completedCount += 1;
            }
            staffMap.set(uid, item);
        }

        const topStaff = Array.from(staffMap.values())
            .sort((a, b) => b.completedCount - a.completedCount || b.assignedCount - a.assignedCount)
            .slice(0, 15);

        // Khách hàng theo hạng
        const tierLabels: Record<string, string> = {
            bronze: 'Đồng',
            silver: 'Bạc',
            gold: 'Vàng',
            diamond: 'Kim Cương',
        };
        const byTier = usersByTier.map((t) => ({
            tier: t.tier || 'bronze',
            label: tierLabels[t.tier] || t.tier || 'Đồng',
            count: t._count.user_id,
        }));

        // Top 10 khách hàng VIP
        const customerMap = new Map<number, CustomerVipItem>();
        for (const b of vipBookings) {
            if (!b.users) continue;
            const uid = b.users.user_id;
            const tierKey = b.users.membership?.tier || 'bronze';
            const item = customerMap.get(uid) || {
                userId: uid,
                fullName: b.users.full_name || 'Khách hàng',
                email: b.users.accounts?.email || 'N/A',
                phone: b.users.phone || 'N/A',
                membershipTier: tierLabels[tierKey] || tierKey || 'Đồng',
                totalBookings: 0,
                totalSpent: 0,
                lastBookingDate: null,
            };
            item.totalBookings += 1;
            item.totalSpent += Number(b.total_amount || 0);
            const bDate = b.created_at.toISOString().split('T')[0];
            if (!item.lastBookingDate || bDate > item.lastBookingDate) {
                item.lastBookingDate = bDate;
            }
            customerMap.set(uid, item);
        }

        const topVip = Array.from(customerMap.values())
            .sort((a, b) => b.totalSpent - a.totalSpent)
            .slice(0, 10);

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
                    totalDiscountAmount: 0,
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

        const escapeXml = (val: unknown): string => {
            if (val === null || val === undefined) return '';
            return String(val)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&apos;');
        };

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

        // 1. Sheet Tổng quan KPI
        const sheet1 = buildWorksheet(
            'Tong_Quan_KPI',
            ['Chỉ số thống kê', 'Giá trị', 'Đơn vị / Tăng trưởng', 'Ghi chú'],
            [
                ['Thời gian báo cáo', `${data.startDate} đến ${data.endDate}`, 'Khoảng thời gian', 'Bộ lọc dữ liệu'],
                ['Tổng doanh thu', data.financials.totalRevenue, 'VNĐ', `Tăng trưởng ${data.financials.revenueTrend}% so với kỳ trước`],
                ['Tổng số đơn đặt tour', data.financials.totalBookings, 'Đơn', `Tăng trưởng ${data.financials.bookingsTrend}% so với kỳ trước`],
                ['Số đơn hoàn thành', data.financials.completedBookings, 'Đơn', 'Đã kết thúc hành trình'],
                ['Số đơn đã hủy', data.financials.cancelledBookings, 'Đơn', 'Đã hủy đơn'],
                ['Giá trị đơn trung bình (AOV)', data.financials.averageOrderValue, 'VNĐ', 'Doanh thu / số đơn'],
                ['Giao dịch VNPAY thành công', data.financials.vnpayTransactions, 'Giao dịch', 'Thanh toán trực tuyến'],
                ['Tổng tiền qua VNPAY', data.financials.vnpayVolume, 'VNĐ', 'Cổng thanh toán điện tử'],
                ['Tổng số tour du lịch', data.tours.totalTours, 'Tour', `Đang mở bán: ${data.tours.activeTours}`],
                ['Tổng chuyến khởi hành', data.tours.totalSchedules, 'Chuyến', `Đã hoàn thành: ${data.tours.completedSchedules}`],
                ['Tổng nhân sự vận hành', data.workforce.totalStaff, 'Nhân viên', `Đang làm việc: ${data.workforce.activeStaff}`],
                ['Tổng số khách hàng', data.customers.totalUsers, 'Người dùng', `Khách mới trong kỳ: ${data.customers.newUsers}`],
                ['Điểm đánh giá sàn', data.marketing.reviews.averageRating, 'sao / 5.0', `Tỷ lệ hài lòng: ${data.marketing.reviews.satisfactionRate}%`],
            ],
        );

        // 2. Sheet Doanh thu theo ngày
        const sheet2 = buildWorksheet(
            'Doanh_Thu_Chi_Tiet',
            ['Ngày / Tháng', 'Nhãn', 'Số đơn đặt', 'Doanh thu (VNĐ)'],
            data.chart.map((c) => [c.date, c.label, c.bookings, c.revenue]),
        );

        // 3. Sheet Top Tour
        const sheet3 = buildWorksheet(
            'Top_Tour_Ban_Chay',
            ['Mã Tour', 'Tên Tour Du Lịch', 'Số lượt đặt', 'Doanh thu (VNĐ)', 'Giá từ (VNĐ)'],
            data.tours.topTours.map((t) => [t.code, t.name, t.bookingsCount, t.revenue, t.priceFrom || 0]),
        );

        // 4. Sheet Nhân sự điều hành
        const sheet4 = buildWorksheet(
            'Nhan_Su_Dieu_Hanh',
            ['Mã NV', 'Họ và tên', 'Số điện thoại', 'Email', 'Vai trò', 'Số chuyến phụ trách', 'Chuyến hoàn thành'],
            data.workforce.topStaff.map((s) => [
                `NV${s.userId.toString().padStart(4, '0')}`,
                s.fullName,
                s.phone || 'N/A',
                s.email || 'N/A',
                s.roles.join(', ') || 'Điều hành',
                s.assignedCount,
                s.completedCount,
            ]),
        );

        // 5. Sheet Khách hàng VIP
        const sheet5 = buildWorksheet(
            'Khach_Hang_VIP',
            ['Mã KH', 'Tên khách hàng', 'Email', 'Số điện thoại', 'Hạng thành viên', 'Số đơn', 'Tổng chi tiêu (VNĐ)', 'Lần đặt gần nhất'],
            data.customers.topVip.map((c) => [
                `KH${c.userId.toString().padStart(4, '0')}`,
                c.fullName,
                c.email,
                c.phone,
                c.membershipTier,
                c.totalBookings,
                c.totalSpent,
                c.lastBookingDate || 'N/A',
            ]),
        );

        // 6. Sheet Khuyến mãi & Đánh giá
        const sheet6 = buildWorksheet(
            'Khuyen_Mai_Danh_Gia',
            ['Hạng mục', 'Chỉ số', 'Giá trị', 'Ghi chú'],
            [
                ['Mã giảm giá', 'Tổng số mã đã phát hành', data.marketing.vouchers.totalIssued, 'Hệ thống voucher'],
                ['Mã giảm giá', 'Lượt mã đã sử dụng', data.marketing.vouchers.totalUsed, 'Khách hàng áp dụng'],
                ['Mã giảm giá', 'Mã đang có hiệu lực', data.marketing.vouchers.activeCount, 'Sẵn sàng dùng'],
                ['Đánh giá khách hàng', 'Tổng số bài đánh giá', data.marketing.reviews.totalReviews, 'Tất cả bài viết'],
                ['Đánh giá khách hàng', 'Điểm trung bình toàn sàn', data.marketing.reviews.averageRating, 'Thang điểm 5 sao'],
                ['Đánh giá khách hàng', 'Tỷ lệ đánh giá tốt (4-5★)', `${data.marketing.reviews.satisfactionRate}%`, 'Chỉ số hài lòng CSAT'],
                ['Đánh giá khách hàng', '5 sao (Tuyệt vời)', data.marketing.reviews.starsCount.star5, 'Đánh giá xuất sắc'],
                ['Đánh giá khách hàng', '4 sao (Hài lòng)', data.marketing.reviews.starsCount.star4, 'Đánh giá tốt'],
                ['Đánh giá khách hàng', '3 sao (Bình thường)', data.marketing.reviews.starsCount.star3, 'Cần cải thiện'],
                ['Đánh giá khách hàng', '2 sao (Chưa hài lòng)', data.marketing.reviews.starsCount.star2, 'Được CSKH hỗ trợ'],
                ['Đánh giá khách hàng', '1 sao (Thất vọng)', data.marketing.reviews.starsCount.star1, 'Được CSKH hỗ trợ'],
            ],
        );

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
 ${sheet1}
 ${sheet2}
 ${sheet3}
 ${sheet4}
 ${sheet5}
 ${sheet6}
</Workbook>`;
    }

    async getSectionCsv(
        section: string,
        rangeParam?: string,
        fromParam?: string,
        toParam?: string,
    ): Promise<string> {
        const data = await this.getComprehensiveAnalytics(rangeParam, fromParam, toParam);
        const escapeCsv = (val: string | number) => {
            const str = String(val ?? '');
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };

        let headers: string[] = [];
        let rows: (string | number)[][] = [];

        switch (section) {
            case 'revenue': {
                headers = ['Ngày / Tháng', 'Nhãn', 'Số đơn đặt', 'Doanh thu (VNĐ)'];
                rows = data.chart.map((c) => [c.date, c.label, c.bookings, c.revenue]);
                break;
            }
            case 'tours': {
                headers = ['Mã Tour', 'Tên Tour Du Lịch', 'Số lượt đặt', 'Doanh thu (VNĐ)', 'Giá từ (VNĐ)'];
                rows = data.tours.topTours.map((t) => [t.code, t.name, t.bookingsCount, t.revenue, t.priceFrom || 0]);
                break;
            }
            case 'workforce': {
                headers = ['Mã NV', 'Họ và tên', 'Số điện thoại', 'Email', 'Vai trò', 'Số chuyến phụ trách', 'Chuyến hoàn thành'];
                rows = data.workforce.topStaff.map((s) => [
                    `NV${s.userId.toString().padStart(4, '0')}`,
                    s.fullName,
                    s.phone || 'N/A',
                    s.email || 'N/A',
                    s.roles.join(', ') || 'Điều hành',
                    s.assignedCount,
                    s.completedCount,
                ]);
                break;
            }
            case 'customers': {
                headers = ['Mã KH', 'Tên khách hàng', 'Email', 'Số điện thoại', 'Hạng thành viên', 'Số đơn', 'Tổng chi tiêu (VNĐ)', 'Lần đặt gần nhất'];
                rows = data.customers.topVip.map((c) => [
                    `KH${c.userId.toString().padStart(4, '0')}`,
                    c.fullName,
                    c.email,
                    c.phone,
                    c.membershipTier,
                    c.totalBookings,
                    c.totalSpent,
                    c.lastBookingDate || 'N/A',
                ]);
                break;
            }
            default: {
                headers = ['Chỉ số thống kê', 'Giá trị'];
                rows = [
                    ['Tổng doanh thu (VNĐ)', data.financials.totalRevenue],
                    ['Tổng số đơn đặt tour', data.financials.totalBookings],
                    ['Đơn hoàn thành', data.financials.completedBookings],
                    ['Đơn đã hủy', data.financials.cancelledBookings],
                    ['Giá trị đơn TB (VNĐ)', data.financials.averageOrderValue],
                    ['Giao dịch VNPAY', data.financials.vnpayTransactions],
                    ['Tổng tour', data.tours.totalTours],
                    ['Tổng nhân viên', data.workforce.totalStaff],
                    ['Tổng khách hàng', data.customers.totalUsers],
                    ['Điểm đánh giá sàn', data.marketing.reviews.averageRating],
                ];
            }
        }

        const lines = [headers.join(','), ...rows.map((r) => r.map(escapeCsv).join(','))];
        return `\uFEFF${lines.join('\r\n')}`;
    }
}
