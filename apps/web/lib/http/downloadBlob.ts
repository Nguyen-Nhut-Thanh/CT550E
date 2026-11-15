/**
 * Kích hoạt tải file từ Blob trên trình duyệt
 */
export function downloadBlob(blob: Blob, filename: string): void {
  if (typeof window === "undefined") return;

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

/**
 * Tải file trực tiếp từ Response có stream Blob
 */
export async function downloadFromResponse(
  response: Response,
  filename: string,
): Promise<void> {
  const blob = await response.blob();
  downloadBlob(blob, filename);
}

