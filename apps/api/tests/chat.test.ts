import 'reflect-metadata';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ChatService } from '../src/modules/chat/chat.service';
import type { PrismaService } from '../src/infrastructure/database/prisma.service';
const actor = { userId: 8, accountId: 8, isStaff: true, fullName: 'Staff' };
function setup(status: string, assigned_staff_id: number | null, tour: object | null = null) {
 const conversation = { conversation_id: 1, user_id: 2, status, assigned_staff_id };
 let update: any;
 const tx = {
  $queryRaw: async () => [],
  conversations: {
   findUnique: async () => conversation,
   findUniqueOrThrow: async () => conversation,
   update: async ({data}: any) => { update = data; return {...conversation,...data}; },
  },
  messages: { create: async ({data}: any) => ({...data, message_id: 10, created_at: new Date()}), updateMany: async () => ({count: 1}) },
 };
 const prisma = {...tx, tours: { findFirst: async () => tour }, $transaction: async (callback: any) => callback(tx)};
 return {service: new ChatService(prisma as unknown as PrismaService), updated: () => update};
}
test('staff can reply immediately to legacy waiting and other staff conversations', async () => {
 for (const [status, assignee] of [['WAITING', null], ['IN_PROGRESS', 99]] as const) {
  const {service, updated} = setup(status, assignee);
  const message = await service.send(actor, {conversation_id: 1, content: 'Hello'});
  assert.equal(message.sender_id, actor.userId);
  assert.equal(updated().status, 'IN_PROGRESS');
 }
});
test('staff can reply to a legacy closed conversation without reopening manually', async () => {
 const {service, updated} = setup('CLOSED', 99);
 await service.send(actor, {conversation_id: 1, content: 'Hello'});
 assert.equal(updated().status, 'IN_PROGRESS');
});
test('any staff member can mark customer messages read and reopen a conversation', async () => {
 const {service} = setup('CLOSED', 99);
 assert.equal((await service.read(1, actor, 10)).count, 1);
 assert.equal((await service.manage(1, actor, 'reopen')).status, 'IN_PROGRESS');
});
test('customers still cannot access another customer conversation', async () => {
 const {service} = setup('IN_PROGRESS', null);
 await assert.rejects(service.send({...actor, isStaff: false}, {conversation_id: 1, content: 'Hello'}), /Không có quyền/);
});

test('tour messages use the nearest available departure and its price', async () => {
 const start = new Date(Date.now() + 72 * 3600000);
 const schedule = {tour_schedule_id: 12, start_date: start, price: '5535000', quota: 20, booked_count: 1, cover_image_url: null, flash_deals: null};
 const {service} = setup('IN_PROGRESS', null, {name: 'Đà Nẵng - Hội An', base_price: '9999999', cut_off_hours: 24, tour_schedules: [{...schedule, tour_schedule_id: 11, start_date: new Date(Date.now() + 48 * 3600000), booked_count: 20}, schedule], duration_days: 3, duration_nights: 2, tour_images: [{image_url: 'https://example.com/tour.jpg'}]});
 const message = await service.send(actor, {conversation_id: 1, content: 'Client title', message_type: 'CONTEXT', context: {tour_id: 42}});
 assert.equal(message.content, 'Đà Nẵng - Hội An');
 assert.deepEqual(message.context, {kind: 'tour', id: 42, title: 'Đà Nẵng - Hội An', url: '/tours/42', image_url: 'https://example.com/tour.jpg', price: 5535000, schedule_id: 12, departure_date: start.toISOString(), duration: '3 ngày 2 đêm'});
});
test('a tour hidden after selection cannot be sent', async () => {
 const {service} = setup('IN_PROGRESS', null);
 await assert.rejects(service.send(actor, {conversation_id: 1, content: 'Tour', message_type: 'CONTEXT', context: {tour_id: 42}}), /Tour không còn hiển thị/);
});

test('tour without an available departure is rejected', async () => {
 const {service} = setup('IN_PROGRESS', null, {tour_schedules: [], cut_off_hours: 24});
 await assert.rejects(service.send(actor, {conversation_id: 1, content: 'Tour', message_type: 'CONTEXT', context: {tour_id: 42}}), /chưa có lịch khởi hành/);
});
test('context list returns latest unique items from all conversation history', async () => {
 const latest = {kind: 'tour', id: 1, title: 'Latest', url: '/tours/1'};
 const older = {kind: 'tour', id: 1, title: 'Old snapshot', url: '/tours/1'};
 const booking = {kind: 'booking', id: 2, title: 'Booking', url: '/booking/2'};
 const prisma = {conversations: {findUnique: async () => ({user_id: 2})}, messages: {findMany: async () => [{context: latest}, {context: booking}, {context: older}, {context: null}]}};
 const service = new ChatService(prisma as unknown as PrismaService);
 assert.deepEqual(await service.contexts(1, actor), [latest, booking]);
});
