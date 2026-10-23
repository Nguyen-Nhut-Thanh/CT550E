"use client";

import { AdminDatePicker } from "@/components/common/AdminDatePicker";
import { CalendarDays, Clock } from "lucide-react";
import type { VoucherModalProps } from "shared";
import styles from "./VoucherModal.module.css";

export function VoucherTiming({ form, minDate, minTime, startDateValue, startTimeValue, onChange, onStartDateChange, onStartTimeChange, disabled, idPrefix }: Pick<VoucherModalProps, "form" | "minDate" | "minTime" | "startDateValue" | "startTimeValue" | "onChange" | "onStartDateChange" | "onStartTimeChange"> & { disabled: boolean; idPrefix: string }) {
  return (
    <section className={`${styles.panel} ${styles.timing}`} aria-labelledby={`${idPrefix}-timing`}>
      <div className={styles.sectionHeading}>
        <span><CalendarDays size={21} /></span>
        <div><h3 id={`${idPrefix}-timing`}>Thời gian &amp; số lượng</h3><p>Thiết lập thời gian hiệu lực và số lượng voucher</p></div>
      </div>
      <div className={styles.fieldGrid}>
        <div className={styles.date}><AdminDatePicker label="Ngày bắt đầu" value={startDateValue} minDate={minDate} disabled={disabled} onChange={onStartDateChange} /></div>
        <div>
          <label htmlFor={`${idPrefix}-time`} className={styles.label}>Giờ bắt đầu</label>
          <div className="relative"><Clock size={16} className={styles.inputIcon} /><input id={`${idPrefix}-time`} type="time" required step={60} min={startDateValue === minDate ? minTime : undefined} value={startTimeValue} disabled={disabled} onChange={event => onStartTimeChange(event.target.value)} className={`${styles.input} ${styles.timeInput}`} /></div>
        </div>
      </div>
      <div className={`${styles.fieldGrid} ${styles.quantityFields}`}>
        <div>
          <label htmlFor={`${idPrefix}-duration`} className={styles.label}>Hết hạn (giờ)</label>
          <input id={`${idPrefix}-duration`} type="number" min={1} step={1} required placeholder="72" value={form.duration_hours ? String(form.duration_hours) : ""} onChange={event => onChange(current => ({ ...current, duration_hours: Number(event.target.value) }))} className={styles.input} />
          <p className={styles.hint}>Thời gian hiệu lực tính từ ngày bắt đầu</p>
        </div>
        <div>
          <label htmlFor={`${idPrefix}-quantity`} className={styles.label}>Số lượng</label>
          <input id={`${idPrefix}-quantity`} type="number" min={1} step={1} required placeholder="100" value={form.usage_limit ? String(form.usage_limit) : ""} onChange={event => onChange(current => ({ ...current, usage_limit: Number(event.target.value) }))} className={styles.input} />
          <p className={styles.hint}>Tổng số voucher phát hành</p>
        </div>
      </div>
    </section>
  );
}
