"use client";

import { ScheduleBasicInfoCard } from "@/components/admin/schedules/editor/ScheduleBasicInfoCard";
import { ScheduleDepartureCard } from "@/components/admin/schedules/editor/ScheduleDepartureCard";
import { ScheduleAmenitiesCard } from "@/components/admin/schedules/editor/ScheduleAmenitiesCard";
import { ScheduleAttractionsCard } from "@/components/admin/schedules/editor/ScheduleAttractionsCard";
import Link from 'next/link';
import { getAdminLocations } from "@/lib/admin/locations/api";
import { ScheduleItinerarySection } from "@/components/admin/schedules/editor/ScheduleItinerarySection";
import { ScheduleSidebar } from "@/components/admin/schedules/editor/ScheduleSidebar";
import { TourEditorShell } from "@/components/admin/tours/editor/TourEditorShell";
import {
  getAdminCatalogTransports,
  getAdminHotels,
  getHotelRoomTypes,
} from "@/lib/admin/catalogs/api";
import {
  getAdminScheduleDetail,
  saveAdminSchedule,
} from "@/lib/admin/schedules/api";
import {
  buildScheduleFormFromResponse,
  buildSchedulePayload,
  createDefaultScheduleForm,
  createEmptyPickupPoint,
  ensureItineraryDays,
} from "@/lib/admin/schedules/forms";
import { getAdminTourDetail } from "@/lib/admin/tours/api";
import { useToast } from "@/lib/notifications/useToast";
import { Loader2 } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  HotelItem,
  LocationOption,
  RoomTypeItem,
  ScheduleDetailResponse,
  TourInfo,
  TransportItem,
} from "shared";
import { copyTourAmenities } from 'shared';

export default function AdminScheduleDetailPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { success, error: showError } = useToast();
  const isNew = id === "new";
  const tourId = searchParams.get("tourId");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [tourInfo, setTourInfo] = useState<TourInfo | null>(null);
  const [hasBookings, setHasBookings] = useState(false);
  const [bookedCount, setBookedCount] = useState(0);
  const [originalQuota, setOriginalQuota] = useState(0);
  const [hotels, setHotels] = useState<HotelItem[]>([]);
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [transports, setTransports] = useState<TransportItem[]>([]);
  const [roomTypesMap, setRoomTypesMap] = useState<
    Record<number, RoomTypeItem[]>
  >({});
  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  const [form, setForm] = useState(createDefaultScheduleForm);

  const isPast = useMemo(() => {
    if (isNew || !form.start_date) return false;

    try {
      const startDt = new Date(
        `${form.start_date}T${form.start_time || "00:00"}:00`,
      );
      return startDt.getTime() < Date.now();
    } catch {
      return false;
    }
  }, [form.start_date, form.start_time, isNew]);

  const fetchRoomTypes = useCallback(async (hotelId: number) => {
    try {
      const data = await getHotelRoomTypes<RoomTypeItem>(hotelId);
      setRoomTypesMap((prev) =>
        prev[hotelId] ? prev : { ...prev, [hotelId]: data },
      );
    } catch {}
  }, []);

  useEffect(() => {
    const initPage = async () => {
      setLoading(true);
      setLoadError("");

      try {
        const [hotelData, transportData, locationData] = await Promise.all([
          getAdminHotels<HotelItem>(),
          getAdminCatalogTransports<TransportItem>(),
          getAdminLocations<LocationOption>(),
        ]);

        setHotels(hotelData);
        setLocations(locationData.items || []);
        setTransports(transportData);

        let currentTourId = tourId;
        let scheduleData: ScheduleDetailResponse | null = null;

        if (!isNew) {
          scheduleData = await getAdminScheduleDetail<ScheduleDetailResponse>(
            String(id),
          );
          currentTourId = scheduleData.tour_id
            ? String(scheduleData.tour_id)
            : currentTourId;
          const booked = Boolean(scheduleData.hasBookings ?? Number(scheduleData.booked_count || 0) > 0);
          setHasBookings(booked);
          setBookedCount(Number(scheduleData.booked_count || 0));
          setOriginalQuota(Number(scheduleData.quota || 0));

          const restored = buildScheduleFormFromResponse(scheduleData);
          const hotelIds = new Set(restored.itinerary.map(day => Number(day.hotel_id)).filter(Boolean));
          await Promise.all([...hotelIds].map(fetchRoomTypes));
          const locked = booked || Date.parse(scheduleData.start_date || "") < Date.now();
          setForm(!locked && !restored.pickup_points.length
            ? { ...restored, pickup_points: [createEmptyPickupPoint(restored)] }
            : restored);
        } else {
          setForm(createDefaultScheduleForm());
        }

        if (!currentTourId) throw new Error("Vui lòng chọn tour trước khi thêm lịch khởi hành.");
        if (currentTourId) {
          const tourData = await getAdminTourDetail<TourInfo>(currentTourId);
          setTourInfo(tourData.tour);
          if (isNew) setForm(prev => ({ ...prev, departure_location_id: tourData.tour.departure_location || "",
            tour_schedule_amenities: copyTourAmenities(tourData.tour.tour_amenities || []),
          }));
        }
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : "Không thể tải thông tin lịch khởi hành.");
      } finally {
        setLoading(false);
      }
    };

    void initPage();
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

  const handleSave = async () => {
    if (saving || uploading || isPast || loadError) return;
    const incompleteHotel = form.itinerary.find(day => Boolean(day.hotel_id) !== Boolean(day.room_type_id));
    if (incompleteHotel) { showError(`Ngày ${incompleteHotel.day_number}: vui lòng chọn đủ khách sạn và loại phòng trước khi lưu.`); return; }
    if (form.itinerary.some(day => (day.activities || []).some(activity => !/^([01]\d|2[0-3]):[0-5]\d$/.test(activity.time) || !activity.title.trim()))) {
      showError("Vui lòng nhập giờ và tiêu đề cho tất cả hoạt động trong lịch trình."); return;
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
      `${form.start_date}T${form.start_time || "00:00"}:00`,
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

    setSaving(true);

    try {
      const data = (await saveAdminSchedule(
        isNew
          ? `/admin/tours/${tourId}/schedules`
          : `/admin/tours/schedules/${id}`,
        isNew ? "POST" : "PATCH",
        buildSchedulePayload(form),
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
          {!isNew && <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-white p-5"><div><h2 className="font-bold text-slate-900">Nhân sự phụ trách chuyến</h2><p className="mt-1 text-xs text-slate-500">Chọn miền điều hành, hướng dẫn viên và trưởng đoàn trong phần điều hành.</p></div><Link href="/admin/workforce?tab=trips" className="rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-700">Phân công nhân sự</Link></div>}

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
          onSave={handleSave}
          onUploadingChange={setUploading}
          onFormChange={setForm}
        />
      </div>
    </TourEditorShell>
  );
}
