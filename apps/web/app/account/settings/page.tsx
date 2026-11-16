"use client";

import { AccountContent } from "@/components/users/account_layout/UserAccountContent";
import { AccountSettingsTab } from "@/components/users/account_tabs/UserAccountSettingsTab";
import { useAccount } from "@/components/users/account_layout/UserAccountShell";

export default function SettingsAccountPage() {
  const { user, updateUser } = useAccount();
  return (
    <AccountContent className="min-h-[calc(100vh-66px)] bg-[radial-gradient(ellipse_at_top_right,#e0f1ff_0%,#f1f7fe_40%,#f5f8fc_75%)]">
      <AccountSettingsTab user={user} onProfileSaved={updateUser} />
    </AccountContent>
  );
}
