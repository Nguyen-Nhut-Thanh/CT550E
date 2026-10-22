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

export type Voucher = {
  voucher_id: number;
  code: string;
  discount_type: string;
  discount_value: number | string;
  min_order_value: number | string;
  max_discount_amount: number | string | null;
  usage_limit: number;
  used_count: number;
  start_date: string;
  expiry_date: string;
  status: number;
};

export type VoucherForm = {
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_value: number;
  max_discount_amount: number | null;
  usage_limit: number;
  start_date: string;
  duration_hours: number;
  status: number;
};

export type VoucherStatusFilter = "all" | "active" | "expired";
