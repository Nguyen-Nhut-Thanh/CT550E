export type PublicFetchOptions = RequestInit;

export type ListResponse<T> = {
  items?: T[];
};

export type AuthJsonRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  requireAuth?: boolean;
  fallbackMessage: string;
};

