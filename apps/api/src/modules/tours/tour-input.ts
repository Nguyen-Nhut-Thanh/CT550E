import { BadRequestException } from '@nestjs/common';
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
    return destinations.map((locationId) => Number(locationId));
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
