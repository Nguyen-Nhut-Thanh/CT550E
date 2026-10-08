"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BriefcaseBusiness,
  Compass,
  Heart,
  Info,
  Mail,
  MapPin,
  Plane,
  Phone,
  Send,
  ShieldCheck,
} from "lucide-react";
import { FaFacebookF, FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa6";
import { SiZalo } from "react-icons/si";

const exploreLinks = [
  { label: "Điểm đến yêu thích", href: "/destinations" },
  { label: "Tour trong nước", href: "/tours?type=domestic" },
  { label: "Tour nước ngoài", href: "/tours?type=international" },
  { label: "Tour theo mùa", href: "/tours?type=seasonal" },
  { label: "Tour trọn gói", href: "/tours?type=package" },
  { label: "Khuyến mãi", href: "/tours?promotion=true" },
];

const supportLinks = [
  { label: "Hướng dẫn đặt tour", href: "/booking-guide" },
  { label: "Chính sách thanh toán", href: "/payment-policy" },
  { label: "Chính sách hủy tour", href: "/cancellation-policy" },
  { label: "Điều khoản sử dụng", href: "/terms" },
  { label: "Câu hỏi thường gặp", href: "/faq" },
  { label: "Liên hệ", href: "/contact" },
];

const aboutLinks = [
  { label: "Giới thiệu JourniTrip", href: "/about" },
  { label: "Blog du lịch", href: "/blog" },
  { label: "Đối tác & Đại lý", href: "/partners" },
  { label: "Tuyển dụng", href: "/careers" },
  { label: "Tin tức", href: "/news" },
  { label: "Đánh giá khách hàng", href: "/reviews" },
];

const linkClass =
  "group relative w-fit text-[14px] font-medium text-slate-500 transition-colors duration-300 hover:text-blue-600";

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={linkClass}>
      {children}
      <span className="absolute -bottom-1 left-0 h-[1.5px] w-0 rounded-full bg-blue-600 transition-all duration-300 group-hover:w-full" />
    </Link>
  );
}

