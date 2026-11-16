"use client";

import { useMemo, useState } from "react";
import { AdminSearchInput } from "@/components/common/admin_shared/tables/AdminSearchInput";
import { AdminStatusBadge } from "@/components/common/admin_shared/controls/AdminStatusBadge";
import { BedDouble, Edit2, Hotel, MapPin, Phone, Star, Trash2 } from "lucide-react";
import type { AdminHotel } from "shared";

export interface LocationItem {
  location_id: number;
  name: string;
}

export interface HotelsTableTabProps {
  hotels: AdminHotel[];
  locations: LocationItem[];
  onEdit: (hotel: AdminHotel) => void;
  onDelete: (hotel: AdminHotel) => void;
  onManageRooms: (hotel: AdminHotel) => void;
}

export function HotelsTableTab({
  hotels,
  locations,
  onEdit,
  onDelete,
  onManageRooms,
}: HotelsTableTabProps) {
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [starFilter, setStarFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filteredHotels = useMemo(() => {
    return hotels.filter((h) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = h.name.toLowerCase().includes(q);
        const matchAddr = h.address.toLowerCase().includes(q);
        const matchLoc = h.locations?.name.toLowerCase().includes(q);
        if (!matchName && !matchAddr && !matchLoc) return false;
      }
      if (locationFilter && String(h.location_id) !== locationFilter) return false;
      if (starFilter && String(h.star_rating) !== starFilter) return false;
      if (statusFilter !== "" && String(h.status) !== statusFilter) return false;
      return true;
    });
  }, [hotels, search, locationFilter, starFilter, statusFilter]);

  return (
    <>
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
        <div className="flex flex-1 flex-wrap items-center gap-3 min-w-[280px]">
          <div className="w-full sm:w-72">
            <AdminSearchInput
              value={search}
              onChange={setSearch}
              placeholder="Tìm theo tên khách sạn, địa chỉ..."
            />
          </div>

          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-blue-500 focus:outline-none"
          >
            <option value="">Tất cả địa điểm</option>
            {locations.map((loc) => (
              <option key={loc.location_id} value={loc.location_id}>
                {loc.name}
              </option>
            ))}
          </select>

          <select
            value={starFilter}
            onChange={(e) => setStarFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-blue-500 focus:outline-none"
          >
            <option value="">Tất cả hạng sao</option>
            <option value="5">5 sao ★★★★★</option>
            <option value="4">4 sao ★★★★</option>
            <option value="3">3 sao ★★★</option>
            <option value="2">2 sao ★★</option>
            <option value="1">1 sao ★</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-blue-500 focus:outline-none"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="1">Đang hoạt động</option>
            <option value="0">Tạm dừng</option>
          </select>
        </div>
      </div>

      {/* Hotels Table */}
      <div className="rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-4">Khách sạn / Resort</th>
                <th className="px-4 py-4">Địa điểm</th>
                <th className="px-4 py-4">Địa chỉ &amp; Liên hệ</th>
                <th className="px-4 py-4 text-center">Hạng phòng</th>
                <th className="px-4 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHotels.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    Không tìm thấy khách sạn nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredHotels.map((h) => (
                  <tr key={h.hotel_id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                          <Hotel size={22} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 leading-snug">{h.name}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            {Array.from({ length: h.star_rating || 3 }).map((_, i) => (
                              <Star
                                key={i}
                                size={12}
                                className="fill-amber-400 text-amber-400"
                              />
                            ))}
                            <span className="text-[11px] font-semibold text-slate-400 ml-1">
                              ({h.star_rating} sao)
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        <MapPin size={12} className="text-slate-500" />
                        {h.locations?.name || "Chưa gán"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs">
                      <p className="text-slate-800 font-medium line-clamp-1">{h.address}</p>
                      {h.phone && (
                        <p className="text-slate-500 mt-0.5 flex items-center gap-1">
                          <Phone size={11} /> {h.phone}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => onManageRooms(h)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/70 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition shadow-xs cursor-pointer"
                      >
                        <BedDouble size={14} />
                        <span>{h._count?.hotel_room_types ?? h.hotel_room_types?.length ?? 0} loại phòng</span>
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <AdminStatusBadge tone={h.status === 1 ? "success" : "muted"}>
                        {h.status === 1 ? "Hoạt động" : "Tạm dừng"}
                      </AdminStatusBadge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onEdit(h)}
                          className="rounded-xl p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition cursor-pointer"
                          title="Chỉnh sửa thông tin"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(h)}
                          className="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                          title="Xóa khách sạn"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

