"use client";

import { Suspense } from "react";
import { VerifyForm } from "@/components/auth";

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="text-center py-8 text-slate-500 font-medium">Đang tải...</div>}>
      <VerifyForm />
    </Suspense>
  );
}
