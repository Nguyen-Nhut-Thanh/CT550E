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
