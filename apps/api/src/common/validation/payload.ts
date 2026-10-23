import { BadRequestException } from '@nestjs/common';
export function requireFields(body: Record<string, unknown>, fields: string[]) {
    for (const field of fields) {
        const value = body[field];
        if (value === undefined || value === null || value === '') {
            throw new BadRequestException(`Missing ${field}`);
        }
    }
}
export function validatePrice(price: unknown) {
    const numericPrice = Number(price || 0);
    if (numericPrice < 0)
        return 0;
    if (numericPrice > 999999999)
        return 999999999;
    return numericPrice;
}
