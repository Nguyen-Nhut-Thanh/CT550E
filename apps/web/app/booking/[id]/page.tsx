"use client";

import { BookingDetailView } from "@/components/booking/BookingDetailView";
import { getBookingDetail } from "@/lib/booking/api";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { BookingDetail } from "shared";

export default function BookingDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(""); setBooking(null);
    if (!Number.isSafeInteger(id) || id <= 0) {
      setError("Mã booking không hợp lệ."); setLoading(false); return;
    }
    getBookingDetail(id, controller.signal).then(data => {
      if (!controller.signal.aborted) {
        if (data) setBooking(data);
        else setError("Không tìm thấy booking hoặc bạn không có quyền xem đơn này.");
      }
    }).catch(err => {
      if (!controller.signal.aborted) setError(err instanceof Error ? err.message : "Không thể tải booking.");
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [id, attempt]);
  if (loading || error || !booking) return <div className="flex min-h-[65vh] items-center justify-center bg-sky-50 px-5"><div role={error ? "alert" : "status"} className="max-w-md rounded-3xl border border-blue-100 bg-white p-10 text-center">
    {loading ? <><Loader2 className="mx-auto mb-4 animate-spin text-blue-600" size={36} /><p>Đang tải chi tiết booking...</p></> : <><AlertCircle className="mx-auto mb-4 text-rose-500" size={36} /><h1 className="text-xl font-bold">Chưa thể hiển thị booking</h1><p className="my-4 text-sm text-slate-500">{error}</p><button type="button" onClick={() => setAttempt(value => value + 1)} className="mb-5 rounded-full bg-blue-600 px-6 py-2 text-sm font-bold text-white">Thử lại</button><Link href="/account/bookings" className="flex items-center justify-center gap-2 text-sm text-blue-600"><ArrowLeft size={16} />Lịch sử đặt tour</Link></>}
  </div></div>;
  return <BookingDetailView booking={booking} />;
}
