import type { BookingExtraService } from "./models";
export const BOOKING_EXTRAS: BookingExtraService[] = [
    {
        id: "private_guide",
        name: "Hướng dẫn viên riêng",
        description: "Hướng dẫn viên dành riêng cho đoàn trong đơn đặt tour",
        unit_price: 200000,
        pricing_unit: "booking",
    },
    {
        id: "travel_insurance",
        name: "Bảo hiểm du lịch",
        description: "Gói bảo hiểm bổ sung cho chuyến đi",
        unit_price: 50000,
        pricing_unit: "guest",
    },
    {
        id: "photography",
        name: "Chụp ảnh chuyên nghiệp",
        description: "Lưu giữ những khoảnh khắc đáng nhớ",
        unit_price: 300000,
        pricing_unit: "group",
    },
];
