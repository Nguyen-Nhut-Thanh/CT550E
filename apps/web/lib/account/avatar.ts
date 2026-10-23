export const DEFAULT_AVATAR = "/images/account/avata.png";

export function resolveAvatar(source?: string | null): string {
  const value = source?.trim();
  if (!value) return DEFAULT_AVATAR;
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")) return value;
  try {
    const url = new URL(value);
    if ((url.protocol === "https:" || url.protocol === "http:") && !url.username && !url.password) return url.href;
  } catch {
    // Invalid or missing URLs use the bundled default avatar.
  }
  return DEFAULT_AVATAR;
}

