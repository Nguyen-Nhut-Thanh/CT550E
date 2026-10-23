"use client";

import { AvatarImage } from "@/components/account/AvatarImage";


import { resolveAvatar } from "@/lib/account/avatar";

export function AccountAvatar({ source, name, sizes = "138px" }: { source?: string | null; name: string; sizes?: string }) {
  const resolvedSource = resolveAvatar(source);
  // A new source retries loading even if the previous avatar failed.
  return <AvatarImage key={resolvedSource} source={resolvedSource} name={name} sizes={sizes} />;
}
