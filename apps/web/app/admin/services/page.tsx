"use client";

import { useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/common/AdminPageHeader";
import { ConfirmDialog } from "@/components/common/overlays/ConfirmDialog";
import {
  HotelModal,
  HotelsTableTab,
  ProviderModal,
  ProvidersTableTab,
  RoomTypesModal,
  ServicesTabSwitcher,
  TransportModal,
  TransportsTableTab,
  type LocationItem,
  type ServicesTab,
} from "@/components/admin/services";
import { getAdminLocations } from "@/lib/admin/locations/api";
import {
  createServicesHotel,
  createServicesProvider,
  createServicesTransport,
  deleteServicesHotel,
  deleteServicesProvider,
  deleteServicesTransport,
  getServicesHotels,
  getServicesProviders,
  getServicesTransports,
  updateServicesHotel,
  updateServicesProvider,
  updateServicesTransport,
} from "@/lib/admin/services/api";
import { useToast } from "@/lib/notifications/useToast";
import { AlertTriangle, Loader2, Plus } from "lucide-react";
import type {
  AdminHotel,
  AdminProvider,
  AdminTransport,
  HotelPayload,
  ProviderPayload,
  TransportPayload,
} from "shared";

export default function AdminServicesPage() {
  const { success, error: showError } = useToast();
  const [activeTab, setActiveTab] = useState<ServicesTab>("hotels");

  // Data states
  const [hotels, setHotels] = useState<AdminHotel[]>([]);
  const [transports, setTransports] = useState<AdminTransport[]>([]);
  const [providers, setProviders] = useState<AdminProvider[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [hotelModalOpen, setHotelModalOpen] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<AdminHotel | null>(null);

  const [roomTypesModalOpen, setRoomTypesModalOpen] = useState(false);
  const [hotelForRooms, setHotelForRooms] = useState<AdminHotel | null>(null);

  const [transportModalOpen, setTransportModalOpen] = useState(false);
  const [selectedTransport, setSelectedTransport] = useState<AdminTransport | null>(null);

  const [providerModalOpen, setProviderModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<AdminProvider | null>(null);

  // Delete confirm dialog
  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    type: "hotel" | "transport" | "provider";
    id: number;
    title: string;
    description: string;
  }>({
    open: false,
    type: "hotel",
    id: 0,
    title: "",
    description: "",
  });

  // Tải dữ liệu ban đầu
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [hotelsData, transportsData, providersData, locationsData] = await Promise.all([
        getServicesHotels(),
        getServicesTransports(),
        getServicesProviders(),
        getAdminLocations<LocationItem>(),
      ]);
      setHotels(hotelsData);
      setTransports(transportsData);
      setProviders(providersData);
      setLocations(locationsData?.items || []);
    } catch (err) {
      showError(err instanceof Error ? err.message : "Không thể tải dữ liệu dịch vụ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchAllData();
  }, []);

  // Handlers Hotels
  const handleSaveHotel = async (payload: HotelPayload) => {
    if (selectedHotel) {
      await updateServicesHotel(selectedHotel.hotel_id, payload);
      success("Đã cập nhật thông tin khách sạn.");
    } else {
      await createServicesHotel(payload);
      success("Đã thêm khách sạn mới thành công.");
    }
    setHotels(await getServicesHotels());
  };

  // Handlers Transports
  const handleSaveTransport = async (payload: TransportPayload) => {
    if (selectedTransport) {
      await updateServicesTransport(selectedTransport.transport_id, payload);
      success("Đã cập nhật thông tin phương tiện.");
    } else {
      await createServicesTransport(payload);
      success("Đã thêm phương tiện mới thành công.");
    }
    setTransports(await getServicesTransports());
  };

  // Handlers Providers
  const handleSaveProvider = async (payload: ProviderPayload) => {
    if (selectedProvider) {
      await updateServicesProvider(selectedProvider.provider_id, payload);
      success("Đã cập nhật thông tin đối tác.");
    } else {
      await createServicesProvider(payload);
      success("Đã thêm đối tác mới thành công.");
    }
    const [updatedProv, updatedTrans] = await Promise.all([
      getServicesProviders(),
      getServicesTransports(),
    ]);
    setProviders(updatedProv);
    setTransports(updatedTrans);
  };

  // Execute Delete
  const handleConfirmDelete = async () => {
    const { type, id } = confirmDelete;
    try {
      if (type === "hotel") {
        await deleteServicesHotel(id);
        success("Đã xóa khách sạn thành công.");
        setHotels(await getServicesHotels());
      } else if (type === "transport") {
        await deleteServicesTransport(id);
        success("Đã xóa phương tiện thành công.");
        setTransports(await getServicesTransports());
      } else if (type === "provider") {
        await deleteServicesProvider(id);
        success("Đã xóa đối tác thành công.");
        setProviders(await getServicesProviders());
      }
      setConfirmDelete((prev) => ({ ...prev, open: false }));
    } catch (err) {
      showError(err instanceof Error ? err.message : "Không thể thực hiện xóa.");
    }
  };

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Header */}
      <AdminPageHeader
        title="Quản lý Dịch vụ &amp; Đối tác"
        description="Quản lý danh mục khách sạn, hạng phòng, phương tiện di chuyển và đơn vị cung cấp phục vụ lịch trình tour."
        actions={
          <div className="flex gap-2.5">
            {activeTab === "hotels" && (
              <button
                type="button"
                onClick={() => {
                  setSelectedHotel(null);
                  setHotelModalOpen(true);
                }}
                className="flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 active:scale-95 cursor-pointer"
              >
                <Plus size={18} /> Thêm khách sạn
              </button>
            )}
            {activeTab === "transports" && (
              <button
                type="button"
                onClick={() => {
                  if (!providers.length) {
                    showError("Bạn cần tạo ít nhất 1 Đối tác cung cấp trước khi thêm phương tiện.");
                    return;
                  }
                  setSelectedTransport(null);
                  setTransportModalOpen(true);
                }}
                className="flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 active:scale-95 cursor-pointer"
              >
                <Plus size={18} /> Thêm phương tiện
              </button>
            )}
            {activeTab === "providers" && (
              <button
                type="button"
                onClick={() => {
                  setSelectedProvider(null);
                  setProviderModalOpen(true);
                }}
                className="flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 active:scale-95 cursor-pointer"
              >
                <Plus size={18} /> Thêm đối tác
              </button>
            )}
          </div>
        }
      />

      {/* Tab Switcher */}
      <ServicesTabSwitcher
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        counts={{
          hotels: hotels.length,
          transports: transports.length,
          providers: providers.length,
        }}
      />

      {/* Content Area */}
      {loading ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-3xl border border-slate-100 bg-white p-8">
          <Loader2 size={36} className="animate-spin text-blue-600" />
          <p className="text-sm font-semibold text-slate-600">Đang tải danh mục dịch vụ...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeTab === "hotels" && (
            <HotelsTableTab
              hotels={hotels}
              locations={locations}
              onEdit={(h) => {
                setSelectedHotel(h);
                setHotelModalOpen(true);
              }}
              onDelete={(h) =>
                setConfirmDelete({
                  open: true,
                  type: "hotel",
                  id: h.hotel_id,
                  title: `Xóa khách sạn ${h.name}?`,
                  description:
                    "Thao tác này sẽ xóa khách sạn và các loại phòng liên quan khỏi hệ thống.",
                })
              }
              onManageRooms={(h) => {
                setHotelForRooms(h);
                setRoomTypesModalOpen(true);
              }}
            />
          )}

          {activeTab === "transports" && (
            <TransportsTableTab
              transports={transports}
              providers={providers}
              onEdit={(t) => {
                setSelectedTransport(t);
                setTransportModalOpen(true);
              }}
              onDelete={(t) =>
                setConfirmDelete({
                  open: true,
                  type: "transport",
                  id: t.transport_id,
                  title: `Xóa phương tiện ${t.name}?`,
                  description: "Thao tác này sẽ xóa phương tiện khỏi danh mục.",
                })
              }
            />
          )}

          {activeTab === "providers" && (
            <ProvidersTableTab
              providers={providers}
              onEdit={(p) => {
                setSelectedProvider(p);
                setProviderModalOpen(true);
              }}
              onDelete={(p) =>
                setConfirmDelete({
                  open: true,
                  type: "provider",
                  id: p.provider_id,
                  title: `Xóa đối tác ${p.name}?`,
                  description:
                    "Thao tác này sẽ xóa thông tin đối tác nếu không còn phương tiện liên kết.",
                })
              }
            />
          )}
        </div>
      )}

      {/* Modals */}
      <HotelModal
        open={hotelModalOpen}
        hotel={selectedHotel}
        locations={locations}
        onClose={() => {
          setHotelModalOpen(false);
          setSelectedHotel(null);
        }}
        onSubmit={handleSaveHotel}
      />

      <RoomTypesModal
        open={roomTypesModalOpen}
        hotel={hotelForRooms}
        onClose={() => {
          setRoomTypesModalOpen(false);
          setHotelForRooms(null);
        }}
        onRefreshHotel={async () => {
          setHotels(await getServicesHotels());
        }}
      />

      <TransportModal
        open={transportModalOpen}
        transport={selectedTransport}
        providers={providers}
        onClose={() => {
          setTransportModalOpen(false);
          setSelectedTransport(null);
        }}
        onSubmit={handleSaveTransport}
      />

      <ProviderModal
        open={providerModalOpen}
        provider={selectedProvider}
        onClose={() => {
          setProviderModalOpen(false);
          setSelectedProvider(null);
        }}
        onSubmit={handleSaveProvider}
      />

      <ConfirmDialog
        open={confirmDelete.open}
        icon={<AlertTriangle size={32} />}
        title={confirmDelete.title}
        description={confirmDelete.description}
        confirmLabel="Xác nhận xóa"
        cancelLabel="Hủy bỏ"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}
