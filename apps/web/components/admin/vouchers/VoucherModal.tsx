"use client";

import { Dialog } from "@/components/common/overlays/Dialog";
import { Loader2, Save, Ticket, X } from "lucide-react";
import { useId } from "react";
import type { VoucherModalProps } from "shared";
import { VoucherInformation } from "./VoucherInformation";
import { VoucherPreview } from "./VoucherPreview";
import { VoucherTiming } from "./VoucherTiming";

export function VoucherModal(props: VoucherModalProps) {
  const id = useId();
  const { open, saving, readonly, form, title, onClose, onSave, onChange } =
    props;
  if (!open) return null;

  const close = () => {
    if (!saving) onClose();
  };
  const invalidDiscount =
    form.discount_type === "percentage" && form.discount_value > 100;

  return (
    <Dialog
      onClose={close}
      labelledBy={`${id}-title`}
      describedBy={`${id}-description`}
      overlayClassName="bg-slate-950/50"
    >
      <form
        className="ui-voucher-modal-modal flex flex-col w-[min(960px,_calc(100vw_-_64px))] max-w-full max-h-[calc(100dvh_-_48px)] my-[auto] overflow-hidden [border:1px_solid_#edf1f8] rounded-[24px] [background:#fff] text-[#14213c] [box-shadow:0_30px_90px_#0b19344d] [&_button:focus-visible]:[outline:2px_solid_#79a9ff] [&_button:focus-visible]:outline-offset-[3px] admin-max-799:w-[min(640px,_calc(100vw_-_40px))] admin-max-479:w-full admin-max-479:max-h-[calc(100dvh_-_32px)] admin-max-479:rounded-[19px]"
        onSubmit={(event) => {
          event.preventDefault();
          if (!readonly && !saving && !invalidDiscount) onSave();
        }}
      >
        <header className="ui-voucher-modal-header flex items-center gap-[16px] p-[24px_24px_20px] [&_h2]:text-[25px] [&_h2]:font-extrabold [&_h2]:tracking-[-.035em]! [&_h2]:leading-[1.3] [&_p]:mt-[3px] [&_p]:text-[#7786a3] [&_p]:text-[13px] [&_p]:leading-[1.5] admin-short-tablet:py-[16px_14px] admin-max-479:gap-[10px] admin-max-479:p-[18px_16px] admin-max-479:[&_h2]:text-[19px] admin-max-479:[&_p]:text-[11px]">
          <span className="ui-voucher-modal-titleIcon grid shrink-0 w-[54px] h-[54px] place-items-center rounded-[17px] [background:#eaf3ff] text-[#075bff] admin-max-479:w-[40px] admin-max-479:h-[40px] admin-max-479:rounded-[12px]">
            <Ticket size={27} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id={`${id}-title`}>{title}</h2>
            <p id={`${id}-description`}>
              {readonly
                ? "Thông tin chương trình ưu đãi đã tạo"
                : "Thiết lập chương trình ưu đãi cho khách hàng"}
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            disabled={saving}
            aria-label="Đóng voucher"
            className="ui-voucher-modal-closeButton grid shrink-0 w-[38px] h-[38px] place-items-center rounded-[12px] [background:#f2f6fc] text-[#7185a7] [&:hover]:[background:#e7eef9] [&:disabled]:cursor-not-allowed [&:disabled]:opacity-[.55] admin-max-479:w-[32px] admin-max-479:h-[32px]"
          >
            <X size={23} />
          </button>
        </header>

        <div className="ui-voucher-modal-body min-h-0 overflow-y-auto p-[0_24px_20px] [scrollbar-width:thin] [scrollbar-color:#d5dfee_transparent] admin-short-tablet:pb-[14px] admin-max-479:p-[0_12px_14px]">
          <fieldset
            disabled={readonly || saving}
            className="ui-voucher-modal-columns grid grid-cols-[minmax(0,_1.35fr)_minmax(0,_1fr)] gap-[14px] min-w-0 [border:0] p-[0] admin-max-799:grid-cols-[minmax(0,_1fr)]"
          >
            <legend className="sr-only">Thiết lập voucher</legend>
            <VoucherInformation
              form={form}
              onChange={onChange}
              disabled={readonly || saving}
              idPrefix={id}
            />
            <VoucherTiming
              {...props}
              disabled={readonly || saving}
              idPrefix={id}
            />
          </fieldset>
          <VoucherPreview form={form} />
        </div>

        <footer className="ui-voucher-modal-footer flex shrink-0 items-center justify-end gap-[12px] [border-top:1px_solid_#edf1f8] p-[16px_24px] [background:#fff] [&>p]:[flex:1] [&>p]:text-[#7a8aaa] [&>p]:text-[11px] admin-short-tablet:py-[12px] admin-max-479:gap-[10px] admin-max-479:flex-wrap admin-max-479:p-[12px] admin-max-479:[&>p]:[flex-basis:100%]">
          {readonly && <p>Voucher đã tạo chỉ có thể xem lại.</p>}
          <button
            type="button"
            onClick={close}
            disabled={saving}
            className="ui-voucher-modal-cancelButton flex min-h-[44px] items-center justify-center gap-[9px] [border:1px_solid_#dce5f3] rounded-[12px] p-[10px_24px] text-[13px] font-bold min-w-[170px] [background:#fff] text-[#657895] [&:hover]:[background:#f6f9fe] [&:disabled]:cursor-not-allowed [&:disabled]:opacity-[.55] admin-max-479:[flex:1] admin-max-479:min-w-0 admin-max-479:px-[12px]"
          >
            {readonly ? "Đóng" : "Hủy bỏ"}
          </button>
          <button
            type="submit"
            disabled={saving || readonly || invalidDiscount}
            title={readonly ? "Voucher đã tạo chỉ có thể xem lại" : undefined}
            className="ui-voucher-modal-saveButton flex min-h-[44px] items-center justify-center gap-[9px] [border:1px_solid_#095fff] rounded-[12px] p-[10px_24px] text-[13px] font-bold min-w-[235px] [background:#095fff] text-[#fff] [box-shadow:0_3px_8px_#0b60ff1f] [&:hover]:[background:#034ee1] [&:disabled]:cursor-not-allowed [&:disabled]:opacity-[.55] admin-max-479:[flex:1] admin-max-479:min-w-0 admin-max-479:px-[12px]"
          >
            {saving ? (
              <Loader2 size={19} className="animate-spin" />
            ) : (
              <Save size={19} />
            )}
            {readonly
              ? "Không thể chỉnh sửa"
              : saving
                ? "Đang lưu..."
                : "Lưu voucher"}
          </button>
        </footer>
      </form>
    </Dialog>
  );
}
