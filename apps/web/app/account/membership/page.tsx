import { AccountContent } from "@/components/users/account_layout/UserAccountContent";
import { AccountMembershipTab } from "@/components/users/account_tabs/UserAccountMembershipTab";

export default function MembershipAccountPage() {
  return (
    <AccountContent>
      <AccountMembershipTab />
    </AccountContent>
  );
}
