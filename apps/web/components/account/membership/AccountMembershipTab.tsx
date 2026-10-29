"use client";

import {
  Award,
  CalendarDays,
  Check,
  ChevronRight,
  Gem,
  History,
  Loader2,
  TicketPercent,
} from "lucide-react";
import Link from "next/link";
import { useAccountResource } from "@/lib/account/useAccountResource";
import { getMembership } from "@/lib/membership/api";
import { formatVND } from "@/lib/utils/currency";

const themes: Record<string, string> = {
  bronze: "from-amber-950 via-amber-800 to-orange-600",
  silver: "from-slate-800 via-slate-600 to-slate-400",
  gold: "from-amber-900 via-yellow-700 to-amber-500",
  platinum: "from-indigo-950 via-indigo-700 to-sky-500",
  diamond: "from-slate-950 via-blue-900 to-cyan-500",
};
const date = (value: string) =>
  new Date(value).toLocaleDateString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

export function AccountMembershipTab() {
  const { data, loading, error, refresh } = useAccountResource(
    "membership",
    getMembership,
  );
  if (loading)
    return (
      <div
        role="status"
        className="flex items-center gap-3 p-10 text-slate-500"
      >
        <Loader2 className="animate-spin" />
        Đang tải hạng thành viên...
      </div>
    );
  if (error || !data)
    return (
      <div role="alert" className="rounded-2xl bg-white p-6 text-rose-600">
        {error || "Không thể tải hạng thành viên."}
        <button onClick={refresh} className="ml-3 underline">
          Thử lại
        </button>
      </div>
    );
  const available = data.vouchers.filter(
    (voucher) => voucher.state === "available",
  ).length;
  return (
    <div className="space-y-7 pb-8">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
          JourniTrip Rewards
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
          Hạng thành viên
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Mỗi chuyến đi mở ra thêm những đặc quyền dành cho bạn.
        </p>
      </header>
      <section
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${themes[data.tier.id]} p-6 text-white shadow-lg sm:p-8`}
      >
        <Gem
          aria-hidden
          className="absolute -right-8 -top-6 h-64 w-64 rotate-12 text-white/10"
          strokeWidth={0.8}
        />
        <div className="relative flex flex-wrap items-start justify-between gap-5">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold">
              <Award size={15} />
              Thành viên JourniTrip
            </span>
            <h2 className="mt-5 text-4xl font-black">{data.tier.name}</h2>
            <p className="mt-2 text-sm text-white/80">
              {data.cycleEnd
                ? `Ngày xét lại hạng: ${date(data.cycleEnd)}`
                : "Chu kỳ bắt đầu khi bạn hoàn thành tour đầu tiên"}
            </p>
          </div>
          <Link
            href="/account/wallet"
            className="relative inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-900"
          >
            <TicketPercent size={18} />
            {available} voucher
            <ChevronRight size={16} />
          </Link>
        </div>
        <div className="relative mt-8 grid gap-5 border-t border-white/20 pt-5 sm:grid-cols-2">
          <div>
            <p className="text-xs text-white/75">Chi tiêu xét hạng kỳ này</p>
            <p className="mt-1 text-2xl font-extrabold">
              {formatVND(data.spending)}
            </p>
          </div>
          <div>
            <p className="text-xs text-white/75">Điểm xét hạng</p>
            <p className="mt-1 text-2xl font-extrabold">
              {data.points.toLocaleString("vi-VN")}{" "}
              <span className="text-sm font-medium text-white/75">điểm</span>
            </p>
          </div>
        </div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap justify-between gap-3">
          <h2 className="font-bold text-slate-900">
            {data.nextTier
              ? `Hành trình đến hạng ${data.nextTier.name}`
              : "Bạn đang ở hạng cao nhất"}
          </h2>
          <span className="text-sm font-semibold text-blue-700">
            {Math.floor(data.progress)}%
          </span>
        </div>
        <div
          role="progressbar"
          aria-label="Tiến độ xét hạng"
          aria-valuenow={Math.floor(data.progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400"
            style={{ width: `${data.progress}%` }}
          />
        </div>
        {data.nextTier && (
          <p className="mt-3 text-sm text-slate-600">
            Cần thêm{" "}
            <strong className="text-slate-900">
              {formatVND(data.toNextTier)}
            </strong>{" "}
            để lên hạng {data.nextTier.name}.
          </p>
        )}
        {data.tier.id !== "bronze" && (
          <p className="mt-2 text-sm text-slate-600">
            {data.toRetainTier > 0
              ? `Cần thêm ${formatVND(data.toRetainTier)} để giữ hạng ${data.tier.name} vào kỳ xét tiếp theo.`
              : `Bạn đã đủ chi tiêu để giữ hạng ${data.tier.name} vào kỳ xét tiếp theo.`}
          </p>
        )}
        {data.cycleStart && data.cycleEnd && (
          <p className="mt-3 flex items-center gap-2 text-xs text-slate-500">
            <CalendarDays size={14} />
            Chu kỳ: {date(data.cycleStart)} – {date(data.cycleEnd)}
          </p>
        )}
      </section>
      <section>
        <h2 className="mb-4 text-lg font-extrabold text-slate-900">
          Khám phá các hạng thành viên
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {data.tiers.map((tier) => (
            <div
              key={tier.id}
              className={`rounded-2xl border p-4 ${tier.id === data.tier.id ? "border-blue-400 bg-blue-50 ring-1 ring-blue-200" : "border-slate-200 bg-white"}`}
            >
              <Gem size={23} className="mb-3 text-blue-600" />
              <h3 className="font-bold text-slate-900">{tier.name}</h3>
              <p className="mt-1 text-xs text-slate-500">
                {tier.threshold
                  ? `Từ ${formatVND(tier.threshold)} / kỳ`
                  : "Khi đăng ký tài khoản"}
              </p>
              <ul className="mt-4 space-y-2">
                {tier.benefits.map((benefit) => (
                  <li
                    key={benefit}
                    className="flex items-start gap-1.5 text-xs leading-relaxed text-slate-600"
                  >
                    <Check
                      size={13}
                      className="mt-0.5 shrink-0 text-emerald-600"
                    />
                    {benefit}
                  </li>
                ))}
              </ul>
              {tier.id === data.tier.id && (
                <p className="mt-4 text-xs font-bold text-blue-700">
                  Hạng hiện tại
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <h2 className="flex items-center gap-2 border-b border-slate-100 p-5 font-bold text-slate-900">
          <History size={18} />
          Lịch sử tích lũy trong kỳ
        </h2>
        {data.history.length ? (
          <ul className="divide-y divide-slate-100">
            {data.history.map((item) => (
              <li
                key={item.bookingId}
                className="flex flex-wrap items-center justify-between gap-3 p-5"
              >
                <div>
                  <Link
                    href={`/booking/${item.bookingId}`}
                    className="text-sm font-bold text-slate-900 hover:text-blue-600"
                  >
                    {item.tourName}
                  </Link>
                  <p className="mt-1 text-xs text-slate-500">
                    Đơn #{item.bookingId} · {date(item.completedAt)}
                  </p>
                </div>
                <p className="text-sm font-bold text-emerald-700">
                  +{formatVND(item.amount)}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-6 text-sm text-slate-500">
            Chưa có tour hoàn thành đủ điều kiện tích lũy trong chu kỳ này.
          </p>
        )}
      </section>
      {data.cycles.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 font-bold text-slate-900">Các kỳ đã xét hạng</h2>
          <ul className="space-y-3">
            {[...data.cycles].reverse().map((cycle) => (
              <li
                key={cycle.start}
                className="flex flex-wrap justify-between gap-2 text-sm text-slate-600"
              >
                <span>
                  {date(cycle.start)} – {date(cycle.end)}
                </span>
                <span>
                  {formatVND(cycle.spending)} · Hạng{" "}
                  {data.tiers.find((tier) => tier.id === cycle.tier)?.name}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
      <section className="rounded-2xl bg-sky-50 p-5 text-sm leading-7 text-slate-600">
        <h2 className="font-bold text-slate-900">
          Cách xét hạng & nhận ưu đãi
        </h2>
        <p>
          Mỗi 100.000đ thực trả từ tour đã kết thúc và thanh toán thành công
          tương ứng 1 điểm xét hạng. Tour hủy và tiền hoàn không được tính. Dùng
          voucher không làm mất điểm đã tích lũy.
        </p>
        <p>
          Hạng được nâng ngay khi đủ chi tiêu. Sau mỗi 12 tháng, hệ thống xét
          lại hạng theo chi tiêu trong kỳ vừa kết thúc; chi tiêu kỳ mới bắt đầu
          lại từ 0. Hạng được giữ trong kỳ mới và vẫn có thể nâng sớm. Việc hủy
          hoặc hoàn tiền sẽ điều chỉnh lại chi tiêu và hạng tương ứng.
        </p>
        <p>
          Mỗi hạng nhận tối đa một voucher trong một chu kỳ khi đạt hoặc được
          giữ hạng. Voucher có hạn 90 ngày từ ngày cấp, dùng một lần và không
          cộng dồn với voucher khác. Khi hạ hạng, voucher đã cấp vẫn giữ nguyên
          điều kiện và hạn dùng.
        </p>
      </section>
    </div>
  );
}
