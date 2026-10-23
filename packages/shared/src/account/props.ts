import type { FavoriteTourItem } from "../favorites/models";
import type { AccountBooking, AccountStats, UserProfile } from "./models";
export interface AccountSidebarProps {
    activeTab?: string;
    setActiveTab?: (tab: string) => void;
    user?: UserProfile | null;
}
export interface AccountRightSidebarProps {
    user: UserProfile | null;
    setActiveTab?: (tab: string) => void;
}
export interface AccountOverviewProps {
    user: UserProfile | null;
    stats: AccountStats | null;
    bookings: AccountBooking[];
    favorites: FavoriteTourItem[];
    loading: boolean;
    setActiveTab: (tab: string) => void;
}
export type AccountOverviewTabProps = Omit<AccountOverviewProps, "setActiveTab"> & Partial<Pick<AccountOverviewProps, "setActiveTab">>;
export interface AccountUserProps {
    user: UserProfile | null;
}
export interface AccountFavoritesTabProps {
    favorites?: FavoriteTourItem[];
}
export interface AccountBookingsTabProps {
    bookings?: AccountBooking[];
}
