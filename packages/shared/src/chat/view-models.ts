import type { RealtimeMessage } from "./models";
export type PendingImage = {
    file: File;
    previewUrl: string;
};
export type ChatDisplayMessage = RealtimeMessage & {
    delivery_status?: 'sending' | 'failed';
};
