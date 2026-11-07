/**
 * Kiểm tra định dạng số điện thoại Việt Nam hợp lệ:
 * - 10 chữ số bắt đầu bằng 0 (03, 05, 07, 08, 09, 02)
 * - Hoặc định dạng quốc tế +84 theo sau 9 chữ số
 */
export function isValidVietnamesePhone(phone: string): boolean {
  if (!phone || typeof phone !== "string") return false;
  const cleaned = phone.trim().replace(/[\s.-]/g, "");
  return /^(0|\+84)(3|5|7|8|9|2)[0-9]{8}$/.test(cleaned);
}

/**
 * Kiểm tra định dạng email hợp lệ
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  const cleaned = email.trim();
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(cleaned);
}

/**
 * Kiểm tra số Căn cước công dân (12 chữ số) hoặc CMND (9 chữ số)
 */
export function isValidCitizenId(id: string): boolean {
  if (!id || typeof id !== "string") return false;
  const cleaned = id.trim().replace(/[\s.-]/g, "");
  return /^(\d{9}|\d{12})$/.test(cleaned);
}

