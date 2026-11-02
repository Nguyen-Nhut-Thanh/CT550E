"use client";

import { ScheduleManagement } from "@/components/admin/tours/editor/ScheduleManagement";
import { TourBasicInfoCard } from "@/components/admin/tours/editor/TourBasicInfoCard";
import { TourDetailsCard } from "@/components/admin/tours/editor/TourDetailsCard";
import { TourSidebar } from "@/components/admin/tours/editor/TourSidebar";
import { TourEditorShell } from "@/components/admin/tours/editor/TourEditorShell";

import { getAdminTransports } from "@/lib/admin/catalogs/api";
import { getAdminLocations } from "@/lib/admin/locations/api";
import { getAdminTourDetail, updateAdminTour } from "@/lib/admin/tours/api";
import { getTotalTourBookings, normalizeTourDetailForm } from "@/lib/admin/tours/forms";
import { useToast } from "@/lib/notifications/useToast";
import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { LocationOption, TourDetailForm, TransportOption } from "shared";
import { isValidTourDuration } from 'shared';

export default function AdminTourDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { success: showSuccess, error: showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tour, setTour] = useState<TourDetailForm | null>(null);
  const [totalBookings, setTotalBookings] = useState(0);
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [transports, setTransports] = useState<TransportOption[]>([]);

  const hasLockedCoreFields = totalBookings > 0;

  const updateTour = (updater: (prev: TourDetailForm) => TourDetailForm) => {
    setTour((prev) => (prev ? updater(prev) : prev));
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [tourData, locationData, transportData] = await Promise.all([
          getAdminTourDetail<TourDetailForm>(String(id)),
          getAdminLocations<LocationOption>(),
          getAdminTransports<TransportOption>(),
        ]);

        const normalizedTour = normalizeTourDetailForm(tourData.tour);
        setTour(normalizedTour);
        setTotalBookings(getTotalTourBookings(normalizedTour));
        setLocations(locationData.items || []);
        setTransports(transportData.items || []);
      } catch {
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [id]);

  const handleSave = async () => {
    if (!tour) return;
    if (!hasLockedCoreFields && !isValidTourDuration(Number(tour.duration_days ?? 1), Number(tour.duration_nights ?? 0))) {
      showError('Số đêm chỉ được chênh tối đa 1 so với số ngày.');
      return;
    }

    const payload = { ...tour };

    if (hasLockedCoreFields) {
      delete payload.name;
      delete payload.duration_days;
      delete payload.duration_nights;
      delete payload.tour_type;
      delete payload.destinations;
    }

    setSaving(true);
    setSaved(false);
    try {
      await updateAdminTour(String(id), payload);
      setSaved(true);
      showSuccess("Lưu thay đổi thành công!");
      router.push("/admin/tours");
    } catch (requestError) {
      showError(
        requestError instanceof Error ? requestError.message : "Lỗi kết nối server",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading || !tour) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <TourEditorShell title="Chỉnh Sửa Tour" description={'Cập nhật thông tin và hoàn thiện hành trình: ' + (tour.name || '')} onBack={() => router.push('/admin/tours')}>
      <div className="grid items-start gap-[22px] lg:grid-cols-[minmax(0,min(calc((100%_-_22px)*1.55/2.55),calc(100%_-_302px)))_minmax(260px,calc((100%_-_22px)/3.4))] lg:justify-start">
        <div className="flex min-w-0 flex-col gap-[22px]">
          <TourBasicInfoCard tour={tour} locations={locations} transports={transports} lockCoreFields={hasLockedCoreFields} onTourChange={updateTour} />
          <TourDetailsCard tour={tour} onTourChange={updateTour} />
        </div>
        <TourSidebar tour={tour} saving={saving} success={saved} lockCoreFields={hasLockedCoreFields} onSave={handleSave} onTourChange={updateTour} />
      </div>
      <div className="mt-6">
        <ScheduleManagement tourId={Number(id)} />
      </div>
    </TourEditorShell>
  );
}
