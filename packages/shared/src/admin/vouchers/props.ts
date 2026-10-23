import type { VoucherForm, VoucherStatusFilter } from "./forms";
export type VoucherModalProps = {
    open: boolean;
    saving: boolean;
    readonly: boolean;
    form: VoucherForm;
    minDate: string;
    minTime: string;
    startDateValue: string;
    startTimeValue: string;
    title: string;
    onClose: () => void;
    onSave: () => void;
    onChange: (updater: (current: VoucherForm) => VoucherForm) => void;
    onStartDateChange: (value: string) => void;
    onStartTimeChange: (value: string) => void;
};
export type VoucherStatusFilterTabsProps = {
    value: VoucherStatusFilter;
    onChange: (value: VoucherStatusFilter) => void;
};
