"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { trackTourView } from "./userBehaviorSignals";

export { getUserSignals, saveUserSignals, trackTourView, trackSearchKeyword, trackTourSearch } from "./userBehaviorSignals";

export function useUserBehaviorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const match = pathname.match(/^\/tours\/([1-9]\d*)\/?$/);
    if (!match) return;
    const timer = setTimeout(() => trackTourView(Number(match[1])), 15_000);
    return () => clearTimeout(timer);
  }, [pathname]);
}

