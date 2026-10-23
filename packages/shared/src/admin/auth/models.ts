export type GuardStatus = "loading" | "authorized" | "unauthorized" | "error";
export type GuardCache = {
    status: GuardStatus;
    message: string;
};