export default function Footer() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin") || pathname.startsWith("/account")) {
    return null;
  }

  return (
    <footer className="relative overflow-hidden border-t border-blue-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f5faff_50%,#eaf5ff_100%)] text-slate-700">
      {/* Decorative glow */}
      <div className="pointer-events-none absolute -left-24 top-32 h-80 w-80 rounded-full bg-blue-200/20 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-sky-100/50 blur-3xl" />

      {/* Airplane decoration */}
      <div className="pointer-events-none absolute right-[7%] top-9 hidden xl:block">
        <div className="relative h-24 w-64">
          <div className="absolute left-0 top-12 w-44 rotate-[-10deg] border-t-2 border-dashed border-blue-300/70" />

          <Plane className="absolute left-36 top-0 h-8 w-8 rotate-[-15deg] fill-blue-500 text-blue-500" />

          <div className="absolute right-0 top-10 rotate-[-4deg] font-serif text-3xl font-bold italic leading-[0.9] text-blue-500">
            Go
            <br />
            Further
            <span className="ml-2">↗</span>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="relative z-10 mx-auto max-w-[1500px] px-5 pb-10 pt-14 sm:px-8 lg:px-10 xl:px-12 xl:pb-12 xl:pt-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 xl:grid-cols-[1.25fr_.9fr_.9fr_.9fr_2.1fr] xl:gap-10">
          {/* BRAND */}
          <div className="relative">
            <Link href="/" className="inline-block">
              <div className="relative">
                {/* Logo icon */}
                <div className="mb-1 flex items-end gap-2">
                  <div className="relative mb-1 h-10 w-14">
                    <div className="absolute bottom-0 left-0 h-7 w-10 rotate-[-8deg] rounded-[50%] border-t-[5px] border-blue-500" />

                    <Plane className="absolute right-0 top-0 h-7 w-7 -rotate-12 fill-sky-400 text-sky-400" />
                  </div>

                  <span className="text-[34px] font-black italic tracking-[-2px] text-blue-600 sm:text-[40px]">
                    JourniTrip
                    <span className="text-amber-400">.</span>
                  </span>
                </div>
              </div>
            </Link>

            <p className="mt-4 max-w-[260px] text-[15px] font-medium leading-7 text-slate-500">
              Khám phá thế giới, tạo nên
              <br className="hidden xl:block" />
              những hành trình đáng nhớ!
            </p>

            {/* Social */}
            <div className="mt-6 flex items-center gap-3">
              <a
                href="#"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1877f2] text-white shadow-md shadow-blue-500/20 transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/35"
              >
                <FaFacebookF className="h-4 w-4" />
              </a>

              <a
                href="#"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white shadow-md shadow-pink-500/20 transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-pink-500/35"
              >
                <FaInstagram className="h-[18px] w-[18px]" />
              </a>

              <a
                href="#"
                aria-label="YouTube"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ff0000] text-white shadow-md shadow-red-500/20 transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-red-500/35"
              >
                <FaYoutube className="h-5 w-5" />
              </a>

              <a
                href="#"
                aria-label="TikTok"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#000000] text-white shadow-md shadow-slate-900/20 transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-900/35"
              >
                <FaTiktok className="h-[17px] w-[17px]" />
              </a>

              <a
                href="#"
                aria-label="Zalo"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0068ff] text-white shadow-md shadow-blue-600/20 transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-600/35"
              >
                <SiZalo className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* KHÁM PHÁ */}
          <div>
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white shadow-md shadow-blue-100">
                <Compass className="h-[18px] w-[18px]" />
              </div>

              <h3 className="text-[17px] font-extrabold text-[#123d7a]">
                Khám phá
              </h3>
            </div>

            <ul className="space-y-4">
              {exploreLinks.map((item) => (
                <li key={item.label}>
                  <FooterLink href={item.href}>{item.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* HỖ TRỢ */}
          <div>
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white shadow-md shadow-blue-100">
                <BriefcaseBusiness className="h-[18px] w-[18px]" />
              </div>

              <h3 className="text-[17px] font-extrabold text-[#123d7a]">
                Hỗ trợ
              </h3>
            </div>

            <ul className="space-y-4">
              {supportLinks.map((item) => (
                <li key={item.label}>
                  <FooterLink href={item.href}>{item.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* VỀ CHÚNG TÔI */}
          <div>
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white shadow-md shadow-blue-100">
                <Info className="h-[19px] w-[19px]" />
              </div>

              <h3 className="text-[17px] font-extrabold text-[#123d7a]">
                Về chúng tôi
              </h3>
            </div>

            <ul className="space-y-4">
              {aboutLinks.map((item) => (
                <li key={item.label}>
                  <FooterLink href={item.href}>{item.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* NEWSLETTER */}
          <div className="xl:border-l xl:border-blue-200 xl:pl-10">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <Send className="h-5 w-5 -rotate-12 text-blue-600" />
              </div>

              <h3 className="text-xl font-extrabold text-[#123d7a]">
                Đăng ký nhận tin
              </h3>
            </div>

            <p className="max-w-md text-[14px] font-medium leading-6 text-slate-500">
              Nhận ngay ưu đãi hấp dẫn, tour mới nhất và những kinh nghiệm du
              lịch hữu ích!
            </p>

            {/* Email */}
            <form
              onSubmit={(e) => e.preventDefault()}
              className="mt-6 flex h-[58px] overflow-hidden rounded-full border border-blue-200 bg-white shadow-[0_8px_30px_rgba(36,110,220,0.07)] transition focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50"
            >
              <div className="flex flex-1 items-center gap-3 pl-5">
                <Mail className="h-5 w-5 shrink-0 text-blue-600" />

                <input
                  type="email"
                  placeholder="Nhập email của bạn"
                  className="h-full min-w-0 flex-1 bg-transparent pr-3 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
              </div>

              <button
                type="submit"
                className="my-[3px] mr-[3px] min-w-[130px] rounded-full bg-gradient-to-r from-blue-600 to-blue-500 px-7 text-sm font-bold text-white shadow-md transition hover:from-blue-700 hover:to-blue-600 active:scale-[.98]"
              >
                Đăng ký
              </button>
            </form>

            {/* Contact */}
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <a
                href="tel:0799634281"
                className="group flex gap-3.5 items-center"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white">
                  <Phone className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-[17px] font-extrabold text-blue-700">
                    0799 634 281
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Từ 7:00 - 23:00 hằng ngày
                  </p>
                </div>
              </a>

              <div className="flex gap-3.5 items-center border-blue-200 sm:border-l sm:pl-6">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <MapPin className="h-5 w-5" />
                </div>

                <p className="text-xs font-medium leading-5 text-slate-500">
                  Hà Nội, Phú Quốc,
                  <br />
                  Cần Thơ, Đà Lạt,...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Landscape decoration bottom-left */}
      <div className="pointer-events-none absolute bottom-[76px] left-0 hidden h-40 w-[390px] overflow-hidden opacity-90 xl:block">
        <Image
          src="https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=900"
          alt=""
          fill
          className="object-cover"
          sizes="390px"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-[#eff7ff]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#eff7ff]/20 to-white/20" />

        {/* curved mask effect */}
        <div className="absolute -right-36 -top-24 h-[300px] w-[300px] rounded-full bg-[#f5faff]" />
      </div>

      {/* Bottom bar */}
      <div className="relative z-10 border-t border-blue-100 bg-[#e8f4ff]/80">
        <div className="mx-auto flex max-w-[1500px] flex-col items-center justify-between gap-5 px-5 py-6 sm:px-8 lg:flex-row lg:px-12">
          {/* Copyright */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 lg:justify-start">
            <span>
              © 2026{" "}
              <strong className="font-extrabold text-slate-700">
                JourniTrip.
              </strong>{" "}
              All rights reserved.
            </span>

            <span className="hidden h-6 w-px bg-blue-200 sm:block" />

            <span className="flex items-center gap-2">
              <Heart className="h-3.5 w-3.5 fill-blue-600 text-blue-600" />
              Khám phá thế giới cùng bạn
            </span>
          </div>

          {/* Payments */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
              Thanh toán an toàn
            </div>

            <span className="h-7 w-px bg-blue-200" />

            <span className="text-lg font-black italic tracking-tight text-[#143d8d]">
              VISA
            </span>

            <div className="flex -space-x-2">
              <span className="h-6 w-6 rounded-full bg-red-500" />
              <span className="h-6 w-6 rounded-full bg-amber-400/90" />
            </div>

            <span className="rounded-md bg-pink-600 px-1.5 py-1 text-[9px] font-black leading-none text-white">
              mo
              <br />
              mo
            </span>

            <span className="text-xs font-black tracking-tight text-blue-600">
              Zalo
              <span className="rounded-sm bg-emerald-500 px-1 text-white">
                Pay
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Mountain doodle */}
      <div className="pointer-events-none absolute bottom-5 right-7 hidden opacity-25 xl:block">
        <svg
          width="170"
          height="95"
          viewBox="0 0 170 95"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6 62L42 31L59 46L79 18L112 49L130 37L165 68"
            stroke="#2686df"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M23 73C51 66 83 67 109 73C130 77 145 81 163 82"
            stroke="#2686df"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </footer>
  );
}