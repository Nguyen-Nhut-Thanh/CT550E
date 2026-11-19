import type { ComponentProps } from "react";
import { AdminStatCard } from "./AdminStatCard";

export type AdminStatItem = ComponentProps<typeof AdminStatCard> & { id: string };

export function AdminStatGrid({ items, loading = false, compact = false, className = "", label = "Thống kê tổng quan" }: {
  items: AdminStatItem[];
  loading?: boolean;
  compact?: boolean;
  className?: string;
  label?: string;
}) {
  return (
    <section aria-label={label} aria-busy={loading || undefined} className={`grid shrink-0 gap-3 ${compact ? "grid-cols-2 xl:grid-cols-4" : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"} ${className}`}>
      {items.map(({ id, ...item }) => <AdminStatCard key={id} {...item} loading={item.loading ?? loading} />)}
    </section>
  );
}
