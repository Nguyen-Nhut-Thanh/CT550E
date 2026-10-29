"use client";

import { ImageWithFallback } from "@/components/common/media/ImageWithFallback";
import { formatVND } from "@/lib/utils/currency";
import { ArrowLeft, CalendarDays, ChevronRight, Clock3, Home, MapPin, Plane, ReceiptText, Ticket, UserRound, UsersRound } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import type { BookingDetail } from "shared";
import styles from "./BookingDetailView.module.css";

const money = (value: number | string | null | undefined) => formatVND(Number(value) || 0);
function date(value?: string | null, withTime = false) {
  if (!value || Number.isNaN(new Date(value).getTime())) return "Chưa cập nhật";
  return new Date(value).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", day: "2-digit", month: "2-digit", year: "numeric", ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}) });
}
export function bookingStatus(value: string) {
  const status = value.toLowerCase();
  if (["cancelled", "canceled", "đã hủy"].includes(status)) return { label: "Đã hủy", tone: "cancelled" };
  if (status === "cancel_requested") return { label: "Đang yêu cầu hủy", tone: "pending" };
  if (["completed", "đã hoàn thành"].includes(status)) return { label: "Đã hoàn thành", tone: "success" };
  if (["paid", "confirmed"].includes(status)) return { label: status === "paid" ? "Đã thanh toán" : "Đã xác nhận", tone: "success" };
  if (status === "pending") return { label: "Chờ thanh toán", tone: "pending" };
  return { label: value || "Chưa cập nhật", tone: "pending" };
}
function Status({ value }: { value: string }) {
  const status = bookingStatus(value);
  return <span className={`${styles.badge} ${styles[status.tone]}`}><CalendarDays size={14} />{status.label}</span>;
}
function SectionTitle({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return <div className={styles.sectionTitle}><span className={styles.icon}>{icon}</span><div><h2>{title}</h2><p>{description}</p></div></div>;
}
function Field({ label, children, wide = false }: { label: string; children: ReactNode; wide?: boolean }) {
  return <div className={`${styles.field} ${wide ? styles.wide : ""}`}><dt>{label}</dt><dd>{children || "Chưa cập nhật"}</dd></div>;
}
export function BookingDetailView({ booking: b }: { booking: BookingDetail }) {
  const tour = b.tour_schedules?.tours;
  const name = tour?.name || `Đơn đặt tour #${b.booking_id}`;
  const rows = [
    { label: "Người lớn", quantity: b.adult_count, price: Number(b.adult_unit_price) || 0 },
    { label: "Trẻ em", quantity: b.child_count, price: Number(b.child_unit_price) || 0 },
    { label: "Em bé", quantity: b.infant_count, price: Number(b.infant_unit_price) || 0 },
  ];
  const tickets = rows.reduce((sum, row) => sum + row.quantity * row.price, 0);
  const discount = Number(b.discount_amount) || 0;
  const services = Number(b.services_total) || 0;
  const surcharge = Math.max(0, Math.round((Number(b.total_amount) + discount - tickets - services) * 100) / 100);
  const extras = Array.isArray(b.additional_services) ? b.additional_services : [];
  const payments = [...(b.payments || [])].sort((a, z) => new Date(z.created_at).getTime() - new Date(a.created_at).getTime());
  const payment = payments.find(item => ["success", "paid", "completed"].includes(item.status.toLowerCase())) || payments[0];
  const paymentStatus = payment ? ({ success: "Đã thanh toán", paid: "Đã thanh toán", completed: "Đã thanh toán", pending: "Chờ thanh toán", failed: "Thất bại", refunded: "Đã hoàn tiền" }[payment.status.toLowerCase()] || payment.status) : "Chưa có giao dịch";
  const method = payment ? ({ vnpay: "VNPay", momo: "MoMo", bank: "Chuyển khoản", bank_transfer: "Chuyển khoản" }[payment.method.toLowerCase()] || payment.method) : "Chưa cập nhật";
  return <div className={styles.page}>
    <header className={styles.hero}>
      <div className={styles.heroImage} aria-hidden="true" /><div className={styles.heroVeil} />
      <div className={styles.container}>
        <nav aria-label="Đường dẫn" className={styles.breadcrumb}><Link href="/" aria-label="Trang chủ"><Home size={18} /></Link><ChevronRight size={15} /><Link href="/account/bookings">Lịch sử đặt tour</Link><ChevronRight size={15} /><span>Chi tiết booking</span></nav>
        <div className={styles.headingRow}><Link href="/account/bookings" className={styles.back} aria-label="Quay lại lịch sử đặt tour"><ArrowLeft size={23} /></Link><div className={styles.heading}><p>Chi tiết booking</p><div className={styles.titleRow}><h1>{name}</h1><Status value={b.status} /></div><span>Mã booking: <strong>#BK{String(b.booking_id).padStart(6, "0")}</strong></span></div></div>
        <Plane aria-hidden="true" className={styles.heroPlane} size={45} strokeWidth={1.4} />
      </div>
    </header>
    <div className={`${styles.container} ${styles.columns}`}>
      <div className={styles.column}>
        <section className={styles.card} aria-label="Thông tin tour">
          <div className={styles.tourIntro}><ImageWithFallback src={tour?.tour_images?.[0]?.image_url || ""} alt={name} className={styles.thumbnail} /><div className={styles.tourCopy}><SectionTitle icon={<Ticket size={24} />} title="Thông tin tour" description="Các thông tin cơ bản của tour bạn đã đặt." /><dl><Field label="Tên tour">{tour ? <Link href={`/tours/${tour.tour_id}`}>{name}</Link> : name}</Field></dl></div></div>
          <dl className={styles.tourFacts}>{[
            { icon: Plane, label: "Mã tour", value: tour?.code || "Chưa cập nhật" },
            { icon: CalendarDays, label: "Ngày khởi hành", value: date(b.tour_schedules?.start_date) },
            { icon: Clock3, label: "Thời gian", value: tour ? `${tour.duration_days} ngày ${tour.duration_nights} đêm` : "Chưa cập nhật" },
            { icon: MapPin, label: "Điểm khởi hành", value: tour?.departure_locations?.name || "Chưa cập nhật" },
          ].map(({ icon: Icon, label, value }) => <div key={label} className={styles.fact}><span className={styles.smallIcon}><Icon size={24} /></span><div><dt>{label}</dt><dd>{value}</dd></div></div>)}</dl>
        </section>
        <section className={`${styles.card} ${styles.contactCard}`} aria-label="Thông tin người đặt tour"><SectionTitle icon={<UserRound size={26} />} title="Thông tin người đặt tour" description="Người đại diện đặt tour, các thông tin liên hệ sẽ được sử dụng để xác nhận và gửi thông báo." /><dl className={styles.contactGrid}><Field label="Họ và tên">{b.contact_name}</Field><Field label="Số điện thoại">{b.contact_phone}</Field><Field label="Email" wide>{b.contact_email}</Field><Field label="Ghi chú" wide><span className={styles.note}>{b.note?.replace(/\[ROOM_SELECTION\]\s*/g, "").trim() || "Không có ghi chú."}</span></Field></dl></section>
      </div>
      <div className={styles.column}>
        <section className={styles.card} aria-label="Danh sách hành khách"><SectionTitle icon={<UsersRound size={25} />} title="Danh sách hành khách" description="Thông tin hành khách đi cùng trong booking này." /><div className={styles.tableScroll}><table className={styles.table}><thead><tr><th>Họ tên</th><th>Ngày sinh</th><th>Giới tính</th><th>Giấy tờ</th></tr></thead><tbody>{b.booking_travelers?.length ? b.booking_travelers.map(traveler => <tr key={traveler.traveler_id}><td><strong>{traveler.full_name}</strong><small>{{ adult: "Người lớn", child: "Trẻ em", infant: "Em bé" }[traveler.traveler_type.toLowerCase()] || traveler.traveler_type}</small></td><td>{date(traveler.dob)}</td><td>{{ male: "Nam", female: "Nữ", other: "Khác" }[traveler.gender.toLowerCase()] || traveler.gender || "—"}</td><td>{traveler.id_number || "Chưa cập nhật"}</td></tr>) : <tr><td colSpan={4} className={styles.empty}>Chưa có thông tin hành khách.</td></tr>}</tbody></table></div></section>
        <section className={styles.card} aria-label="Chi tiết hóa đơn"><SectionTitle icon={<ReceiptText size={25} />} title="Chi tiết hóa đơn" description="Các khoản chi phí trong booking (vé, phụ thu, dịch vụ kèm theo)." /><div className={styles.tableScroll}><table className={`${styles.table} ${styles.invoiceTable}`}><thead><tr><th>Hạng mục</th><th>Số lượng</th><th>Đơn giá</th><th>Thành tiền</th></tr></thead><tbody>{rows.map(row => <tr key={row.label}><td>{row.label}</td><td>{row.quantity}</td><td>{money(row.price)}</td><td>{money(row.quantity * row.price)}</td></tr>)}{extras.map((item, index) => <tr key={`${item.id}-${index}`}><td>{item.name}</td><td>{item.quantity}</td><td>{money(item.unit_price)}</td><td>{money(item.amount)}</td></tr>)}{services > 0 && !extras.length && <tr><td>Dịch vụ bổ sung</td><td>1</td><td>{money(services)}</td><td>{money(services)}</td></tr>}{surcharge > 0 && <tr><td>Phụ thu phòng / khác</td><td>1</td><td>{money(surcharge)}</td><td>{money(surcharge)}</td></tr>}</tbody></table></div>
          <div className={styles.invoiceBottom}><div className={styles.voucher}><dl><dt>Giá gốc / giảm giá</dt><dd>{discount > 0 ? `Giảm ${money(discount)}` : "Không áp dụng giảm giá"}</dd><dt>Voucher</dt><dd>{b.vouchers?.code || "Không sử dụng"}</dd></dl><span className={styles.travelNote}>Good Trips<br />Better People ♥</span><div className={styles.voucherScenery} /></div><div className={styles.totalBox}><dl><div><dt>Tạm tính</dt><dd>{money(tickets + services + surcharge)}</dd></div><div><dt>Giảm giá</dt><dd className={styles.muted}>{discount > 0 ? "− " : ""}{money(discount)}</dd></div></dl><div className={styles.grandTotal}><span>Giá lúc thanh toán</span><strong>{money(b.total_amount)}</strong></div><dl className={styles.paymentDetails}><div><dt>Trạng thái</dt><dd><Status value={b.status} /></dd></div><div><dt>Ngày đặt đơn</dt><dd>{date(b.created_at, true)}</dd></div><div><dt>Giao dịch</dt><dd>{payment?.transaction_code || "Chưa có"}</dd></div><div><dt>Phương thức</dt><dd>{method}</dd></div><div><dt>Thanh toán</dt><dd>{paymentStatus}</dd></div></dl></div></div>
        </section>
      </div>
    </div>
  </div>;
}
