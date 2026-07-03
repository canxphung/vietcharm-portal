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
import { VndPipe } from '@/components/vnd.pipe';

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
  template: `
    <div class="w-full border-y border-natural-border bg-[#1F261F] px-4 py-16 text-natural-text shadow-inner">
      <div class="mx-auto max-w-7xl">
        <div class="mb-8 max-w-3xl text-white">
          <span class="text-[11px] font-black uppercase tracking-[0.24em] text-natural-gold">AI Trip Studio</span>
          <h2 class="mt-2 font-serif text-3xl font-black tracking-tight md:text-5xl">{{ isVi() ? 'Trả lời vài câu, nhận lịch trình có thể đặt ngay.' : 'Answer a few prompts, get a bookable trip plan.' }}</h2>
          <p class="mt-3 text-sm leading-relaxed text-white/70">{{ isVi() ? 'Studio này ghép ngày đi, gu du lịch, ngân sách và dịch vụ có sẵn thành một timeline dễ hiểu.' : 'This studio turns dates, mood, budget, and available services into a clear day-by-day timeline.' }}</p>
        </div>

        <div class="flex flex-col items-stretch gap-10 lg:flex-row">
          <!-- Inputs -->
          <div class="flex w-full flex-col justify-between rounded-3xl border border-natural-border bg-natural-bg p-6 shadow-xl lg:w-5/12 lg:p-8">
            <div>
              <div class="mb-4 flex items-center gap-2">
                <div class="rounded-lg bg-natural-accent p-2 text-white shadow-md"><svg lucideBrain class="h-6 w-6"></svg></div>
                <div>
                  <h3 class="flex items-center gap-1.5 font-serif text-xl font-bold tracking-tight text-natural-text">{{ isVi() ? 'Bảng gu chuyến đi' : 'Trip brief' }}<span class="rounded bg-natural-gold px-1.5 py-0.5 font-sans text-[10px] font-bold uppercase tracking-widest text-white">Lite</span></h3>
                  <p class="text-[11px] font-medium text-natural-text/70">{{ isVi() ? 'Chọn vài thông tin chính, phần còn lại để VietCharm gợi ý.' : 'Pick the key details and let VietCharm shape the rest.' }}</p>
                </div>
              </div>

              <div class="mb-5 rounded-xl border border-natural-border bg-natural-beige-light p-4">
                <div class="mb-1 flex items-center justify-between text-xs font-bold text-natural-text/80"><span>{{ isVi() ? 'Ngân sách thiết kế' : 'Target Outlay' }}</span><span class="font-mono text-sm font-bold text-natural-accent">{{ budget() | number : '1.0-0' }} VND</span></div>
                <input type="range" min="1500000" max="12000000" step="500000" [ngModel]="budget()" (ngModelChange)="budget.set(+$event)" name="budget" class="h-1.5 w-full cursor-pointer rounded-lg bg-natural-border accent-natural-accent" />
                <div class="mt-1 flex justify-between text-[10px] font-semibold uppercase text-natural-text/50"><span>1.5TR</span><span>6TR</span><span>12TR</span></div>
              </div>

              <div class="mb-5">
                <label class="mb-1 block text-xs font-bold text-natural-text">{{ isVi() ? 'Tỉnh thành điểm đến' : 'Target Province Focus' }}</label>
                <select class="w-full rounded-xl border border-natural-border bg-natural-bg p-3 text-xs font-bold text-natural-text outline-none focus:border-natural-accent" [ngModel]="province()" (ngModelChange)="province.set($event)" name="province">
                  <option value="quang-nam">{{ isVi() ? 'Quảng Nam - Hội An' : 'Quang Nam - Hoi An' }}</option>
                  <option value="da-nang">{{ isVi() ? 'Đà Nẵng (Bao gồm Bà Nà)' : 'Da Nang (Incl. Bana Hills)' }}</option>
                  <option value="thua-thien-hue">{{ isVi() ? 'Thừa Thiên Huế (Cố Đô)' : 'Thua Thien Hue (Cradle Palace)' }}</option>
                  <option value="binh-dinh">{{ isVi() ? 'Bình Định (Quy Nhơn)' : 'Binh Dinh (Quy Nhon)' }}</option>
                  <option value="khanh-hoa">{{ isVi() ? 'Khánh Hòa (Nha Trang)' : 'Khanh Hoa (Nha Trang)' }}</option>
                </select>
              </div>

              <div class="mb-5 space-y-4 rounded-2xl border border-natural-border bg-natural-cream p-4">
                <div class="flex items-center justify-between gap-3">
                  <span class="text-xs font-black uppercase tracking-wider text-natural-text">{{ isVi() ? 'Số ngày đi' : 'Trip length' }}</span>
                  <div class="flex items-center gap-2 rounded-xl border border-natural-border bg-white p-1">
                    <button type="button" class="h-8 w-8 rounded-lg text-sm font-black text-stone-500 transition hover:bg-natural-beige" (click)="daysCount.set(max(2, daysCount() - 1))">-</button>
                    <span class="w-14 text-center font-mono text-sm font-black text-natural-accent">{{ daysCount() }} {{ isVi() ? 'ngày' : 'days' }}</span>
                    <button type="button" class="h-8 w-8 rounded-lg text-sm font-black text-stone-500 transition hover:bg-natural-beige" (click)="daysCount.set(min(7, daysCount() + 1))">+</button>
                  </div>
                </div>
                <div class="space-y-2">
                  <span class="text-[10px] font-black uppercase tracking-wider text-stone-500">{{ isVi() ? 'Bạn đi với ai?' : 'Who is going?' }}</span>
                  <div class="grid grid-cols-3 gap-2">
                    <button type="button" [class]="chipClass(travelers() === 'couple')" (click)="travelers.set('couple')"><svg lucideHeart class="mx-auto mb-1 h-4 w-4"></svg>{{ isVi() ? 'Cặp đôi' : 'Couple' }}</button>
                    <button type="button" [class]="chipClass(travelers() === 'family')" (click)="travelers.set('family')"><svg lucideBaby class="mx-auto mb-1 h-4 w-4"></svg>{{ isVi() ? 'Gia đình' : 'Family' }}</button>
                    <button type="button" [class]="chipClass(travelers() === 'friends')" (click)="travelers.set('friends')"><svg lucideUsersRound class="mx-auto mb-1 h-4 w-4"></svg>{{ isVi() ? 'Nhóm bạn' : 'Friends' }}</button>
                  </div>
                </div>
                <div class="space-y-2">
                  <span class="text-[10px] font-black uppercase tracking-wider text-stone-500">{{ isVi() ? 'Gu chuyến đi' : 'Travel mood' }}</span>
                  <div class="grid grid-cols-2 gap-2">
                    <button type="button" [class]="moodClass(travelMood() === 'heritage')" (click)="travelMood.set('heritage')"><svg lucideCamera class="h-4 w-4 shrink-0"></svg>{{ isVi() ? 'Di sản & chụp ảnh' : 'Heritage & photos' }}</button>
                    <button type="button" [class]="moodClass(travelMood() === 'beach')" (click)="travelMood.set('beach')"><svg lucideWaves class="h-4 w-4 shrink-0"></svg>{{ isVi() ? 'Biển & nghỉ dưỡng' : 'Beach & stay' }}</button>
                    <button type="button" [class]="moodClass(travelMood() === 'food')" (click)="travelMood.set('food')"><svg lucideCoffee class="h-4 w-4 shrink-0"></svg>{{ isVi() ? 'Ẩm thực địa phương' : 'Local food' }}</button>
                    <button type="button" [class]="moodClass(travelMood() === 'slow')" (click)="travelMood.set('slow')"><svg lucideLeaf class="h-4 w-4 shrink-0"></svg>{{ isVi() ? 'Chậm, ít di chuyển' : 'Slow travel' }}</button>
                  </div>
                </div>
                <div class="space-y-2">
                  <span class="text-[10px] font-black uppercase tracking-wider text-stone-500">{{ isVi() ? 'Nhịp chuyến đi' : 'Pace' }}</span>
                  <div class="grid grid-cols-3 gap-2">
                    <button type="button" [class]="paceClass(pace() === 'easy')" (click)="pace.set('easy')">{{ isVi() ? 'Rảnh rang' : 'Easy' }}</button>
                    <button type="button" [class]="paceClass(pace() === 'balanced')" (click)="pace.set('balanced')">{{ isVi() ? 'Vừa đủ' : 'Balanced' }}</button>
                    <button type="button" [class]="paceClass(pace() === 'packed')" (click)="pace.set('packed')">{{ isVi() ? 'Đi nhiều' : 'Packed' }}</button>
                  </div>
                </div>
              </div>

              <div class="mb-5">
                <label class="mb-1 block text-xs font-bold text-natural-text">{{ isVi() ? 'Ghi chú thêm' : 'Extra notes' }}</label>
                <textarea rows="3" class="w-full rounded-xl border border-natural-border bg-natural-bg p-3 text-xs text-natural-text outline-none focus:border-natural-accent" [ngModel]="customPrompt()" (ngModelChange)="customPrompt.set($event)" name="notes" [placeholder]="isVi() ? 'Ví dụ: Tôi đi du lịch với gia đình lớn, muốn đi nhẹ nhàng, không say sóng cano...' : 'Example: Traveling with kids, seeking private drivers, food adventures...'"></textarea>
              </div>

              <div class="mb-6">
                <p class="mb-2 text-[10px] font-bold uppercase text-natural-accent">{{ isVi() ? 'Gợi ý nhanh cho bạn' : 'Quick Prompt Presets' }}</p>
                <div class="flex flex-col gap-2">
                  @for (s of presets(); track s) {
                    <button type="button" class="line-clamp-1 rounded-xl border border-natural-border bg-natural-beige-light px-3 py-2.5 text-left text-[11px] text-natural-text transition hover:bg-natural-beige hover:text-natural-accent" (click)="customPrompt.set(s)"><span class="mr-1 text-natural-gold">•</span>{{ s }}</button>
                  }
                </div>
              </div>
            </div>

            <button type="button" class="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-natural-gold py-3.5 font-serif text-xs font-black tracking-wide text-natural-ink shadow-lg transition hover:bg-natural-gold-dark md:text-sm" [disabled]="loading()" (click)="run()"><svg lucideSparkles class="h-4 w-4"></svg><span>{{ isVi() ? 'TẠO LỊCH TRÌNH CỦA TÔI' : 'CREATE MY TRIP PLAN' }}</span></button>
          </div>

          <!-- Output -->
          <div class="relative flex min-h-[460px] w-full flex-col justify-between rounded-3xl border border-natural-border bg-natural-bg p-6 text-natural-text shadow-xl lg:w-7/12 lg:p-8">
            @if (loading()) {
              <div class="absolute inset-0 z-30 flex flex-col items-center justify-center rounded-3xl bg-natural-beige/95 p-6 text-center backdrop-blur-xs">
                <div class="relative"><div class="h-16 w-16 animate-spin rounded-full border-4 border-natural-accent border-t-transparent"></div><svg lucideBrain class="absolute inset-0 m-auto h-6 w-6 animate-pulse text-natural-accent"></svg></div>
                <h4 class="mt-6 animate-pulse font-serif text-base font-bold text-natural-text">{{ isVi() ? 'Đang dựng lịch trình...' : 'Building your route...' }}</h4>
                <p class="mt-3 max-w-sm whitespace-pre-wrap px-4 font-mono text-xs leading-relaxed text-natural-text/80">{{ loadingStep() }}</p>
              </div>
            }

            @if (itinerary(); as plan) {
              <div class="flex h-full flex-col justify-between">
                <div>
                  <div class="mb-4 flex flex-wrap items-start justify-between gap-2 border-b border-natural-border pb-4">
                    <div>
                      <span class="rounded-full border border-natural-accent/20 bg-natural-beige px-2.5 py-1 font-sans text-[9px] font-bold uppercase tracking-widest text-natural-accent">{{ isVi() ? 'Lịch trình thiết kế riêng' : 'Custom Tailored Itinerary' }}</span>
                      <h4 class="mt-2 font-serif text-xl font-bold tracking-tight text-natural-text">{{ plan.itineraryTitle }}</h4>
                    </div>
                    <div class="shrink-0 rounded-2xl border border-emerald-500/20 bg-emerald-700/5 px-3 py-1.5 text-center"><p class="font-mono text-[9px] font-bold uppercase tracking-widest text-emerald-700">{{ isVi() ? 'TIẾT KIỆM COMBO' : 'COMBO SAVINGS' }}</p><h5 class="font-mono text-lg font-black text-emerald-700">{{ plan.estimatedSavingsPercent }}%</h5></div>
                  </div>
                  <div class="max-h-[300px] space-y-4 overflow-y-auto pr-2">
                    @for (day of plan.days; track day.dayNumber) {
                      <div class="rounded-2xl border border-natural-border bg-natural-beige-light p-4">
                        <h5 class="mb-3 flex items-center gap-1.5 border-b border-natural-border pb-2 font-serif text-xs font-bold uppercase tracking-wider text-natural-accent"><svg lucideClock class="h-3.5 w-3.5 text-natural-accent"></svg><span>{{ isVi() ? 'Ngày ' + day.dayNumber + ': ' : 'Day ' + day.dayNumber + ': ' }}{{ day.title }}</span></h5>
                        <div class="space-y-3">
                          @for (act of day.activities; track act.time + act.attractionName) {
                            <div class="flex gap-3 text-xs">
                              <span class="h-fit shrink-0 rounded border border-natural-border bg-natural-beige px-2 py-0.5 font-mono font-bold text-natural-accent">{{ act.time }}</span>
                              <div>
                                <h6 class="font-serif text-xs font-bold text-natural-text">{{ act.attractionName }}</h6>
                                <p class="mt-0.5 text-[11px] leading-relaxed text-natural-text/80">{{ act.description }}</p>
                                <p class="mt-1 font-mono text-[10px] font-bold text-natural-accent">{{ act.costVND > 0 ? (act.costVND | number : '1.0-0') + ' VND' : (isVi() ? 'Miễn phí vé vào' : 'Free admission') }}</p>
                              </div>
                            </div>
                          }
                        </div>
                      </div>
                    }
                  </div>
                  @if (plan.savingTips.length) {
                    <div class="mt-4 rounded-2xl border border-natural-border bg-natural-beige-light p-4">
                      <h5 class="mb-2 flex items-center gap-1.5 font-serif text-[10px] font-bold uppercase tracking-wider text-natural-accent"><svg lucideHelpCircle class="h-3.5 w-3.5"></svg>{{ isVi() ? 'Khuyến nghị mộc mạc từ AI' : 'Expert Local Insights' }}</h5>
                      <ul class="list-disc space-y-1.5 pl-4 text-[11px] leading-relaxed text-natural-text/85">
                        @for (tip of plan.savingTips; track tip) { <li>{{ tip }}</li> }
                      </ul>
                    </div>
                  }
                </div>
                <div class="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-natural-border pt-4">
                  <div><p class="text-[10px] font-bold uppercase text-natural-text/60">{{ isVi() ? 'ƯỚC TÍNH TRỌN GÓI COMBO' : 'OPTIMIZED BUNDLE PRICE' }}</p><p class="font-mono text-xl font-bold text-natural-accent">{{ plan.totalCostEstimate | number : '1.0-0' }} VND</p></div>
                  <div class="flex items-center gap-2">
                    @if (successMsg()) { <span class="flex items-center gap-1 text-xs font-bold text-emerald-600"><svg lucideCheckCircle class="h-4 w-4 text-emerald-600"></svg>{{ isVi() ? 'Đã áp dụng combo!' : 'Combo injected!' }}</span> }
                    <button type="button" class="flex items-center gap-1.5 rounded-xl border border-emerald-700 bg-emerald-600 px-5 py-3 text-xs font-bold uppercase text-white shadow-md transition hover:bg-emerald-700" (click)="applyCombo()"><span>{{ isVi() ? 'ÁP DỤNG ĐẶT TRỌN BỘ COMBO' : 'BOOK ALL-IN-ONE COMBO' }}</span><svg lucideArrowRight class="h-4 w-4"></svg></button>
                  </div>
                </div>
              </div>
            } @else {
              <div class="mx-auto flex h-full max-w-sm flex-col items-center justify-center text-center">
                <svg lucideBrain class="mb-4 h-12 w-12 animate-pulse text-natural-accent/40"></svg>
                <h4 class="font-serif text-base font-bold text-natural-text">{{ isVi() ? 'Trả lời bảng gu để nhận lịch trình mẫu' : 'Start with the trip brief' }}</h4>
                <p class="mt-2 text-xs leading-relaxed text-natural-text/70">{{ isVi() ? 'Chọn ngân sách, số ngày, người đi và gu trải nghiệm. VietCharm sẽ gợi ý timeline theo ngày cùng combo có thể đặt ngay.' : 'Choose budget, days, travelers, and mood. VietCharm will suggest a day-by-day route with a bookable bundle.' }}</p>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AiExplorerPageComponent {
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

  private travelerLabel(): string {
    const vi = this.isVi();
    return this.travelers() === 'couple' ? (vi ? 'Cặp đôi' : 'Couple') : this.travelers() === 'family' ? (vi ? 'Gia đình' : 'Family') : vi ? 'Nhóm bạn' : 'Friends';
  }

  private moodLabel(): string {
    const vi = this.isVi();
    const m = this.travelMood();
    if (m === 'heritage') return vi ? 'Di sản & chụp ảnh' : 'Heritage & photos';
    if (m === 'beach') return vi ? 'Biển & nghỉ dưỡng' : 'Beach & stay';
    if (m === 'food') return vi ? 'Ẩm thực địa phương' : 'Local food';
    return vi ? 'Chậm, ít di chuyển' : 'Slow travel';
  }

  private paceLabel(): string {
    const vi = this.isVi();
    return this.pace() === 'easy' ? (vi ? 'Rảnh rang' : 'Easy') : this.pace() === 'balanced' ? (vi ? 'Vừa đủ' : 'Balanced') : vi ? 'Đi nhiều' : 'Packed';
  }

  run(): void {
    this.loading.set(true);
    this.successMsg.set(false);
    const vi = this.isVi();
    const quizPrompt = [
      vi ? `Số ngày: ${this.daysCount()}` : `Days: ${this.daysCount()}`,
      vi ? `Người đi: ${this.travelerLabel()}` : `Travelers: ${this.travelerLabel()}`,
      vi ? `Gu du lịch: ${this.moodLabel()}` : `Travel mood: ${this.moodLabel()}`,
      vi ? `Nhịp chuyến đi: ${this.paceLabel()}` : `Trip pace: ${this.paceLabel()}`,
      this.customPrompt().trim(),
    ].filter(Boolean).join('. ');

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
      .post<AIResponse>('/api/ai/itinerary', { prompt: quizPrompt, province: this.province(), budget: this.budget(), language: this.i18n.language() })
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

@Component({
  selector: 'app-simple-feature-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="mx-auto max-w-6xl px-4 py-12">
      <div class="overflow-hidden rounded-3xl border border-natural-border bg-white shadow-luxe">
        <div class="grid md:grid-cols-2">
          <div class="p-8 md:p-12">
            <p class="text-xs font-black uppercase tracking-[0.25em] text-natural-accent">{{ eyebrow() }}</p>
            <h1 class="mt-3 font-serif text-5xl font-black text-natural-ink">{{ title() }}</h1>
            <p class="mt-5 text-base leading-8 text-natural-text/72">{{ description() }}</p>
            <a routerLink="/services" class="mt-8 inline-flex min-h-12 items-center rounded-full bg-natural-accent px-6 text-sm font-black text-white">{{ cta() }}</a>
          </div>
          <img [src]="image()" [alt]="title()" class="h-full min-h-80 w-full object-cover" />
        </div>
      </div>
    </section>
  `,
})
export class SimpleFeaturePageComponent {
  readonly eyebrow = input('VietCharm');
  readonly title = input('VietCharm');
  readonly description = input('');
  readonly cta = input('Explore services');
  readonly image = input('https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80');
}

