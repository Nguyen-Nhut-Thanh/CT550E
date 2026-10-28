"use client";

import { TourRecommendationCard } from "@/components/common/TourRecommendationCard";
import { useFavoriteTours } from "@/lib/favorites/useFavoriteTours";
import { useState } from "react";
import type { ChatContextCard } from "shared";

/** Connects support-chat tour data and favorite actions to the shared card. */
export function TourMessageCard({ context }: { context: ChatContextCard }) {
 const favorites = useFavoriteTours();
 const [error, setError] = useState("");
 return <TourRecommendationCard
  tour={context}
  favorite={favorites.isFavorite(context.id)}
  favoritePending={favorites.isPending(context.id)}
  onToggleFavorite={() => {
   void favorites.toggleFavorite(context.id).then(result => setError(result.ok ? "" : result.message || "Không lưu được tour"));
  }}
  error={error}
 />;
}
