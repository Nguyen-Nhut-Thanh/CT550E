import { z } from "zod";
import type { ChatContextCard } from "./models";

export type AiChatTour = Pick<ChatContextCard,
  "id" | "title" | "url" | "image_url" | "price" | "duration" |
  "schedule_id" | "departure_date" | "original_price" | "summary" | "destination" | "transport"
>;

export type AiChatTourReference = { tourId: number; scheduleId?: number };

export type AiChatRequest = {
  message: string;
  previousQuestions?: string[];
  tourReference?: AiChatTourReference;
  recentTours?: AiChatTourReference[];
  action?: "quote" | "advice" | "offers";
};

export type AiChatResponse = {
  reply: string;
  tours: AiChatTour[];
  tourReference?: AiChatTourReference;
};

const brief = z.string().trim().max(120);
const count = z.number().int().min(0).max(100).nullable();
const money = z.number().int().positive().max(1_000_000_000_000).nullable();

export const tourIntentSchema = z.object({
  intent: z.enum(["search", "advice", "quote", "offers", "greeting", "other"]),
  topic: z.enum(["overview", "itinerary", "policies", "pickup"]),
  policy_key: z.enum(["included", "excluded", "children", "payment", "register", "cancel", "weekday", "holiday", "force", "contact"]).nullable(),
  destination: brief.nullable(),
  departure: brief.nullable(),
  tour_name: brief.nullable(),
  themes: z.array(brief).max(5),
  departure_from: z.iso.date().nullable(),
  departure_until: z.iso.date().nullable(),
  duration_days: z.number().int().positive().max(180).nullable(),
  max_per_person: money,
  max_total: money,
  adults: count,
  children: count,
  infants: count,
  voucher_code: z.string().trim().max(50).nullable(),
  tour_position: z.number().int().min(1).max(5).nullable(),
  use_selected_tour: z.boolean(),
  change_departure: z.boolean(),
});

export type TourIntent = z.infer<typeof tourIntentSchema>;

