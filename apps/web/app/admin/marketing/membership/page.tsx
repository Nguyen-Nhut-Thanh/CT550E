"use client";

import { useEffect, useState } from "react";
import { Gem, Loader2, Save } from "lucide-react";
import {
  getAdminMembership,
  saveMembershipSettings,
} from "@/lib/admin/membership/api";
import { formatVND } from "@/lib/utils/currency";
import type { MembershipAdminList, MembershipTier } from "shared";

export default function AdminMembershipPage() {
  const [data, setData] = useState<MembershipAdminList | null>(null);
  const [tiers, setTiers] = useState<MembershipTier[]>([]);
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    getAdminMembership(page)
      .then((result) => {
        if (active) {
          setData(result);
          setTiers(result.tiers);
        }
      })
      .catch((cause) => {
        if (active)
          setError(
            cause instanceof Error ? cause.message : "Không thể tải dữ liệu.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page, revision]);
  function change(
    index: number,
    field: "threshold" | "discountValue" | "minOrder" | "maxDiscount",
    value: string,
  ) {
    setMessage("");
    setTiers((previous) =>
      previous.map((tier, i) =>
        i === index
          ? { ...tier, [field]: value === "" ? 0 : Number(value) }
          : tier,
      ),
    );
  }
  async function save() {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const saved = await saveMembershipSettings(tiers);
      setTiers(saved);
      setMessage(
        "Đã lưu. Cấu hình áp dụng khi xét hạng tiếp theo; voucher đã cấp giữ nguyên điều kiện.",
      );
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Không thể lưu cấu hình.",
      );
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="space-y-6">
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-extrabold text-slate-900">
          <Gem className="text-blue-600" />
          Hạng thành viên & ưu đãi
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Quản lý mốc hạng, quyền lợi voucher và theo dõi thành viên theo chu kỳ
          12 tháng.
        </p>
      </header>
      {error && (
        <p
          role="alert"
          className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700"
        >
          {error}
          <button
            onClick={() => setRevision((value) => value + 1)}
            className="ml-3 underline"
          >
            Tải lại
          </button>
        </p>
      )}
      {message && (
        <p
          role="status"
          className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700"
        >
          {message}
        </p>
      )}
      {loading ? (
        <p role="status" className="flex items-center gap-2 p-6">
          <Loader2 className="animate-spin" />
          Đang tải...
        </p>
      ) : (
        data && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ["Thành viên đã đồng bộ", data.total],
                ["Voucher đã cấp", data.issued],
                ["Voucher đã dùng / giữ", data.used],
                ["Ưu đãi đơn đã thanh toán", formatVND(data.discountTotal)],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="mt-2 text-2xl font-extrabold text-slate-900">
                    {value}
                  </p>
                </div>
              ))}
            </div>
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="font-bold text-slate-900">
                Cấu hình 5 hạng thành viên
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Mốc chi tiêu phải tăng dần. Voucher cá nhân dùng một lần, hạn 90
                ngày. Hệ thống tự xét lại mỗi giờ và khi thành viên mở tài khoản
                hoặc kiểm tra voucher.
              </p>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void save();
                }}
              >
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[820px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs text-slate-500">
                      <tr>
                        {[
                          "Hạng",
                          "Chi tiêu tối thiểu (đ)",
                          "Loại ưu đãi",
                          "Giá trị (% / đ)",
                          "Giảm tối đa (đ)",
                          "Đơn tối thiểu (đ)",
                        ].map((label) => (
                          <th key={label} className="p-3">
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tiers.map((tier, index) => (
                        <tr key={tier.id} className="border-t border-slate-100">
                          <td className="p-3 font-bold">{tier.name}</td>
                          <td className="p-2">
                            <input
                              aria-label={`Mốc hạng ${tier.name}`}
                              type="number"
                              min={0}
                              step={1}
                              required
                              disabled={index === 0 || saving}
                              value={tier.threshold}
                              onChange={(event) =>
                                change(index, "threshold", event.target.value)
                              }
                              className="w-36 rounded-lg border border-slate-200 p-2 disabled:bg-slate-100"
                            />
                          </td>
                          <td className="p-2">
                            <select
                              aria-label={`Loại ưu đãi ${tier.name}`}
                              disabled={index === 0 || saving}
                              value={tier.discountType}
                              onChange={(event) => {
                                const value = event.target.value as
                                  | "fixed"
                                  | "percentage";
                                setTiers((previous) =>
                                  previous.map((item, i) =>
                                    i === index
                                      ? { ...item, discountType: value }
                                      : item,
                                  ),
                                );
                              }}
                              className="rounded-lg border border-slate-200 p-2"
                            >
                              <option value="fixed">Số tiền</option>
                              <option value="percentage">Phần trăm</option>
                            </select>
                          </td>
                          <td className="p-2">
                            <input
                              aria-label={`Giá trị ưu đãi ${tier.name}`}
                              type="number"
                              min={0}
                              max={
                                tier.discountType === "percentage"
                                  ? 100
                                  : undefined
                              }
                              step={1}
                              required
                              disabled={index === 0 || saving}
                              value={tier.discountValue}
                              onChange={(event) =>
                                change(
                                  index,
                                  "discountValue",
                                  event.target.value,
                                )
                              }
                              className="w-28 rounded-lg border border-slate-200 p-2 disabled:bg-slate-100"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              aria-label={`Giảm tối đa ${tier.name}`}
                              type="number"
                              min={0}
                              step={1}
                              required
                              disabled={
                                index === 0 ||
                                tier.discountType === "fixed" ||
                                saving
                              }
                              value={
                                tier.discountType === "fixed"
                                  ? tier.discountValue
                                  : tier.maxDiscount
                              }
                              onChange={(event) =>
                                change(index, "maxDiscount", event.target.value)
                              }
                              className="w-32 rounded-lg border border-slate-200 p-2 disabled:bg-slate-100"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              aria-label={`Đơn tối thiểu ${tier.name}`}
                              type="number"
                              min={0}
                              step={1}
                              required
                              disabled={index === 0 || saving}
                              value={tier.minOrder}
                              onChange={(event) =>
                                change(index, "minOrder", event.target.value)
                              }
                              className="w-32 rounded-lg border border-slate-200 p-2 disabled:bg-slate-100"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button
                  disabled={saving}
                  type="submit"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
                >
                  <Save size={16} />
                  {saving ? "Đang lưu..." : "Lưu cấu hình"}
                </button>
              </form>
            </section>
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <h2 className="p-5 font-bold text-slate-900">
                Danh sách thành viên
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs text-slate-500">
                    <tr>
                      {[
                        "Thành viên",
                        "Hạng",
                        "Chi tiêu kỳ này",
                        "Ngày xét lại",
                        "Voucher",
                      ].map((label) => (
                        <th key={label} className="p-4">
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map((item) => (
                      <tr
                        key={item.userId}
                        className="border-t border-slate-100"
                      >
                        <td className="p-4">
                          <p className="font-bold text-slate-900">
                            {item.name}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {item.email}
                          </p>
                        </td>
                        <td className="p-4 font-semibold text-blue-700">
                          {data.tiers.find((tier) => tier.id === item.tier)
                            ?.name ?? item.tier}
                        </td>
                        <td className="p-4">{formatVND(item.spending)}</td>
                        <td className="p-4">
                          {item.cycleEnd
                            ? new Date(item.cycleEnd).toLocaleDateString(
                                "vi-VN",
                                { timeZone: "Asia/Ho_Chi_Minh" },
                              )
                            : "Chưa bắt đầu"}
                        </td>
                        <td className="p-4">{item.voucherCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!data.items.length && (
                <p className="p-6 text-sm text-slate-500">
                  Chưa có thành viên đã đồng bộ.
                </p>
              )}
              <div className="flex items-center justify-end gap-3 border-t border-slate-100 p-4 text-sm">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((value) => value - 1)}
                  className="rounded-lg border px-3 py-1 disabled:opacity-40"
                >
                  Trước
                </button>
                <span>
                  {page} / {Math.max(1, Math.ceil(data.total / 20))}
                </span>
                <button
                  disabled={page * 20 >= data.total}
                  onClick={() => setPage((value) => value + 1)}
                  className="rounded-lg border px-3 py-1 disabled:opacity-40"
                >
                  Sau
                </button>
              </div>
            </section>
          </>
        )
      )}
    </div>
  );
}
