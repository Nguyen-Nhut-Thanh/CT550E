declare global {
    interface Window {
        google?: any;
        __journiTripGoogleMapsPromise?: Promise<void>;
    }
}
export {};
