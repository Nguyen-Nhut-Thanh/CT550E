"use client";

import { Dialog } from "@/components/common/Dialog";
import { Loader2, Save, Ticket, X } from "lucide-react";
import { useId } from "react";
import type { VoucherModalProps } from "shared";
import { VoucherInformation } from "./VoucherInformation";
import { VoucherPreview } from "./VoucherPreview";
import { VoucherTiming } from "./VoucherTiming";
import styles from "./VoucherModal.module.css";

export function VoucherModal(props: VoucherModalProps) {
  const id = useId();
  const { open, saving, readonly, form, title, onClose, onSave, onChange } = props;
  if (!open) return null;

  const close = () => { if (!saving) onClose(); };
  const invalidDiscount = form.discount_type === "percentage" && form.discount_value > 100;

  return (
    <Dialog onClose={close} labelledBy={`${id}-title`} describedBy={`${id}-description`} overlayClassName="bg-slate-950/50">
      <form className={styles.modal} onSubmit={event => { event.preventDefault(); if (!readonly && !saving && !invalidDiscount) onSave(); }}>
        <header className={styles.header}>
          <span className={styles.titleIcon}><Ticket size={27} /></span>
          <div className="min-w-0 flex-1">
            <h2 id={`${id}-title`}>{title}</h2>
            <p id={`${id}-description`}>{readonly ? "Thông tin chương trình ưu đãi đã tạo" : "Thiết lập chương trình ưu đãi cho khách hàng"}</p>
          </div>
          <button type="button" onClick={close} disabled={saving} aria-label="Đóng voucher" className={styles.closeButton}><X size={23} /></button>
        </header>

        <div className={styles.body}>
          <fieldset disabled={readonly || saving} className={styles.columns}>
            <legend className="sr-only">Thiết lập voucher</legend>
            <VoucherInformation form={form} onChange={onChange} disabled={readonly || saving} idPrefix={id} />
            <VoucherTiming {...props} disabled={readonly || saving} idPrefix={id} />
          </fieldset>
          <VoucherPreview form={form} />
        </div>

        <footer className={styles.footer}>
          {readonly && <p>Voucher đã tạo chỉ có thể xem lại.</p>}
          <button type="button" onClick={close} disabled={saving} className={styles.cancelButton}>{readonly ? "Đóng" : "Hủy bỏ"}</button>
          <button type="submit" disabled={saving || readonly || invalidDiscount} title={readonly ? "Voucher đã tạo chỉ có thể xem lại" : undefined} className={styles.saveButton}>
            {saving ? <Loader2 size={19} className="animate-spin" /> : <Save size={19} />}
            {readonly ? "Không thể chỉnh sửa" : saving ? "Đang lưu..." : "Lưu voucher"}
          </button>
        </footer>
      </form>
    </Dialog>
  );
}
