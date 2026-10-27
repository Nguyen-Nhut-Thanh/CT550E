import assert from 'node:assert/strict';
import { test } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { DEFAULT_FLASH_DEAL_FILTERS, filterManagedFlashDeals, getFlashDealOverview, getFlashDealSeats, getFlashDealStatus } from '@/lib/admin/flash-deals/management';
import { FlashDealTable } from '@/components/admin/flash-deals/FlashDealTable';
import { FlashDealPageHeader } from '@/components/admin/flash-deals/FlashDealPageHeader';
import type { FlashDealSchedule } from 'shared';

const now = new Date('2026-10-24T10:00:00+07:00').getTime();
function schedule(id: number, overrides: Partial<FlashDealSchedule> = {}): FlashDealSchedule {
  return { tour_schedule_id: id, start_date: '2026-10-27T08:00:00+07:00', quota: 25, booked_count: 3, price: 3990000, status: 1, tours: { name: 'Hội An – Phố cổ', code: 'TOUR-HOIAN', status: 1, tour_images: [{ image_url: '/hoi-an.jpg' }], tour_destinations: [{ locations: { location_id: 12, name: 'Hội An' } }] }, flash_deals: { deal_id: id, discount_type: 'percentage', discount_value: 10, start_date: '2026-10-23T08:00:00+07:00', end_date: '2026-10-27T08:00:00+07:00', status: 1 }, ...overrides };
}
test('deal state follows opening, end, visibility and actual remaining seats', () => {
  const active = schedule(1);
  assert.equal(getFlashDealStatus(active, now).key, 'active');
  assert.equal(getFlashDealStatus(schedule(2, { flash_deals: { ...active.flash_deals!, start_date: '2026-10-25T00:00:00+07:00' } }), now).key, 'scheduled');
  assert.equal(getFlashDealStatus(schedule(3, { status: 0 }), now).key, 'paused');
  assert.equal(getFlashDealStatus(schedule(4, { tours: { status: 0 } }), now).key, 'paused');
  assert.equal(getFlashDealStatus(schedule(5, { booked_count: 25 }), now).key, 'soldout');
  assert.equal(getFlashDealStatus(schedule(6, { flash_deals: { ...active.flash_deals!, end_date: '2026-10-24T09:00:00+07:00' } }), now).key, 'expired');
  assert.equal(getFlashDealStatus(schedule(7, { flash_deals: null }), now).key, 'none');
  assert.equal(getFlashDealSeats(schedule(8, { booked_count: 30 })), 0);
  assert.equal(getFlashDealSeats(schedule(9, { booked_count: 3, _count: { bookings: 8 } })), 22);
});
test('search, deal status, departure window and destination filters combine', () => {
  const items = [schedule(1), schedule(2, { start_date: '2026-12-27T08:00:00+07:00' }), schedule(3, { start_date: '2026-10-20T08:00:00+07:00' }), schedule(4, { tours: { code: 'DN', name: 'Đà Nẵng' } })];
  assert.deepEqual(filterManagedFlashDeals(items, { ...DEFAULT_FLASH_DEAL_FILTERS, search: '  tour-hoian ', status: 'active', departure: '7', destination: '12' }, now).map(item => item.tour_schedule_id), [1]);
  assert.deepEqual(filterManagedFlashDeals(items, DEFAULT_FLASH_DEAL_FILTERS, now).map(item => item.tour_schedule_id), [1, 2, 4]);
});
test('overview counts active schedules and available seats without inventing revenue', () => {
  const active = schedule(1);
  const upcoming = schedule(2, { flash_deals: { ...active.flash_deals!, start_date: '2026-10-26T00:00:00+07:00' } });
  assert.deepEqual(getFlashDealOverview([active, upcoming, schedule(3, { status: 0 }), schedule(4, { booked_count: 25 })], now), { active: 1, scheduled: 1, seats: 22 });
  const html = renderToStaticMarkup(<FlashDealPageHeader overview={{ active: 1, scheduled: 1, seats: 22 }} loading={false} />);
  assert.match(html, /Chỗ còn ưu đãi/);
  assert.doesNotMatch(html, /so với tuần trước|Doanh thu/);
});
test('table displays the real cover, prices, status and the shared action menu', () => {
  const html = renderToStaticMarkup(<FlashDealTable items={[schedule(1)]} loading={false} busy={false} now={now} page={1} onPageChange={() => {}} onEdit={() => {}} onDelete={() => {}} />);
  for (const pattern of [/src="\/hoi-an.jpg"/, /22 \/ 25/, /3\.591\.000/, /Đang giảm giá/, /aria-label="Thao tác với Hội An/]) assert.match(html.replace(/<!--[\s\S]*?-->/g, ''), pattern);
});
