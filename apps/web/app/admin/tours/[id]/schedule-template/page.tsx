"use client";

import { useAdminContentReadOnly } from '@/components/common/admin_shared/guards/AdminContentPermission';


import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookCopy, Info, Loader2, Save } from 'lucide-react';
import type { HotelItem, LocationOption, RoomTypeItem, ScheduleFormState, TourInfo, TransportItem } from 'shared';
import { TourEditorShell } from '@/components/tours/tour_editor/AdminTourEditorShell';
import { TourEditorCard } from '@/components/tours/tour_editor/AdminTourEditorCard';
import { ScheduleDepartureCard } from '@/components/schedules/schedule_config/AdminScheduleDepartureCard';
import { ScheduleAttractionsCard } from '@/components/schedules/schedule_config/AdminScheduleAttractionsCard';
import { ScheduleItinerarySection } from '@/components/schedules/schedule_itinerary/AdminScheduleItinerarySection';
import { IncompleteItineraryDialog } from '@/components/schedules/schedule_itinerary/AdminIncompleteItineraryDialog';
import { getIncompleteItineraryDays } from '@/lib/schedules/admin/itinerary';
import { getAdminTourDetail } from '@/lib/tours/admin/api';
import { getAdminHotels, getAdminCatalogTransports, getHotelRoomTypes } from '@/lib/catalogs/admin/api';
import { getAdminLocations } from '@/lib/locations/admin/api';
import { getTourScheduleTemplate, saveTourScheduleTemplate } from '@/lib/schedules/admin/api';
import { createDefaultScheduleForm, ensureItineraryDays, updateScheduleStart } from '@/lib/schedules/admin/forms';
import { applyScheduleTemplate, buildScheduleTemplatePayload } from '@/lib/schedules/admin/template';
import { useToast } from '@/lib/notifications/useToast';

