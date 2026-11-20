import { SupportChat } from "@/components/chat/customer_chat/UserSupportChat";
import Footer from "@/components/common/navigation_layout/Footer";
import Header from "@/components/common/navigation_layout/Header";
import { ToastProvider } from "@/components/common/dialogs_and_feedback/toast/ToastProvider";
import { Manrope, Playfair_Display, Sora } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin", "latin-ext", "vietnamese"],
  variable: "--font-sans",
});

const sora = Sora({
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
});

const playfair = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata = {
  title: "JourniTrip - Du lịch mọi nơi",
  description: "Đặt tour du lịch uy tín, giá rẻ với nhiều ưu đãi hấp dẫn",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${manrope.variable} ${sora.variable} ${playfair.variable} flex min-h-dvh flex-col bg-white font-sans text-gray-900 antialiased`}
      >
        <ToastProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <SupportChat aiEnabled={Boolean(process.env.AI_SERVICE_URL?.trim() && process.env.AI_SERVICE_TOKEN?.trim())} />
        </ToastProvider>
      </body>
    </html>
  );
}
