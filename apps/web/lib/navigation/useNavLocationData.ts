"use client";

import { publicFetch } from "@/lib/http/publicFetch";
import { useEffect, useState } from "react";
import type { NavLocationData } from "shared";

let cachedNavData: NavLocationData | null = null;
let pendingNavPromise: Promise<NavLocationData | null> | null = null;

async function getNavLocationData(): Promise<NavLocationData | null> {
  if (cachedNavData) return cachedNavData;
  if (!pendingNavPromise) {
    pendingNavPromise = publicFetch<NavLocationData>("/locations/nav")
      .then((data) => {
        cachedNavData = data;
        return data;
      })
      .catch(() => null)
      .finally(() => {
        pendingNavPromise = null;
      });
  }
  return pendingNavPromise;
}

export function useNavLocationData(enabled = true) {
  const [navLocationData, setNavLocationData] = useState<NavLocationData | null>(cachedNavData);
  const [isLoadingNav, setIsLoadingNav] = useState(!cachedNavData && enabled);

  useEffect(() => {
    if (!enabled) return;
    if (cachedNavData) {
      setNavLocationData(cachedNavData);
      setIsLoadingNav(false);
      return;
    }

    let active = true;
    setIsLoadingNav(true);

    void getNavLocationData().then((data) => {
      if (active) {
        setNavLocationData(data);
        setIsLoadingNav(false);
      }
    });

    return () => {
      active = false;
    };
  }, [enabled]);

  return {
    navLocationData,
    isLoadingNav,
  };
}
