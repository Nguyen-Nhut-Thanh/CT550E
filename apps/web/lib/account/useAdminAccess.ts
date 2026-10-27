"use client";

import { getAdminMe } from "@/lib/admin/auth/api";
import { useEffect, useState } from "react";
import type { UserProfile } from "shared";

export async function checkAccountAdminAccess(user?: UserProfile | null): Promise<boolean> {
  if (!user?.user_id || user.is_staff !== true) return false;
  try {
    const result = await getAdminMe();
    return result.status === "authorized";
  } catch {
    return false;
  }
}

export function useAdminAccess(user?: UserProfile | null) {
  const userId = user?.user_id;
  const isStaff = user?.is_staff === true;
  const [access, setAccess] = useState<{ userId: number | undefined; allowed: boolean }>({ userId: undefined, allowed: false });

  useEffect(() => {
    let active = true;
    setAccess({ userId, allowed: false });
    if (userId && isStaff) {
      void checkAccountAdminAccess({ user_id: userId, is_staff: true }).then(allowed => {
        if (active) setAccess({ userId, allowed });
      });
    }
    return () => { active = false; };
  }, [userId, isStaff]);

  return isStaff && userId === access.userId && access.allowed;
}
