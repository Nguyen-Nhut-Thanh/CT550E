"use client";

import type { TourDetailsCardProps } from 'shared';
import { TourAmenitiesEditor } from './TourAmenitiesEditor';

export function TourDetailsCard({ tour, onTourChange }: TourDetailsCardProps) {
  return <TourAmenitiesEditor value={tour.tour_amenities || []} onChange={tour_amenities => onTourChange(prev => ({ ...prev, tour_amenities }))} />;
}
