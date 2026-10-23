import type { FlashDealForm } from "./forms";
import type { FlashDealSchedule } from "./models";
export type FlashDealModalProps = {
    open: boolean;
    saving: boolean;
    schedule: FlashDealSchedule | null;
    form: FlashDealForm;
    onClose: () => void;
    onChange: (updater: (current: FlashDealForm) => FlashDealForm) => void;
    onSave: () => void;
};
