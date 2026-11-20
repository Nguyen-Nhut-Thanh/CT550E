"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const CustomerChat = dynamic(() => import("@/components/chat/customer_chat/UserCustomerChat").then(module => module.CustomerChat), { ssr: false });

export function SupportChat({ aiEnabled = true }: { aiEnabled?: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("support-chat:open") === "true";
    }
    return false;
  });

  useEffect(() => {
    try {
      sessionStorage.setItem("support-chat:open", String(open));
    } catch {}
  }, [open]);

  if (pathname.startsWith("/admin")) return null;
  return <CustomerChat open={open} onOpenChange={setOpen} />;
}
