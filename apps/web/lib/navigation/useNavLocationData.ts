"use client";

import { publicFetch } from "@/lib/http/publicFetch";
import { useEffect, useState } from "react";
import type { NavLocationData } from "shared";

export function useNavLocationData() {
  const [navLocationData, setNavLocationData] = useState<NavLocationData | null>(null);
  const [isLoadingNav, setIsLoadingNav] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchNavData = async () => {
      setIsLoadingNav(true);

      try {
        const data = await publicFetch<NavLocationData>("/locations/nav");
        if(active) {
          setNavLocationData(data);
        }
      } catch {
        if(active) {
          setNavLocationData(null);
        }
      } finally {
        if(active) {
          setIsLoadingNav(false);
        }
      }
    };

    void fetchNavData();

    return () => {
      active = false;
    };
  }, []);

  return {
    navLocationData,
    isLoadingNav,
  };
}
