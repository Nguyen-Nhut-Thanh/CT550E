import type { TourPolicyContentMap } from "../../tours/policies";
import type { TourDetailForm } from "./forms";
import type { LocationOption, TransportOption } from "./models";
export type TourBasicInfoCardProps<T extends TourDetailForm = TourDetailForm> = {
    tour: T;
    mode?: 'create' | 'edit';
    locations: LocationOption[];
    transports: TransportOption[];
    lockCoreFields?: boolean;
    onTourChange: (updater: (prev: T) => T) => void;
};
export type TourDetailsCardProps = {
    tour: TourDetailForm;
    onTourChange: (updater: (prev: TourDetailForm) => TourDetailForm) => void;
};
export type TourPoliciesEditorProps = {
    value: TourPolicyContentMap | undefined;
    onChange: (next: TourPolicyContentMap) => void;
    activeKey: import('../../tours/policies').TourPolicyKey;
    onActiveChange: (key: import('../../tours/policies').TourPolicyKey) => void;
    disabled?: boolean;
};
export type TourSidebarProps<T extends TourDetailForm = TourDetailForm> = {
    tour: T;
    mode?: 'create' | 'edit';
    saving: boolean;
    success: boolean;
    lockCoreFields?: boolean;
    onSave: () => void;
    onTourChange: (updater: (prev: T) => T) => void;
};
