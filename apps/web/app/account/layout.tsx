import { AccountShell } from "@/components/account/AccountShell";
import type { ReactNode } from "react";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return <AccountShell>{children}</AccountShell>;
}
