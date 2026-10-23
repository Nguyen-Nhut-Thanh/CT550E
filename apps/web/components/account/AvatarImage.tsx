"use client";

import { DEFAULT_AVATAR } from "@/lib/account/avatar";
import Image from "next/image";
import { useState } from "react";

export function AvatarImage({ source, name, sizes }: { source: string; name: string; sizes: string }) {
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
