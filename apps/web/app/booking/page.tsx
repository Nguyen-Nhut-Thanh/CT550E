"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import type { PaymentMethod, TravelerForm, TravelerType, UserProfileLite, VoucherValidationResult, } from "shared";

import { BookingContactForm } from "@/components/booking/BookingContactForm";
import { BookingExtraServices } from "@/components/booking/BookingExtraServices";
import { BookingOrderSummary } from "@/components/booking/BookingOrderSummary";
import { BookingPassengerCounts } from "@/components/booking/BookingPassengerCounts";
import { BookingTourInfoCard } from "@/components/booking/BookingTourInfoCard";
import { BookingTravelersList } from "@/components/booking/BookingTravelersList";
import { BookingVoucherAndPayment } from "@/components/booking/BookingVoucherAndPayment";
import InlineNotice from "@/components/common/InlineNotice";

import { fetchMe, getToken } from "@/lib/auth/session";
import { createBooking, createPaymentUrl, getBookingExtraServices, getBookingTourDetail, validatePublicVoucher } from "@/lib/booking/api";
import { parseBirthday } from "@/lib/booking/birthday";
import { getSingleRoomSurchargeTotal, getUnitPrice } from "@/lib/booking/pricing";
import { buildTravelers, syncTravelers } from "@/lib/booking/travelers";
import type { BookingExtraService, PublicTourDetail, TourSchedule } from "shared";

function getSingleRoomSurcharge(schedule: TourSchedule | null) {
  return getSingleRoomSurchargeTotal(schedule);
}

function BookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tourId = searchParams.get("tourId");
  const scheduleIdParam = searchParams.get("scheduleId");

  const [loading, setLoading] = useState(true);
  const [tour, setTour] = useState<PublicTourDetail | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<TourSchedule | null>(
    null,
  );
  const [adultCount, setAdultCount] = useState(1);
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
  const [note, setNote] = useState("");
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherResult, setVoucherResult] =
    useState<VoucherValidationResult | null>(null);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("vnpay");
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitTone, setSubmitTone] = useState<"error" | "success">("success");
  const [submitting, setSubmitting] = useState(false);
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
          fetchMe(),
        ]);

        if (!active) return;

        const scheduleId = scheduleIdParam ? Number(scheduleIdParam) : null;
        const schedule =
          tourData.tour_schedules?.find(
            (item) => item.tour_schedule_id === scheduleId,
          ) ??
          tourData.tour_schedules?.[0] ??
          null;

        setTour(tourData);
        setSelectedSchedule(schedule);

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
  }, [scheduleIdParam, tourId]);

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
    const discount = voucherResult?.discountAmount || 0;
    const servicesTotal = extraServices.filter(service => selectedExtraIds.includes(service.id))
      .reduce((total, service) => total + service.unit_price * (service.pricing_unit === "guest" ? adultCount + childCount + infantCount : 1), 0);
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
  ]);

  const seatsLeft = useMemo(() => {
    if (!selectedSchedule) return 0;
    return Math.max(selectedSchedule.quota - selectedSchedule.booked_count, 0);
  }, [selectedSchedule]);

  const totalGuests = adultCount + childCount + infantCount;

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      setVoucherError("Nhập mã giảm giá trước khi áp dụng.");
      setVoucherResult(null);
      return;
    }

    try {
      setVoucherLoading(true);
      setVoucherError(null);
      const data = await validatePublicVoucher(
        voucherCode.trim(),
        pricing.subtotal,
      );
      setVoucherResult({
        voucher_id: data.voucher_id,
        code: data.code,
        discountAmount: Number(data.discount_amount || 0),
        finalAmount:
          data.final_amount != null ? Number(data.final_amount) : undefined,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Không thể áp dụng mã giảm giá.";
      setVoucherResult(null);
      setVoucherError(message);
    } finally {
      setVoucherLoading(false);
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

  const handleSubmitBooking = async () => {
    if (!selectedSchedule || !tour) return;

    const invalidBirthday = travelers.findIndex(traveler => parseBirthday(traveler.birthday) === null);
    if (invalidBirthday !== -1) {
      setSubmitTone("error");
      setSubmitMessage(`Ngày sinh hành khách ${invalidBirthday + 1} không hợp lệ. Vui lòng nhập dd/mm/yyyy.`);
      return;
    }

    if (seatsLeft < totalGuests) {
      setSubmitTone("error");
      setSubmitMessage(
        "Số khách đang vượt quá chỗ trống của lịch khởi hành này.",
      );
      return;
    }

    if (!contactName.trim() || !contactEmail.trim() || !contactPhone.trim()) {
      setSubmitTone("error");
      setSubmitMessage(
        "Vui lòng điền đầy đủ thông tin liên hệ trước khi tiếp tục.",
      );
      return;
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

    try {
      setSubmitting(true);
      setSubmitMessage(null);

      const data = await createBooking({
        tour_schedule_id: selectedSchedule.tour_schedule_id,
        contact_name: contactName,
        contact_phone: contactPhone,
        contact_email: contactEmail,
        adult_count: adultCount,
        child_count: childCount,
        infant_count: infantCount,
        travelers: travelers.map(traveler => ({ ...traveler, birthday: parseBirthday(traveler.birthday) || "" })),
        note,
        voucher_code: voucherResult?.code,
        payment_method: paymentMethod,
        room_type: pricing.singleRoomCount > 0 ? "single" : "shared",
        single_room_surcharge: pricing.singleRoomSurcharge,
        single_room_count: pricing.singleRoomCount,
        additional_service_ids: selectedExtraIds,
      });

      if (data) {
        setSubmitTone("success");
        setSubmitMessage("Đặt tour thành công! Đang khởi tạo thanh toán...");

        sessionStorage.removeItem("booking_draft");

        if (paymentMethod === "vnpay" && (data.booking_id || data.id)) {
          const bId = Number(data.booking_id || data.id);

          try {
            const payData = await createPaymentUrl(bId, pricing.total);

            if (payData.paymentUrl) {
              window.location.href = payData.paymentUrl;
              return;
            } else {
              throw new Error("Không nhận được URL thanh toán");
            }
          } catch {
            setSubmitTone("error");
            setSubmitMessage(
              "Không thể khởi tạo VNPay. Bạn có thể thanh toán lại trong mục Quản lý đơn hàng.",
            );
            setTimeout(() => router.push("/account"), 3000);
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
    } catch {
      setSubmitTone("error");
      setSubmitMessage(
        "Lỗi kết nối máy chủ. Vui lòng kiểm tra mạng và thử lại.",
      );
    } finally {
      setSubmitting(false);
    }
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
                setSelectedSchedule(schedule);
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
              onContactNameChange={setContactName}
              onContactPhoneChange={setContactPhone}
              onContactEmailChange={setContactEmail}
              onNoteChange={setNote}
            />

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

            <BookingVoucherAndPayment
              voucherCode={voucherCode}
              voucherLoading={voucherLoading}
              voucherResult={voucherResult}
              voucherError={voucherError}
              paymentMethod={paymentMethod}
              onVoucherCodeChange={(code) => {
                setVoucherCode(code);
                setVoucherError(null);
                setVoucherResult(null);
              }}
              onApplyVoucher={handleApplyVoucher}
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
            submitting={submitting}
            onSubmitBooking={handleSubmitBooking}
          />
        </div>
      </div>
      </div>
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
