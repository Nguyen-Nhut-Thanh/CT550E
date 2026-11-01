export const TOUR_AMENITY_DEFINITIONS = [
    { key: 'transport', title: 'Phương tiện di chuyển' },
    { key: 'hotel', title: 'Khách sạn' },
    { key: 'cuisine', title: 'Ẩm thực' },
    { key: 'guide', title: 'Hướng dẫn viên' },
    { key: 'insurance', title: 'Bảo hiểm du lịch' },
    { key: 'water', title: 'Nước uống' },
    { key: 'best_time', title: 'Thời gian lý tưởng' },
    { key: 'best_for', title: 'Phù hợp với' },
    { key: 'promotion', title: 'Khuyến mãi' },
] as const;

export type TourAmenityKind = typeof TOUR_AMENITY_DEFINITIONS[number]['key'];
export type TourAmenity = {
    amenity_id?: number;
    kind: TourAmenityKind;
    title: string;
    content: string;
    sort_order?: number;
};

export type ScheduleAmenity = Omit<TourAmenity, 'amenity_id'> & {
    schedule_amenity_id?: number;
    source_amenity_id?: number | null;
    is_visible: boolean;
};

export function copyTourAmenities(items: TourAmenity[]): ScheduleAmenity[] {
    return items.map((item, sort_order) => ({
        kind: item.kind, title: item.title, content: item.content,
        source_amenity_id: item.amenity_id ?? null, sort_order, is_visible: true,
    }));
}
