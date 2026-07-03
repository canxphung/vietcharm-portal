import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'info' | 'error';

export interface ToastInput {
  title: string;
  message?: string;
  type?: ToastType;
  durationMs?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ToastItem extends ToastInput {
  id: string;
  type: ToastType;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<ToastItem[]>([]);

  showToast(toast: ToastInput): void {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const next: ToastItem = {
      id,
      type: toast.type ?? 'info',
      title: toast.title,
      message: toast.message,
      durationMs: toast.durationMs,
      action: toast.action,
    };

    this.toasts.update((items) => [next, ...items].slice(0, 4));
    const copyLength = `${toast.title} ${toast.message ?? ''}`.trim().length;
    const durationMs = toast.durationMs ?? Math.min(9000, Math.max(5000, 2800 + copyLength * 45));
    window.setTimeout(() => this.dismiss(id), durationMs);
  }

  dismiss(id: string): void {
    this.toasts.update((items) => items.filter((toast) => toast.id !== id));
  }
}
