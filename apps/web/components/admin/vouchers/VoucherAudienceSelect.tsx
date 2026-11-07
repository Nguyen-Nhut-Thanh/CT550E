"use client";

import { useRef, useState } from "react";
import { ChevronDown, Users } from "lucide-react";
import { VOUCHER_CUSTOMER_TYPES, type VoucherForm } from "shared";
import { useDismiss } from "@/lib/ui/useDismiss";
import { Popover } from "@/components/common/overlays/Popover";

export function VoucherAudienceSelect({ form, onChange, disabled, idPrefix }: {
  form: VoucherForm; onChange: (updater: (current: VoucherForm) => VoucherForm) => void;
  disabled: boolean; idPrefix: string;
}) {
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useDismiss(container, open, () => setOpen(false));
  const all = form.customer_types.includes("all");
  const label = all ? "Tất cả khách hàng" : VOUCHER_CUSTOMER_TYPES.filter(item => form.customer_types.includes(item.value)).map(item => item.label).join(", ") || "Chọn đối tượng áp dụng";

  return <div ref={container} className="relative w-full min-w-0 max-w-full">
    <label htmlFor={`${idPrefix}-audience`} className="mb-[7px] block text-[10px] font-[750] uppercase leading-4 tracking-[.065em] text-[#697e9f] admin-short-tablet:mb-[5px]">Đối tượng áp dụng</label>
    <button ref={trigger} id={`${idPrefix}-audience`} type="button" disabled={disabled} aria-expanded={open && !disabled} aria-controls={`${idPrefix}-audience-options`} aria-label={`Đối tượng áp dụng: ${label}`} onClick={() => setOpen(value => !value)} className="flex h-[44px] min-h-[44px] w-full min-w-0 max-w-full items-center gap-2 overflow-hidden rounded-[10px] border border-[#dce5f3] bg-white px-3 py-2 text-left text-xs font-semibold text-[#172340] outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-50 admin-short-tablet:h-[40px] admin-short-tablet:min-h-[40px]">
      <Users size={17} className="shrink-0 text-[#3c7cff]" /><span className="block min-w-0 flex-1 truncate" title={label}>{label}</span><ChevronDown size={15} className={`shrink-0 text-[#8191ae] transition-transform ${open ? "rotate-180" : ""}`} />
    </button>
    {open && !disabled && <Popover anchorRef={trigger} matchAnchorWidth className="max-w-[calc(100vw_-_16px)] overflow-x-hidden rounded-xl border border-[#dce5f3] bg-white p-0 shadow-lg shadow-blue-900/10">
    <div id={`${idPrefix}-audience-options`} role="group" aria-label="Chọn các nhóm khách hàng" onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); setOpen(false); trigger.current?.focus(); } }} className="p-1.5">
      {VOUCHER_CUSTOMER_TYPES.map(item => {
        const locked = all && item.value !== "all";
        return <label key={item.value} className={`flex min-w-0 items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-xs ${locked ? "cursor-not-allowed text-slate-300" : "cursor-pointer text-slate-600 hover:bg-blue-50"} ${item.value === 'all' ? 'mb-1 border-b border-slate-100 font-semibold' : ''}`}>
          <input type="checkbox" disabled={locked || disabled} checked={form.customer_types.includes(item.value)} onChange={event => {
            const checked = event.target.checked;
            onChange(current => ({ ...current, customer_types: item.value === "all" ? checked ? ["all"] : [] : checked ? [...current.customer_types.filter(value => value !== "all"), item.value] : current.customer_types.filter(value => value !== item.value) }));
          }} className="size-4 shrink-0 rounded accent-blue-600 disabled:cursor-not-allowed" /><span className="min-w-0 break-words">{item.label}</span>
        </label>;
      })}
      <p className="px-2.5 pb-1 pt-2 text-[10px] leading-4 text-slate-400">Bỏ chọn “Tất cả” để chọn riêng một hoặc nhiều hạng.</p>
    </div></Popover>}
    <p className="mt-[7px] text-[10px] leading-[1.6] text-[#8191ae]">{!form.customer_types.length ? <span role="alert" className="text-rose-600">Vui lòng chọn ít nhất một nhóm khách hàng.</span> : form.status === 1 ? "Khi lưu, gửi thông báo voucher đến khách hàng thuộc các nhóm đã chọn." : "Voucher tạm dừng chưa gửi thông báo. Thông báo được gửi khi kích hoạt."}</p>
  </div>;
}
