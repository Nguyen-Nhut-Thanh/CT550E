"use client";

import { useRef, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { VoucherForm } from "shared";
import { useDismiss } from "@/lib/ui/useDismiss";
import { VoucherTourPickerModal } from "./VoucherTourPickerModal";

const TOUR_TYPES = [
  { value: "domestic", label: "Trong nước" },
  { value: "outbound", label: "Ngoài nước" },
  { value: "international", label: "Quốc tế" },
] as const;

const TOUR_TYPE_LABELS: Record<string, string> = {
  domestic: "Trong nước",
  outbound: "Ngoài nước",
  international: "Quốc tế",
};

export function VoucherTourScopeCascading({
  form,
  onChange,
  disabled,
  idPrefix,
}: {
  form: VoucherForm;
  onChange: (updater: (current: VoucherForm) => VoucherForm) => void;
  disabled: boolean;
  idPrefix: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const [pickerModalOpen, setPickerModalOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useDismiss(containerRef, menuOpen, () => {
    setMenuOpen(false);
    setSubmenuOpen(false);
  });

  // Label text displayed in the trigger button
  const getTriggerLabel = () => {
    if (form.applicable_scope === "all") {
      return "Tất cả các tour";
    }
    if (form.applicable_scope === "tour_type") {
      return "Theo loại tour";
    }
    if (form.applicable_scope === "specific_tours") {
      if (form.applicable_tour_ids.length > 0) {
        return `Tour cụ thể (${form.applicable_tour_ids.length})`;
      }
      return "Tour cụ thể";
    }
    return "Tất cả các tour";
  };

  const handleSelectAllTours = () => {
    onChange((current) => ({
      ...current,
      applicable_scope: "all",
    }));
    setMenuOpen(false);
    setSubmenuOpen(false);
  };

  const handleSelectTourTypeScope = () => {
    onChange((current) => ({
      ...current,
      applicable_scope: "tour_type",
    }));
    setSubmenuOpen(true);
  };

  const handleToggleTourType = (typeValue: string) => {
    const isChecked = form.applicable_tour_types.includes(typeValue);
    onChange((current) => ({
      ...current,
      applicable_scope: "tour_type",
      applicable_tour_types: isChecked
        ? current.applicable_tour_types.filter((v) => v !== typeValue)
        : [...current.applicable_tour_types, typeValue],
    }));
  };

  const handleSelectSpecificToursScope = () => {
    onChange((current) => ({
      ...current,
      applicable_scope: "specific_tours",
    }));
    setMenuOpen(true);
    setSubmenuOpen(false);
    setPickerModalOpen(true);
  };

  const isScopeAll = form.applicable_scope === "all";
  const isScopeType = form.applicable_scope === "tour_type";
  const isScopeSpecific = form.applicable_scope === "specific_tours";

  return (
    <div ref={containerRef} className="relative min-w-0 w-full">
      <label
        htmlFor={`${idPrefix}-tour-scope-btn`}
        className="ui-voucher-modal-label block m-[0_0_7px] text-[#697e9f] text-[10px] font-[750] tracking-[.065em]! leading-[16px] uppercase truncate admin-short-tablet:mb-[5px]"
      >
        Phạm vi áp dụng tour
      </label>

      {/* Input / Dropdown Trigger Button */}
      <button
        ref={triggerRef}
        id={`${idPrefix}-tour-scope-btn`}
        type="button"
        disabled={disabled}
        onClick={() => {
          setMenuOpen((prev) => {
            const next = !prev;
            if (next && isScopeType) {
              setSubmenuOpen(true);
            } else if (!next) {
              setSubmenuOpen(false);
            }
            return next;
          });
        }}
        className="flex h-[44px] min-h-[44px] w-full min-w-0 items-center justify-between overflow-hidden rounded-[10px] border border-[#dce5f3] bg-white px-3 py-2 text-left text-[13px] font-semibold text-[#172340] outline-none focus:border-[#6c9eff] focus:ring-2 focus:ring-[#edf4ff] disabled:cursor-not-allowed disabled:bg-[#f7f9fc] admin-short-tablet:h-[40px] admin-short-tablet:min-h-[40px]"
      >
        <span className="truncate">{getTriggerLabel()}</span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-[#8191ae] transition-transform duration-150 ${
            menuOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Menu Cha (Dropdown List) */}
      {menuOpen && !disabled && (
        <div className="absolute left-0 top-[calc(100%+6px)] min-w-[190px] rounded-2xl border border-[#dce5f3] bg-white p-1.5 shadow-xl shadow-blue-900/10 z-50">
          <div className="space-y-0.5">
            {/* 1. Tất cả các tour */}
            <button
              type="button"
              onMouseEnter={() => setSubmenuOpen(false)}
              onClick={handleSelectAllTours}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-colors ${
                isScopeAll
                  ? "bg-[#edf5ff] text-[#095fff] font-bold"
                  : "text-[#334155] hover:bg-slate-50 font-medium"
              }`}
            >
              <span>Tất cả các tour</span>
              {isScopeAll && <span className="size-2 rounded-full bg-[#095fff] shrink-0" />}
            </button>

            {/* 2. Theo loại tour (Hover/Click mở Menu Con sang phải) */}
            <button
              type="button"
              onMouseEnter={() => setSubmenuOpen(true)}
              onClick={handleSelectTourTypeScope}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-colors ${
                isScopeType || submenuOpen
                  ? "bg-[#edf5ff] text-[#095fff] font-bold"
                  : "text-[#334155] hover:bg-slate-50 font-medium"
              }`}
            >
              <span>Theo loại tour</span>
              <div className="flex items-center gap-1.5">
                {isScopeType && <span className="size-2 rounded-full bg-[#095fff] shrink-0" />}
                <ChevronRight
                  size={14}
                  className={isScopeType || submenuOpen ? "text-[#095fff]" : "text-slate-400"}
                />
              </div>
            </button>

            {/* 3. Tour cụ thể */}
            <button
              type="button"
              onMouseEnter={() => setSubmenuOpen(false)}
              onClick={handleSelectSpecificToursScope}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-colors ${
                isScopeSpecific
                  ? "bg-[#edf5ff] text-[#095fff] font-bold"
                  : "text-[#334155] hover:bg-slate-50 font-medium"
              }`}
            >
              <span>Tour cụ thể</span>
              {isScopeSpecific && <span className="size-2 rounded-full bg-[#095fff] shrink-0" />}
            </button>
          </div>

          {/* Menu Con (Flyout Submenu bên phải) */}
          {submenuOpen && (
            <div className="absolute left-[calc(100%+6px)] top-[40px] min-w-[150px] rounded-2xl border border-[#dce5f3] bg-white p-1.5 shadow-xl shadow-blue-900/10 z-50">
              <div className="space-y-0.5">
                {TOUR_TYPES.map((t) => {
                  const isChecked = form.applicable_tour_types.includes(t.value);
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleTourType(t.value);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-colors ${
                        isChecked
                          ? "bg-[#edf5ff] text-[#095fff] font-bold"
                          : "text-[#334155] hover:bg-slate-50 font-medium"
                      }`}
                    >
                      <span>{t.label}</span>
                      {isChecked && <span className="size-2 rounded-full bg-[#095fff] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hint & Thông tin phụ bên dưới */}
      {isScopeAll && (
        <p className="ui-voucher-modal-hint mt-[7px] text-[#8191ae] text-[10px] leading-[1.6]">
          Áp dụng cho mọi tour trên hệ thống
        </p>
      )}

      {isScopeType && (
        <p className="ui-voucher-modal-hint mt-[7px] text-[#8191ae] text-[10px] leading-[1.6]">
          {form.applicable_tour_types.length > 0
            ? `Áp dụng cho: ${form.applicable_tour_types
                .map((t) => TOUR_TYPE_LABELS[t] || t)
                .join(", ")}`
            : "* Vui lòng tích chọn ít nhất 1 loại tour trong menu."}
        </p>
      )}

      {isScopeSpecific && (
        <p
          className={`ui-voucher-modal-hint mt-[7px] text-[#8191ae] text-[10px] leading-[1.6] ${
            !disabled ? "cursor-pointer hover:underline" : ""
          }`}
          onClick={() => {
            if (!disabled) setPickerModalOpen(true);
          }}
          title="Bấm để mở popup chọn tour"
        >
          Đã chọn:{" "}
          <span className="font-semibold text-[#095fff]">
            {form.applicable_tour_ids.length} tour
          </span>
        </p>
      )}

      {/* Popup Modal Chọn Tour */}
      <VoucherTourPickerModal
        open={pickerModalOpen}
        onClose={() => setPickerModalOpen(false)}
        selectedIds={form.applicable_tour_ids}
        anchorRef={triggerRef}
        onSave={(ids) => {
          onChange((current) => ({
            ...current,
            applicable_tour_ids: ids,
          }));
        }}
      />
    </div>
  );
}
