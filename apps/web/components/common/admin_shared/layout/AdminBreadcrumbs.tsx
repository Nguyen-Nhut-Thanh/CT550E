"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useLayoutEffect, useRef } from "react";

const sections = [
  { href: "/admin/analytics", label: "Báo cáo & Thống kê" },
  { href: "/admin/bookings", label: "Quản lý Booking" },
  { href: "/admin/tours", label: "Quản lý Tour", detail: "Chỉnh sửa tour", create: "Thêm tour mới" },
  { href: "/admin/schedules", label: "Lịch khởi hành", detail: "Chi tiết lịch khởi hành" },
  { href: "/admin/trips", label: "Điều hành chuyến" },
  { href: "/admin/locations", label: "Quản lý Địa điểm", detail: "Chỉnh sửa địa điểm", create: "Thêm địa điểm mới" },
  { href: "/admin/services", label: "Dịch vụ & Đối tác" },
  { href: "/admin/workforce", label: "Nhân sự & điều hành" },
  { href: "/admin/users", label: "Quản lý Người dùng" },
  { href: "/admin/reviews", label: "Duyệt đánh giá" },
  { href: "/admin/marketing/membership", label: "Hạng thành viên" },
  { href: "/admin/chats", label: "Hỗ trợ khách hàng" },
  { href: "/admin/marketing/flash-deals", label: "Flash Deals" },
  { href: "/admin/marketing/vouchers", label: "Mã giảm giá" },
  { href: "/admin/banners", label: "Quản lý Banner", detail: "Chỉnh sửa banner", create: "Thêm banner mới" },
  { href: "/admin/marketing/posts", label: "Bài viết", detail: "Chỉnh sửa bài viết", create: "Thêm bài viết mới" },
];

export function getAdminBreadcrumbs(pathname: string) {
  const items: Array<{ label: string; href?: string }> = [{ label: "Trang chủ", href: "/admin" }];
  const section = sections.find(({ href }) => pathname === href || pathname.startsWith(`${href}/`));
  if (!section) return [...items, { label: pathname === "/admin" ? "Tổng quan" : "Quản trị" }];
  if (pathname === section.href) return [...items, { label: section.label }];

  items.push({ label: section.label, href: section.href });
  const suffix = pathname.slice(section.href.length + 1).split("/");
  const creating = ["new", "create"].includes(suffix[0]);
  if (suffix.length > 1 && section.href === "/admin/tours") {
    items.push({ label: "Chỉnh sửa tour", href: `${section.href}/${suffix[0]}` });
    items.push({ label: suffix[1] === "policies" ? "Chính sách tour" : "Mẫu lịch trình" });
  } else {
    items.push({ label: (creating ? section.create : section.detail) || section.label });
  }
  return items;
}

export function AdminBreadcrumbs({ pathname, className = "" }: { pathname: string; className?: string }) {
  const navRef = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const nav = navRef.current;
    const container = nav?.parentElement;
    if (!nav || !container) return;
    const updateOffset = () => {
      const gap = parseFloat(getComputedStyle(nav).marginBottom) || 0;
      const padding = parseFloat(getComputedStyle(container).paddingTop) || 0;
      container.style.setProperty("--admin-header-top-offset", `${nav.getBoundingClientRect().height + gap + padding}px`);
    };
    updateOffset();
    const observer = new ResizeObserver(updateOffset);
    observer.observe(nav);
    observer.observe(container);
    return () => {
      observer.disconnect();
      container.style.removeProperty("--admin-header-top-offset");
    };
  }, [pathname]);
  const items = getAdminBreadcrumbs(pathname);
  return (
    <nav ref={navRef} aria-label="Đường dẫn" className={`relative z-10 mb-2.5 shrink-0 text-[12px] font-normal leading-[1.5] text-[#7b90b0] ${className}`}>
      <ol className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
        {items.map((item, index) => (
          <li key={`${index}-${item.label}`} className="flex min-w-0 items-center gap-2.5">
            {index > 0 && <ChevronRight size={14} aria-hidden="true" className="shrink-0" />}
            {item.href ? <Link href={item.href} className="transition-colors hover:text-[#075bff]">{item.label}</Link> : <span aria-current={index === items.length - 1 ? "page" : undefined}>{item.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
