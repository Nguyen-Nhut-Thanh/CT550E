"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlashDealModal } from '@/components/admin/flash-deals/FlashDealModal';
import { FlashDealPageHeader } from '@/components/admin/flash-deals/FlashDealPageHeader';
import { FlashDealFilters } from '@/components/admin/flash-deals/FlashDealFilters';
import { FlashDealTable } from '@/components/admin/flash-deals/FlashDealTable';
import { deleteAdminFlashDeal, getAdminFlashDeals, saveAdminFlashDeal } from '@/lib/admin/flash-deals/api';
import { buildFlashDealForm, buildFlashDealPayload, createDefaultFlashDealForm } from '@/lib/admin/flash-deals/forms';
import { DEFAULT_FLASH_DEAL_FILTERS, filterManagedFlashDeals, getFlashDealOverview } from '@/lib/admin/flash-deals/management';
import { useToast } from '@/lib/notifications/useToast';
import { confirmAction } from '@/lib/utils/confirm';
import type { FlashDealForm, FlashDealSchedule } from 'shared';

export default function AdminFlashDealsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [failure, setFailure] = useState('');
  const [schedules, setSchedules] = useState<FlashDealSchedule[]>([]);
  const [filters, setFilters] = useState({ ...DEFAULT_FLASH_DEAL_FILTERS });
  const [draftFilters, setDraftFilters] = useState({ ...DEFAULT_FLASH_DEAL_FILTERS });
  const [page, setPage] = useState(1);
  const [now, setNow] = useState(Date.now);
  const [showModal, setShowModal] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState<FlashDealSchedule | null>(null);
  const [form, setForm] = useState<FlashDealForm>(createDefaultFlashDealForm);
  const { success, error: showError } = useToast();

  const loadData = useCallback(async () => {
    setLoading(true); setFailure('');
    try { setSchedules(await getAdminFlashDeals()); setNow(Date.now()); }
    catch (cause) { setFailure(cause instanceof Error ? cause.message : 'Không thể tải danh sách flash deal.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void loadData(); }, [loadData]);
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 60000); return () => clearInterval(timer); }, []);

  const filteredSchedules = useMemo(() => filterManagedFlashDeals(schedules, filters, now), [schedules, filters, now]);
  const overview = useMemo(() => getFlashDealOverview(schedules, now), [schedules, now]);
  const destinations = useMemo(() => {
    const unique = new Map<number, string>();
    schedules.forEach(schedule => schedule.tours?.tour_destinations?.forEach(({ locations }) => unique.set(locations.location_id, locations.name)));
    return [...unique].map(([id, label]) => ({ value: String(id), label })).sort((left, right) => left.label.localeCompare(right.label, 'vi'));
  }, [schedules]);
  const filterActive = Object.entries(draftFilters).some(([key, value]) => value !== DEFAULT_FLASH_DEAL_FILTERS[key as keyof typeof DEFAULT_FLASH_DEAL_FILTERS]) || Object.entries(filters).some(([key, value]) => value !== DEFAULT_FLASH_DEAL_FILTERS[key as keyof typeof DEFAULT_FLASH_DEAL_FILTERS]);

  const openDealModal = (schedule: FlashDealSchedule) => { setCurrentSchedule(schedule); setForm(buildFlashDealForm(schedule)); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setCurrentSchedule(null); setForm(createDefaultFlashDealForm()); };
  const handleSaveDeal = async () => {
    if (!currentSchedule) return;
    if (!Number.isFinite(form.discount_value) || form.discount_value <= 0 || (form.discount_type === 'percentage' ? form.discount_value > 100 : form.discount_value > Number(currentSchedule.price))) {
      showError('Mức giảm cần lớn hơn 0 và không vượt quá giá gốc hoặc 100%.'); return;
    }
    setSaving(true);
    try {
      const deal = currentSchedule.flash_deals;
      await saveAdminFlashDeal(deal ? `/admin/marketing/flash-deals/${deal.deal_id}` : '/admin/marketing/flash-deals', deal ? 'PATCH' : 'POST', buildFlashDealPayload(currentSchedule, form));
      success(deal ? 'Đã cập nhật flash deal' : 'Đã tạo flash deal'); closeModal(); void loadData();
    } catch (cause) { showError(cause instanceof Error ? cause.message : 'Không thể lưu flash deal.'); }
    finally { setSaving(false); }
  };
  const handleDelete = async (schedule: FlashDealSchedule) => {
    const deal = schedule.flash_deals;
    if (!deal || !confirmAction(`Xóa flash deal của tour “${schedule.tours?.name || 'đã chọn'}”?`)) return;
    setDeleting(true);
    try { await deleteAdminFlashDeal(deal.deal_id); success('Đã xóa flash deal'); void loadData(); }
    catch (cause) { showError(cause instanceof Error ? cause.message : 'Không thể xóa flash deal.'); }
    finally { setDeleting(false); }
  };

  return <div className="ui-flash-deal-management-page flex flex-col gap-[18px] min-w-0 text-[#12234c] [&_:is(button,_input,_a):focus-visible]:[outline:2px_solid_#3b82f6] [&_:is(button,_input,_a):focus-visible]:outline-offset-[3px] admin-max-650:gap-[14px]">
    <FlashDealPageHeader overview={overview} loading={loading} />
    <FlashDealFilters value={draftFilters} onChange={setDraftFilters} onApply={() => { setFilters({ ...draftFilters }); setPage(1); }} onReset={() => { setDraftFilters({ ...DEFAULT_FLASH_DEAL_FILTERS }); setFilters({ ...DEFAULT_FLASH_DEAL_FILTERS }); setPage(1); }} destinations={destinations} count={filteredSchedules.length} active={filterActive} />
    {failure && <div role="alert" className="ui-flash-deal-management-error flex justify-between gap-[12px] [border:1px_solid_#fecdd3] rounded-[12px] [background:#fff1f3] p-[14px_16px] text-[#ba3550] text-[13px] [&_button]:underline [&_button]:font-[650]"><span>{failure}</span><button type="button" onClick={loadData}>Thử lại</button></div>}
    <FlashDealTable items={filteredSchedules} loading={loading} busy={saving || deleting} now={now} page={page} onPageChange={setPage} onEdit={openDealModal} onDelete={schedule => { void handleDelete(schedule); }} />
    <FlashDealModal open={showModal} saving={saving} schedule={currentSchedule} form={form} onClose={closeModal} onChange={updater => setForm(current => updater(current))} onSave={handleSaveDeal} />
  </div>;
}
