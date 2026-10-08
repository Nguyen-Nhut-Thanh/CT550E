"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { User, ChevronDown, Menu, X, MapPin, Globe, Loader2 } from "lucide-react";
import { getToken } from "@/lib/client/utils/auth";
import { navData, type NavItem } from "@/lib/client/constants/nav-data";
import { useNavLocationData } from "@/lib/client/hooks/useNavLocationData";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const { navLocationData, isLoadingNav } = useNavLocationData();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = () => {
      const token = getToken();
      setIsLoggedIn(!!token);
    };
    checkAuth();
    setIsMenuOpen(false);
    window.addEventListener("auth-change", checkAuth);
    return () => window.removeEventListener("auth-change", checkAuth);
  }, [pathname]);

  // Không hiển thị trên trang Home hoặc các trang Admin
  if (pathname === "/" || pathname.startsWith("/admin")) return null;

  const toggleExpand = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title) ? prev.filter((i) => i !== title) : [...prev, title],
    );
  };

  const NavLink = ({ item }: { item: NavItem }) => {
    const isActive = pathname === item.href;

    if (item.isMega) {
      return (
        <div className="group relative">
          <button
            type="button"
            className={`flex items-center gap-1 py-6 text-[13px] font-bold uppercase tracking-[1px] transition-colors ${
              isActive
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-700 hover:text-blue-600"
            }`}
          >
            {item.title}
            <ChevronDown
              size={14}
              className="transition-transform group-hover:rotate-180"
            />
          </button>

          {/* Mega menu dropdown */}
          <div className="invisible absolute left-1/2 top-full z-50 w-[1100px] -translate-x-1/2 translate-y-2 overflow-hidden rounded-b-2xl border-t border-gray-50 bg-white opacity-0 shadow-2xl transition-all duration-300 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
            {isLoadingNav ? (
              <div className="flex items-center justify-center gap-2 p-20 text-slate-400">
                <Loader2 className="animate-spin" size={20} />
                <span className="font-medium">Đang tải địa điểm...</span>
              </div>
            ) : (
              <div className="grid min-h-[450px] grid-cols-12">
                {/* Điểm đến trong nước */}
                <div className="col-span-9 border-r border-gray-100 bg-gray-50/30 p-10">
                  <div className="mb-8 flex items-center gap-3 text-blue-600">
                    <MapPin size={24} />
                    <span className="text-base font-bold uppercase tracking-[2px]">
                      Điểm đến Trong nước
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-10">
                    {navLocationData?.domestic?.map((region) => (
                      <div key={region.region}>
                        <h4 className="mb-5 flex items-center justify-between border-b-2 border-blue-100 pb-3 text-[13px] font-bold uppercase tracking-[1.5px] text-gray-900">
                          {region.region}
                          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] text-blue-600">
                            {region.cities.length}
                          </span>
                        </h4>
                        <ul className="no-scrollbar max-h-[300px] space-y-2.5 overflow-y-auto pr-4">
                          {region.cities.map((city) => (
                            <li key={city.slug}>
                              <Link
                                href={`/tours?destination=${encodeURIComponent(city.name)}`}
                                className="group/item flex items-center gap-2 text-[12px] font-medium text-gray-500 transition-all hover:translate-x-1 hover:text-blue-600"
                              >
                                <span className="h-1.5 w-1.5 rounded-full bg-gray-200 transition-all group-hover/item:scale-125 group-hover/item:bg-blue-600" />
                                {city.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Điểm đến quốc tế */}
                <div className="col-span-3 bg-white p-10">
                  <div className="mb-8 flex items-center gap-3 text-amber-500">
                    <Globe size={24} />
                    <span className="text-base font-bold uppercase tracking-[2px]">
                      Quốc tế
                    </span>
                  </div>
                  <div className="no-scrollbar max-h-[380px] space-y-1 overflow-y-auto pr-4">
                    {navLocationData?.international?.map((country) => (
                      <Link
                        key={country.slug}
                        href={`/tours?country=${country.slug}`}
                        className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-[12px] font-bold text-gray-500 transition-all hover:bg-amber-50/50 hover:text-blue-600"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-200" />
                        {country.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <Link
        href={item.href}
        className={`py-6 text-[13px] font-bold uppercase tracking-[1px] transition-colors ${
          isActive
            ? "border-b-2 border-blue-600 text-blue-600"
            : "text-gray-700 hover:text-blue-600"
        }`}
      >
        {item.title}
      </Link>
    );
  };

  return (
    <>
      <header className="sticky top-0 z-[100] border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-10">
          <Link
            href="/"
            className="py-4 text-[24px] font-black italic uppercase tracking-[-0.5px] text-blue-600 no-underline"
          >
            JourniTrip<span className="text-amber-400">.</span>
          </Link>

          <nav className="hidden h-full items-center gap-8 lg:flex">
            {navData.map((item) => (
              <NavLink key={item.title} item={item} />
            ))}
          </nav>

          <div className="flex items-center gap-4 py-4 lg:gap-6 lg:border-l lg:border-gray-100 lg:pl-6">
            <Link
              href={isLoggedIn ? "/account" : "/login"}
              className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                isLoggedIn
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
                  : "bg-gray-100 text-gray-500 hover:bg-amber-400 hover:text-white"
              }`}
              aria-label="User Account"
            >
              <User size={18} />
            </Link>

            <button
              type="button"
              className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 lg:hidden"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Mở menu di động"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <div
        className={`fixed inset-0 z-[110] transition-all duration-300 lg:hidden ${
          isMenuOpen ? "visible" : "invisible"
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
            isMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsMenuOpen(false)}
        />

        <div
          className={`absolute bottom-0 left-0 top-0 flex w-[320px] flex-col bg-white shadow-2xl transition-transform duration-300 ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-gray-100 p-6">
            <Link
              href="/"
              className="text-xl font-black italic uppercase text-blue-600"
              onClick={() => setIsMenuOpen(false)}
            >
              JourniTrip<span className="text-amber-400">.</span>
            </Link>
            <button
              type="button"
              onClick={() => setIsMenuOpen(false)}
              className="p-2 text-gray-400 transition-colors hover:text-gray-900"
              aria-label="Đóng menu"
            >
              <X size={24} />
            </button>
          </div>

          <div className="no-scrollbar flex-1 overflow-y-auto p-4">
            <nav className="space-y-1">
              {navData.map((item) => (
                <div key={item.title} className="border-b border-gray-50 last:border-0">
                  {item.isMega ? (
                    <div>
                      <button
                        type="button"
                        onClick={() => toggleExpand(item.title)}
                        className="flex w-full items-center justify-between p-4 text-sm font-bold uppercase tracking-wider text-gray-800"
                      >
                        {item.title}
                        <ChevronDown
                          size={18}
                          className={`transition-transform duration-300 ${
                            expandedItems.includes(item.title) ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      <div
                        className={`overflow-hidden transition-all duration-300 ${
                          expandedItems.includes(item.title)
                            ? "max-h-[2000px] pb-4"
                            : "max-h-0"
                        }`}
                      >
                        <div className="px-4">
                          {isLoadingNav ? (
                            <div className="py-4 text-center text-xs text-gray-400">
                              Đang tải địa điểm...
                            </div>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => toggleExpand("trong-nuoc")}
                                className="flex w-full items-center justify-between py-3 text-sm font-bold text-blue-600"
                              >
                                <span className="flex items-center gap-2">
                                  <MapPin size={16} /> Trong nước
                                </span>
                                <ChevronDown
                                  size={16}
                                  className={
                                    expandedItems.includes("trong-nuoc")
                                      ? "rotate-180"
                                      : ""
                                  }
                                />
                              </button>

                              {expandedItems.includes("trong-nuoc") && (
                                <div className="space-y-4 py-2 pl-6">
                                  {navLocationData?.domestic?.map((region) => (
                                    <div key={region.region}>
                                      <h5 className="mb-2 text-[11px] font-bold uppercase tracking-widest text-gray-400">
                                        {region.region}
                                      </h5>
                                      <div className="grid grid-cols-2 gap-2">
                                        {region.cities.map((city) => (
                                          <Link
                                            key={city.slug}
                                            href={`/tours?destination=${encodeURIComponent(city.name)}`}
                                            className="py-1 text-[12px] font-medium text-gray-600"
                                            onClick={() => setIsMenuOpen(false)}
                                          >
                                            {city.name}
                                          </Link>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              <button
                                type="button"
                                onClick={() => toggleExpand("ngoai-nuoc")}
                                className="flex w-full items-center justify-between py-3 text-sm font-bold text-amber-500"
                              >
                                <span className="flex items-center gap-2">
                                  <Globe size={16} /> Ngoài nước
                                </span>
                                <ChevronDown
                                  size={16}
                                  className={
                                    expandedItems.includes("ngoai-nuoc")
                                      ? "rotate-180"
                                      : ""
                                  }
                                />
                              </button>

                              {expandedItems.includes("ngoai-nuoc") && (
                                <div className="grid grid-cols-2 gap-2 py-2 pl-6">
                                  {navLocationData?.international?.map((country) => (
                                    <Link
                                      key={country.slug}
                                      href={`/tours?country=${country.slug}`}
                                      className="py-1 text-[12px] font-bold text-gray-600"
                                      onClick={() => setIsMenuOpen(false)}
                                    >
                                      {country.name}
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className="block p-4 text-sm font-bold uppercase tracking-wider text-gray-800"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.title}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </div>

          <div className="bg-gray-50 p-6">
            {isLoggedIn ? (
              <Link
                href="/account"
                className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                  U
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">
                    Tài khoản của tôi
                  </div>
                  <div className="text-xs text-gray-500">
                    Xem hồ sơ & đặt chỗ
                  </div>
                </div>
              </Link>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <Link
                  href="/login"
                  className="rounded-xl bg-gray-100 px-4 py-3 text-center text-sm font-bold text-gray-700 hover:bg-gray-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-bold text-white hover:bg-blue-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
