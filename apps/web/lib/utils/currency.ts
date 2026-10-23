

export const formatCurrencyInput = (val: number | string) => {
  if(val === undefined || val === null || val === "" || val === 0) return "";
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export const parseCurrencyInput = (val: string) => {
  const cleanValue = val.replace(/\D/g, "");
  return cleanValue === "" ? 0 : Number(cleanValue);
};

export function formatVND(value?: number | string | null) {
  if(value == null || value === "") return "Liên hệ";
  const num = Number(value);
  if(isNaN(num)) return "Liên hệ";

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(num).replace("₫", "đ");
}
