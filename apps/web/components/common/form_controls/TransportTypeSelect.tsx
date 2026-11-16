"use client";

import { useMemo, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Bus, Car, Plane, Ship, Train } from "lucide-react";
import CustomDropdown from "@/components/common/form_controls/CustomDropdown";

export interface TransportLike {
  transport_id: number;
  name?: string;
  transport_type?: string | null;
  type?: string | null;
  capacity?: number | null;
  provider_name?: string | null;
  providers?: { name: string } | null;
}

export interface TransportTypeSelectProps {
  value?: number | string | null;
  transports?: TransportLike[];
  onChange: (transportId: string) => void;
  allowEmpty?: boolean;
  emptyLabel?: string;
  placeholder?: string;
  ariaLabel?: string;
  disabled?: boolean;
  className?: string;
  showIcon?: boolean;
}

export function getTransportTypeLabel(type: string): string {
  const normalized = (type || "").trim().toLowerCase();
  switch (normalized) {
    case "flight":
      return "Máy bay (Hàng không)";
    case "train":
      return "Tàu hỏa (Xe lửa)";
    case "bus":
      return "Xe khách";
    case "car":
      return "Xe ô tô / Xe du lịch";
    case "boat":
      return "Tàu thủy / Du thuyền";
    default:
      if (
        normalized.includes("bay") ||
        normalized.includes("plane") ||
        normalized.includes("flight") ||
        normalized.includes("hàng không")
      ) {
        return "Máy bay (Hàng không)";
      }
      if (
        normalized.includes("tàu") ||
        normalized.includes("lửa") ||
        normalized.includes("train") ||
        normalized.includes("đường sắt")
      ) {
        return "Tàu hỏa (Xe lửa)";
      }
      if (
        normalized.includes("thủy") ||
        normalized.includes("thuyền") ||
        normalized.includes("boat") ||
        normalized.includes("ship")
      ) {
        return "Tàu thủy / Du thuyền";
      }
      if (normalized.includes("khách") || normalized.includes("bus")) {
        return "Xe khách";
      }
      if (normalized.includes("ô tô") || normalized.includes("car")) {
        return "Xe ô tô / Xe du lịch";
      }
      return type ? type.charAt(0).toUpperCase() + type.slice(1) : "Khác";
  }
}

export function getTransportTypeIconComponent(type: string): LucideIcon {
  const normalized = (type || "").trim().toLowerCase();
  if (
    normalized.includes("flight") ||
    normalized.includes("bay") ||
    normalized.includes("plane") ||
    normalized.includes("hàng không")
  ) {
    return Plane;
  }
  if (
    normalized.includes("train") ||
    normalized.includes("lửa") ||
    normalized.includes("tàu") ||
    normalized.includes("đường sắt")
  ) {
    return Train;
  }
  if (
    normalized.includes("boat") ||
    normalized.includes("ship") ||
    normalized.includes("thủy") ||
    normalized.includes("thuyền")
  ) {
    return Ship;
  }
  if (normalized.includes("bus") || normalized.includes("khách")) {
    return Bus;
  }
  return Car;
}

export function getTransportTypeIcon(type: string, className?: string): ReactNode {
  const Icon = getTransportTypeIconComponent(type);
  const normalized = (type || "").trim().toLowerCase();

  let colorClass = "text-blue-500";
  if (
    normalized.includes("flight") ||
    normalized.includes("bay") ||
    normalized.includes("plane") ||
    normalized.includes("hàng không")
  ) {
    colorClass = "text-sky-500";
  } else if (
    normalized.includes("train") ||
    normalized.includes("lửa") ||
    normalized.includes("tàu")
  ) {
    colorClass = "text-amber-500";
  } else if (
    normalized.includes("boat") ||
    normalized.includes("ship") ||
    normalized.includes("thủy") ||
    normalized.includes("thuyền")
  ) {
    colorClass = "text-cyan-500";
  } else if (normalized.includes("bus") || normalized.includes("khách")) {
    colorClass = "text-indigo-500";
  }

  return <Icon size={15} className={className || colorClass} />;
}

export function TransportTypeSelect({
  value,
  transports = [],
  onChange,
  allowEmpty = true,
  emptyLabel = "Không gán phương tiện",
  placeholder = "Chọn phương tiện chính",
  ariaLabel = "Phương tiện di chuyển",
  disabled = false,
  className = "",
  showIcon = true,
}: TransportTypeSelectProps) {
  const options = useMemo(() => {
    const typeMap = new Map<
      string,
      { transport_id: number; label: string; order: number; type: string }
    >();

    const typeOrder: Record<string, number> = {
      car: 1,
      bus: 2,
      flight: 3,
      train: 4,
      boat: 5,
    };

    for (const item of transports) {
      const rawType = (
        item.transport_type ||
        item.type ||
        "car"
      )
        .trim()
        .toLowerCase();
      if (!typeMap.has(rawType)) {
        typeMap.set(rawType, {
          transport_id: item.transport_id,
          label: getTransportTypeLabel(rawType),
          order: typeOrder[rawType] ?? 99,
          type: rawType,
        });
      }
    }

    const sorted = Array.from(typeMap.values()).sort(
      (a, b) => a.order - b.order
    );

    const result = sorted.map((info) => ({
      value: String(info.transport_id),
      label: info.label,
      type: info.type,
    }));

    if (allowEmpty) {
      return [{ value: "", label: emptyLabel, type: "" }, ...result];
    }
    return result;
  }, [transports, allowEmpty, emptyLabel]);

  // Tìm phương tiện tương ứng trong danh sách để xác định transport_type
  const currentTransport = transports.find(
    (item) => String(item.transport_id) === String(value)
  );
  const currentType = currentTransport
    ? (currentTransport.transport_type || currentTransport.type || "")
        .trim()
        .toLowerCase()
    : "";

  const matchedOption = options.find((opt) => {
    if (!value) return opt.value === "";
    return (
      opt.value === String(value) ||
      (opt.type && opt.type === currentType)
    );
  });

  const selectedValue = matchedOption
    ? matchedOption.value
    : value
      ? String(value)
      : "";

  const activeType = matchedOption?.type || currentType || (options[0]?.type ?? "car");
  const CurrentIcon = showIcon
    ? getTransportTypeIconComponent(value ? activeType : "")
    : undefined;

  return (
    <fieldset disabled={disabled} className="min-w-0 w-full disabled:opacity-60">
      <CustomDropdown
        ariaLabel={ariaLabel}
        selectedValue={selectedValue}
        options={options}
        onSelect={(val) => onChange(val)}
        icon={CurrentIcon}
        placeholder={placeholder}
        variant="compact"
        matchTriggerWidth
        className={className}
      />
    </fieldset>
  );
}

export default TransportTypeSelect;

