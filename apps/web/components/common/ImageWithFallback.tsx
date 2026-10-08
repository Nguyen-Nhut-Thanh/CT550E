"use client";

import { useState } from "react";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200";

function normalizeImageSrc(src?: string): string | undefined {
  if (!src) return undefined;
  if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("/")) {
    return src;
  }
  return `/${src}`;
}

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
}

export function ImageWithFallback({ 
  src, 
  alt, 
  fallback = PLACEHOLDER_IMAGE, 
  className,
  ...props 
}: ImageWithFallbackProps) {
  const normalizedSrc =
    normalizeImageSrc(typeof src === "string" ? src : undefined) || fallback;
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const imgSrc = failedSrc === normalizedSrc ? fallback : normalizedSrc;

  const handleError = () => {
    if (failedSrc !== normalizedSrc) {
      setFailedSrc(normalizedSrc);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt || "Image"}
      className={className}
      onError={handleError}
      {...props}
    />
  );
}
