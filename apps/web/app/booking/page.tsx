"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { BookingMemberVouchers } from "@/components/booking/vouchers/BookingMemberVouchers";
import { getMembership } from "@/lib/membership/api";
import { getMemberDetails } from "@/lib/admin/membership/api";
import { ConfirmDialog } from "@/components/common/overlays/ConfirmDialog";
import { isValidCitizenId, isValidEmail, isValidVietnamesePhone, membershipPrice, type MembershipTier, type ScheduleConflict } from "shared";
import type { PaymentMethod, TravelerForm, TravelerType, UserProfileLite, VoucherValidationResult, } from "shared";

import { BookingContactForm } from "@/components/booking/checkout/BookingContactForm";
import { BookingExtraServices } from "@/components/booking/checkout/BookingExtraServices";
import { BookingOrderSummary } from "@/components/booking/checkout/BookingOrderSummary";
import { BookingPassengerCounts } from "@/components/booking/checkout/BookingPassengerCounts";
import { BookingTourInfoCard } from "@/components/booking/checkout/BookingTourInfoCard";
import { BookingTravelersList } from "@/components/booking/checkout/BookingTravelersList";
import { BookingVoucherAndPayment } from "@/components/booking/vouchers/BookingVoucherAndPayment";
import InlineNotice from "@/components/common/feedback/InlineNotice";

import { fetchMe, getToken } from "@/lib/auth/session";
import { getStaffBookingCustomer, createBooking, createPaymentUrl, getBookingExtraServices, getBookingTourDetail, validatePublicVoucher, checkBookingConflicts } from "@/lib/booking/api";
import { parseBirthday } from "@/lib/booking/birthday";
import { getSingleRoomSurchargeTotal, getUnitPrice } from "@/lib/booking/pricing";
import { resolveBookingDeparture, resolvePickupPoint } from '@/lib/booking/departure';
import { buildTravelers, syncTravelers } from "@/lib/booking/travelers";
import type { BookingExtraService, PublicTourDetail, TourSchedule } from "shared";

function getSingleRoomSurcharge(schedule: TourSchedule | null) {
  return getSingleRoomSurchargeTotal(schedule);
}

function BookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tourId = searchParams.get("tourId");
  const customerId = Number(searchParams.get("customerId")) || undefined;
  const scheduleIdParam = searchParams.get("scheduleId");
  const pickupPointIdParam = searchParams.get('pickupPointId');

  const [loading, setLoading] = useState(true);
  const [memberTier, setMemberTier] = useState<MembershipTier | null>(null);
  const [membershipError, setMembershipError] = useState(false);
  const [membershipLoading, setMembershipLoading] = useState(true);
  const [membershipRevision, setMembershipRevision] = useState(0);
  useEffect(() => {
    let active = true;
    if (!customerId && !getToken()) { setMemberTier(null); setMembershipLoading(false); return; }
    setMemberTier(null); setMembershipLoading(true); setMembershipError(false);
    (customerId ? getMemberDetails(customerId) : getMembership()).then(result => { if (active) setMemberTier(result.tier); }).catch(() => { if (active) setMembershipError(true); }).finally(() => { if (active) setMembershipLoading(false); });
    return () => { active = false; };
  }, [customerId, membershipRevision]);
  const [tour, setTour] = useState<PublicTourDetail | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<TourSchedule | null>(
    null,
  );
  const [adultCount, setAdultCount] = useState(1);
  const [pickupPointId, setPickupPointId] = useState<number | "">("");
  const [editingPickup, setEditingPickup] = useState(false);
  const [childCount, setChildCount] = useState(0);
  const [infantCount, setInfantCount] = useState(0);
  const [singleRoomSelections, setSingleRoomSelections] = useState<boolean[]>([
    false,
  ]);
  const [travelers, setTravelers] = useState<TravelerForm[]>(
    buildTravelers(1, 0, 0),
  );
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactErrors, setContactErrors] = useState<{
    name?: string;
    phone?: string;
    email?: string;
  }>({});
  const [conflictList, setConflictList] = useState<ScheduleConflict[]>([]);
  const [conflictModalOpen, setConflictModalOpen] = useState(false);
  const [note, setNote] = useState("");
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherPickerOpen, setVoucherPickerOpen] = useState(false);
  const voucherRequest = useRef(0);
  const [voucherResult, setVoucherResult] =
    useState<VoucherValidationResult | null>(null);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("vnpay");
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitTone, setSubmitTone] = useState<"error" | "success">("success");
  const [submitting, setSubmitting] = useState(false);
  const submitInFlight = useRef(false);
  const createdBookingId = useRef<number | null>(null);
  const [extraServices, setExtraServices] = useState<BookingExtraService[]>([]);
  const [selectedExtraIds, setSelectedExtraIds] = useState<string[]>([]);
  const [extrasLoading, setExtrasLoading] = useState(true);
  const [extrasError, setExtrasError] = useState(false);
  async function loadExtras() {
    setExtrasLoading(true); setExtrasError(false);
    try { setExtraServices(await getBookingExtraServices()); }
    catch { setExtrasError(true); }
    finally { setExtrasLoading(false); }
  }
  useEffect(() => { void loadExtras(); }, []);

  useEffect(() => {
    if (!tourId) {
      setLoading(false);
      return;
    }

    let active = true;

    const loadData = async () => {
      try {
        setLoading(true);
        const [tourData, me] = await Promise.all([
          getBookingTourDetail(tourId),
          customerId ? getStaffBookingCustomer(customerId) : fetchMe(),
        ]);

        if (!active) return;

        const { schedule, pickup } = resolveBookingDeparture(tourData.tour_schedules || [], scheduleIdParam, pickupPointIdParam);

        setTour(tourData);
        setSelectedSchedule(schedule);
        setPickupPointId(pickup?.pickup_point_id ?? '');
        setEditingPickup(false);

        if (me) {
          const profile = me as UserProfileLite;
          setContactName(profile.full_name || "");
          setContactEmail(profile.email || "");
          setContactPhone(profile.phone || "");
        }
      } catch {
        if (!active) return;
        setTour(null);
        setSelectedSchedule(null);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      active = false;
    };
  }, [scheduleIdParam, pickupPointIdParam, tourId, customerId]);

  useEffect(() => {
    setTravelers((current) =>
      syncTravelers(current, adultCount, childCount, infantCount),
    );
  }, [adultCount, childCount, infantCount]);

  useEffect(() => {
    setSingleRoomSelections((current) =>
      Array.from({ length: adultCount }, (_, index) => current[index] ?? false),
    );
  }, [adultCount]);

  const pricing = useMemo(() => {
    const adultUnitPrice = getUnitPrice(selectedSchedule, "adult");
    const childUnitPrice = getUnitPrice(selectedSchedule, "child");
    const infantUnitPrice = getUnitPrice(selectedSchedule, "infant");
    const singleRoomUnitPrice = getSingleRoomSurcharge(selectedSchedule);
    const singleRoomCount = singleRoomSelections.filter(Boolean).length;
    const singleRoomSurcharge = singleRoomUnitPrice * singleRoomCount;
    const subtotal =
      adultUnitPrice * adultCount +
      childUnitPrice * childCount +
      infantUnitPrice * infantCount;
    const voucherDiscount = voucherResult?.discountAmount || 0;
    const servicesTotal = extraServices.filter(service => selectedExtraIds.includes(service.id))
      .reduce((total, service) => total + service.unit_price * (service.pricing_unit === "guest" ? adultCount + childCount + infantCount : 1), 0);
    const { tourDiscount, serviceDiscount } = membershipPrice(memberTier, subtotal, servicesTotal, voucherDiscount);
    const discount = voucherDiscount + tourDiscount + serviceDiscount;
    const total = Math.max(subtotal + singleRoomSurcharge + servicesTotal - discount, 0);

    return {
      adultUnitPrice,
      childUnitPrice,
      infantUnitPrice,
      singleRoomUnitPrice,
      singleRoomCount,
      singleRoomSurcharge,
      subtotal,
      discount,
      total,
      servicesTotal,
      voucherDiscount, tourDiscount, serviceDiscount, membershipName: memberTier?.name,
    };
  }, [
    adultCount,
    childCount,
    infantCount,
    selectedSchedule,
    singleRoomSelections,
    voucherResult,
    extraServices,
    selectedExtraIds,
    memberTier,
  ]);

  const seatsLeft = useMemo(() => {
    if (!selectedSchedule) return 0;
    return Math.max(selectedSchedule.quota - selectedSchedule.booked_count, 0);
  }, [selectedSchedule]);

  const totalGuests = adultCount + childCount + infantCount;

  useEffect(() => {
    voucherRequest.current++;
    setVoucherResult(null);
    setVoucherError(null);
    setVoucherLoading(false);
  }, [pricing.subtotal, selectedSchedule?.tour_schedule_id]);

  const handleApplyVoucher = async (selectedCode = voucherCode) => {
    const requestId = ++voucherRequest.current;
    setVoucherCode(selectedCode);
    if (!selectedCode.trim()) {
      setVoucherError("Nhập mã giảm giá trước khi áp dụng.");
      setVoucherResult(null);
      return false;
    }

    try {
      setVoucherLoading(true);
      setVoucherError(null);
      const data = await validatePublicVoucher(
        selectedCode.trim(),
        pricing.subtotal,
        customerId,
      );
      if (requestId !== voucherRequest.current) return false;
      setVoucherResult({
        voucher_id: data.voucher_id,
        code: data.code,
        discountAmount: Number(data.discount_amount || 0),
        finalAmount:
          data.final_amount != null ? Number(data.final_amount) : undefined,
      });
      return true;
    } catch (error) {
      if (requestId !== voucherRequest.current) return false;
      const message =
        error instanceof Error ? error.message : "Không thể áp dụng mã giảm giá.";
      setVoucherResult(null);
      setVoucherError(message);
      return false;
    } finally {
      if (requestId === voucherRequest.current) setVoucherLoading(false);
    }
  };

  const updateTraveler = (
    index: number,
    field: keyof TravelerForm,
    value: string,
  ) => {
    setTravelers((current) =>
      current.map((traveler, travelerIndex) =>
        travelerIndex === index ? { ...traveler, [field]: value } : traveler,
      ),
    );
  };

  const updateSingleRoomSelection = (adultIndex: number, checked: boolean) => {
    setSingleRoomSelections((current) =>
      current.map((item, index) => (index === adultIndex ? checked : item)),
    );
  };

  const handleCountChange = (type: TravelerType, delta: number) => {
    if (delta > 0 && totalGuests >= seatsLeft) {
      setSubmitTone("error");
      setSubmitMessage(`Tour hiện tại chỉ còn ${seatsLeft} chỗ trống.`);
      return;
    }

    if (submitTone === "error" && submitMessage) {
      setSubmitMessage(null);
    }

    if (type === "adult") {
      setAdultCount((current) => Math.max(1, current + delta));
      return;
    }

    if (type === "child") {
      setChildCount((current) => Math.max(0, current + delta));
      return;
    }

    setInfantCount((current) => Math.max(0, current + delta));
  };

  const executeBooking = async (confirmedConflict: boolean) => {
    if (!selectedSchedule || !tour) return;
    try {
      submitInFlight.current = true;
      setSubmitting(true);
      setSubmitMessage(null);

      const data = await createBooking(
        {
          tour_schedule_id: selectedSchedule.tour_schedule_id,
          pickup_point_id: pickupPointId || undefined,
          contact_name: contactName,
          contact_phone: contactPhone,
          contact_email: contactEmail,
          confirmed_schedule_conflict: confirmedConflict,
          adult_count: adultCount,
          child_count: childCount,
          infant_count: infantCount,
          travelers: travelers.map((traveler) => ({
            ...traveler,
            idNumber: traveler.idNumber?.trim() || undefined,
            birthday: parseBirthday(traveler.birthday) || "",
          })),
          note,
          voucher_code: voucherResult?.code,
          payment_method: paymentMethod,
          room_type: pricing.singleRoomCount > 0 ? "single" : "shared",
          single_room_surcharge: pricing.singleRoomSurcharge,
          single_room_count: pricing.singleRoomCount,
          additional_service_ids: selectedExtraIds,
        },
        customerId,
      );
      const savedId = Number(data.booking_id || data.id);
      if (Number.isSafeInteger(savedId) && savedId > 0) createdBookingId.current = savedId;

      if (data && customerId) {
        router.push("/admin/chats");
        return;
      }
      if (data) {
        setSubmitTone("success");
        setSubmitMessage("Đặt tour thành công! Đang khởi tạo thanh toán...");

        sessionStorage.removeItem("booking_draft");

        if (paymentMethod === "vnpay" && (data.booking_id || data.id)) {
          const bId = Number(data.booking_id || data.id);

          try {
            const payData = await createPaymentUrl(bId);

            if (payData.paymentUrl) {
              window.location.href = payData.paymentUrl;
              return;
            } else {
              throw new Error("Không nhận được URL thanh toán");
            }
          } catch {
            setSubmitTone("error");
            setSubmitMessage(
              "Đơn đặt tour đã được lưu. Bạn có thể thanh toán VNPay tại trang chi tiết đơn.",
            );
            router.replace(`/booking/${bId}`);
            return;
          }
        }

        setSubmitMessage(
          "Đặt tour thành công! Cảm ơn bạn. Đang chuyển hướng...",
        );
        setTimeout(() => {
          router.push("/account");
        }, 2000);
      }
    } catch (error: any) {
      if (error?.conflicts?.length) {
        setConflictList(error.conflicts);
        setConflictModalOpen(true);
        return;
      }
      setSubmitTone("error");
      setSubmitMessage(
        error instanceof Error ? error.message : "Không thể đặt tour. Vui lòng thử lại.",
      );
    } finally {
      submitInFlight.current = false;
      setSubmitting(false);
    }
  };

  const handleSubmitBooking = async () => {
    if (createdBookingId.current) { router.push(`/booking/${createdBookingId.current}`); return; }
    if (submitInFlight.current) return;
    if (membershipLoading || membershipError || voucherLoading) return;
    if (!selectedSchedule || !tour) return;
    if (selectedSchedule.pickup_points?.length && !pickupPointId) {
      setSubmitTone("error"); setSubmitMessage("Vui lòng chọn điểm đón trước khi đặt tour."); return;
    }

    if (seatsLeft < totalGuests) {
      setSubmitTone("error");
      setSubmitMessage(
        "Số khách đang vượt quá chỗ trống của lịch khởi hành này.",
      );
      return;
    }

    // 1. Kiểm tra tính hợp lệ của thông tin liên hệ
    const nextErrors: { name?: string; phone?: string; email?: string } = {};
    if (!contactName.trim()) nextErrors.name = "Vui lòng nhập họ và tên liên hệ.";
    if (!contactPhone.trim()) nextErrors.phone = "Vui lòng nhập số điện thoại.";
    else if (!isValidVietnamesePhone(contactPhone)) nextErrors.phone = "Số điện thoại không đúng định dạng (VD: 0912345678).";
    if (!contactEmail.trim()) nextErrors.email = "Vui lòng nhập email nhận xác nhận.";
    else if (!isValidEmail(contactEmail)) nextErrors.email = "Email không đúng định dạng (VD: example@domain.com).";

    setContactErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setSubmitTone("error");
      setSubmitMessage("Vui lòng kiểm tra và điền chính xác thông tin liên hệ.");
      return;
    }

    // 2. Kiểm tra ngày sinh và CCCD của từng hành khách
    const invalidBirthday = travelers.findIndex(traveler => parseBirthday(traveler.birthday) === null);
    if (invalidBirthday !== -1) {
      setSubmitTone("error");
      setSubmitMessage(`Ngày sinh hành khách ${invalidBirthday + 1} không hợp lệ. Vui lòng nhập dd/mm/yyyy.`);
      return;
    }

    for (let index = 0; index < travelers.length; index += 1) {
      const traveler = travelers[index];
      if (!traveler.fullName.trim()) {
        setSubmitTone("error");
        setSubmitMessage(`Vui lòng nhập họ và tên cho hành khách ${index + 1}.`);
        return;
      }
      if (traveler.type === "adult") {
        const travelerId = traveler.idNumber?.trim() || "";
        if (!travelerId) {
          setSubmitTone("error");
          setSubmitMessage(`Hành khách ${index + 1} (${traveler.fullName || 'người lớn'}) cần có số CCCD.`);
          return;
        }
        if (!isValidCitizenId(travelerId)) {
          setSubmitTone("error");
          setSubmitMessage(`Số CCCD của hành khách ${index + 1} (${traveler.fullName}) phải gồm 9 hoặc 12 chữ số.`);
          return;
        }
      }
    }

    const token = getToken();
    if (!token) {
      router.push(
        `/login?callbackUrl=${encodeURIComponent(
          `/booking?tourId=${tour.tour_id}&scheduleId=${selectedSchedule.tour_schedule_id}`,
        )}`,
      );
      return;
    }

    // 3. Kiểm tra trùng lịch khởi hành giữa các tour
    try {
      const conflictRes = await checkBookingConflicts({
        tour_schedule_id: selectedSchedule.tour_schedule_id,
        travelers: travelers.map((t) => ({
          fullName: t.fullName,
          idNumber: t.idNumber?.trim() || undefined,
        })),
      });

      if (conflictRes.hasConflict && conflictRes.conflicts.length > 0) {
        setConflictList(conflictRes.conflicts);
        setConflictModalOpen(true);
        return;
      }
    } catch {
      // Nếu check endpoint có lỗi, createBooking phía server vẫn sẽ bắt và ném conflict
    }

    await executeBooking(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f8fb]">
        <Loader2 className="h-10 w-10 animate-spin text-sky-600" />
      </div>
    );
  }

  if (!tour || !selectedSchedule) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f8fb] px-4">
        <div className="rounded-2xl border border-slate-200 bg-white px-8 py-10 text-center shadow-sm">
          <p className="text-lg font-semibold text-slate-900">
            Không có dữ liệu booking phù hợp.
          </p>
          <Link
            href="/tours"
            className="mt-4 inline-flex rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white"
          >
            Quay lại danh sách tour
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5fbfc] pb-16">
      <div className="bg-[#f5fbfc]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex min-w-0 items-center gap-2 overflow-hidden text-sm font-medium text-slate-500">
          <Link href="/" className="shrink-0 transition hover:text-sky-700">
            Trang chủ
          </Link>
          <span className="shrink-0">/</span>
          <Link
            href="/tours"
            className="shrink-0 transition hover:text-sky-700"
          >
            Tour
          </Link>
          <span className="shrink-0">/</span>
          <Link
            href={`/tours/${tour.tour_id}`}
            className="truncate transition hover:text-sky-700"
          >
            {tour.name}
          </Link>
          <span className="shrink-0">/</span>
          <span className="shrink-0 text-slate-800">Booking</span>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="space-y-6">
            <BookingTourInfoCard
              adultUnitPrice={pricing.adultUnitPrice}
              tour={tour}
              selectedSchedule={selectedSchedule}
              seatsLeft={seatsLeft}
            />

            {!getToken() && (
              <InlineNotice tone="error">
                Bạn chưa đăng nhập. Trang này vẫn cho phép nhập thông tin trước,
                nhưng để giữ chỗ và thanh toán bạn sẽ cần đăng nhập.
              </InlineNotice>
            )}

            {submitMessage && (
              <InlineNotice tone={submitTone}>{submitMessage}</InlineNotice>
            )}

            <BookingPassengerCounts
              schedules={tour.tour_schedules || []}
              selectedSchedule={selectedSchedule}
              onScheduleChange={(schedule) => {
                if (schedule.tour_schedule_id === selectedSchedule.tour_schedule_id) return;
                setSelectedSchedule(schedule);
                setPickupPointId(resolvePickupPoint(schedule)?.pickup_point_id ?? '');
                setEditingPickup(false);
                setVoucherResult(null);
                setVoucherError(null);
                setSubmitMessage(null);
              }}
              adultCount={adultCount}
              childCount={childCount}
              infantCount={infantCount}
              totalGuests={totalGuests}
              adultUnitPrice={pricing.adultUnitPrice}
              childUnitPrice={pricing.childUnitPrice}
              infantUnitPrice={pricing.infantUnitPrice}
              onCountChange={handleCountChange}
            />

            <BookingContactForm
              contactName={contactName}
              contactPhone={contactPhone}
              contactEmail={contactEmail}
              note={note}
              errors={contactErrors}
              onContactNameChange={(val) => {
                setContactName(val);
                setContactErrors((prev) => ({ ...prev, name: undefined }));
                if (!travelers[0]?.fullName || travelers[0]?.fullName === contactName) {
                  updateTraveler(0, "fullName", val);
                }
              }}
              onContactPhoneChange={(val) => {
                setContactPhone(val);
                setContactErrors((prev) => ({ ...prev, phone: undefined }));
              }}
              onContactEmailChange={(val) => {
                setContactEmail(val);
                setContactErrors((prev) => ({ ...prev, email: undefined }));
              }}
              onNoteChange={setNote}
            />

            {!!selectedSchedule.pickup_points?.length && <section className="space-y-3 rounded-2xl border border-blue-100 bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-slate-900">{pickupPointId ? 'Điểm đón đã chọn' : 'Chọn điểm đón'}</h2>
                {!!pickupPointId && selectedSchedule.pickup_points.length > 1 && <button type="button" onClick={() => setEditingPickup(value => !value)} className="text-sm font-semibold text-blue-600">{editingPickup ? 'Đóng' : 'Thay đổi'}</button>}
              </div>
              <p className="text-sm text-slate-500">Áp dụng cho tất cả hành khách trong đơn đặt này.</p>
              {(!pickupPointId || editingPickup) && <select id="booking-pickup" aria-label="Điểm đón của bạn" required value={pickupPointId} onChange={e => { setPickupPointId(e.target.value ? Number(e.target.value) : ''); setEditingPickup(false); }}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm">
                <option value="">Chọn điểm đón của bạn</option>
                {selectedSchedule.pickup_points.map(point => <option key={point.pickup_point_id} value={point.pickup_point_id}>
                  {point.name} — {new Date(point.pickup_at).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
                </option>)}
              </select>}
              {selectedSchedule.pickup_points.filter(point => point.pickup_point_id === pickupPointId).map(point => <div key={point.pickup_point_id} className="rounded-xl bg-sky-50 p-3 text-sm text-slate-700">
                <p className="font-semibold">{point.name}</p>
                <p>{point.address}</p>
                <p>Có mặt lúc {new Date(point.pickup_at).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</p>
                {point.note && <p className="mt-1">{point.note}</p>}
              </div>)}
            </section>}

            <BookingTravelersList
              travelers={travelers}
              selectedSchedule={selectedSchedule}
              singleRoomSelections={singleRoomSelections}
              singleRoomUnitPrice={pricing.singleRoomUnitPrice}
              getUnitPrice={getUnitPrice}
              onUpdateTraveler={updateTraveler}
              onUpdateSingleRoomSelection={updateSingleRoomSelection}
            />

            <BookingExtraServices services={extraServices} selectedIds={selectedExtraIds} onChange={setSelectedExtraIds}
              loading={extrasLoading} error={extrasError} onRetry={() => void loadExtras()} />

            {membershipError && <InlineNotice tone="error">Không thể tải ưu đãi hội viên. <button type="button" onClick={() => setMembershipRevision(value => value + 1)} className="underline">Thử lại</button></InlineNotice>}
            {voucherPickerOpen && getToken() && !customerId && <BookingMemberVouchers subtotal={pricing.subtotal} total={pricing.total} disabled={voucherLoading || submitting} selectedCode={voucherResult?.code ?? null} selectionError={voucherError} onSelect={handleApplyVoucher} onClose={() => setVoucherPickerOpen(false)} />}

            <BookingVoucherAndPayment
              voucherCode={voucherCode}
              voucherLoading={voucherLoading}
              voucherResult={voucherResult}
              voucherError={voucherError}
              paymentMethod={paymentMethod}
              onVoucherCodeChange={(code) => {
                voucherRequest.current++;
                setVoucherLoading(false);
                setVoucherCode(code);
                setVoucherError(null);
                setVoucherResult(null);
              }}
              onApplyVoucher={() => void handleApplyVoucher()}
              onOpenAvailableVouchers={getToken() && !customerId ? () => { setVoucherError(null); setVoucherPickerOpen(true); } : undefined}
              availableVouchersOpen={voucherPickerOpen}
              onPaymentMethodChange={setPaymentMethod}
            />
          </section>

          <BookingOrderSummary
            tour={tour}
            selectedSchedule={selectedSchedule}
            adultCount={adultCount}
            childCount={childCount}
            infantCount={infantCount}
            totalGuests={totalGuests}
            pricing={pricing}
            submitting={submitting || membershipLoading || membershipError || voucherLoading}
            onSubmitBooking={handleSubmitBooking}
          />
        </div>
      </div>
      </div>

      <ConfirmDialog
        open={conflictModalOpen}
        icon={<AlertTriangle className="h-8 w-8 text-amber-500" />}
        title="Xác nhận trùng lịch trình tour"
        description={
          (conflictList || [])
            .map(
              (c) =>
                `• Hành khách ${c.travelerName} (CCCD: ${c.idNumber}) hiện đang có chuyến đi "${c.tourName}" từ ngày ${c.startDate} đến ngày ${c.endDate}.`,
            )
            .join("\n") +
          "\n\nLịch trình tour này trùng với tour đã đặt trước đó. Bạn có xác nhận vẫn muốn tiếp tục đặt tour không?"
        }
        confirmLabel="Xác nhận vẫn muốn đặt"
        cancelLabel="Kiểm tra lại"
        confirmClassName="bg-amber-600 hover:bg-amber-700 shadow-amber-200"
        onCancel={() => setConflictModalOpen(false)}
        onConfirm={async () => {
          setConflictModalOpen(false);
          await executeBooking(true);
        }}
      />
    </main>
  );
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f6f8fb]">
          <Loader2 className="h-10 w-10 animate-spin text-sky-600" />
        </div>
      }
    >
      <BookingContent />
    </Suspense>
  );
}
