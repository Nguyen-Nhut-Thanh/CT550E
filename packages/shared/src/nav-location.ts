export interface NavLocationData {
  domestic: {
    region: string;
    cities: { name: string; slug: string }[];
  }[];
  international: { name: string; slug: string }[];
}

export interface NavItem {
  title: string;
  href: string;
  isMega?: boolean;
  children?: {
    title: string;
    href: string;
    subItems?: { title: string; href: string }[];
  }[];
}

