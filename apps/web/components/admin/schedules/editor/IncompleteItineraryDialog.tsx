"use client";

import { AlertTriangle } from 'lucide-react';
import { ConfirmDialog } from '@/components/common/overlays/ConfirmDialog';

export function IncompleteItineraryDialog({ days, destination, onConfirm, onCancel }: {
  days: number[] | null; destination: string; onConfirm: () => void; onCancel: () => void;
}) {
  const summary = days?.slice(0, 12).join(', ') || '';
  return <ConfirmDialog open={days !== null} icon={<AlertTriangle size={28} />} title="Lịch trình chưa đầy đủ" description={`Ngày ${summary}${days && days.length > 12 ? '…' : ''} chưa được điền đủ thông tin. Bạn có muốn lưu phần đã nhập và rời về ${destination}? Bạn có thể mở lại để điền tiếp.`} confirmLabel="Xác nhận" cancelLabel="Hủy" confirmClassName="bg-blue-600 hover:bg-blue-700 shadow-blue-200" onConfirm={onConfirm} onCancel={onCancel} />;
}
