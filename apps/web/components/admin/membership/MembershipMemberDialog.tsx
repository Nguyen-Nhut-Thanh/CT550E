"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { History, Loader2, X } from "lucide-react";
import type { MembershipSummary } from "shared";
import { getMemberDetails } from "@/lib/admin/membership/api";
import { formatVND } from "@/lib/utils/currency";
import { membershipDate, type MemberRow } from "./MembershipMembersTable";
import { MembershipTierPreview } from "./MembershipTierPreview";

export function MembershipMemberDialog({ member, onClose }: { member: MemberRow; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [data, setData] = useState<MembershipSummary | null>(null);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  useEffect(() => { const element = dialog.current; element?.showModal(); return () => element?.close(); }, []);
  useEffect(() => { let active = true; setError(''); getMemberDetails(member.userId).then(result => { if (active) setData(result); }).catch(cause => { if (active) setError(cause instanceof Error ? cause.message : 'Không thể tải hồ sơ.'); }); return () => { active = false; }; }, [member.userId, revision]);
  return <dialog ref={dialog} aria-labelledby="member-detail-title" onCancel={onClose} className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%_-_32px)] max-w-[900px] overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-0 text-slate-800 shadow-2xl backdrop:bg-slate-950/50">
    <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white p-5"><div><h2 id="member-detail-title" className="font-bold">{member.name}</h2><p className="mt-1 text-xs text-slate-500">{member.email}{member.phone ? ` · ${member.phone}` : ''}</p></div><button type="button" aria-label="Đóng hồ sơ" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><X size={19} /></button></header>
    {error ? <div role="alert" className="p-8 text-sm text-rose-600">{error}<button onClick={() => setRevision(value => value + 1)} className="ml-3 underline">Thử lại</button></div> : !data ? <div className="p-20"><Loader2 className="mx-auto animate-spin text-cyan-600" aria-label="Đang tải hồ sơ" /></div> : <div className="grid gap-5 p-5 md:grid-cols-2"><div className="space-y-5"><div className="grid grid-cols-2 gap-3">{[['Chi tiêu kỳ này', formatVND(data.spending)], ['Điểm thưởng kỳ này', data.points.toLocaleString('vi-VN')], ['Ngày xét lại', membershipDate(data.cycleEnd)], ['Voucher khả dụng', data.vouchers.filter(v => v.state === 'available').length]].map(([label, value]) => <div key={label} className="rounded-xl border border-slate-200 bg-white p-3"><p className="text-[10px] text-slate-500">{label}</p><p className="mt-1.5 text-sm font-bold">{value}</p></div>)}</div><section className="rounded-xl border border-slate-200 bg-white"><h3 className="flex items-center gap-2 border-b border-slate-100 p-4 text-xs font-bold"><History size={15} />Lịch sử tích lũy trong kỳ</h3><ul className="divide-y divide-slate-100">{data.history.map(item => <li key={item.bookingId} className="p-4"><Link href={`/admin/bookings?search=${item.bookingId}`} className="text-xs font-semibold text-slate-700 hover:text-cyan-600">{item.tourName}</Link><p className="mt-1 text-[10px] text-slate-400">Đơn #{item.bookingId} · {membershipDate(item.completedAt)}</p><p className="mt-2 text-xs font-bold text-cyan-700">{formatVND(item.amount)} · +{item.points} điểm</p></li>)}</ul>{!data.history.length && <p className="p-6 text-xs text-slate-400">Chưa có tour đủ điều kiện tích lũy trong kỳ.</p>}</section></div><MembershipTierPreview tier={data.tier} /></div>}
  </dialog>;
}
