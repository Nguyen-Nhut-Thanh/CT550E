import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export function TourEditorCard({ id, title, description, icon: Icon, art: Art, headerAction, compact = false, fillHeight = false, children }: {
  id?: string; title: string; description?: string; icon: LucideIcon; art?: LucideIcon; headerAction?: ReactNode; compact?: boolean; fillHeight?: boolean; children: ReactNode;
}) {
  return <section id={id} className={`min-w-0 scroll-mt-5 border border-[#e1eaf7] bg-[#ffffffed] shadow-[0_5px_13px_#3869a70c,0_2px_4px_#3869a708] ${compact ? 'rounded-[16px]' : 'rounded-[23px]'} ${fillHeight ? 'lg:flex lg:h-full lg:min-h-0 lg:flex-col lg:overflow-hidden' : ''}`}>
    <div className={`relative ${fillHeight ? 'lg:shrink-0' : ''} ${compact ? 'gap-2.5 px-4 pt-4' : 'gap-3 px-5 pt-5 max-sm:px-[18px] max-sm:pt-[18px] min-[1440px]:px-6 min-[1440px]:pt-6'} ${headerAction ? 'grid items-center min-[560px]:grid-cols-[minmax(0,1fr)_auto]' : 'flex items-center'}`}>
      <div className={`flex min-w-0 flex-1 items-center ${compact ? 'gap-2.5' : 'gap-3'}`}>
      <span className={`grid shrink-0 place-items-center rounded-full border border-[#e3efff] bg-[linear-gradient(135deg,#f1f8ff,#e3efff)] text-[#0868f9] ${compact ? 'size-[34px]' : 'size-[41px]'}`}><Icon size={compact ? 18 : 22} strokeWidth={1.7} /></span>
      <div className="min-w-0"><h2 className={`leading-[1.4] font-[750] tracking-[-.3px] text-[#102044] ${compact ? 'text-[15px]' : 'text-[17px] max-sm:text-[16px]'}`}>{title}</h2>{description && <p className={`mt-[3px] leading-[1.65] text-[#7b879d] ${compact ? 'text-[11px]' : 'text-[12px]'}`}>{description}</p>}</div>
      {Art && <Art className="ml-auto hidden rotate-[-12deg] text-[#b3d6fc] sm:block" size={54} strokeWidth={1.2} aria-hidden="true" />}
      </div>
      {headerAction && <div className="min-w-0">{headerAction}</div>}
    </div>
    <div className={`min-w-0 ${compact ? 'p-4' : 'p-5 max-sm:p-[18px] min-[1440px]:p-6'} ${fillHeight ? 'lg:flex lg:min-h-0 lg:flex-1 lg:flex-col lg:overflow-hidden' : ''}`}>{children}</div>
  </section>;
}
