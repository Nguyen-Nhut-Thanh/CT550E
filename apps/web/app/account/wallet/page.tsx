import { AccountContent } from "@/components/users/account_layout/UserAccountContent";
import { AccountWalletTab } from "@/components/users/account_tabs/UserAccountWalletTab";

export default function WalletAccountPage() {
  return (
    <AccountContent className="min-h-[calc(100vh-66px)] bg-[#f4f8fc]">
      <AccountWalletTab />
    </AccountContent>
  );
}
