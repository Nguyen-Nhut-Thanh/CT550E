import { Compass, House, Info, MapPin, Newspaper } from "lucide-react";
import type { NavigationItemWithIcon as NavItem, NavLocationData } from 'shared';

export const FALLBACK_NAV_DATA: NavItem[] = [
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
        href: "/tours?type=outbound",
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

export function buildNavItems(locationData?: NavLocationData | null): NavItem[] {
  if (!locationData) return FALLBACK_NAV_DATA;

  const domesticSubItems = locationData.domestic?.length
    ? locationData.domestic.map((reg) => ({
        title: reg.region,
        href: `/tours?region=${encodeURIComponent(reg.region.toLowerCase().replace(/\s+/g, '-'))}`,
      }))
    : [
        { title: "Miền Bắc", href: "/tours?region=north" },
        { title: "Miền Trung", href: "/tours?region=central" },
        { title: "Miền Nam", href: "/tours?region=south" },
      ];

  const internationalSubItems = locationData.international?.length
    ? locationData.international.map((country) => ({
        title: country.name,
        href: `/tours?country=${encodeURIComponent(country.slug || country.name)}`,
      }))
    : [
        { title: "Thái Lan", href: "/tours?country=Thailand" },
        { title: "Nhật Bản", href: "/tours?country=Japan" },
        { title: "Hàn Quốc", href: "/tours?country=South+Korea" },
        { title: "Singapore", href: "/tours?country=Singapore" },
        { title: "Trung Quốc", href: "/tours?country=China" },
        { title: "Mỹ", href: "/tours?country=USA" },
        { title: "Pháp", href: "/tours?country=France" },
        { title: "Úc", href: "/tours?country=Australia" },
      ];

  return [
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
          subItems: domesticSubItems,
        },
        {
          title: "Ngoài nước",
          href: "/tours?type=outbound",
          subItems: internationalSubItems,
        },
      ],
    },
    { title: "Bài viết", href: "/blog", icon: Newspaper },
    { title: "Về chúng tôi", href: "/about", icon: Info },
  ];
}

export const navData: NavItem[] = FALLBACK_NAV_DATA;
