export type DateTimePickerProps = {
  /** Giá trị ngày–giờ theo múi giờ cục bộ; null khi chưa chọn. */
  value: Date | null;
  onChange: (value: Date | null) => void;
  /** Giới hạn cả ngày và giờ, với độ chính xác đến phút. */
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  locale?: "vi-VN" | "en-US";
  className?: string;
  ariaLabel?: string;
};

export type DateTimeColumnProps = {
  label: string;
  options: { value: number; label: string; disabled?: boolean }[];
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  compact?: boolean;
};

export type DateTimeInputProps = DateTimePickerProps & {
  label: string;
  placeholder?: string;
  error?: string;
};
