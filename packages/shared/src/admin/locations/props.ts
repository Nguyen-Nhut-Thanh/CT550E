import type * as ReactTypes from 'react';
import type { LocationDetailForm } from "./forms";
import type { AdminLocationItem } from "./models";
export type LocationDetailsCardProps = {
    form: LocationDetailForm;
    isNew: boolean;
    level3Id: string;
    level3List: AdminLocationItem[];
    onFormChange: (updater: (prev: LocationDetailForm) => LocationDetailForm) => void;
};
export type LocationHierarchyCardProps = {
    form: LocationDetailForm;
    level3Id: string;
    level4Id: string;
    level5Id: string;
    level3List: AdminLocationItem[];
    level4List: AdminLocationItem[];
    level5List: AdminLocationItem[];
    loadingL3: boolean;
    loadingL4: boolean;
    loadingL5: boolean;
    onLevel3Change: (value: string) => void;
    onLevel4Change: (value: string) => void;
    onLevel5Change: (value: string) => void;
};
export type LocationImageSidebarProps = {
    form: LocationDetailForm;
    uploading: boolean;
    saving: boolean;
    fileInputRef: ReactTypes.RefObject<HTMLInputElement | null>;
    onFormChange: (updater: (prev: LocationDetailForm) => LocationDetailForm) => void;
    onFileUpload: (event: ReactTypes.ChangeEvent<HTMLInputElement>) => void;
    onCancel: () => void;
    onSave: () => void;
};
export type LocationLevelSelectorProps = {
    form: LocationDetailForm;
    onLevelChange: (level: number) => void;
};
