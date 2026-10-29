import { AccountShell } from "@/components/account/layout/AccountShell";
import type { ReactNode } from "react";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return <AccountShell>{children}</AccountShell>;
}
