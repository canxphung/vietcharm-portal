import { Component, computed, input, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import type { BookingCartItem, PartnershipApplication, ViewableItem } from '@/types';
import { CartService } from '@/services/cart.service';
import { CatalogService } from '@/services/catalog.service';
import { I18nService } from '@/services/i18n.service';
import { ToastService } from '@/services/toast.service';
import { UiStateService } from '@/services/ui-state.service';
import { VndPipe } from '@/pipes/vnd.pipe';

interface AIActivity {
  time: string;
  attractionName: string;
  description: string;
  costVND: number;
}

interface AIDay {
  dayNumber: number;
  title: string;
  activities: AIActivity[];
}

interface AIItinerary {
  itineraryTitle: string;
  estimatedSavingsPercent: number;
  totalCostEstimate: number;
  days: AIDay[];
  savingTips: string[];
}

interface AIResponse {
  success: boolean;
  source?: string;
  data?: AIItinerary;
  fallback?: AIItinerary;
}

@Component({
  selector: 'app-partnership-page',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './partnership.component.html',
  styleUrl: './partnership.component.css',
})
export class PartnershipComponent {
  readonly brandName = signal('');
  readonly contactName = signal('');
  readonly type = signal<PartnershipApplication['type']>('hotel');
  readonly phone = signal('');
  readonly email = signal('');
  readonly description = signal('');
  readonly submittedCode = signal<string | null>(null);

  constructor(
    readonly i18n: I18nService,
    private readonly catalog: CatalogService,
  ) {}

  async submit(): Promise<void> {
    if (!this.brandName().trim() || !this.contactName().trim()) return;
    const trackingId = `VC-PARTNER-${1000 + Math.floor(Math.random() * 8999)}`;
    await this.catalog.addApplication({
      id: trackingId,
      brandName: this.brandName().trim(),
      contactName: this.contactName().trim(),
      type: this.type(),
      phone: this.phone().trim(),
      email: this.email().trim(),
      description: this.description().trim(),
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
    });
    this.submittedCode.set(trackingId);
    this.brandName.set('');
    this.contactName.set('');
    this.phone.set('');
    this.email.set('');
    this.description.set('');
  }
}
