import { Injectable } from '@nestjs/common';
import type { FeaturedDestinationGroup, FeaturedDestinationItem } from 'shared';
import { PrismaService } from '../../infrastructure/database/prisma.service';
@Injectable()
export class LocationsPublicService {
    constructor(private readonly prisma: PrismaService) { }
    async getFeaturedDestinations(): Promise<{
        regions: FeaturedDestinationGroup[];
    }> {
        // 1. Lấy tất cả các địa điểm được đánh dấu là Featured và có level <= 4 (Các Tab Miền)
        const featuredTabs = await this.prisma.locations.findMany({
            where: {
                is_featured: true,
                level_id: { lte: 4 },
            },
            orderBy: {
                featured_order: 'asc',
            },
        });

        const tabIds = featuredTabs.map((t) => t.location_id);
        if (tabIds.length === 0) {
            return { regions: [] };
        }

        // 2. Query toàn bộ địa điểm con trong 1 lần gọi Prisma duy nhất (Fix N+1 query)
        const allLocations = await this.prisma.locations.findMany({
            where: {
                parent_id: { in: tabIds },
                is_featured: true,
            },
            orderBy: [{ featured_order: 'asc' }, { name: 'asc' }],
            select: {
                parent_id: true,
                location_id: true,
                name: true,
                slug: true,
                featured_image: true,
                location_images: {
                    where: {
                        status: 1,
                    },
                    orderBy: [
                        { is_cover: 'desc' },
                        { sort_order: 'asc' },
                        { image_id: 'asc' },
                    ],
                    take: 1,
                    select: {
                        image_url: true,
                        alt_text: true,
                    },
                },
                tour_destinations: {
                    select: {
                        tour_id: true,
                    },
                },
            },
        });

        // 3. Gom nhóm theo parent_id bằng Map trên memory (tối đa 9 items mỗi tab)
        const locationMap = new Map<number, FeaturedDestinationItem[]>();
        for (const location of allLocations) {
            if (location.parent_id == null) continue;
            let group = locationMap.get(location.parent_id);
            if (!group) {
                group = [];
                locationMap.set(location.parent_id, group);
            }
            if (group.length < 9) {
                const firstImage = location.location_images[0];
                group.push({
                    location_id: location.location_id,
                    name: location.name,
                    slug: location.slug,
                    image_url: location.featured_image || firstImage?.image_url || null,
                    alt_text: firstImage?.alt_text ?? location.name,
                    total_tours: location.tour_destinations.length,
                });
            }
        }

        const regions = featuredTabs.map((tab) => ({
            key: tab.slug,
            label: tab.name,
            items: locationMap.get(tab.location_id) || [],
        }));

        return { regions };
    }
    async getNavigationData() {
        // 1. Lấy danh sách Miền (level_id = 4)
        const regions = await this.prisma.locations.findMany({
            where: {
                level_id: 4,
                country_code: 'VN',
            },
            select: {
                location_id: true,
                name: true,
                other_locations: {
                    where: {
                        level_id: 5, // Tỉnh/Thành phố
                    },
                    select: {
                        name: true,
                        slug: true,
                    },
                    orderBy: {
                        name: 'asc',
                    },
                },
            },
            orderBy: {
                location_id: 'asc',
            },
        });
        // 2. Lấy danh sách Quốc gia (level_id = 3, loại trừ Việt Nam)
        const countries = await this.prisma.locations.findMany({
            where: {
                level_id: 3,
                location_type: 'country',
                NOT: {
                    slug: 'viet-nam',
                },
            },
            select: {
                name: true,
                slug: true,
            },
            orderBy: {
                name: 'asc',
            },
        });
        return {
            domestic: regions.map((r: any) => ({
                region: r.name,
                cities: r.other_locations,
            })),
            international: countries,
        };
    }
}
