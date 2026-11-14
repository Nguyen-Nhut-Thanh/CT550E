"use client";

import { useId, useMemo, useState } from 'react';
import { Check, CheckSquare, Globe2, MapPin, Square } from 'lucide-react';
import type { LocationOption } from 'shared';
import FormFieldLabel from '@/components/common/forms/FormFieldLabel';
import { TourRouteOrder } from './TourRouteOrder';

const DOMESTIC_REGIONS = [
  { key: 'north', name: 'Miền Bắc' },
  { key: 'central', name: 'Miền Trung' },
  { key: 'south', name: 'Miền Nam' },
] as const;

function getCountryFlag(countryCode?: string | null): string {
  if (!countryCode || countryCode.length !== 2) return '🌐';
  try {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  } catch {
    return '🌐';
  }
}

export function TourDestinationPicker({
  locations,
  value,
  tourType,
  disabled = false,
  onChange,
}: {
  locations: LocationOption[];
  value: number[];
  tourType?: string;
  disabled?: boolean;
  onChange: (ids: number[]) => void;
}) {
  const id = useId();

  // -------------------------------------------------------------
  // DOMESTIC LOGIC (Giữ nguyên hiện trạng cho tour trong nước)
  // -------------------------------------------------------------
  const domesticRegions = useMemo(() => {
    return DOMESTIC_REGIONS.map(region => {
      const parent = locations.find(
        location =>
          location.level_id === 4 &&
          location.country_code === 'VN' &&
          location.name.trim().toLocaleLowerCase('vi') === region.name.toLocaleLowerCase('vi'),
      );
      return {
        ...region,
        provinces: parent
          ? locations
              .filter(location => location.level_id === 5 && location.parent_id === parent.location_id)
              .sort((a, b) => a.name.localeCompare(b.name, 'vi'))
          : [],
      };
    });
  }, [locations]);

  const [activeDomesticRegion, setActiveDomesticRegion] = useState<string>(() => {
    const found = domesticRegions.find(region =>
      region.provinces.some(province => province.location_id === value[0]),
    );
    return found?.key || 'north';
  });

  // -------------------------------------------------------------
  // OUTBOUND / HIERARCHICAL LOGIC (Quốc gia -> Miền -> Tỉnh/Thành)
  // -------------------------------------------------------------
  // 1. Danh sách tất cả quốc gia (Level 3), ưu tiên Việt Nam lên đầu
  const allCountries = useMemo(() => {
    const list = locations.filter(l => l.level_id === 3);
    const vnIndex = list.findIndex(
      l => l.country_code === 'VN' || l.name.trim().toLocaleLowerCase('vi') === 'việt nam',
    );
    let vnCountry: LocationOption;
    let others: LocationOption[];

    if (vnIndex >= 0) {
      vnCountry = list[vnIndex];
      others = list.filter((_, idx) => idx !== vnIndex);
    } else {
      // Fallback nếu chưa có record level 3 của Việt Nam
      vnCountry = {
        location_id: -999,
        name: 'Việt Nam',
        country_code: 'VN',
        level_id: 3,
      };
      others = [...list];
    }

    others.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    return [vnCountry, ...others];
  }, [locations]);

  // 2. Map từng tỉnh/thành (Level 5) về quốc gia tương ứng (Level 3)
  const provinceToCountryMap = useMemo(() => {
    const map = new Map<number, number>();
    const locMap = new Map<number, LocationOption>(locations.map(l => [l.location_id, l]));
    const vnCountry = allCountries.find(c => c.country_code === 'VN') || allCountries[0];

    const provinces = locations.filter(l => l.level_id === 5);
    for (const p of provinces) {
      let resolvedCountryId: number | undefined;

      // Check trực tiếp parent
      if (p.parent_id) {
        const parent = locMap.get(p.parent_id);
        if (parent) {
          if (parent.level_id === 3) {
            resolvedCountryId = parent.location_id;
          } else if (parent.level_id === 4) {
            // Parent là Region, tìm tiếp Grandparent (Country)
            if (parent.parent_id) {
              const grandParent = locMap.get(parent.parent_id);
              if (grandParent && grandParent.level_id === 3) {
                resolvedCountryId = grandParent.location_id;
              }
            }
            if (!resolvedCountryId && parent.country_code) {
              const matched = allCountries.find(c => c.country_code === parent.country_code);
              if (matched) resolvedCountryId = matched.location_id;
            }
          }
        }
      }

      // Check theo mã quốc gia của chính tỉnh đó
      if (!resolvedCountryId && p.country_code) {
        const matched = allCountries.find(c => c.country_code === p.country_code);
        if (matched) resolvedCountryId = matched.location_id;
      }

      // Mặc định Việt Nam nếu country_code là VN
      if (!resolvedCountryId && (p.country_code === 'VN' || p.country_code === null)) {
        if (vnCountry) resolvedCountryId = vnCountry.location_id;
      }

      if (resolvedCountryId !== undefined) {
        map.set(p.location_id, resolvedCountryId);
      }
    }

    return map;
  }, [locations, allCountries]);

  // 3. Quốc gia nào đang có tỉnh/thành được chọn trong `value`
  const countriesWithValue = useMemo(() => {
    const set = new Set<number>();
    for (const provinceId of value) {
      const countryId = provinceToCountryMap.get(provinceId);
      if (countryId !== undefined) {
        set.add(countryId);
      }
    }
    return set;
  }, [value, provinceToCountryMap]);

  // Danh sách các quốc gia đã được tick chọn bởi admin
  const [explicitSelectedCountryIds, setExplicitSelectedCountryIds] = useState<number[]>([]);

  // Hợp nhất các quốc gia có sẵn điểm đến + quốc gia admin vừa tick.
  // Để trống khi chưa có lựa chọn, không tự thêm Việt Nam mặc định.
  const selectedCountryIds = useMemo(() => {
    const combined = new Set<number>([...explicitSelectedCountryIds, ...countriesWithValue]);
    return Array.from(combined);
  }, [explicitSelectedCountryIds, countriesWithValue]);

  // Quốc gia đang active ở tab chi tiết
  const [activeCountryIdState, setActiveCountryIdState] = useState<number | null>(null);

  const activeCountryId = useMemo(() => {
    if (activeCountryIdState !== null && selectedCountryIds.includes(activeCountryIdState)) {
      return activeCountryIdState;
    }
    return selectedCountryIds[0] ?? null;
  }, [activeCountryIdState, selectedCountryIds]);

  const activeCountry = useMemo(() => {
    return allCountries.find(c => c.location_id === activeCountryId) || null;
  }, [allCountries, activeCountryId]);

  // 4. Danh sách các Vùng / Miền (Level 4) thuộc quốc gia đang active
  const countryRegions = useMemo(() => {
    if (!activeCountry) return [];

    // Tìm các Level 4 thuộc quốc gia này
    const directRegions = locations.filter(
      l =>
        l.level_id === 4 &&
        (l.parent_id === activeCountry.location_id ||
          (Boolean(l.country_code) &&
            Boolean(activeCountry.country_code) &&
            l.country_code === activeCountry.country_code)),
    );

    // Tìm tất cả tỉnh/thành (Level 5) thuộc quốc gia này
    const countryProvinces = locations.filter(
      l => l.level_id === 5 && provinceToCountryMap.get(l.location_id) === activeCountry.location_id,
    );

    const regionProvincesMap = new Map<number, LocationOption[]>();
    directRegions.forEach(r => regionProvincesMap.set(r.location_id, []));

    const orphanProvinces: LocationOption[] = [];
    for (const p of countryProvinces) {
      if (p.parent_id && regionProvincesMap.has(p.parent_id)) {
        regionProvincesMap.get(p.parent_id)!.push(p);
      } else {
        orphanProvinces.push(p);
      }
    }

    const result: Array<{
      key: string;
      location_id: number;
      name: string;
      provinces: LocationOption[];
    }> = [];

    // Đối với Việt Nam: sắp xếp chuẩn Bắc -> Trung -> Nam
    if (activeCountry.country_code === 'VN') {
      const priority = ['miền bắc', 'miền trung', 'miền nam'];
      const sorted = [...directRegions].sort((a, b) => {
        const ai = priority.findIndex(p => a.name.toLowerCase().includes(p));
        const bi = priority.findIndex(p => b.name.toLowerCase().includes(p));
        if (ai !== -1 && bi !== -1) return ai - bi;
        if (ai !== -1) return -1;
        if (bi !== -1) return 1;
        return a.name.localeCompare(b.name, 'vi');
      });

      for (const r of sorted) {
        const provs = (regionProvincesMap.get(r.location_id) || []).sort((a, b) =>
          a.name.localeCompare(b.name, 'vi'),
        );
        result.push({
          key: String(r.location_id),
          location_id: r.location_id,
          name: r.name,
          provinces: provs,
        });
      }
    } else {
      // Các quốc gia khác: sắp xếp theo bảng chữ cái
      const sorted = [...directRegions].sort((a, b) => a.name.localeCompare(b.name, 'vi'));
      for (const r of sorted) {
        const provs = (regionProvincesMap.get(r.location_id) || []).sort((a, b) =>
          a.name.localeCompare(b.name, 'vi'),
        );
        result.push({
          key: String(r.location_id),
          location_id: r.location_id,
          name: r.name,
          provinces: provs,
        });
      }
    }

    // Nếu có tỉnh/thành chưa gắn vào Level 4 nào của quốc gia đó
    if (orphanProvinces.length > 0) {
      result.push({
        key: `other-${activeCountry.location_id}`,
        location_id: -(activeCountry.location_id * 1000 + 1),
        name: result.length > 0 ? 'Khu vực khác' : 'Tất cả tỉnh / thành',
        provinces: orphanProvinces.sort((a, b) => a.name.localeCompare(b.name, 'vi')),
      });
    }

    return result;
  }, [activeCountry, locations, provinceToCountryMap]);

  // Miền / Vùng đang active trong quốc gia hiện tại
  const [activeRegionKeyState, setActiveRegionKeyState] = useState<string | null>(null);

  const activeRegion = useMemo(() => {
    if (countryRegions.length === 0) return null;
    if (activeRegionKeyState && countryRegions.some(r => r.key === activeRegionKeyState)) {
      return countryRegions.find(r => r.key === activeRegionKeyState)!;
    }
    // Mặc định chọn vùng có tỉnh đã được tick, hoặc vùng đầu tiên
    const withSelected = countryRegions.find(r => r.provinces.some(p => value.includes(p.location_id)));
    return withSelected || countryRegions[0];
  }, [countryRegions, activeRegionKeyState, value]);

  // Handler khi tick / bỏ tick một quốc gia ở Bước 1
  const handleToggleCountry = (country: LocationOption) => {
    if (disabled) return;
    const isSelected = selectedCountryIds.includes(country.location_id);

    if (isSelected) {
      // Bỏ tick quốc gia -> loại bỏ khỏi danh sách đã chọn
      setExplicitSelectedCountryIds(prev => prev.filter(id => id !== country.location_id));
      // Đồng thời loại bỏ các tỉnh/thành thuộc quốc gia này khỏi hành trình tour
      const nextValue = value.filter(
        provinceId => provinceToCountryMap.get(provinceId) !== country.location_id,
      );
      onChange(nextValue);

      // Nếu quốc gia đang xem bị bỏ tick, chuyển sang quốc gia khác
      if (activeCountryId === country.location_id) {
        const remaining = selectedCountryIds.filter(id => id !== country.location_id);
        setActiveCountryIdState(remaining[0] ?? null);
      }
    } else {
      // Tick chọn quốc gia
      setExplicitSelectedCountryIds(prev => [...prev, country.location_id]);
      setActiveCountryIdState(country.location_id);
    }
  };

  // Helper toggle 1 tỉnh/thành
  const handleToggleProvince = (provinceId: number) => {
    if (disabled) return;
    if (value.includes(provinceId)) {
      onChange(value.filter(id => id !== provinceId));
    } else {
      onChange([...value, provinceId]);
    }
  };

  // Helper chọn tất cả tỉnh trong miền hiện tại
  const handleSelectAllInRegion = () => {
    if (disabled || !activeRegion) return;
    const idsToAdd = activeRegion.provinces
      .map(p => p.location_id)
      .filter(id => !value.includes(id));
    if (idsToAdd.length > 0) {
      onChange([...value, ...idsToAdd]);
    }
  };

  // Helper bỏ chọn tất cả tỉnh trong miền hiện tại
  const handleDeselectAllInRegion = () => {
    if (disabled || !activeRegion) return;
    const regionIds = new Set(activeRegion.provinces.map(p => p.location_id));
    onChange(value.filter(id => !regionIds.has(id)));
  };

  // Render danh sách tỉnh/thành dạng grid
  const renderProvinceGrid = (provinces: LocationOption[]) => {
    if (!provinces.length) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <p className="text-sm font-medium text-slate-500">Chưa có tỉnh/thành phố nào trong vùng này.</p>
        </div>
      );
    }

    return (
      <div className="custom-scrollbar grid max-h-72 grid-cols-2 gap-2 overflow-y-auto p-3 sm:grid-cols-3 sm:p-4">
        {provinces.map(province => {
          const isSelected = value.includes(province.location_id);
          return (
            <label
              key={province.location_id}
              className={`flex min-w-0 items-center gap-2 rounded-xl border p-3 transition-colors ${
                disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
              } ${
                isSelected
                  ? 'border-blue-200 bg-white text-blue-700 shadow-sm ring-1 ring-blue-100'
                  : 'border-transparent text-slate-600 hover:bg-white'
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                disabled={disabled}
                onChange={() => handleToggleProvince(province.location_id)}
                className="h-4 w-4 shrink-0 rounded border-slate-300 accent-blue-600"
              />
              <span className={`min-w-0 truncate text-[13px] leading-5 ${isSelected ? 'font-semibold' : 'font-medium'}`}>
                {province.name}
              </span>
            </label>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-4 border-t border-slate-100 pt-4">
      {/* Tiêu đề & Tổng số điểm đã chọn */}
      <div className="flex items-center justify-between gap-3">
        <FormFieldLabel>Tỉnh/thành trong hành trình</FormFieldLabel>
        <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600">
          Đã chọn: {value.length} điểm đến
        </span>
      </div>

      {/* ========================================================= */}
      {/* CASE 1: TOUR TRONG NƯỚC (tourType !== 'outbound')         */}
      {/* ========================================================= */}
      {tourType !== 'outbound' && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
          <div role="tablist" aria-label="Chọn miền của tỉnh/thành phố" className="grid grid-cols-3 border-b border-slate-200 bg-white">
            {domesticRegions.map((region, index) => {
              const isSelected = region.key === activeDomesticRegion;
              const selectedCount = region.provinces.filter(province => value.includes(province.location_id)).length;
              return (
                <button
                  key={region.key}
                  id={`${id}-${region.key}`}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  aria-controls={`${id}-domestic-provinces`}
                  tabIndex={isSelected ? 0 : -1}
                  onClick={() => setActiveDomesticRegion(region.key)}
                  onKeyDown={event => {
                    const next =
                      event.key === 'ArrowRight'
                        ? (index + 1) % domesticRegions.length
                        : event.key === 'ArrowLeft'
                        ? (index + domesticRegions.length - 1) % domesticRegions.length
                        : event.key === 'Home'
                        ? 0
                        : event.key === 'End'
                        ? domesticRegions.length - 1
                        : null;
                    if (next === null) return;
                    event.preventDefault();
                    setActiveDomesticRegion(domesticRegions[next].key);
                    document.getElementById(`${id}-${domesticRegions[next].key}`)?.focus();
                  }}
                  className={`min-w-0 border-b-2 px-2 py-3 text-center transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 ${
                    isSelected ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-transparent text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <span className="block text-[13px] font-bold">{region.name}</span>
                  <span className="mt-1 block text-xs">
                    {region.provinces.length} tỉnh/thành{selectedCount ? ` · ${selectedCount} đã chọn` : ''}
                  </span>
                </button>
              );
            })}
          </div>
          <div id={`${id}-domestic-provinces`} role="tabpanel">
            {renderProvinceGrid(
              domesticRegions.find(r => r.key === activeDomesticRegion)?.provinces || [],
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* CASE 2: TOUR NƯỚC NGOÀI (tourType === 'outbound')        */}
      {/* ========================================================= */}
      {tourType === 'outbound' && (
        <div className="space-y-4">
          {/* BƯỚC 1: CHỌN QUỐC GIA TRONG HÀNH TRÌNH */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Globe2 size={16} className="text-blue-600" />
                <span className="text-[13px] font-bold text-slate-800">
                  1. Chọn quốc gia hành trình (Việt Nam & Nước ngoài)
                </span>
              </div>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                Đã chọn: {selectedCountryIds.length} quốc gia
              </span>
            </div>
            <p className="pt-2 text-[12px] text-slate-500">
              Tick chọn các quốc gia mà đoàn sẽ đi qua (có thể chọn Việt Nam và các quốc gia điểm đến).
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {allCountries.map(country => {
                const isSelected = selectedCountryIds.includes(country.location_id);
                const flag = getCountryFlag(country.country_code);
                // Đếm số tỉnh/thành đã chọn trong quốc gia này
                const selectedInCountry = value.filter(
                  pid => provinceToCountryMap.get(pid) === country.location_id,
                ).length;

                return (
                  <button
                    key={country.location_id}
                    type="button"
                    disabled={disabled}
                    onClick={() => handleToggleCountry(country)}
                    className={`group flex items-center gap-2 rounded-xl border px-3 py-2 text-[13px] font-medium transition-all ${
                      disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                    } ${
                      isSelected
                        ? 'border-blue-400 bg-blue-50 text-blue-800 shadow-sm ring-1 ring-blue-300'
                        : 'border-slate-200 bg-slate-50/70 text-slate-700 hover:border-slate-300 hover:bg-white'
                    }`}
                  >
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded border text-xs">
                      {isSelected ? (
                        <Check size={12} className="text-blue-600 stroke-[3]" />
                      ) : (
                        <span className="h-2 w-2 rounded-sm bg-transparent group-hover:bg-slate-300" />
                      )}
                    </span>
                    <span className="inline-flex h-5 items-center gap-2 leading-none">
                      <span className="inline-flex h-5 min-w-6 shrink-0 items-center justify-center text-base leading-none">
                        {flag}
                      </span>
                      <span className="inline-flex h-full items-center font-semibold leading-none">
                        {country.name}
                      </span>
                    </span>
                    {selectedInCountry > 0 && (
                      <span className="ml-1 rounded-full bg-blue-600 px-1.5 py-0.2 text-[10px] font-bold text-white">
                        {selectedInCountry}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* BƯỚC 2 & 3: TABS QUỐC GIA & TABS VÙNG/MIỀN */}
          {selectedCountryIds.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-6 text-center text-sm text-slate-500">
              Vui lòng tick chọn ít nhất một quốc gia ở trên để thiết lập các điểm đến.
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
              {/* THANH TAB THEO TỪNG QUỐC GIA ĐÃ CHỌN */}
              <div className="border-b border-slate-200 bg-white">
                <div className="flex items-center gap-1 overflow-x-auto px-2 pt-2 custom-scrollbar">
                  {selectedCountryIds.map(countryId => {
                    const country = allCountries.find(c => c.location_id === countryId);
                    if (!country) return null;
                    const isActive = activeCountryId === country.location_id;
                    const flag = getCountryFlag(country.country_code);
                    const selectedCount = value.filter(
                      pid => provinceToCountryMap.get(pid) === country.location_id,
                    ).length;

                    return (
                      <button
                        key={country.location_id}
                        type="button"
                        onClick={() => {
                          setActiveCountryIdState(country.location_id);
                          setActiveRegionKeyState(null);
                        }}
                        className={`flex shrink-0 items-center gap-2 rounded-t-xl border-b-2 px-4 py-2.5 text-[13px] font-semibold transition-colors ${
                          isActive
                            ? 'border-blue-600 bg-blue-50/60 text-blue-700'
                            : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <span className="text-base leading-none">{flag}</span>
                        <span>{country.name}</span>
                        {selectedCount > 0 ? (
                          <span className="rounded-full bg-blue-600 px-1.5 py-0.2 text-[11px] font-bold text-white">
                            {selectedCount}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-normal">(0)</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* KHỐI CHỌN VÙNG/MIỀN VÀ TỈNH/THÀNH CỦA QUỐC GIA ĐANG XEM */}
              {activeCountry && (
                <div className="p-3 sm:p-4 space-y-3">
                  {/* TIÊU ĐỀ & THANH TABS VÙNG / MIỀN */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                        <MapPin size={14} className="text-blue-600" />
                        <span>
                          2. Chọn Vùng / Miền tại {activeCountry.name}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        {countryRegions.length} vùng/miền
                      </span>
                    </div>

                    {countryRegions.length === 0 ? (
                      <p className="text-xs text-slate-500">Quốc gia này chưa có dữ liệu vùng/miền hoặc tỉnh thành.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {countryRegions.map(region => {
                          const isActive = activeRegion?.key === region.key;
                          const selectedCount = region.provinces.filter(p => value.includes(p.location_id)).length;

                          return (
                            <button
                              key={region.key}
                              type="button"
                              onClick={() => setActiveRegionKeyState(region.key)}
                              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                                isActive
                                  ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                                  : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50/50'
                              }`}
                            >
                              <span>{region.name}</span>
                              <span
                                className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                                  isActive
                                    ? 'bg-white/20 text-white'
                                    : selectedCount > 0
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-slate-100 text-slate-500'
                                }`}
                              >
                                {selectedCount > 0 ? `${selectedCount}/${region.provinces.length}` : region.provinces.length}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* DANH SÁCH TỈNH / THÀNH CỦA MIỀN ĐANG ACTIVE */}
                  {activeRegion && (
                    <div className="mt-3 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/60 px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800">
                            Tỉnh / Thành phố thuộc {activeRegion.name}:
                          </span>
                          <span className="text-[11px] text-slate-500">
                            ({activeRegion.provinces.length} địa điểm)
                          </span>
                        </div>
                        {activeRegion.provinces.length > 0 && !disabled && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleSelectAllInRegion}
                              className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              Chọn tất cả
                            </button>
                            <span className="text-slate-300 text-xs">•</span>
                            <button
                              type="button"
                              onClick={handleDeselectAllInRegion}
                              className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 hover:underline"
                            >
                              Bỏ chọn
                            </button>
                          </div>
                        )}
                      </div>
                      {renderProvinceGrid(activeRegion.provinces)}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SẮP XẾP THỨ TỰ LỘ TRÌNH TOUR */}
      <TourRouteOrder ids={value} locations={locations} disabled={disabled} onChange={onChange} />
    </div>
  );
}
