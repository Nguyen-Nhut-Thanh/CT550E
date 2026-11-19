

export const formatCurrencyInput = (val: number | string) => {
  if (val === undefined || val === null || val === "" || val === 0) return "";
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export const parseCurrencyInput = (val: string) => {
  const cleanValue = val.replace(/\D/g, "");
  return cleanValue === "" ? 0 : Number(cleanValue);
};

/**
 * Làm tròn số tiền về hàng nghìn (1.000 đ) hoặc theo bước nhảy chỉ định
 */
export function roundVND(value?: number | string | null, step = 1000): number {
  if (value == null || value === "") return 0;
  const num = Number(value);
  if (isNaN(num)) return 0;
  return Math.round(num / step) * step;
}

/**
 * Định dạng số tiền VND đầy đủ (ví dụ: "8.160.000 đ")
 * Tự động làm tròn số lẻ về bội số 1.000 đ
 */
export function formatVND(value?: number | string | null) {
  if (value == null || value === "") return "Liên hệ";
  const num = Number(value);
  if (isNaN(num)) return "Liên hệ";

  const rounded = roundVND(num);
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  })
    .format(rounded)
    .replace("₫", "đ");
}

/**
 * Định dạng số tiền VND rút gọn (ví dụ: "8.160K", "500K")
 * Luôn đồng bộ 100% với formatVND bằng cách dùng chung roundVND
 */
export function formatCompactVND(value?: number | string | null) {
  if (value == null || value === "") return "Liên hệ";
  const num = Number(value);
  if (isNaN(num)) return "Liên hệ";

  const rounded = roundVND(num);
  const inThousands = rounded / 1000;
  return `${inThousands.toLocaleString("vi-VN")}K`;
}

export function cleanVND(val?: number | string | null) {
  return formatVND(val).replace(/\s*đ/, "đ");
}
