"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronRight,
  ExternalLink,
  MapPin,
  Route as RouteIcon,
} from "lucide-react";
import type { PublicTourDetail } from "shared";

type LocationDetailLite = {
  latitude?: number | string | null;
  longitude?: number | string | null;
};

type LocationLite = {
  location_id?: number | null;
  name?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  destinations_detail?: LocationDetailLite | null;
};

type TourDestinationLite = {
  visit_order?: number | null;
  note?: string | null;
  name?: string | null;
  location_id?: number | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  locations?: LocationLite | null;
};

type TourWithMapData = PublicTourDetail & {
  departure_locations?: LocationLite | null;
  tour_destinations?: TourDestinationLite[] | null;
};

type TourSmartMapProps = {
  tour?: TourWithMapData | null;
};

type RouteStop = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  note?: string | null;
  isDeparture?: boolean;
};

declare global {
  interface Window {
    google?: any;
    __journiTripGoogleMapsPromise?: Promise<void>;
  }
}

const FALLBACK_COORDINATES: Record<
  string,
  { latitude: number; longitude: number }
> = {
  "tp ho chi minh": { latitude: 10.7769, longitude: 106.7009 },
  "ho chi minh": { latitude: 10.7769, longitude: 106.7009 },
  "sai gon": { latitude: 10.7769, longitude: 106.7009 },
  hcm: { latitude: 10.7769, longitude: 106.7009 },
  tphcm: { latitude: 10.7769, longitude: 106.7009 },
  "ha noi": { latitude: 21.0285, longitude: 105.8542 },
  "da nang": { latitude: 16.0544, longitude: 108.2022 },
  "hai phong": { latitude: 20.8449, longitude: 106.6881 },
  "can tho": { latitude: 10.0452, longitude: 105.7469 },
  "soc trang": { latitude: 9.6037, longitude: 105.9804 },
  "bac lieu": { latitude: 9.2941, longitude: 105.7278 },
  "ca mau": { latitude: 9.1769, longitude: 105.1524 },
  "dat mui": { latitude: 8.6086, longitude: 104.7214 },
  "phu quoc": { latitude: 10.2289, longitude: 103.9572 },
  "nha trang": { latitude: 12.2388, longitude: 109.1967 },
  "da lat": { latitude: 11.9404, longitude: 108.4583 },
  "phan thiet": { latitude: 10.9333, longitude: 108.1 },
  "mui ne": { latitude: 10.9333, longitude: 108.2833 },
  "vung tau": { latitude: 10.346, longitude: 107.0843 },
  "quy nhon": { latitude: 13.782, longitude: 109.2197 },
  hue: { latitude: 16.4637, longitude: 107.5909 },
  "thua thien hue": { latitude: 16.4637, longitude: 107.5909 },
  "hoi an": { latitude: 15.8801, longitude: 108.338 },
  "quang nam": { latitude: 15.8801, longitude: 108.338 },
  "ha long": { latitude: 20.9506, longitude: 107.0733 },
  "quang ninh": { latitude: 20.9506, longitude: 107.0733 },
  "sa pa": { latitude: 22.3364, longitude: 103.8438 },
  sapa: { latitude: 22.3364, longitude: 103.8438 },
  "lao cai": { latitude: 22.4856, longitude: 103.9707 },
  "ninh binh": { latitude: 20.2506, longitude: 105.9745 },
  "trang an": { latitude: 20.2536, longitude: 105.9126 },
  "ha giang": { latitude: 22.8233, longitude: 104.9833 },
  "cao bang": { latitude: 22.6657, longitude: 105.9739 },
  "dien bien": { latitude: 21.3856, longitude: 103.0181 },
  "moc chau": { latitude: 20.8439, longitude: 104.6366 },
  "mai chau": { latitude: 20.6586, longitude: 105.0747 },
  "phan rang": { latitude: 11.5653, longitude: 108.9886 },
  "ninh thuan": { latitude: 11.5653, longitude: 108.9886 },
  "tuy hoa": { latitude: 13.0882, longitude: 109.3142 },
  "phu yen": { latitude: 13.0882, longitude: 109.3142 },
  "dong hoi": { latitude: 17.4833, longitude: 106.6 },
  "phong nha": { latitude: 17.5905, longitude: 106.2831 },
  "quang binh": { latitude: 17.4833, longitude: 106.6 },
  "buon ma thuot": { latitude: 12.6667, longitude: 108.05 },
  "dak lak": { latitude: 12.6667, longitude: 108.05 },
  pleiku: { latitude: 13.9833, longitude: 108.0 },
  "gia lai": { latitude: 13.9833, longitude: 108.0 },
  "ben tre": { latitude: 10.2415, longitude: 106.3758 },
  "my tho": { latitude: 10.3594, longitude: 106.3614 },
  "tien giang": { latitude: 10.3594, longitude: 106.3614 },
  "cao lanh": { latitude: 10.4571, longitude: 105.6324 },
  "sa dec": { latitude: 10.2922, longitude: 105.7578 },
  "dong thap": { latitude: 10.4571, longitude: 105.6324 },
  "chau doc": { latitude: 10.7, longitude: 105.1167 },
  "long xuyen": { latitude: 10.3759, longitude: 105.4185 },
  "an giang": { latitude: 10.3759, longitude: 105.4185 },
  "rach gia": { latitude: 10.0125, longitude: 105.0809 },
  "kien giang": { latitude: 10.0125, longitude: 105.0809 },
  "con dao": { latitude: 8.6833, longitude: 106.6 },
  "vinh long": { latitude: 10.2537, longitude: 105.9722 },
  "tra vinh": { latitude: 9.9347, longitude: 106.3458 },
  "hau giang": { latitude: 9.7844, longitude: 105.4701 },
  "vi thanh": { latitude: 9.7844, longitude: 105.4701 },
  "bien hoa": { latitude: 10.9574, longitude: 106.8427 },
  "dong nai": { latitude: 10.9574, longitude: 106.8427 },
  "thu dau mot": { latitude: 10.9805, longitude: 106.6519 },
  "binh duong": { latitude: 10.9805, longitude: 106.6519 },
  "tay ninh": { latitude: 11.31, longitude: 106.0983 },
};

