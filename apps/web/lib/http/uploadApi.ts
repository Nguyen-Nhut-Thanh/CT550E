import { getToken } from "@/lib/auth/client/session";
import { API_BASE } from "@/lib/http/config";

export const DEFAULT_ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
];
export const DEFAULT_MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Validate định dạng và dung lượng ảnh
 */
export function validateImageFile(
  file: File,
  options?: {
    allowedTypes?: string[];
    maxSizeBytes?: number;
  },
): void {
  const allowed = options?.allowedTypes || DEFAULT_ALLOWED_IMAGE_TYPES;
  const maxSize = options?.maxSizeBytes || DEFAULT_MAX_IMAGE_SIZE_BYTES;

  if (!allowed.includes(file.type)) {
    throw new Error("Chọn ảnh PNG, JPG hoặc WebP.");
  }
  if (file.size > maxSize) {
    const maxMb = Math.round(maxSize / (1024 * 1024));
    throw new Error(`Ảnh không được vượt quá ${maxMb} MB.`);
  }
}

/**
 * Upload file có xác thực Bearer token cơ bản
 */
export async function uploadAuthenticatedFile(
  url: string,
  token: string,
  file: File,
  fallbackMessage: string,
) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const data = (await response.json().catch(() => null)) as
    | { message?: string; url?: string }
    | null;

  if (!response.ok) {
    throw new Error(
      data?.message && typeof data.message === "string"
        ? data.message
        : fallbackMessage,
    );
  }

  return data;
}

/**
 * Helper dùng chung: Validate định dạng, dung lượng và upload ảnh có xác thực token
 */
export async function uploadValidatedImage(
  pathOrUrl: string,
  file: File,
  fallbackMessage = "Không thể tải ảnh lên.",
  options?: {
    allowedTypes?: string[];
    maxSizeBytes?: number;
  },
): Promise<{ url: string }> {
  validateImageFile(file, options);

  const token = getToken();
  if (!token) {
    throw new Error("Vui lòng đăng nhập để tải ảnh.");
  }

  const url = pathOrUrl.startsWith("http")
    ? pathOrUrl
    : `${API_BASE}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;

  const data = await uploadAuthenticatedFile(url, token, file, fallbackMessage);

  if (!data?.url) {
    throw new Error(data?.message || fallbackMessage);
  }

  return { url: data.url };
}
