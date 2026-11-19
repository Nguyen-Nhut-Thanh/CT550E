"use client";

import { useEffect, useState } from "react";
import { AdminModalShell } from "@/components/common/admin_shared/layout/AdminModalShell";
import CustomDropdown from "@/components/common/form_controls/CustomDropdown";
import { PriceInput } from "@/components/common/form_controls/PriceInput";
import { BedDouble, Building, Hotel, Loader2, MapPin, Phone, Plus, Star, Trash2 } from "lucide-react";
import type { AdminHotel, HotelPayload } from "shared";

interface LocationOption {
  location_id: number;
  name: string;
}

interface HotelModalProps {
  open: boolean;
  hotel: AdminHotel | null;
  locations: LocationOption[];
  onClose: () => void;
  onSubmit: (data: HotelPayload) => Promise<void>;
}

export function HotelModal({ open, hotel, locations, onClose, onSubmit }: HotelModalProps) {
  const [name, setName] = useState("");
  const [locationId, setLocationId] = useState<number | "">("");
  const [starRating, setStarRating] = useState<number>(3);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<number>(1);

  // Danh sách loại phòng ban đầu khi tạo mới
  const [initialRooms, setInitialRooms] = useState<
    Array<{ name: string; base_price: number; extra_price: number; breakfast_included: boolean }>
  >([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hotel) {
      setName(hotel.name || "");
      setLocationId(hotel.location_id || "");
      setStarRating(hotel.star_rating || 3);
      setAddress(hotel.address || "");
      setPhone(hotel.phone || "");
      setEmail(hotel.email || "");
      setDescription(hotel.description || "");
      setStatus(typeof hotel.status === "number" ? hotel.status : 1);
      setInitialRooms([]);
    } else {
      setName("");
      setLocationId(locations[0]?.location_id || "");
      setStarRating(3);
      setAddress("");
      setPhone("");
      setEmail("");
      setDescription("");
      setStatus(1);
      setInitialRooms([
        { name: "Phòng Standard", base_price: 500000, extra_price: 0, breakfast_included: true },
        { name: "Phòng Deluxe", base_price: 850000, extra_price: 0, breakfast_included: true },
      ]);
    }
    setError(null);
  }, [hotel, open, locations]);

  if (!open) return null;

  const handleAddRoom = () => {
    setInitialRooms((prev) => [
      ...prev,
      { name: "Phòng mới", base_price: 600000, extra_price: 0, breakfast_included: false },
    ]);
  };

  const handleRemoveRoom = (index: number) => {
    setInitialRooms((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRoomChange = (
    index: number,
    field: "name" | "base_price" | "extra_price" | "breakfast_included",
    value: any,
  ) => {
    setInitialRooms((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Vui lòng nhập tên khách sạn.");
      return;
    }
    if (!locationId) {
      setError("Vui lòng chọn Tỉnh/Thành phố.");
      return;
    }
    if (!address.trim()) {
      setError("Vui lòng nhập địa chỉ khách sạn.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        name: name.trim(),
        location_id: Number(locationId),
        star_rating: Number(starRating),
        address: address.trim(),
        phone: phone.trim() || null,
        email: email.trim() || null,
        description: description.trim() || null,
        status,
        ...(!hotel && initialRooms.length ? { room_types: initialRooms } : {}),
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminModalShell
      title={hotel ? "Chỉnh sửa khách sạn" : "Thêm khách sạn mới"}
      icon={<Hotel size={22} />}
      onClose={onClose}
      maxWidthClassName="max-w-3xl"
      footer={
        <div className="flex w-full items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 transition disabled:opacity-60"
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            {hotel ? "Lưu thay đổi" : "Tạo khách sạn"}
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {error && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs font-semibold text-rose-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Tên khách sạn <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Vinpearl Resort & Spa Đà Nẵng"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Tỉnh / Thành phố <span className="text-rose-500">*</span>
            </label>
            <CustomDropdown
              variant="compact"
              matchTriggerWidth
              icon={MapPin}
              placeholder="Chọn địa điểm"
              selectedValue={String(locationId)}
              onSelect={(val) => setLocationId(Number(val) || "")}
              options={locations.map((loc) => ({
                value: String(loc.location_id),
                label: loc.name,
              }))}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Hạng sao
            </label>
            <CustomDropdown
              variant="compact"
              matchTriggerWidth
              icon={Star}
              placeholder="Chọn hạng sao"
              selectedValue={String(starRating)}
              onSelect={(val) => setStarRating(Number(val) || 3)}
              options={[
                { value: "1", label: "1 sao ★" },
                { value: "2", label: "2 sao ★★" },
                { value: "3", label: "3 sao ★★★" },
                { value: "4", label: "4 sao ★★★★" },
                { value: "5", label: "5 sao ★★★★★" },
              ]}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Địa chỉ chi tiết <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ví dụ: 23 Võ Nguyên Giáp, Quận Ngũ Hành Sơn"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Số điện thoại liên hệ
            </label>
            <input
              type="text"
              placeholder="Ví dụ: 0236 3847 888"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Email lễ tân / liên hệ
            </label>
            <input
              type="email"
              placeholder="booking@hotel.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Trạng thái hoạt động
            </label>
            <div className="flex gap-4">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value={1}
                  checked={status === 1}
                  onChange={() => setStatus(1)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-semibold text-slate-800">Hoạt động (sẵn sàng gán tour)</span>
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value={0}
                  checked={status === 0}
                  onChange={() => setStatus(0)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-semibold text-slate-500">Tạm dừng</span>
              </label>
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Mô tả & Tiện ích nổi bật
            </label>
            <textarea
              rows={2}
              placeholder="Ví dụ: Giáp biển, có hồ bơi vô cực, buffet sáng quốc tế, phòng gym 24/7..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* Khởi tạo loại phòng ban đầu khi tạo mới khách sạn */}
        {!hotel && (
          <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BedDouble size={18} className="text-blue-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900">
                  Loại phòng khởi tạo
                </h4>
              </div>
              <button
                type="button"
                onClick={handleAddRoom}
                className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-blue-700 transition"
              >
                <Plus size={14} /> Thêm phòng
              </button>
            </div>

            <div className="space-y-2">
              {initialRooms.map((room, idx) => (
                <div
                  key={idx}
                  className="flex flex-wrap items-center gap-2 rounded-xl bg-white border border-blue-100 p-2.5"
                >
                  <input
                    type="text"
                    placeholder="Tên loại phòng"
                    value={room.name}
                    onChange={(e) => handleRoomChange(idx, "name", e.target.value)}
                    className="flex-1 min-w-[140px] rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-800"
                  />
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap">Giá:</span>
                    <div className="w-36">
                      <PriceInput
                        label=""
                        value={room.base_price}
                        onChange={(val) => handleRoomChange(idx, "base_price", val)}
                        placeholder="Giá phòng"
                        icon={null}
                        suffix="đ"
                        inputClassName="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-2.5 pr-7 text-xs font-semibold text-slate-800 text-left outline-none focus:border-[#075bff] focus:ring-1 focus:ring-blue-100 transition-colors"
                      />
                    </div>
                  </div>
                  <label className="inline-flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={room.breakfast_included}
                      onChange={(e) => handleRoomChange(idx, "breakfast_included", e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Ăn sáng</span>
                  </label>
                  {initialRooms.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveRoom(idx)}
                      className="rounded p-1 text-slate-400 hover:text-rose-600 transition"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </form>
    </AdminModalShell>
  );
}

