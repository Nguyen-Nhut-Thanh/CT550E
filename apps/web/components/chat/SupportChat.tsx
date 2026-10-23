"use client";

import { usePathname } from "next/navigation";
import { CustomerChat } from "./CustomerChat";

export function SupportChat() {
  const pathname = usePathname();
  return pathname.startsWith("/admin") ? null : <CustomerChat />;
}
