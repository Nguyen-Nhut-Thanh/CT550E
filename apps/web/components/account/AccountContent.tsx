import type { ReactNode } from "react";

/** Shared page width and gutters for every account sidebar destination. */
export function AccountContent({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`min-w-0 p-4 sm:p-6 lg:p-8 ${className}`}>
      <div className="mx-auto w-full max-w-[1240px]">{children}</div>
    </div>
  );
}