interface MysteryDestination {
  regionVi: string;
  regionEn: string;
  airportCode: string;
  hotelVi: string;
  hotelEn: string;
  packingVi: string;
  packingEn: string;
  itineraryVi: string[];
  itineraryEn: string[];
}

@Component({
  selector: 'app-blind-travel-page',
  standalone: true,
  imports: [FormsModule, DecimalPipe, RouterLink, LucideCheckCircle, LucideCompass, LucideFlame, LucideGift, LucidePlane, LucideShirt, LucideSparkles],
  template: `
    <div class="relative w-full overflow-hidden border-y border-natural-border bg-natural-sand px-4 py-12 text-natural-text md:px-8">
      @if (alertMsg(); as msg) {
        <div class="fixed bottom-6 left-1/2 z-50 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-2 rounded-2xl border border-natural-border/20 bg-natural-text px-5 py-3 text-sm font-bold text-natural-sand shadow-2xl">
          <svg lucideSparkles class="h-4 w-4 text-natural-gold"></svg><span>{{ msg }}</span>
        </div>
      }

      <div class="mx-auto max-w-6xl space-y-10">
        <div class="mx-auto max-w-3xl space-y-3 text-center">
          <div class="inline-flex items-center gap-1.5 rounded-full bg-natural-border-light px-3 py-1 text-[10px] font-black uppercase tracking-widest text-natural-accent"><svg lucideFlame class="h-3.5 w-3.5 text-amber-500"></svg><span>{{ isVi() ? 'HÀNH TRÌNH TRẢI NGHIỆM ẨN SỐ' : 'BLIND TRAVEL ESCAPADE' }}</span></div>
          <h2 class="font-serif text-3xl font-black tracking-tight text-natural-text md:text-5xl">{{ isVi() ? 'Hành Trình Ẩn Số – Nhận Quà Từ Tương Lai' : 'Blind Travel – Unbox Your Surprise Escape' }}</h2>
          <p class="mx-auto max-w-2xl text-xs leading-relaxed text-natural-text/80 md:text-sm">{{ isVi() ? 'Thay vì tốn hàng chục tiếng so sánh giá phòng và đau đầu lên lịch trình, hãy nhập ngân sách, số ngày nghỉ và gu tận hưởng của bạn. Trí tuệ nhân tạo của VietCharm sẽ tự động tối ưu hóa chuyến bay khứ hồi cùng phòng Resort Heritage ẩn danh.' : 'Appealing to adventure-seekers and busy people tired of planning. Input your budget, length of stay, and preference guidelines. Our AI reserves optimized roundtrip flights and premium heritage secret stays.' }}</p>
        </div>

        <div class="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
          <!-- LEFT -->
          <div class="flex flex-col justify-between rounded-3xl border border-natural-border bg-white p-6 shadow-lg md:p-8 lg:col-span-5">
            <form class="space-y-5" (ngSubmit)="run()">
              <h3 class="border-b border-natural-sand pb-2 font-serif text-xs font-black uppercase tracking-widest text-natural-text">{{ isVi() ? 'Thiết Lập Chuyến Đi Bất Ngờ' : 'Configure Your Surprises' }}</h3>
              <div class="space-y-1.5">
                <div class="flex items-center justify-between text-xs font-bold text-natural-text"><span>{{ isVi() ? 'Ngân Sách Tối Đa (VNĐ)' : 'Max Budget Cap' }}</span><span class="font-mono font-black text-natural-accent">{{ budget() | number : '1.0-0' }}đ</span></div>
                <input type="range" min="2500000" max="10000000" step="500000" [ngModel]="budget()" (ngModelChange)="budget.set(+$event)" name="budget" class="h-1.5 w-full cursor-pointer rounded-lg bg-natural-sand accent-natural-accent" />
                <div class="flex justify-between font-mono text-[9px] text-natural-accent"><span>2.5 TR</span><span>6.2 TR</span><span>10.0 TR</span></div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="mb-1 block text-[11px] font-bold uppercase text-natural-accent">{{ isVi() ? 'Số ngày nghỉ' : 'Duration' }}</label>
                  <select class="w-full rounded-xl border border-natural-border bg-natural-sand p-2.5 text-xs font-bold text-natural-text outline-none" [ngModel]="days()" (ngModelChange)="days.set(+$event)" name="days">
                    @for (d of dayOptions; track d) { <option [value]="d">{{ d }} {{ i18n.isVi() ? (d === 1 ? 'ngày tinh gọn' : 'ngày ' + (d - 1) + ' đêm') : (d === 1 ? 'Day' : 'Days ' + (d - 1) + ' Nights') }}</option> }
                  </select>
                </div>
                <div>
                  <label class="mb-1 block text-[11px] font-bold uppercase text-natural-accent">{{ isVi() ? 'Ngày đi dự kiến' : 'Target Date' }}</label>
                  <input type="date" [min]="today" class="w-full rounded-xl border border-natural-border bg-natural-sand p-2.5 text-xs font-bold text-natural-text outline-none" [ngModel]="departureDate()" (ngModelChange)="departureDate.set($event)" name="date" />
                </div>
              </div>
              <div>
                <label class="mb-1 block text-[11px] font-bold uppercase text-natural-accent">{{ isVi() ? 'Thời gian cất cánh ưa thích' : 'Departure window' }}</label>
                <select class="w-full rounded-xl border border-natural-border bg-natural-sand p-2.5 text-xs font-bold text-natural-text outline-none" [ngModel]="departureTime()" (ngModelChange)="departureTime.set($event)" name="window">
                  @for (w of windowOptions(); track w.value) { <option [value]="w.value">{{ w.label }}</option> }
                </select>
              </div>
              <div class="space-y-3">
                <div>
                  <label class="mb-1 block text-[11px] font-bold uppercase text-natural-accent">{{ isVi() ? 'Gu du lịch ưa thích (Vibe)' : 'Your Travel Vibe' }}</label>
                  <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    @for (opt of vibeOptions(); track opt.value) {
                      <button type="button" [class]="'flex min-h-11 items-center gap-2 rounded-xl border px-3 text-left text-xs font-black transition ' + (vibe() === opt.value ? 'border-natural-accent bg-natural-accent text-white shadow-sm' : 'border-natural-border bg-natural-sand text-natural-text hover:bg-natural-beige')" (click)="vibe.set(opt.value)"><span aria-hidden="true">{{ opt.icon }}</span><span>{{ opt.label }}</span></button>
                    }
                  </div>
                </div>
                <div>
                  <label class="mb-1 block text-[11px] font-bold uppercase text-rose-700">{{ isVi() ? 'Điểm bạn KHÔNG muốn làm' : 'What you strongly DISLIKE' }}</label>
                  <select class="w-full rounded-xl border border-rose-200 bg-natural-sand p-2.5 text-xs font-bold text-rose-800 outline-none" [ngModel]="dislikes()" (ngModelChange)="dislikes.set($event)" name="dislikes">
                    @for (d of dislikeOptions(); track d.value) { <option [value]="d.value">{{ d.label }}</option> }
                  </select>
                </div>
              </div>
              <div class="pt-2">
                <button type="submit" [disabled]="loading()" class="flex w-full items-center justify-center gap-2 rounded-2xl bg-natural-accent py-4 font-serif font-black text-white shadow-xl transition duration-300 hover:bg-natural-olive disabled:opacity-50"><svg lucideSparkles class="h-4 w-4 text-amber-300"></svg><span>{{ isVi() ? 'LẬP TRÌNH CHUYẾN ĐI BẤT NGỜ' : 'COMPILE SURPRISE ORACLE' }}</span></button>
              </div>
            </form>
            <div class="mt-5 rounded-2xl border border-amber-200/40 bg-amber-50/50 p-3.5 text-[10px] leading-relaxed text-amber-900">💡 <strong>{{ isVi() ? 'Yếu tố lôi cuốn thế hệ trẻ:' : 'Why young explorers love this:' }}</strong> {{ isVi() ? 'Bạn sẽ không biết chính xác điểm đến của mình là đâu cho đến khi ra sân bay! Tuy nhiên, hệ thống sẽ gửi gợi ý chuẩn bị quần áo/trang phục trước 3 ngày để bạn chủ động chuẩn bị.' : 'You will remain blind to the exact city and airport path until check-in time! Rest easy: a smart packaging guide arrives 3 days early to prepare your wardrobe perfectly.' }}</div>
          </div>

          <!-- RIGHT -->
          <div class="relative flex min-h-[500px] flex-col items-center justify-center overflow-hidden rounded-3xl border border-natural-border bg-white p-6 shadow-lg md:p-8 lg:col-span-7">
            <div class="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-natural-accent/5 blur-2xl"></div>
            <div class="pointer-events-none absolute bottom-0 left-0 h-32 w-32 rounded-full bg-natural-gold/5 blur-2xl"></div>

            @switch (stage()) {
              @case ('idle') {
                <div class="max-w-sm space-y-4 text-center">
                  <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-natural-border bg-natural-sand"><svg lucideGift class="h-10 w-10 animate-bounce text-natural-accent"></svg></div>
                  <h4 class="font-serif text-base font-black text-natural-text">{{ isVi() ? 'Hòm Quà Hành Trình Đang Chờ Đợi' : 'Mystery Escape Chest Awaiting' }}</h4>
                  <p class="text-xs leading-relaxed text-natural-text/70">{{ isVi() ? 'Hãy điền ngân sách và sở thích ở khung bên trái. Hệ thống AI VietCharm sẽ gói gọn lộ trình bay & nghỉ dưỡng hoàn mỹ trong hộp quà bí mật!' : 'Set your budget cap and preferred taste on the left. The AI compiler will seal your flight & luxury stay inside a glowing surprise envelope!' }}</p>
                </div>
              }
              @case ('loading') {
                <div class="max-w-md space-y-6 text-center">
                  <div class="relative mx-auto h-16 w-16"><div class="absolute inset-0 rounded-full border-4 border-natural-accent/30"></div><div class="absolute inset-0 animate-spin rounded-full border-4 border-t-natural-accent"></div><svg lucideCompass class="absolute inset-0 m-auto h-6 w-6 animate-pulse text-natural-accent"></svg></div>
                  <div class="space-y-2"><h4 class="animate-pulse font-serif text-xs font-black uppercase tracking-widest text-natural-accent">{{ isVi() ? 'Đang giữ chỗ và chuẩn bị gợi ý hành trình...' : 'Holding options and preparing your trip reveal...' }}</h4><p class="rounded-xl border border-natural-border bg-natural-sand px-4 py-2.5 font-mono text-[11px] text-natural-text/90">{{ loadingStep() }}</p></div>
                </div>
              }
              @case ('sealed-box') {
                <div class="max-w-sm space-y-6 text-center">
                  <div class="relative">
                    <div class="mx-auto flex h-28 w-28 cursor-pointer items-center justify-center rounded-3xl bg-natural-accent text-white shadow-2xl transition hover:scale-105" (click)="openGift()"><svg lucideGift class="h-14 w-14 animate-pulse text-amber-300"></svg></div>
                    <div class="absolute -right-1 -top-1 animate-bounce rounded-full bg-amber-500 px-2 py-0.5 text-[9px] font-black uppercase text-white">Ready!</div>
                  </div>
                  <div class="space-y-2"><h4 class="font-serif text-base font-black text-natural-text">{{ isVi() ? '🎁 Hộp Quà Ẩn Số Đã Khóa!' : '🎁 Your Secret Box is Sealed!' }}</h4><p class="text-xs leading-relaxed text-natural-text/70">{{ isVi() ? 'Lá số chuyến đi bất ngờ đã được niêm phong an toàn. Hãy nhấp chuột vào chiếc hộp để mở bung và chiêm ngưỡng hành trình dành riêng cho bạn!' : 'The heritage algorithm has locked your special getaway. Click/Tap the unboxing envelope to tear open your golden surprise ticket!' }}</p></div>
                  <button type="button" class="rounded-2xl bg-emerald-700 px-8 py-3.5 font-serif text-xs font-bold text-white shadow-md transition duration-300 hover:bg-emerald-800" (click)="openGift()">{{ isVi() ? '💥 MỞ TUNG QUÀ BẤT NGỜ' : '💥 TEAR OPEN SURPRISE GIFT' }}</button>
                </div>
              }
              @case ('opened-gift') {
                @if (mysteryDest(); as dest) {
                  <div class="w-full space-y-5">
                    <div class="relative overflow-hidden rounded-3xl border-2 border-dashed border-natural-accent/40 bg-gradient-to-br from-natural-bg to-natural-sand p-5 shadow-xl md:p-6">
                      <div class="pointer-events-none absolute -right-4 -top-4 flex h-24 w-24 rotate-12 items-center justify-center rounded-full border-4 border-emerald-700/10"><span class="font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-800/20">VietCharm Verified</span></div>
                      <div class="flex items-start justify-between gap-4">
                        <div>
                          <span class="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-emerald-800"><svg lucideCheckCircle class="h-3 w-3 text-emerald-700"></svg><span>{{ isVi() ? 'ĐÃ ĐỊNH VỊ THÀNH CÔNG!' : 'SECURED DESTINATION!' }}</span></span>
                          <h4 class="mt-1.5 font-serif text-lg font-black leading-tight text-natural-text md:text-xl">{{ isVi() ? dest.regionVi : dest.regionEn }}</h4>
                          <p class="mt-0.5 font-mono text-[10px] font-bold text-natural-accent">🛫 {{ isVi() ? 'Đường bay khứ hồi khép kín:' : 'Curated flights:' }} {{ dest.airportCode }}</p>
                        </div>
                        <div class="shrink-0 text-right"><span class="block text-[9px] font-black uppercase text-natural-accent">{{ isVi() ? 'TRỌN GÓI / KHÁCH' : 'NET BUNDLE PRICE' }}</span><span class="font-mono text-base font-black text-emerald-700">{{ budget() | number : '1.0-0' }}đ</span></div>
                      </div>
                      <div class="mt-4 grid grid-cols-1 gap-4 border-t border-natural-border pt-3 md:grid-cols-2">
                        <div class="space-y-1"><span class="block text-[9px] font-black uppercase text-natural-accent">🏨 {{ isVi() ? 'Resort 5 Sao Ẩn Danh' : 'Luxury Stay Sealed' }}</span><p class="text-xs font-bold leading-relaxed text-natural-text/90">{{ isVi() ? dest.hotelVi : dest.hotelEn }}</p></div>
                        <div class="space-y-1"><span class="block text-[9px] font-black uppercase text-amber-700">📆 {{ isVi() ? 'Lịch Bay' : 'Time Slot' }}</span><p class="text-xs font-bold leading-relaxed text-natural-text/90">{{ days() }} {{ isVi() ? 'Ngày' : 'Days' }} • {{ departureDate() }} ({{ departureTime() }})</p></div>
                      </div>
                      <div class="mt-4 flex gap-3 rounded-2xl border border-natural-border bg-natural-border-light/50 p-3">
                        <svg lucideShirt class="mt-0.5 h-5 w-5 shrink-0 text-natural-accent"></svg>
                        <div><span class="block text-[9px] font-black uppercase text-natural-accent">👗 {{ isVi() ? 'Gợi Ý Chuẩn Bị Trang Phục (3 ngày trước bay)' : 'Apparel Guidance (Sent 3 Days Early)' }}</span><p class="mt-0.5 text-[11px] leading-relaxed text-natural-text/80">{{ isVi() ? dest.packingVi : dest.packingEn }}</p></div>
                      </div>
                      <div class="mt-4 space-y-2 border-t border-natural-border pt-3">
                        <span class="block text-[9px] font-black uppercase text-natural-accent">🔮 {{ isVi() ? 'Lộ Trình Bất Ngờ Thiết Kế' : 'Surprise Itinerary Highlight Node' }}</span>
                        <ul class="space-y-1.5 text-xs">
                          @for (day of (isVi() ? dest.itineraryVi : dest.itineraryEn); track day) {
                            <li class="flex items-start gap-2 text-natural-text/95"><span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-natural-accent"></span><span>{{ day }}</span></li>
                          }
                        </ul>
                      </div>
                    </div>
                    <div class="flex flex-wrap justify-end gap-2">
                      <button type="button" class="rounded-xl border border-natural-border bg-white px-5 py-3 text-xs font-bold text-natural-accent transition hover:bg-natural-sand" (click)="reset()">🔄 {{ isVi() ? 'Thiết lập lại' : 'Try Another' }}</button>
                      <a routerLink="/" class="rounded-xl bg-slate-100 px-5 py-3 text-xs font-bold text-natural-text transition hover:bg-slate-200">{{ isVi() ? 'Quay lại' : 'Back Home' }}</a>
                      <button type="button" class="flex items-center gap-1 rounded-xl bg-natural-accent px-6 py-3 font-serif text-xs font-black text-white shadow-md transition hover:bg-natural-olive" (click)="book()"><span>{{ isVi() ? 'Gói Cất Cánh Ngay' : 'Book Surprises Now' }}</span><svg lucidePlane class="h-4 w-4 animate-pulse text-amber-300"></svg></button>
                    </div>
                  </div>
                }
              }
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class BlindTravelPageComponent {
  readonly isVi = computed(() => this.i18n.isVi());
  readonly today = new Date().toISOString().split('T')[0];
  readonly dayOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  readonly budget = signal(3800000);
  readonly days = signal(3);
  readonly departureDate = signal('2026-07-10');
  readonly departureTime = signal('Sáng Sớm (05:00 - 08:00)');
  readonly vibe = signal('chill');
  readonly dislikes = signal('climbing');
  readonly loading = signal(false);
  readonly loadingStep = signal('');
  readonly stage = signal<'idle' | 'loading' | 'sealed-box' | 'opened-gift'>('idle');
  readonly alertMsg = signal<string | null>(null);
  readonly mysteryDest = signal<MysteryDestination | null>(null);

  private timer?: ReturnType<typeof setInterval>;

  constructor(
    readonly i18n: I18nService,
    private readonly cart: CartService,
    private readonly ui: UiStateService,
  ) {}

  vibeOptions(): Array<{ value: string; icon: string; label: string }> {
    const vi = this.isVi();
    return [
      { value: 'chill', icon: '🌾', label: vi ? 'Chill di sản' : 'Chill Heritage' },
      { value: 'sea', icon: '🌊', label: vi ? 'Biển hoang sơ' : 'Secret Beaches' },
      { value: 'culture', icon: '🏺', label: vi ? 'Làng nghề' : 'Artisanal Villages' },
      { value: 'adventure', icon: '⛰️', label: vi ? 'Phiêu lưu' : 'Adventure' },
      { value: 'foodie', icon: '🍲', label: vi ? 'Ẩm thực' : 'Food Safari' },
      { value: 'healing', icon: '🧘', label: vi ? 'Chữa lành' : 'Wellness' },
      { value: 'photography', icon: '📸', label: vi ? 'Chụp ảnh' : 'Photo Hunt' },
      { value: 'nature', icon: '🚲', label: vi ? 'Sinh thái' : 'Eco Cycling' },
      { value: 'glamping', icon: '⛺', label: vi ? 'Glamping' : 'Glamping' },
      { value: 'luxury', icon: '🛥️', label: vi ? 'Sang trọng' : 'Luxury' },
      { value: 'art', icon: '🎨', label: vi ? 'Nghệ thuật' : 'Art Walk' },
      { value: 'cozy', icon: '☕', label: vi ? 'Cà phê sách' : 'Cozy Cafes' },
      { value: 'fisherman', icon: '🎣', label: vi ? 'Ngư dân' : 'Fishing' },
      { value: 'heritage', icon: '👘', label: vi ? 'Việt phục' : 'Heritage Dress' },
      { value: 'nightlife', icon: '🏮', label: vi ? 'Chợ đêm' : 'Night Markets' },
    ];
  }

  windowOptions(): Array<{ value: string; label: string }> {
    const vi = this.isVi();
    return [
      { value: 'Sáng Sớm (05:00 - 08:00)', label: '🌅 ' + (vi ? 'Sáng Sớm (05:00 - 08:00) - Ngắm bình minh' : 'Early Morning (05:00 - 08:00)') },
      { value: 'Sáng (08:00 - 11:00)', label: '☀️ ' + (vi ? 'Sáng (08:00 - 11:00) - Giờ đẹp thong thả' : 'Morning (08:00 - 11:00)') },
      { value: 'Trưa (11:00 - 13:00)', label: '🕛 ' + (vi ? 'Trưa (11:00 - 13:00) - Tiện ăn trưa' : 'Noon (11:00 - 13:00)') },
      { value: 'Đầu Chiều (13:00 - 15:00)', label: '☕ ' + (vi ? 'Đầu Chiều (13:00 - 15:00) - Check-in vừa kịp' : 'Early Afternoon (13:00 - 15:00)') },
      { value: 'Chiều Muộn (15:00 - 17:00)', label: '🌇 ' + (vi ? 'Chiều Muộn (15:00 - 17:00) - Tránh nắng' : 'Late Afternoon (15:00 - 17:00)') },
      { value: 'Hoàng Hôn (17:00 - 19:00)', label: '🌆 ' + (vi ? 'Hoàng Hôn (17:00 - 19:00) - Ngắm hoàng hôn' : 'Sunset Hours (17:00 - 19:00)') },
      { value: 'Tối (19:00 - 22:00)', label: '🌙 ' + (vi ? 'Tối (19:00 - 22:00) - Sau giờ tan làm' : 'Evening (19:00 - 22:00)') },
      { value: 'Đêm Khuya (22:00 - 01:00)', label: '🦉 ' + (vi ? 'Đêm Khuya (22:00 - 01:00) - Bay tiết kiệm' : 'Late Night (22:00 - 01:00)') },
      { value: 'Bay Đêm (01:00 - 05:00)', label: '✈️ ' + (vi ? 'Bay Đêm/Red-eye (01:00 - 05:00) - Ngủ trên máy bay' : 'Red-eye Flight (01:00 - 05:00)') },
      { value: 'Chuyến bay sớm nhất', label: '🥇 ' + (vi ? 'Chuyến sớm nhất trong ngày' : 'Earliest Flight of Day') },
      { value: 'Chuyến bay muộn nhất', label: '🏁 ' + (vi ? 'Chuyến muộn nhất trong ngày' : 'Latest Flight of Day') },
      { value: 'Tránh giờ cao điểm', label: '⚡ ' + (vi ? 'Tránh giờ cao điểm kẹt xe' : 'Avoid Rush Hours') },
      { value: 'Giờ hoàng gia', label: '👑 ' + (vi ? 'Giờ hoàng gia thong thả' : 'Royal Premium Hours') },
      { value: 'Tối ưu giá vé tốt nhất', label: '💎 ' + (vi ? 'Linh hoạt tối ưu giá rẻ nhất' : 'Cheapest Flexi Fare Option') },
      { value: 'Tàu hỏa/Xe giường nằm đêm', label: '🚂 ' + (vi ? 'Xe giường nằm/Tàu hỏa đêm' : 'Overnight Sleeper Train/Bus') },
    ];
  }

  dislikeOptions(): Array<{ value: string; label: string }> {
    const vi = this.isVi();
    return [
      { value: 'climbing', label: '🧗 ' + (vi ? 'Không thích leo núi cao dốc mệt' : 'No exhausting mountain hikes') },
      { value: 'crowds', label: '👥 ' + (vi ? 'Tránh bãi tắm thương mại xô bồ' : 'No overcrowded tourist traps') },
      { value: 'shopping', label: '🛍️ ' + (vi ? 'Ghét đi tour ép mua sắm bắt buộc' : 'No forced commercial shopping stops') },
      { value: 'walking', label: '🥵 ' + (vi ? 'Không thích đi bộ quá nhiều dưới trời nắng' : 'No heavy walking under the hot sun') },
      { value: 'noise', label: '🔊 ' + (vi ? 'Tránh xa bar/vũ trường ồn ào náo nhiệt' : 'No noisy bars & clubs') },
      { value: 'spicy', label: '🌶️ ' + (vi ? 'Không ăn được đồ quá cay nóng' : 'No extremely spicy/hot food') },
      { value: 'seafood', label: '🦐 ' + (vi ? 'Dị ứng/Ngại ăn đồ sống, hải sản gỏi' : 'No raw seafood/sashimi') },
      { value: 'rowing', label: '🚣 ' + (vi ? 'Sợ chèo thuyền thúng, say sóng nước' : 'No spinning baskets or seasickness') },
      { value: 'museums', label: '🏛️ ' + (vi ? 'Ngại tham quan bảo tàng, di tích khô khan' : 'No boring historical museum tours') },
      { value: 'rain', label: '☔ ' + (vi ? 'Tránh hoạt động ngoài trời lúc mưa gió' : 'No rainy outdoor activities') },
      { value: 'photos', label: '📷 ' + (vi ? 'Ngại xếp hàng chụp ảnh sống ảo mệt mỏi' : 'No queuing for visual poses') },
      { value: 'morning', label: '🛌 ' + (vi ? 'Không muốn thức dậy sớm trước 7h sáng' : 'No waking up early before 7 AM') },
      { value: 'kids', label: '👶 ' + (vi ? 'Tránh xa khu vui chơi trẻ em ồn ào' : 'No noisy children playground areas') },
      { value: 'animals', label: '🦟 ' + (vi ? 'Sợ côn trùng, động vật hoang dã' : 'No wild bugs or exotic animals') },
      { value: 'driving', label: '🚗 ' + (vi ? 'Không thích tự lái xe đường dài mệt mỏi' : 'No tedious long-distance driving') },
    ];
  }

  private alert(msg: string): void {
    this.alertMsg.set(msg);
    setTimeout(() => this.alertMsg.set(null), 6000);
  }

  private destinations(): MysteryDestination[] {
    return [
      {
        regionVi: 'Phố Cổ Hội An & Đầm nước Rừng dừa dật', regionEn: 'Ancient Town Hoi An & Secret Coconut Marshes', airportCode: 'DAD (Sân bay Đà Nẵng)',
        hotelVi: 'Resort boutique Di sản 5 sao biệt lập bên sông Thu Bồn', hotelEn: 'Secluded 5-star Heritage Boutique Riverside Resort',
        packingVi: 'Chuẩn bị váy áo lụa tơ tằm bồng bềnh, dép xỏ ngón mộc, đồ bơi rực rỡ và máy ảnh lấy ngay. VietCharm tặng kèm một nón lá cao cấp thêu tên bạn đặt sẵn tại sảnh.', packingEn: 'Pack flowy silk dresses, rustic slide sandals, bright swimsuits, and an instant camera. A custom-embroidered conical hat will be waiting at the reception.',
        itineraryVi: ['Ngày 1: Xe riêng đón sân bay & Thả hoa đăng cầu bình an sông Hoài dưới ngàn đèn lồng.', 'Ngày 2: Sáng sớm chèo thuyền thúng len lỏi rừng dừa nước, chiều học nấu mâm cơm di sản tại vườn rau hữu cơ.', 'Ngày 3: Thư giãn trị liệu thảo mộc truyền thống, ăn trưa ẩm thực Cao Lầu trứ danh & Tiễn bay.'],
        itineraryEn: ['Day 1: Private airport transfer & Lantern-releasing boat trip on Hoai River beneath thousands of silk lanterns.', 'Day 2: Sunrise spinning basket boat ride through coconut forests; afternoon heritage cooking class in an organic farm.', 'Day 3: Signature herbal wellness spa session, farewell lunch featuring local Cao Lau noodles, and private airport drop-off.'],
      },
      {
        regionVi: 'Biển xanh Quy Nhơn & Tháp Chăm Di sản ngàn năm', regionEn: 'Emerald Quy Nhon Beach & Ancient Thousand-Year Cham Towers', airportCode: 'UIH (Sân bay Phù Cát)',
        hotelVi: 'Biệt thự hướng biển vách đá hoang sơ Kỳ Co', hotelEn: 'Private Cliffside Oceanfront Villa in Ky Co',
        packingVi: 'Chuẩn bị quần áo linen thoáng mát, mũ cói rộng vành, kem chống nắng thân thiện rạn san hô, kính râm sành điệu. Gợi ý mang thêm trang phục màu trắng/be cổ điển để check-in Tháp Bánh Ít.', packingEn: 'Bring breathable linen outfits, wide-brim straw hats, reef-safe sunscreen, and retro sunglasses. We suggest classic white or beige attire for the Banh It Cham towers.',
        itineraryVi: ['Ngày 1: Đón rước về biệt thự vách đá, tối nghe nhạc jazz mộc mạc bên sóng biển vỗ rì rào.', 'Ngày 2: Cano riêng đi đảo Kỳ Co lặn ngắm san hô, chiều viếng quần thể Tháp Chăm linh thiêng rực nắng vàng.', 'Ngày 3: Đón bình minh tuyệt đỉnh Eo Gió, trưa thưởng thức lẩu cua huỳnh đế di sản & Tiễn sân bay.'],
        itineraryEn: ['Day 1: Private ride to the cliffside villa, cozy candlelight evening listening to beachside jazz acoustic rhythms.', 'Day 2: Private boat trip to Ky Co marine sanctuary; afternoon sun-drenched exploration of sacred Cham towers.', 'Day 3: Magical sunrise viewing at Eo Gio bay, signature local Curlew Crab hotpot feast, and airport transfer.'],
      },
    ];
  }

  run(): void {
    this.loading.set(true);
    this.stage.set('loading');
    const vi = this.isVi();
    const steps = vi
      ? ['🔮 Phân tích tâm lý & gu du lịch thế hệ mới...', '✈️ Đang thương lượng với các hãng hàng không chặng bay vàng...', '🏨 Gửi mã đặt chỗ kín tới hệ thống Resort Di sản 5 sao đối tác...', '🎁 Đóng gói phong thư bất ngờ chứa mã đặt chỗ độc bản...']
      : ['🔮 Analyzing psychological desires & generational taste...', '✈️ Sourcing exclusive charter flight corridors...', '🏨 Securing hidden inventory at boutique heritage villas...', '🎁 Packing your mystery oracle card in the lockbox...'];
    let idx = 0;
    this.loadingStep.set(steps[0]);
    this.timer = setInterval(() => {
      idx++;
      if (idx < steps.length) this.loadingStep.set(steps[idx]);
    }, 850);
    setTimeout(() => {
      if (this.timer) clearInterval(this.timer);
      this.loading.set(false);
      const v = this.vibe();
      const selected = v === 'sea' || v === 'glamping' || v === 'adventure' || v === 'fisherman' ? this.destinations()[1] : this.destinations()[0];
      this.mysteryDest.set(selected);
      this.stage.set('sealed-box');
      this.alert(vi ? '✓ Đã tạo thành công Lá Số Hành Trình Ẩn Số!' : '✓ Mystery Journey Oracle compiled successfully!');
    }, 3500);
  }

  openGift(): void {
    this.stage.set('opened-gift');
    this.alert(this.isVi() ? '🎁 Mở tung chiếc hộp quà - Hành trình ẩn số hiển lộ!' : '🎁 Surprise box unlocked! Unveiling your destination!');
  }

  reset(): void {
    this.stage.set('idle');
    this.mysteryDest.set(null);
  }

  book(): void {
    const dest = this.mysteryDest();
    if (!dest) return;
    const vi = this.isVi();
    const v = this.vibe();
    const item: BookingCartItem = {
      id: `blind-travel-mystery-${Date.now()}`,
      type: 'activity',
      name: vi ? `[Hành trình Ẩn Số] Vé máy bay khứ hồi & Resort bí mật` : `[Mystery Escape] Roundtrip Flight & 5-Star Secret Stay`,
      price: this.budget(),
      quantity: 1,
      image: v === 'sea' || v === 'glamping' || v === 'adventure' || v === 'fisherman' ? 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=500&q=80' : 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=500&q=80',
      details: vi
        ? `Thời gian: ${this.days()} ngày. Khởi hành ngày ${this.departureDate()} (${this.departureTime()}). Chi tiết điểm đến được niêm phong cho đến khi ra sân bay.`
        : `Duration: ${this.days()} Days. Depart on ${this.departureDate()} (${this.departureTime()}). Exact itinerary sealed until airport arrival.`,
    };
    this.ui.requireAuth(() => {
      this.cart.addCombo([item]);
      this.alert(vi ? '✓ Đã đóng gói chuyến đi bất ngờ vào giỏ hành lý!' : '✓ Loaded surprise getaway pack into your travel bundle!');
    }, vi ? 'Đăng nhập để đặt chuyến đi ẩn số.' : 'Sign in to book the mystery trip.');
  }
}

interface TripMember {
  id: string;
  name: string;
  avatar: string;
  budget: number;
  preferences: string[];
  dislikes: string;
  status: 'paid' | 'unpaid';
}

interface VoteItem {
  id: string;
  nameVi: string;
  nameEn: string;
  type: 'hotel' | 'activity' | 'restaurant';
  image: string;
  votes: string[];
  price: number;
  rating: number;
  locationVi: string;
  locationEn: string;
}

@Component({
  selector: 'app-trip-room-page',
  standalone: true,
  imports: [FormsModule, DecimalPipe, RouterLink, LucideAlertCircle, LucideCheckCircle, LucideChevronRight, LucideInfo, LucidePlus, LucideShare2, LucideShieldCheck, LucideSparkles, LucideTrash2, LucideUsers],
  template: `
    <div class="relative w-full overflow-hidden border-y border-natural-border bg-natural-sand px-4 py-12 text-natural-text md:px-8">
      @if (alertMsg(); as msg) {
        <div class="fixed bottom-6 left-1/2 z-50 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-2 rounded-2xl border border-natural-border/20 bg-natural-text px-5 py-3 text-sm font-bold text-natural-sand shadow-2xl"><svg lucideSparkles class="h-4 w-4 text-natural-gold"></svg><span>{{ msg }}</span></div>
      }

      <div class="mx-auto max-w-7xl space-y-10">
        <div class="mx-auto max-w-3xl space-y-3 text-center">
          <div class="inline-flex items-center gap-1.5 rounded-full bg-natural-border-light px-3 py-1 text-[10px] font-black uppercase tracking-widest text-natural-accent"><svg lucideUsers class="h-3.5 w-3.5"></svg><span>{{ isVi() ? 'PHÒNG LẬP KẾ HOẠCH NHÓM ĐỒNG THUẬN' : 'SHARED GROUP PLANNING ROOM' }}</span></div>
          <h2 class="font-serif text-3xl font-black tracking-tight text-natural-text md:text-5xl">{{ isVi() ? 'Trip Room – Giải Mã Áp Lực Đi Nhóm' : 'Trip Room – Group Co-Planning Oasis' }}</h2>
          <p class="mx-auto max-w-2xl text-xs leading-relaxed text-natural-text/80 md:text-sm">{{ isVi() ? 'Đi nhóm mệt vì một người chốt tự phát, người khác không ưng, không biết ai đã trả tiền, hay đổi lịch. Trip Room cho phép cả nhóm đề xuất gu, bầu chọn tối ưu, tự thanh toán và hiển thị hóa đơn minh bạch.' : 'Group trips get chaotic when one person decides and others suffer. Invite friends, cast votes on options, track payment shares, and build a trip everyone actually loves.' }}</p>
        </div>

        <div class="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
          <!-- LEFT -->
          <div class="flex flex-col justify-between space-y-6 rounded-3xl border border-natural-border bg-white p-6 shadow-lg lg:col-span-5">
            <div class="space-y-6">
              <div class="space-y-3 rounded-2xl border border-natural-border bg-natural-sand p-4">
                <div class="flex items-center justify-between">
                  <span class="block text-[10px] font-black uppercase tracking-wider text-natural-accent">{{ isVi() ? 'LIÊN KẾT PHÒNG DU LỊCH NHÓM' : 'CO-PLANNING INVITE LINK' }}</span>
                  <span class="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-800"><span class="h-1.5 w-1.5 animate-ping rounded-full bg-emerald-500"></span><span>{{ isVi() ? 'Đang hoạt động' : 'Live' }}</span></span>
                </div>
                <div class="flex gap-2">
                  <input type="text" readonly [value]="'https://vietcharm.vn/triproom/' + roomId" class="flex-1 rounded-xl border border-natural-border bg-white p-2.5 font-mono text-[10px] text-natural-text" />
                  <button type="button" class="flex items-center gap-1.5 rounded-xl bg-natural-accent px-3 py-2.5 text-xs font-bold text-white transition hover:bg-natural-olive" (click)="copyLink()"><svg lucideShare2 class="h-3.5 w-3.5"></svg><span>{{ copied() ? (isVi() ? 'Đã lưu' : 'Copied') : (isVi() ? 'Mời' : 'Invite') }}</span></button>
                </div>
              </div>

              <div class="space-y-3">
                <div class="flex items-center justify-between border-b border-natural-sand pb-2">
                  <span class="font-serif text-xs font-black uppercase tracking-wider text-natural-text">{{ isVi() ? 'Danh sách thành viên' : 'Group Members' }}</span>
                  <span class="rounded-full border border-natural-border bg-natural-sand px-2.5 py-0.5 font-mono text-[10px] font-bold text-natural-accent">{{ members().length }} {{ isVi() ? 'người' : 'people' }}</span>
                </div>
                <div class="max-h-[220px] space-y-2.5 overflow-y-auto pr-1">
                  @for (member of members(); track member.id) {
                    <div class="group/item flex items-start gap-3 rounded-2xl border border-transparent p-3 transition hover:border-natural-border hover:bg-natural-sand">
                      <img [src]="member.avatar" [alt]="member.name" class="h-10 w-10 shrink-0 rounded-full border border-natural-border object-cover shadow-xs" />
                      <div class="min-w-0 flex-1">
                        <div class="flex items-start justify-between gap-1">
                          <span class="truncate text-xs font-black text-natural-text">{{ member.name }}</span>
                          <div class="flex items-center gap-1">
                            <span [class]="'rounded-full px-2 py-0.5 text-[9px] font-black ' + (member.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800')">{{ member.status === 'paid' ? (isVi() ? 'Đã đóng' : 'Paid') : (isVi() ? 'Chưa đóng' : 'Unpaid') }}</span>
                            @if (member.id !== 'm1') { <button type="button" class="p-0.5 text-rose-500 opacity-0 transition hover:text-rose-700 group-hover/item:opacity-100" (click)="deleteMember(member.id)"><svg lucideTrash2 class="h-3.5 w-3.5"></svg></button> }
                          </div>
                        </div>
                        <div class="mt-1 flex flex-wrap gap-1">
                          <span class="font-mono text-[9px] font-bold text-slate-500">{{ isVi() ? 'Ngân sách:' : 'Budget limit:' }} {{ member.budget | number : '1.0-0' }}đ</span>
                          @for (p of member.preferences; track p) { <span class="rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[9px] text-amber-900">{{ p }}</span> }
                        </div>
                        <p class="mt-1 truncate text-[9px] text-rose-700">⚠️ {{ isVi() ? 'Tránh: ' + member.dislikes : 'Dislike: ' + member.dislikes }}</p>
                      </div>
                    </div>
                  }
                </div>
              </div>

              <form class="space-y-3 border-t border-natural-border pt-4" (ngSubmit)="addMember()">
                <span class="block text-[10px] font-black uppercase text-natural-accent">{{ isVi() ? 'MÔ PHỎNG BẠN BÈ GIA NHẬP NHÓM' : 'SIMULATE FRIENDS JOINING LOBBY' }}</span>
                <div class="space-y-2">
                  <input type="text" required [ngModel]="friendName()" (ngModelChange)="friendName.set($event)" name="fname" [placeholder]="isVi() ? 'Tên bạn thân...' : 'Friend name...'" class="w-full rounded-xl border border-natural-border bg-natural-sand p-2.5 text-xs text-natural-text outline-none" />
                  <div class="grid grid-cols-2 gap-2">
                    <input type="text" [ngModel]="friendPref()" (ngModelChange)="friendPref.set($event)" name="fpref" [placeholder]="isVi() ? 'Gu du lịch (phẩy)...' : 'Vibes (comma separated)...'" class="rounded-xl border border-natural-border bg-natural-sand p-2.5 text-xs text-natural-text outline-none" />
                    <input type="text" [ngModel]="friendDislike()" (ngModelChange)="friendDislike.set($event)" name="fdis" [placeholder]="isVi() ? 'Cực ghét gì...' : 'Avoid/Dislike...'" class="rounded-xl border border-natural-border bg-natural-sand p-2.5 text-xs text-natural-text outline-none" />
                  </div>
                  <div class="flex items-center justify-between text-xs text-natural-accent">
                    <span>{{ isVi() ? 'Hạn mức chi:' : 'Budget max:' }} {{ friendBudget() | number : '1.0-0' }}đ</span>
                    <input type="range" min="3000000" max="10000000" step="500000" [ngModel]="friendBudget()" (ngModelChange)="friendBudget.set(+$event)" name="fbud" class="w-32 accent-natural-accent" />
                  </div>
                </div>
                <button type="submit" class="flex w-full items-center justify-center gap-1 rounded-xl border border-natural-border bg-natural-sand py-2 text-xs font-bold text-natural-accent transition hover:bg-natural-border"><svg lucidePlus class="h-4 w-4"></svg><span>{{ isVi() ? 'Thêm thành viên ảo này' : 'Insert Simulated Friend' }}</span></button>
              </form>
            </div>

            <div class="space-y-4 border-t border-natural-border pt-4">
              <div class="flex items-center justify-between rounded-2xl border border-natural-border bg-natural-sand p-3">
                <div><span class="block text-[9px] font-black uppercase text-natural-accent">{{ isVi() ? 'TỔNG CHUYẾN ĐI NHÓM' : 'TOTAL GROUP ESTIMATE' }}</span><span class="font-serif text-base font-black text-natural-text">{{ packageTotal() | number : '1.0-0' }}đ</span></div>
                <div class="text-right"><span class="block text-[9px] font-black uppercase text-natural-accent">{{ isVi() ? 'MỖI THÀNH VIÊN' : 'EACH SHARE (SPLIT)' }}</span><span class="font-mono text-sm font-black text-natural-accent">{{ perPersonShare() | number : '1.0-0' }}đ</span></div>
              </div>
              @if (unpaidCount() > 0) {
                <div class="flex items-center justify-between gap-3 rounded-2xl border border-rose-100 bg-rose-50 p-3.5">
                  <div class="flex items-center gap-1.5 text-xs font-semibold text-rose-800"><svg lucideAlertCircle class="h-4 w-4 shrink-0 text-rose-600"></svg><span class="text-[11px]">{{ isVi() ? 'Còn ' + unpaidCount() + ' người chưa đóng' : unpaidCount() + ' co-planners unpaid' }}</span></div>
                  <button type="button" class="shrink-0 rounded-xl bg-rose-600 px-3 py-1.5 text-[10px] font-bold uppercase text-white transition hover:bg-rose-700" (click)="alert(isVi() ? '🔔 Đã rung chuông gửi SMS & Zalo nhắc đóng tiền cho thành viên!' : '🔔 Split-bill reminders broadcasted via text!')">{{ isVi() ? 'Đòi tiền' : 'Remind' }}</button>
                </div>
              } @else {
                <div class="flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 p-3 text-xs font-black text-emerald-800"><svg lucideCheckCircle class="h-4 w-4 text-emerald-600"></svg><span>{{ isVi() ? 'Tất cả đã đóng! Đã sẵn sàng xuất phát.' : 'All paid! Ready to depart.' }}</span></div>
              }
              <div class="space-y-1">
                @for (m of members(); track m.id) {
                  @if (m.status === 'unpaid') {
                    <button type="button" class="flex w-full justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-[10px] font-bold text-slate-800 transition hover:bg-slate-100" (click)="pay(m.id)"><span>{{ isVi() ? 'Xác nhận ' + m.name + ' trả tiền' : 'Confirm pay for ' + m.name }}</span><span>+{{ perPersonShare() | number : '1.0-0' }}đ &rarr;</span></button>
                  }
                }
              </div>
            </div>
          </div>

          <!-- RIGHT -->
          <div class="flex flex-col justify-between space-y-6 rounded-3xl border border-natural-border bg-white p-6 shadow-lg lg:col-span-7 md:p-8">
            <div class="space-y-6">
              <div class="flex gap-4 border-b border-natural-sand pb-1">
                <button type="button" [class]="tabClass('invite')" (click)="tab.set('invite')">🗳️ {{ isVi() ? '1. Đóng góp ý kiến' : '1. Submit opinions' }}</button>
                <button type="button" [class]="tabClass('voting')" (click)="tab.set('voting')">📊 {{ isVi() ? '2. Bầu chọn địa điểm' : '2. Vote & Consensus' }}</button>
                <button type="button" [class]="tabClass('checkout')" (click)="tab.set('checkout')">💳 {{ isVi() ? '3. Hóa đơn chiết khấu' : '3. Group Checkout' }}</button>
              </div>

              @switch (tab()) {
                @case ('invite') {
                  <div class="space-y-4">
                    <div class="flex items-start gap-3 rounded-2xl border border-amber-200/40 bg-amber-50/50 p-4"><svg lucideInfo class="mt-0.5 h-4 w-4 shrink-0 text-amber-700"></svg><p class="text-[11px] leading-relaxed text-amber-900">{{ isVi() ? 'Từng thành viên khi nhấp vào link phòng sẽ điền gu nghỉ ngơi, ngân sách và các điểm đặc biệt cần tránh. Hệ thống sẽ lọc và đưa ra các đề xuất lưu trú, ăn uống, vui chơi phù hợp nhất để cả nhóm bầu chọn.' : 'Every group member inputs their design style, budget, and red-flags. Our platform aggregates these vibes and lists personalized hotels, dining, and activity nodes.' }}</p></div>
                    <div class="space-y-3">
                      <h4 class="text-xs font-bold uppercase tracking-wider text-natural-accent">{{ isVi() ? 'Ý KIẾN ĐANG HOẠT ĐỘNG TRONG PHÒNG' : 'COLLECTIVE GROUP INSIGHTS' }}</h4>
                      <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div class="space-y-1 rounded-xl border border-natural-border bg-natural-sand p-3"><span class="block text-[9px] font-bold uppercase text-natural-accent">{{ isVi() ? 'NGÂN SÁCH TRUNG BÌNH' : 'AVERAGE BUDGET TARGET' }}</span><span class="font-mono text-sm font-bold">{{ avgBudget() | number : '1.0-0' }}đ</span></div>
                        <div class="space-y-1 rounded-xl border border-natural-border bg-natural-sand p-3"><span class="block text-[9px] font-bold uppercase text-rose-700">{{ isVi() ? 'ĐIỂM TRÁNH CHUNG (ANTI-VIBE)' : 'CONSENSUS RED FLAGS' }}</span><span class="text-xs font-semibold text-rose-800">{{ isVi() ? 'Tránh mệt mỏi, đi bộ dài, khách sạn ồn' : 'No long tiring slopes, quiet hotels' }}</span></div>
                      </div>
                      <div class="space-y-2 rounded-2xl border border-natural-border bg-natural-bg p-4">
                        <span class="block text-[10px] font-black uppercase tracking-wider text-natural-accent">{{ isVi() ? 'GU CHUNG CỦA CẢ NHÓM ĐƯỢC TỔNG HỢP' : 'SYSTEM MATCHED VIBES' }}</span>
                        <div class="flex flex-wrap gap-1.5">
                          <span class="rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] text-emerald-800">🌾 {{ isVi() ? 'Thảnh thơi mộc mạc hoài cổ' : 'Rustic traditional vintage' }}</span>
                          <span class="rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] text-emerald-800">🏊 {{ isVi() ? 'Khách sạn có hồ bơi view sông' : 'Riverside stay with pools' }}</span>
                          <span class="rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] text-emerald-800">🥢 {{ isVi() ? 'Ẩm thực di sản bản địa mộc' : 'Heritage local gastronomy' }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="flex justify-end pt-4"><button type="button" class="flex items-center gap-1 rounded-xl bg-natural-accent px-6 py-3 font-serif text-xs font-bold text-white transition duration-300 hover:bg-natural-olive" (click)="tab.set('voting')"><span>{{ isVi() ? 'Tiến hành Bầu Chọn Địa Điểm' : 'Proceed to Group Voting' }}</span><svg lucideChevronRight class="h-4 w-4"></svg></button></div>
                  </div>
                }
                @case ('voting') {
                  <div class="space-y-6">
                    <div class="flex items-center justify-between border-b border-natural-sand pb-2"><p class="text-[10px] font-black uppercase tracking-wider text-natural-accent">{{ isVi() ? 'CẢ NHÓM BẦU CHỌN CHO CÁC PHƯƠNG ÁN' : 'REAL-TIME CO-PLANNER VOTING' }}</p><span class="rounded border border-amber-200 bg-amber-50 px-2 py-0.5 font-mono text-[9px] text-natural-accent">{{ isVi() ? 'Chạm để bầu nhân danh Trần Tuấn' : 'Tap to vote as Tuan' }}</span></div>
                    @for (cat of voteCategories(); track cat.type) {
                      <div class="space-y-3">
                        <h4 class="font-serif text-xs font-black uppercase tracking-wider text-natural-text">{{ cat.label }}</h4>
                        <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                          @for (item of itemsOfType(cat.type); track item.id) {
                            <div [class]="'group flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border bg-natural-bg transition duration-300 ' + (item.votes.includes('m1') ? 'border-natural-accent shadow-md ring-1 ring-natural-accent/30' : 'border-natural-border hover:border-natural-accent')" (click)="vote(item.id)">
                              <div class="relative h-28 overflow-hidden">
                                <img [src]="item.image" [alt]="item.nameVi" class="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                                @if (item.votes.length === members().length) { <div class="absolute right-2 top-2 flex items-center gap-0.5 rounded-full bg-emerald-600 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-white shadow"><svg lucideCheckCircle class="h-2.5 w-2.5"></svg><span>{{ isVi() ? 'Nhất trí 100%' : '100% Agreed' }}</span></div> }
                                <div class="absolute bottom-1 left-2 rounded bg-black/50 px-1.5 py-0.5 font-mono text-[9px] text-white">{{ item.price | number : '1.0-0' }}đ{{ cat.type === 'hotel' ? '/đêm' : '/người' }}</div>
                              </div>
                              <div class="space-y-2 p-3">
                                <div>
                                  <span class="block font-mono text-[8px] font-bold uppercase tracking-tight text-natural-accent">{{ isVi() ? item.locationVi : item.locationEn }}</span>
                                  <h5 class="line-clamp-1 font-serif text-[11px] font-bold leading-snug text-natural-text">{{ isVi() ? item.nameVi : item.nameEn }}</h5>
                                </div>
                                <div class="space-y-1">
                                  <div class="flex items-center justify-between text-[9px] font-semibold text-natural-accent"><span>{{ isVi() ? 'Tiến trình nhóm:' : 'Consensus:' }}</span><span>{{ item.votes.length }}/{{ members().length }} ({{ percent(item) }}%)</span></div>
                                  <div class="h-1.5 w-full overflow-hidden rounded-full bg-natural-border-light"><div class="h-full transition-all duration-500" [class.bg-emerald-600]="item.votes.length === members().length" [class.bg-natural-accent]="item.votes.length !== members().length" [style.width.%]="percent(item)"></div></div>
                                </div>
                                <div class="flex items-center justify-between border-t border-natural-sand pt-1">
                                  <div class="flex -space-x-1.5 overflow-hidden">
                                    @for (vId of item.votes; track vId) {
                                      @if (memberById(vId); as mb) { <img [src]="mb.avatar" [alt]="mb.name" [title]="mb.name" class="inline-block h-4 w-4 rounded-full object-cover ring-1 ring-white" /> }
                                    }
                                  </div>
                                  <span [class]="'rounded px-1.5 py-0.5 text-[8px] font-bold ' + (item.votes.includes('m1') ? 'bg-natural-accent text-white' : 'border border-natural-border bg-natural-sand text-natural-accent')">{{ item.votes.includes('m1') ? (isVi() ? '✓ Bạn đã bầu' : '✓ You voted') : (isVi() ? 'Bầu chọn' : 'Vote') }}</span>
                                </div>
                              </div>
                            </div>
                          }
                        </div>
                      </div>
                    }
                    <div class="flex items-center justify-between border-t border-natural-sand pt-4">
                      <div class="text-xs text-natural-accent">💡 {{ isVi() ? 'Mẹo: Các lựa chọn đạt 100% đồng ý sẽ tự động tối ưu hóa đơn!' : 'Tip: 100% consensus items reduce platform surcharges!' }}</div>
                      <button type="button" class="flex items-center gap-1 rounded-xl bg-emerald-700 px-6 py-3 font-serif text-xs font-black text-white transition duration-300 hover:bg-emerald-800" (click)="checkoutGroup()"><span>{{ isVi() ? 'Tải Lựa Chọn Đồng Thuận Lên Giỏ Vé' : 'Load Group Selections to Cart' }}</span><svg lucideSparkles class="h-4 w-4 text-amber-300"></svg></button>
                    </div>
                  </div>
                }
                @case ('checkout') {
                  <div class="space-y-6">
                    <div class="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4"><svg lucideShieldCheck class="h-6 w-6 shrink-0 text-emerald-600"></svg><div><h4 class="font-serif text-xs font-black uppercase text-emerald-800">{{ isVi() ? 'CHIẾT KHẤU ĐỒNG THUẬN TỰ ĐỘNG ĐÃ ÁP DỤNG!' : 'CONSENSUS DISCOUNT ACTIVATED!' }}</h4><p class="mt-0.5 text-[11px] leading-relaxed text-emerald-700">{{ isVi() ? 'Dựa trên việc cả nhóm đồng thuận 100% một số địa điểm (Vườn Vy, Rừng Dừa Bảy Mẫu), VietCharm chiết khấu ngay 12% phí dịch vụ trọn gói cho nhóm bạn.' : 'Due to perfect 100% consensus on multiple activities, VietCharm applied an automatic 12% discount to your collective bundle.' }}</p></div></div>
                    <div class="space-y-4 rounded-2xl border border-natural-border bg-natural-sand p-4">
                      <span class="block text-[10px] font-black uppercase tracking-wider text-natural-accent">{{ isVi() ? 'BẢNG CHI TIẾT THANH TOÁN THEO ĐẦU NGƯỜI' : 'DETAILED PER-HEAD LEDGER' }}</span>
                      <div class="space-y-2 font-mono text-[11px]">
                        @for (member of members(); track member.id) {
                          <div class="flex items-center justify-between border-b border-natural-border/40 py-2">
                            <div class="flex items-center gap-2"><img [src]="member.avatar" [alt]="member.name" class="h-5 w-5 rounded-full object-cover" /><span class="font-bold text-natural-text">{{ member.name }}</span></div>
                            <div class="flex items-center gap-3"><span class="font-bold text-natural-accent">{{ perPersonShare() | number : '1.0-0' }}đ</span><span [class]="'rounded px-2 py-0.5 text-[9px] font-black ' + (member.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800')">{{ member.status === 'paid' ? (isVi() ? 'ĐÃ TRẢ' : 'PAID') : (isVi() ? 'CHƯA TRẢ' : 'PENDING') }}</span></div>
                          </div>
                        }
                      </div>
                      <div class="flex justify-between pt-2 text-xs font-bold text-natural-text"><span>{{ isVi() ? 'Trưởng nhóm thanh toán trước:' : 'Leader pay-upfront total:' }}</span><span class="font-mono text-sm font-black text-natural-accent">{{ packageTotal() | number : '1.0-0' }}đ</span></div>
                    </div>
                    <div class="space-y-3 rounded-2xl border border-natural-border bg-white p-4">
                      <div class="flex items-center justify-between text-xs"><span class="font-serif font-black">{{ isVi() ? 'Trạng thái huy động quỹ:' : 'Crowdfunding progress:' }}</span><span class="font-mono font-bold text-emerald-700">{{ paidCount() }} / {{ members().length }} {{ isVi() ? 'đã hoàn tất' : 'completed' }}</span></div>
                      <div class="h-2 w-full overflow-hidden rounded-full border border-natural-border bg-natural-sand"><div class="h-full bg-emerald-600 transition-all duration-500" [style.width.%]="paidCount() / members().length * 100"></div></div>
                    </div>
                    <div class="flex flex-wrap justify-end gap-2">
                      <a routerLink="/" class="rounded-xl border border-natural-border bg-white px-6 py-3 text-xs font-bold text-natural-accent transition hover:bg-natural-sand">{{ isVi() ? 'Quay lại Trang Chủ' : 'Back to Home' }}</a>
                      <button type="button" class="rounded-xl bg-natural-accent px-6 py-3 font-serif text-xs font-bold text-white transition hover:bg-natural-olive" (click)="alert(isVi() ? '✓ Đã mở bước thanh toán đặt cọc nhóm!' : '✓ Opening group deposit checkout!')">{{ isVi() ? 'Thanh toán đặt cọc trọn gói' : 'Pay Group Deposit' }}</button>
                    </div>
                  </div>
                }
              }
            </div>
            <div class="border-t border-natural-sand pt-3 text-center font-sans text-[10px] italic text-natural-accent/80">✦ {{ isVi() ? 'Công nghệ Trip Room của VietCharm hiện đã hỗ trợ mở rộng cho mọi vùng di sản (Bắc, Trung, Nam).' : 'VietCharm Trip Room technology currently extends native multi-planner logic across all heritage regions.' }}</div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class TripRoomPageComponent {
  readonly isVi = computed(() => this.i18n.isVi());
  readonly roomId = 'VC-GROUP-889';
  readonly copied = signal(false);
  readonly tab = signal<'invite' | 'voting' | 'checkout'>('invite');
  readonly alertMsg = signal<string | null>(null);
  readonly members = signal<TripMember[]>([]);
  readonly votingItems = signal<VoteItem[]>([]);
  readonly friendName = signal('');
  readonly friendBudget = signal(5000000);
  readonly friendPref = signal('');
  readonly friendDislike = signal('');

  readonly avgBudget = computed(() => Math.round(this.members().reduce((a, m) => a + m.budget, 0) / (this.members().length || 1)));
  readonly paidCount = computed(() => this.members().filter((m) => m.status === 'paid').length);
  readonly unpaidCount = computed(() => this.members().filter((m) => m.status === 'unpaid').length);
  readonly topHotel = computed(() => this.topVoted('hotel'));
  readonly topActivity = computed(() => this.topVoted('activity'));
  readonly topRestaurant = computed(() => this.topVoted('restaurant'));
  readonly packageTotal = computed(() => (this.topHotel()?.price ?? 0) * 2 + (this.topActivity()?.price ?? 0) + (this.topRestaurant()?.price ?? 0));
  readonly perPersonShare = computed(() => Math.round(this.packageTotal() / (this.members().length || 1)));

  constructor(
    readonly i18n: I18nService,
    private readonly cart: CartService,
  ) {
    const vi = this.i18n.isVi();
    this.members.set([
      { id: 'm1', name: vi ? 'Trần Tuấn (Bạn/Trưởng Nhóm)' : 'Tran Tuan (You/Leader)', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80', budget: 5000000, preferences: vi ? ['Gần Phố Cổ', 'Ăn đặc sản', 'Chill sông nước'] : ['Near Ancient Town', 'Local food', 'Riverside chilling'], dislikes: vi ? 'Đi bộ quá nhiều' : 'Too much walking', status: 'unpaid' },
      { id: 'm2', name: 'Khánh Vy', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', budget: 6000000, preferences: vi ? ['Chụp ảnh đẹp', 'Hồ bơi vô cực', 'Café hoài cổ'] : ['Aesthetic photos', 'Infinity pool', 'Vintage café'], dislikes: vi ? 'Dậy quá sớm' : 'Waking up too early', status: 'unpaid' },
      { id: 'm3', name: 'Hoàng Long', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', budget: 4500000, preferences: vi ? ['Chèo thuyền thúng', 'Hải sản tươi', 'Gần biển'] : ['Basket boat tour', 'Fresh seafood', 'Near beach'], dislikes: vi ? 'Khách sạn ồn ào' : 'Noisy hotels', status: 'unpaid' },
    ]);
    this.votingItems.set([
      { id: 'h1', nameVi: 'Resort Boutique Di Sản Sông Thu Bồn', nameEn: 'Thu Bon River Heritage Boutique Resort', type: 'hotel', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80', votes: ['m1', 'm2'], price: 1800000, rating: 4.9, locationVi: 'Ven sông Thu Bồn, Hội An', locationEn: 'Riverside, Hoi An' },
      { id: 'h2', nameVi: 'Khách sạn Heritage Gỗ Mộc Phố Cổ', nameEn: 'Historic Timber Town Hotel', type: 'hotel', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=400&q=80', votes: ['m3'], price: 1100000, rating: 4.6, locationVi: 'Trung tâm Phố cổ, Hội An', locationEn: 'Ancient Town Center, Hoi An' },
      { id: 'r1', nameVi: 'Nhà Hàng Vườn Vy: Cao Lầu & Hoành Thánh Di Sản', nameEn: 'Vy Garden: Heritage Cao Lau & Wontons', type: 'restaurant', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&q=80', votes: ['m1', 'm2', 'm3'], price: 250000, rating: 4.8, locationVi: 'Đường Bạch Đằng, Hội An', locationEn: 'Bach Dang St, Hoi An' },
      { id: 'r2', nameVi: 'Bếp Hải Sản Đầm Sen Hội An', nameEn: 'Dam Sen Fresh Lagoon Seafood', type: 'restaurant', image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=400&q=80', votes: ['m3'], price: 450000, rating: 4.5, locationVi: 'Cẩm An, Hội An', locationEn: 'Cam An, Hoi An' },
      { id: 'a1', nameVi: 'Tour Lặn Ngắm San Hô Đảo Cù Lao Chàm bằng Cano', nameEn: 'Cham Island Snorkeling & Speedboat Adventure', type: 'activity', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=400&q=80', votes: ['m1', 'm3'], price: 750000, rating: 4.7, locationVi: 'Bến tàu Cửa Đại', locationEn: 'Cua Dai Pier' },
      { id: 'a2', nameVi: 'Thúng Xoay Rừng Dừa Bảy Mẫu & Thả Hoa Đăng Sông Hoài', nameEn: 'Coconut Forest Spinning Basket Boat & Lantern Release', type: 'activity', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&q=80', votes: ['m2', 'm1', 'm3'], price: 250000, rating: 4.9, locationVi: 'Rừng dừa Bảy Mẫu', locationEn: 'Bay Mau Coconut Forest' },
    ]);
  }

  tabClass(t: 'invite' | 'voting' | 'checkout'): string {
    return 'pb-2 text-xs font-bold uppercase tracking-wider transition ' + (this.tab() === t ? 'border-b-2 border-natural-accent font-black text-natural-accent' : 'text-natural-text/60 hover:text-natural-accent');
  }

  voteCategories(): Array<{ type: 'hotel' | 'restaurant' | 'activity'; label: string }> {
    const vi = this.isVi();
    return [
      { type: 'hotel', label: vi ? '🏡 1. Nơi Ở / Lưu Trú' : '🏡 1. Accommodations' },
      { type: 'restaurant', label: vi ? '🥢 2. Quán Ăn / Ẩm Thực' : '🥢 2. Dining & Flavors' },
      { type: 'activity', label: vi ? '🛶 3. Hoạt Động Trải Nghiệm' : '🛶 3. Activities' },
    ];
  }

  itemsOfType(type: 'hotel' | 'restaurant' | 'activity'): VoteItem[] {
    return this.votingItems().filter((v) => v.type === type);
  }

  memberById(id: string): TripMember | undefined {
    return this.members().find((m) => m.id === id);
  }

  percent(item: VoteItem): number {
    return Math.round((item.votes.length / (this.members().length || 1)) * 100);
  }

  private topVoted(type: 'hotel' | 'activity' | 'restaurant'): VoteItem | null {
    const items = this.votingItems().filter((v) => v.type === type);
    if (!items.length) return null;
    return items.reduce((prev, cur) => (prev.votes.length > cur.votes.length ? prev : cur));
  }

  alert(msg: string): void {
    this.alertMsg.set(msg);
    setTimeout(() => this.alertMsg.set(null), 6000);
  }

  copyLink(): void {
    this.copied.set(true);
    if (typeof navigator !== 'undefined' && navigator.clipboard) void navigator.clipboard.writeText(`https://vietcharm.vn/triproom/${this.roomId}`);
    this.alert(this.isVi() ? '✓ Đã sao chép link phòng lập kế hoạch!' : '✓ Group trip room link copied!');
    setTimeout(() => this.copied.set(false), 2000);
  }

  addMember(): void {
    if (!this.friendName().trim()) return;
    const avatars = ['https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80'];
    const id = `m${this.members().length + 1}`;
    const vi = this.isVi();
    const member: TripMember = {
      id, name: this.friendName(), avatar: avatars[Math.floor(Math.random() * avatars.length)], budget: this.friendBudget(),
      preferences: this.friendPref() ? this.friendPref().split(',').map((s) => s.trim()) : vi ? ['Tự do', 'Chill chill'] : ['Flexible', 'Chill'],
      dislikes: this.friendDislike() || (vi ? 'Không có' : 'None'), status: 'unpaid',
    };
    this.members.update((list) => [...list, member]);
    this.votingItems.update((items) => items.map((it) => (Math.random() > 0.4 ? { ...it, votes: [...it.votes, id] } : it)));
    this.alert(vi ? `✓ Đã mời ${this.friendName()} vào phòng nhóm!` : `✓ Invited ${this.friendName()} to the trip room!`);
    this.friendName.set('');
    this.friendPref.set('');
    this.friendDislike.set('');
  }

  deleteMember(id: string): void {
    if (id === 'm1') {
      this.alert(this.isVi() ? 'Bạn không thể xóa chính mình!' : 'You cannot remove yourself!');
      return;
    }
    this.members.update((list) => list.filter((m) => m.id !== id));
    this.votingItems.update((items) => items.map((it) => ({ ...it, votes: it.votes.filter((v) => v !== id) })));
    this.alert(this.isVi() ? 'Đã gỡ thành viên khỏi nhóm.' : 'Removed member from the room.');
  }

  vote(itemId: string): void {
    this.votingItems.update((items) => items.map((it) => {
      if (it.id !== itemId) return it;
      const voted = it.votes.includes('m1');
      return { ...it, votes: voted ? it.votes.filter((v) => v !== 'm1') : [...it.votes, 'm1'] };
    }));
  }

  pay(id: string): void {
    this.members.update((list) => list.map((m) => (m.id === id ? { ...m, status: 'paid' } : m)));
    this.alert(this.isVi() ? '✓ Ghi nhận thanh toán thành công!' : '✓ Payment verified successfully!');
  }

  checkoutGroup(): void {
    const vi = this.isVi();
    const items: BookingCartItem[] = [];
    const hotel = this.topHotel();
    const activity = this.topActivity();
    if (hotel) items.push({ id: `group-hotel-${hotel.id}`, type: 'hotel', name: `[Group Room] ${vi ? hotel.nameVi : hotel.nameEn}`, price: hotel.price * 2, quantity: this.members().length, image: hotel.image, details: vi ? `Bình chọn nhiều nhất bởi cả nhóm ${this.roomId}` : `Top-voted stay by group ${this.roomId}` });
    if (activity) items.push({ id: `group-act-${activity.id}`, type: 'activity', name: `[Group Room] ${vi ? activity.nameVi : activity.nameEn}`, price: activity.price, quantity: this.members().length, image: activity.image, details: vi ? `Phục vụ nhóm ${this.members().length} khách` : `Reserved for ${this.members().length} guests` });
    this.cart.addCombo(items);
    this.alert(vi ? '✓ Đã đồng bộ các lựa chọn hàng đầu của nhóm vào Giỏ hành lý!' : '✓ Syncing consensus group selections to Cart!');
    this.tab.set('checkout');
  }
}

@Component({
  selector: 'app-taxi-page',
  standalone: true,
  imports: [DecimalPipe, FormsModule, RouterLink, LucideCar, LucideInfo],
  template: `
    <div class="mx-auto max-w-4xl px-4 py-8 text-natural-text">
      <div class="mb-8 space-y-2 text-center">
        <span class="rounded-full bg-natural-accent px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">VIETCHARM TAXI & AIRPORT TRANSFER</span>
        <h2 class="font-serif text-3xl font-black uppercase text-stone-900">{{ i18n.isVi() ? 'ĐẶT XE TAXI & ĐƯA ĐÓN SÂN BAY' : 'AIRPORT TAXI & PRIVATE TRANSFER' }}</h2>
        <p class="mx-auto max-w-lg text-xs leading-relaxed text-stone-500">{{ i18n.isVi() ? 'Cổng tính phí tự động chuẩn xác theo km. Xe sạch sẽ, máy lạnh mát rượi, tài xế bản địa cực am hiểu Hội An và Đà Nẵng.' : 'Get instant exact distance calculations and flat-rate transparent billing with polite multilingual drivers.' }}</p>
      </div>

      @if (bookedMsg()) {
        <div class="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center text-xs font-bold text-emerald-800">✓ {{ i18n.isVi() ? 'Đã thêm dịch vụ đưa đón vào giỏ hàng! Vui lòng mở giỏ hàng để tiếp tục thanh toán.' : 'Taxi ride added to cart. Open your cart to continue checkout.' }}</div>
      }

      <div class="grid grid-cols-1 items-stretch gap-8 md:grid-cols-2">
        <form class="space-y-5 rounded-3xl border border-natural-border bg-white p-6 shadow-xs" (ngSubmit)="book()">
          <h3 class="flex items-center gap-1.5 border-b border-natural-border pb-2 font-serif text-base font-bold uppercase text-natural-accent"><svg lucideCar class="h-5 w-5 text-amber-500"></svg><span>{{ i18n.isVi() ? 'Thông tin lộ trình' : 'Route Details' }}</span></h3>
          <div class="space-y-4 text-xs">
            <div>
              <label class="mb-1 block font-bold uppercase text-stone-600">{{ i18n.isVi() ? 'Điểm Đón (Pick-up Location)' : 'Pick-up' }}</label>
              <select class="w-full rounded-xl border border-natural-border bg-natural-cream px-3 py-2.5 font-medium text-stone-800 outline-none" [ngModel]="pickup()" (ngModelChange)="pickup.set($event)" name="pickup">
                @for (l of locations; track l.id) { <option [value]="l.id">{{ l.name }}</option> }
              </select>
            </div>
            <div>
              <label class="mb-1 block font-bold uppercase text-stone-600">{{ i18n.isVi() ? 'Điểm Đến (Drop-off Location)' : 'Drop-off' }}</label>
              <select class="w-full rounded-xl border border-natural-border bg-natural-cream px-3 py-2.5 font-medium text-stone-800 outline-none" [ngModel]="dropoff()" (ngModelChange)="dropoff.set($event)" name="dropoff">
                @for (l of locations; track l.id) { <option [value]="l.id">{{ l.name }}</option> }
              </select>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div><label class="mb-1 block font-bold uppercase text-stone-600">{{ i18n.isVi() ? 'Ngày đưa đón' : 'Date' }}</label><input type="date" [min]="today" class="w-full rounded-xl border border-natural-border bg-natural-cream px-3 py-2 text-stone-800 outline-none" [ngModel]="bookingDate()" (ngModelChange)="bookingDate.set($event)" name="date" /></div>
              <div><label class="mb-1 block font-bold uppercase text-stone-600">{{ i18n.isVi() ? 'Giờ đón' : 'Time' }}</label><input type="time" class="w-full rounded-xl border border-natural-border bg-natural-cream px-3 py-2 text-stone-800 outline-none" [ngModel]="bookingTime()" (ngModelChange)="bookingTime.set($event)" name="time" required /></div>
            </div>
            <div>
              <label class="mb-1 block font-bold uppercase text-stone-600">{{ i18n.isVi() ? 'Chọn Loại Phương Tiện' : 'Vehicle Type' }}</label>
              <div class="grid grid-cols-3 gap-2">
                <button type="button" [class]="vehClass('vios-4')" (click)="vehicleType.set('vios-4')"><span class="block text-[11px] font-bold">{{ i18n.isVi() ? 'Xe 4 Chỗ' : '4-Seater' }}</span><span class="block text-[9px] opacity-85">12,000đ/km</span></button>
                <button type="button" [class]="vehClass('xpander-7')" (click)="vehicleType.set('xpander-7')"><span class="block text-[11px] font-bold">{{ i18n.isVi() ? 'Xe 7 Chỗ' : '7-Seater' }}</span><span class="block text-[9px] opacity-85">16,000đ/km</span></button>
                <button type="button" [class]="vehClass('sirius-moto')" (click)="vehicleType.set('sirius-moto')"><span class="block text-[11px] font-bold">{{ i18n.isVi() ? 'Xe ôm Sirius' : 'Sirius Moto' }}</span><span class="block text-[9px] opacity-85">6,000đ/km</span></button>
              </div>
            </div>
            <div>
              <label class="mb-1 block font-bold uppercase text-stone-600">{{ i18n.isVi() ? 'Ghi chú cho tài xế (VD: Sân bay ga quốc tế...)' : 'Driver Notes' }}</label>
              <input type="text" class="w-full rounded-xl border border-natural-border bg-natural-cream px-3 py-2 outline-none" [ngModel]="specialNote()" (ngModelChange)="specialNote.set($event)" name="note" placeholder="Ex: Đón tôi ở cột số 5, ga đến quốc nội Đà Nẵng..." />
            </div>
          </div>
          <button type="submit" [disabled]="pickup() === dropoff()" class="w-full rounded-xl bg-natural-gold py-3 text-xs font-black uppercase tracking-wider text-natural-text shadow-md transition hover:bg-natural-gold-dark disabled:opacity-50">{{ pickup() === dropoff() ? (i18n.isVi() ? 'Vui lòng chọn 2 điểm khác nhau' : 'Select different locations') : (i18n.isVi() ? 'Xác nhận đặt xe lữ hành' : 'Confirm & Add to Cart') }}</button>
        </form>

        <div class="flex flex-col justify-between rounded-3xl border border-natural-border bg-natural-beige p-6 shadow-xs">
          <div class="space-y-4">
            <h3 class="border-b border-natural-border pb-2 font-serif text-base font-bold uppercase text-stone-800">{{ i18n.isVi() ? 'Chi tiết chi phí & hành trình' : 'Dynamic Fare Indexing' }}</h3>
            <div class="space-y-3.5 text-xs">
              <div class="space-y-2 rounded-xl border border-stone-150 bg-white p-3">
                <div class="flex justify-between"><span class="font-semibold uppercase text-stone-500">{{ i18n.isVi() ? 'Quãng đường tối ưu:' : 'Route Distance:' }}</span><span class="font-black text-stone-800">{{ distance() }} km</span></div>
                <div class="flex justify-between"><span class="font-semibold uppercase text-stone-500">{{ i18n.isVi() ? 'Đơn giá loại xe:' : 'Fare Rate:' }}</span><span class="font-mono font-bold text-stone-800">{{ pricePerKm() | number : '1.0-0' }} đ / km</span></div>
                <div class="flex justify-between border-t border-stone-100 pt-2 font-bold text-stone-900"><span class="uppercase">{{ i18n.isVi() ? 'Cước xe ước tính:' : 'Base Subtotal:' }}</span><span>{{ totalCost() | number : '1.0-0' }} đ</span></div>
              </div>
              <div class="space-y-1.5 rounded-xl border border-dashed border-amber-300 bg-amber-50/50 p-3 text-[11px] leading-relaxed">
                <strong class="flex items-center gap-1 text-amber-800"><svg lucideInfo class="h-3.5 w-3.5"></svg>{{ i18n.isVi() ? 'ƯU ĐÃI KHÔNG PHỤ PHÍ' : 'FLAT-RATE PROTECTION' }}</strong>
                <p class="text-stone-600">{{ i18n.isVi() ? 'Giá trên là trọn gói đã bao gồm phí cầu đường BOT sân bay Đà Nẵng, cam kết không phát sinh bất kỳ chi phí ẩn nào khi di chuyển dọc đường.' : 'The rate listed is 100% flat-rate, including all regional highway tolls, airport gate tariffs and luggage protection.' }}</p>
              </div>
            </div>
          </div>
          <div class="mt-6 space-y-2 border-t border-natural-border pt-4 text-center text-xs">
            <p class="font-serif italic text-stone-500">{{ i18n.isVi() ? 'Tự động gán tài xế phản hồi nhanh trong 5 phút sau khi thanh toán.' : 'Guaranteed polite driver assigned within 5 mins of cart checkout.' }}</p>
            <a routerLink="/" class="font-bold text-natural-accent hover:underline">← {{ i18n.isVi() ? 'Quay về dạo chơi di sản' : 'Browse other experiences' }}</a>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class TaxiPageComponent {
  readonly locations = TOURIST_LOCATIONS;
  readonly today = new Date().toISOString().split('T')[0];
  readonly pickup = signal(TOURIST_LOCATIONS[0].id);
  readonly dropoff = signal(TOURIST_LOCATIONS[2].id);
  readonly vehicleType = signal<'vios-4' | 'xpander-7' | 'sirius-moto'>('vios-4');
  readonly bookingDate = signal(new Date().toISOString().split('T')[0]);
  readonly bookingTime = signal('14:00');
  readonly specialNote = signal('');
  readonly bookedMsg = signal(false);

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
      this.cart.openPayment();
      this.bookedMsg.set(true);
      setTimeout(() => this.bookedMsg.set(false), 3000);
    }, this.i18n.isVi() ? 'Đăng nhập để đặt và thanh toán.' : 'Sign in to book and pay.');
  }
}

@Component({
  selector: 'app-tours-page',
  standalone: true,
  imports: [DecimalPipe, LucideHeart, LucideStar],
  template: `
    <div class="py-8">
      <div class="mx-auto max-w-7xl space-y-10 px-4 text-natural-text">
        <div class="mx-auto max-w-2xl space-y-2 text-center">
          <span class="rounded-full bg-natural-gold px-3.5 py-1 text-[10px] font-black uppercase tracking-widest text-natural-text">EXCLUSIVE HERITAGE BUNDLES</span>
          <h2 class="font-serif text-3xl font-black uppercase text-stone-900">{{ i18n.isVi() ? 'ĐẶT COMBO TOUR DU LỊCH TIẾT KIỆM IPP' : 'SAVER HERITAGE TOUR COMBOS' }}</h2>
          <p class="text-xs leading-relaxed text-stone-500">{{ i18n.isVi() ? 'Kết hợp phòng nghỉ cao cấp, xe di chuyển riêng tư và vé tham quan di sản nổi bật với mức chiết khấu độc quyền lên đến 25% tổng hóa đơn.' : 'Unite premium hotel stays, private airport transfers, and verified attraction entries with absolute 25% bundling savings.' }}</p>
          <div class="flex items-center justify-center gap-3 pt-1" aria-hidden="true">
            <span class="h-px w-12 bg-gradient-to-r from-transparent to-natural-gold/70 sm:w-20"></span>
            <span class="relative flex h-3.5 w-3.5 items-center justify-center"><span class="absolute inset-0 rotate-45 rounded-[2px] border border-natural-gold/50"></span><span class="h-1.5 w-1.5 rotate-45 rounded-[1px] bg-natural-gold"></span></span>
            <span class="h-px w-12 bg-gradient-to-l from-transparent to-natural-gold/70 sm:w-20"></span>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
          @for (combo of combos; track combo.id) {
            <div class="group flex h-full cursor-pointer flex-col justify-between overflow-hidden rounded-3xl border border-natural-border bg-white shadow-xs transition duration-300 ease-out hover:-translate-y-1.5 hover:border-natural-gold/45 hover:shadow-luxe-lg" (click)="view(combo)">
              <div class="relative h-56 overflow-hidden">
                <img [src]="combo.image" [alt]="combo.name" class="h-full w-full object-cover transition duration-[600ms] ease-out group-hover:scale-110" />
                <button type="button" class="absolute left-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow-md transition hover:scale-110" [title]="i18n.isVi() ? 'Thêm vào yêu thích' : 'Add to favorites'" (click)="$event.stopPropagation(); ui.toggleFavorite(asItem(combo))">
                  <svg lucideHeart class="h-4 w-4 transition duration-200" [class.text-rose-600]="ui.isFavorite(combo.id)" [class.fill-rose-600]="ui.isFavorite(combo.id)" [class.text-stone-400]="!ui.isFavorite(combo.id)"></svg>
                </button>
                <div class="absolute right-3 top-3 flex items-center gap-1 rounded-xl border border-stone-200 bg-white/95 px-2.5 py-1 text-xs font-bold text-stone-800 shadow-sm backdrop-blur-md">
                  <svg lucideStar class="h-4 w-4 fill-amber-400 stroke-amber-400"></svg><span>{{ combo.rating }}</span>
                </div>
              </div>
              <div class="flex flex-1 flex-col justify-between space-y-5 p-5">
                <div class="space-y-3">
                  <div class="flex items-center justify-between">
                    <span class="block text-xs font-bold uppercase tracking-wider text-natural-accent">{{ combo.days }}</span>
                    <span class="text-xs text-stone-400 line-through">{{ combo.oldPrice | number : '1.0-0' }}đ</span>
                  </div>
                  <h3 class="line-clamp-2 min-h-[44px] font-serif text-base font-bold leading-snug text-stone-900">{{ combo.name }}</h3>
                  <ul class="space-y-1.5 border-t border-stone-100 pt-1 text-xs text-stone-600">
                    @for (inc of combo.includes; track inc) {
                      <li class="flex items-start gap-1.5 leading-relaxed"><span class="mt-0.5 font-bold text-emerald-600">✓</span><span>{{ inc }}</span></li>
                    }
                  </ul>
                </div>
                <div class="space-y-3 border-t border-stone-100 pt-3">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold uppercase text-stone-400">{{ i18n.isVi() ? 'Giá trọn gói' : 'Bundled Price' }}</span>
                    <strong class="font-serif text-xl font-black text-natural-accent">{{ combo.price | number : '1.0-0' }}đ <span class="font-sans text-[10px] text-stone-500">/{{ i18n.isVi() ? 'Khách' : 'Pax' }}</span></strong>
                  </div>
                  <button type="button" class="w-full rounded-xl bg-natural-accent py-3 text-xs font-black uppercase tracking-wider text-white transition hover:bg-natural-olive" (click)="$event.stopPropagation(); view(combo)">{{ i18n.isVi() ? 'ĐẶT COMBO NGAY' : 'BOOK BUNDLED PACKAGE' }}</button>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class ToursPageComponent {
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

type HandbookTab = 'history' | 'lantern' | 'culinary' | 'tips' | 'banahills' | 'hue_royal' | 'haivan_pass' | 'tailoring';

@Component({
  selector: 'app-handbook-page',
  standalone: true,
  imports: [],
  template: `
    <div class="py-8">
      <div class="mx-auto max-w-5xl space-y-8 rounded-3xl border border-natural-border bg-white px-4 py-8 text-natural-text shadow-xs">
        <div class="space-y-1.5 border-b border-stone-150 pb-6 text-center">
          <h2 class="font-serif text-2xl font-black uppercase tracking-tight text-stone-900 sm:text-3xl">📖 {{ i18n.isVi() ? 'CẨM NANG DU LỊCH & DI SẢN MIỀN TRUNG' : 'CENTRAL VIETNAM HERITAGE HANDBOOK' }}</h2>
          <p class="text-xs text-stone-500">{{ i18n.isVi() ? 'Mọi điều cần biết để hành trình dạo bước di sản của bạn trọn vẹn và an toàn nhất' : 'A beautifully crafted slow-travel guidebook for the modern heritage explorer' }}</p>
        </div>

        <div class="flex flex-wrap justify-center gap-2 border-b border-stone-100 pb-4">
          @for (tab of tabs(); track tab.id) {
            <button type="button" [class]="'rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition ' + (activeTab() === tab.id ? 'bg-natural-accent text-white shadow-xs' : 'bg-stone-50 text-stone-600 hover:bg-stone-100')" (click)="activeTab.set(tab.id)">{{ tab.label }}</button>
          }
        </div>

        <div class="grid grid-cols-1 items-center gap-8 pt-2 md:grid-cols-2">
          <div class="h-64 overflow-hidden rounded-2xl shadow-md sm:h-80">
            <img [src]="active().img" [alt]="active().title" class="h-full w-full object-cover" />
          </div>
          <div class="space-y-4">
            <h3 class="font-serif text-xl font-black leading-snug text-stone-900">{{ active().title }}</h3>
            <p class="text-xs leading-relaxed text-stone-600">{{ active().p1 }}</p>
            <p class="text-xs leading-relaxed text-stone-600">{{ active().p2 }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class HandbookPageComponent {
  readonly activeTab = signal<HandbookTab>('history');
  readonly active = computed(() => this.data()[this.activeTab()]);

  constructor(readonly i18n: I18nService) {}

  tabs(): Array<{ id: HandbookTab; label: string }> {
    const vi = this.i18n.isVi();
    return [
      { id: 'history', label: vi ? 'Lịch sử Hội An' : 'Hoi An Lore' },
      { id: 'lantern', label: vi ? 'Lễ rằm Sông Hoài' : 'Lantern Festival' },
      { id: 'culinary', label: vi ? 'Ẩm thực cổ truyền' : 'Culinary Arts' },
      { id: 'tips', label: vi ? 'Ứng xử Di sản' : 'Insider Tips' },
      { id: 'banahills', label: vi ? 'Sương mây Bà Nà' : 'Ba Na Hills' },
      { id: 'hue_royal', label: vi ? 'Nhã nhạc Ca Huế' : 'Royal Court' },
      { id: 'haivan_pass', label: vi ? 'Phượt Hải Vân' : 'Hai Van Pass' },
      { id: 'tailoring', label: vi ? 'May đo lấy liền' : 'Tailoring' },
    ];
  }

  private data(): Record<HandbookTab, { title: string; img: string; p1: string; p2: string }> {
    const vi = this.i18n.isVi();
    return {
      history: {
        title: vi ? 'Lịch sử thăng trầm của thương cảng Hội An' : 'Hoi An Historical Footprints',
        img: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&w=800&q=80',
        p1: vi ? 'Hội An, ban đầu là cảng biển Lâm Ấp của Vương quốc Champa cổ, từ thế kỷ XV đã vươn lên thành thương cảng quốc tế sầm uất bậc nhất Đông Nam Á của Đại Việt dưới thời chúa Nguyễn. Nơi đây từng là điểm neo đậu lý tưởng của các thuyền buôn từ Nhật Bản, Trung Hoa, Hà Lan, Bồ Đào Nha tìm kiếm hồ tiêu, gốm sứ và tơ lụa cao cấp.' : 'Originally a crucial maritime gateway for the ancient Champa Kingdom known as Lam Ap, Hoi An flourished into one of the busiest international trading ports in Southeast Asia from the 15th to the 19th centuries under the Nguyen Lords, serving merchants from Japan, China, and Europe.',
        p2: vi ? 'Nhờ sự chuyển hướng dòng chảy sông Thu Bồn đầu thế kỷ XIX, Hội An vô tình bị "bỏ quên" khỏi guồng quay đô thị hóa hiện đại. Chính sự cô lập địa lý đó đã giúp bảo tồn nguyên vẹn hơn 1000 ngôi nhà gỗ, đền đài, hội quán gia tộc mang đậm kiến trúc giao thoa đa văn hóa Việt - Nhật - Hoa độc nhất vô nhị.' : 'The silting of the Thu Bon river mouth in the early 19th century isolated the town from modern industrialization, preserving over 1,000 wooden heritage houses and assembly halls, leading to its declaration as a UNESCO World Heritage site.',
      },
      lantern: {
        title: vi ? 'Lễ hội Đèn lồng & Sắc đêm Sông Hoài' : 'Lantern Festival & Sông Hoài Romance',
        img: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
        p1: vi ? 'Nếu có dịp ghé thăm Hội An vào ngày 14 Âm lịch hàng tháng (Đêm rằm phố cổ), du khách sẽ lạc bước vào không gian thần tiên cổ tích khi toàn bộ khu phố cổ tắt hết ánh sáng đèn điện, nhường chỗ cho hàng ngàn cánh đèn lồng lụa vẽ chữ thư pháp rực rỡ sắc màu treo dọc mái ngói rêu phong.' : 'Held on the 14th day of every lunar month, the Lantern Festival sees the entire historic old town switch off all fluorescent lights, letting traditional silk lanterns illuminate the ancient houses in warm cosmic glows.',
        p2: vi ? 'Hãy lên một chiếc thuyền gỗ mộc mạc của các cô chú lái đò bên bờ sông Hoài, mua một chiếc đèn hoa đăng làm bằng giấy thủ công với ngọn nến nhỏ chỉ 10,000đ, thắp sáng điều ước lãng mạn của mình và thả trôi bồng bềnh xuôi theo dòng nước lung linh hư ảo.' : 'Take a gentle wooden boat ride on Sông Hoài river, buy handcrafted paper candle lanterns, and send your innermost wishes floating along the glittering river waters.',
      },
      culinary: {
        title: vi ? 'Tinh hoa Ẩm thực: Mì Quảng, Cao Lầu, Nước Mót' : 'Culinary Masterpieces: Cao Lau, My Quang & Mot',
        img: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80',
        p1: vi ? 'Cao Lầu không chỉ là một món ăn, mà là một lát cắt văn hóa lịch sử Hội An. Sợi mì có màu vàng đục, dai giòn sần sật đặc trưng nhờ được nhào trộn với nước giếng cổ Bá Lễ ngàn năm và tro rơm đốt từ cù lao Chàm, ăn kèm thịt xá xíu thái mỏng, tóp mỡ chiên giòn rụm và rau thơm Trà Quế nồng nàn.' : 'Cao Lau represents a physical slice of Hoi An culinary history. The thick noodles must be made with water from the thousand-year-old Ba Well and ash from Cham Island straw, producing an elastic chewiness served with roast pork and local greens.',
        p2: vi ? 'Bên cạnh đó, đừng quên nếm thử Mì Quảng đậm đà nước dùng, bánh mì Phượng lừng danh giòn rụm béo ngậy pate, và nhâm nhi một ly nước thảo mộc Mót mát lạnh được đun từ sả, chanh, cam thảo và trang trí bằng cánh sen lãng mạn.' : 'Additionally, make sure to experience a bowl of savory My Quang, a crispy Banh Mi Phượng with fatty liver pâté, and sip on a cup of herbal Mot tea infused with lemongrass, licorice, and fresh lotus petals.',
      },
      tips: {
        title: vi ? 'Kinh nghiệm dạo bước & Quy tắc ứng xử di sản' : 'Travel Etiquette & Local Insider Secrets',
        img: 'https://images.unsplash.com/photo-1596484552834-6a58bc238517?auto=format&fit=crop&w=800&q=80',
        p1: vi ? '1. Thời điểm lý tưởng: Buổi sáng sớm khoảng 6h - 8h là lúc phố cổ bình yên nhất, không ồn ào khói xe, rất thích hợp chụp những bức ảnh kiến trúc rêu phong thuần khiết. 2. Trang phục: Vui lòng mặc quần áo kín vai và quá đầu gối khi tham quan các ngôi nhà cổ, hội quán và Chùa Cầu để thể hiện sự tôn trọng tôn nghiêm.' : '1. Golden Hour: Wander the streets from 6 AM to 8 AM to enjoy serene, empty ancient lanes under fresh morning light. 2. Heritage Code: Ensure shoulders and knees are modestly covered when entering ancient family houses, shrines, and the historic Japanese Covered Bridge.',
        p2: vi ? '3. Vé tham quan: Hãy mua vé trọn gói tại quầy bán vé của phố cổ để ủng hộ quỹ trùng tu bảo tồn. Chỉ một chiếc vé nhỏ của bạn đã góp phần giữ gìn mái ngói Hội An sừng sững trước mưa bão miền Trung hàng năm.' : '3. Conservation Support: Purchasing official entrance tickets directly funds the local artisan renovation teams, protecting these fragile wooden buildings from seasonal typhoons.',
      },
      banahills: {
        title: vi ? 'Bà Nà Hills & Khám phá Làng Pháp trong sương mây' : 'Bà Nà Hills & French Village in Clouds',
        img: 'https://images.unsplash.com/photo-1583244532610-2a234e7c3ecd?auto=format&fit=crop&w=800&q=80',
        p1: vi ? 'Tọa lạc trên đỉnh núi Chúa hùng vĩ ở độ cao 1,487m, Bà Nà Hills tựa như một góc châu Âu cổ kính lơ lửng giữa mây ngàn. Khí hậu bốn mùa hội tụ trong cùng một ngày vô cùng mát mẻ sảng khoái kỳ vĩ.' : 'Perched on the majestic peak of Mount Chua at 1,487m, Ba Na Hills feels like a piece of vintage Europe floating among high mountain clouds. Experience four distinct seasons in a single day.',
        p2: vi ? 'Biểu tượng không thể bỏ lỡ chính là Cầu Vàng (Golden Bridge) lừng danh thế giới, nâng đỡ bởi đôi bàn tay khổng lồ rêu phong vươn ra từ vách đá cheo leo, tạo nên địa điểm check-in tuyệt mỹ của mọi hành trình.' : 'The must-see highlight is the world-renowned Golden Bridge, supported by two mossy stone giant hands stretching from steep cliffs. It serves as an ultimate scenic checkpoint.',
      },
      hue_royal: {
        title: vi ? 'Nhã nhạc Cung đình Huế: Bản hòa ca vương giả hoàng gia' : 'Hue Royal Court Music: Imperial Harmonies',
        img: 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=800&q=80',
        p1: vi ? 'Được UNESCO vinh danh là Kiệt tác di sản truyền khẩu và phi vật thể của nhân loại, Nhã nhạc Cung đình Huế là dòng nhạc chính thống quý phái của triều đình phong kiến nhà Nguyễn xưa tấu bởi dàn nhạc nhạc cụ cổ truyền tinh xảo.' : 'Inscribed by UNESCO as a Masterpiece of the Oral and Intangible Heritage of Humanity, Nhã nhạc represents the noble, formal court music of the historic Nguyen Dynasty, played with traditional wind, string, and percussion instruments.',
        p2: vi ? 'Hãy lên những chiếc thuyền rồng trôi êm đềm trên dòng sông Hương khi hoàng hôn buông xuống, thả đèn hoa đăng lung linh cầu an lành và thưởng thức những làn điệu dân ca ngọt ngào say đắm lòng người.' : 'Board a colorful dragon boat drifting gently on the Perfume River at dusk, light up candle-lit paper lanterns, and listen to these royal and traditional folk melodies.',
      },
      haivan_pass: {
        title: vi ? 'Kinh nghiệm phượt Đèo Hải Vân bằng xe máy an toàn' : 'Hai Van Pass Scooter Adventure Guide',
        img: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=800&q=80',
        p1: vi ? 'Được mô tả là một trong những con đường ven biển hiểm trở đẹp nhất thế giới, đèo Hải Vân uốn lượn uốn khúc dài 21km ôm trọn eo biển lộng gió hùng vĩ mây phủ bồng bềnh tuyệt đẹp.' : 'Hailed as one of the best coastal roads in the world, the 21km winding road over Hai Van Pass offers sweeping ocean panoramas and is best explored on two wheels for ultimate freedom.',
        p2: vi ? 'Mẹo an toàn: Hãy thuê xe máy số hoặc xe côn tay mạnh mẽ, kiểm tra phanh kỹ trước khi leo đèo. Đi chậm ở khúc cua tay áo, tránh phượt lúc trời mưa và dừng chân thưởng thức cà phê ở đỉnh đèo Hải Vân Quan.' : 'Safety Guide: Choose a reliable manual bike with serviced brakes. Ride slow around blind hairpin curves, avoid foggy rainy days, and stop at the historic gate "Hải Vân Quan" for photos.',
      },
      tailoring: {
        title: vi ? 'Nghệ thuật may đo "nóng" lấy liền Hội An nức tiếng' : 'The Art of Hoi An Express Custom Tailoring',
        img: 'https://images.unsplash.com/photo-1596484552834-6a58bc238517?auto=format&fit=crop&w=800&q=80',
        p1: vi ? 'Hội An nổi tiếng thế giới với dịch vụ may đo váy áo, comple lấy nhanh siêu tốc chỉ trong vài tiếng đồng hồ vừa vặn hoàn hảo, chế tác thủ công tinh xảo dưới bàn tay tài hoa của thợ may bản địa.' : 'Hoi An is internationally celebrated for its speed-tailoring shops that craft bespoke dresses, suits, and traditional Ao Dai within just a few hours. Master tailors deliver perfect fits.',
        p2: vi ? 'Kinh nghiệm: Hãy chọn mẫu thiết kế ưa thích trước, chọn chất liệu vải lụa tơ tằm mềm mịn. Thực hiện lấy số đo vào buổi sáng và bạn có thể nhận bộ trang phục lộng lẫy ngay vào buổi chiều cùng ngày.' : 'Pro-tip: Browse styles beforehand, select high-grade mulberry silk, take measurements in the morning, and enjoy a final fitting on the very same afternoon!',
      },
    };
  }
}

@Component({
  selector: 'app-partnership-page',
  standalone: true,
  imports: [FormsModule, LucideClipboardList, LucideInfo],
  template: `
    <div class="mx-auto max-w-4xl space-y-8 px-4 py-8 text-natural-text">
      <div class="space-y-2 text-center">
        <span class="rounded-full bg-natural-accent px-3.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white">VIETCHARM MERCHANDISE NETWORK</span>
        <h2 class="font-serif text-3xl font-black uppercase text-stone-900">{{ i18n.isVi() ? 'ĐĂNG KÝ HỢP TÁC KINH DOANH LỮ HÀNH' : 'REGISTER LOCAL PARTNERSHIP & ALLIANCE' }}</h2>
        <p class="mx-auto max-w-lg text-xs leading-relaxed text-stone-500">{{ i18n.isVi() ? 'Liên kết khách sạn của bạn, đội xe taxi, hoặc các làng nghề thủ công để cùng VietCharm xây dựng hệ sinh thái di sản bền vững.' : 'Integrate your hotels, taxi transfer fleets, or handcrafted workshops into our unified sustainable portal.' }}</p>
      </div>

      @if (submittedCode(); as code) {
        <div class="space-y-2 rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50 p-5 text-center text-xs text-emerald-800">
          <p class="text-sm font-bold">🎉 {{ i18n.isVi() ? 'Đăng ký đề xuất hợp tác thành công!' : 'Partnership Submission Success!' }}</p>
          <p>{{ i18n.isVi() ? 'Hồ sơ đã được gửi đến Bộ phận Quản trị VietCharm.' : 'Your request has been sent to the VietCharm review team.' }}</p>
          <p class="font-mono font-black text-stone-800">{{ i18n.isVi() ? 'Mã số hồ sơ theo dõi:' : 'Application Tracking Code:' }} {{ code }}</p>
          <p class="text-[10px] italic text-stone-500">{{ i18n.isVi() ? 'Bạn có thể xem trạng thái xét duyệt trực tiếp tại Hồ sơ cá nhân của mình hoặc liên hệ Hotline.' : 'Monitor application status live in your Profile.' }}</p>
        </div>
      }

      <div class="grid grid-cols-1 items-stretch gap-8 md:grid-cols-3">
        <form class="space-y-4 rounded-3xl border border-natural-border bg-white p-6 text-xs shadow-xs md:col-span-2" (ngSubmit)="submit()">
          <h3 class="flex items-center gap-1.5 border-b border-natural-border pb-2 font-serif text-base font-bold uppercase text-stone-800"><svg lucideClipboardList class="h-5 w-5 text-amber-500"></svg><span>{{ i18n.isVi() ? 'Đơn Đăng Ký Đối Tác' : 'Partnership Form' }}</span></h3>
          <div class="grid grid-cols-2 gap-3">
            <div><label class="mb-1 block font-bold uppercase text-stone-600">{{ i18n.isVi() ? 'Tên Đơn vị / Thương hiệu' : 'Brand/Company Name' }}</label><input type="text" class="pf-input" [ngModel]="brandName()" (ngModelChange)="brandName.set($event)" name="brand" placeholder="Ex: Đò gỗ Sông Hoài Lan" required /></div>
            <div><label class="mb-1 block font-bold uppercase text-stone-600">{{ i18n.isVi() ? 'Người đại diện liên hệ' : 'Contact Person' }}</label><input type="text" class="pf-input" [ngModel]="contactName()" (ngModelChange)="contactName.set($event)" name="contact" placeholder="Ex: Nguyễn Văn A" required /></div>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <div><label class="mb-1 block font-bold uppercase text-stone-600">{{ i18n.isVi() ? 'Lĩnh vực hợp tác' : 'Service Domain' }}</label>
              <select class="pf-input font-bold" [ngModel]="type()" (ngModelChange)="type.set($event)" name="type">
                <option value="hotel">{{ i18n.isVi() ? 'Lưu trú / Khách sạn' : 'Hotel Stay' }}</option>
                <option value="vehicle">{{ i18n.isVi() ? 'Cho thuê xe máy, ô tô tự lái' : 'Vehicle Rentals & Cars' }}</option>
                <option value="taxi">{{ i18n.isVi() ? 'Vận chuyển / Taxi đưa đón' : 'Taxi & Transfer' }}</option>
                <option value="experience">{{ i18n.isVi() ? 'Vui chơi / Hoạt động / Tour' : 'Experiences & Tours' }}</option>
                <option value="artisan">{{ i18n.isVi() ? 'Làng nghề / Thủ công mỹ nghệ' : 'Artisan Workshop' }}</option>
                <option value="guide">{{ i18n.isVi() ? 'Hướng dẫn viên du lịch' : 'Tour Guide' }}</option>
              </select>
            </div>
            <div><label class="mb-1 block font-bold uppercase text-stone-600">{{ i18n.isVi() ? 'Số điện thoại liên hệ' : 'Phone' }}</label><input type="tel" class="pf-input" [ngModel]="phone()" (ngModelChange)="phone.set($event)" name="phone" placeholder="Ex: 0905000000" required /></div>
            <div><label class="mb-1 block font-bold uppercase text-stone-600">{{ i18n.isVi() ? 'Địa chỉ Email chính thức' : 'Email' }}</label><input type="email" class="pf-input" [ngModel]="email()" (ngModelChange)="email.set($event)" name="email" placeholder="Ex: partner@brand.com" required /></div>
          </div>
          <div><label class="mb-1 block font-bold uppercase text-stone-600">{{ i18n.isVi() ? 'Mô tả ngắn gọn Đề xuất / Năng lực dịch vụ' : 'Proposal details' }}</label><textarea rows="4" class="pf-input" [ngModel]="description()" (ngModelChange)="description.set($event)" name="description" placeholder="Ex: Chúng tôi cung cấp 15 chiếc xe máy Sirius mới cáu sọc đỏ đen..." required></textarea></div>
          <button type="submit" class="w-full rounded-xl bg-natural-accent py-3 font-bold uppercase tracking-wider text-white shadow-md transition hover:bg-natural-olive">{{ i18n.isVi() ? 'ĐỆ TRÌNH HỒ SƠ HỢP TÁC' : 'SUBMIT PROPOSAL' }}</button>
        </form>

        <div class="flex flex-col justify-between space-y-5 rounded-3xl border border-natural-border bg-natural-cream p-6 text-xs">
          <div class="space-y-4">
            <h4 class="border-b border-natural-border pb-2 font-serif text-sm font-bold uppercase text-natural-accent">{{ i18n.isVi() ? 'Đặc quyền đối tác VietCharm' : 'Merchant Alliance Benefits' }}</h4>
            <div class="space-y-3 leading-relaxed">
              <div class="flex gap-2"><span class="font-black text-amber-500">✦</span><p><strong>{{ i18n.isVi() ? 'Quảng bá không biên giới:' : 'Global Visibility:' }}</strong> {{ i18n.isVi() ? 'Tiếp cận hàng chục ngàn lượt khách du lịch tìm lịch trình AI của VietCharm hàng tháng.' : 'Showcase your local catalog to tech-forward tourists.' }}</p></div>
              <div class="flex gap-2"><span class="font-black text-amber-500">✦</span><p><strong>{{ i18n.isVi() ? 'Phí chiết khấu cực thấp:' : 'Low Commission:' }}</strong> {{ i18n.isVi() ? 'VietCharm duy trì mức phí sàn chỉ 5-8% hỗ trợ bà con và doanh nghiệp phát triển bền vững.' : 'We cap platform fees at only 5-8% to support regional communities.' }}</p></div>
              <div class="flex gap-2"><span class="font-black text-amber-500">✦</span><p><strong>{{ i18n.isVi() ? 'Công cụ Quản trị thông minh:' : 'Sleek Dashboard:' }}</strong> {{ i18n.isVi() ? 'Hệ thống tự động đồng bộ đơn đặt chỗ, thông báo thẻ vé thời gian thực chuẩn xác.' : 'Get instant digital orders with direct verification screens.' }}</p></div>
            </div>
          </div>
          <div class="rounded-xl border border-amber-200 bg-amber-50/50 p-3">
            <p class="flex items-center gap-1 font-semibold text-natural-accent"><svg lucideInfo class="h-3.5 w-3.5 text-amber-500"></svg>{{ i18n.isVi() ? 'Cam kết bảo mật:' : 'Data Privacy:' }}</p>
            <p class="mt-1 leading-snug text-stone-500">{{ i18n.isVi() ? 'Mọi thông tin liên hệ và giấy phép được VietCharm bảo mật tối mật theo quy định lữ hành.' : 'Your submission remains strictly confidential.' }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `.pf-input { width: 100%; border-radius: 0.75rem; border: 1px solid var(--color-natural-border); background: var(--color-natural-cream); padding: 0.5rem 0.75rem; outline: none; } .pf-input:focus { box-shadow: 0 0 0 1px var(--color-natural-accent); }`,
  ],
})
export class PartnershipPageComponent {
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

  submit(): void {
    if (!this.brandName().trim() || !this.contactName().trim()) return;
    const trackingId = `VC-PARTNER-${1000 + Math.floor(Math.random() * 8999)}`;
    this.catalog.addApplication({
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
