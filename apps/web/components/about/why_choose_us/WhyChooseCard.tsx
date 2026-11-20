import { Check, type LucideIcon } from "lucide-react";

const themes = {
  teal: {
    outer: "border-[1.5px] border-[rgba(45,212,191,0.55)] bg-[linear-gradient(180deg,rgba(45,212,191,0.08)_0%,rgba(13,38,56,0.25)_100%)] shadow-[0_15px_35px_-10px_rgba(0,0,0,0.5),0_0_25px_rgba(45,212,191,0.12)] hover:border-[rgba(94,234,212,0.9)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.6),0_0_35px_rgba(45,212,191,0.3)]",
    inner: "border border-[rgba(94,234,212,0.35)] bg-[linear-gradient(165deg,rgba(20,62,78,0.55)_0%,rgba(11,29,46,0.72)_100%)]",
    orb: "bg-[radial-gradient(circle_at_30%_30%,rgba(94,234,212,0.45),rgba(20,75,88,0.75))] border-[1.5px] border-[rgba(153,246,228,0.75)] shadow-[0_0_25px_rgba(45,212,191,0.5),inset_0_0_12px_rgba(255,255,255,0.35)]",
    tag: "bg-[linear-gradient(90deg,#5eead4_0%,#f9a8d4_100%)]",
    accent: "text-teal-300 border-teal-300/15"
  },
  blue: {
    outer: "border-[1.5px] border-[rgba(96,165,250,0.55)] bg-[linear-gradient(180deg,rgba(96,165,250,0.08)_0%,rgba(15,32,62,0.25)_100%)] shadow-[0_15px_35px_-10px_rgba(0,0,0,0.5),0_0_25px_rgba(96,165,250,0.12)] hover:border-[rgba(147,197,253,0.9)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.6),0_0_35px_rgba(96,165,250,0.3)]",
    inner: "border border-[rgba(147,197,253,0.35)] bg-[linear-gradient(165deg,rgba(28,54,92,0.55)_0%,rgba(12,26,48,0.72)_100%)]",
    orb: "bg-[radial-gradient(circle_at_30%_30%,rgba(147,197,253,0.45),rgba(30,58,105,0.75))] border-[1.5px] border-[rgba(191,219,254,0.75)] shadow-[0_0_25px_rgba(96,165,250,0.5),inset_0_0_12px_rgba(255,255,255,0.35)]",
    tag: "bg-[linear-gradient(90deg,#7dd3fc_0%,#f9a8d4_100%)]",
    accent: "text-sky-300 border-sky-300/15"
  },
  gold: {
    outer: "border-[1.5px] border-[rgba(251,191,36,0.55)] bg-[linear-gradient(180deg,rgba(251,191,36,0.08)_0%,rgba(36,36,48,0.25)_100%)] shadow-[0_15px_35px_-10px_rgba(0,0,0,0.5),0_0_25px_rgba(251,191,36,0.12)] hover:border-[rgba(253,224,71,0.9)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.6),0_0_35px_rgba(251,191,36,0.28)]",
    inner: "border border-[rgba(253,230,138,0.35)] bg-[linear-gradient(165deg,rgba(58,56,62,0.52)_0%,rgba(16,28,46,0.74)_100%)]",
    orb: "bg-[radial-gradient(circle_at_30%_30%,rgba(253,224,71,0.45),rgba(85,72,42,0.75))] border-[1.5px] border-[rgba(254,240,138,0.75)] shadow-[0_0_25px_rgba(251,191,36,0.45),inset_0_0_12px_rgba(255,255,255,0.35)]",
    tag: "bg-[linear-gradient(90deg,#bae6fd_0%,#fde047_100%)]",
    accent: "text-amber-300 border-amber-300/15"
  },
};

type WhyChooseCardProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  theme: keyof typeof themes;
  tag: string;
  benefits: readonly string[];
};

export default function WhyChooseCard({ title, description, icon: Icon, theme, tag, benefits }: WhyChooseCardProps) {
  const colors = themes[theme];
  return (
    <article className={`relative rounded-[22px] p-1.5 transition-[translate,transform,box-shadow,border-color] duration-600 ease-[cubic-bezier(0.4,0,0.2,1)] motion-safe:hover:-translate-y-2 ${colors.outer}`}>
      <div className={`relative flex h-full flex-col rounded-[17px] px-6 pb-5 pt-8 backdrop-blur-[14px] ${colors.inner}`}>
        <div className={`absolute -top-9 left-1/2 flex size-16 -translate-x-1/2 items-center justify-center rounded-full backdrop-blur-md ${colors.orb}`}>
          <Icon aria-hidden="true" className={`size-8 drop-shadow-[0_0_8px_currentColor] ${colors.accent}`} />
        </div>
        <div className="mb-3 flex justify-end">
          <span className={`rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-slate-900 shadow-sm ${colors.tag}`}>{tag}</span>
        </div>
        <div className="mb-4 text-center">
          <h3 className="mb-2.5 text-xl font-bold tracking-tight text-white">{title}</h3>
          <p className="text-[13.5px] leading-relaxed text-slate-200/85">{description}</p>
        </div>
        <ul className={`mt-auto space-y-2 border-t pt-3 text-[13.5px] ${colors.accent}`}>
          {benefits.map((benefit) => (
            <li key={benefit} className="flex items-start gap-2.5">
              <Check aria-hidden="true" strokeWidth={2.5} className="mt-0.5 size-4 shrink-0" />
              <span className="text-slate-100/95">{benefit}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
