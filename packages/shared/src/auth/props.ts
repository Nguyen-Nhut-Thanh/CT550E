export type GoogleCredentialResponse = {
    credential?: string;
};
export type GoogleAuthSectionProps = {
    enabled: boolean;
    onSuccess: (response: GoogleCredentialResponse) => void;
    onError: () => void;
};
