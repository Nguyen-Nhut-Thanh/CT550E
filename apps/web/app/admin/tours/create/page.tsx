"use client";

import { TourBasicInfoCard } from "@/components/admin/tours/editor/TourBasicInfoCard";
import { ScheduleManagement } from "@/components/admin/tours/editor/ScheduleManagement";
import { TourSidebar } from "@/components/admin/tours/editor/TourSidebar";
import { TourEditorShell } from "@/components/admin/tours/editor/TourEditorShell";

import { TourAmenitiesEditor } from "@/components/admin/tours/editor/TourAmenitiesEditor";
import { getAdminTransports } from "@/lib/admin/catalogs/api";
import { getAdminLocations } from "@/lib/admin/locations/api";
import { createAdminTour } from "@/lib/admin/tours/api";
import { useToast } from "@/lib/notifications/useToast";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { LocationOption, TransportOption, TourAmenity } from 'shared';
import { isValidTourDuration } from 'shared';

export default function AdminTourCreatePage() {
  const router = useRouter();
  const { success, error: showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [transports, setTransports] = useState<TransportOption[]>([]);

  const [form, setForm] = useState({
    code: "",
    name: "",
    summary: "",
    description: "",
    duration_days: 1,
    duration_nights: 0,
    base_price: 0,
    departure_location: 0,
    transport_id: 0,
    tour_type: "domestic",
    images: [] as string[],
    destinations: [] as number[],
    tour_amenities: [] as TourAmenity[],
    policy_contents: {},
    cut_off_hours: 24 as number | undefined,
  });

  useEffect(() => {
    const loadOptions = async () => {
      setLoading(true);
      try {
        const [locationData, transportData] = await Promise.all([
          getAdminLocations<LocationOption>(),
          getAdminTransports<TransportOption>(),
        ]);

        setLocations(locationData.items || []);
        if ((locationData.items || []).length > 0) {
          setForm((prev) => ({
            ...prev,
            departure_location: locationData.items![0].location_id,
          }));
        }

        setTransports(transportData.items || []);
        if ((transportData.items || []).length > 0) {
          setForm((prev) => ({
            ...prev,
            transport_id: transportData.items![0].transport_id,
          }));
        }
      } catch {
      } finally {
        setLoading(false);
      }
    };

    void loadOptions();
  }, []);

  const handleCreate = async () => {
    if (!isValidTourDuration(form.duration_days, form.duration_nights)) {
      showError('Số đêm chỉ được chênh tối đa 1 so với số ngày.');
      return;
    }

    if (!form.code.trim()) {
      showError("Vui lòng nhập mã tour (VD: VN-MB-001)");
      return;
    }

    if (!form.name.trim()) {
      showError("Vui lòng nhập tên tour du lịch");
      return;
    }

    if (!form.description.trim()) {
      showError("Vui lòng nhập mô tả cho tour");
      return;
    }

    if (form.base_price <= 0) {
      showError("Vui lòng nhập giá cơ bản cho tour du lịch");
      return;
    }

    if (form.destinations.length === 0) {
      showError("Vui lòng chọn ít nhất một điểm đến cho hành trình");
      return;
    }

    setSaving(true);
    try {
      await createAdminTour({
        ...form,
        cut_off_hours:
          form.cut_off_hours ?? 24,
      });
      success("Đã tạo tour mới thành công!");
      router.push("/admin/tours");
    } catch (requestError) {
      showError(
        requestError instanceof Error ? requestError.message : "Lỗi kết nối server",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <TourEditorShell title="Thêm Tour Mới" description="Tạo tour du lịch mới cho website. Điền đầy đủ thông tin để tour hiển thị chuyên nghiệp và thu hút hơn." onBack={() => router.push('/admin/tours')}>
      <div className="grid items-start gap-[22px] lg:grid-cols-[minmax(0,min(calc((100%_-_22px)*1.55/2.55),calc(100%_-_302px)))_minmax(260px,calc((100%_-_22px)/3.4))] lg:justify-start">
        <div className="flex min-w-0 flex-col gap-[22px]">
          <TourBasicInfoCard mode="create" tour={form} locations={locations} transports={transports} onTourChange={setForm} />
          <TourAmenitiesEditor value={form.tour_amenities} onChange={tour_amenities => setForm(previous => ({ ...previous, tour_amenities }))} />
        </div>
        <TourSidebar mode="create" tour={form} saving={saving} success={false} onSave={handleCreate} onTourChange={setForm} />
      </div>
      <div className="mt-6">
        <ScheduleManagement />
      </div>
    </TourEditorShell>
  );
}
