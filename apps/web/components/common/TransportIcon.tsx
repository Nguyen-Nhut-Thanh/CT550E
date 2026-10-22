"use client";

import { getTransportCategory } from "@/lib/client/utils/tourDisplay";
import { Bus, Plane, Train } from "lucide-react";
import type { TransportIconProps as Props } from 'shared';

export default function TransportIcon({ type, className }: Props) {
  const category = getTransportCategory(type);

  if (category === "plane") {
    return <Plane className={className} />;
  }

  if (category === "train") {
    return <Train className={className} />;
  }

  return <Bus className={className} />;
}
