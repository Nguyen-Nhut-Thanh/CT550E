export type AiChatCriteria = {
  destination?: string;
  departure?: string;
  from?: string;
  to?: string;
  budget?: number;
  durationDays?: number;
  adults?: number;
  children?: number;
  infants?: number;
  groupSize?: number;
  transport?: string;
  preferences?: string;
  tourQuery?: string;
};

export type AiChatTour = {
  id: number;
  title: string;
  url: string;
  image_url?: string;
  price: number;
  original_price: number;
  duration: string;
  schedule_id: number;
  departure_date: string;
  destination?: string;
  transport?: string;
};

export type AiChatTopic = 'search' | 'details' | 'destination' | 'quote' | 'voucher';

export type AiChatRequest = {
  message: string;
  criteria?: AiChatCriteria;
  previousScheduleIds?: number[];
  focusedScheduleId?: number;
  topic?: AiChatTopic;
  history?: { question: string; reply: string }[];
  visibleTours?: { scheduleId: number; title: string; departureDate: string }[];
};

export type AiChatResponse = {
  reply: string;
  tours: AiChatTour[];
  criteria: AiChatCriteria;
  previousScheduleIds: number[];
  focusedScheduleId?: number;
  topic?: AiChatTopic;
};
