export interface AdminHotel {
  hotel_id: number;
  location_id: number;
  name: string;
  star_rating: number;
  address: string;
  phone?: string | null;
  email?: string | null;
  description?: string | null;
  status: number;
  created_at?: string;
  updated_at?: string;
  locations?: { location_id: number; name: string } | null;
  hotel_room_types?: AdminHotelRoomType[];
  _count?: {
    hotel_room_types: number;
    tour_schedule_hotels?: number;
  };
}

export interface HotelPayload {
  name: string;
  location_id: number;
  star_rating?: number;
  address: string;
  phone?: string | null;
  email?: string | null;
  description?: string | null;
  status?: number;
  room_types?: Array<{
    name: string;
    base_price: number;
    extra_price?: number;
    breakfast_included?: boolean;
    description?: string;
  }>;
}

export interface AdminHotelRoomType {
  room_type_id: number;
  hotel_id: number;
  name: string;
  base_price: number | string;
  extra_price: number | string;
  breakfast_included: boolean;
  description?: string | null;
  status: number;
  _count?: {
    tour_schedule_hotels?: number;
  };
}

export interface RoomTypePayload {
  hotel_id?: number;
  name: string;
  base_price: number;
  extra_price?: number;
  breakfast_included?: boolean;
  description?: string | null;
  status?: number;
}

export interface AdminTransport {
  transport_id: number;
  transport_type: string;
  name: string;
  capacity: number;
  provider_id: number;
  status: number;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
  providers?: {
    provider_id: number;
    name: string;
    type: string;
  } | null;
  _count?: {
    tour_schedule_transports?: number;
    tours?: number;
  };
}

export interface TransportPayload {
  name: string;
  transport_type: string;
  capacity?: number;
  provider_id: number;
  status?: number;
  description?: string | null;
}

export interface AdminProvider {
  provider_id: number;
  name: string;
  type: string;
  contact_info?: string | null;
  status: number;
  created_at?: string;
  updated_at?: string;
  _count?: {
    transports?: number;
  };
}

export interface ProviderPayload {
  name: string;
  type?: string;
  contact_info?: string | null;
  status?: number;
}

