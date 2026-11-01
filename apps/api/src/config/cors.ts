export function getCorsOrigins(): string[] {
    return [...new Set([
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://[::1]:3000',
        'https://nhutthanh.id.vn',
        'https://www.nhutthanh.id.vn',
        process.env.FRONTEND_PUBLIC_URL ?? '',
        ...(process.env.CORS_ORIGINS ?? '').split(','),
    ].map(value => value.trim().replace(/\/+$/, '')).filter(Boolean))];
}
