import { Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { ToastService, ToastType } from '@/services/toast.service';

@Component({
  selector: 'app-toast-outlet',
  standalone: true,
  imports: [NgClass],
  templateUrl: './toast-outlet.component.html',
  styleUrl: './toast-outlet.component.css',
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
