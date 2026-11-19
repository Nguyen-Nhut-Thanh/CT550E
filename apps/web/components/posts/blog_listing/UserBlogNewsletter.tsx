"use client";

import { Mail, Send } from "lucide-react";
import { useState } from "react";

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
    <section className="space-y-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-sky-50 text-sky-600">
          <Mail className="h-3.5 w-3.5" />
        </div>
        <h3 className="text-xs font-bold text-slate-900">Đăng ký nhận tin</h3>
      </div>

      <p className="text-[10px] leading-relaxed text-slate-500">
        Nhận ngay những ưu đãi và bài viết mới nhất từ JourniTrip
      </p>

      {submitted ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 text-center text-[10px] font-bold text-emerald-700">
          Cảm ơn bạn đã đăng ký nhận tin!
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-1.5">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Nhập email của bạn"
            required
            className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] outline-none transition placeholder:text-slate-400 focus:border-sky-400"
          />

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-sky-600 py-1.5 text-[10px] font-bold text-white shadow-sm shadow-sky-500/20 transition hover:bg-sky-700 active:scale-[.99]"
          >
            <span>Đăng ký</span>
            <Send className="h-3 w-3" />
          </button>
        </form>
      )}
    </section>
  );
}
