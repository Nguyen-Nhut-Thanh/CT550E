type TourEmptyStateProps = {
  message?: string;
};

export default function TourEmptyState({
  message = "Không tìm thấy tour phù hợp với điều kiện bạn đã chọn.",
}: TourEmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center text-gray-500 shadow-sm">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        🧭
      </div>
      <p className="text-base font-medium text-slate-700">{message}</p>
      <p className="mt-1 text-sm text-slate-400">
        Hãy thử thay đổi từ khóa tìm kiếm, điểm đến hoặc điều chỉnh khoảng giá khác.
      </p>
    </div>
  );
}
