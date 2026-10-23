import { Injectable } from '@nestjs/common';
import type { DashboardChartPoint, DashboardKpi, DashboardReportRow, DashboardStats, DashboardStatusBreakdown, DashboardTimeRange, DashboardTopTour, } from 'shared';
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
                where: { status: 1 },
                take: 5,
                include: {
                    tour_images: {
                        where: { is_cover: 1 },
                        take: 1,
                        select: { image_url: true },
                    },
                    tour_schedules: {
                        include: {
                            bookings: {
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
            .sort((a, b) => b.revenue - a.revenue || b.bookingsCount - a.bookingsCount)
            .slice(0, 5);
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
}
