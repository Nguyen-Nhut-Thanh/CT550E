import { Check, Minus } from "lucide-react";
import type { MembershipTier } from "shared";
import { formatVND } from "@/lib/utils/currency";

export function MembershipBenefitsTable({ tiers }: { tiers: MembershipTier[] }) {
  const rows: { label: string; value: (tier: MembershipTier) => string | boolean }[] = [
    { label: "Giảm giá tour", value: t => t.tourDiscountPercent ? `${t.tourDiscountPercent}%` : false },
    { label: "Hệ số tích điểm", value: t => `${t.pointMultiplier.toLocaleString("vi-VN")}×` },
    { label: "Voucher sinh nhật", value: t => t.birthdayVoucherAmount ? formatVND(t.birthdayVoucherAmount) : false },
    { label: "Giảm dịch vụ đi kèm", value: t => t.serviceDiscountPercent ? `${t.serviceDiscountPercent}%` : false },
    { label: "Ưu tiên xử lý giữ chỗ", value: t => t.priorityReservation },
  ];
  return <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><h2 className="px-5 py-4 text-sm font-bold text-slate-900">So sánh quyền lợi các hạng</h2><div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-xs"><thead className="border-y border-slate-100 bg-slate-50 text-slate-500"><tr><th scope="col" className="px-5 py-3 font-medium">Quyền lợi</th>{tiers.map(tier => <th scope="col" className="px-4 py-3 text-center font-semibold text-slate-800" key={tier.id}>{tier.id === 'bronze' ? 'Member' : tier.name}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{rows.map(row => <tr key={row.label}><th scope="row" className="px-5 py-3.5 font-medium text-slate-600">{row.label}</th>{tiers.map(tier => { const value = row.value(tier); return <td key={tier.id} className="px-4 py-3.5 text-center font-semibold text-slate-700">{typeof value === 'boolean' ? value ? <Check size={16} className="mx-auto text-cyan-600" aria-label="Có" /> : <Minus size={14} className="mx-auto text-slate-300" aria-label="Không" /> : value}</td>; })}</tr>)}</tbody></table></div></section>;
}
