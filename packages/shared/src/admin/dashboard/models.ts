export type DashboardTimeRange = "7d" | "30d" | "month" | "year";
export interface DashboardKpi {
    totalRevenue: number;
    revenueTrend: number;
    totalBookings: number;
    bookingsTrend: number;
    activeTours: number;
    totalTours: number;
    newUsers: number;
    usersTrend: number;
    totalLocations: number;
    paidBookings: number;
    pendingBookings: number;
    cancelledBookings: number;
    completedBookings: number;
    confirmedBookings: number;
    conversionRate: number;
}
export interface DashboardChartPoint {
    date: string;
    label: string;
    revenue: number;
    bookings: number;
}
export interface DashboardBookingItem {
    id: string;
    bookingId: number;
    customer: string;
    customerEmail: string;
    customerPhone: string;
    tour: string;
    tourCode: string;
    date: string;
    departureDate: string | null;
    amount: number;
    status: string;
    paxCount: number;
}
export interface DashboardTopTour {
    tourId: number;
    name: string;
    code: string;
    featuredImage: string | null;
    bookingsCount: number;
    revenue: number;
    rating?: number;
    priceFrom?: number;
}
export interface DashboardStatusBreakdown {
    confirmed: number;
    pending: number;
    paid: number;
    completed: number;
    cancelled: number;
}
export interface DashboardStats {
    timeRange: DashboardTimeRange;
    kpis: DashboardKpi;
    chart: DashboardChartPoint[];
    statusBreakdown: DashboardStatusBreakdown;
    recentBookings: DashboardBookingItem[];
    topTours: DashboardTopTour[];
    // Legacy / convenience flattened fields:
    totalRevenue: number;
    revenueTrend: number;
    bookingsThisMonth: number;
    bookingsTrend: number;
    activeTours: number;
    newUsers: number;
    usersTrend: number;
}
export interface DashboardReportRow {
    bookingId: string;
    bookingDate: string;
    customerName: string;
    email: string;
    phone: string;
    tourName: string;
    tourCode: string;
    departureDate: string;
    amount: number;
    status: string;
    pax: number;
}

export interface StaffPerformanceItem {
    userId: number;
    fullName: string;
    phone?: string | null;
    email?: string | null;
    roles: string[];
    assignedCount: number;
    completedCount: number;
    status: string;
}

export interface CustomerVipItem {
    userId: number;
    fullName: string;
    email: string;
    phone: string;
    membershipTier: string;
    totalBookings: number;
    totalSpent: number;
    lastBookingDate?: string | null;
}

export interface TourTypeStat {
    type: string;
    label: string;
    count: number;
    revenue: number;
    bookingsCount: number;
}

export interface ReviewAnalytics {
    totalReviews: number;
    averageRating: number;
    satisfactionRate: number;
    starsCount: {
        star1: number;
        star2: number;
        star3: number;
        star4: number;
        star5: number;
    };
}

export interface VoucherAnalytics {
    totalIssued: number;
    totalUsed: number;
    totalDiscountAmount: number;
    activeCount: number;
}

export interface ComprehensiveAnalytics {
    timeRange: string;
    startDate: string;
    endDate: string;
    financials: {
        totalRevenue: number;
        revenueTrend: number;
        totalBookings: number;
        bookingsTrend: number;
        completedBookings: number;
        cancelledBookings: number;
        averageOrderValue: number;
        vnpayTransactions: number;
        vnpayVolume: number;
    };
    chart: DashboardChartPoint[];
    tours: {
        totalTours: number;
        activeTours: number;
        totalSchedules: number;
        completedSchedules: number;
        byType: TourTypeStat[];
        topTours: DashboardTopTour[];
    };
    workforce: {
        totalStaff: number;
        activeStaff: number;
        byRole: { role: string; label: string; count: number }[];
        topStaff: StaffPerformanceItem[];
    };
    customers: {
        totalUsers: number;
        newUsers: number;
        byTier: { tier: string; label: string; count: number }[];
        topVip: CustomerVipItem[];
    };
    marketing: {
        vouchers: VoucherAnalytics;
        reviews: ReviewAnalytics;
    };
}
