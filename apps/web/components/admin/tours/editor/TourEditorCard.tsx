import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export function TourEditorCard({ id, title, description, icon: Icon, art: Art, children }: {
  id?: string; title: string; description: string; icon: LucideIcon; art?: LucideIcon; children: ReactNode;
}) {
  return <section id={id} className="min-w-0 scroll-mt-5 rounded-[23px] border border-[#e1eaf7] bg-[#ffffffed] shadow-[0_5px_13px_#3869a70c,0_2px_4px_#3869a708]">
    <div className="relative flex items-center gap-3 px-5 pt-5 max-sm:px-[18px] max-sm:pt-[18px] min-[1440px]:px-6 min-[1440px]:pt-6">
      <span className="grid size-[41px] shrink-0 place-items-center rounded-full border border-[#e3efff] bg-[linear-gradient(135deg,#f1f8ff,#e3efff)] text-[#0868f9]"><Icon size={22} strokeWidth={1.7} /></span>
      <div className="min-w-0"><h2 className="text-[17px] leading-[1.4] font-[750] tracking-[-.3px] text-[#102044] max-sm:text-[16px]">{title}</h2><p className="mt-[3px] text-[12px] leading-[1.65] text-[#7b879d]">{description}</p></div>
      {Art && <Art className="ml-auto hidden rotate-[-12deg] text-[#b3d6fc] sm:block" size={54} strokeWidth={1.2} aria-hidden="true" />}
    </div>
    <div className="min-w-0 p-5 max-sm:p-[18px] min-[1440px]:p-6">{children}</div>
  </section>;
}