const FALLBACK_ROUTE: RouteStop[] = [
  {
    id: "hcm",
    name: "TP. Hồ Chí Minh",
    latitude: 10.7769,
    longitude: 106.7009,
    note: "Điểm khởi hành",
    isDeparture: true,
  },
  {
    id: "can-tho",
    name: "Cần Thơ",
    latitude: 10.0452,
    longitude: 105.7469,
    note: "Chợ nổi Cái Răng & Bến Ninh Kiều",
  },
  {
    id: "soc-trang",
    name: "Sóc Trăng",
    latitude: 9.6037,
    longitude: 105.9804,
    note: "Chùa Dơi & Chùa Som Rong",
  },
  {
    id: "bac-lieu",
    name: "Bạc Liêu",
    latitude: 9.2941,
    longitude: 105.7278,
    note: "Nhà Công tử Bạc Liêu",
  },
  {
    id: "ca-mau",
    name: "Cà Mau",
    latitude: 9.1769,
    longitude: 105.1524,
    note: "Mũi Cà Mau - Cực Nam Tổ Quốc",
  },
];

function normalizeName(value?: string | null) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/\./g, "")
    .toLowerCase()
    .trim();
}

function toNumber(value?: number | string | null) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function getFallbackCoordinate(name: string) {
  const normalized = normalizeName(name);

  if (FALLBACK_COORDINATES[normalized]) {
    return FALLBACK_COORDINATES[normalized];
  }

  const matched = Object.keys(FALLBACK_COORDINATES).find(
    (key) => normalized.includes(key) || key.includes(normalized),
  );

  return matched ? FALLBACK_COORDINATES[matched] : null;
}

