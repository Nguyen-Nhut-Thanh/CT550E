import type { Request } from 'express';

/**
 * Danh sách origins hợp lệ mặc định (Localhost + Production)
 */
export const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://[::1]:3000',
  'https://nhutthanh.id.vn',
  'https://www.nhutthanh.id.vn',
];

/**
 * Lấy danh sách tất cả origin hợp lệ (bao gồm từ CORS_ORIGINS và ENV)
 */
export function getAllowedOrigins(): string[] {
  return [
    ...new Set([
      ...DEFAULT_ALLOWED_ORIGINS,
      process.env.FRONTEND_PUBLIC_URL ?? '',
      ...(process.env.CORS_ORIGINS ?? '').split(','),
    ]
      .map((origin) => origin.trim().replace(/\/+$/, ''))
      .filter(Boolean)),
  ];
}

/**
 * Trích xuất origin (protocol + host) từ URL string
 */
export function extractOrigin(urlStr?: string | null): string | null {
  if (!urlStr) return null;
  try {
    const parsed = new URL(urlStr);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return null;
  }
}

/**
 * Nhận diện linh hoạt origin của client gọi API:
 * 1. Kiểm tra header `Origin` (chuẩn CORS từ browser)
 * 2. Kiểm tra header `Referer`
 * 3. Nếu origin nằm trong whitelist hợp lệ hoặc là localhost/127.0.0.1 thì dùng origin đó
 * 4. Nếu không xác định được -> fallback về FRONTEND_PUBLIC_URL hoặc http://localhost:3000
 */
export function resolveClientOrigin(req?: Request | null): string {
  const allowed = getAllowedOrigins();
  const fallback = (process.env.FRONTEND_PUBLIC_URL || 'http://localhost:3000').replace(/\/+$/, '');

  if (!req) return fallback;

  // 1. Kiểm tra header Origin
  const originHeader = req.headers?.origin
    ? String(req.headers.origin).trim().replace(/\/+$/, '')
    : null;
  if (originHeader) {
    if (allowed.includes(originHeader)) return originHeader;
    if (/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(originHeader)) {
      return originHeader;
    }
  }

  // 2. Kiểm tra header Referer
  const refererHeader = req.headers?.referer
    ? extractOrigin(String(req.headers.referer))
    : null;
  if (refererHeader) {
    if (allowed.includes(refererHeader)) return refererHeader;
    if (/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(refererHeader)) {
      return refererHeader;
    }
  }

  return fallback;
}


