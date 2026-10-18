import type { NavItem as SharedNavItem } from "shared";
import { House, Compass, MapPin, Newspaper, Info, type LucideIcon } from "lucide-react";
export type NavItem = SharedNavItem & { icon: LucideIcon };

export const navData: NavItem[] = [
  { title: "Trang chủ", href: "/", icon: House },
  { title: "Tour du lịch", href: "/tours", icon: Compass },
  {
    title: "Điểm đến",
    icon: MapPin,
    href: "/tours",
    isMega: true,
    children: [
      {
        title: "Trong nước",
        href: "/tours?type=domestic",
        subItems: [
          { title: "Miền Bắc", href: "/tours?region=north" },
          { title: "Miền Trung", href: "/tours?region=central" },
          { title: "Miền Nam", href: "/tours?region=south" }
        ]
      },
      {
        title: "Ngoài nước",
        href: "/tours?type=international",
        subItems: [
          { title: "Thái Lan", href: "/tours?country=Thailand" },
          { title: "Nhật Bản", href: "/tours?country=Japan" },
          { title: "Hàn Quốc", href: "/tours?country=South+Korea" },
          { title: "Singapore", href: "/tours?country=Singapore" },
          { title: "Trung Quốc", href: "/tours?country=China" },
          { title: "Mỹ", href: "/tours?country=USA" },
          { title: "Pháp", href: "/tours?country=France" },
          { title: "Úc", href: "/tours?country=Australia" }
        ]
      }
    ]
  },
  { title: "Bài viết", href: "/blog", icon: Newspaper },
  { title: "Về chúng tôi", href: "/about", icon: Info }
];
