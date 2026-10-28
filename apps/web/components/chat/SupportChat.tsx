"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

const CustomerChat = dynamic(() => import("./CustomerChat").then(module => module.CustomerChat), { ssr: false });

export function SupportChat() {
  const pathname = usePathname();
  return pathname.startsWith("/admin") ? null : <CustomerChat />;
}
