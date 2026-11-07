/** Editing is locked against the saved departure, even if a later date is submitted. */
export function getScheduleEditRestriction(startDate: string | Date, cutOffHours: number, now = Date.now()): string | null {
    const start = new Date(startDate).getTime();
    if (start <= now) return 'Không thể chỉnh sửa lịch trình đã khởi hành.';
    if (start - now < Math.max(0, cutOffHours) * 60 * 60 * 1000) {
        return 'Tour đang trong thời gian chốt khách, không thể chỉnh sửa lịch trình.';
    }
    return null;
}

export function getSchedulePickupTimeError(startDate: string | Date, pickupPoints: readonly { pickup_at: string | Date }[]): string | null {
    const start = new Date(startDate).getTime();
    if (!Number.isFinite(start)) return 'Ngày giờ khởi hành không hợp lệ.';
    for (const [index, point] of pickupPoints.entries()) {
        const pickup = new Date(point.pickup_at).getTime();
        if (!Number.isFinite(pickup)) return `Điểm đón ${index + 1}: thời gian đón không hợp lệ.`;
        if (pickup >= start) return `Điểm đón ${index + 1}: thời gian đón khách phải sớm hơn thời gian khởi hành của đợt khởi hành.`;
    }
    return null;
}
