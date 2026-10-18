"use client";

import Link from "next/link";
import {
  Map,
  CalendarDays,
  Ticket,
  FileText,
  Image as ImageIcon,
  MapPin,
  MessageSquare,
  Zap,
  PlusCircle,
} from "lucide-react";

export function DashboardQuickActions() {
  const actions = [
    {
      title: "Thêm Tour Mới",
      desc: "Tạo gói tour du lịch",
      href: "/admin/tours/new",
      icon: Map,
      color: "text-blue-600 bg-blue-50 border-blue-100 group-hover:bg-blue-600 group-hover:text-white",
    },
    {
      title: "Lịch Khởi Hành",
      desc: "Mở ngày & giá vé tour",
      href: "/admin/schedules",
      icon: CalendarDays,
      color: "text-indigo-600 bg-indigo-50 border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white",
    },
    {
      title: "Mã Khuyến Mãi",
      desc: "Tạo voucher giảm giá",
      href: "/admin/marketing/vouchers",
      icon: Ticket,
      color: "text-amber-600 bg-amber-50 border-amber-100 group-hover:bg-amber-600 group-hover:text-white",
    },
    {
      title: "Flash Deals",
      desc: "Giảm giá giờ vàng",
      href: "/admin/marketing/flash-deals",
      icon: Zap,
      color: "text-orange-600 bg-orange-50 border-orange-100 group-hover:bg-orange-600 group-hover:text-white",
    },
    {
      title: "Bài Viết Blog",
      desc: "Cẩm nang & tin tức",
      href: "/admin/marketing/posts",
      icon: FileText,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white",
    },
    {
      title: "Quản Lý Banner",
      desc: "Cập nhật slider trang chủ",
      href: "/admin/banners",
      icon: ImageIcon,
      color: "text-rose-600 bg-rose-50 border-rose-100 group-hover:bg-rose-600 group-hover:text-white",
    },
    {
      title: "Điểm Đến",
      desc: "Tỉnh thành & địa danh",
      href: "/admin/locations",
      icon: MapPin,
      color: "text-teal-600 bg-teal-50 border-teal-100 group-hover:bg-teal-600 group-hover:text-white",
    },
    {
      title: "Tin Nhắn Hỗ Trợ",
      desc: "Chat trực tuyến với khách",
      href: "/admin/chats",
      icon: MessageSquare,
      color: "text-sky-600 bg-sky-50 border-sky-100 group-hover:bg-sky-600 group-hover:text-white",
    },
  ];

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <PlusCircle size={18} />
          </div>
          <div>
            <h2 className="text-base font-black tracking-tight text-slate-900">
              Thao Tác Nhanh
            </h2>
            <p className="text-xs font-medium text-slate-400">
              Phím tắt quản trị các phân hệ
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <Link
              key={act.title}
              href={act.href}
              className="group flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-slate-50/50 p-4 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-200 hover:bg-white hover:shadow-xs"
            >
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition-all duration-200 ${act.color}`}
              >
                <Icon size={20} />
              </div>
              <h3 className="mt-3 text-xs font-black text-slate-800 transition-colors group-hover:text-blue-600">
                {act.title}
              </h3>
              <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                {act.desc}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
