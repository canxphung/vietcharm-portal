import { Component, computed, input, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  LucideAlertCircle,
  LucideArrowRight,
  LucideBaby,
  LucideBrain,
  LucideCamera,
  LucideCar,
  LucideCheckCircle,
  LucideChevronRight,
  LucideClipboardList,
  LucideClock,
  LucideCoffee,
  LucideCompass,
  LucideFlame,
  LucideGift,
  LucideHeart,
  LucideHelpCircle,
  LucideInfo,
  LucideLeaf,
  LucidePlane,
  LucidePlus,
  LucideShare2,
  LucideShieldCheck,
  LucideShirt,
  LucideSparkles,
  LucideStar,
  LucideTrash2,
  LucideUsers,
  LucideUsersRound,
  LucideWaves,
} from '@lucide/angular';
import { provinces } from '@/data';
import { PREDEFINED_COMBOS } from '@/constants/seed/tourCombos';
import { TOURIST_LOCATIONS } from '@/constants/seed/touristLocations';
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
  selector: 'app-taxi-page',
  standalone: true,
  imports: [DecimalPipe, FormsModule, RouterLink, LucideCar, LucideInfo],
  templateUrl: './taxi.component.html',
  styleUrl: './taxi.component.css',
})
export class TaxiComponent {
  readonly locations = TOURIST_LOCATIONS;
  readonly today = new Date().toISOString().split('T')[0];
  readonly pickup = signal(TOURIST_LOCATIONS[0].id);
  readonly dropoff = signal(TOURIST_LOCATIONS[2].id);
  readonly vehicleType = signal<'vios-4' | 'xpander-7' | 'sirius-moto'>('vios-4');
  readonly bookingDate = signal(new Date().toISOString().split('T')[0]);
  readonly bookingTime = signal('14:00');
  readonly specialNote = signal('');

  readonly pickupLoc = computed(() => this.locations.find((l) => l.id === this.pickup()) ?? this.locations[0]);
  readonly dropoffLoc = computed(() => this.locations.find((l) => l.id === this.dropoff()) ?? this.locations[2]);
  readonly distance = computed(() => {
    const latDiff = this.pickupLoc().lat - this.dropoffLoc().lat;
    const lngDiff = this.pickupLoc().lng - this.dropoffLoc().lng;
    const raw = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111;
    return Math.max(parseFloat(raw.toFixed(1)), 2.5);
  });
  readonly pricePerKm = computed(() => (this.vehicleType() === 'vios-4' ? 12000 : this.vehicleType() === 'xpander-7' ? 16000 : 6000));
  readonly totalCost = computed(() => Math.round(this.distance() * this.pricePerKm()));

  constructor(
    readonly i18n: I18nService,
    private readonly cart: CartService,
    private readonly ui: UiStateService,
    private readonly router: Router,
  ) {}

  vehClass(v: 'vios-4' | 'xpander-7' | 'sirius-moto'): string {
    return 'space-y-1 rounded-xl border p-2.5 text-center transition ' + (this.vehicleType() === v ? 'bg-natural-accent text-white border-natural-accent' : 'bg-white border-natural-border hover:bg-stone-50');
  }

  book(): void {
    if (this.pickup() === this.dropoff()) return;
    const veh = this.vehicleType();
    const vehicleName = veh === 'vios-4' ? 'Taxi 4 Chỗ Toyota Vios (VietCharm Transfer)' : veh === 'xpander-7' ? 'Taxi 7 Chỗ Mitsubishi Xpander (VietCharm Transfer)' : 'Xe Ôm Công Nghệ Sirius/Vision (VietCharm Transfer)';
    const item: BookingCartItem = {
      id: `taxi-${Date.now()}`,
      type: 'vehicle',
      name: `${vehicleName} [${this.pickupLoc().name} ➔ ${this.dropoffLoc().name}]`,
      price: this.totalCost(),
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80',
      details: `${this.i18n.isVi() ? 'Ngày đưa đón' : 'Scheduled at'}: ${this.bookingDate()} ${this.bookingTime()}. ${this.i18n.isVi() ? 'Quãng đường:' : 'Dist:'} ${this.distance()}km.`,
    };
    this.ui.requireAuth(() => {
      this.cart.addItem(item);
      void this.router.navigateByUrl('/checkout');
    }, this.i18n.isVi() ? 'Đăng nhập để đặt và thanh toán.' : 'Sign in to book and pay.');
  }
}
