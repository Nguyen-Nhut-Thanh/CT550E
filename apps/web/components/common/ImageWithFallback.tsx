"use client";

import { normalizeImageSrc, PLACEHOLDER_IMAGE } from "@/lib/utils/images";
import { useEffect, useRef, useState } from "react";
import type { ImageWithFallbackProps } from 'shared';

/** Hiển thị ảnh và chuyển sang ảnh dự phòng khi ảnh gốc bị lỗi. */
export function ImageWithFallback({ 
  src, 
  alt, 
  fallback = PLACEHOLDER_IMAGE, 
  className,
  onError,
  ...props 
}: ImageWithFallbackProps) {
  const normalizedSrc =
    normalizeImageSrc(typeof src === "string" ? src : undefined) || fallback;
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const imgSrc = failedSrc === normalizedSrc ? fallback : normalizedSrc;
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // A server-rendered image can fail before React attaches its error handler.
    const image = imageRef.current;
    if (image?.complete && image.naturalWidth === 0) setFailedSrc(normalizedSrc);
  }, [normalizedSrc]);

  const handleError: React.ReactEventHandler<HTMLImageElement> = (event) => {
    if (failedSrc !== normalizedSrc) {
      setFailedSrc(normalizedSrc);
    }
    onError?.(event);
  };

  return (
    <img
      ref={imageRef}
      src={imgSrc}
      alt={alt || "Image"}
      className={className}
      onError={handleError}
      {...props}
    />
  );
}
