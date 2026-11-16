import { AccountShell } from "@/components/users/account_layout/UserAccountShell";
import type { ReactNode } from "react";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return <AccountShell>{children}</AccountShell>;
}
