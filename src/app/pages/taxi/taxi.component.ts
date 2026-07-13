import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import type { BookingCartItem, PartnershipApplication, TouristLocation, ViewableItem } from '@/types';
import { AuthService } from '@/services/auth.service';
import { CartService } from '@/services/cart.service';
import { CatalogDataService } from '@/services/catalog-data';
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
  selector: 'app-taxi-page',
  standalone: true,
  imports: [DecimalPipe, FormsModule, RouterLink],
  templateUrl: './taxi.component.html',
  styleUrl: './taxi.component.css',
})
export class TaxiComponent {
  private readonly catalogData = inject(CatalogDataService);
  private readonly fallbackLocation: TouristLocation = { id: '', name: '', lat: 0, lng: 0 };
  readonly locations = this.catalogData.touristLocations;
  readonly today = new Date().toISOString().split('T')[0];
  readonly pickup = signal('dad-airport');
  readonly dropoff = signal('hoian-ancient');
  readonly vehicleType = signal<'vios-4' | 'xpander-7' | 'sirius-moto'>('vios-4');
  readonly bookingDate = signal(new Date().toISOString().split('T')[0]);
  readonly bookingTime = signal('14:00');
  readonly specialNote = signal('');
  readonly contactPhone = signal('');
  private contactPhoneEdited = false;

  readonly pickupLoc = computed(
    () => this.locations().find((l) => l.id === this.pickup()) ?? this.locations()[0] ?? this.fallbackLocation,
  );
  readonly dropoffLoc = computed(
    () => this.locations().find((l) => l.id === this.dropoff()) ?? this.locations()[2] ?? this.fallbackLocation,
  );
  readonly distance = computed(() => {
    const latDiff = this.pickupLoc().lat - this.dropoffLoc().lat;
    const lngDiff = this.pickupLoc().lng - this.dropoffLoc().lng;
    const raw = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111;
    return Math.max(parseFloat(raw.toFixed(1)), 2.5);
  });
  readonly pricePerKm = computed(() => (this.vehicleType() === 'vios-4' ? 12000 : this.vehicleType() === 'xpander-7' ? 16000 : 6000));
  readonly totalCost = computed(() => Math.round(this.distance() * this.pricePerKm()));

  readonly contactPhoneError = signal('');

  constructor(
    readonly i18n: I18nService,
    private readonly auth: AuthService,
    private readonly cart: CartService,
    private readonly ui: UiStateService,
    private readonly router: Router,
  ) {
    // Prefill from the profile phone, but never overwrite what the customer typed for this booking.
    effect(() => {
      const user = this.auth.currentUser();
      if (user && !this.contactPhoneEdited) this.contactPhone.set(user.phone);
    });
  }

  vehClass(v: 'vios-4' | 'xpander-7' | 'sirius-moto'): string {
    return 'space-y-1 rounded-xl border p-2.5 text-center transition ' + (this.vehicleType() === v ? 'bg-natural-accent text-white border-natural-accent' : 'bg-white border-natural-border hover:bg-stone-50');
  }

  onContactPhone(value: string): void {
    this.contactPhoneEdited = true;
    this.contactPhone.set(value);
    this.contactPhoneError.set('');
  }

  book(): void {
    if (this.pickup() === this.dropoff()) return;
    if (this.contactPhone().trim().length < 9) {
      this.contactPhoneError.set(this.i18n.isVi() ? 'Vui lòng nhập số điện thoại liên hệ cho chuyến đi này.' : 'Please enter a contact phone number for this ride.');
      return;
    }
    const veh = this.vehicleType();
    const vehicleName = veh === 'vios-4' ? 'Taxi 4 Chỗ Toyota Vios (VietCharm Transfer)' : veh === 'xpander-7' ? 'Taxi 7 Chỗ Mitsubishi Xpander (VietCharm Transfer)' : 'Xe Ôm Công Nghệ Sirius/Vision (VietCharm Transfer)';
    const item: BookingCartItem = {
      id: `taxi-${Date.now()}`,
      type: 'vehicle',
      name: `${vehicleName} [${this.pickupLoc().name} - ${this.dropoffLoc().name}]`,
      price: this.totalCost(),
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80',
      details: `${this.i18n.isVi() ? 'Ngày đưa đón' : 'Scheduled at'}: ${this.bookingDate()} ${this.bookingTime()}. ${this.i18n.isVi() ? 'Quãng đường:' : 'Dist:'} ${this.distance()}km. ${this.i18n.isVi() ? 'SĐT liên hệ:' : 'Contact phone:'} ${this.contactPhone().trim()}.`,
      serviceDate: this.bookingDate(),
    };
    this.ui.requireAuth(() => {
      this.cart.addItem(item);
      void this.router.navigateByUrl('/checkout');
    }, this.i18n.isVi() ? 'Đăng nhập để đặt và thanh toán.' : 'Sign in to book and pay.');
  }
}
