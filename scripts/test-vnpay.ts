import 'reflect-metadata';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHmac } from 'node:crypto';
import test from 'node:test';
import { Prisma, PrismaClient } from '@prisma/client';
import { parse } from 'dotenv';
import { PaymentService } from '../apps/api/src/modules/payment/payment.service';
import { PaymentController } from '../apps/api/src/modules/payment/payment.controller';
import { BookingsAdminService } from '../apps/api/src/modules/bookings/bookings-admin.service';
import { formatVnpayDate, parseVnpayDate, signedVnpayQuery, verifyVnpayQuery, vnpayIp } from '../apps/api/src/modules/payment/vnpay';

const merchant = 'TESTMERCHANT';
const secret = 'unit-test-secret-do-not-use-for-payments';
Object.assign(process.env, { VNP_TMN_CODE: merchant, VNP_HASH_SECRET: secret, VNP_PAYMENT_URL: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html', VNP_RETURN_URL: 'https://merchant.example.invalid/payment/vnpay-return', VNP_EXPIRE_MINUTES: '15', FRONTEND_PUBLIC_URL: 'https://merchant.example.invalid' });
const amount = new Prisma.Decimal('1234567.89');
const decimal = (value: unknown) => new Prisma.Decimal(value as string | number);

function signed(fields: Record<string, string>) {
  return { ...fields, vnp_SecureHash: signedVnpayQuery(fields, secret).signature };
}
function callback(reference: string, changes: Record<string, string> = {}) {
  return signed({ vnp_TmnCode: merchant, vnp_TxnRef: reference, vnp_Amount: amount.mul(100).toFixed(0),
    vnp_ResponseCode: '00', vnp_TransactionStatus: '00', vnp_TransactionNo: '123456789',
    vnp_PayDate: formatVnpayDate(new Date()), ...changes });
}

function fixture() {
  const booking = { booking_id: 42, user_id: 7, status: 'pending', total_amount: amount,
    contact_name: 'VNPay fixture', contact_email: 'fixture@example.invalid', contact_phone: '0900000000',
    tour_schedules: { start_date: new Date(Date.now() + 14 * 86400000), status: 1, tours: { name: 'Fixture tour' } } };
  const attempts: any[] = [];
  const counters = { email: 0, bookingWrites: 0, paymentWrites: 0 };
  let queue = Promise.resolve<unknown>(undefined);
  const payments = {
    findFirst: async ({ where }: any) => [...attempts].reverse().find(row =>
      (!where.booking_id || where.booking_id === row.booking_id) &&
      (!where.status || where.status === row.status) && (!where.method || where.method === row.method) &&
      (!where.provider_reference || (typeof where.provider_reference === 'string' ? row.provider_reference === where.provider_reference : row.provider_reference != null)) &&
      (!where.expires_at || row.expires_at > where.expires_at.gt) &&
      (!where.bookings || where.bookings.user_id === booking.user_id)),
    findUnique: async ({ where }: any) => attempts.find(row => row.provider_reference === where.provider_reference) || null,
    findUniqueOrThrow: async ({ where }: any) => {
      const row = attempts.find(row => row.provider_reference === where.provider_reference);
      assert.ok(row); return { ...row, bookings: booking };
    },
    create: async ({ data }: any) => {
      const row = { payment_id: attempts.length + 1, response_code: null, provider_status: null, paid_at: null, transaction_code: null, ...data, bookings: booking };
      attempts.push(row); counters.paymentWrites++; return row;
    },
    update: async ({ where, data }: any) => {
      const row = attempts.find(item => item.payment_id === where.payment_id);
      assert.ok(row); Object.assign(row, data); counters.paymentWrites++; return row;
    },
  };
  const db: any = {
    users: { findUnique: async ({ where }: any) => where.account_id === 3 ? { user_id: booking.user_id } : { user_id: 99 } },
    bookings: {
      findFirst: async ({ where }: any) => where.booking_id === booking.booking_id && where.user_id === booking.user_id ? booking : null,
      findUniqueOrThrow: async () => booking,
      update: async ({ data }: any) => { Object.assign(booking, data); counters.bookingWrites++; return booking; },
    },
    payments,
    $queryRaw: async () => [],
    $transaction: async (fn: (tx: any) => Promise<unknown>) => {
      const work = queue.then(() => fn(db)); queue = work.catch(() => undefined); return work;
    },
  };
  const service = new PaymentService(db, { sendBookingPaidEmail: async () => { counters.email++; } } as never);
  Object.assign(service, { logger: { warn() {}, error() {} } });
  return { booking, attempts, counters, service, db };
}

test('VNPay signing matches a separately constructed SHA512 reference and encodes spaces/URLs once', () => {
  const fields = { vnp_TmnCode: merchant, vnp_OrderInfo: 'Thanh toan tour 42', vnp_ReturnUrl: 'https://merchant.example.invalid/a?b=1&c=2' };
  const canonical = 'vnp_OrderInfo=Thanh+toan+tour+42&vnp_ReturnUrl=https%3A%2F%2Fmerchant.example.invalid%2Fa%3Fb%3D1%26c%3D2&vnp_TmnCode=TESTMERCHANT';
  assert.deepEqual(signedVnpayQuery(fields, secret), { query: canonical, signature: createHmac('sha512', secret).update(canonical).digest('hex') });
  assert.deepEqual(verifyVnpayQuery(signed(fields), secret, merchant), fields);
});

test('tampering, repeated fields, an invalid merchant, and malformed hashes are rejected', () => {
  const good = callback('B42TEST');
  for (const bad of [{ ...good, vnp_Amount: '1' }, { ...good, vnp_Amount: [good.vnp_Amount] }, { ...good, vnp_SecureHash: 'abc' }, signed({ ...Object.fromEntries(Object.entries(good).filter(([key]) => key !== 'vnp_SecureHash')), vnp_TmnCode: 'OTHER' })]) {
    assert.equal(verifyVnpayQuery(bad, secret, merchant), null);
  }
  assert.equal(verifyVnpayQuery({ ...good, vnp_SecureHash: good.vnp_SecureHash.toUpperCase(), tracking: 'ignored' }, secret, merchant)?.vnp_TxnRef, 'B42TEST');
});

test('Vietnam dates and IPs do not depend on the host timezone', () => {
  assert.equal(formatVnpayDate(new Date('2026-12-31T17:05:06Z')), '20270101000506');
  assert.equal(parseVnpayDate('20270101000506')?.toISOString(), '2026-12-31T17:05:06.000Z');
  for (const date of ['20270230000506', '20270101240506', 'invalid']) assert.equal(parseVnpayDate(date), null);
  assert.equal(vnpayIp('::ffff:192.0.2.1'), '192.0.2.1');
  assert.equal(vnpayIp('::1'), '127.0.0.1');
  assert.equal(vnpayIp('attacker, 1.2.3.4'), '127.0.0.1');
});

test('payment URL uses the stored amount, an issued reference, expiry and a valid signature', async () => {
  const { service, attempts } = fixture();
  const result = await service.createPaymentUrl(42, 3, '::ffff:192.0.2.1');
  const url = new URL(result.paymentUrl);
  const fields = Object.fromEntries(url.searchParams);
  assert.equal(url.hostname, 'sandbox.vnpayment.vn');
  assert.equal(fields.vnp_Amount, '123456789');
  assert.equal(fields.vnp_TxnRef, result.reference);
  assert.equal(fields.vnp_IpAddr, '192.0.2.1');
  assert.equal(fields.vnp_ExpireDate, formatVnpayDate(attempts[0].expires_at));
  assert.ok(verifyVnpayQuery(fields, secret, merchant));
  assert.equal(attempts[0].status, 'pending');
});

test('controller ignores client-supplied prices and forwards only booking/account/IP', async () => {
  let args: unknown[] = [];
  const controller = new PaymentController({ createPaymentUrl: async (...values: unknown[]) => { args = values; return {}; } } as never);
  await controller.create({ bookingId: 42, amount: 1 } as never, { user: { accountId: 3 }, ip: '192.0.2.1', socket: {} } as never);
  assert.deepEqual(args, [42, 3, '192.0.2.1']);
});

test('foreign owners cannot create payment URLs or read a payment attempt', async () => {
  const { service, counters } = fixture();
  await assert.rejects(() => service.createPaymentUrl(42, 999), /Không tìm thấy đơn/);
  assert.equal(counters.paymentWrites, 0);
  const attempt = await service.createPaymentUrl(42, 3);
  await assert.rejects(() => service.getPaymentStatus(attempt.reference, 999), /Không tìm thấy giao dịch/);
});

test('status requests require a single explicit reference rather than coercing undefined/arrays', async () => {
  const { service } = fixture();
  for (const value of [undefined, null, ['B42TEST'], {}]) {
    await assert.rejects(() => service.getPaymentStatus(value as never, 3), /Mã giao dịch không hợp lệ/);
  }
});

test('paid, cancelled and departed bookings cannot create payment attempts', async () => {
  const { service, booking, counters } = fixture();
  for (const status of ['paid', 'cancelled', 'cancel_requested', 'completed']) {
    booking.status = status; await assert.rejects(() => service.createPaymentUrl(42, 3), /chờ thanh toán/);
  }
  booking.status = 'pending'; booking.tour_schedules.start_date = new Date(Date.now() - 1);
  await assert.rejects(() => service.createPaymentUrl(42, 3), /không còn nhận thanh toán/);
  assert.equal(counters.paymentWrites, 0);
});

test('double clicks reuse one live attempt; failed and expired attempts can be retried', async () => {
  const { service, attempts } = fixture();
  const pair = await Promise.all([service.createPaymentUrl(42, 3), service.createPaymentUrl(42, 3)]);
  assert.equal(pair[0].reference, pair[1].reference); assert.equal(attempts.length, 1);
  await service.handleReturn(callback(pair[0].reference, { vnp_ResponseCode: '24', vnp_TransactionStatus: '02', vnp_TransactionNo: '0' }));
  const retry = await service.createPaymentUrl(42, 3);
  assert.notEqual(retry.reference, pair[0].reference);
  attempts[1].expires_at = new Date(Date.now() - 1);
  assert.equal((await service.getPaymentStatus(retry.reference, 3)).status, 'expired');
  assert.notEqual((await service.createPaymentUrl(42, 3)).reference, retry.reference);
});

test('verified return settles an order immediately when IPN is delayed and fills the ledger once', async () => {
  const { service, attempts, booking, counters } = fixture();
  const attempt = await service.createPaymentUrl(42, 3);
  const data = callback(attempt.reference);
  const returned = new URL(await service.handleReturn(data));
  assert.equal(returned.searchParams.get('reference'), attempt.reference);
  assert.equal(booking.status, 'paid');
  assert.equal((await service.getPaymentStatus(attempt.reference, 3)).status, 'success');
  assert.equal((await service.verifyIpn(data)).RspCode, '02');
  assert.equal(booking.status, 'paid');
  assert.equal(attempts[0].transaction_code, '123456789');
  assert.ok(attempts[0].paid_at instanceof Date);
  assert.equal(attempts[0].provider_status, '00');
  assert.equal(counters.email, 1);
  assert.equal((await service.getPaymentStatus(attempt.reference, 3)).status, 'success');
});

test('the return fallback rejects forged success, wrong merchants and incorrect amounts', async () => {
  const { service, booking, counters } = fixture();
  const attempt = await service.createPaymentUrl(42, 3);
  for (const data of [
    { status: 'success', vnp_TxnRef: attempt.reference },
    { ...callback(attempt.reference), vnp_Amount: '1' },
    callback(attempt.reference, { vnp_Amount: '1' }),
    callback(attempt.reference, { vnp_TmnCode: 'OTHER' }),
  ]) {
    const returned = new URL(await service.handleReturn(data));
    assert.equal(returned.searchParams.get('status'), 'invalid');
    assert.equal(booking.status, 'pending');
    assert.equal(counters.bookingWrites, 0); assert.equal(counters.email, 0);
  }
});

test('duplicate and concurrent callbacks are idempotent, including return before/after IPN', async () => {
  const { service, counters, attempts } = fixture();
  const attempt = await service.createPaymentUrl(42, 3);
  const data = callback(attempt.reference);
  const results = await Promise.all([service.verifyIpn(data), service.verifyIpn(data), service.handleReturn(data)]);
  assert.equal((results[0] as any).RspCode, '00');
  assert.equal((results[1] as any).RspCode, '02');
  assert.equal((await service.verifyIpn(data)).RspCode, '02');
  assert.equal(counters.bookingWrites, 1); assert.equal(counters.email, 1); assert.equal(attempts.length, 1);
});

test('signed callbacks with unknown references or wrong amounts never settle a booking', async () => {
  const { service, booking, counters } = fixture();
  const attempt = await service.createPaymentUrl(42, 3);
  assert.equal((await service.verifyIpn(callback('BUNKNOWN'))).RspCode, '01');
  assert.equal((await service.verifyIpn(callback(attempt.reference, { vnp_Amount: '100' }))).RspCode, '04');
  const badReturn = new URL(await service.handleReturn(callback(attempt.reference, { vnp_Amount: '100' })));
  assert.equal(badReturn.searchParams.get('status'), 'invalid');
  assert.equal(booking.status, 'pending'); assert.equal(counters.email, 0);
});

test('invalid signatures and missing/structured callback fields do not write payment data', async () => {
  const { service, counters } = fixture();
  const attempt = await service.createPaymentUrl(42, 3);
  const writes = counters.paymentWrites;
  assert.equal((await service.verifyIpn({ ...callback(attempt.reference), vnp_Amount: '1' })).RspCode, '97');
  assert.equal((await service.verifyIpn({ vnp_TxnRef: attempt.reference })).RspCode, '97');
  assert.equal((await service.verifyIpn(callback(attempt.reference, { vnp_TransactionStatus: '' }))).RspCode, '99');
  assert.equal((await service.verifyIpn(callback(attempt.reference, { vnp_CurrCode: 'USD' }))).RspCode, '99');
  assert.equal(counters.paymentWrites, writes); assert.equal(counters.bookingWrites, 0);
});

test('both response code and bank transaction status must be successful', async () => {
  for (const [vnp_ResponseCode, vnp_TransactionStatus] of [['00', '02'], ['07', '00'], ['24', '02']]) {
    const { service, booking, attempts, counters } = fixture();
    const attempt = await service.createPaymentUrl(42, 3);
    assert.equal((await service.verifyIpn(callback(attempt.reference, { vnp_ResponseCode, vnp_TransactionStatus }))).RspCode, '00');
    assert.equal(booking.status, 'pending'); assert.equal(attempts[0].status, vnp_ResponseCode === '07' ? 'review' : 'failed'); assert.equal(counters.email, 0);
  }
});

test('suspected debits and bank reversals require reconciliation instead of offering another charge', async () => {
  for (const changes of [{ vnp_ResponseCode: '07', vnp_TransactionStatus: '00' }, { vnp_ResponseCode: '00', vnp_TransactionStatus: '04' }]) {
    const { service, booking } = fixture();
    const attempt = await service.createPaymentUrl(42, 3);
    await service.verifyIpn(callback(attempt.reference, changes));
    assert.equal(booking.status, 'pending');
    assert.equal((await service.getPaymentStatus(attempt.reference, 3)).status, 'review');
    await assert.rejects(() => service.createPaymentUrl(42, 3), /đang được đối soát/);
  }
});

test('cancelled return is a failure and cannot be confused with already-confirmed IPN code 02', async () => {
  const { service, booking } = fixture();
  const attempt = await service.createPaymentUrl(42, 3);
  const cancelled = callback(attempt.reference, { vnp_ResponseCode: '24', vnp_TransactionStatus: '02', vnp_TransactionNo: '0' });
  await service.handleReturn(cancelled); await service.handleReturn(cancelled);
  assert.equal((await service.verifyIpn(cancelled)).RspCode, '02');
  assert.equal((await service.getPaymentStatus(attempt.reference, 3)).status, 'cancelled');
  assert.equal(booking.status, 'pending');
});

test('late and second successful payments are recorded for review without reopening or charging the booking twice', async () => {
  for (const finalStatus of ['cancelled', 'paid']) {
    const { service, booking, counters, attempts } = fixture();
    const attempt = await service.createPaymentUrl(42, 3);
    booking.status = finalStatus;
    assert.equal((await service.verifyIpn(callback(attempt.reference))).RspCode, '00');
    assert.equal(booking.status, finalStatus); assert.equal(counters.bookingWrites, 0); assert.equal(counters.email, 0);
    assert.equal(attempts[0].status, 'review'); assert.ok(attempts[0].paid_at);
    assert.equal((await service.getPaymentStatus(attempt.reference, 3)).status, 'review');
  }
});

test('settlement during a pending cancellation preserves the request and records paid funds', async () => {
  const { service, booking, attempts } = fixture();
  const attempt = await service.createPaymentUrl(42, 3); booking.status = 'cancel_requested';
  await service.verifyIpn(callback(attempt.reference));
  assert.equal(booking.status, 'cancel_requested'); assert.equal(attempts[0].status, 'completed');
  assert.equal((await service.getPaymentStatus(attempt.reference, 3)).status, 'review');
});

test('missing configuration and transient database errors fail safely', async () => {
  const { service, db } = fixture();
  const original = process.env.VNP_HASH_SECRET;
  delete process.env.VNP_HASH_SECRET;
  await assert.rejects(() => service.createPaymentUrl(42, 3), /chưa được cấu hình/);
  assert.equal((await service.verifyIpn({})).RspCode, '99');
  process.env.VNP_HASH_SECRET = original;
  db.payments.findUnique = async () => { throw new Error('database offline'); };
  assert.equal((await service.verifyIpn(callback('B42TEST'))).RspCode, '99');
});

test('rejecting a cancellation reads fresh paid funds instead of a pre-IPN snapshot', async () => {
  const current = { booking_id: 42, status: 'cancel_requested', note: '', payments: [{ status: 'completed' }] };
  let updated: any;
  const tx = { $queryRaw: async () => [], bookings: { findUniqueOrThrow: async () => current, update: async ({ data }: any) => { updated = data; return data; } } };
  const admin = new BookingsAdminService({ $transaction: async (fn: any) => fn(tx) } as never, { sendCancelRejectedEmail: async () => {} } as never);
  admin.findBookingForCancelActionOrThrow = async () => ({ ...current, payments: [], contact_email: 'fixture@example.invalid', tour_schedules: { tours: { name: 'Fixture' } } }) as never;
  await admin.rejectCancel(42, true, '');
  assert.equal(updated.status, 'paid');
});

test('PostgreSQL payment flow uses the real schema and rolls back all fixtures', { skip: !process.argv.includes('--database') }, async () => {
  const settings = parse(readFileSync(resolve(__dirname, '../.env')));
  const db = new PrismaClient({ datasourceUrl: settings.DATABASE_URL });
  const rollback = new Error('ROLLBACK_VNPAY_FIXTURES');
  try {
    await assert.rejects(() => db.$transaction(async tx => {
      const location = await tx.locations.findFirstOrThrow();
      const transport = await tx.transports.findFirstOrThrow();
      const key = `TEST-VNPAY-${Date.now()}`;
      const account = await tx.accounts.create({ data: { email: `${key}@example.invalid`, users: { create: { full_name: key } } }, include: { users: true } });
      const tour = await tx.tours.create({ data: { code: key, name: key, description: key, duration_days: 2, duration_nights: 1, departure_location: location.location_id, transport_id: transport.transport_id } });
      const schedule = await tx.tour_schedules.create({ data: { tour_id: tour.tour_id, departure_location_id: location.location_id, start_date: new Date(Date.now() + 14 * 86400000), end_date: new Date(Date.now() + 15 * 86400000), price: amount, quota: 10, booked_count: 1 } });
      const booking = await tx.bookings.create({ data: { user_id: account.users!.user_id, tour_schedule_id: schedule.tour_schedule_id, contact_name: key, contact_email: `${key}@example.invalid`, contact_phone: '0900000000', total_amount: amount, adult_unit_price: amount } });
      const proxy = new Proxy(tx, { get(target, property) { if (property === '$transaction') return (fn: (client: typeof tx) => Promise<unknown>) => fn(tx); const value = Reflect.get(target, property); return typeof value === 'function' ? value.bind(target) : value; } });
      let emails = 0;
      const service = new PaymentService(proxy as never, { sendBookingPaidEmail: async () => { emails++; } } as never);
      const attempt = await service.createPaymentUrl(booking.booking_id, account.account_id, '127.0.0.1');
      const data = callback(attempt.reference);
      await service.handleReturn(data);
      assert.equal((await service.getPaymentStatus(attempt.reference, account.account_id)).status, 'success');
      assert.equal((await service.verifyIpn(data)).RspCode, '02');
      assert.equal((await service.verifyIpn(data)).RspCode, '02');
      assert.equal((await service.getPaymentStatus(attempt.reference, account.account_id)).status, 'success');
      assert.equal((await tx.bookings.findUniqueOrThrow({ where: { booking_id: booking.booking_id } })).status, 'paid');
      assert.equal((await tx.tour_schedules.findUniqueOrThrow({ where: { tour_schedule_id: schedule.tour_schedule_id } })).booked_count, 1);
      assert.equal(await tx.payments.count({ where: { booking_id: booking.booking_id } }), 1); assert.equal(emails, 1);
      throw rollback;
    }, { timeout: 20000 }), error => error === rollback);
  } finally { await db.$disconnect(); }
});

test('configured sandbox accepts a signed checkout URL without submitting a payment', { skip: !process.argv.includes('--sandbox') }, async () => {
  const settings = parse(readFileSync(resolve(__dirname, '../.env')));
  assert.ok(settings.VNP_TMN_CODE && settings.VNP_HASH_SECRET);
  const now = new Date();
  const fields = { vnp_Version: '2.1.0', vnp_Command: 'pay', vnp_TmnCode: settings.VNP_TMN_CODE,
    vnp_Locale: 'vn', vnp_CurrCode: 'VND', vnp_TxnRef: `TEST${Date.now()}`, vnp_OrderInfo: 'Kiem tra ket noi sandbox',
    vnp_OrderType: 'other', vnp_Amount: '1000000', vnp_ReturnUrl: settings.VNP_RETURN_URL,
    vnp_IpAddr: '127.0.0.1', vnp_CreateDate: formatVnpayDate(now), vnp_ExpireDate: formatVnpayDate(new Date(now.getTime() + 900000)) };
  const { query, signature } = signedVnpayQuery(fields, settings.VNP_HASH_SECRET);
  // VNPay uses a session cookie between the signed URL and its bank selector.
  // Node fetch does not preserve cookies when it follows redirects automatically.
  let target = `${settings.VNP_PAYMENT_URL}?${query}&vnp_SecureHash=${signature}`;
  const cookies = new Map<string, string>();
  let result: Response | undefined;
  for (let redirect = 0; redirect < 8; redirect++) {
    assert.equal(new URL(target).hostname, 'sandbox.vnpayment.vn');
    result = await fetch(target, { redirect: 'manual', headers: { Cookie: [...cookies].map(([name, value]) => `${name}=${value}`).join('; ') }, signal: AbortSignal.timeout(20000) });
    for (const cookie of result.headers.getSetCookie()) {
      const pair = cookie.split(';')[0]; const separator = pair.indexOf('=');
      if (separator > 0) cookies.set(pair.slice(0, separator), pair.slice(separator + 1));
    }
    const location = result.headers.get('location');
    if (result.status < 300 || result.status >= 400 || !location) break;
    target = new URL(location, target).toString();
    await result.body?.cancel();
  }
  assert.ok(result);
  const html = await result.text();
  assert.ok(result.ok, 'Sandbox checkout HTTP request failed');
  if (/\/error(?:\.html|\/|\?)/i.test(result.url)) {
    const message = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    assert.fail(`Sandbox rejected checkout: ${message.slice(0, 1500)}`);
  }
  assert.match(html, /VNPAY/i);
  assert.match(html, /NCB|Chọn.*ngân hàng|chọn.*phương thức|Select.*bank|card|bankCode/i);
});

test('public website proxies callbacks and protects payment creation/status', { skip: !process.argv.includes('--http') }, async () => {
  const settings = parse(readFileSync(resolve(__dirname, '../.env')));
  const base = settings.FRONTEND_PUBLIC_URL.replace(/\/+$/, '') + '/api/payment';
  const [ipn, returned, create, status] = await Promise.all([
    fetch(`${base}/vnpay-ipn`, { signal: AbortSignal.timeout(20000) }),
    fetch(`${base}/vnpay-return`, { redirect: 'manual', signal: AbortSignal.timeout(20000) }),
    fetch(`${base}/create-url`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bookingId: 1, amount: 1 }), signal: AbortSignal.timeout(20000) }),
    fetch(`${base}/status?reference=TEST`, { signal: AbortSignal.timeout(20000) }),
  ]);
  assert.equal(ipn.status, 200); assert.equal((await ipn.json() as { RspCode: string }).RspCode, '97');
  assert.equal(returned.status, 302);
  const location = new URL(returned.headers.get('location')!);
  assert.equal(location.origin, settings.FRONTEND_PUBLIC_URL);
  assert.equal(location.pathname, '/booking/result'); assert.equal(location.searchParams.get('status'), 'invalid');
  assert.equal(create.status, 401); assert.equal(status.status, 401);
});
