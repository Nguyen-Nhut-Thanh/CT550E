export type DateTimePickerProps = {
  /** Giá trị ngày–giờ theo múi giờ cục bộ; null khi chưa chọn. */
  value: Date | null;
  onChange: (value: Date | null) => void;
  /** Giới hạn cả ngày và giờ, với độ chính xác đến phút. */
  minDate?: Date;
  maxDate?: Date;
  /** Ẩn dòng tóm tắt khi khung chứa có thanh xác nhận riêng. */
  showSummary?: boolean;
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
  id?: string;
  label?: string;
  placeholder?: string;
  error?: string;
};

export type TimePickerProps = {
  /** Giá trị theo định dạng 24 giờ HH:mm; giao diện hiển thị AM/PM. */
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  locale?: "vi-VN" | "en-US";
  ariaLabel?: string;
  className?: string;
};

export type TimeInputProps = TimePickerProps & {
  id?: string;
  label?: string;
  placeholder?: string;
  error?: string;
};
