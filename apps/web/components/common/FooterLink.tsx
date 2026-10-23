"use client";

import Link from "next/link";
import { NavigationPending } from "./NavigationPending";

const linkClass = "group relative w-fit text-[14px] font-medium text-slate-500 transition-colors duration-300 hover:text-blue-600";

/** Hiển thị liên kết trong chân trang với hiệu ứng khi rê chuột. */
export function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={linkClass}>
      {children}
      <NavigationPending />
      <span className="absolute -bottom-1 left-0 h-[1.5px] w-0 rounded-full bg-blue-600 transition-all duration-300 group-hover:w-full" />
    </Link>
  );
}
