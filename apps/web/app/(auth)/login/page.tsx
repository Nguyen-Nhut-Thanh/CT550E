"use client";

import { Suspense } from "react";
import { LoginForm } from "@/components/auth";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center py-8 text-slate-500 font-medium">Đang tải...</div>}>
      <LoginForm />
    </Suspense>
  );
}
