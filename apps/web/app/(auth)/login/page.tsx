"use client";

import { LoginForm } from "@/components/auth/LoginForm";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center py-8 text-slate-500 font-medium">
          Đang tải...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
