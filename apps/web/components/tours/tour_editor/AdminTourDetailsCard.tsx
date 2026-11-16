"use client";

import type { TourDetailsCardProps } from 'shared';
import { TourAmenitiesEditor } from "@/components/tours/tour_editor/AdminTourAmenitiesEditor";

export function TourDetailsCard({ tour, onTourChange }: TourDetailsCardProps) {
  return <TourAmenitiesEditor value={tour.tour_amenities || []} onChange={tour_amenities => onTourChange(prev => ({ ...prev, tour_amenities }))} />;
}
