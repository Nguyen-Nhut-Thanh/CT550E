"use client";

import type { Toast, ToastListener, ToastType } from "shared";

let toastStore: Toast[] = [];
const toastListeners = new Set<ToastListener>();
let nextToastId = 0;

function emitToastStore() {
  toastListeners.forEach((listener) => listener(toastStore));
}

export function subscribeToasts(listener: ToastListener) {
  toastListeners.add(listener);
  listener(toastStore);

  return () => {
    toastListeners.delete(listener);
  };
}

export function removeToast(id: string) {
  toastStore = toastStore.filter((toast) => toast.id !== id);
  emitToastStore();
}

export function pushToast(message: string, type: ToastType) {
  nextToastId += 1;
  const id = `toast_${nextToastId}`;

  toastStore = [...toastStore, { id, message, type }];
  emitToastStore();

  window.setTimeout(() => {
    removeToast(id);
  }, 5000);
}

