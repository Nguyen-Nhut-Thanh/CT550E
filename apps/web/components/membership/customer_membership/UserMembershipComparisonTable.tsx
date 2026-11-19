"use client";

import { useState } from "react";
import { Check, Minus } from "lucide-react";
import type { MembershipTier, MembershipTierId } from "shared";
import { formatVND } from "@/lib/utils/currency";

interface UserMembershipComparisonTableProps {
  tiers: MembershipTier[];
  currentTierId: MembershipTierId;
}

type TableCategory = "all" | "discount" | "hospitality" | "service";

interface MatrixRow {
  label: string;
  category: "all" | "discount" | "hospitality" | "service";
  getValue: (tier: MembershipTier) => string | boolean;
}

const COMPARISON_ROWS: MatrixRow[] = [
  {
    label: "Giảm trực tiếp giá vé tour",
    category: "discount",
    getValue: (t) =>
      t.tourDiscountPercent ? `Giảm ${t.tourDiscountPercent}%` : false,
  },
  {
    label: "Hệ số nhân điểm thưởng",
    category: "discount",
    getValue: (t) => `×${t.pointMultiplier.toLocaleString("vi-VN")}`,
  },
  {
    label: "Giảm giá dịch vụ đi kèm",
    category: "discount",
    getValue: (t) =>
      t.serviceDiscountPercent ? `Giảm ${t.serviceDiscountPercent}%` : false,
  },
  {
    label: "Voucher quà tặng sinh nhật",
    category: "discount",
    getValue: (t) =>
      t.birthdayVoucherAmount ? formatVND(t.birthdayVoucherAmount) : false,
  },
  {
    label: "Gói Voucher thăng hạng",
    category: "discount",
    getValue: (t) => {
      if (t.id === "bronze") return false;
      if (t.id === "silver") return "100.000đ (đơn từ 2tr)";
      if (t.id === "gold") return "3% tối đa 200.000đ";
      if (t.id === "platinum") return "5% tối đa 400.000đ";
      return "7% tối đa 700.000đ";
    },
  },
  {
    label: "Ưu tiên chọn chỗ ngồi (xe / máy bay)",
    category: "hospitality",
    getValue: (t) => {
      if (t.id === "bronze" || t.id === "silver") return false;
      if (t.id === "gold" || t.id === "platinum")
        return "Chỗ ngồi đầu xe / máy bay";
      return "Chỗ ngồi VIP ưu tiên hàng đầu";
    },
  },
  {
    label: "Nâng hạng phòng khách sạn / resort",
    category: "hospitality",
    getValue: (t) => {
      if (t.id === "bronze" || t.id === "silver" || t.id === "gold")
        return false;
      if (t.id === "platinum") return "01 lượt nâng hạng/năm";
      return "Tự động nâng lên Suite / Villa";
    },
  },
  {
    label: "Xe đưa đón & Phòng chờ sân bay",
    category: "hospitality",
    getValue: (t) => {
      if (t.id === "bronze" || t.id === "silver" || t.id === "gold")
        return false;
      if (t.id === "platinum") return "01 chuyến xe đón sân bay";
      return "Xe Mercedes & Phòng chờ First Class";
    },
  },
  {
    label: "Trip Shield: Linh hoạt đổi ngày / hủy tour",
    category: "service",
    getValue: (t) => {
      if (t.id === "bronze" || t.id === "silver") return false;
      if (t.id === "gold") return "Đổi ngày miễn phí 1 lần/năm (trước 7 ngày)";
      if (t.id === "platinum") return "Hủy linh hoạt trước 72h (về ví điểm)";
      return "Bảo hiểm hoãn/hủy + Đổi lịch trình 24/7";
    },
  },
  {
    label: "Chăm sóc khách hàng & Dịch vụ",
    category: "service",
    getValue: (t) => {
      if (t.id === "bronze") return "Tiêu chuẩn";
      if (t.id === "silver") return "Ưu tiên phản hồi trong 24h";
      if (t.id === "gold") return "Ưu tiên hàng đợi giữ chỗ";
      if (t.id === "platinum") return "Kênh hỗ trợ VIP riêng biệt";
      return "Quản gia Concierge 1-1 phục vụ 24/7";
    },
  },
];

