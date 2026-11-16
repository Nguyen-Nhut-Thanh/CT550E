"use client";

import { ArrowLeft, MapPin, Plane } from 'lucide-react';
import { Fragment, useState, type ReactNode } from 'react';

const SECTIONS = [
  { id: 'tour-info', label: 'Thông tin cơ bản' },
  { id: 'tour-media', label: 'Hình ảnh & Media' },
  { id: 'tour-settings', label: 'Giá & Cài đặt' },
];

export function TourEditorShell({ title, description, onBack, children, sections = SECTIONS }: {
  title: string; description: string; onBack: () => void; children: ReactNode;
  sections?: ReadonlyArray<{ id: string; label: string }>;
}) {
  const [active, setActive] = useState(sections[0]?.id || '');
  return <div className="relative isolate mx-auto max-w-[1240px] px-2 pt-4 pb-20 text-[#101e41] before:absolute before:-z-[2] before:inset-x-[-28px] before:top-[-16px] before:bottom-0 before:content-[''] before:bg-[radial-gradient(ellipse_at_25%_8%,#fff_0%,#f2f7ff_44%,#eaf3ff_100%)] max-sm:px-0 max-sm:pt-3 max-sm:pb-[60px] min-[1440px]:px-5 min-[1440px]:pt-[22px] min-[1440px]:pb-[95px] motion-reduce:[&_*]:transition-none! motion-reduce:[&_*]:scroll-auto! motion-reduce:[&_*::before]:transition-none! motion-reduce:[&_*::before]:scroll-auto!">
    <div className="relative isolate -mx-2 -mt-2 mb-5 min-h-[158px] overflow-hidden rounded-b-[20px] bg-[linear-gradient(110deg,#f8fbff,#edf6ff)] px-2 pt-2 pb-4">
    <div className="absolute inset-y-0 right-0 -z-[1] w-[56%] bg-no-repeat [background-image:linear-gradient(90deg,#f5faff_0%,#f5faffcc_18%,#f5faff00_55%),linear-gradient(0deg,#eff6ff_0%,#eff6ff00_38%),url('/images/about/hero-bay-traveler.png')] [background-size:auto,auto,200%_auto] [background-position:center,center,left_49%] max-sm:w-[66%] max-sm:opacity-50" aria-hidden="true" />
    <div className="pointer-events-none absolute top-0 right-[28%] h-[66px] w-[180px] text-[#5592b8] max-sm:hidden [&>svg:first-child]:h-full [&>svg:first-child]:w-full" aria-hidden="true">
      <svg viewBox="0 0 200 70" fill="none"><path d="M10 52C38 1 100-2 151 26" stroke="#a7cffc" strokeWidth="1.5" strokeDasharray="5 5" /></svg>
      <MapPin className="absolute top-[37px] left-0" size={18} fill="#5a9bfa" stroke="white" />
      <Plane className="absolute top-0 right-2 rotate-[17deg]" size={42} strokeWidth={1.4} fill="#dcefff" />
    </div>
    <header className="relative min-h-[88px] px-2 pt-[6px] pb-3 max-sm:px-0">
      <div className="flex max-w-[76%] items-start gap-[14px] max-sm:max-w-full">
        <button type="button" onClick={onBack} aria-label="Quay lại danh sách tour" className="mt-[3px] grid size-9 shrink-0 place-items-center rounded-xl border border-[#dce6f4] bg-white text-[#627491] shadow-[0_2px_4px_#173c7010] hover:border-[#98bcfb] hover:text-[#1260eb]"><ArrowLeft size={18} /></button>
        <div><h1 className="[font-family:var(--font-display),sans-serif] text-[clamp(24px,2.5vw,30px)] leading-[1.25] font-extrabold tracking-[-.8px] text-[#101d40]">{title}</h1><p className="mt-[7px] max-w-[600px] text-[13px] leading-[1.7] text-[#66758e] max-sm:text-[12px]">{description}</p></div>
      </div>
    </header>
    <nav className="relative mx-2 flex items-center gap-3 max-sm:mx-0 max-sm:gap-[6px]" aria-label="Đi đến phần thông tin tour">
      {sections.map((section, index) => <Fragment key={section.id}>
        {index > 0 && <span className="h-px w-[22px] shrink-0 bg-[#a6c6f7] max-sm:hidden" aria-hidden="true" />}
        <button type="button" className="group flex min-w-0 items-center gap-[9px] rounded-full border border-[#dce7f6] bg-[#ffffffb3] px-[13px] py-[9px] text-[12px] font-semibold text-[#65738e] transition duration-150 hover:border-[#caddfc] hover:bg-[#edf5ff] hover:text-[#0756df] aria-[current=location]:border-[#caddfc] aria-[current=location]:bg-[#edf5ff] aria-[current=location]:text-[#0756df] max-sm:flex-1 max-sm:justify-center max-sm:gap-[6px] max-sm:rounded-xl max-sm:px-1 max-sm:py-2 max-sm:text-[10px]" aria-current={active === section.id ? 'location' : undefined} onClick={() => {
          setActive(section.id);
          document.getElementById(section.id)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
        }}><span className="grid size-[25px] shrink-0 place-items-center rounded-full border border-[#d0dff2] bg-white text-[12px] font-extrabold group-aria-[current=location]:border-[#0875ef] group-aria-[current=location]:bg-[#0875ef] group-aria-[current=location]:text-white group-aria-[current=location]:shadow-[0_3px_8px_#0875ef30] max-sm:size-[22px]">{index + 1}</span>{section.label}</button>
      </Fragment>)}
    </nav>
    </div>
    {children}
    <svg className="pointer-events-none absolute right-[-20px] bottom-0 -z-[1] h-[180px] w-[60%] opacity-60" viewBox="0 0 700 200" fill="none" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 200 145 135 205 160 330 55 400 100 490 20 580 95 640 75 700 110V200Z" fill="#e0edfd" />
      <path d="m190 200 180-105 32 25 83-84 55 77 52-24L700 159v41Z" fill="#cde3fc" />
      <path d="m437 87 48-51 34 48-24-9-10 8-11-17-17 26Z" fill="#f8fbff" />
      <path d="m310 200 170-68 53 25 90-34 77 48v29Z" fill="#b8d6f7" />
    </svg>
  </div>;
}
