export type ListResponse<T> = {
    items?: T[];
};
export type AuthJsonRequestOptions = Omit<RequestInit, "body"> & {
    body?: unknown;
    requireAuth?: boolean;
    fallbackMessage: string;
};
export type TimestampedListResponse<T> = {
    items: T[];
    total: number;
    fetched_at: string;
};
