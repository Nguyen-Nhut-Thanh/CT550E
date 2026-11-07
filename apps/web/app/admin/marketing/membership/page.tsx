"use client";

import { useAdminContentReadOnly } from '@/components/admin/common/AdminContentPermission';


import { useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Coins, Crown, Download, Loader2, RefreshCw, Save, SlidersHorizontal, Ticket, Users } from "lucide-react";
import { getAdminMembership, saveMembershipSettings } from "@/lib/admin/membership/api";
import { formatVND } from "@/lib/utils/currency";
import type { MembershipAdminList, MembershipTier, MembershipTierId } from "shared";
import { MembershipTierSettings } from "@/components/admin/membership/MembershipTierSettings";
import { MembershipTierPreview } from "@/components/admin/membership/MembershipTierPreview";
import { MembershipBenefitsTable } from "@/components/common/membership/MembershipBenefitsTable";
import { MembershipMembersTable, type MemberRow } from "@/components/admin/membership/MembershipMembersTable";
import { MembershipMemberDialog } from "@/components/admin/membership/MembershipMemberDialog";

export default function AdminMembershipPage() {
  const readOnly = useAdminContentReadOnly();
  const [tab, setTab] = useState<'tiers' | 'members'>('tiers');
  const [data, setData] = useState<MembershipAdminList | null>(null);
  const [tiers, setTiers] = useState<MembershipTier[]>([]);
  const initialized = useRef(false);
  const [selected, setSelected] = useState<MembershipTierId>('gold');
  const [member, setMember] = useState<MemberRow | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const saveLock = useRef(false);
  useEffect(() => { const timer = setTimeout(() => { setQuery(search); setPage(1); }, 300); return () => clearTimeout(timer); }, [search]);
  useEffect(() => {
    let active = true; setLoading(true); setError('');
    getAdminMembership(page, query, filter).then(result => { if (!active) return; setData(result); if (!initialized.current) { setTiers(result.tiers); initialized.current = true; } }).catch(cause => { if (active) setError(cause instanceof Error ? cause.message : 'Không thể tải dữ liệu.'); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [page, query, filter, revision]);
  const dirty = !!data && JSON.stringify(tiers) !== JSON.stringify(data.tiers);
  async function save() {
    if (saveLock.current) return; saveLock.current = true; setSaving(true); setError(''); setMessage('');
    try { const saved = await saveMembershipSettings(tiers); setTiers(saved); setData(previous => previous ? { ...previous, tiers: saved } : previous); setMessage('Đã lưu chính sách hội viên. Quyền lợi mới áp dụng cho đơn đặt tiếp theo; voucher đã cấp giữ nguyên điều kiện.'); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Không thể lưu cấu hình.'); }
    finally { setSaving(false); saveLock.current = false; }
  }
  async function exportMembers() {
    setExporting(true); setError('');
    try {
      const first = await getAdminMembership(1, query, filter, 100);
      const rows = [...first.items];
      for (let current = 2; current <= Math.ceil(first.total / 100); current++) rows.push(...(await getAdminMembership(current, query, filter, 100)).items);
      const escape = (value: unknown) => { let text = String(value ?? ''); if (/^[=+@\-\t\r]/.test(text)) text = "'" + text; return '"' + text.replace(/"/g, '""') + '"'; };
      const csv = [['Mã hội viên', 'Họ tên', 'Email', 'Điện thoại', 'Hạng', 'Chi tiêu kỳ này', 'Ngày xét lại', 'Số voucher', 'Số đơn'], ...rows.map(item => [item.userId, item.name, item.email, item.phone, first.tiers.find(t => t.id === item.tier)?.name ?? item.tier, item.spending, item.cycleEnd ?? '', item.voucherCount, item.bookingCount])].map(row => row.map(escape).join(',')).join('\r\n');
      const url = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }));
      const link = document.createElement('a'); link.href = url; link.download = 'journi-trip-hoi-vien.csv'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage(`Đã xuất ${rows.length} hội viên theo bộ lọc hiện tại.`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Không thể xuất dữ liệu.'); } finally { setExporting(false); }
  }
  const preview = tiers.find(tier => tier.id === selected);
  const button = 'inline-flex items-center justify-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50';
  return <div className="space-y-5 pb-6 text-slate-800">
    <header className="flex flex-wrap items-center justify-between gap-4"><div><p className="mb-2 text-[10px] font-medium text-slate-400">Marketing <span className="mx-1.5">/</span> Khách hàng thân thiết</p><div className="flex items-center gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-700 text-white shadow-md shadow-cyan-600/15"><Crown size={21} /></span><div><h1 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">Hạng thành viên & ưu đãi</h1><p className="mt-1 text-xs text-slate-500">Chính sách hội viên, đặc quyền mỗi hành trình và chu kỳ 12 tháng.</p></div></div></div><div className="flex flex-wrap items-center gap-2"><button type="button" onClick={() => setRevision(value => value + 1)} disabled={loading} aria-label="Làm mới dữ liệu hội viên" className={`${button} border-slate-200 bg-white text-slate-500`}><RefreshCw size={15} className={loading ? 'animate-spin' : ''} /></button><button type="button" onClick={() => void exportMembers()} disabled={exporting || !data} className={`${button} border-slate-200 bg-white text-slate-600`}>{exporting ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}Xuất hội viên</button><button type="submit" form="membership-settings" disabled={readOnly || saving || !data || !dirty || tab !== 'tiers'} className={`${button} border-cyan-600 bg-cyan-600 text-white shadow-sm shadow-cyan-200 hover:bg-cyan-700`}>{saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}{saving ? 'Đang lưu...' : 'Lưu chính sách'}</button></div></header>
    <nav aria-label="Quản lý hội viên" className="flex gap-6 border-b border-slate-200">{([{ id: 'tiers', label: 'Cấu hình hạng & quyền lợi', icon: SlidersHorizontal }, { id: 'members', label: 'Danh sách hội viên', icon: Users }] as const).map(item => <button type="button" key={item.id} onClick={() => setTab(item.id)} aria-current={tab === item.id ? 'page' : undefined} className={`flex items-center gap-2 border-b-2 px-1 pb-3 pt-1 text-xs font-semibold ${tab === item.id ? 'border-cyan-600 text-cyan-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}><item.icon size={16} />{item.label}</button>)}</nav>
    {error && <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-100 bg-rose-50 p-3 text-xs leading-5 text-rose-700"><AlertCircle size={16} className="mt-0.5 shrink-0" /><span>{error}</span><button type="button" onClick={() => setRevision(value => value + 1)} className="ml-auto shrink-0 underline">Tải lại</button></div>}
    {message && <div role="status" className="flex items-start gap-2 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-xs leading-5 text-emerald-700"><CheckCircle2 size={16} className="mt-0.5 shrink-0" />{message}</div>}
    {!data ? loading && <div role="status" className="flex items-center justify-center gap-3 p-20 text-sm text-slate-500"><Loader2 className="animate-spin text-cyan-600" />Đang tải chương trình hội viên...</div> : <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[{ label: 'Tổng hội viên', value: data.memberTotal, sub: 'Hồ sơ đã đồng bộ', icon: Users, color: 'bg-blue-50 text-blue-600' }, { label: 'Voucher đã cấp', value: data.issued, sub: 'Ưu đãi cá nhân của hội viên', icon: Ticket, color: 'bg-cyan-50 text-cyan-600' }, { label: 'Voucher đã dùng / giữ', value: data.used, sub: 'Bao gồm đơn chờ thanh toán', icon: CheckCircle2, color: 'bg-violet-50 text-violet-600' }, { label: 'Tổng ưu đãi đã áp dụng', value: formatVND(data.discountTotal), sub: 'Trên đơn đã thanh toán / xác nhận', icon: Coins, color: 'bg-amber-50 text-amber-600' }].map(stat => <div key={stat.label} className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4"><div><p className="text-[11px] font-medium text-slate-500">{stat.label}</p><p className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">{typeof stat.value === 'number' ? stat.value.toLocaleString('vi-VN') : stat.value}</p><p className="mt-1.5 text-[10px] text-slate-400">{stat.sub}</p></div><span className={`grid size-9 shrink-0 place-items-center rounded-xl ${stat.color}`}><stat.icon size={18} /></span></div>)}</div>
      {tab === 'tiers' ? <form id="membership-settings" onSubmit={event => { event.preventDefault(); void save(); }} className="space-y-5">{dirty && <div className="flex items-center justify-between gap-3 rounded-lg border border-amber-100 bg-amber-50 px-4 py-2 text-xs text-amber-700"><span>Bạn có thay đổi chưa lưu.</span><button type="button" disabled={saving} onClick={() => { setTiers(data.tiers); setMessage(''); }} className="font-semibold underline">Hoàn tác</button></div>}<div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.8fr)_minmax(300px,1fr)]"><MembershipTierSettings tiers={tiers} disabled={readOnly || saving} onSelect={setSelected} onChange={(id, field, value) => { setMessage(''); setTiers(current => current.map(tier => tier.id === id ? { ...tier, [field]: value } : tier)); }} />{preview && <MembershipTierPreview tier={preview} />}</div><MembershipBenefitsTable tiers={tiers} /></form> : <MembershipMembersTable data={data} page={page} search={search} filter={filter} loading={loading} onSearch={setSearch} onFilter={value => { setFilter(value); setPage(1); }} onPage={setPage} onDetails={setMember} />}
    </>}
    {member && <MembershipMemberDialog key={member.userId} member={member} onClose={() => { setMember(null); setRevision(value => value + 1); }} />}
  </div>;
}
