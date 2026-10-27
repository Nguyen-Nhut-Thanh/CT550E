import type { FlashDealSchedule } from 'shared';

export type FlashDealFilters = { search: string; status: string; departure: string; destination: string };
export const DEFAULT_FLASH_DEAL_FILTERS: FlashDealFilters = { search: '', status: 'all', departure: 'all', destination: 'all' };
export function getFlashDealSeats(schedule: FlashDealSchedule) { return Math.max(0, schedule.quota - (schedule.booked_count ?? schedule._count?.bookings ?? 0)); }
export function getFlashDealStatus(schedule: FlashDealSchedule, now = Date.now()) {
  const deal = schedule.flash_deals;
  if (!deal) return { key: 'none', label: 'Chưa có deal' };
  if (new Date(schedule.start_date).getTime() <= now || (deal.end_date && new Date(deal.end_date).getTime() <= now)) return { key: 'expired', label: 'Đã kết thúc' };
  if (deal.status !== 1 || schedule.status === 0 || schedule.tours?.status === 0) return { key: 'paused', label: 'Tạm ẩn' };
  if (getFlashDealSeats(schedule) === 0) return { key: 'soldout', label: 'Đã hết chỗ' };
  if (new Date(deal.start_date).getTime() > now) return { key: 'scheduled', label: 'Sắp mở bán' };
  return { key: 'active', label: 'Đang giảm giá' };
}
export function filterManagedFlashDeals(items: FlashDealSchedule[], filters: FlashDealFilters, now = Date.now()) {
  const search = filters.search.trim().toLocaleLowerCase('vi');
  return items.filter(item => {
    const departure = new Date(item.start_date).getTime();
    if (!Number.isFinite(departure) || departure <= now) return false;
    if (search && !`${item.tours?.name || ''} ${item.tours?.code || ''}`.toLocaleLowerCase('vi').includes(search)) return false;
    if (filters.status !== 'all' && getFlashDealStatus(item, now).key !== filters.status) return false;
    if (filters.departure !== 'all' && departure > now + Number(filters.departure) * 86400000) return false;
    return filters.destination === 'all' || !!item.tours?.tour_destinations?.some(destination => String(destination.locations.location_id) === filters.destination);
  });
}
export function getFlashDealOverview(items: FlashDealSchedule[], now = Date.now()) {
  return items.reduce((totals, item) => {
    const status = getFlashDealStatus(item, now).key;
    if (status === 'active') { totals.active++; totals.seats += getFlashDealSeats(item); }
    if (status === 'scheduled') totals.scheduled++;
    return totals;
  }, { active: 0, scheduled: 0, seats: 0 });
}
