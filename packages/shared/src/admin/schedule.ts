import type * as ReactTypes from 'react';

export type ScheduleOverviewTour = {
  tour_id: number;
  code: string;
  name: string;
  duration_days: number;
  base_price: string | number;
  status: number;
};

export type ScheduleBasicInfoCardProps = {
  form: ScheduleFormState;
  isPast: boolean;
  hasBookings: boolean;
  bookedCount: number;
  originalQuota: number;
  tourInfo: TourInfo | null;
  onFormChange: (
    updater: (prev: ScheduleFormState) => ScheduleFormState,
  ) => void;
};

export type ScheduleItinerarySectionProps = {
  form: ScheduleFormState;
  isPast: boolean;
  expandedDay: number | null;
  tourInfo: TourInfo | null;
  hotels: HotelItem[];
  transports: TransportItem[];
  roomTypesMap: Record<number, RoomTypeItem[]>;
  onExpandedDayChange: (value: number | null) => void;
  onFormChange: (updater: (prev: ScheduleFormState) => ScheduleFormState) => void;
  onHotelSelect: (hotelId: number) => void;
};

export type ScheduleSidebarProps = {
  form: ScheduleFormState;
  isPast: boolean;
  saving: boolean;
  uploading: boolean;
  fileInputRef: ReactTypes.RefObject<HTMLInputElement | null>;
  onSave: () => void;
  onFileUpload: (event: ReactTypes.ChangeEvent<HTMLInputElement>) => void;
  onFormChange: (updater: (prev: ScheduleFormState) => ScheduleFormState) => void;
};

export type ScheduleTablePanelTour = {
  tour_id: number;
  status: number;
};

export type ScheduleTablePanelProps = {
  selectedTourId: number;
  selectedTour?: ScheduleTablePanelTour;
  schedules: AdminSchedule[];
  loading: boolean;
  scheduleStatusFilter: string;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onFilterChange: (value: string) => void;
  onCreate: () => void;
  onEdit: (scheduleId: number) => void;
  onDelete: (scheduleId: number) => void;
  onToggleStatus: (scheduleId: number, currentStatus: number, bookedCount: number) => void;
  onPageChange: (page: number) => void;
};

export type TourListPanelProps = {
  loading: boolean;
  tours: ScheduleOverviewTour[];
  selectedTourId: number | null;
  searchTerm: string;
  tourStatusFilter: string;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: string) => void;
  onSelectTour: (tourId: number) => void;
  onPageChange: (page: number) => void;
};

export type ScheduleStartFieldsProps = {
  dateValue: string;
  minDate: string;
  disabled?: boolean;
  onDateChange: (value: string) => void;
  timeValue?: string;
  onTimeChange?: (value: string) => void;
  dateLabel?: string;
  timeLabel?: string;
};

export type ScheduleManagementItem = Omit<AdminSchedule, 'price' | '_count'> & {
  price: number;
  _count?: {
    bookings?: number;
  };
};

export type TourInfo = {
  name?: string | null;
  duration_days?: number | null;
  base_price?: number | string | null;
  cut_off_hours?: number | null;
};

export type HotelItem = {
  hotel_id: number;
  name: string;
  star_rating?: number | null;
};

export type TransportItem = {
  transport_id: number;
  name: string;
  type?: string | null;
};

export type RoomTypeItem = {
  room_type_id: number;
  name: string;
};

export type ScheduleHotelItem = {
  schedule_hotel_id?: number;
  tour_schedule_id?: number;
  hotel_id?: number | null;
  room_type_id?: number | null;
  nights?: number | null;
  day_from?: number | null;
  day_to?: number | null;
  note?: string | null;
  hotels?: HotelItem | null;
  hotel_room_types?: RoomTypeItem & { base_price?: number | string | null } | null;
};

export type ScheduleDetailResponse = {
  tour_id?: string | number | null;
  start_date?: string | null;
  end_date?: string | null;
  price?: number | null;
  quota?: number | null;
  booked_count?: number | null;
  status?: number | null;
  cover_image_url?: string | null;
  note?: string | null;
  notificationSent?: boolean;
  hasBookings?: boolean;
  tour_schedule_prices?: SchedulePriceItem[] | null;
  tour_itineraries?: Array<Partial<ItineraryFormItem> & { hotel_id?: number | null }> | null;
  tour_schedule_hotels?: ScheduleHotelItem[] | null;
};

export type SchedulePriceItem = {
  passenger_type: "adult" | "child" | "infant";
  price: number;
  currency: string;
  note: string;
};

export type ItineraryFormItem = {
  day_number: number;
  title: string;
  content: string;
  meals: string;
  transport_id: string | number;
  hotel_id: string | number;
  room_type_id: string | number;
};

export type ScheduleFormState = {
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  price: number;
  quota: number;
  status: number;
  cover_image_url: string;
  note: string;
  prices: SchedulePriceItem[];
  itinerary: ItineraryFormItem[];
};

export type ScheduleEditorScheduleDetailResponse = Omit<
  ScheduleDetailResponse,
  'tour_id' | 'booked_count' | 'notificationSent' | 'hasBookings' | 'tour_schedule_hotels'
> & {
  tour_schedule_hotels?: Array<{
    day_from?: number | null;
    day_to?: number | null;
    hotel_id?: number | null;
    room_type_id?: number | null;
    nights?: number | null;
  }> | null;
};

export type ScheduleLike = Pick<AdminSchedule, 'start_date' | 'quota' | 'status'> & {
  _count?: {
    bookings?: number;
  };
};

export type AdminSchedule = {
  tour_schedule_id: number;
  start_date: string;
  end_date: string;
  price: string | number;
  quota: number;
  status: number;
  _count?: {
    bookings: number;
  };
};
