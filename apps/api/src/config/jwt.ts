export function getJwtSecret(): string {
    return process.env.JWT_SECRET || 'fallback_secret_for_dev_only';
}
export function getJwtOptions() {
    const expiresIn = process.env.JWT_EXPIRES_IN && /^\d+$/.test(process.env.JWT_EXPIRES_IN)
        ? Number(process.env.JWT_EXPIRES_IN)
        : 86400;
    return { secret: getJwtSecret(), signOptions: { expiresIn } };
}
