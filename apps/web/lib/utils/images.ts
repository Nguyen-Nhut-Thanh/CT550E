

export function normalizeImageSrc(src?: string | null) {
  if(!src || !src.trim()) {
    return null;
  }

  const value = src.trim();

  if(value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  if(value.startsWith("/")) {
    return value;
  }

  return `/${value}`;
}

export const PLACEHOLDER_IMAGE =
  "/images/shared/default-tour-beach.jpg";
