export type AccountResourceEntry = {
    data: unknown;
    loaded: boolean;
    updatedAt: number;
    pending?: Promise<unknown>;
};
export type AccountResourceCache = Map<string, AccountResourceEntry>;