function mapLocationToStop(
  item: TourDestinationLite | LocationLite | null | undefined,
  defaultNote?: string | null,
  isDeparture = false,
): RouteStop | null {
  if (!item) return null;

  const destItem = item as TourDestinationLite;
  const locItem = item as LocationLite;

  const name = (destItem.name || destItem.locations?.name || locItem.name || "").trim();
  if (!name) return null;

  const latitude =
    toNumber(destItem.latitude) ??
    toNumber(destItem.locations?.latitude) ??
    toNumber(locItem.destinations_detail?.latitude) ??
    toNumber(destItem.locations?.destinations_detail?.latitude);

  const longitude =
    toNumber(destItem.longitude) ??
    toNumber(destItem.locations?.longitude) ??
    toNumber(locItem.destinations_detail?.longitude) ??
    toNumber(destItem.locations?.destinations_detail?.longitude);

  const note = destItem.note || defaultNote;
  const id = String(
    destItem.location_id ??
      destItem.locations?.location_id ??
      locItem.location_id ??
      normalizeName(name),
  );

  if (latitude != null && longitude != null) {
    return {
      id,
      name,
      latitude,
      longitude,
      note,
      isDeparture,
    };
  }

  const fallback = getFallbackCoordinate(name);
  if (!fallback) return null;

  return {
    id,
    name,
    latitude: fallback.latitude,
    longitude: fallback.longitude,
    note,
    isDeparture,
  };
}

function buildRouteStops(tour?: TourWithMapData | null): RouteStop[] {
  if (!tour) return FALLBACK_ROUTE;

  const stops: RouteStop[] = [];

  const departure = mapLocationToStop(
    tour.departure_locations as any,
    "Điểm khởi hành",
    true,
  );

  if (departure) {
    stops.push(departure);
  }

  const destinations = [...(tour.tour_destinations ?? [])].sort(
    (a, b) => Number(a.visit_order ?? 0) - Number(b.visit_order ?? 0),
  );

  for (const destination of destinations) {
    const stop =
      mapLocationToStop(
        destination as any,
        destination.note || "Điểm tham quan trong hành trình",
      ) ||
      mapLocationToStop(
        destination.locations as any,
        destination.note || "Điểm tham quan trong hành trình",
      );

    if (!stop) continue;

    const duplicated = stops.some(
      (item) =>
        item.id === stop.id ||
        normalizeName(item.name) === normalizeName(stop.name),
    );

    if (!duplicated) {
      stops.push(stop);
    }
  }

  return stops.length >= 2 ? stops : FALLBACK_ROUTE;
}

