import type { ReactNode } from "react";
import { Manrope, Sora } from "next/font/google";
import { ToastProvider } from "@/components/common/Toast";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
});

const sora = Sora({
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body
        className={`${manrope.variable} ${sora.variable} min-h-dvh bg-white font-sans text-gray-900 antialiased`}
      >
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
