import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { HttpClient, httpResource } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import type { Activity, Hotel } from '@/types';
import { buildComboItems } from '@/utils/combo-builder';
import { CartService } from '@/services/cart.service';
import { CatalogDataService } from '@/services/catalog-data';
import { I18nService } from '@/services/i18n.service';

interface TripActivity {
  time: string;
  attractionName: string;
  description: string;
  costVND: number;
}

interface TripDay {
  dayNumber: number;
  title: string;
  activities: TripActivity[];
}

interface TripPlan {
  itineraryTitle: string;
  estimatedSavingsPercent: number;
  totalCostEstimate: number;
  days: TripDay[];
  savingTips: string[];
}

interface TripPlanResponse {
  success: boolean;
  source?: string;
  data?: TripPlan;
  fallback?: TripPlan;
}

@Component({
  selector: 'app-trip-planner-page',
  standalone: true,
  imports: [
    FormsModule,
    DecimalPipe,
  ],
  templateUrl: './trip-planner.component.html',
  styleUrl: './trip-planner.component.css',
})
export class TripPlannerComponent {
  readonly isVi = computed(() => this.i18n.isVi());
  readonly budget = signal(3500000);
  readonly province = signal('quang-nam');
  readonly travelers = signal<'couple' | 'family' | 'friends'>('couple');
  readonly daysCount = signal(3);
  readonly travelMood = signal<'heritage' | 'beach' | 'food' | 'slow'>('heritage');
  readonly pace = signal<'easy' | 'balanced' | 'packed'>('balanced');
  readonly customPrompt = signal('');
  readonly loading = signal(false);
  readonly loadingStep = signal('');
  readonly itinerary = signal<TripPlan | null>(null);
  readonly successMsg = signal(false);

  // Real catalog data for the suggested combo — refetches when the selected province changes.
  private readonly catalogData = inject(CatalogDataService);
  private readonly comboHotelsRes = httpResource<Hotel[]>(() => `/api/hotels?provinceId=${this.province()}`, { defaultValue: [] });
  private readonly comboActivitiesRes = httpResource<Activity[]>(() => `/api/activities?provinceId=${this.province()}`, { defaultValue: [] });

  private loadingTimer?: ReturnType<typeof setInterval>;

  constructor(
    private readonly http: HttpClient,
    private readonly cart: CartService,
    readonly i18n: I18nService,
  ) {}

  max(a: number, b: number): number {
    return Math.max(a, b);
  }

  min(a: number, b: number): number {
    return Math.min(a, b);
  }

  chipClass(active: boolean): string {
    return 'rounded-xl border px-2 py-2.5 text-[10px] font-black transition ' + (active ? 'border-natural-accent bg-natural-accent text-white' : 'border-natural-border bg-white text-natural-text hover:bg-natural-beige');
  }

  moodClass(active: boolean): string {
    return 'flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-[10px] font-black transition ' + (active ? 'border-natural-accent bg-natural-accent text-white' : 'border-natural-border bg-white text-natural-text hover:bg-natural-beige');
  }

  paceClass(active: boolean): string {
    return 'rounded-xl border px-2 py-2 text-[10px] font-black transition ' + (active ? 'border-natural-accent bg-natural-accent text-white' : 'border-natural-border bg-white text-natural-text hover:bg-natural-beige');
  }

  presets(): string[] {
    return this.isVi()
      ? [
          'Tôi đi phượt cặp đôi 3N2Đ, thích chụp ảnh hoài cổ ở Hội An, muốn thuê xe máy.',
          'Du lịch gia đình nghỉ dưỡng 4 người, thích yên bình, an toàn, có trẻ nhỏ.',
          'Tìm combo giá rẻ nhất ăn uống thả ga đậm vị ẩm thực Quảng Nam Đà Nẵng dưới 2Tr.',
        ]
      : [
          'Couple backpacking for 3D2N, focus on ancient towns photo spots & motorbike rentals.',
          'Family wellness package for 4 with calm lodging and private car driver.',
          'Cheapest local food combo covering Hoi An - Danang within $100 budget limit.',
        ];
  }

  run(): void {
    this.loading.set(true);
    this.successMsg.set(false);
    const vi = this.isVi();

    const stages = vi
      ? ['Đang đọc gu chuyến đi của bạn...', 'Ghép khách sạn, xe và hoạt động theo ngân sách...', 'Sắp xếp tuyến đi để ít vòng lại nhất...', 'Tính các combo có thể tiết kiệm hơn...', 'Hoàn thiện timeline từng ngày...']
      : ['Reading your travel style...', 'Matching stays, rides, and experiences to budget...', 'Arranging the route to avoid backtracking...', 'Checking bundle savings...', 'Composing the day-by-day timeline...'];
    let stage = 0;
    this.loadingStep.set(stages[0]);
    this.loadingTimer = setInterval(() => {
      stage++;
      if (stage < stages.length) this.loadingStep.set(stages[stage]);
    }, 900);

    this.http
      .post<TripPlanResponse>('/api/itinerary', {
        province: this.province(),
        budget: this.budget(),
        days: this.daysCount(),
        travelers: this.travelers(),
        mood: this.travelMood(),
        pace: this.pace(),
        keywords: this.customPrompt().trim(),
        language: this.i18n.language(),
      })
      .subscribe({
        next: (res) => this.itinerary.set(res.data ?? res.fallback ?? null),
        error: () => this.finishLoading(),
        complete: () => this.finishLoading(),
      });
  }

  private finishLoading(): void {
    if (this.loadingTimer) clearInterval(this.loadingTimer);
    this.loading.set(false);
  }

  /** Suggested combo built from REAL top-rated services in Mongo for the selected province. */
  applyCombo(): void {
    const items = buildComboItems(
      this.comboHotelsRes.value(),
      this.catalogData.vehicles(),
      this.comboActivitiesRes.value(),
      this.isVi(),
    );
    if (!items) return; // catalog still loading — the button can simply be pressed again
    this.cart.addCombo(items);
    this.successMsg.set(true);
    setTimeout(() => this.successMsg.set(false), 4000);
  }
}
