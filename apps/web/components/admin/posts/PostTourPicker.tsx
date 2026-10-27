"use client";
import { useEffect, useState } from "react";
import { requestAdminJson } from "@/lib/http/requestAdminJson";

type TourOption = { tour_id: number; name: string; status: number };
export function PostTourPicker({
  value,
  onChange,
}: {
  value?: number;
  onChange: (tour: TourOption | null) => void;
}) {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<TourOption[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    let active = true;
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const result = await requestAdminJson<{ items: TourOption[] }>(
          `/admin/tours?status=1&search=${encodeURIComponent(search)}`,
          { method: "GET" },
          "Không thể tìm tour.",
        );
        if (active) {
          setItems(result.items || []);
          setError("");
        }
      } catch (cause) {
        if (active)
          setError(
            cause instanceof Error ? cause.message : "Không thể tìm tour.",
          );
      } finally {
        if (active) setLoading(false);
      }
    }, 300);
    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [search]);
  return (
    <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <label className="block text-xs font-semibold text-slate-600">
        Tìm tour đang công khai
      </label>
      <input
        aria-label="Tìm tour cho nút hành động"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Nhập tên tour..."
        className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm"
      />
      {value && (
        <p className="text-xs text-blue-700">
          Đã chọn tour #{value}
          <button
            type="button"
            onClick={() => onChange(null)}
            className="ml-3 underline"
          >
            Bỏ chọn
          </button>
        </p>
      )}
      {error ? (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      ) : (
        <div className="max-h-44 overflow-y-auto">
          {items.slice(0, 30).map((tour) => (
            <button
              type="button"
              key={tour.tour_id}
              onClick={() => onChange(tour)}
              className={`block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-blue-50 ${value === tour.tour_id ? "bg-blue-100 text-blue-700" : "text-slate-700"}`}
            >
              {tour.name}
            </button>
          ))}
          {!items.length && (
            <p className="p-2 text-xs text-slate-500">
              {loading ? "Đang tìm tour..." : "Không tìm thấy tour phù hợp."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
