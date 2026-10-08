"use client";

import { useState } from "react";
import { Mail, Send } from "lucide-react";

export function BlogNewsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setEmail("");
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
          <Mail className="h-5 w-5" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Đăng ký nhận tin</h3>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed">
        Nhận ngay những ưu đãi và bài viết mới nhất từ TravelGo
      </p>

      {submitted ? (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-center text-xs font-bold text-emerald-700">
          Cảm ơn bạn đã đăng ký nhận tin!
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Nhập email của bạn"
            required
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs outline-none transition focus:border-sky-400 focus:bg-white"
          />

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 py-3 text-xs font-bold text-white shadow-md shadow-sky-500/20 transition hover:bg-sky-700 active:scale-95"
          >
            <span>Đăng ký</span>
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      )}
    </div>
  );
}
