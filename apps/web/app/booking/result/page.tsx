"use client";

import { AlertCircle, ArrowRight, CheckCircle2, Clock3, Loader2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import type { PaymentResultStatus, PaymentStatusResponse } from 'shared';
import { BookingPaymentButton } from '@/components/booking/checkout/BookingPaymentButton';
import { getToken } from '@/lib/auth/session';
import { getPaymentStatus } from '@/lib/booking/api';
import { formatVND } from '@/lib/utils/currency';

const COPY: Record<PaymentResultStatus, { title: string; description: string }> = {
  pending: { title: 'Đang chờ xác nhận thanh toán', description: 'Hệ thống đang chờ xác nhận từ VNPay. Nếu tài khoản đã bị trừ tiền, vui lòng chờ cập nhật và không thanh toán thêm.' },
  success: { title: 'Thanh toán thành công!', description: 'Thanh toán đã được xác nhận. Bạn có thể xem thông tin chuyến đi và giao dịch trong chi tiết đơn đặt tour.' },
  cancelled: { title: 'Bạn đã hủy thanh toán', description: 'Đơn đặt tour vẫn được lưu. Bạn có thể thanh toán lại qua VNPay khi sẵn sàng.' },
  failed: { title: 'Thanh toán chưa thành công', description: 'VNPay chưa xác nhận thanh toán thành công. Nếu tài khoản đã bị trừ tiền, vui lòng liên hệ hỗ trợ để kiểm tra trước khi thanh toán lại.' },
  expired: { title: 'Phiên thanh toán đã hết hạn', description: 'Đơn đặt tour vẫn được lưu. Nếu bạn chưa thanh toán, hãy mở một phiên VNPay mới để tiếp tục.' },
  review: { title: 'Giao dịch đang được đối soát', description: 'Hệ thống đã nhận được giao dịch nhưng đơn cần được kiểm tra thêm. Vui lòng liên hệ hỗ trợ và không thanh toán thêm.' },
};

function ResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get('reference');
  const legacyId = searchParams.get('booking_id') || searchParams.get('orderId');
  const hint = searchParams.get('status');
  const [payment, setPayment] = useState<PaymentStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    if (!reference && legacyId && /^\d+$/.test(legacyId) && Number.isSafeInteger(Number(legacyId)) && Number(legacyId) > 0) {
      router.replace(`/booking/${legacyId}`);
    }
  }, [reference, legacyId, router]);

  useEffect(() => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    let polls = 0;
    setPayment(null); setError(''); setLoading(true);
    if (!reference || !/^[A-Za-z0-9]{1,100}$/.test(reference)) {
      setError(hint === 'unavailable' ? 'Chưa thể kiểm tra giao dịch. Vui lòng xem trạng thái trong lịch sử đặt tour.' : 'Không thể xác minh thông tin trả về từ VNPay. Vui lòng kiểm tra trong lịch sử đặt tour.');
      setLoading(false);
      return;
    }
    if (!getToken()) {
      router.replace(`/login?callbackUrl=${encodeURIComponent(`/booking/result?reference=${encodeURIComponent(reference)}`)}`);
      return;
    }
    const poll = async () => {
      try {
        const result = await getPaymentStatus(reference, controller.signal);
        if (controller.signal.aborted) return;
        setPayment(result); setError('');
        // Use the authenticated database result; a status=success query cannot confirm payment.
        if (result.status === 'pending' && ++polls < 12) timer = setTimeout(() => void poll(), 2500);
      } catch (requestError) {
        if (!controller.signal.aborted) setError(requestError instanceof Error ? requestError.message : 'Chưa thể kiểm tra trạng thái thanh toán.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void poll();
    return () => { controller.abort(); if (timer) clearTimeout(timer); };
  }, [reference, hint, revision, router]);

  if (loading) return <div role="status" className="space-y-4 p-8 text-center"><Loader2 className="mx-auto h-9 w-9 animate-spin text-blue-600" /><p>Đang kiểm tra thanh toán...</p></div>;
  if (!payment) return <div role="alert" className="w-full max-w-md space-y-4 rounded-2xl border border-slate-200 bg-white p-7 text-center"><AlertCircle className="mx-auto h-10 w-10 text-amber-500" /><h1 className="text-xl font-bold">Chưa xác nhận được thanh toán</h1><p className="text-sm leading-6 text-slate-500">{error}</p>{reference && <button type="button" onClick={() => setRevision(value => value + 1)} className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white">Kiểm tra lại</button>}<Link href="/account/bookings" className="block text-sm font-semibold text-blue-600">Về lịch sử đặt tour</Link></div>;

  const copy = COPY[payment.status];
  const success = payment.status === 'success';
  const waiting = ['pending', 'review'].includes(payment.status);
  const canRetry = ['failed', 'cancelled', 'expired'].includes(payment.status) && payment.bookingStatus === 'pending';
  const Icon = success ? CheckCircle2 : waiting ? Clock3 : XCircle;
  return <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-200/50">
    <div aria-live="polite" className={`p-8 text-center text-white ${success ? 'bg-emerald-600' : waiting ? 'bg-sky-600' : 'bg-rose-500'}`}>
      <Icon className="mx-auto h-14 w-14" />
      <h1 className="mt-5 text-2xl font-extrabold">{copy.title}</h1>
      <p className="mt-2 text-sm text-white/85">Mã đơn đặt tour: #{payment.bookingId}</p>
      <p className="mt-1 text-lg font-bold">{formatVND(Number(payment.amount))}</p>
    </div>
    <div className="space-y-5 p-7 text-center">
      <p className="text-sm leading-7 text-slate-600">{copy.description}</p>
      {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
      {canRetry && <BookingPaymentButton bookingId={payment.bookingId} label="Thanh toán lại qua VNPay" />}
      {payment.status === 'pending' && <button type="button" onClick={() => setRevision(value => value + 1)} className="w-full rounded-xl border border-sky-200 px-4 py-3 text-sm font-semibold text-sky-700">Kiểm tra lại trạng thái</button>}
      <Link href={`/booking/${payment.bookingId}`} className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white">Xem chi tiết đơn<ArrowRight size={16} /></Link>
      <Link href="/account/bookings" className="block text-sm font-semibold text-slate-500">Lịch sử đặt tour</Link>
    </div>
  </div>;
}

export default function BookingResultPage() {
  return <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4 py-12"><Suspense fallback={<Loader2 className="h-9 w-9 animate-spin text-blue-600" />}><ResultContent /></Suspense></div>;
}
