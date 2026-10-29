"use client";

import Link from "next/link";
import { Gem } from "lucide-react";
import { useAccountResource } from "@/lib/account/useAccountResource";
import { getMembership } from "@/lib/membership/api";

export function AccountMembershipBadge() {
  const { data } = useAccountResource("membership", getMembership);
  return (
    <Link
      href="/account/membership"
      className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700"
    >
      <Gem size={14} />
      {data ? `Hạng ${data.tier.name}` : "Hạng thành viên"}
    </Link>
  );
}
