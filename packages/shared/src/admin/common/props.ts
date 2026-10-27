import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
export type AdminBackPageHeaderProps = {
    title: string;
    description?: string;
    onBack: () => void;
    meta?: ReactNode;
    actions?: ReactNode;
};
export type AdminDatePickerProps = {
    variant?: "default" | "compact";
    label?: string;
    value: string;
    minDate?: string;
    disabled?: boolean;
    placeholder?: string;
    allowManualInput?: boolean;
    onChange: (date: string) => void;
};
export type AdminFormCardProps = {
    title?: string;
    icon?: ReactNode;
    children: ReactNode;
    className?: string;
    bodyClassName?: string;
    headerClassName?: string;
    titleClassName?: string;
};
export type AdminIconActionTone = "neutral" | "primary" | "danger";
export type AdminIconActionButtonProps = {
    icon: ReactNode;
    title: string;
    tone?: AdminIconActionTone;
    onClick?: () => void;
    href?: string;
    target?: string;
    rel?: string;
};
export type AdminModalShellProps = {
    title: string;
    icon?: ReactNode;
    onClose: () => void;
    children: ReactNode;
    footer?: ReactNode;
    maxWidthClassName?: string;
};
export interface AdminPageHeaderProps {
    title: string;
    description?: string;
    actions?: ReactNode;
    primaryAction?: {
        label: string;
        onClick: () => void;
        icon?: ReactNode;
    };
}
export type AdminPaginationProps = {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    itemLabel?: string;
    variant?: "simple" | "numbered";
    showSinglePage?: boolean;
    onPageChange: (page: number) => void;
};
export type AdminSearchInputProps = {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    roundedClassName?: string;
    className?: string;
};
export type AdminStatusBadgeTone = "success" | "warning" | "muted";
export type AdminStatusBadgeProps = {
    tone: AdminStatusBadgeTone;
    icon?: ReactNode;
    children: ReactNode;
    className?: string;
};
export interface AdminTableColumn<T> {
    header: string;
    render: (item: T, index: number) => ReactNode;
    className?: string;
    align?: "left" | "center" | "right";
}
export interface AdminTableAction<T> {
    icon: ReactNode | ((item: T) => ReactNode);
    title: string | ((item: T) => string);
    tone?: "neutral" | "primary" | "danger";
    onClick: (item: T) => void;
}
export interface AdminTableProps<T> {
    items: T[];
    columns: AdminTableColumn<T>[];
    loading?: boolean;
    emptyMessage?: string;
    onEdit?: (item: T) => void;
    onDelete?: (item: T) => void;
    rowKey: (item: T) => string | number;
    pageSize?: number;
    itemLabel?: string;
    extraActions?: AdminTableAction<T>[];
}
export interface ImageUploadProps {
    value?: string | string[];
    onChange: (url: string | string[]) => void;
    multiple?: boolean;
    endpoint?: string;
    label?: string;
    maxFiles?: number;
}
export interface PriceInputProps {
    id?: string;
    inputClassName?: string;
    label: string;
    value: number | string;
    onChange: (value: number) => void;
    placeholder?: string;
    icon?: LucideIcon | null;
    suffix?: string;
    error?: string;
    disabled?: boolean;
}
