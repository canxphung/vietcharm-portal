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
  selector: 'app-ai-explorer-page',
  standalone: true,
  imports: [
    FormsModule,
    DecimalPipe,
    LucideArrowRight,
    LucideBaby,
    LucideBrain,
    LucideCamera,
    LucideCheckCircle,
    LucideClock,
    LucideCoffee,
    LucideHeart,
    LucideHelpCircle,
    LucideLeaf,
    LucideSparkles,
    LucideUsersRound,
    LucideWaves,
  ],
  templateUrl: './ai-explorer.component.html',
  styleUrl: './ai-explorer.component.css',
})
export class AiExplorerComponent {
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
  readonly itinerary = signal<AIItinerary | null>(null);
  readonly successMsg = signal(false);

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
      .post<AIResponse>('/api/itinerary', {
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

  applyCombo(): void {
    const p = this.province();
    const vi = this.isVi();
    const hotelName = p === 'quang-nam' ? 'La Siesta Hoi An Resort (AI Combo Deal)' : p === 'da-nang' ? 'Tiamo Sea View Hotel (AI Combo)' : p === 'thua-thien-hue' ? 'Silk Path Grand Hue (AI Approved)' : p === 'binh-dinh' ? 'Anya Premier Hotel Quy Nhơn (AI Combo)' : 'Crown Plaza Nha Trang (AI Combo)';
    const hotelPrice = p === 'quang-nam' ? 1800000 : p === 'da-nang' ? 850000 : p === 'thua-thien-hue' ? 1300000 : p === 'binh-dinh' ? 1200000 : 1500000;
    const vehName = p === 'quang-nam' ? 'Honda Vision 110cc (AI Save Pack)' : p === 'da-nang' ? 'Toyota Vios Private Car (AI Save)' : p === 'thua-thien-hue' ? 'Honda AirBlade 125cc (AI Save)' : p === 'binh-dinh' ? 'Yamaha Exciter 150cc (AI Save)' : 'Mitsubishi Xpander Self-drive (AI Save)';
    const vehPrice = p === 'quang-nam' ? 130000 : p === 'da-nang' ? 800000 : p === 'thua-thien-hue' ? 150000 : p === 'binh-dinh' ? 140000 : 900000;
    const actName = p === 'quang-nam' ? 'Lặn Ngắm San Hô Cù Lao Chàm (AI Deal)' : p === 'da-nang' ? 'Vé Cáp Treo Bà Nà (AI Deal)' : p === 'thua-thien-hue' ? 'Food Tour Xích Lô Huế Về Đêm (AI Deal)' : p === 'binh-dinh' ? 'Tour Cano Kỳ Co Ngắm San Hô (AI Deal)' : 'Tour Cano 3 Đảo VIP Vịnh Nha Trang (AI Deal)';
    const actPrice = p === 'quang-nam' ? 550000 : p === 'da-nang' ? 850000 : p === 'thua-thien-hue' ? 450000 : p === 'binh-dinh' ? 690000 : 750000;
    const items: BookingCartItem[] = [
      { id: `ai-hotel-${p}`, type: 'hotel', name: hotelName, price: hotelPrice, quantity: 1, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80', details: vi ? 'Ưu đãi đặt trực tiếp theo đề xuất AI' : 'AI-optimized lodging plan' },
      { id: `ai-vehicle-${p}`, type: 'vehicle', name: vehName, price: vehPrice, quantity: 1, image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=400&q=80', details: vi ? 'Phương tiện di chuyển phù hợp nhất' : 'Best custom vehicle recommendation' },
      { id: `ai-activity-${p}`, type: 'activity', name: actName, price: actPrice, quantity: 2, image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80', details: vi ? 'Tham quan theo lộ trình tối ưu' : 'Highly structured tour access' },
    ];
    this.cart.addCombo(items);
    this.successMsg.set(true);
    setTimeout(() => this.successMsg.set(false), 4000);
  }
}
