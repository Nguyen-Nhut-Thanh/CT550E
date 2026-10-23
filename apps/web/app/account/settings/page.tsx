"use client";

import { AccountContent } from "@/components/account/AccountContent";
import { AccountSettingsTab } from "@/components/account/AccountSettingsTab";
import { useAccount } from "@/components/account/AccountShell";

export default function SettingsAccountPage() {
  const { user, updateUser } = useAccount();
  return (
    <AccountContent className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,#e0f1ff_0%,#f1f7fe_40%,#f5f8fc_75%)]">
      <AccountSettingsTab user={user} onProfileSaved={updateUser} />
    </AccountContent>
  );
}
