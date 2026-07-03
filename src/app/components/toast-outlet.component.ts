import { Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { LucideCheckCircle2, LucideInfo, LucideX, LucideXCircle } from '@lucide/angular';
import { ToastService, ToastType } from '@/services/toast.service';

@Component({
  selector: 'app-toast-outlet',
  standalone: true,
  imports: [NgClass, LucideCheckCircle2, LucideInfo, LucideX, LucideXCircle],
  template: `
    <div class="fixed bottom-6 right-4 z-[80] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3 md:right-6">
      @for (toast of toastService.toasts(); track toast.id) {
        <div role="status" class="flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-xl backdrop-blur" [ngClass]="toastClass(toast.type)">
          @if (toast.type === 'success') {
            <svg lucideCheckCircle2 class="mt-0.5 h-5 w-5 shrink-0"></svg>
          } @else if (toast.type === 'error') {
            <svg lucideXCircle class="mt-0.5 h-5 w-5 shrink-0"></svg>
          } @else {
            <svg lucideInfo class="mt-0.5 h-5 w-5 shrink-0"></svg>
          }
          <div class="min-w-0 flex-1">
            <p class="text-sm font-black leading-snug">{{ toast.title }}</p>
            @if (toast.message) {
              <p class="mt-1 text-xs font-medium leading-relaxed text-current/75">{{ toast.message }}</p>
            }
            @if (toast.action) {
              <button
                type="button"
                class="mt-3 inline-flex min-h-8 items-center rounded-lg border border-current/20 px-3 text-xs font-black uppercase tracking-wide transition hover:bg-current/10"
                (click)="toast.action.onClick(); toastService.dismiss(toast.id)"
              >
                {{ toast.action.label }}
              </button>
            }
          </div>
          <button type="button" class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-current/65 transition hover:bg-black/5" (click)="toastService.dismiss(toast.id)">
            <svg lucideX class="h-4 w-4"></svg>
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastOutletComponent {
  constructor(readonly toastService: ToastService) {}

  toastClass(type: ToastType): string {
    const classes: Record<ToastType, string> = {
      success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
      info: 'border-natural-border bg-white text-natural-text',
      error: 'border-red-200 bg-red-50 text-red-900',
    };
    return classes[type];
  }
}
