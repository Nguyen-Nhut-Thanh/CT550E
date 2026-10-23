"use client";

import CustomDropdown from "@/components/common/CustomDropdown";
import { PriceInput } from "@/components/common/PriceInput";
import { Tag } from "lucide-react";
import type { VoucherModalProps } from "shared";
import styles from "./VoucherModal.module.css";

export function VoucherInformation({ form, onChange, disabled, idPrefix }: Pick<VoucherModalProps, "form" | "onChange"> & { disabled: boolean; idPrefix: string }) {
  const percentage = form.discount_type === "percentage";
  const invalidDiscount = percentage && form.discount_value > 100;

  return (
    <section className={styles.panel} aria-labelledby={`${idPrefix}-information`}>
      <div className={styles.sectionHeading}>
        <span><Tag size={21} /></span>
        <div><h3 id={`${idPrefix}-information`}>Thông tin voucher</h3><p>Thiết lập mã, loại ưu đãi và điều kiện áp dụng</p></div>
      </div>
      <div className={styles.fieldGrid}>
        <div>
          <label htmlFor={`${idPrefix}-code`} className={styles.label}>Mã voucher</label>
          <input id={`${idPrefix}-code`} type="text" required autoComplete="off" placeholder="VD: GIAMHE20" value={form.code} onChange={event => onChange(current => ({ ...current, code: event.target.value.toUpperCase() }))} className={`${styles.input} uppercase`} />
        </div>
        <CustomDropdown label="Trạng thái" variant="compact" matchTriggerWidth className={styles.status} selectedValue={String(form.status)} options={[{ value: "1", label: "Hoạt động" }, { value: "0", label: "Tạm dừng" }]} onSelect={value => onChange(current => ({ ...current, status: Number(value) }))} />
      </div>

      <div className={styles.discountType}>
        <span className={styles.label} id={`${idPrefix}-type`}>Loại ưu đãi</span>
        <div role="group" aria-labelledby={`${idPrefix}-type`} className={styles.segmented}>
          <button type="button" aria-pressed={percentage} onClick={() => onChange(current => ({ ...current, discount_type: "percentage" }))}>Phần trăm (%)</button>
          <button type="button" aria-pressed={!percentage} onClick={() => onChange(current => ({ ...current, discount_type: "fixed_amount" }))}>Số tiền (VND)</button>
        </div>
      </div>

      <div className={styles.fieldGrid}>
        <div>
          <label htmlFor={`${idPrefix}-discount`} className={styles.label}>{percentage ? "Mức giảm (%)" : "Mức giảm (VND)"}</label>
          <PriceInput id={`${idPrefix}-discount`} label="" icon={null} suffix={percentage ? "%" : "đ"} value={form.discount_value} disabled={disabled} placeholder={percentage ? "10" : "50.000"} inputClassName={styles.input} error={invalidDiscount ? "Mức giảm tối đa là 100%." : undefined} onChange={value => onChange(current => ({ ...current, discount_value: value }))} />
          <p className={styles.hint}>{percentage ? "Mức giảm theo phần trăm (1 - 100)" : "Số tiền giảm cho mỗi đơn hàng"}</p>
        </div>
        <div>
          <label htmlFor={`${idPrefix}-minimum`} className={styles.label}>Đơn tối thiểu</label>
          <PriceInput id={`${idPrefix}-minimum`} label="" icon={null} value={form.min_order_value} disabled={disabled} placeholder="0" inputClassName={styles.input} onChange={value => onChange(current => ({ ...current, min_order_value: value }))} />
          <p className={styles.hint}>Giá trị đơn hàng tối thiểu để áp dụng</p>
        </div>
      </div>
    </section>
  );
}
