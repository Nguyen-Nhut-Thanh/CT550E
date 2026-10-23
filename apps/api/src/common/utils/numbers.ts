export function toNumber(value: unknown): number {
    if (value == null)
        return 0;
    const num = Number(value);
    return Number.isNaN(num) ? 0 : num;
}
