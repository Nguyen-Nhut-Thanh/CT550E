import type { Prisma } from '@prisma/client';
import type { RegionCode } from 'shared';

/** Infer only from the departure's ancestor chain; never guess from the tour destination. */
export async function inferOperatingRegion(db: Prisma.TransactionClient, locationId: number): Promise<RegionCode | null> {
    const visited = new Set<number>();
    let current: number | null = locationId;
    while (current !== null && !visited.has(current) && visited.size < 20) {
        visited.add(current);
        const location: { slug: string; parent_id: number | null } | null = await db.locations.findUnique({ where: { location_id: current }, select: { slug: true, parent_id: true } });
        if (!location) break;
        const regions: Record<string, RegionCode> = { 'mien-bac': 'north', 'mien-trung': 'central', 'mien-nam': 'south' };
        if (regions[location.slug]) return regions[location.slug];
        current = location.parent_id;
    }
    return null;
}