export default function TourScheduleTemplatePage() {
  const readOnly = useAdminContentReadOnly();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { success, error: showError } = useToast();
  const [form, setForm] = useState<ScheduleFormState>(createDefaultScheduleForm);
  const [tour, setTour] = useState<TourInfo | null>(null);
  const [hotels, setHotels] = useState<HotelItem[]>([]);
  const [transports, setTransports] = useState<TransportItem[]>([]);
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [roomTypesMap, setRoomTypesMap] = useState<Record<number, RoomTypeItem[]>>({});
  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const [incompleteDays, setIncompleteDays] = useState<number[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const fetchRooms = useCallback(async (hotelId: number) => {
    const rooms = await getHotelRoomTypes<RoomTypeItem>(hotelId);
    setRoomTypesMap(previous => ({ ...previous, [hotelId]: rooms }));
  }, []);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError('');
    Promise.all([getAdminTourDetail<TourInfo>(id), getTourScheduleTemplate(id), getAdminHotels<HotelItem>(), getAdminCatalogTransports<TransportItem>(), getAdminLocations<LocationOption>()]).then(async ([detail, saved, hotelList, transportList, locationList]) => {
      let base = createDefaultScheduleForm();
      const referenceDate = saved.template?.reference_date || new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
      base = updateScheduleStart(base, referenceDate, '08:00', Number(detail.tour.duration_days) || 1);
      base.departure_location_id = detail.tour.departure_location || '';
      base.itinerary = ensureItineraryDays([], Number(detail.tour.duration_days) || 1);
      const next = saved.template ? applyScheduleTemplate(base, saved.template, Number(detail.tour.duration_days) || 1) : base;
      const roomEntries = await Promise.all([...new Set(next.itinerary.map(day => Number(day.hotel_id)).filter(Boolean))].map(async hotelId => [hotelId, await getHotelRoomTypes<RoomTypeItem>(hotelId)] as const));
      if (!active) return;
      setTour(detail.tour); setForm(next); setHotels(hotelList); setTransports(transportList); setLocations(locationList.items || []); setRoomTypesMap(Object.fromEntries(roomEntries));
    }).catch(error => { if (active) setLoadError(error instanceof Error ? error.message : 'Không thể tải mẫu lịch trình.'); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);
  const save = async (allowIncomplete = false) => {
    if (savingRef.current || saving || loading || loadError) return;
    const missing = getIncompleteItineraryDays(form.itinerary, Number(tour?.duration_days) || 1);
    if (missing.length && !allowIncomplete) { setIncompleteDays(missing); return; }
    savingRef.current = true;
    setSaving(true);
    try {
      await saveTourScheduleTemplate(id, buildScheduleTemplatePayload(form), allowIncomplete && missing.length > 0);
      success('Đã lưu mẫu lịch trình. Những chuyến đã tạo vẫn giữ nội dung riêng.');
      router.push('/admin/tours');
    }
    catch (error) { showError(error instanceof Error ? error.message : 'Không thể lưu mẫu lịch trình.'); }
    finally { savingRef.current = false; setSaving(false); }
  };
  if (loading) return <div className="flex min-h-80 items-center justify-center"><Loader2 size={30} className="animate-spin text-blue-600" /></div>;
  if (loadError) return <div role="alert" className="rounded-2xl border border-rose-100 bg-rose-50 p-5 text-sm text-rose-700">{loadError}<Link href="/admin/tours" className="mt-3 block font-semibold underline">Quay lại quản lý tour</Link></div>;
  return <TourEditorShell title="Mẫu lịch trình" description={tour?.name || ''} onBack={() => router.push('/admin/tours')} sections={[{ id: 'schedule-pickups', label: 'Điểm đón' }, { id: 'schedule-attractions', label: 'Tham quan' }, { id: 'schedule-itinerary', label: 'Lịch trình' }]}>
    <div className="grid items-start gap-[22px] lg:grid-cols-[minmax(0,1fr)_290px]">
      <fieldset disabled={readOnly || saving} className="min-w-0 space-y-[22px]">
        <legend className="sr-only">Dữ liệu mẫu lịch trình của tour</legend>
        <ScheduleDepartureCard form={form} disabled={readOnly || saving} onChange={setForm} templateMode durationDays={Number(tour?.duration_days) || 1} />
        <ScheduleAttractionsCard form={form} locations={locations} tourInfo={tour} disabled={readOnly || saving} onChange={setForm} />
        <div id="schedule-itinerary" className="scroll-mt-5"><ScheduleItinerarySection form={form} locations={locations} isPast={saving} expandedDay={expandedDay} tourInfo={tour} hotels={hotels} transports={transports} roomTypesMap={roomTypesMap} onExpandedDayChange={setExpandedDay} onFormChange={setForm} onHotelSelect={hotelId => { void fetchRooms(hotelId).catch(() => showError('Không thể tải loại phòng. Vui lòng chọn lại khách sạn.')); }} /></div>
      </fieldset>
      <aside className="space-y-5 lg:sticky lg:top-4">
        <TourEditorCard title="Mẫu dùng cho tour" description="Điền sẵn thông tin cho những chuyến tiếp theo." icon={BookCopy}>
          <p className="text-[13px] leading-6 text-[#6f809c]">Mẫu gồm điểm đón, điểm tham quan, hoạt động từng ngày, khách sạn, loại phòng và phương tiện tùy chọn.</p>
          <p className="mt-4 flex items-start gap-2 rounded-xl bg-blue-50 p-3 text-[12px] leading-6 text-[#6f809c]"><Info size={16} className="mt-1 shrink-0 text-blue-500" />Chuyến mới nhận bản sao để admin chỉnh sửa. Thay đổi mẫu không cập nhật những chuyến đã có.</p>
        </TourEditorCard>
        <button type="button" disabled={readOnly || saving} onClick={() => void save()} className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[15px] bg-[linear-gradient(135deg,#4c92ff,#1258ef_65%,#0646db)] px-4 py-3 text-[14px] font-bold text-white shadow-md shadow-blue-100 disabled:opacity-60">{saving ? <Loader2 size={19} className="animate-spin" /> : <Save size={19} />}{saving ? 'Đang lưu mẫu...' : 'Lưu mẫu lịch trình'}</button>
      </aside>
    </div>
    <IncompleteItineraryDialog days={incompleteDays} destination="quản lý tour" onCancel={() => setIncompleteDays(null)} onConfirm={() => { setIncompleteDays(null); void save(true); }} />
  </TourEditorShell>;
}
