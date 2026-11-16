import { Check, Crown, Gem, Info, Plane, Sparkles } from "lucide-react";
import { membershipBenefits, type MembershipTier, type MembershipTierId } from "shared";
import { formatVND } from "@/lib/utils/currency";

export const tierStyles: Record<MembershipTierId, { card: string; badge: string; dot: string; english: string }> = {
  bronze: { card: "from-amber-900 via-amber-700 to-orange-950", badge: "border-amber-200 bg-amber-50 text-amber-800", dot: "bg-amber-700", english: "Member" },
  silver: { card: "from-slate-600 via-slate-400 to-zinc-600", badge: "border-slate-200 bg-slate-100 text-slate-600", dot: "bg-slate-400", english: "Silver" },
  gold: { card: "from-amber-600 via-yellow-500 to-amber-700", badge: "border-yellow-200 bg-yellow-50 text-yellow-800", dot: "bg-yellow-500", english: "Gold" },
  platinum: { card: "from-slate-800 via-teal-800 to-cyan-950", badge: "border-cyan-200 bg-cyan-50 text-cyan-800", dot: "bg-teal-500", english: "Platinum" },
  diamond: { card: "from-blue-950 via-indigo-800 to-sky-950", badge: "border-blue-200 bg-blue-50 text-blue-700", dot: "bg-blue-600", english: "Diamond" },
};

export function MembershipTierPreview({ tier }: { tier: MembershipTier }) {
  return <aside className="space-y-4 xl:sticky xl:top-4 xl:self-start">
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/20">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-900"><Sparkles size={17} className="text-amber-500" />Xem trước thẻ hội viên</h2>
      <div className={`relative isolate flex aspect-[1.586/1] flex-col justify-between overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br ${tierStyles[tier.id].card} p-5 text-white shadow-lg`}>
        <div aria-hidden className="absolute -right-12 -top-12 -z-10 size-56 rounded-full border-[28px] border-white/10" />
        <div aria-hidden className="absolute -bottom-24 -left-12 -z-10 size-64 rounded-full border border-white/15" />
        <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg border border-white/25 bg-white/15"><Plane size={18} /></span><div><p className="text-xs font-extrabold tracking-[.18em]">JOURNITRIP</p><p className="mt-0.5 text-[9px] tracking-[.2em] text-white/75">MEMBERSHIP REWARDS</p></div></div><Crown size={24} className="text-white/80" /></div>
        <div className="py-4"><Gem size={30} strokeWidth={1.25} className="text-white/75" /><p className="mt-2 text-2xl font-bold tracking-tight">{tierStyles[tier.id].english}</p></div>
        <div className="flex items-end justify-between"><div><p className="text-[9px] tracking-[.15em] text-white/65">THẺ HỘI VIÊN MẪU</p><p className="mt-1 text-xs font-semibold tracking-wide">{tier.name.toLocaleUpperCase("vi-VN")}</p></div><span className="rounded-full border border-white/25 bg-white/10 px-2 py-1 text-[9px]">JOURNEY WITH PRIVILEGES</span></div>
      </div>
      <div className="mt-5 border-t border-slate-100 pt-4"><p className="text-xs font-bold text-slate-800">Quyền lợi hạng {tier.name}</p><ul className="mt-3 space-y-2.5">{membershipBenefits(tier).map(benefit => <li key={benefit} className="flex items-start gap-2 text-xs leading-5 text-slate-600"><Check size={14} className="mt-0.5 shrink-0 text-emerald-600" />{benefit}</li>)}</ul><p className="mt-4 rounded-lg bg-slate-50 p-3 text-[11px] leading-5 text-slate-500">{tier.threshold ? `Từ ${formatVND(tier.threshold)} chi tiêu hợp lệ trong kỳ.` : "Hạng khởi đầu cho mọi hội viên."}</p></div>
    </section>
    <section className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-xs leading-6 text-slate-300"><h2 className="mb-2 flex items-center gap-2 font-semibold text-cyan-300"><Info size={16} />Quy tắc áp dụng</h2><p>Xét hạng theo chi tiêu trong chu kỳ 12 tháng từ tour hoàn thành, đã thanh toán. Điểm thưởng tính riêng theo hệ số lúc đặt tour.</p><p className="mt-2">Trừ một voucher trước, rồi giảm theo hạng trên tiền tour còn lại. Dịch vụ đi kèm được giảm riêng; phụ thu phòng đơn giữ nguyên.</p><p className="mt-2">Voucher sinh nhật cấp một lần mỗi năm, dùng trong tháng sinh nhật. Ưu tiên giữ chỗ giúp nhân viên nhận diện yêu cầu cần xử lý trước, tùy chỗ còn trống.</p></section>
  </aside>;
}
