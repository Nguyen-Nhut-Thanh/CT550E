import { SupportChat } from "@/components/chat/SupportChat";
import Footer from "@/components/common/Footer";
import Header from "@/components/common/Header";
import { ToastProvider } from "@/components/common/ToastProvider";
import { Manrope, Sora } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
});

const sora = Sora({
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
});

export const metadata = {
  title: "JourniTrip - Du lịch mọi nơi",
  description: "Đặt tour du lịch uy tín, giá rẻ với nhiều ưu đãi hấp dẫn",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body
        className={`${manrope.variable} ${sora.variable} flex min-h-dvh flex-col bg-white font-sans text-gray-900 antialiased`}
      >
        <ToastProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <SupportChat />
        </ToastProvider>
      </body>
    </html>
  );
}
