"use client";
import {
  ResourceContext,
  type AccountResourceCache as Cache,
} from "@/lib/users/account/resource-context";
import { useEffect, useState, type ReactNode } from "react";

export function AccountResourceProvider({ children }: { children: ReactNode }) {
  const [cache] = useState<Cache>(() => new Map());
  useEffect(() => {
    const invalidate = () => {
      cache.delete("favorites");
      cache.delete("stats");
    };
    window.addEventListener("favorites-change", invalidate);
    return () => window.removeEventListener("favorites-change", invalidate);
  }, [cache]);
  return (
    <ResourceContext.Provider value={cache}>
      {children}
    </ResourceContext.Provider>
  );
}
