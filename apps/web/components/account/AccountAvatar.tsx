"use client";

import Image from "next/image";
import { useState } from "react";

const DEFAULT_AVATAR = "/images/account/avata.png";

function resolveAvatar(source?: string | null): string {
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

function AvatarImage({ source, name, sizes }: { source: string; name: string; sizes: string }) {
  const [failed, setFailed] = useState(false);
  const src = failed ? DEFAULT_AVATAR : source;
  return (
    <Image
      src={src}
      alt={`Ảnh đại diện của ${name}`}
      fill
      sizes={sizes}
      className="object-cover"
      // User-provided avatars may live on hosts outside the site image CDN.
      unoptimized={src.startsWith("http://") || src.startsWith("https://")}
      onError={failed || src === DEFAULT_AVATAR ? undefined : () => setFailed(true)}
    />
  );
}

export function AccountAvatar({ source, name, sizes = "138px" }: { source?: string | null; name: string; sizes?: string }) {
  const resolvedSource = resolveAvatar(source);
  // A new source retries loading even if the previous avatar failed.
  return <AvatarImage key={resolvedSource} source={resolvedSource} name={name} sizes={sizes} />;
}
