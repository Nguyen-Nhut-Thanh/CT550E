import { AccountContent } from "@/components/users/account_layout/UserAccountContent";
import { AccountNotificationsTab } from "@/components/users/account_tabs/UserAccountNotificationsTab";

export default function NotificationsAccountPage() {
  return (
    <AccountContent>
      <AccountNotificationsTab />
    </AccountContent>
  );
}