function buildGoogleMapsUrl(stops: RouteStop[]) {
  if (stops.length < 2) return "https://www.google.com/maps";

  const origin = `${stops[0].latitude},${stops[0].longitude}`;
  const destinationStop = stops[stops.length - 1];
  const destination = `${destinationStop.latitude},${destinationStop.longitude}`;
  const waypoints = stops
    .slice(1, -1)
    .map((stop) => `${stop.latitude},${stop.longitude}`)
    .join("|");

  const params = new URLSearchParams({
    api: "1",
    origin,
    destination,
    travelmode: "driving",
  });

  if (waypoints) {
    params.set("waypoints", waypoints);
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function loadGoogleMaps(apiKey: string): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps chỉ chạy ở trình duyệt."));
  }

  if (window.google?.maps) {
    return Promise.resolve();
  }

  if (window.__journiTripGoogleMapsPromise) {
    return window.__journiTripGoogleMapsPromise;
  }

  window.__journiTripGoogleMapsPromise = new Promise<void>((resolve, reject) => {
    if (window.google?.maps) {
      resolve();
      return;
    }

    const checkReady = (retries = 30) => {
      if (window.google?.maps) {
        resolve();
      } else if (retries > 0) {
        setTimeout(() => checkReady(retries - 1), 100);
      } else {
        resolve();
      }
    };

    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-journitrip-google-maps="true"]',
    );

    if (existing) {
      if (window.google?.maps) {
        resolve();
      } else {
        existing.addEventListener("load", () => checkReady(), { once: true });
        existing.addEventListener(
          "error",
          () => reject(new Error("Không tải được Google Maps.")),
          { once: true },
        );
      }
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      apiKey,
    )}&loading=async&v=weekly`;
    script.async = true;
    script.defer = true;
    script.dataset.journitripGoogleMaps = "true";

    script.onload = () => checkReady();
    script.onerror = () => {
      window.__journiTripGoogleMapsPromise = undefined;
      reject(new Error("Không tải được Google Maps JavaScript API."));
    };

    document.head.appendChild(script);
  });

  return window.__journiTripGoogleMapsPromise;
}

function createNumberMarker(index: number, active = false) {
  const wrapper = document.createElement("div");
  wrapper.dataset.routeMarker = String(index);

  Object.assign(wrapper.style, {
    width: active ? "42px" : "36px",
    height: active ? "42px" : "36px",
    borderRadius: "9999px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#ffffff",
    fontSize: active ? "15px" : "14px",
    fontWeight: "800",
    background: active ? "#f97316" : "#fb923c",
    border: "3px solid #ffffff",
    boxShadow: active
      ? "0 8px 20px rgba(249,115,22,.38)"
      : "0 5px 12px rgba(15,23,42,.22)",
    cursor: "pointer",
    transition: "all .2s ease",
  });

  wrapper.textContent = String(index);

  return wrapper;
}

function setMarkerActive(element: HTMLElement, active: boolean) {
  element.style.width = active ? "42px" : "36px";
  element.style.height = active ? "42px" : "36px";
  element.style.fontSize = active ? "15px" : "14px";
  element.style.background = active ? "#f97316" : "#fb923c";
  element.style.boxShadow = active
    ? "0 8px 20px rgba(249,115,22,.38)"
    : "0 5px 12px rgba(15,23,42,.22)";
}

export default function TourSmartMap({ tour = null }: TourSmartMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const markerElementsRef = useRef<Map<string, HTMLElement>>(new Map());

  const [activeStopId, setActiveStopId] = useState("");
  const [mapError, setMapError] = useState<string | null>(null);
  const [isLoadingMap, setIsLoadingMap] = useState(true);

  const routeStops = useMemo(() => buildRouteStops(tour), [tour]);

  const googleMapsUrl = useMemo(
    () => buildGoogleMapsUrl(routeStops),
    [routeStops],
  );

  useEffect(() => {
    setActiveStopId(routeStops[0]?.id ?? "");
  }, [routeStops]);

  useEffect(() => {
    markerElementsRef.current.forEach((element, id) => {
      setMarkerActive(element, id === activeStopId);
    });
  }, [activeStopId]);

  useEffect(() => {
    let cancelled = false;
    let polylines: any[] = [];
    let markers: any[] = [];

    const initMap = async () => {
      if (!mapRef.current) return;

      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

      if (!apiKey) {
        setMapError(
          "Thiếu NEXT_PUBLIC_GOOGLE_MAPS_API_KEY trong file .env.local.",
        );
        setIsLoadingMap(false);
        return;
      }

      if (routeStops.length < 2) {
        setMapError("Tour chưa có đủ điểm để tạo tuyến đường.");
        setIsLoadingMap(false);
        return;
      }

      try {
        setIsLoadingMap(true);
        setMapError(null);

        await loadGoogleMaps(apiKey);

        if (cancelled || !mapRef.current) return;

        if (!window.google?.maps) {
          throw new Error("Không thể khởi tạo thư viện Google Maps.");
        }

        let MapClass: any = window.google.maps.Map;
        let MarkerClass: any =
          window.google.maps.marker?.AdvancedMarkerElement ||
          window.google.maps.Marker;

        if (typeof window.google.maps.importLibrary === "function") {
          try {
            const mapsLib = await window.google.maps.importLibrary("maps");
            if (mapsLib?.Map) MapClass = mapsLib.Map;

            const markerLib = await window.google.maps.importLibrary("marker");
            if (markerLib?.AdvancedMarkerElement) {
              MarkerClass = markerLib.AdvancedMarkerElement;
            }
          } catch (libErr) {
            console.warn("importLibrary failed, falling back to window.google.maps:", libErr);
          }
        }

        if (!MapClass || !mapRef.current) return;

        const map = new MapClass(mapRef.current, {
          center: {
            lat: routeStops[0].latitude,
            lng: routeStops[0].longitude,
          },
          zoom: 8,
          mapId: "DEMO_MAP_ID",
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
          clickableIcons: true,
          gestureHandling: "cooperative",
        });

        // Add Markers
        markerElementsRef.current.clear();
        const bounds = new window.google.maps.LatLngBounds();

        routeStops.forEach((stop, index) => {
          let marker: any;

          if (MarkerClass && MarkerClass.name === "AdvancedMarkerElement") {
            const markerElement = createNumberMarker(
              index + 1,
              stop.id === routeStops[0]?.id,
            );
            markerElementsRef.current.set(stop.id, markerElement);

            marker = new MarkerClass({
              map,
              position: {
                lat: stop.latitude,
                lng: stop.longitude,
              },
              title: `${index + 1}. ${stop.name}`,
              content: markerElement,
            });

            markerElement.addEventListener("click", () => {
              setActiveStopId(stop.id);
            });
          } else {
            marker = new (window.google.maps.Marker || MarkerClass)({
              map,
              position: {
                lat: stop.latitude,
                lng: stop.longitude,
              },
              title: `${index + 1}. ${stop.name}`,
              label: {
                text: String(index + 1),
                color: "#ffffff",
                fontWeight: "bold",
              },
            });
          }

          marker.addListener?.("click", () => {
            setActiveStopId(stop.id);
            map.panTo({
              lat: stop.latitude,
              lng: stop.longitude,
            });
          });

          markers.push(marker);
          bounds.extend({ lat: stop.latitude, lng: stop.longitude });
        });

        // Compute route driving path, fallback to Polyline line if Routes API is not enabled
        let hasCustomRoute = false;

        if (typeof window.google.maps.importLibrary === "function") {
          try {
            const { Route } = await window.google.maps.importLibrary("routes");
            const origin = { lat: routeStops[0].latitude, lng: routeStops[0].longitude };
            const lastStop = routeStops[routeStops.length - 1];
            const destination = { lat: lastStop.latitude, lng: lastStop.longitude };
            const intermediates = routeStops.slice(1, -1).map((stop) => ({
              location: { lat: stop.latitude, lng: stop.longitude },
            }));

            const request: any = {
              origin,
              destination,
              travelMode: "DRIVING",
              fields: ["path", "viewport"],
            };
            if (intermediates.length > 0) request.intermediates = intermediates;

            const result = await Route.computeRoutes(request);
            if (result.routes?.length) {
              const route = result.routes[0];
              polylines = route.createPolylines();
              polylines.forEach((polyline: any) => {
                polyline.setOptions({
                  strokeColor: "#1a73e8",
                  strokeOpacity: 0.95,
                  strokeWeight: 5,
                });
                polyline.setMap(map);
              });
              if (Array.isArray(route.path) && route.path.length > 0) {
                const routeBounds = new window.google.maps.LatLngBounds();
                route.path.forEach((point: any) => routeBounds.extend(point));
                map.fitBounds(routeBounds, 42);
                hasCustomRoute = true;
              }
            }
          } catch (routeErr) {
            console.warn("Google Routes API not available, falling back to Polyline:", routeErr);
          }
        }

        if (!hasCustomRoute) {
          // Direct polyline fallback
          const directPolyline = new window.google.maps.Polyline({
            path: routeStops.map((s) => ({ lat: s.latitude, lng: s.longitude })),
            geodesic: true,
            strokeColor: "#1a73e8",
            strokeOpacity: 0.85,
            strokeWeight: 4,
          });
          directPolyline.setMap(map);
          polylines.push(directPolyline);
          map.fitBounds(bounds, 42);
        }
      } catch (error) {
        console.error("TourSmartMap:", error);

        if (!cancelled) {
          setMapError(
            error instanceof Error
              ? error.message
              : "Không thể tải bản đồ hành trình.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingMap(false);
        }
      }
    };

    void initMap();

    return () => {
      cancelled = true;

      polylines.forEach((polyline) => polyline.setMap?.(null));
      markers.forEach((marker) => {
        marker.map = null;
      });

      markerElementsRef.current.clear();
    };
  }, [routeStops]);

  const handleViewDetails = () => {
    const target =
      document.getElementById("tour-itinerary") ||
      document.getElementById("tour-schedules");

    target?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
            <RouteIcon className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Bản đồ hành trình
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Theo dõi tuyến đường thực tế và các điểm nổi bật của tour
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            Bản đồ mở rộng
            <ExternalLink className="h-3.5 w-3.5" />
          </a>

          <button
            type="button"
            onClick={handleViewDetails}
            className="inline-flex items-center gap-1 px-2 py-2 text-sm font-bold text-[#0b63b6] transition hover:text-sky-700"
          >
            Xem chi tiết
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-5 grid items-stretch gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="relative h-[460px] w-full overflow-hidden bg-[#eaf2f8]">
            <div ref={mapRef} className="absolute inset-0" />

            {isLoadingMap ? (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/75 backdrop-blur-sm">
                <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-lg">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-sky-200 border-t-sky-600" />
                  Đang tải bản đồ...
                </div>
              </div>
            ) : null}

            {mapError ? (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-50 p-6">
                <div className="max-w-md rounded-2xl border border-rose-200 bg-white p-5 text-center shadow-sm">
                  <p className="font-bold text-slate-900">
                    Không tải được bản đồ
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {mapError}
                  </p>
                </div>
              </div>
            ) : null}

            {!mapError ? (
              <div className="pointer-events-none absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/95 px-3.5 py-2 text-xs font-bold text-slate-800 shadow-md backdrop-blur">
                <MapPin className="h-4 w-4 text-[#1a73e8]" />
                Đi qua {routeStops.length} điểm nổi bật
              </div>
            ) : null}
          </div>

          <div className="border-t border-slate-200 bg-white px-4 py-3.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Tuyến hành trình
            </p>

            <p className="mt-1 text-sm font-semibold leading-6 text-slate-700">
              {routeStops.map((stop) => stop.name).join(" → ")}
            </p>
          </div>
        </div>

        <aside className="flex min-h-[520px] flex-col rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Đi qua những điểm nào?
            </h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Các điểm được sắp theo đúng thứ tự hành trình của tour.
            </p>
          </div>

          <div className="mt-4 flex-1 space-y-2 overflow-y-auto pr-1">
            {routeStops.map((stop, index) => {
              const isActive = stop.id === activeStopId;

              return (
                <button
                  key={`${stop.id}-${index}`}
                  type="button"
                  onClick={() => setActiveStopId(stop.id)}
                  className={`flex w-full items-start gap-3 rounded-2xl border px-3 py-3 text-left transition ${
                    isActive
                      ? "border-orange-300 bg-white shadow-sm"
                      : "border-transparent bg-white/80 hover:border-slate-200 hover:bg-white"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border text-xs font-black transition ${
                      isActive
                        ? "border-orange-300 bg-orange-500 text-white"
                        : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    {index + 1}
                  </span>

                  <span className="min-w-0">
                    <span className="block text-sm font-bold leading-5 text-slate-900">
                      {stop.name}
                    </span>

                    <span className="mt-0.5 block text-xs leading-5 text-slate-500">
                      {stop.isDeparture
                        ? "Điểm khởi hành"
                        : stop.note || "Điểm tham quan trong hành trình"}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </aside>
      </div>
    </section>
  );
}
