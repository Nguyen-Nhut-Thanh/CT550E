export function getTourNightRange(days: number) {
    return { min: Math.max(0, days - 1), max: days + 1 };
}

export function isValidTourDuration(days: number, nights: number) {
    return Number.isInteger(days) && days >= 1 && Number.isInteger(nights) && nights >= 0 && Math.abs(days - nights) <= 1;
}
