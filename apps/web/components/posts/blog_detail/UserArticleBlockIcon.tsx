import {
  Camera,
  Info,
  Lightbulb,
  MapPin,
  Mountain,
  Ship,
  Sun,
  Utensils,
} from "lucide-react";
import type { ArticleIcon } from "shared";

export function ArticleBlockIcon({
  name,
  className = "h-5 w-5",
}: {
  name: ArticleIcon;
  className?: string;
}) {
  const Icon =
    {
      camera: Camera,
      info: Info,
      lightbulb: Lightbulb,
      map: MapPin,
      mountain: Mountain,
      ship: Ship,
      sun: Sun,
      utensils: Utensils,
    }[name] || Info;
  return <Icon className={className} aria-hidden="true" />;
}
