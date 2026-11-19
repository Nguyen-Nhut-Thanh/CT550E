import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

const gradients = {
  blue: "from-blue-600 to-indigo-600",
  green: "from-emerald-600 to-teal-600",
  purple: "from-purple-600 to-violet-600",
  indigo: "from-indigo-600 to-violet-600",
  amber: "from-amber-600 to-orange-600",
  orange: "from-orange-500 to-amber-600",
  rose: "from-rose-600 to-pink-600",
  cyan: "from-cyan-600 to-blue-600",
  slate: "from-slate-500 to-slate-700",
};

export type AdminStatTone = keyof typeof gradients;
const borders: Record<AdminStatTone, string> = {
  blue: "border-blue-100", green: "border-emerald-100", purple: "border-purple-100",
  indigo: "border-indigo-100", amber: "border-amber-100", orange: "border-orange-100",
  rose: "border-rose-100", cyan: "border-cyan-100", slate: "border-slate-200",
};
interface AdminStatCardProps {
  title: string;
  value: ReactNode;
  icon: LucideIcon;
  description?: ReactNode;
  tone?: AdminStatTone;
  gradient?: string;
  badge?: ReactNode;
  loading?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
  children?: ReactNode;
}

/** Shared admin metric card, based on the Dashboard's original revenue card. */
export function AdminStatCard({
  title, value, icon: Icon, description, tone = "blue", gradient, badge,
  loading = false, onClick, disabled = false, className = "", ariaLabel, children,
}: AdminStatCardProps) {
  const resolvedTone = gradient ? (Object.keys(gradients) as AdminStatTone[]).find(key => gradients[key] === gradient) || tone : tone;
  const classes = `min-w-0 rounded-[14px] border ${borders[resolvedTone]} bg-white px-4 py-3 text-left font-sans shadow-sm ${onClick ? "cursor-pointer transition-colors hover:border-blue-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none" : ""} ${className}`;
  const content = (
    <>
      <div className={`flex min-w-0 items-center gap-3 ${children == null ? "h-full" : ""}`}>
        <span aria-hidden="true" className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${gradient || gradients[tone]} text-white shadow-sm`}>
          <Icon size={21} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
            <p className="text-[10px] font-semibold uppercase leading-[1.5] tracking-wide text-slate-500">{title}</p>
            {badge != null && <span className="inline-flex shrink-0 items-center text-[10px] font-semibold leading-none">{badge}</span>}
          </div>
          <p className="mt-1 break-words text-xl font-extrabold leading-6 tracking-tight text-slate-950">{loading ? "—" : value}</p>
          {description != null && <p className="mt-1 text-[11px] leading-4 text-slate-500">{description}</p>}
        </div>
      </div>
      {children != null && <div className="mt-3">{children}</div>}
    </>
  );
  return onClick ? (
    <button type="button" data-admin-stat-card="" className={classes} onClick={onClick} disabled={disabled || loading} aria-busy={loading || undefined} aria-label={ariaLabel}>{content}</button>
  ) : (
    <div data-admin-stat-card="" className={classes} aria-busy={loading || undefined}>{content}</div>
  );
}
