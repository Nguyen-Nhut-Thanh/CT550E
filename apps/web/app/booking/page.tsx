"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import InlineNotice from "@/components/common/InlineNotice";
import {
  BookingContactForm,
  BookingOrderSummary,
  BookingPassengerCounts,
  BookingTourInfoCard,
  BookingTravelersList,
  BookingVoucherAndPayment,
} from "@/components/booking";

import { fetchMe, getToken } from "@/lib/client/utils/auth";
import type {
  PaymentMethod,
  TravelerForm,
  TravelerType,
  UserProfileLite,
  VoucherValidationResult,
} from "@/lib/client/utils/booking";
import {
  createBooking,
  createPaymentUrl,
  getBookingTourDetail,
  validatePublicVoucher,
} from "@/lib/client/api/bookingApi";
import { getSingleRoomSurchargeTotal } from "@/lib/client/utils/tourPricing";
import type { PublicTourDetail, TourSchedule } from "shared";

function getUnitPrice(schedule: TourSchedule | null, type: TravelerType) {
  const passengerTypeMap = {
    adult: ["ADULT", "adult"],
    child: ["CHILD", "child"],
    infant: ["INFANT", "infant"],
  } as const;
  const matchedPrice = schedule?.tour_schedule_prices?.find((item) =>
    passengerTypeMap[type].includes(item.passenger_type as never),
  );

  if (matchedPrice) {
    return Number(matchedPrice.price);
  }

  if (type === "adult") {
    return Number(schedule?.price ?? 0);
  }

  return 0;
}

function getSingleRoomSurcharge(schedule: TourSchedule | null) {
  return getSingleRoomSurchargeTotal(schedule);
}

function createEmptyTraveler(type: TravelerType): TravelerForm {
  return {
    fullName: "",
    gender: "male",
    type,
    birthday: "",
  };
}

function buildTravelers(
  adultCount: number,
  childCount: number,
  infantCount: number,
) {
  return [
    ...Array.from({ length: adultCount }, () => createEmptyTraveler("adult")),
    ...Array.from({ length: childCount }, () => createEmptyTraveler("child")),
    ...Array.from({ length: infantCount }, () => createEmptyTraveler("infant")),
  ];
}

function syncTravelers(
  current: TravelerForm[],
  adultCount: number,
  childCount: number,
  infantCount: number,
) {
  const adults = current.filter((traveler) => traveler.type === "adult");
  const children = current.filter((traveler) => traveler.type === "child");
  const infants = current.filter((traveler) => traveler.type === "infant");

  return [
    ...Array.from(
      { length: adultCount },
      (_, index) => adults[index] ?? createEmptyTraveler("adult"),
    ),
    ...Array.from(
      { length: childCount },
      (_, index) => children[index] ?? createEmptyTraveler("child"),
    ),
    ...Array.from(
      { length: infantCount },
      (_, index) => infants[index] ?? createEmptyTraveler("infant"),
    ),
  ];
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
    const total = Math.max(subtotal + singleRoomSurcharge - discount, 0);

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
    };
  }, [
    adultCount,
    childCount,
    infantCount,
    selectedSchedule,
    singleRoomSelections,
    voucherResult,
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
        travelers,
        note,
        voucher_code: voucherResult?.code,
        payment_method: paymentMethod,
        room_type: pricing.singleRoomCount > 0 ? "single" : "shared",
        single_room_surcharge: pricing.singleRoomSurcharge,
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
    <main className="min-h-screen bg-[#f6f8fb] pb-16">
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

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="space-y-6">
            <BookingTourInfoCard
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
