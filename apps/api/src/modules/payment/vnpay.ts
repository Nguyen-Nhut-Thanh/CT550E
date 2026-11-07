import { createHmac, timingSafeEqual } from 'node:crypto';
import { isIP } from 'node:net';

export type VnpayQuery = Record<string, unknown>;
export type VnpayFields = Record<string, string>;

export function signedVnpayQuery(fields: VnpayFields, secret: string) {
    const encode = (value: string) => encodeURIComponent(value).replace(/%20/g, '+');
    const query = Object.keys(fields).sort().map(key => `${encode(key)}=${encode(fields[key])}`).join('&');
    return { query, signature: createHmac('sha512', secret).update(query, 'utf8').digest('hex') };
}

/** Express has already decoded the query. Reject repeated/structured vnp_ values. */
export function verifyVnpayQuery(query: VnpayQuery, secret: string, merchant: string): VnpayFields | null {
    const fields: VnpayFields = {};
    for (const [key, value] of Object.entries(query)) {
        if (!key.startsWith('vnp_')) continue;
        if (typeof value !== 'string') return null;
        fields[key] = value;
    }
    const hash = fields.vnp_SecureHash;
    delete fields.vnp_SecureHash;
    delete fields.vnp_SecureHashType;
    if (!hash || !/^[a-f\d]{128}$/i.test(hash)) return null;
    const { signature } = signedVnpayQuery(fields, secret);
    if (!timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(signature, 'hex')) || fields.vnp_TmnCode !== merchant) return null;
    return fields;
}

export function formatVnpayDate(date: Date) {
    return new Intl.DateTimeFormat('sv-SE', {
        timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
    }).format(date).replace(/\D/g, '');
}

export function parseVnpayDate(value: string): Date | null {
    if (!/^\d{14}$/.test(value)) return null;
    const date = new Date(`${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T${value.slice(8, 10)}:${value.slice(10, 12)}:${value.slice(12, 14)}+07:00`);
    return Number.isFinite(date.getTime()) && formatVnpayDate(date) === value ? date : null;
}

export function vnpayIp(value?: string) {
    const ip = (value || '').replace(/^::ffff:/, '');
    return ip === '::1' || !isIP(ip) ? '127.0.0.1' : ip;
}

