"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminSearchInput } from "@/components/common/admin_shared/tables/AdminSearchInput";
import { AdminPagination } from "@/components/common/admin_shared/tables/AdminPagination";
import { AdminStatusBadge } from "@/components/common/admin_shared/controls/AdminStatusBadge";
import CustomDropdown from "@/components/common/form_controls/CustomDropdown";
import { BedDouble, CheckCircle2, Edit2, Hotel, MapPin, Phone, Star, Trash2 } from "lucide-react";
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
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setPage(1);
  }, [search, locationFilter, starFilter, statusFilter]);

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

  const totalPages = Math.max(1, Math.ceil(filteredHotels.length / pageSize));
  const current = Math.min(page, totalPages);
  const visibleHotels = filteredHotels.slice((current - 1) * pageSize, current * pageSize);

  return (
    <div className="space-y-3">
      {/* Filter Bar */}
      <div className="rounded-[14px] border border-[#e1edfc] bg-white p-3.5 shadow-2xs">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(260px,2fr)_repeat(3,minmax(160px,1fr))] [&_input]:rounded-lg [&_input]:border-[#e1edfc] [&_input]:text-xs [&_button[aria-haspopup=listbox]]:rounded-lg [&_button[aria-haspopup=listbox]]:border-[#e1edfc] [&_button[aria-haspopup=listbox]]:bg-white [&_button[aria-haspopup=listbox]]:text-xs [&_button[aria-haspopup=listbox]]:min-h-[38px]">
          <AdminSearchInput
            value={search}
            onChange={setSearch}
            placeholder="Tìm theo tên khách sạn, địa chỉ..."
          />

          <CustomDropdown
            variant="compact"
            matchTriggerWidth
            icon={MapPin}
            placeholder="Tất cả địa điểm"
            selectedValue={locationFilter}
            onSelect={setLocationFilter}
            options={[
              { value: "", label: "Tất cả địa điểm" },
              ...locations.map((loc) => ({
                value: String(loc.location_id),
                label: loc.name,
              })),
            ]}
          />

          <CustomDropdown
            variant="compact"
            matchTriggerWidth
            icon={Star}
            placeholder="Tất cả hạng sao"
            selectedValue={starFilter}
            onSelect={setStarFilter}
            options={[
              { value: "", label: "Tất cả hạng sao" },
              { value: "5", label: "5 sao ★★★★★" },
              { value: "4", label: "4 sao ★★★★" },
              { value: "3", label: "3 sao ★★★" },
              { value: "2", label: "2 sao ★★" },
              { value: "1", label: "1 sao ★" },
            ]}
          />

          <CustomDropdown
            variant="compact"
            matchTriggerWidth
            icon={CheckCircle2}
            placeholder="Tất cả trạng thái"
            selectedValue={statusFilter}
            onSelect={setStatusFilter}
            options={[
              { value: "", label: "Tất cả trạng thái" },
              { value: "1", label: "Đang hoạt động" },
              { value: "0", label: "Tạm dừng" },
            ]}
          />
        </div>
      </div>

      {/* Hotels Table */}
      <div className="rounded-[14px] border border-[#e1edfc] bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left whitespace-nowrap text-xs">
            <thead className="bg-slate-50/75 border-b border-[#edf2fb] text-[11px] font-bold uppercase tracking-wider text-[#7187a9]">
              <tr>
                <th className="px-4.5 py-3">Khách sạn / Resort</th>
                <th className="px-4.5 py-3">Địa điểm</th>
                <th className="px-4.5 py-3">Địa chỉ &amp; Liên hệ</th>
                <th className="px-4.5 py-3 text-center">Hạng phòng</th>
                <th className="px-4.5 py-3">Trạng thái</th>
                <th className="px-4.5 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf2fb]">
              {filteredHotels.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#7187a9]">
                    Không tìm thấy khách sạn nào phù hợp.
                  </td>
                </tr>
              ) : (
                visibleHotels.map((h) => (
                  <tr key={h.hotel_id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4.5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#075bff] shadow-xs">
                          <Hotel size={20} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-[13px] text-[#07123e] leading-snug">{h.name}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            {Array.from({ length: h.star_rating || 3 }).map((_, i) => (
                              <Star
                                key={i}
                                size={11}
                                className="fill-amber-400 text-amber-400"
                              />
                            ))}
                            <span className="text-[11px] font-semibold text-[#8da1bd] ml-0.5">
                              ({h.star_rating} sao)
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4.5 py-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200/80 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
                        <MapPin size={11} className="text-slate-500" />
                        {h.locations?.name || "Chưa gán"}
                      </span>
                    </td>
                    <td className="px-4.5 py-3 text-xs">
                      <p className="text-[#192e52] font-medium line-clamp-1">{h.address}</p>
                      {h.phone && (
                        <p className="text-[#7187a9] mt-0.5 flex items-center gap-1 text-[11px]">
                          <Phone size={11} /> {h.phone}
                        </p>
                      )}
                    </td>
                    <td className="px-4.5 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => onManageRooms(h)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50/80 px-3 py-1.5 text-xs font-bold text-[#075bff] hover:bg-blue-100 transition shadow-2xs cursor-pointer"
                      >
                        <BedDouble size={14} />
                        <span>{h._count?.hotel_room_types ?? h.hotel_room_types?.length ?? 0} loại phòng</span>
                      </button>
                    </td>
                    <td className="px-4.5 py-3">
                      <AdminStatusBadge tone={h.status === 1 ? "success" : "muted"}>
                        {h.status === 1 ? "Hoạt động" : "Tạm dừng"}
                      </AdminStatusBadge>
                    </td>
                    <td className="px-4.5 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onEdit(h)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-[#075bff] transition cursor-pointer"
                          title="Chỉnh sửa thông tin"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(h)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                          title="Xóa khách sạn"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {filteredHotels.length > 0 && (
          <AdminPagination
            variant="numbered"
            showSinglePage
            currentPage={current}
            totalPages={totalPages}
            totalItems={filteredHotels.length}
            pageSize={pageSize}
            itemLabel="khách sạn"
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}

