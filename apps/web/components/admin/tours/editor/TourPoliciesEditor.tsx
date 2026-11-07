"use client";

import { CalendarDays, CheckCircle2, CreditCard, FileText, Headphones, Info, PartyPopper, RefreshCcw, ShieldAlert, UsersRound, XCircle } from 'lucide-react';
import { useId } from 'react';
import { TOUR_POLICY_DEFINITIONS, type TourPoliciesEditorProps, type TourPolicyKey } from 'shared';
import { RichTextInput } from '@/components/common/forms/RichTextInput';

const icons = { included: CheckCircle2, excluded: XCircle, children: UsersRound, payment: CreditCard, register: FileText, cancel: RefreshCcw, weekday: CalendarDays, holiday: PartyPopper, force: ShieldAlert, contact: Headphones };
const descriptions: Record<TourPolicyKey, string> = {
  included: 'Những dịch vụ đã được tính trong giá tour.', excluded: 'Các khoản chi phí khách hàng cần thanh toán thêm.',
  children: 'Thông tin độ tuổi, mức giá và dịch vụ dành cho trẻ em.', payment: 'Thời hạn đặt cọc và thanh toán chi phí tour.',
  register: 'Giấy tờ và thông tin cần chuẩn bị khi đăng ký.', cancel: 'Quy định về thay đổi lịch đi, chuyển hoặc hủy tour.',
  weekday: 'Các mốc thời gian và điều kiện hủy vào ngày thường.', holiday: 'Quy định áp dụng trong dịp lễ, Tết và mùa cao điểm.',
  force: 'Cách xử lý khi có sự kiện ngoài khả năng kiểm soát.', contact: 'Kênh liên hệ và thông tin hỗ trợ khách hàng.',
};

export function TourPoliciesEditor({ value = {}, onChange, activeKey, onActiveChange, disabled = false }: TourPoliciesEditorProps) {
  const id = useId();
  const active = TOUR_POLICY_DEFINITIONS.find(policy => policy.key === activeKey) || TOUR_POLICY_DEFINITIONS[0];
  const current = value[active.key] || '';
  return <div className="@container lg:flex lg:min-h-0 lg:flex-1 lg:flex-col lg:[--policy-nav-max:100%]">
    <div className="grid min-w-0 gap-4 lg:min-h-0 lg:flex-1 lg:grid-rows-[auto_minmax(0,1fr)] @min-[520px]:grid-cols-[minmax(140px,.8fr)_minmax(0,1.8fr)] lg:@min-[520px]:grid-rows-[minmax(0,1fr)] @min-[720px]:grid-cols-[185px_minmax(0,1fr)]">
      <nav aria-label="Các mục lưu ý tour" className="min-w-0 lg:flex lg:min-h-0 lg:flex-col lg:overflow-hidden @min-[520px]:border-r @min-[520px]:border-[#e8eef7] @min-[520px]:pr-3">
        <div role="tablist" aria-label="Mục lưu ý cần chỉnh sửa" aria-orientation="vertical" className="flex gap-1 overflow-x-auto pb-1 lg:min-h-0 lg:flex-1 @min-[520px]:max-h-[var(--policy-nav-max,470px)] @min-[520px]:flex-col @min-[520px]:overflow-y-auto @min-[520px]:pr-1">
          {TOUR_POLICY_DEFINITIONS.map((policy, index) => {
            const selected = policy.key === active.key;
            const Icon = icons[policy.key];
            return <button key={policy.key} id={`${id}-${policy.key}`} role="tab" aria-selected={selected} aria-controls={`${id}-panel`} tabIndex={selected ? 0 : -1} type="button" disabled={disabled} onClick={() => onActiveChange(policy.key)} onKeyDown={event => {
              const length = TOUR_POLICY_DEFINITIONS.length;
              const next = event.key === 'ArrowDown' || event.key === 'ArrowRight' ? (index + 1) % length : event.key === 'ArrowUp' || event.key === 'ArrowLeft' ? (index - 1 + length) % length : event.key === 'Home' ? 0 : event.key === 'End' ? length - 1 : null;
              if (next !== null) { event.preventDefault(); const key = TOUR_POLICY_DEFINITIONS[next].key; onActiveChange(key); document.getElementById(`${id}-${key}`)?.focus(); }
            }} className={`relative flex min-w-36 shrink-0 items-center gap-2.5 rounded-[8px] px-3 py-2.5 text-left text-[12px] font-semibold leading-5 transition-colors focus-visible:outline-2 focus-visible:outline-blue-400 disabled:opacity-60 @min-[520px]:min-w-0 @min-[520px]:shrink ${selected ? 'bg-[linear-gradient(100deg,#edf6ff,#f0f7ff)] text-[#0766ff] before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:rounded-full before:bg-[#0766ff]' : 'text-[#536582] hover:bg-[#f6f9ff]'}`}>
              <Icon size={18} strokeWidth={1.8} className="shrink-0" /><span>{policy.title}</span>
            </button>;
          })}
        </div>
      </nav>
      <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-${active.key}`} className="min-w-0 space-y-3 lg:flex lg:min-h-0 lg:flex-col">
        <div className="shrink-0"><h3 className="text-[16px] leading-6 font-bold tracking-[-.3px] text-[#102044]">{active.title}</h3><p className="mt-1 text-[11px] leading-5 text-[#8490a5]">{descriptions[active.key]}</p></div>
        <RichTextInput key={active.key} value={current} onChange={content => onChange({ ...value, [active.key]: content })} label={active.title} placeholder={active.placeholder} disabled={disabled} extended compact fillHeight editorClassName="min-h-[260px] lg:min-h-0" />
        <p className="flex shrink-0 items-start gap-2 text-[11px] leading-5 text-[#8490a5]"><Info size={14} className="mt-0.5 shrink-0" />Nội dung này sẽ hiển thị trên trang chi tiết tour.</p>
      </div>
    </div>
  </div>;
}
