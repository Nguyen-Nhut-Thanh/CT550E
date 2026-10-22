import type { LucideIcon } from 'lucide-react';
import type { MouseEventHandler, ReactNode } from 'react';

export type ConfirmDialogProps = {
  open: boolean;
  icon: ReactNode;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmClassName?: string;
};

export type DropdownOption = {
  label: string;
  value: string;
};

export type CustomDropdownProps = {
  label?: string;
  placeholder?: string;
  options: DropdownOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  icon?: LucideIcon;
  className?: string;
  variant?: "default" | "minimal" | "compact";
  matchTriggerWidth?: boolean;
};

export type FavoriteButtonProps = {
  active: boolean;
  loading?: boolean;
  onClick: MouseEventHandler<HTMLButtonElement>;
  className?: string;
  iconClassName?: string;
  label?: string;
};

export type FormFieldLabelProps = {
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
};

export interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
}

export type InlineNoticeProps = {
  tone: "error" | "success";
  children: ReactNode;
  className?: string;
};

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

export interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

export type ToastListener = (toasts: Toast[]) => void;

export type TransportIconProps = {
  type?: string | null;
  className?: string;
};
