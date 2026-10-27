type LocationAncestor = {
    location_id: number;
    name: string;
    level_id: number;
    locations?: LocationAncestor | null;
};

// Tour destinations are at most three parent links below the country level.
const locationIdentity = { location_id: true, name: true, level_id: true } as const;
export const tourCountrySelect = {
    ...locationIdentity,
    locations: { select: { ...locationIdentity, locations: { select: { ...locationIdentity, locations: { select: locationIdentity } } } } },
} as const;

export function getTourCountries(destinations: { locations: LocationAncestor }[]) {
    const countries = new Map<number, { location_id: number; name: string }>();
    for (const destination of destinations) {
        let location: LocationAncestor | null | undefined = destination.locations;
        while (location) {
            if (location.level_id === 3) {
                countries.set(location.location_id, { location_id: location.location_id, name: location.name });
                break;
            }
            location = location.locations;
        }
    }
    return [...countries.values()];
}
