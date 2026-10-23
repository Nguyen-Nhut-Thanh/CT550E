import { Clock, Eye, Layers, Palmtree, Plane, ShoppingCart, Tag } from "lucide-react";
import { formatVND } from "@/lib/utils/currency";
import type { VoucherForm } from "shared";
import styles from "./VoucherModal.module.css";

export function VoucherPreview({ form }: { form: VoucherForm }) {
  const active = form.status === 1;
  const discount = form.discount_type === "percentage" ? `${form.discount_value}%` : formatVND(form.discount_value);
  const details = [
    { label: "Ưu đãi", value: discount, icon: Tag, tone: "blue" },
    { label: "Áp dụng cho đơn từ", value: formatVND(form.min_order_value), icon: ShoppingCart, tone: "green" },
    { label: "Số lượng", value: String(form.usage_limit), icon: Layers, tone: "purple" },
    { label: "Hiệu lực", value: `${form.duration_hours} giờ`, icon: Clock, tone: "orange" },
  ];

  return (
    <section className={styles.preview} aria-label="Xem trước voucher">
      <div className={styles.previewHeading}>
        <div className={styles.sectionHeading}><span><Eye size={22} /></span><div><h3>Xem trước voucher</h3><p>Đây là thông tin hiển thị cho khách hàng</p></div></div>
        <span className={`${styles.activation} ${active ? styles.active : styles.paused}`}><i />{active ? "Voucher sẽ được kích hoạt" : "Voucher đang tạm dừng"}</span>
      </div>
      <div className={styles.ticket} aria-live="polite">
        <div className={styles.ticketCode}>
          <Plane aria-hidden="true" className={styles.ticketPlane} size={60} />
          <strong title={form.code}>{form.code.trim() || "MÃ VOUCHER"}</strong>
          <span>VOUCHER ƯU ĐÃI</span>
        </div>
        <dl className={styles.metrics}>
          {details.map(({ label, value, icon: Icon, tone }) => <div key={label} className={styles.metric}>
            <span className={`${styles.metricIcon} ${styles[tone]}`}><Icon size={18} /></span>
            <dt>{label}</dt><dd title={value}>{value}</dd>
          </div>)}
          <Palmtree aria-hidden="true" size={75} className={styles.palm} />
        </dl>
      </div>
    </section>
  );
}