export function UserMembershipComparisonTable({
  tiers,
  currentTierId,
}: UserMembershipComparisonTableProps) {
  const [category, setCategory] = useState<TableCategory>("all");

  const filteredRows = COMPARISON_ROWS.filter(
    (row) => category === "all" || row.category === category,
  );

  return (
    <section className="space-y-4">
      {/* Table Header and Category Filter */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-white">
            So Sánh Toàn Diện Quyền Lợi Các Hạng
          </h2>
          <p className="text-xs text-slate-400">
            Xem chi tiết điều kiện và đặc quyền tương ứng của từng phân hạng thẻ.
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 rounded-2xl border border-white/10 bg-[#0A1424]/90 p-1.5 shadow-sm">
          <button
            type="button"
            onClick={() => setCategory("all")}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
              category === "all"
                ? "bg-gradient-to-r from-amber-400 to-amber-500 font-bold text-[#050B14] shadow"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Tất cả
          </button>
          <button
            type="button"
            onClick={() => setCategory("discount")}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
              category === "discount"
                ? "bg-gradient-to-r from-amber-400 to-amber-500 font-bold text-[#050B14] shadow"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Chiết khấu & Tích điểm
          </button>
          <button
            type="button"
            onClick={() => setCategory("hospitality")}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
              category === "hospitality"
                ? "bg-gradient-to-r from-amber-400 to-amber-500 font-bold text-[#050B14] shadow"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Nghỉ dưỡng & Đưa đón
          </button>
          <button
            type="button"
            onClick={() => setCategory("service")}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
              category === "service"
                ? "bg-gradient-to-r from-amber-400 to-amber-500 font-bold text-[#050B14] shadow"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Linh hoạt & Chăm sóc
          </button>
        </div>
      </div>

      {/* Responsive Matrix Table */}
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#122238]/45 backdrop-blur-xl shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-[#050B14]/90 text-slate-300">
                <th scope="col" className="px-5 py-4 font-semibold text-white">
                  Danh mục đặc quyền
                </th>
                {tiers.map((tier) => {
                  const isCurrent = tier.id === currentTierId;
                  return (
                    <th
                      key={tier.id}
                      scope="col"
                      className={`px-3 py-4 text-center font-bold transition-colors ${
                        isCurrent
                          ? "bg-amber-500/10 text-amber-300 border-x border-amber-400/25"
                          : "text-slate-300"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-xs uppercase tracking-wider">
                          {tier.id === "bronze" ? "Member" : tier.name}
                        </span>
                        {isCurrent && (
                          <span className="rounded-full bg-amber-500 px-1.5 py-0.2 text-[9px] font-black text-[#050B14]">
                            Của bạn
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredRows.map((row) => (
                <tr
                  key={row.label}
                  className="transition-colors hover:bg-white/5"
                >
                  <th
                    scope="row"
                    className="px-5 py-3.5 font-medium text-slate-300"
                  >
                    {row.label}
                  </th>
                  {tiers.map((tier) => {
                    const isCurrent = tier.id === currentTierId;
                    const val = row.getValue(tier);

                    return (
                      <td
                        key={tier.id}
                        className={`px-3 py-3.5 text-center font-semibold ${
                          isCurrent
                            ? "bg-amber-500/5 text-amber-200 border-x border-amber-400/25"
                            : "text-slate-300"
                        }`}
                      >
                        {typeof val === "boolean" ? (
                          val ? (
                            <Check
                              className="mx-auto h-4 w-4 text-emerald-400"
                              aria-label="Có"
                            />
                          ) : (
                            <Minus
                              className="mx-auto h-4 w-4 text-slate-600"
                              aria-label="Không"
                            />
                          )
                        ) : (
                          <span className="leading-tight">{val}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
