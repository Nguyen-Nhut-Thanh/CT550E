"use client";

import InlineNotice from "@/components/common/InlineNotice";
import { GoogleLogin } from "@react-oauth/google";
import type { GoogleAuthSectionProps } from 'shared';

export function GoogleAuthSection({
  enabled,
  onSuccess,
  onError,
}: GoogleAuthSectionProps) {
  if (!enabled) {
    return (
      <InlineNotice tone="error" className="px-4 py-3 text-sm">
        Đăng nhập Google đang tạm thời chưa khả dụng do thiếu cấu hình.
      </InlineNotice>
    );
  }

  return (
    <div className="flex justify-center">
      <GoogleLogin
        onSuccess={onSuccess}
        onError={onError}
        useOneTap={false}
        ux_mode="popup"
        shape="pill"
        theme="outline"
      />
    </div>
  );
}
