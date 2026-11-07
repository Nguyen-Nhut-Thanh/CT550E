import { ChevronDown, ScrollText } from 'lucide-react';
import { TOUR_POLICY_DEFINITIONS, type TourPolicy } from 'shared';
import { TourPolicyContent } from './TourPolicyContent';

export function TourPoliciesSection({ policies = [] }: { policies?: TourPolicy[] }) {
  const entries = TOUR_POLICY_DEFINITIONS.flatMap(definition => {
    const item = policies.find(policy => policy.policy_type === definition.key && policy.content?.trim());
    return item ? [{ ...definition, content: item.content }] : [];
  });
  return <section id="tour-policies" aria-labelledby="tour-policies-heading" className="scroll-mt-24 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
    <div className="flex items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600"><ScrollText size={21} /></span>
      <div><h2 id="tour-policies-heading" className="text-xl font-bold text-slate-900">Lưu ý tour</h2><p className="mt-1 text-sm leading-6 text-slate-500">Thông tin cần biết về giá tour, đăng ký, thanh toán và điều kiện hủy.</p></div>
    </div>
    {entries.length ? <div className="space-y-2">{entries.map((policy, index) => <details key={policy.key} open={index === 0} className="group overflow-hidden rounded-xl border border-slate-200 bg-white"><summary className="flex cursor-pointer list-none items-center justify-between gap-3 bg-slate-50/60 px-4 py-3.5 text-sm font-semibold text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-500 [&::-webkit-details-marker]:hidden">{policy.title}<ChevronDown aria-hidden="true" size={17} className="shrink-0 text-slate-400 transition-transform group-open:rotate-180" /></summary><div className="border-t border-slate-100 p-4"><TourPolicyContent content={policy.content} included={policy.key === 'included'} /></div></details>)}</div>
      : <div className="space-y-1 rounded-xl border border-sky-100 bg-sky-50/50 p-4 text-sm leading-6"><p className="font-medium text-slate-700">Nội dung lưu ý của tour đang được cập nhật.</p><p className="text-slate-500">Vui lòng liên hệ đơn vị tổ chức tour để được tư vấn chi tiết trước khi đặt.</p></div>}
  </section>;
}
