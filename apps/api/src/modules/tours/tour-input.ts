import { BadRequestException } from '@nestjs/common';
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
