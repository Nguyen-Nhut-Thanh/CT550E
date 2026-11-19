"use client";

import { ScheduleBasicInfoCard } from "@/components/schedules/schedule_config/AdminScheduleBasicInfoCard";
import { ScheduleDepartureCard } from "@/components/schedules/schedule_config/AdminScheduleDepartureCard";
import { ScheduleAmenitiesCard } from "@/components/schedules/schedule_config/AdminScheduleAmenitiesCard";
import { ScheduleAttractionsCard } from "@/components/schedules/schedule_config/AdminScheduleAttractionsCard";
import Link from 'next/link';
import { getAdminLocations } from "@/lib/locations/admin/api";
import { ScheduleItinerarySection } from "@/components/schedules/schedule_itinerary/AdminScheduleItinerarySection";
import { ScheduleSidebar } from "@/components/schedules/tour_selector/AdminScheduleSidebar";
import { TourEditorShell } from "@/components/tours/tour_editor/AdminTourEditorShell";
import { IncompleteItineraryDialog } from "@/components/schedules/schedule_itinerary/AdminIncompleteItineraryDialog";
import { getIncompleteItineraryDays } from "@/lib/schedules/admin/itinerary";
import {
  getAdminCatalogTransports,
  getAdminHotels,
  getHotelRoomTypes,
} from "@/lib/catalogs/admin/api";
import {
  getAdminScheduleDetail,
  getTourScheduleTemplate,
  saveAdminSchedule,
} from "@/lib/schedules/admin/api";
import {
  buildScheduleFormFromResponse,
  buildScheduleDateTime,
  buildSchedulePayload,
  createDefaultScheduleForm,
  createEmptyPickupPoint,
  ensureItineraryDays,
  getSchedulePickupError,
} from "@/lib/schedules/admin/forms";
import { getAdminTourDetail } from "@/lib/tours/admin/api";
import { applyScheduleTemplate } from "@/lib/schedules/admin/template";
import { useToast } from "@/lib/notifications/useToast";
import { ChevronRight, Gift, Loader2, UsersRound } from "lucide-react";
import { ScheduleManifestModal } from "@/components/schedules/schedule_modals/AdminScheduleManifestModal";
import { SchedulePromotionModal } from "@/components/schedules/schedule_modals/AdminSchedulePromotionModal";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  HotelItem,
  LocationOption,
  RoomTypeItem,
  ScheduleDetailResponse,
  TourInfo,
  TransportItem,
} from "shared";
import { copyTourAmenities, getScheduleEditRestriction } from 'shared';

