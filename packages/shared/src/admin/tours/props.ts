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
export type TourPoliciesAccordionEditorProps = {
    value: TourPolicyContentMap | undefined;
    onChange: (next: TourPolicyContentMap) => void;
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
