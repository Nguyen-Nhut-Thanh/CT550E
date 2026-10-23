import type { TourPolicyContentMap } from "../../tours/policies";
import type { TourDetailForm } from "./forms";
import type { LocationOption, TransportOption } from "./models";
export type TourBasicInfoCardProps = {
    tour: TourDetailForm;
    locations: LocationOption[];
    transports: TransportOption[];
    lockCoreFields?: boolean;
    onTourChange: (updater: (prev: TourDetailForm) => TourDetailForm) => void;
};
export type TourDetailsCardProps = {
    tour: TourDetailForm;
    onTourChange: (updater: (prev: TourDetailForm) => TourDetailForm) => void;
};
export type TourPoliciesAccordionEditorProps = {
    value: TourPolicyContentMap | undefined;
    onChange: (next: TourPolicyContentMap) => void;
};
export type TourSidebarProps = {
    tour: TourDetailForm;
    saving: boolean;
    success: boolean;
    lockCoreFields?: boolean;
    onSave: () => void;
    onTourChange: (updater: (prev: TourDetailForm) => TourDetailForm) => void;
};
