import { BadRequestException } from '@nestjs/common';
import { TOUR_AMENITY_DEFINITIONS, type TourAmenityKind } from 'shared';

export function normalizeAmenities(value: unknown, allowHidden = false) {
    if (!Array.isArray(value) || value.length > TOUR_AMENITY_DEFINITIONS.length) {
        throw new BadRequestException('Danh sách tiện ích không hợp lệ.');
    }
    const seen = new Set<string>();
    return value.map((entry: unknown, sort_order) => {
        if (!entry || typeof entry !== 'object') throw new BadRequestException('Tiện ích không hợp lệ.');
        const item = entry as Record<string, unknown>;
        if (allowHidden && item.is_visible !== undefined && typeof item.is_visible !== 'boolean') {
            throw new BadRequestException('Trạng thái hiển thị tiện ích không hợp lệ.');
        }
        if (typeof item.kind !== 'string' || !TOUR_AMENITY_DEFINITIONS.some(def => def.key === item.kind) || seen.has(item.kind)) {
            throw new BadRequestException('Loại tiện ích không hợp lệ hoặc bị trùng.');
        }
        seen.add(item.kind);
        if (typeof item.title !== 'string' || !item.title.trim() || item.title.trim().length > 150 || typeof item.content !== 'string' || item.content.length > 20000) {
            throw new BadRequestException('Tiện ích cần tiêu đề (tối đa 150 ký tự) và nội dung (tối đa 20.000 ký tự).');
        }
        if (!(allowHidden && item.is_visible === false) && !item.content.trim() && item.kind !== 'hotel' && item.kind !== 'transport') {
            throw new BadRequestException('Vui lòng nhập nội dung chi tiết cho tiện ích.');
        }
        return { kind: item.kind as TourAmenityKind, title: item.title.trim(), content: item.content.trim(), sort_order,
            ...(allowHidden ? { is_visible: item.is_visible !== false } : {}),
        };
    });
}
