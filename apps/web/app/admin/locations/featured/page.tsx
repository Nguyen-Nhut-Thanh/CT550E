"use client";

import { useAdminContentReadOnly } from '@/components/admin/common/AdminContentPermission';


import { FeaturedLocationsLeftPanel } from '@/components/admin/locations/featured/FeaturedLocationsLeftPanel';
import { FeaturedLocationsRightPanel } from '@/components/admin/locations/featured/FeaturedLocationsRightPanel';
import { getAdminLocations, updateAdminLocation } from '@/lib/admin/locations/api';
import { FEATURED_LIMIT, filterFeaturedTabs, filterRegionChildren, getCurrentFeatured } from '@/lib/admin/locations/featured';
import { useToast } from '@/lib/notifications/useToast';
import { ArrowLeft, Info, Loader2, Save, Tag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { AdminLocationItem } from 'shared';

export default function AdminFeaturedLocationsPage() {
  const readOnly = useAdminContentReadOnly();
  const router = useRouter();
  const { success, error: showError, warning } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const request = useRef(0);
  const [loadError, setLoadError] = useState('');
  const [regions, setRegions] = useState<AdminLocationItem[]>([]);
  const [activeRegionId, setActiveRegionId] = useState<number | null>(null);
  const [allChildren, setAllChildren] = useState<AdminLocationItem[]>([]);
  const [featured, setFeatured] = useState<AdminLocationItem[]>([]);

  const syncRegionChildren = useCallback((items: AdminLocationItem[], regionId: number) => {
    const children = filterRegionChildren(items, regionId);
    setActiveRegionId(regionId); setAllChildren(children); setFeatured(getCurrentFeatured(children));
  }, []);
  const loadInitialData = useCallback(async () => {
    const sequence = ++request.current;
    setLoading(true); setLoadError('');
    try {
      const data = await getAdminLocations<AdminLocationItem>();
      if (sequence !== request.current) return;
      const items = data.items || [], tabs = filterFeaturedTabs(items);
      setRegions(tabs);
      if (tabs.length) syncRegionChildren(items, tabs[0].location_id);
      else { setActiveRegionId(null); setAllChildren([]); setFeatured([]); }
    } catch (error) { if (sequence === request.current) setLoadError(error instanceof Error ? error.message : 'Không thể tải địa điểm yêu thích.'); }
    finally { if (sequence === request.current) setLoading(false); }
  }, [syncRegionChildren]);
  const loadRegionChildren = useCallback(async (regionId: number) => {
    const sequence = ++request.current;
    setLoading(true); setLoadError('');
    try {
      const data = await getAdminLocations<AdminLocationItem>();
      if (sequence === request.current) syncRegionChildren(data.items || [], regionId);
    } catch (error) { if (sequence === request.current) setLoadError(error instanceof Error ? error.message : 'Không thể tải địa điểm của miền này.'); }
    finally { if (sequence === request.current) setLoading(false); }
  }, [syncRegionChildren]);
  useEffect(() => { void loadInitialData(); return () => { request.current++; }; }, [loadInitialData]);

  const toggleSelect = (location: AdminLocationItem) => {
    if (loading || saving) return;
    const selected = featured.some(item => item.location_id === location.location_id);
    if (!selected && featured.length >= FEATURED_LIMIT) { showError('Mỗi vùng chỉ được chọn tối đa 9 địa điểm'); return; }
    if (!selected && !location.featured_image && !location.location_images?.some(image => image.image_url)) warning(`"${location.name}" chưa có ảnh đại diện.`);
    setFeatured(current => current.some(item => item.location_id === location.location_id)
      ? current.filter(item => item.location_id !== location.location_id)
      : current.length >= FEATURED_LIMIT ? current : [...current, { ...location, is_featured: true, featured_order: current.length + 1 }]);
  };
  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (loading || saving) return;
    setFeatured(current => {
      const target = direction === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= current.length) return current;
      const next = [...current]; [next[index], next[target]] = [next[target], next[index]]; return next;
    });
  };
  const handleSave = async () => {
    if (!activeRegionId || loading || savingRef.current) return;
    savingRef.current = true; setSaving(true);
    try {
      const toReset = allChildren.filter(child => child.is_featured && !featured.some(item => item.location_id === child.location_id));
      await Promise.all([
        ...toReset.map(location => updateAdminLocation(location.location_id, { is_featured: false, featured_order: null })),
        ...featured.map((location, index) => updateAdminLocation(location.location_id, { is_featured: true, featured_order: index + 1, featured_image: location.featured_image })),
      ]);
      success('Đã cập nhật danh sách thành công');
      await loadRegionChildren(activeRegionId);
    } catch (error) { showError(error instanceof Error ? error.message : 'Không thể lưu thiết lập.'); }
    finally { savingRef.current = false; setSaving(false); }
  };
  if (loading && !regions.length) return <div className="flex min-h-80 items-center justify-center"><Loader2 size={28} className="animate-spin text-blue-600" /></div>;

  return <div className="relative isolate flex flex-col gap-3 pb-4 text-[#102044] before:absolute before:inset-x-[-24px] before:inset-y-0 before:-z-[1] before:bg-[radial-gradient(ellipse_at_20%_0%,#f6fbff_0%,#edf6ff_65%,#e8f3ff_100%)] before:content-['']">
    <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 pb-1">
      <div className="flex min-w-0 items-center gap-3"><button type="button" onClick={() => router.push('/admin/locations')} aria-label="Quay lại quản lý địa điểm" className="grid size-9 shrink-0 place-items-center rounded-[10px] border border-[#d6e4f6] bg-white/80 text-[#536d98] hover:bg-white focus-visible:outline-2 focus-visible:outline-blue-400"><ArrowLeft size={17} /></button><div><h1 className="text-[22px] leading-[1.25] font-extrabold tracking-[-.6px] sm:text-[24px]">Địa điểm yêu thích</h1><p className="mt-1 text-[12px] leading-5 text-[#7d91b2]">Quản lý các điểm đến nổi bật hiển thị tại trang chủ</p></div></div>
      <div className="flex shrink-0 items-center gap-2.5"><button type="button" disabled={saving} onClick={() => router.push('/admin/locations')} className="inline-flex min-h-9 items-center justify-center gap-2 rounded-[10px] border border-[#d1e1f7] bg-white/90 px-3 py-2 text-[12px] font-semibold text-[#263b5c] hover:bg-white disabled:opacity-50"><Tag size={15} />Thiết lập tag miền</button><button type="button" onClick={() => void handleSave()} disabled={readOnly || saving || loading || !activeRegionId} className="inline-flex min-h-9 items-center justify-center gap-2 rounded-[10px] bg-[#0766ff] px-4 py-2 text-[12px] font-semibold text-white shadow-sm shadow-blue-200 hover:bg-[#075bea] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-wait disabled:opacity-50">{saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}Lưu thiết lập</button></div>
    </header>
    {loadError && <div role="alert" className="flex shrink-0 items-center justify-between gap-3 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-[12px] text-rose-700"><span>{loadError}</span><button type="button" disabled={loading || saving} onClick={() => void (activeRegionId ? loadRegionChildren(activeRegionId) : loadInitialData())} className="shrink-0 font-semibold underline">Thử lại</button></div>}
    {!!regions.length && <div role="group" aria-label="Chọn miền hiển thị" className="flex w-full max-w-[450px] shrink-0 gap-0.5 overflow-x-auto rounded-[10px] border border-[#d6e4f8] bg-white/65 p-0.5">
      {regions.map(region => <button type="button" key={region.location_id} disabled={loading || saving} aria-pressed={activeRegionId === region.location_id} onClick={() => { if (activeRegionId !== region.location_id) void loadRegionChildren(region.location_id); }} className={`min-h-8 min-w-24 flex-1 whitespace-nowrap rounded-[8px] px-4 py-1.5 text-[12px] font-semibold transition-colors disabled:cursor-wait ${activeRegionId === region.location_id ? 'bg-[linear-gradient(110deg,#438fff,#2877fa)] text-white shadow-sm shadow-blue-200' : 'text-[#5f7396] hover:bg-white'}`}>{region.name}</button>)}
    </div>}
    {!regions.length && !loading && !loadError && <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-white p-5 text-[13px] leading-6 text-[#6f829e]"><Info size={19} className="mt-0.5 shrink-0 text-blue-500" /><div><h2 className="font-semibold text-[#263b5c]">Chưa có miền hiển thị</h2><p className="mt-1">Thiết lập các vùng miền nổi bật trong Quản lý địa điểm để chọn địa điểm cho trang chủ.</p></div></div>}
    {!!regions.length && <div className="grid min-w-0 grid-cols-1 items-stretch gap-4 lg:grid-cols-[minmax(270px,1fr)_minmax(0,1.95fr)]" aria-busy={loading}>
      <FeaturedLocationsLeftPanel allChildren={allChildren} featured={featured} onToggleSelect={toggleSelect} disabled={readOnly || loading || saving} />
      <FeaturedLocationsRightPanel featured={featured} disabled={readOnly || loading || saving} onMoveItem={moveItem} onReorder={(from, to) => setFeatured(current => { if (loading || saving || from === to || from < 0 || to < 0 || from >= current.length || to >= current.length) return current; const next = [...current]; const [item] = next.splice(from, 1); next.splice(to, 0, item); return next; })} onToggleSelect={toggleSelect} onImageChange={(index, value) => setFeatured(current => { if (!current[index] || loading || saving) return current; const next = [...current]; next[index] = { ...next[index], featured_image: value }; return next; })} />
    </div>}
  </div>;
}
