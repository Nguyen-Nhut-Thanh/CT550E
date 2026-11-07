"use client";

import { CreditCard, Loader2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { createPaymentUrl } from '@/lib/booking/api';

export function BookingPaymentButton({ bookingId, label = 'Thanh toán VNPay' }: { bookingId: number; label?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inFlight = useRef(false);
  const pay = async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setLoading(true); setError('');
    try {
      const result = await createPaymentUrl(bookingId);
      if (!result.paymentUrl) throw new Error('Chưa nhận được đường dẫn thanh toán. Vui lòng thử lại.');
      window.location.assign(result.paymentUrl);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Không thể mở VNPay. Vui lòng thử lại.');
      inFlight.current = false;
      setLoading(false);
    }
  };
  return <div className="space-y-2">
    <button type="button" disabled={loading} onClick={() => void pay()} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-wait disabled:opacity-60">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}{loading ? 'Đang mở VNPay...' : label}</button>
    {error && <p role="alert" className="text-sm leading-6 text-rose-600">{error}</p>}
  </div>;
}
