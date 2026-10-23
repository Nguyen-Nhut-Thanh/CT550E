

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
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200";
