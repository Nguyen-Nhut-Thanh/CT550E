import { BadRequestException } from '@nestjs/common';
import { isValidTourDuration, MAX_TOUR_IMAGES } from 'shared';

export function normalizeTourImages(value: unknown): string[] | undefined {
    if (value === undefined) return undefined;
    if (!Array.isArray(value) || value.length > MAX_TOUR_IMAGES || value.some(item => typeof item !== 'string' || !item.trim())) {
        throw new BadRequestException(`Danh sách ảnh không hợp lệ. Mỗi tour được tải tối đa ${MAX_TOUR_IMAGES} ảnh.`);
    }
    return value.map(item => (item as string).trim());
}

export function normalizeTourDuration(daysValue: unknown, nightsValue: unknown) {
    for (const value of [daysValue, nightsValue]) {
        if ((typeof value !== 'number' && typeof value !== 'string') || (typeof value === 'string' && !value.trim())) {
            throw new BadRequestException('Số ngày và số đêm phải là số nguyên hợp lệ.');
        }
    }
    const days = Number(daysValue);
    const nights = Number(nightsValue);
    if (!isValidTourDuration(days, nights) || days > 2147483647 || nights > 2147483647) {
        throw new BadRequestException('Tour phải có ít nhất 1 ngày; số đêm không âm và chỉ được chênh tối đa 1 so với số ngày.');
    }
    return { days, nights };
}
export function normalizeCutOffHours(value: unknown): number | undefined {
    if (value === undefined) return undefined;
    if ((typeof value !== 'number' && typeof value !== 'string') || (typeof value === 'string' && !value.trim())) {
        throw new BadRequestException('Giờ chốt khách phải là số nguyên không âm.');
    }
    const hours = Number(value);
    if (!Number.isInteger(hours) || hours < 0 || hours > 2147483647) throw new BadRequestException('Giờ chốt khách phải là số nguyên không âm hợp lệ.');
    return hours;
}
export function normalizeTourSummary(value: unknown): string | null | undefined {
    if (value === undefined || value === null) return value;
    if (typeof value !== 'string') throw new BadRequestException('Mô tả ngắn phải là văn bản.');
    return value.trim() || null;
}
export function normalizePolicyEntries(policyContents?: Record<string, unknown>) {
    if (!policyContents || typeof policyContents !== 'object') {
        return [];
    }
    return Object.entries(policyContents)
        .map(([policy_type, content]) => {
        const normalizedContent = typeof content === 'string'
            ? content
            : content == null
                ? ''
                : JSON.stringify(content);
        return {
            policy_type,
            content: normalizedContent.trim(),
        };
    })
        .filter((entry) => entry.content.length > 0);
}
export function normalizeDestinationIds(destinations?: Array<number | string>) {
    if (!Array.isArray(destinations)) {
        return [];
    }
    const ids = destinations.map((locationId) => Number(locationId));
    if (ids.some(id => !Number.isSafeInteger(id) || id <= 0) || new Set(ids).size !== ids.length) {
        throw new BadRequestException('Danh sách tỉnh/thành không hợp lệ hoặc bị trùng.');
    }
    return ids;
}
export function ensureMutableFieldChangeAllowed(field: string, oldValue: unknown, newValue: unknown, totalBookings: number) {
    const normalizeComparableValue = (value: unknown) => typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean'
        ? String(value)
        : value == null
            ? ''
            : JSON.stringify(value);
    if (newValue !== undefined &&
        newValue !== null &&
        normalizeComparableValue(newValue) !== normalizeComparableValue(oldValue)) {
        throw new BadRequestException(`Không thể thay đổi trường '${field}' vì tour này đã có ${totalBookings} lượt đặt.`);
    }
}
