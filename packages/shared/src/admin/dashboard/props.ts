import type { DashboardBookingItem, DashboardChartPoint, DashboardKpi, DashboardStatusBreakdown, DashboardTimeRange, DashboardTopTour } from "./models";
export interface DashboardAnalyticsChartProps {
    chart: DashboardChartPoint[];
}
export interface DashboardHeaderProps {
    timeRange: DashboardTimeRange;
    onTimeRangeChange: (range: DashboardTimeRange) => void;
    onRefresh: () => void;
    onExportCsv: () => Promise<void>;
    isRefreshing?: boolean;
}
export interface DashboardKpiCardsProps {
    kpis: DashboardKpi;
    timeRange: DashboardTimeRange;
}
export interface DashboardRecentBookingsProps {
    bookings: DashboardBookingItem[];
}
export interface DashboardStatusBreakdownProps {
    statusBreakdown: DashboardStatusBreakdown;
}
export interface DashboardTopToursProps {
    topTours: DashboardTopTour[];
}
