import { BadRequestException } from "@nestjs/common";
import { BOOKING_EXTRAS } from "shared";
export function priceBookingExtras(ids: unknown, guests: number) {
    if (ids === undefined)
        return { items: [], total: 0 };
    if (!Array.isArray(ids) ||
        ids.length > BOOKING_EXTRAS.length ||
        ids.some((id) => typeof id !== "string") ||
        new Set(ids).size !== ids.length) {
        throw new BadRequestException("Danh sách dịch vụ bổ sung không hợp lệ.");
    }
    const items = ids.map((id: string) => {
        const service = BOOKING_EXTRAS.find((item) => item.id === id);
        if (!service) {
            throw new BadRequestException("Dịch vụ bổ sung không tồn tại.");
        }
        const quantity = service.pricing_unit === "guest" ? guests : 1;
        return { ...service, quantity, amount: service.unit_price * quantity };
    });
    return { items, total: items.reduce((sum, item) => sum + item.amount, 0) };
}
export function resolveRollbackStatus(paymentStatus: any) {
    return paymentStatus === 'completed' ? 'paid' : 'pending';
}
export function formatCurrency(amount: any) {
    return new Intl.NumberFormat('vi-VN').format(amount);
}
export function mergeBookingNote(existingNote: any, entry: any) {
    return [existingNote?.trim(), entry.trim()].filter(Boolean).join('\n\n');
}
