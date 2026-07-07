import { Component, computed, input, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
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
  selector: 'app-tours-page',
  standalone: true,
  imports: [DecimalPipe, LucideHeart, LucideStar],
  templateUrl: './tours.component.html',
  styleUrl: './tours.component.css',
})
export class ToursComponent {
  readonly combos = PREDEFINED_COMBOS;

  constructor(
    readonly i18n: I18nService,
    readonly ui: UiStateService,
  ) {}

  asItem(combo: (typeof PREDEFINED_COMBOS)[number]): ViewableItem {
    return {
      id: combo.id,
      type: 'activity',
      name: `[Tour Combo] ${combo.name}`,
      image: combo.image,
      price: combo.price,
      description: combo.includes.join('. '),
    };
  }

  view(combo: (typeof PREDEFINED_COMBOS)[number]): void {
    this.ui.viewItem(this.asItem(combo));
  }
}
