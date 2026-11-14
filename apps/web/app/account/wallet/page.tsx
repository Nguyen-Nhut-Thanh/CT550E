import { AccountContent } from "@/components/account/layout/AccountContent";
import { AccountWalletTab } from "@/components/account/wallet/AccountWalletTab";

export default function WalletAccountPage() {
  return (
    <AccountContent className="min-h-[calc(100vh-66px)] bg-[#f4f8fc]">
      <AccountWalletTab />
    </AccountContent>
  );
}
