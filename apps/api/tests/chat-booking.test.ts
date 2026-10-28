import 'reflect-metadata';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { BookingsService } from '../src/modules/bookings/bookings.service';
import type { PrismaService } from '../src/infrastructure/database/prisma.service';
import type { MailService } from '../src/infrastructure/mail/mail.service';
import type { BookingPayload } from 'shared';

test('staff booking assigns the selected customer rather than any payload owner', async () => {
 const prisma = {users: {findUnique: async () => ({full_name:'Customer', phone:'0901234567', accounts:{email:'customer@example.com', status:1}})}};
 const service = new BookingsService(prisma as unknown as PrismaService, {} as MailService);
 let saved: any;
 service.createBooking = async payload => { saved = payload; return payload; };
 await service.createForCustomer(42, {user_id:99} as unknown as BookingPayload);
 assert.equal(saved.user_id, 42);
});
test('staff booking rejects a missing or inactive customer', async () => {
 const service = new BookingsService({users: {findUnique: async () => null}} as unknown as PrismaService, {} as MailService);
 await assert.rejects(service.createForCustomer(42, {} as BookingPayload), /Không tìm thấy khách hàng/);
});
