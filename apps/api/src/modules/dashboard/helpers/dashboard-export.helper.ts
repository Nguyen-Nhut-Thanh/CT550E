import type { ComprehensiveAnalytics } from 'shared';

export function escapeCsv(val: unknown): string {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

export function escapeXml(val: unknown): string {
    if (val === null || val === undefined) return '';
    return String(val)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

export interface SectionTableData {
    title: string;
    headers: string[];
    rows: (string | number)[][];
}

export function getSectionTableData(
    section: 'revenue' | 'tours' | 'workforce' | 'customers' | 'marketing' | 'kpi' | string,
    data: ComprehensiveAnalytics,
): SectionTableData {
    switch (section) {
        case 'revenue':
            return {
                title: 'Doanh_Thu_Chi_Tiet',
                headers: ['Ngày / Tháng', 'Nhãn', 'Số đơn đặt', 'Doanh thu (VNĐ)'],
                rows: data.chart.map((c) => [c.date, c.label, c.bookings, c.revenue]),
            };
        case 'tours':
            return {
                title: 'Top_Tour_Ban_Chay',
                headers: ['Mã Tour', 'Tên Tour Du Lịch', 'Số lượt đặt', 'Doanh thu (VNĐ)', 'Giá từ (VNĐ)'],
                rows: data.tours.topTours.map((t) => [t.code, t.name, t.bookingsCount, t.revenue, t.priceFrom || 0]),
            };
        case 'workforce':
            return {
                title: 'Nhan_Su_Dieu_Hanh',
                headers: ['Mã NV', 'Họ và tên', 'Số điện thoại', 'Email', 'Vai trò', 'Số chuyến phụ trách', 'Chuyến hoàn thành'],
                rows: data.workforce.topStaff.map((s) => [
                    `NV${s.userId.toString().padStart(4, '0')}`,
                    s.fullName,
                    s.phone || 'N/A',
                    s.email || 'N/A',
                    s.roles.join(', ') || 'Điều hành',
                    s.assignedCount,
                    s.completedCount,
                ]),
            };
        case 'customers':
            return {
                title: 'Khach_Hang_VIP',
                headers: ['Mã KH', 'Tên khách hàng', 'Email', 'Số điện thoại', 'Hạng thành viên', 'Số đơn', 'Tổng chi tiêu (VNĐ)', 'Lần đặt gần nhất'],
                rows: data.customers.topVip.map((c) => [
                    `KH${c.userId.toString().padStart(4, '0')}`,
                    c.fullName,
                    c.email,
                    c.phone,
                    c.membershipTier,
                    c.totalBookings,
                    c.totalSpent,
                    c.lastBookingDate || 'N/A',
                ]),
            };
        case 'marketing':
            return {
                title: 'Khuyen_Mai_Danh_Gia',
                headers: ['Hạng mục', 'Chỉ số', 'Giá trị', 'Ghi chú'],
                rows: [
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
            };
        case 'kpi':
        default:
            return {
                title: 'Tong_Quan_KPI',
                headers: ['Chỉ số thống kê', 'Giá trị', 'Đơn vị / Tăng trưởng', 'Ghi chú'],
                rows: [
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
            };
    }
}