export default function AdminScheduleDetailPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { success, error: showError } = useToast();
  const isNew = id === "new";
  const tourId = searchParams.get("tourId");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const [incompleteDays, setIncompleteDays] = useState<number[] | null>(null);
  const [manifestOpen, setManifestOpen] = useState(false);
  const [promotionOpen, setPromotionOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [tourInfo, setTourInfo] = useState<TourInfo | null>(null);
  const [hasBookings, setHasBookings] = useState(false);
  const [bookedCount, setBookedCount] = useState(0);
  const [originalQuota, setOriginalQuota] = useState(0);
  const [originalStartDate, setOriginalStartDate] = useState<string | null>(null);
  const [hotels, setHotels] = useState<HotelItem[]>([]);
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [transports, setTransports] = useState<TransportItem[]>([]);
  const [roomTypesMap, setRoomTypesMap] = useState<
    Record<number, RoomTypeItem[]>
  >({});
  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  const [form, setForm] = useState(createDefaultScheduleForm);

  const isPast = useMemo(() => {
    return !isNew && originalStartDate != null && Date.parse(originalStartDate) <= Date.now();
  }, [originalStartDate, isNew]);

  const fetchRoomTypes = useCallback(async (hotelId: number) => {
    try {
      const data = await getHotelRoomTypes<RoomTypeItem>(hotelId);
      setRoomTypesMap((prev) =>
        prev[hotelId] ? prev : { ...prev, [hotelId]: data },
      );
    } catch {}
  }, []);

  useEffect(() => {
    let active = true;
    const initPage = async () => {
      setLoading(true);
      setLoadError("");

      try {
        const [hotelData, transportData, locationData] = await Promise.all([
          getAdminHotels<HotelItem>(),
          getAdminCatalogTransports<TransportItem>(),
          getAdminLocations<LocationOption>(),
        ]);
        if (!active) return;

        setHotels(hotelData);
        setLocations(locationData.items || []);
        setTransports(transportData);

        let currentTourId = tourId;
        let scheduleData: ScheduleDetailResponse | null = null;

        if (!isNew) {
          scheduleData = await getAdminScheduleDetail<ScheduleDetailResponse>(
            String(id),
          );
          if (!active) return;
          currentTourId = scheduleData.tour_id
            ? String(scheduleData.tour_id)
            : currentTourId;
          const booked = Boolean(scheduleData.hasBookings ?? Number(scheduleData.booked_count || 0) > 0);
          setHasBookings(booked);
          setBookedCount(Number(scheduleData.booked_count || 0));
          setOriginalQuota(Number(scheduleData.quota || 0));
          setOriginalStartDate(scheduleData.start_date ?? null);

          const restored = buildScheduleFormFromResponse(scheduleData);
          const hotelIds = new Set(restored.itinerary.map(day => Number(day.hotel_id)).filter(Boolean));
          await Promise.all([...hotelIds].map(fetchRoomTypes));
          if (!active) return;
          const locked = booked || Date.parse(scheduleData.start_date || "") < Date.now();
          setForm(!locked && !restored.pickup_points.length
            ? { ...restored, pickup_points: [createEmptyPickupPoint(restored)] }
            : restored);
        } else {
          setOriginalStartDate(null);
          setForm(createDefaultScheduleForm());
        }

        if (!currentTourId) throw new Error("Vui lòng chọn tour trước khi thêm lịch khởi hành.");
        if (currentTourId) {
          const [tourData, savedTemplate] = await Promise.all([
            getAdminTourDetail<TourInfo>(currentTourId),
            isNew ? getTourScheduleTemplate(currentTourId) : Promise.resolve(null),
          ]);
          if (!active) return;
          if (isNew) {
            const initial = { ...createDefaultScheduleForm(), departure_location_id: tourData.tour.departure_location || "" as const,
              tour_schedule_amenities: copyTourAmenities(tourData.tour.tour_amenities || []),
              single_room_surcharge: Number(tourData.tour.single_room_surcharge || 0),
            };
            const next = savedTemplate?.template ? applyScheduleTemplate(initial, savedTemplate.template, Number(tourData.tour.duration_days) || 1) : initial;
            await Promise.all([...new Set(next.itinerary.map(day => Number(day.hotel_id)).filter(Boolean))].map(fetchRoomTypes));
            if (!active) return;
            setForm(next);
          }
          setTourInfo(tourData.tour);
        }
      } catch (error) {
        if (active) setLoadError(error instanceof Error ? error.message : "Không thể tải thông tin lịch khởi hành.");
      } finally {
        if (active) setLoading(false);
      }
    };

    void initPage();
    return () => { active = false; };
  }, [fetchRoomTypes, id, isNew, tourId]);

  useEffect(() => {
    if (!tourInfo) return;

    const basePrice = Number(tourInfo.base_price ?? 0) || 0;
    const durationDays = Number(tourInfo.duration_days ?? 0) || 0;

    setForm((prev) => {
      const nextPrices = prev.prices.map((item) =>
        item.passenger_type === "adult" &&
        Number(item.price) <= 0 &&
        basePrice > 0
          ? { ...item, price: basePrice }
          : item,
      );

      return {
        ...prev,
        price: prev.price > 0 ? prev.price : basePrice,
        prices: nextPrices,
        itinerary: ensureItineraryDays(prev.itinerary, durationDays),
      };
    });
  }, [tourInfo]);

  const handleSave = async (allowIncomplete = false) => {
    if (savingRef.current || saving || uploading || loadError) return;
    if (!isNew && originalStartDate) {
      const restriction = getScheduleEditRestriction(originalStartDate, Number(tourInfo?.cut_off_hours ?? 0));
      if (restriction) { showError(restriction); return; }
    }
    if (!form.departure_location_id) { showError("Tour gốc chưa có nơi xuất phát. Vui lòng cập nhật tour trước khi thêm lịch khởi hành."); return; }
    if (form.pickup_points.some(point => !point.name.trim() || !point.address.trim() || !point.pickup_at || Number.isNaN(Date.parse(point.pickup_at)))) {
      showError("Vui lòng điền tên, địa chỉ và thời gian cho tất cả điểm đón."); return;
    }
    if (!form.start_date) {
      showError("Vui lòng chọn ngày khởi hành");
      return;
    }

    const selectedStartDate = new Date(
      buildScheduleDateTime(form.start_date, form.start_time || "00:00"),
    );
    const cutOffHours = Number(tourInfo?.cut_off_hours || 0);
    const minAllowedDateTime = new Date(
      Date.now() + cutOffHours * 60 * 60 * 1000,
    );

    if (selectedStartDate.getTime() < minAllowedDateTime.getTime()) {
      showError(
        `Ngày khởi hành phải sau thời điểm hiện tại ít nhất ${cutOffHours} giờ theo giờ chốt khách của tour.`,
      );
      return;
    }

    const pickupError = getSchedulePickupError(form);
    if (pickupError) { showError(pickupError); return; }

    const missing = getIncompleteItineraryDays(form.itinerary, Number(tourInfo?.duration_days) || 1);
    if (missing.length && !allowIncomplete) { setIncompleteDays(missing); return; }
    savingRef.current = true;
    setSaving(true);

    try {
      const data = (await saveAdminSchedule(
        isNew
          ? `/admin/tours/${tourId}/schedules`
          : `/admin/tours/schedules/${id}`,
        isNew ? "POST" : "PATCH",
        { ...buildSchedulePayload(form), allow_incomplete_itinerary: allowIncomplete && missing.length > 0 },
      )) as ScheduleDetailResponse;

      success(
        data.notificationSent
          ? "Đã cập nhật lịch khởi hành và gửi email thông báo cho khách."
          : "Đã lưu dữ liệu thành công!",
      );
      router.push("/admin/schedules");
    } catch (requestError) {
      showError(
        requestError instanceof Error
          ? requestError.message
          : "Lỗi kết nối server",
      );
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (loadError) return <div role="alert" className="mx-auto max-w-3xl rounded-2xl border border-rose-100 bg-rose-50 p-6 text-sm text-rose-700"><p>{loadError}</p><Link href="/admin/schedules" className="mt-4 inline-block font-bold underline">Quay lại quản lý lịch khởi hành</Link></div>;

  return (
    <TourEditorShell
        title={isNew ? "Thiết lập lịch mới" : "Chỉnh sửa lịch khởi hành"}
        description={tourInfo?.name || ""}
        onBack={() => router.back()}
        sections={[{ id: "schedule-info", label: "Thông tin & Giá" }, { id: "schedule-pickups", label: "Điểm đón" }, { id: "schedule-attractions", label: "Tham quan" }, { id: "schedule-itinerary", label: "Lịch trình" }]}
    >
      <div className="grid items-start gap-[22px] lg:grid-cols-[minmax(0,min(calc((100%_-_22px)*1.55/2.55),calc(100%_-_302px)))_minmax(260px,calc((100%_-_22px)/3.4))] lg:justify-start">
        <div className="flex min-w-0 flex-col gap-[22px]">
          {hasBookings && !isPast ? (
            <div className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-800">
              Đợt khởi hành này đã có đơn đặt, hiện có {bookedCount} khách giữ chỗ. Bạn vẫn có thể
              cập nhật ảnh, giá áp dụng cho đơn mới, quota theo hướng tăng, và
              lịch trình theo ngày. {form.pickup_points.length ? 'Nơi xuất phát, điểm đón và ngày giờ đã được khóa để bảo toàn thông tin khách đã xác nhận.' : 'Nếu đổi ngày hoặc giờ khởi hành, hệ thống sẽ gửi email thông báo đến khách hàng.'}
            </div>
          ) : null}

          <ScheduleBasicInfoCard
            form={form}
            isPast={isPast}
            hasBookings={hasBookings}
            bookedCount={bookedCount}
            originalQuota={originalQuota}
            tourInfo={tourInfo}
            onFormChange={setForm}
          />

          <ScheduleDepartureCard form={form} disabled={isPast || hasBookings} onChange={setForm} />
          <ScheduleAttractionsCard form={form} locations={locations} tourInfo={tourInfo} disabled={isPast} onChange={setForm} />
          <ScheduleAmenitiesCard form={form} template={tourInfo?.tour_amenities || []} disabled={isPast || hasBookings} onChange={setForm} />
          <div id="schedule-itinerary" className="scroll-mt-5">
          <ScheduleItinerarySection
            locations={locations}
            form={form}
            isPast={isPast}
            expandedDay={expandedDay}
            tourInfo={tourInfo}
            hotels={hotels}
            transports={transports}
            roomTypesMap={roomTypesMap}
            onExpandedDayChange={setExpandedDay}
            onFormChange={setForm}
            onHotelSelect={(hotelId) => void fetchRoomTypes(hotelId)}
          />
          </div>
        </div>

        <ScheduleSidebar
          form={form}
          isPast={isPast}
          saving={saving}
          uploading={uploading}
          onSave={() => void handleSave()}
          onUploadingChange={setUploading}
          onFormChange={setForm}
          managementActions={!isNew ? (
            <div className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm divide-y divide-slate-100">
              <button type="button" onClick={() => setManifestOpen(true)} className="flex w-full items-center gap-3 px-3.5 py-3 text-left transition hover:bg-blue-50/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600"><UsersRound size={17} /></span>
                <span className="min-w-0 flex-1"><span className="block text-[13px] font-bold text-slate-800">Danh sách đoàn khách</span><span className="mt-0.5 block text-[11px] text-slate-500">{bookedCount} khách giữ chỗ</span></span>
                <ChevronRight size={16} className="shrink-0 text-slate-400" />
              </button>
              <button type="button" onClick={() => setPromotionOpen(true)} className="flex w-full items-center gap-3 px-3.5 py-3 text-left transition hover:bg-amber-50/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-500">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-600"><Gift size={17} /></span>
                <span className="min-w-0 flex-1"><span className="block text-[13px] font-bold text-slate-800">Ưu đãi riêng</span><span className="mt-0.5 block text-[11px] text-slate-500">Thiết lập giảm giá, quà tặng</span></span>
                <ChevronRight size={16} className="shrink-0 text-slate-400" />
              </button>
              <Link href={`/admin/trips?schedule=${id}`} className="flex w-full items-center gap-3 px-3.5 py-3 text-left transition hover:bg-blue-50/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><UsersRound size={17} /></span>
                <span className="min-w-0 flex-1"><span className="block text-[13px] font-bold text-slate-800">Nhân sự phụ trách chuyến</span><span className="mt-0.5 block text-[11px] text-slate-500">Điều hành & phân công nhân sự</span></span>
                <ChevronRight size={16} className="shrink-0 text-slate-400" />
              </Link>
            </div>
          ) : null}
        />
      </div>
      <IncompleteItineraryDialog days={incompleteDays} destination="quản lý lịch khởi hành" onCancel={() => setIncompleteDays(null)} onConfirm={() => { setIncompleteDays(null); void handleSave(true); }} />
      <ScheduleManifestModal
        scheduleId={Number(id)}
        open={manifestOpen}
        onClose={() => setManifestOpen(false)}
      />
      <SchedulePromotionModal
        schedule={
          !isNew
            ? ({
                tour_schedule_id: Number(id),
                price: form.prices.find((p) => p.passenger_type === "adult")?.price || 0,
                start_date: buildScheduleDateTime(form.start_date, form.start_time),
                end_date: buildScheduleDateTime(form.end_date, form.end_time),
                quota: Number(form.quota) || 0,
                status: 1,
              } as any)
            : null
        }
        tourName={tourInfo?.name || undefined}
        open={promotionOpen}
        onClose={() => setPromotionOpen(false)}
        onSaved={() => success("Đã lưu thiết lập ưu đãi cho đợt khởi hành!")}
      />
    </TourEditorShell>
  );
}
