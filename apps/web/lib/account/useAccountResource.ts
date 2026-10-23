"use client";
import { useCallback, useContext, useEffect, useState } from "react";
import { ResourceContext } from "./resource-context";

export function useAccountResource<T>(key: string, loader: () => Promise<T>) {
  const cache = useContext(ResourceContext);
  if (!cache) throw new Error("Account resources require AccountResourceProvider");
  const [data, setData] = useState<T | undefined>(() => cache.get(key)?.data as T | undefined);
  const [loading, setLoading] = useState(() => !cache.get(key)?.loaded);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let active = true;
    let entry = cache.get(key);
    if (entry?.loaded) setData(entry.data as T);
    if (entry?.loaded && Date.now() - entry.updatedAt < 60_000) { setLoading(false); return; }
    if (!entry) { entry = { data: undefined, loaded: false, updatedAt: 0 }; cache.set(key, entry); }
    setLoading(!entry.loaded);
    setError("");
    const current = entry;
    if (!current.pending) {
      current.pending = loader().then((result) => {
        current.data = result; current.loaded = true; current.updatedAt = Date.now(); return result;
      }).finally(() => { current.pending = undefined; });
    }
    current.pending.then((result) => { if (active) setData(result as T); })
      .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Không thể tải dữ liệu."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [cache, key, loader, revision]);

  const refresh = useCallback(() => { const entry = cache.get(key); if (entry) entry.updatedAt = 0; setRevision((value) => value + 1); }, [cache, key]);
  const update = useCallback((updater: (previous: T) => T) => {
    setData((previous) => {
      if (previous === undefined) return previous;
      const next = updater(previous);
      cache.set(key, { data: next, loaded: true, updatedAt: Date.now() });
      return next;
    });
  }, [cache, key]);
  return { data, loading, error, refresh, update };
}
