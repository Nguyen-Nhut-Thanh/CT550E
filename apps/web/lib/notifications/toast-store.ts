"use client";

import type { Toast, ToastListener, ToastType } from "shared";

let toastStore: Toast[] = [];
const toastListeners = new Set<ToastListener>();
const toastTimers = new Map<string, number>();
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
  const timer = toastTimers.get(id);
  if (timer) {
    if (typeof window !== "undefined") {
      window.clearTimeout(timer);
    }
    toastTimers.delete(id);
  }
  toastStore = toastStore.filter((toast) => toast.id !== id);
  emitToastStore();
}

export function pushToast(message: string, type: ToastType) {
  nextToastId += 1;
  const id = `toast_${nextToastId}`;

  toastStore = [...toastStore, { id, message, type }];
  emitToastStore();

  if (typeof window !== "undefined") {
    const timer = window.setTimeout(() => {
      removeToast(id);
    }, 5000);
    toastTimers.set(id, timer);
  }
}

