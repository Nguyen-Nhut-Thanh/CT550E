import {
  Clock,
  Eye,
  Layers,
  Palmtree,
  Plane,
  ShoppingCart,
  Tag,
} from "lucide-react";
import { formatVND } from "@/lib/utils/currency";
import type { VoucherForm } from "shared";

export function VoucherPreview({ form }: { form: VoucherForm }) {
  const active = form.status === 1;
  const discount =
    form.discount_type === "percentage"
      ? `${form.discount_value}%`
      : formatVND(form.discount_value);
  const details = [
    { label: "Ưu đãi", value: discount, icon: Tag, tone: "blue" },
    {
      label: "Áp dụng cho đơn từ",
      value: formatVND(form.min_order_value),
      icon: ShoppingCart,
      tone: "green",
    },
    {
      label: "Số lượng",
      value: String(form.usage_limit),
      icon: Layers,
      tone: "purple",
    },
    {
      label: "Hiệu lực",
      value: `${form.duration_hours} giờ`,
      icon: Clock,
      tone: "orange",
    },
  ] as const;

  return (
    <section
      className="ui-voucher-modal-preview mt-[16px] [border:1px_solid_#e0ecff] rounded-[17px] p-[16px] [background:linear-gradient(120deg,_#f5faff,_#edf6ff)] admin-short-tablet:mt-[12px] admin-short-tablet:p-[12px] admin-max-479:p-[12px]"
      aria-label="Xem trước voucher"
    >
      <div className="ui-voucher-modal-previewHeading flex items-center justify-between gap-[12px] mb-[14px] [&_.ui-voucher-modal-sectionHeading]:mb-[0] admin-short-tablet:mb-[10px] admin-max-799:items-start admin-max-799:flex-col">
        <div className="ui-voucher-modal-sectionHeading flex items-center gap-[11px] mb-[22px] [&>span]:grid [&>span]:shrink-0 [&>span]:w-[38px] [&>span]:h-[38px] [&>span]:place-items-center [&>span]:rounded-[12px] [&>span]:[background:#eaf3ff] [&>span]:text-[#1465ff] [&_h3]:text-[16px] [&_h3]:font-[750] [&_h3]:tracking-[-.025em]! [&_h3]:leading-[1.4] [&_p]:mt-[2px] [&_p]:text-[#7a8aaa] [&_p]:text-[11px] [&_p]:leading-[1.5] admin-short-tablet:mb-[14px] admin-max-479:mb-[17px] admin-max-479:[&_h3]:text-[15px] admin-max-479:[&_p]:text-[10px]">
          <span>
            <Eye size={22} />
          </span>
          <div>
            <h3>Xem trước voucher</h3>
            <p>Đây là thông tin hiển thị cho khách hàng</p>
          </div>
        </div>
        <span
          className={`ui-voucher-modal-activation inline-flex items-center shrink-0 gap-[7px] [border:1px_solid] rounded-[100px] p-[7px_11px] text-[10px] leading-[1.4] [&_i]:w-[7px] [&_i]:h-[7px] [&_i]:rounded-[50%] [&_i]:[background:currentColor] ${active ? "ui-voucher-modal-active [&&]:[border-color:#c9f1e7] [&&]:[background:#e9fbf5] [&&]:text-[#07846c]" : "ui-voucher-modal-paused [&&]:[border-color:#e0e5ee] [&&]:[background:#f3f5f9] [&&]:text-[#74809a]"}`}
        >
          <i />
          {active ? "Voucher sẽ được kích hoạt" : "Voucher đang tạm dừng"}
        </span>
      </div>
      <div
        className="ui-voucher-modal-ticket grid grid-cols-[205px_minmax(0,_1fr)] overflow-hidden [border:1px_solid_#dfebfc] rounded-[15px] [background:white] [box-shadow:0_6px_14px_#2255a006] admin-max-799:grid-cols-[165px_minmax(0,_1fr)] admin-max-479:grid-cols-[minmax(0,_1fr)]"
        aria-live="polite"
      >
        <div className="ui-voucher-modal-ticketCode relative flex min-w-0 flex-col justify-center items-start gap-[7px] overflow-hidden p-[24px_20px] [background:linear-gradient(125deg,_#1685ff,_#0755f5)] text-[#fff] [border-right:2px_dashed_#c7ddff] [&::before]:absolute [&::before]:right-[-7px] [&::before]:w-[14px] [&::before]:h-[14px] [&::before]:rounded-[50%] [&::before]:[background:#f0f7ff] [&::before]:[content:''] [&::before]:top-[-7px] [&::after]:absolute [&::after]:right-[-7px] [&::after]:w-[14px] [&::after]:h-[14px] [&::after]:rounded-[50%] [&::after]:[background:#f0f7ff] [&::after]:[content:''] [&::after]:bottom-[-7px] [&_strong]:relative [&_strong]:w-full [&_strong]:overflow-hidden [&_strong]:text-ellipsis [&_strong]:text-[21px] [&_strong]:font-extrabold [&_strong]:leading-[1.3] [&_strong]:whitespace-nowrap [&>span]:relative [&>span]:rounded-[100px] [&>span]:[background:#ffffff26] [&>span]:p-[3px_8px] [&>span]:text-[8px] [&>span]:tracking-[.08em]! admin-short-tablet:py-[18px] admin-max-799:[&_strong]:text-[18px] admin-max-479:items-center admin-max-479:p-[18px] admin-max-479:[border-right:0] admin-max-479:[border-bottom:2px_dashed_#c7ddff] admin-max-479:[&_strong]:text-center">
          <Plane
            aria-hidden="true"
            className="ui-voucher-modal-ticketPlane absolute left-[-8px] bottom-[12px] [transform:rotate(-20deg)] text-[#ffffff25]"
            size={60}
          />
          <strong title={form.code}>{form.code.trim() || "MÃ VOUCHER"}</strong>
          <span>VOUCHER ƯU ĐÃI</span>
        </div>
        <dl className="ui-voucher-modal-metrics relative grid grid-cols-[repeat(4,_minmax(0,_1fr))] items-center p-[14px_0] admin-short-tablet:py-[10px] admin-max-799:grid-cols-[repeat(2,_minmax(0,_1fr))] admin-max-799:gap-[15px_0]">
          {details.map(({ label, value, icon: Icon, tone }) => (
            <div
              key={label}
              className="ui-voucher-modal-metric relative z-[1] flex min-w-0 flex-col items-center p-[0_10px] text-center [&+.ui-voucher-modal-metric]:[border-left:1px_dashed_#dfE8f7] [&_dt]:text-[#7183a3] [&_dt]:text-[10px] [&_dt]:leading-[1.4] [&_dd]:max-w-full [&_dd]:m-[3px_0_0] [&_dd]:overflow-hidden [&_dd]:text-[#182541] [&_dd]:text-[18px] [&_dd]:font-extrabold [&_dd]:leading-[1.3] [&_dd]:text-ellipsis [&_dd]:whitespace-nowrap [&:first-child_dd]:text-[#075eff] admin-short-tablet:[&_dd]:text-[17px] admin-max-799:[&:nth-child(3)]:[border-left:0]"
            >
              <span
                className={`ui-voucher-modal-metricIcon grid w-[31px] h-[31px] mb-[7px] place-items-center rounded-[50%] admin-short-tablet:w-[27px] admin-short-tablet:h-[27px] admin-short-tablet:mb-[5px] ${tone === "blue" ? "ui-voucher-modal-blue [background:#eaf4ff] text-[#0865ff]" : tone === "green" ? "ui-voucher-modal-green [background:#e9fbf0] text-[#16a05f]" : tone === "purple" ? "ui-voucher-modal-purple [background:#f0eaff] text-[#8854ea]" : "ui-voucher-modal-orange [background:#fff1df] text-[#eb842c]"}`}
              >
                <Icon size={18} />
              </span>
              <dt>{label}</dt>
              <dd title={value}>{value}</dd>
            </div>
          ))}
          <Palmtree
            aria-hidden="true"
            size={75}
            className="ui-voucher-modal-palm absolute right-[0] bottom-[-10px] text-[#eaf2ff] [transform:rotate(-12deg)]"
          />
        </dl>
      </div>
    </section>
  );
}
