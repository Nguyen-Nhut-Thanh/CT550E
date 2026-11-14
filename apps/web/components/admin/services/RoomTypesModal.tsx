"use client";

import { useEffect, useState } from "react";
import { AdminModalShell } from "@/components/admin/common/AdminModalShell";
import {
  createServicesRoomType,
  deleteServicesRoomType,
  getServicesRoomTypes,
  updateServicesRoomType,
} from "@/lib/admin/services/api";
import { formatVND } from "@/lib/utils/currency";
import {
  BedDouble,
  Check,
  Edit2,
  Loader2,
  Plus,
  Trash2,
  Utensils,
  X,
} from "lucide-react";
import type { AdminHotel, AdminHotelRoomType } from "shared";

interface RoomTypesModalProps {
  open: boolean;
  hotel: AdminHotel | null;
  onClose: () => void;
  onRefreshHotel?: () => void;
}

export function RoomTypesModal({ open, hotel, onClose, onRefreshHotel }: RoomTypesModalProps) {
  const [rooms, setRooms] = useState<AdminHotelRoomType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form thêm / sửa loại phòng
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [basePrice, setBasePrice] = useState<number>(0);
  const [extraPrice, setExtraPrice] = useState<number>(0);
  const [breakfast, setBreakfast] = useState(true);
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState(1);
  const [saving, setSaving] = useState(false);

  const fetchRooms = async (hotelId: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getServicesRoomTypes(hotelId);
      setRooms(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải danh sách loại phòng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && hotel?.hotel_id) {
      fetchRooms(hotel.hotel_id);
      setIsAdding(false);
      setEditingId(null);
    }
  }, [open, hotel?.hotel_id]);

  if (!open || !hotel) return null;

  const handleStartAdd = () => {
    setEditingId(null);
    setRoomName("");
    setBasePrice(500000);
    setExtraPrice(0);
    setBreakfast(true);
    setDescription("");
    setStatus(1);
    setIsAdding(true);
  };

  const handleStartEdit = (room: AdminHotelRoomType) => {
    setIsAdding(false);
    setEditingId(room.room_type_id);
    setRoomName(room.name);
    setBasePrice(Number(room.base_price) || 0);
    setExtraPrice(Number(room.extra_price) || 0);
    setBreakfast(Boolean(room.breakfast_included));
    setDescription(room.description || "");
    setStatus(room.status ?? 1);
  };

  const handleCancelForm = () => {
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;

    setSaving(true);
    setError(null);
    try {
      if (isAdding) {
        await createServicesRoomType(hotel.hotel_id, {
          name: roomName.trim(),
          base_price: Number(basePrice) || 0,
          extra_price: Number(extraPrice) || 0,
          breakfast_included: breakfast,
          description: description.trim() || null,
          status,
        });
      } else if (editingId) {
        await updateServicesRoomType(editingId, {
          name: roomName.trim(),
          base_price: Number(basePrice) || 0,
          extra_price: Number(extraPrice) || 0,
          breakfast_included: breakfast,
          description: description.trim() || null,
          status,
        });
      }
      setIsAdding(false);
      setEditingId(null);
      await fetchRooms(hotel.hotel_id);
      if (onRefreshHotel) onRefreshHotel();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRoom = async (roomTypeId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa loại phòng này?")) return;
    setError(null);
    try {
      await deleteServicesRoomType(roomTypeId);
      await fetchRooms(hotel.hotel_id);
      if (onRefreshHotel) onRefreshHotel();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể xóa loại phòng.");
    }
  };

  return (
    <AdminModalShell
      title={`Quản lý loại phòng: ${hotel.name}`}
      icon={<BedDouble size={22} />}
      onClose={onClose}
      maxWidthClassName="max-w-3xl"
      footer={
        <div className="flex w-full justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-slate-800 transition"
          >
            Hoàn tất
          </button>
        </div>
      }
    >
      <div className="p-6 space-y-5">
        {error && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs font-semibold text-rose-700">
            {error}
          </div>
        )}

        {/* Nút thêm loại phòng */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500 font-medium">
            Danh sách hạng phòng khách sạn phục vụ trong lịch trình tour.
          </p>
          {!isAdding && !editingId && (
            <button
              type="button"
              onClick={handleStartAdd}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
            >
              <Plus size={15} /> Thêm hạng phòng mới
            </button>
          )}
        </div>

        {/* Form thêm / chỉnh sửa phòng inline */}
        {(isAdding || editingId) && (
          <form
            onSubmit={handleSaveRoom}
            className="rounded-2xl border-2 border-blue-200 bg-blue-50/30 p-4 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-blue-100 pb-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900">
                {isAdding ? "Thêm loại phòng mới" : "Chỉnh sửa loại phòng"}
              </h4>
              <button
                type="button"
                onClick={handleCancelForm}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Tên hạng phòng <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Phòng Deluxe Hướng Biển"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Giá niêm yết / phụ thu (VNĐ)
                </label>
                <input
                  type="number"
                  placeholder="Giá phòng"
                  value={basePrice}
                  onChange={(e) => setBasePrice(Number(e.target.value) || 0)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 bg-white"
                />
              </div>

              <div className="sm:col-span-2 flex flex-wrap items-center gap-6">
                <label className="inline-flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={breakfast}
                    onChange={(e) => setBreakfast(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-semibold">Bao gồm bữa sáng</span>
                </label>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-600">Trạng thái:</span>
                  <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="roomStatus"
                      checked={status === 1}
                      onChange={() => setStatus(1)}
                      className="text-blue-600"
                    />
                    <span>Hoạt động</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="roomStatus"
                      checked={status === 0}
                      onChange={() => setStatus(0)}
                      className="text-blue-600"
                    />
                    <span>Tạm dừng</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleCancelForm}
                className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {isAdding ? "Thêm phòng" : "Lưu thay đổi"}
              </button>
            </div>
          </form>
        )}

        {/* Danh sách phòng */}
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 size={24} className="animate-spin text-blue-600" />
          </div>
        ) : rooms.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-400">
            <BedDouble size={36} className="mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold">Chưa có loại phòng nào.</p>
            <p className="text-xs text-slate-400 mt-1">
              Hãy nhấn nút Thêm hạng phòng mới ở trên để tạo.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
            {rooms.map((room) => (
              <div
                key={room.room_type_id}
                className="flex items-center justify-between p-4 hover:bg-slate-50/70 transition"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-sm text-slate-900">{room.name}</span>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        room.status === 1
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {room.status === 1 ? "Hoạt động" : "Tạm dừng"}
                    </span>
                    {room.breakfast_included && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                        <Utensils size={11} /> Có ăn sáng
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    Giá niêm yết:{" "}
                    <strong className="text-blue-600 font-bold">
                      {formatVND(Number(room.base_price) || 0)}
                    </strong>
                    {room._count?.tour_schedule_hotels ? (
                      <span className="ml-3 text-slate-400">
                        (Đã dùng trong {room._count.tour_schedule_hotels} lịch trình)
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-4">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(room)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition"
                    title="Chỉnh sửa"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteRoom(room.room_type_id)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                    title="Xóa loại phòng"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminModalShell>
  );
}

