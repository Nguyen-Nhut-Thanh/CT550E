import { Flower, Leaf, Snowflake, Sun } from "lucide-react";
import type { SeasonType } from "shared";

export interface SeasonDefinition {
  id: SeasonType;
  name: string;
  englishName: string;
  icon: typeof Flower;
  description: string;
  theme: {
    bgPage: string;
    ambientBlob1: string;
    ambientBlob2: string;
    accentColor: string;
    badgeBg: string;
    badgeText: string;
    heroGlow: string;
    sectionTintAbout: string;
    sectionTintFlash: string;
    sectionTintFeatured: string;
  };
}

export const SEASONS_DATA: Record<SeasonType, SeasonDefinition> = {
  spring: {
    id: "spring",
    name: "Mùa Xuân",
    englishName: "Spring Sakura",
    icon: Flower,
    description: "Cánh hoa anh đào phớt hồng rơi bay bổng theo làn gió tươi mới.",
    theme: {
      bgPage: "bg-[#fff8fa]",
      ambientBlob1: "bg-pink-300/40",
      ambientBlob2: "bg-rose-200/40",
      accentColor: "text-rose-500",
      badgeBg: "bg-rose-100/80",
      badgeText: "text-rose-700",
      heroGlow: "rgba(254, 205, 222, 0.35)",
      sectionTintAbout: "linear-gradient(180deg, #fff7fa 0%, #ffffff 50%, #fff2f6 100%)",
      sectionTintFlash: "#fff0f5",
      sectionTintFeatured: "#ffe8f1",
    },
  },
  summer: {
    id: "summer",
    name: "Mùa Hè",
    englishName: "Summer Azure",
    icon: Sun,
    description: "Ánh nắng vàng biển biếc và những đốm sáng đom đóm lung linh trong đêm.",
    theme: {
      bgPage: "bg-[#f5fbff]",
      ambientBlob1: "bg-cyan-300/40",
      ambientBlob2: "bg-amber-200/40",
      accentColor: "text-cyan-600",
      badgeBg: "bg-cyan-100/80",
      badgeText: "text-cyan-800",
      heroGlow: "rgba(186, 240, 255, 0.35)",
      sectionTintAbout: "linear-gradient(180deg, #f0faff 0%, #ffffff 50%, #e8f7ff 100%)",
      sectionTintFlash: "#eaf7ff",
      sectionTintFeatured: "#dff2ff",
    },
  },
  autumn: {
    id: "autumn",
    name: "Mùa Thu",
    englishName: "Autumn Foliage",
    icon: Leaf,
    description: "Những chiếc lá phong vàng hổ phách chao nghiêng lãng mạn.",
    theme: {
      bgPage: "bg-[#fdfaf5]",
      ambientBlob1: "bg-amber-300/40",
      ambientBlob2: "bg-orange-300/35",
      accentColor: "text-orange-600",
      badgeBg: "bg-amber-100/80",
      badgeText: "text-amber-800",
      heroGlow: "rgba(254, 230, 185, 0.4)",
      sectionTintAbout: "linear-gradient(180deg, #fffaf2 0%, #ffffff 50%, #fff4e6 100%)",
      sectionTintFlash: "#fff3e3",
      sectionTintFeatured: "#ffe9cc",
    },
  },
  winter: {
    id: "winter",
    name: "Mùa Đông",
    englishName: "Winter Alpine",
    icon: Snowflake,
    description: "Những bông tuyết trắng muốt rơi nhẹ nhàng phủ sương băng giá vùng cao.",
    theme: {
      bgPage: "bg-[#f5f8fd]",
      ambientBlob1: "bg-blue-300/35",
      ambientBlob2: "bg-indigo-200/40",
      accentColor: "text-blue-600",
      badgeBg: "bg-blue-100/80",
      badgeText: "text-blue-700",
      heroGlow: "rgba(215, 235, 255, 0.4)",
      sectionTintAbout: "linear-gradient(180deg, #f2f7fd 0%, #ffffff 50%, #eaf3fd 100%)",
      sectionTintFlash: "#edf4fe",
      sectionTintFeatured: "#e0eefe",
    },
  },
};

export const PARTICLE_DENSITIES: Record<"light" | "normal" | "dense", Record<SeasonType, number>> = {
  light: {
    spring: 35,
    summer: 25,
    autumn: 30,
    winter: 65,
  },
  normal: {
    spring: 70,
    summer: 50,
    autumn: 60,
    winter: 140,
  },
  dense: {
    spring: 110,
    summer: 75,
    autumn: 95,
    winter: 220,
  },
};

