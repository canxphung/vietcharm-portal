import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  LucideAlertCircle,
  LucideArrowLeft,
  LucideArrowRight,
  LucideArrowUpDown,
  LucideCalendarDays,
  LucideChevronDown,
  LucideCompass,
  LucideHeart,
  LucideHotel,
  LucideMap,
  LucideMapPin,
  LucideMapPinned,
  LucideMessageSquare,
  LucideNavigation,
  LucideSearch,
  LucideShieldCheck,
  LucideSlidersHorizontal,
  LucideSparkles,
  LucideStar,
  LucideUsersRound,
  LucideX,
} from '@lucide/angular';
import { ToastService } from '@/services/toast.service';
import { provinces } from '@/data';
import type { ServiceTab } from '@/constants/views';
import type { ViewableItem } from '@/types';
import { I18nService } from '@/services/i18n.service';
import { UiStateService } from '@/services/ui-state.service';
import { allCatalogItems, allProvinceItems, itemsForTab, provinceById } from '@/services/catalog-data';
import { ItemCardComponent } from '@/components/item-card.component';
import { JourneyMapComponent } from '@/components/journey-map.component';
import { RevealDirective } from '@/components/reveal.directive';

const SERVICE_TABS: Array<{ id: ServiceTab; vi: string; en: string }> = [
  { id: 'attractions', vi: 'Điểm đến', en: 'Attractions' },
  { id: 'hotels', vi: 'Lưu trú', en: 'Hotels' },
  { id: 'vehicles', vi: 'Phương tiện', en: 'Vehicles' },
  { id: 'activities', vi: 'Trải nghiệm', en: 'Activities' },
];

function isServiceTab(value: string | null | undefined): value is ServiceTab {
  return value === 'attractions' || value === 'hotels' || value === 'vehicles' || value === 'activities';
}

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    RouterLink,
    JourneyMapComponent,
    RevealDirective,
    LucideAlertCircle,
    LucideArrowRight,
    LucideCalendarDays,
    LucideChevronDown,
    LucideCompass,
    LucideHotel,
    LucideMap,
    LucideMapPinned,
    LucideShieldCheck,
    LucideSparkles,
    LucideUsersRound,
  ],
  template: `
    <section class="grain-overlay relative min-h-[calc(100svh-64px)] overflow-hidden bg-stone-950 text-white">
      <!-- Cinematic Ken Burns backdrop -->
      <img
        [src]="heroImage"
        [alt]="i18n.isVi() ? 'Phố cổ Hội An lúc hoàng hôn' : 'Hoi An ancient town at sunset'"
        class="animate-kenburns absolute inset-0 h-full w-full object-cover"
      />

      <!-- Layered depth: left-anchored darkness, warm gold floor, and a vignette -->
      <div class="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-black/10"></div>
      <div class="absolute inset-0 bg-[radial-gradient(120%_90%_at_15%_30%,transparent_30%,rgba(0,0,0,0.55)_100%)]"></div>
      <div class="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-natural-bg via-natural-bg/35 to-transparent"></div>
      <div class="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-[radial-gradient(80%_100%_at_30%_120%,rgba(227,176,75,0.22),transparent_70%)]"></div>

      <!-- Ambient gold motes drifting in the dark zone -->
      <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <span class="animate-float-soft absolute left-[12%] top-[28%] h-2 w-2 rounded-full bg-natural-gold/60 blur-[1px]"></span>
        <span class="animate-float-soft absolute left-[26%] top-[62%] h-1.5 w-1.5 rounded-full bg-natural-gold/40 blur-[1px] [animation-delay:1.5s]"></span>
        <span class="animate-float-soft absolute left-[8%] top-[48%] h-1 w-1 rounded-full bg-white/50 [animation-delay:3s]"></span>
        <span class="animate-float-soft absolute right-[22%] top-[20%] h-1.5 w-1.5 rounded-full bg-natural-gold/35 blur-[1px] [animation-delay:2.2s]"></span>
      </div>

      <div class="hero-stagger relative mx-auto flex min-h-[calc(100svh-64px)] max-w-7xl flex-col justify-center px-4 py-16 md:px-8">
        <div class="max-w-3xl">
          <span
            class="inline-flex items-center gap-2 rounded-full border border-natural-gold/30 bg-white/10 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.24em] text-natural-gold shadow-[0_0_30px_-8px_rgba(227,176,75,0.6)] backdrop-blur-md"
          >
            <span class="relative flex h-1.5 w-1.5">
              <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-natural-gold opacity-75"></span>
              <span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-natural-gold"></span>
            </span>
            {{ i18n.isVi() ? 'Du lịch Việt Nam theo từng vùng' : 'Vietnam travel by region' }}
          </span>

          <h1 class="mt-6 max-w-4xl font-serif text-4xl font-black leading-[0.98] tracking-tight md:text-6xl lg:text-7xl">
            @if (i18n.isVi()) {
              Khám phá Việt Nam theo vùng, theo gu, <span class="text-gold-gradient">theo nhịp của bạn.</span>
            } @else {
              Explore Vietnam by region, mood, and <span class="text-gold-gradient">your own pace.</span>
            }
          </h1>

          <p class="mt-5 max-w-2xl text-sm leading-relaxed text-white/82 md:text-base">
            {{ i18n.isVi()
              ? 'VietCharm gom điểm đến, nơi ở, xe, hoạt động và lịch trình AI vào một flow đặt chuyến. Khu vực phục vụ đang được mở rộng dần, với trải nghiệm thiết kế cho cả bản đồ Việt Nam.'
              : 'VietCharm brings destinations, stays, rides, experiences, and AI itineraries into one trip flow. Coverage keeps expanding across regions, with an experience designed for the full Vietnam map.' }}
          </p>

          <div class="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              routerLink="/discover"
              class="btn-sheen inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-natural-gold-deep px-6 text-sm font-black text-natural-ink shadow-[0_12px_40px_-10px_rgba(227,176,75,0.65)] transition hover:brightness-105"
            >
              <svg lucideCompass class="h-4 w-4"></svg>
              <span>{{ i18n.isVi() ? 'Xem vùng đang có dữ liệu' : 'Browse available regions' }}</span>
              <svg lucideArrowRight class="h-4 w-4"></svg>
            </a>
            <a
              routerLink="/blind-travel"
              class="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/25 bg-white/12 px-6 text-sm font-black text-white backdrop-blur transition hover:bg-white/20"
            >
              <svg lucideSparkles class="h-4 w-4"></svg>
              <span>{{ i18n.isVi() ? 'Để AI gợi ý chuyến đi' : 'Let AI suggest a trip' }}</span>
            </a>
          </div>
        </div>

        <div class="mt-10 grid max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
          @for (stat of stats; track stat.label) {
            <div
              class="group rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-natural-gold/40 hover:bg-white/15"
            >
              @switch (stat.icon) {
                @case ('calendar') { <svg lucideCalendarDays class="mb-2 h-4 w-4 text-natural-gold transition-transform duration-300 group-hover:scale-110"></svg> }
                @case ('hotel') { <svg lucideHotel class="mb-2 h-4 w-4 text-natural-gold transition-transform duration-300 group-hover:scale-110"></svg> }
                @case ('map') { <svg lucideMapPinned class="mb-2 h-4 w-4 text-natural-gold transition-transform duration-300 group-hover:scale-110"></svg> }
                @case ('users') { <svg lucideUsersRound class="mb-2 h-4 w-4 text-natural-gold transition-transform duration-300 group-hover:scale-110"></svg> }
              }
              <p class="font-mono text-lg font-black text-white">{{ i18n.isVi() ? stat.valueVi : stat.valueEn }}</p>
              <p class="text-[10px] font-bold uppercase tracking-wider text-white/62">{{ i18n.isVi() ? stat.labelVi : stat.labelEn }}</p>
            </div>
          }
        </div>

        <button
          type="button"
          routerLink="/trip-room"
          class="mt-6 inline-flex w-fit items-center gap-2 text-xs font-black uppercase tracking-wider text-white/70 transition hover:text-natural-gold"
        >
          <svg lucideUsersRound class="h-4 w-4"></svg>
          <span>{{ i18n.isVi() ? 'Đi nhóm? Mở Trip Room để cùng chốt lịch' : 'Traveling as a group? Open Trip Room' }}</span>
        </button>
      </div>

      <!-- Scroll-to-explore cue -->
      <div class="pointer-events-none absolute inset-x-0 bottom-5 z-10 flex flex-col items-center gap-1 text-white/70">
        <span class="text-[9px] font-bold uppercase tracking-[0.3em]">{{ i18n.isVi() ? 'Cuộn để khám phá' : 'Scroll to explore' }}</span>
        <svg lucideChevronDown class="animate-scroll-cue h-4 w-4 text-natural-gold"></svg>
      </div>
    </section>

    <!-- Regional route ideas -->
    <app-journey-map reveal />

    <!-- Region selector -->
    <div class="w-full bg-natural-bg px-4 pb-16 pt-4">
      <div class="mx-auto max-w-7xl text-center">
        <div reveal class="mb-12">
          <span class="rounded-full border border-natural-border bg-natural-beige px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-natural-accent">{{ i18n.dictionary().selectRegion }}</span>
          <h2 class="mx-auto mt-6 max-w-4xl font-serif text-3xl font-bold leading-tight tracking-tight text-natural-text md:text-5xl">{{ i18n.isVi() ? 'Chọn vùng, rồi để VietCharm gom lịch trình cho bạn.' : 'Pick a region, then let VietCharm shape the trip.' }}</h2>
          <p class="mx-auto mt-4 max-w-2xl text-sm text-natural-text/80 md:text-base">{{ i18n.isVi() ? 'Mỗi vùng có một nhịp đi riêng. VietCharm giữ cấu trúc Bắc, Trung, Nam ngang nhau; dữ liệu đặt dịch vụ sẽ được mở dần theo từng cụm điểm đến.' : 'Every region has its own travel rhythm. VietCharm keeps North, Central, and South equally visible while service data opens destination by destination.' }}</p>
          <div class="mt-7 flex items-center justify-center gap-3" aria-hidden="true">
            <span class="h-px w-12 bg-gradient-to-r from-transparent to-natural-gold/70 sm:w-20"></span>
            <span class="relative flex h-3.5 w-3.5 items-center justify-center">
              <span class="absolute inset-0 rotate-45 rounded-[2px] border border-natural-gold/50"></span>
              <span class="h-1.5 w-1.5 rotate-45 rounded-[1px] bg-natural-gold"></span>
            </span>
            <span class="h-px w-12 bg-gradient-to-l from-transparent to-natural-gold/70 sm:w-20"></span>
          </div>
        </div>

        <!-- Region cards -->
        <div reveal class="mx-auto mt-6 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
          <!-- North -->
          <button type="button" class="group relative h-[360px] cursor-pointer overflow-hidden rounded-2xl border border-natural-border text-left shadow-xl" (click)="openRegion('north')">
            <div class="absolute inset-0 z-10 bg-black/45 transition-all duration-300 group-hover:bg-black/35"></div>
            <img src="https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80" alt="Miền Bắc" class="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div class="absolute left-4 top-4 z-20 rounded-full border border-natural-border/20 bg-natural-olive/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-xs">{{ i18n.isVi() ? 'Đang bổ sung' : 'Adding data' }}</div>
            <div class="absolute inset-x-0 bottom-0 z-20 flex flex-col justify-end p-6 text-white">
              <span class="text-xs font-semibold uppercase text-natural-accent-light">{{ i18n.isVi() ? 'Hà Nội - Hạ Long - Sa Pa' : 'Hanoi - Halong - Sapa' }}</span>
              <h3 class="mt-1 font-serif text-2xl font-bold tracking-tight">{{ i18n.dictionary().north }}</h3>
              <p class="mt-2 line-clamp-2 text-xs leading-relaxed text-stone-200">{{ i18n.isVi() ? 'Văn hiến nghìn năm, núi rừng Tây Bắc và vịnh biển phía Bắc trong cùng một khung lập lịch trình.' : 'Ancient capitals, northern mountains, and bay routes in the same itinerary framework.' }}</p>
              <div class="mt-4 flex items-center gap-1.5 text-xs font-bold text-natural-gold group-hover:text-white"><span>{{ i18n.isVi() ? 'Xem trước vùng' : 'Preview region' }}</span><svg lucideArrowRight class="h-4 w-4 transition group-hover:translate-x-1"></svg></div>
            </div>
          </button>

          <!-- Central -->
          <button type="button" class="group relative h-[360px] cursor-pointer overflow-hidden rounded-2xl border border-natural-gold text-left shadow-xl" (click)="ui.selectProvince('quang-nam')">
            <div class="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-black/45 to-black/10 transition-all duration-300 group-hover:bg-black/35"></div>
            <img src="https://images.unsplash.com/photo-1676019556644-25abbce12a58?auto=format&fit=crop&w=800&q=80" alt="Miền Trung" class="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
            <div class="absolute left-4 top-4 z-20 rounded-full border border-white/20 bg-natural-gold px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-natural-text">{{ i18n.isVi() ? 'Đang mở đặt dịch vụ' : 'Now bookable' }}</div>
            <div class="absolute inset-x-0 bottom-0 z-20 flex flex-col justify-end p-6 text-white">
              <span class="text-xs font-bold uppercase text-natural-gold">{{ i18n.isVi() ? 'Hội An - Đà Nẵng - Huế' : 'Hoi An - Danang - Hue' }}</span>
              <h3 class="mt-1 font-serif text-2xl font-bold tracking-tight">{{ i18n.dictionary().central }}</h3>
              <p class="mt-2 line-clamp-2 text-xs leading-relaxed text-stone-200">{{ i18n.isVi() ? 'Phố cổ, biển và cố đô — đặt tour, lưu trú, thuê xe và lên lịch trình trong một flow liền mạch.' : 'Ancient towns, beaches, and imperial cities — book tours, stays, rides, and itineraries in one seamless flow.' }}</p>
              <div class="mt-4 flex items-center gap-1.5 text-xs font-bold text-natural-gold group-hover:text-white"><span>{{ i18n.isVi() ? 'Xem dịch vụ đang có' : 'View available services' }}</span><svg lucideArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-1"></svg></div>
            </div>
          </button>

          <!-- South -->
          <button type="button" class="group relative h-[360px] cursor-pointer overflow-hidden rounded-2xl border border-natural-border text-left shadow-xl" (click)="openRegion('south')">
            <div class="absolute inset-0 z-10 bg-black/45 transition-all duration-300 group-hover:bg-black/35"></div>
            <img src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80" alt="Miền Nam" class="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div class="absolute left-4 top-4 z-20 rounded-full border border-natural-border/20 bg-natural-olive/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-xs">{{ i18n.isVi() ? 'Đang bổ sung' : 'Adding data' }}</div>
            <div class="absolute inset-x-0 bottom-0 z-20 flex flex-col justify-end p-6 text-white">
              <span class="text-xs font-semibold uppercase text-natural-accent-light">{{ i18n.isVi() ? 'Sài Gòn - Miền Tây - Phú Quốc' : 'Saigon - Mekong - Phu Quoc' }}</span>
              <h3 class="mt-1 font-serif text-2xl font-bold tracking-tight">{{ i18n.dictionary().south }}</h3>
              <p class="mt-2 line-clamp-2 text-xs leading-relaxed text-stone-200">{{ i18n.isVi() ? 'Sài Gòn năng động, sông nước miền Tây và đảo biển phía Nam cho những chuyến đi nhiều sắc thái.' : 'Saigon energy, Mekong waterways, and southern island resets for varied trip styles.' }}</p>
              <div class="mt-4 flex items-center gap-1.5 text-xs font-bold text-natural-gold group-hover:text-white"><span>{{ i18n.isVi() ? 'Xem trước vùng' : 'Preview region' }}</span><svg lucideArrowRight class="h-4 w-4 transition group-hover:translate-x-1"></svg></div>
            </div>
          </button>
        </div>

        <!-- Gen Z features banner -->
        <div reveal class="mx-auto mt-16 max-w-5xl">
          <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div class="group relative flex flex-col justify-between gap-6 overflow-hidden rounded-3xl border-2 border-natural-accent/20 bg-white p-6 transition-all duration-300 hover:shadow-xl">
              <div class="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-full bg-natural-accent/5 blur-xl"></div>
              <div class="space-y-3 text-left">
                <span class="inline-block rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-emerald-800">👥 {{ i18n.isVi() ? 'TRIP ROOM: PHÒNG LẬP KẾ HOẠCH NHÓM' : 'TRIP ROOM: GROUP PLANNER' }}</span>
                <h4 class="font-serif text-xl font-black text-natural-text">{{ i18n.isVi() ? 'Trip Room – Phòng Lập Kế Hoạch Đồng Thuận' : 'Trip Room – Group Co-Planning Oasis' }}</h4>
                <p class="text-xs leading-relaxed text-natural-text/80">{{ i18n.isVi() ? 'Đi nhóm thường mệt vì tự quyết không đồng lòng, hay đổi lịch và nhập nhèm thanh toán. Trip Room cho phép gửi link mời, mọi người đề xuất sở thích, cùng vote cho khách sạn/ăn uống, và hiển thị hóa đơn thanh toán minh bạch.' : 'Collaboratively vote on hotels, dining, and custom tour structures. Set your specific preferences, cast votes, and track individual split bills transparently.' }}</p>
              </div>
              <a routerLink="/trip-room" class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-natural-accent px-5 py-2.5 font-serif text-xs font-black text-white transition hover:bg-natural-olive"><span>{{ i18n.isVi() ? 'Vào phòng lập kế hoạch' : 'Enter Trip Room' }}</span><svg lucideArrowRight class="h-4 w-4"></svg></a>
            </div>

            <div class="group relative flex flex-col justify-between gap-6 overflow-hidden rounded-3xl border-2 border-natural-gold/20 bg-white p-6 transition-all duration-300 hover:shadow-xl">
              <div class="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-full bg-natural-gold/5 blur-xl"></div>
              <div class="space-y-3 text-left">
                <span class="inline-block rounded-full border border-amber-200 bg-amber-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-amber-800">🔮 {{ i18n.isVi() ? 'BLIND TRAVEL: TRẢI NGHIỆM ẨN SỐ' : 'BLIND TRAVEL: SURPRISE ADVENTURE' }}</span>
                <h4 class="font-serif text-xl font-black text-natural-text">{{ i18n.isVi() ? 'Blind Travel – Hành Trình Ẩn Số Độc Bản' : 'Blind Travel – Unbox Secret Getaways' }}</h4>
                <p class="text-xs leading-relaxed text-natural-text/80">{{ i18n.isVi() ? 'Bỏ qua áp lực đau đầu so sánh giá và lên lịch trình. Chỉ nhập ngân sách, số ngày nghỉ và gu du lịch, hệ thống AI sẽ tự động đặt mọi thứ. Bạn sẽ không biết mình đi đâu cho đến khi ra sân bay (nhận gợi ý chuẩn bị trang phục trước 3 ngày)!' : 'Ditch the exhaustive schedules. Choose your budget, days and vibes. The AI reserves everything automatically and seals the final oracle destination card until you arrive at the airport!' }}</p>
              </div>
              <a routerLink="/blind-travel" class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-natural-gold px-5 py-2.5 font-serif text-xs font-black text-natural-ink transition hover:bg-natural-gold-dark"><span>{{ i18n.isVi() ? 'Khám phá hành trình ẩn số' : 'Explore Blind Travel' }}</span><svg lucideArrowRight class="h-4 w-4"></svg></a>
            </div>
          </div>
        </div>

        <!-- Trust statement -->
        <div reveal class="mx-auto mt-16 flex max-w-3xl flex-wrap items-center justify-center gap-6 rounded-2xl border border-natural-border bg-natural-beige px-5 py-4 text-xs font-medium text-natural-text">
          <div class="flex items-center gap-1.5"><svg lucideShieldCheck class="h-5 w-5 text-natural-accent"></svg><span>{{ i18n.isVi() ? 'Đặt chỗ rõ ràng, xác nhận nhanh' : 'Clear booking with quick confirmation' }}</span></div>
          <span class="hidden text-natural-border sm:inline">|</span>
          <div class="flex items-center gap-1.5"><svg lucideMap class="h-5 w-5 text-natural-accent"></svg><span>{{ i18n.isVi() ? 'Kết nối Du lịch Định vị Thời gian Thực' : 'Real-time GPS Integrated Navigation Guides' }}</span></div>
        </div>
      </div>

      <!-- North/South coming-soon modal -->
      @if (showModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div class="relative w-full max-w-md rounded-2xl border border-natural-border border-t-8 border-t-natural-accent bg-natural-bg p-6 shadow-2xl">
            <button type="button" class="absolute right-4 top-3 text-xl font-black text-stone-400 transition hover:text-stone-700" (click)="showModal.set(false)">×</button>
            <div class="flex items-start gap-4">
              <div class="shrink-0 rounded-full border border-natural-border bg-natural-beige p-3 text-natural-accent"><svg lucideAlertCircle class="h-6 w-6"></svg></div>
              <div class="text-left">
                <h3 class="font-serif text-lg font-bold text-natural-text">{{ regionPreview().title }}</h3>
                <p class="mt-3 text-xs leading-relaxed text-natural-text/80">{{ regionPreview().body }}</p>
                <p class="mt-3 rounded-xl border border-natural-border bg-natural-beige px-3 py-2 text-xs font-bold leading-relaxed text-natural-accent">{{ regionPreview().note }}</p>
                <div class="mt-6 flex flex-col justify-end gap-2 sm:flex-row">
                  <button type="button" class="rounded-xl bg-natural-gold px-5 py-2 text-xs font-bold uppercase tracking-wider text-natural-ink shadow-md transition hover:bg-natural-gold-dark" (click)="showModal.set(false); ui.selectProvince('quang-nam')">{{ i18n.isVi() ? 'Xem miền Trung' : 'View Central' }}</button>
                  <button type="button" class="rounded-xl bg-natural-accent px-5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-md transition hover:bg-natural-olive" (click)="showModal.set(false)">{{ i18n.isVi() ? 'Tôi hiểu rồi' : 'Got it' }}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class HomePageComponent {
  readonly provinces = provinces;
  readonly heroImage =
    'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1800&q=85';
  readonly stats = [
    { icon: 'calendar', valueVi: 'AI', valueEn: 'AI', labelVi: 'lịch trình theo gu', labelEn: 'mood-based routes', label: 'routes' },
    { icon: 'hotel', valueVi: '18+', valueEn: '18+', labelVi: 'lưu trú chọn lọc', labelEn: 'curated stays', label: 'stays' },
    { icon: 'map', valueVi: 'Bắc-Trung-Nam', valueEn: 'N-C-S', labelVi: 'khung vùng du lịch', labelEn: 'regional framework', label: 'framework' },
    { icon: 'users', valueVi: 'Nhóm', valueEn: 'Groups', labelVi: 'cùng vote lịch trình', labelEn: 'co-plan together', label: 'group' },
  ];

  readonly showModal = signal(false);
  readonly selectedRegion = signal<'north' | 'south'>('north');
  readonly regionPreview = computed(() => {
    const vi = this.i18n.isVi();
    if (this.selectedRegion() === 'north') {
      return {
        title: vi ? 'Miền Bắc đang được mở dữ liệu' : 'Northern Vietnam is being mapped',
        body: vi
          ? 'Hà Nội, Hạ Long và Sa Pa sẽ có lịch trình riêng cho đô thị cổ, vịnh biển và cung núi. Hiện tại VietCharm đang ưu tiên hoàn thiện kho lưu trú và tour đối tác trước khi mở đặt chỗ.'
          : 'Hanoi, Halong and Sapa will get dedicated city, bay and mountain planning flows. VietCharm is finishing partner inventory before opening booking.',
        note: vi ? 'Gợi ý sắp tới: Hà Nội 2N1Đ, Hạ Long du thuyền, Sa Pa trekking nhẹ.' : 'Coming next: Hanoi 2D1N, Halong cruise, soft Sapa trekking.',
      };
    }
    return {
      title: vi ? 'Miền Nam đang được mở dữ liệu' : 'Southern Vietnam is being mapped',
      body: vi
        ? 'Sài Gòn, Miền Tây và Phú Quốc sẽ được tách theo nhịp đô thị, sông nước và nghỉ dưỡng đảo. Dữ liệu nhà cung cấp đang được kiểm tra để tránh mở dịch vụ rỗng.'
        : 'Saigon, Mekong and Phu Quoc will be split into city, river and island-rest flows. Vendor data is being verified before booking opens.',
      note: vi ? 'Gợi ý sắp tới: city tour Sài Gòn, chợ nổi, resort Phú Quốc.' : 'Coming next: Saigon city tours, floating markets, Phu Quoc resorts.',
    };
  });

  constructor(
    readonly i18n: I18nService,
    readonly ui: UiStateService,
  ) {}

  openRegion(region: 'north' | 'south'): void {
    this.selectedRegion.set(region);
    this.showModal.set(true);
  }
}

@Component({
  selector: 'app-provinces-page',
  standalone: true,
  imports: [RouterLink, LucideArrowLeft, LucideArrowRight, LucideMapPin, LucideNavigation, LucideShieldCheck],
  template: `
    <div class="min-h-screen w-full bg-natural-bg px-4 py-12">
      <div class="mx-auto max-w-7xl">
        <!-- Top bar: back + breadcrumb + status -->
        <div class="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <a routerLink="/" class="flex items-center gap-2 rounded-full border border-natural-border bg-natural-beige px-4 py-2 font-serif text-xs font-bold text-natural-accent shadow-xs transition hover:text-natural-olive">
            <svg lucideArrowLeft class="h-3.5 w-3.5 text-natural-accent"></svg>
            <span>{{ i18n.isVi() ? 'Quay lại chọn Vùng Miền' : 'Back to Regions' }}</span>
          </a>
          <nav class="flex flex-wrap items-center gap-2 text-xs font-bold text-stone-500" [attr.aria-label]="i18n.isVi() ? 'Điều hướng phân cấp' : 'Breadcrumb'">
            <a routerLink="/" class="transition hover:text-natural-accent">{{ i18n.isVi() ? 'Trang chủ' : 'Home' }}</a>
            <span aria-hidden="true">/</span>
            <span class="text-natural-accent">{{ i18n.isVi() ? 'Miền Trung' : 'Central Vietnam' }}</span>
            <span aria-hidden="true">/</span>
            <span class="text-natural-text" aria-current="page">{{ i18n.isVi() ? 'Điểm đến' : 'Destinations' }}</span>
          </nav>
          <div class="flex items-center gap-1.5 font-mono text-xs text-stone-500">
            <svg lucideNavigation class="h-3 w-3 text-natural-accent"></svg>
            <span>{{ i18n.isVi() ? 'Dữ liệu điểm đến đang có' : 'Available destination data' }}</span>
          </div>
        </div>

        <!-- Section title -->
        <div class="mb-12 text-center md:text-left">
          <span class="text-gold-gradient text-[11px] font-black uppercase tracking-[0.22em]">{{ i18n.isVi() ? 'Điểm đến tiêu biểu' : 'Featured destinations' }}</span>
          <h2 class="mt-1 font-serif text-2xl font-bold tracking-tight text-natural-text md:text-4xl">{{ i18n.isVi() ? 'Chọn điểm đến để xem dịch vụ' : 'Choose a destination to browse services' }}</h2>
          <p class="mt-3 max-w-2xl text-xs leading-relaxed text-natural-text/80 md:text-sm">
            {{ i18n.isVi()
              ? 'Chọn một điểm đến để đặt tour, khách sạn, thuê xe và lên lịch trình cùng trợ lý AI — tất cả trong một flow liền mạch.'
              : 'Pick a destination to book tours, hotels, and rentals, and plan with the AI assistant — all in one seamless flow.' }}
          </p>
          <div class="mt-6 flex items-center justify-center gap-3 md:justify-start" aria-hidden="true">
            <span class="h-px w-12 bg-gradient-to-r from-transparent to-natural-gold/70 sm:w-20"></span>
            <span class="relative flex h-3.5 w-3.5 items-center justify-center">
              <span class="absolute inset-0 rotate-45 rounded-[2px] border border-natural-gold/50"></span>
              <span class="h-1.5 w-1.5 rotate-45 rounded-[1px] bg-natural-gold"></span>
            </span>
            <span class="h-px w-12 bg-gradient-to-l from-transparent to-natural-gold/70 sm:w-20"></span>
          </div>
        </div>

        <!-- Provinces grid -->
        <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          @for (prov of provinces; track prov.id) {
            <div
              [class]="'group relative h-full overflow-hidden rounded-3xl border bg-natural-beige-light transition duration-300 ' + (prov.active ? 'border-natural-border cursor-pointer shadow-luxe hover:shadow-luxe-lg hover:-translate-y-1.5 hover:border-natural-gold/45' : 'border-natural-border/60 opacity-70 shadow-lg')"
              (click)="prov.active && ui.selectProvince(prov.id)"
            >
              <div class="relative h-56 w-full overflow-hidden">
                <img [src]="prov.image" [alt]="prov.name" class="h-full w-full object-cover transition duration-[600ms] ease-out group-hover:scale-110" />
                <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent"></div>
                <div class="absolute right-4 top-4 rounded-full border border-natural-border/20 bg-natural-olive/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
                  @if (prov.active) {
                    <span class="font-bold text-natural-gold">● {{ i18n.isVi() ? 'HOẠT ĐỘNG' : 'READY' }}</span>
                  } @else {
                    <span class="text-stone-300">⚡ {{ i18n.isVi() ? 'SẮP RA MẮT' : 'COMING SOON' }}</span>
                  }
                </div>
                <div class="absolute bottom-4 left-4 text-white">
                  <p class="text-[10px] font-bold uppercase tracking-widest text-natural-gold">{{ prov.tagline }}</p>
                  <h3 class="font-serif text-xl font-bold tracking-tight">{{ prov.name }}</h3>
                </div>
              </div>
              <div class="p-5">
                <p class="line-clamp-2 text-xs leading-relaxed text-natural-text/80">{{ prov.description }}</p>
                <div class="mt-5 flex items-center justify-between border-t border-natural-border pt-4">
                  <span class="flex items-center gap-1.5 font-mono text-[11px] uppercase text-stone-500">
                    <svg lucideMapPin class="h-3.5 w-3.5 text-natural-accent"></svg>
                    {{ prov.id === 'quang-nam' ? (i18n.isVi() ? 'Đậm nét Hội An' : 'Heritage Core') : (i18n.isVi() ? 'Liên tỉnh lân cận' : 'Coastal Gateway') }}
                  </span>
                  @if (prov.active) {
                    <div class="flex items-center gap-1 text-xs font-bold text-natural-accent">
                      <span>{{ i18n.isVi() ? 'Ấn để khám phá' : 'Click to Plan' }}</span>
                      <svg lucideArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-1"></svg>
                    </div>
                  } @else {
                    <button type="button" class="text-[10px] font-bold text-natural-accent underline transition hover:text-natural-olive" (click)="$event.stopPropagation(); showRoadmap(prov.name)">
                      {{ i18n.isVi() ? 'Xem lộ trình' : 'See roadmap' }}
                    </button>
                  }
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Travel safety statement -->
        <div class="mt-14 flex flex-col items-center justify-between gap-6 rounded-3xl border border-natural-border bg-natural-beige p-6 md:flex-row">
          <div class="flex items-center gap-3">
            <div class="shrink-0 rounded-full border border-natural-border bg-natural-bg p-3 text-natural-accent">
              <svg lucideShieldCheck class="h-6 w-6"></svg>
            </div>
            <div>
              <h4 class="font-serif text-sm font-bold text-natural-text">{{ i18n.isVi() ? 'Bảo chứng Lữ Hành Độc Quyền từ Ban Quản Lý' : 'Certified Safe Travel Assured' }}</h4>
              <p class="mt-1 max-w-xl text-xs leading-relaxed text-natural-text/75">
                {{ i18n.isVi()
                  ? 'Mọi chuỗi đặt phòng khách sạn, đại lý cho thuê phương tiện xe máy đều đã được tích hợp liên kết trực tiếp, bảo đảm quyền lợi hoàn tiền 100% khi lộ trình thời tiết bị thay đổi đột ngột.'
                  : 'We safeguard all bookings, vehicle rentals, and regional tours through our legal 100% weather refund warranty.' }}
              </p>
            </div>
          </div>
          <button type="button" class="btn-sheen shrink-0 rounded-full bg-natural-accent px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white transition hover:bg-natural-olive" (click)="ui.selectProvince('quang-nam')">
            {{ i18n.isVi() ? 'Khám Phá Hội An Ngay' : 'Go to Hoi An First' }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ProvincesPageComponent {
  readonly provinces = provinces;

  constructor(
    readonly i18n: I18nService,
    readonly ui: UiStateService,
    private readonly toast: ToastService,
  ) {}

  showRoadmap(name: string): void {
    this.toast.showToast({
      type: 'info',
      title: this.i18n.isVi() ? 'Tỉnh đang được số hóa' : 'Province is being digitized',
      message: this.i18n.isVi()
        ? `Tỉnh ${name} đang được tích hợp dữ liệu lưu trú và lữ hành. Hiện tại Quảng Nam - Hội An hoạt động đầy đủ.`
        : `${name} is undergoing vendor integration. Quang Nam - Hoi An is currently fully active.`,
    });
  }
}

@Component({
  selector: 'app-province-page',
  standalone: true,
  imports: [ItemCardComponent, LucideMapPin],
  template: `
    <section class="relative overflow-hidden bg-natural-ink text-white">
      <img [src]="province().image" [alt]="province().name" class="absolute inset-0 h-full w-full object-cover opacity-55" />
      <div class="absolute inset-0 bg-gradient-to-r from-natural-ink via-natural-ink/70 to-natural-ink/20"></div>
      <div class="relative mx-auto max-w-7xl px-4 py-16 md:py-24">
        <p class="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.25em] text-natural-gold">
          <svg lucideMapPin class="h-4 w-4"></svg>
          {{ i18n.isVi() ? 'Chi tiết điểm đến' : 'Destination detail' }}
        </p>
        <h1 class="mt-3 font-serif text-5xl font-black md:text-7xl">{{ province().name }}</h1>
        <p class="mt-5 max-w-2xl text-lg leading-8 text-white/82">{{ province().description }}</p>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-4 py-10">
      <div class="mb-7 flex flex-wrap gap-2">
        @for (tab of tabs; track tab.id) {
          <button type="button" class="rounded-full border px-4 py-2 text-sm font-black transition" [class.border-natural-accent]="activeTab() === tab.id" [class.bg-natural-accent]="activeTab() === tab.id" [class.text-white]="activeTab() === tab.id" [class.border-natural-border]="activeTab() !== tab.id" (click)="setTab(tab.id)">
            {{ i18n.isVi() ? tab.vi : tab.en }}
          </button>
        }
      </div>
      <div class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        @for (item of items(); track item.id) {
          <app-item-card [item]="item" [cta]="i18n.isVi() ? 'Thêm vào giỏ' : 'Add to cart'" />
        }
      </div>
    </section>
  `,
})
export class ProvincePageComponent {
  private readonly route = inject(ActivatedRoute);
  readonly i18n = inject(I18nService);
  readonly ui = inject(UiStateService);
  private readonly params = toSignal(this.route.paramMap);
  readonly tabs = SERVICE_TABS;
  readonly activeTab = this.ui.allServicesTab;
  readonly provinceId = computed(() => this.params()?.get('provinceId') ?? 'quang-nam');
  readonly province = computed(() => provinceById(this.provinceId()));
  readonly items = computed(() => itemsForTab(this.activeTab(), this.provinceId()));

  constructor() {
    effect(() => this.ui.selectedProvinceId.set(this.provinceId()));
  }

  setTab(tab: ServiceTab): void {
    this.ui.allServicesTab.set(tab);
  }
}

@Component({
  selector: 'app-services-page',
  standalone: true,
  imports: [FormsModule, RouterLink, ItemCardComponent, LucideArrowLeft, LucideArrowUpDown, LucideSearch, LucideSlidersHorizontal],
  template: `
    <div class="min-h-screen w-full bg-natural-bg px-4 py-8">
      <div class="mx-auto max-w-7xl space-y-8">
        <div>
          <a routerLink="/discover" class="inline-flex items-center justify-center gap-2 rounded-full border border-natural-border bg-white px-4 py-2.5 text-xs font-black uppercase tracking-wide text-natural-accent shadow-xs transition hover:bg-natural-beige hover:text-natural-olive">
            <svg lucideArrowLeft class="h-4 w-4"></svg><span>{{ i18n.isVi() ? 'Quay lại' : 'Back' }}</span>
          </a>
        </div>

        <div class="max-w-3xl">
          <span class="text-[11px] font-black uppercase tracking-[0.22em] text-natural-accent">{{ i18n.isVi() ? 'Danh mục dịch vụ' : 'Service catalog' }}</span>
          <h1 class="mt-2 font-serif text-3xl font-black tracking-tight text-natural-ink md:text-4xl">{{ heading() }}</h1>
          <p class="mt-2 text-sm leading-relaxed text-stone-600">{{ scopeDescription() }}</p>
        </div>

        <!-- Tabs -->
        <div class="flex flex-wrap gap-2">
          @for (tab of tabs; track tab.id) {
            <button type="button" class="rounded-full border px-4 py-2 text-sm font-black transition" [class.border-natural-accent]="activeTab() === tab.id" [class.bg-natural-accent]="activeTab() === tab.id" [class.text-white]="activeTab() === tab.id" [class.border-natural-border]="activeTab() !== tab.id" (click)="setTab(tab.id)">
              {{ i18n.isVi() ? tab.vi : tab.en }}
            </button>
          }
        </div>

        <div class="grid grid-cols-1 items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <!-- Filter sidebar -->
          <aside class="self-start rounded-3xl border border-natural-border bg-natural-cream p-5 lg:sticky lg:top-28">
            <div class="flex items-center justify-between">
              <h3 class="flex items-center gap-2 font-serif text-base font-black text-natural-text"><svg lucideSlidersHorizontal class="h-4 w-4 text-natural-accent"></svg>{{ i18n.isVi() ? 'Bộ lọc' : 'Filters' }}</h3>
              <button type="button" class="text-[11px] font-bold uppercase tracking-wide text-stone-400 transition hover:text-natural-accent" (click)="resetFilters()">{{ i18n.isVi() ? 'Đặt lại' : 'Reset' }}</button>
            </div>
            <div class="mt-5 space-y-5">
              <div class="space-y-1.5">
                <label class="block text-[10px] font-bold uppercase tracking-wider text-natural-accent">{{ i18n.isVi() ? 'Tìm kiếm' : 'Search' }}</label>
                <div class="relative">
                  <svg lucideSearch class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"></svg>
                  <input type="text" [ngModel]="query()" (ngModelChange)="query.set($event)" [placeholder]="i18n.isVi() ? 'Nhập tên, mô tả...' : 'Type name, location...'" class="w-full rounded-xl border border-stone-200 bg-white px-9 py-2.5 text-sm focus:border-natural-accent focus:outline-none" />
                </div>
              </div>

              @if (activeTab() !== 'vehicles') {
                <div class="space-y-1.5">
                  <label class="block text-[10px] font-bold uppercase tracking-wider text-natural-accent">{{ i18n.isVi() ? 'Tỉnh thành' : 'Province' }}</label>
                  <select [ngModel]="province()" (ngModelChange)="province.set($event)" class="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-natural-text focus:border-natural-accent focus:outline-none">
                    <option value="all">{{ i18n.isVi() ? 'Tất cả tỉnh thành' : 'All provinces' }}</option>
                    @for (p of provinces; track p.id) { <option [value]="p.id">{{ p.name }}</option> }
                  </select>
                </div>
              }

              @if (activeTab() === 'activities') {
                <div class="space-y-2">
                  <label class="block text-[10px] font-bold uppercase tracking-wider text-natural-accent">{{ i18n.isVi() ? 'Chủ đề trải nghiệm' : 'Experience Theme' }}</label>
                  <div class="flex flex-col gap-1.5">
                    @for (cat of activityCategories(); track cat.id) {
                      <button type="button" [class]="'w-full rounded-xl px-3 py-2 text-left text-xs font-bold transition ' + (category() === cat.id ? 'bg-natural-accent text-white' : 'border border-stone-200 bg-white text-stone-600 hover:bg-stone-100')" (click)="category.set(cat.id)">{{ cat.label }}</button>
                    }
                  </div>
                </div>
              }
            </div>
          </aside>

          <!-- Results -->
          <div class="min-w-0 space-y-6">
            <div class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-natural-border bg-white px-4 py-3 shadow-xs">
              <p class="text-sm text-stone-500">{{ i18n.isVi() ? 'Kết quả: ' : 'Results: ' }}<span class="font-black text-natural-accent">{{ filteredItems().length }}</span></p>
              <div class="flex items-center gap-2">
                <span class="hidden text-[11px] font-bold uppercase tracking-wide text-stone-400 sm:inline">{{ i18n.isVi() ? 'Sắp xếp theo' : 'Sort by' }}</span>
                <div class="relative">
                  <svg lucideArrowUpDown class="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400"></svg>
                  <select [ngModel]="sortBy()" (ngModelChange)="sortBy.set($event)" class="rounded-xl border border-stone-200 bg-white py-2 pl-8 pr-3 text-xs font-semibold focus:border-natural-accent focus:outline-none">
                    <option value="default">{{ i18n.isVi() ? 'Mặc định phổ biến' : 'Popularity / Default' }}</option>
                    @if (activeTab() !== 'attractions') {
                      <option value="price-asc">{{ i18n.isVi() ? 'Giá tiền: Thấp đến Cao' : 'Price: Low to High' }}</option>
                      <option value="price-desc">{{ i18n.isVi() ? 'Giá tiền: Cao đến Thấp' : 'Price: High to Low' }}</option>
                    }
                    <option value="rating-desc">{{ i18n.isVi() ? 'Đánh giá: Cao nhất' : 'Rating: Top Rated' }}</option>
                  </select>
                </div>
              </div>
            </div>

            @if (filteredItems().length === 0) {
              <div class="rounded-3xl border border-dashed border-natural-border bg-white p-10 text-center">
                <p class="font-serif text-xl font-black text-natural-ink">{{ i18n.isVi() ? 'Không tìm thấy dịch vụ phù hợp' : 'No matching services found' }}</p>
                <p class="mt-2 text-sm text-stone-500">{{ i18n.isVi() ? 'Thử đổi bộ lọc hoặc đặt lại để xem thêm.' : 'Try changing the filters or reset to see more.' }}</p>
              </div>
            } @else {
              <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                @for (item of visibleItems(); track item.id) {
                  <app-item-card [item]="item" [cta]="i18n.isVi() ? 'Thêm vào giỏ' : 'Add to cart'" />
                }
              </div>
              @if (filteredItems().length > visibleCount()) {
                <div class="flex justify-center pt-2">
                  <button type="button" class="rounded-full border border-natural-border bg-white px-6 py-3 text-sm font-black text-natural-accent shadow-xs transition hover:bg-natural-beige" (click)="visibleCount.set(visibleCount() + 9)">{{ i18n.isVi() ? 'Xem thêm dịch vụ' : 'Load more services' }}</button>
                </div>
              }
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ServicesPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly i18n = inject(I18nService);
  readonly ui = inject(UiStateService);
  readonly provinces = provinces;
  private readonly queryParams = toSignal(this.route.queryParamMap);
  readonly tabs = SERVICE_TABS;
  readonly query = signal('');
  readonly province = signal('all');
  readonly sortBy = signal<'default' | 'price-asc' | 'price-desc' | 'rating-desc'>('default');
  readonly category = signal('all');
  readonly visibleCount = signal(9);

  readonly activeTab = computed<ServiceTab>(() => {
    const tab = this.queryParams()?.get('tab');
    return isServiceTab(tab) ? tab : this.ui.allServicesTab();
  });

  readonly heading = computed(() => {
    const vi = this.i18n.isVi();
    switch (this.activeTab()) {
      case 'hotels': return vi ? 'Lưu trú & Khách sạn' : 'Stays & Hotels';
      case 'vehicles': return vi ? 'Phương tiện di chuyển' : 'Transport & Rides';
      case 'activities': return vi ? 'Hoạt động & Trải nghiệm' : 'Activities & Experiences';
      default: return vi ? 'Điểm đến tham quan' : 'Attractions & Spots';
    }
  });

  readonly scopeDescription = computed(() =>
    this.i18n.isVi()
      ? 'Danh sách được lọc theo điểm đến bạn đang xem. Bạn vẫn có thể đổi tỉnh trong bộ lọc.'
      : 'This list is filtered by the destination you were viewing. You can still change province in the filters.',
  );

  readonly items = computed(() => {
    const tab = this.activeTab();
    const prov = this.province();
    if (tab === 'vehicles') return itemsForTab('vehicles', prov === 'all' ? 'quang-nam' : prov);
    if (prov === 'all') return this.provinces.flatMap((p) => itemsForTab(tab, p.id));
    return itemsForTab(tab, prov);
  });

  readonly filteredItems = computed(() => {
    const normalized = this.query().trim().toLowerCase();
    let list = this.items();
    if (normalized) list = list.filter((item) => `${item.name} ${item.description ?? ''}`.toLowerCase().includes(normalized));
    if (this.activeTab() === 'activities' && this.category() !== 'all') {
      const cat = this.category();
      list = list.filter((item) => `${item.name} ${item.description ?? ''}`.toLowerCase().includes(cat));
    }
    const sort = this.sortBy();
    if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    else if (sort === 'rating-desc') list = [...list].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    return list;
  });

  readonly visibleItems = computed(() => this.filteredItems().slice(0, this.visibleCount()));

  activityCategories(): Array<{ id: string; label: string }> {
    const vi = this.i18n.isVi();
    return [
      { id: 'all', label: vi ? 'Tất cả' : 'All' },
      { id: 'heritage', label: vi ? 'Di sản & Văn hóa' : 'Heritage' },
      { id: 'culinary', label: vi ? 'Lớp học Ẩm thực' : 'Culinary' },
      { id: 'nature', label: vi ? 'Sinh thái & Làng quê' : 'Eco-Nature' },
      { id: 'adventure', label: vi ? 'Phiêu lưu & Lặn biển' : 'Adventure' },
    ];
  }

  constructor() {
    const initialProvince = this.queryParams()?.get('province');
    if (initialProvince) this.province.set(initialProvince);
    effect(() => {
      this.ui.allServicesTab.set(this.activeTab());
      const prov = this.province();
      if (prov !== 'all') this.ui.selectedProvinceId.set(prov);
    });
    // Reset pagination whenever filters change.
    effect(() => {
      this.activeTab();
      this.query();
      this.province();
      this.sortBy();
      this.category();
      this.visibleCount.set(9);
    });
  }

  resetFilters(): void {
    this.query.set('');
    this.province.set('all');
    this.sortBy.set('default');
    this.category.set('all');
  }

  setTab(tab: ServiceTab): void {
    void this.router.navigate(['/services'], { queryParams: { tab, province: this.province() } });
  }
}

@Component({
  selector: 'app-service-provinces-page',
  standalone: true,
  imports: [],
  template: `
    <section class="mx-auto max-w-7xl px-4 py-10">
      <h1 class="font-serif text-4xl font-black text-natural-ink">{{ i18n.isVi() ? 'Chọn tỉnh trước khi xem dịch vụ' : 'Pick a province before browsing services' }}</h1>
      <div class="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        @for (province of provinces; track province.id) {
          <button type="button" class="rounded-2xl border border-natural-border bg-white p-4 text-left shadow-luxe transition hover:-translate-y-1" (click)="ui.openAllServices(ui.allServicesServicePicker(), province.id)">
            <img [src]="province.image" [alt]="province.name" class="h-32 w-full rounded-xl object-cover" />
            <h2 class="mt-3 font-serif text-xl font-black text-natural-ink">{{ province.name }}</h2>
          </button>
        }
      </div>
    </section>
  `,
})
export class ServiceProvincesPageComponent {
  readonly provinces = provinces;

  constructor(
    readonly i18n: I18nService,
    readonly ui: UiStateService,
  ) {}
}

@Component({
  selector: 'app-recently-viewed-page',
  standalone: true,
  imports: [ItemCardComponent],
  template: `
    <section class="mx-auto max-w-7xl px-4 py-10">
      <div class="mb-7 flex items-end justify-between gap-4">
        <div>
          <p class="text-xs font-black uppercase tracking-[0.25em] text-natural-accent">History</p>
          <h1 class="font-serif text-4xl font-black text-natural-ink">{{ i18n.isVi() ? 'Dịch vụ đã xem' : 'Recently viewed' }}</h1>
        </div>
        <button type="button" class="rounded-full border border-natural-border px-4 py-2 text-sm font-black" (click)="ui.clearRecentlyViewed()">{{ i18n.isVi() ? 'Xóa' : 'Clear' }}</button>
      </div>
      <div class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        @for (item of ui.recentlyViewed(); track item.id) {
          <app-item-card [item]="item" />
        } @empty {
          <p class="rounded-2xl border border-natural-border bg-white p-6 font-bold">{{ i18n.isVi() ? 'Bạn chưa xem dịch vụ nào.' : 'No viewed services yet.' }}</p>
        }
      </div>
    </section>
  `,
})
export class RecentlyViewedPageComponent {
  constructor(
    readonly i18n: I18nService,
    readonly ui: UiStateService,
  ) {}
}

interface PlaceReview {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
}

interface Place {
  id: string;
  nameVi: string;
  nameEn: string;
  categoryVi: string;
  categoryEn: string;
  descriptionVi: string;
  descriptionEn: string;
  distance: string;
  duration: string;
  coordinates: { x: number; y: number };
  images: string[];
  reviews: PlaceReview[];
  rating: number;
  totalReviews: number;
  historyVi: string;
  historyEn: string;
}

const INITIAL_PLACES: Place[] = [
  {
    id: 'pho-co-hoi-an', nameVi: 'Phố Cổ Hội An', nameEn: 'Hoi An Ancient Town', categoryVi: 'Di sản văn hóa', categoryEn: 'Cultural Heritage',
    descriptionVi: 'Phố cổ Hội An là một đô thị cổ nằm ở hạ lưu sông Thu Bồn, thuộc đồng bằng ven biển tỉnh Quảng Nam, cách Đà Nẵng khoảng 30 km về phía Nam. Nhờ những yếu tố địa lý và khí hậu thuận lợi, Hội An từng là một thương cảng quốc tế sầm uất.',
    descriptionEn: 'Hoi An Ancient Town is an exceptionally well-preserved example of a South-East Asian trading port from the 15th to the 19th century. Its buildings and street plan reflect indigenous and foreign influences combined into a unique heritage site.',
    distance: '1.2 km', duration: '5 phút đi bộ / 5 mins walk', coordinates: { x: 120, y: 150 },
    images: ['https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80'],
    rating: 4.9, totalReviews: 128,
    historyVi: 'Được UNESCO công nhận là Di sản văn hóa thế giới vào năm 1999. Nổi tiếng với những dãy nhà cổ sơn vàng, lồng đèn lung linh về đêm và các hội quán kiến trúc Hoa - Nhật hòa quyện.',
    historyEn: 'Designated a UNESCO World Heritage Site in 1999. Famed for its golden-painted heritage houses, glowing lanterns at night, and an exquisite architectural fusion of Chinese, Japanese, and Vietnamese styles.',
    reviews: [{ id: 'r1', author: 'Lê Minh', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80', rating: 5, date: '2026-06-20', comment: 'Không gian cổ kính tuyệt vời, đặc biệt là vào buổi tối khi đèn lồng được thắp sáng rực rỡ.' }, { id: 'r2', author: 'Sarah Jenkins', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', rating: 5, date: '2026-06-18', comment: 'An absolute masterpiece of historic preservation. The food here is outstanding too!' }],
  },
  {
    id: 'chua-cau', nameVi: 'Chùa Cầu (Cầu Nhật Bản)', nameEn: 'The Japanese Covered Bridge', categoryVi: 'Di sản văn hóa', categoryEn: 'Cultural Heritage',
    descriptionVi: 'Chùa Cầu là chiếc cầu cổ trong khu phố cổ Hội An, còn có tên là Cầu Nhật Bản hoặc Lai Viễn Kiều. Công trình được các thương nhân Nhật Bản khởi dựng vào khoảng đầu thế kỷ XVII, mang đậm nét kiến trúc độc đáo giao thoa.',
    descriptionEn: "The Japanese Covered Bridge is one of Hoi An's most iconic attractions. Built in the early 17th century by Japanese merchants, it features a unique combination of bridge and temple architecture, symbolizing historical friendship.",
    distance: '0.8 km', duration: '3 phút đi bộ / 3 mins walk', coordinates: { x: 100, y: 160 },
    images: ['https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80'],
    rating: 4.8, totalReviews: 95,
    historyVi: 'Cây cầu lịch sử này được in trên tờ tiền polymer 20.000 VND của Việt Nam. Đây là biểu tượng văn hóa vô giá của vùng đất di sản Hội An.',
    historyEn: "This historic bridge is featured on Vietnam's 20,000 VND polymer banknote. It represents the priceless cultural soul of the Hoi An heritage region.",
    reviews: [{ id: 'r3', author: 'Nguyễn Thảo', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80', rating: 4, date: '2026-06-15', comment: 'Kiến trúc gỗ rất tinh xảo, địa điểm check-in không thể bỏ qua.' }],
  },
  {
    id: 'rung-dua-bay-mau', nameVi: 'Rừng Dừa Bảy Mẫu', nameEn: 'Bay Mau Coconut Forest', categoryVi: 'Trải nghiệm sinh thái', categoryEn: 'Eco-experience',
    descriptionVi: 'Rừng dừa Bảy Mẫu thuộc xã Cẩm Thanh, thành phố Hội An. Trải nghiệm bơi thuyền thúng len lỏi trong rừng dừa nước bạt ngàn và thưởng thức màn múa thúng xoay vòng ngoạn mục từ những người dân chài mộc mạc địa phương.',
    descriptionEn: 'Located in Cam Thanh village, Bay Mau Coconut Forest offers an immersive experience of rowing traditional bamboo basket boats through emerald waterways flanked by coconut palms, alongside high-energy spinning performances.',
    distance: '4.5 km', duration: '10 phút taxi / 10 mins taxi', coordinates: { x: 320, y: 280 },
    images: ['https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'],
    rating: 4.7, totalReviews: 210,
    historyVi: 'Là căn cứ địa cách mạng kiên cường trong kháng chiến chống Mỹ, ngày nay rừng dừa đã trở thành một điểm du lịch sinh thái sông nước độc nhất vô nhị vùng Duyên hải miền Trung.',
    historyEn: "Once a strategic revolutionary base in wartime history, it has transformed into a globally renowned river eco-tourism destination highlighting Hoi An's rustic maritime hospitality.",
    reviews: [{ id: 'r4', author: 'Quốc Bảo', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80', rating: 5, date: '2026-06-22', comment: 'Cực kỳ vui nhộn! Trải nghiệm múa thúng xoay vòng rất đáng tiền và phấn khích.' }],
  },
  {
    id: 'bai-bien-an-bang', nameVi: 'Bãi Biển An Bàng', nameEn: 'An Bang Beach', categoryVi: 'Bãi biển & Thiên nhiên', categoryEn: 'Beach & Nature',
    descriptionVi: 'Bãi biển An Bàng nằm trong top những bãi biển đẹp nhất Châu Á. Nơi đây giữ được vẻ hoang sơ, bãi cát trắng mịn màng và nước biển trong xanh, thích hợp cho việc tắm nắng, thưởng thức hải sản và nghe tiếng sóng vỗ bình yên.',
    descriptionEn: "An Bang Beach is celebrated as one of Asia's most tranquil and beautiful coastal sanctuaries. Characterized by white soft sand, clean breaking waves, and trendy beachfront restaurants serving delicious fresh seafood.",
    distance: '3.0 km', duration: '8 phút taxi / 8 mins taxi', coordinates: { x: 260, y: 120 },
    images: ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=800&q=80'],
    rating: 4.8, totalReviews: 156,
    historyVi: 'An Bàng từng được các tạp chí quốc tế như CNN bình chọn vào danh sách những bãi biển quyến rũ nhất hành tinh nhờ vẻ đẹp nguyên sơ và không khí thư thái.',
    historyEn: 'An Bang has been voted by international media such as CNN as one of the most charming beaches on the planet thanks to its pristine beauty and relaxed atmosphere.',
    reviews: [{ id: 'r5', author: 'Elena Petrova', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80', rating: 5, date: '2026-06-19', comment: 'Super clean beach, very relaxed atmosphere compared to Da Nang. Love the beach bars!' }],
  },
  {
    id: 'lang-gom-thanh-ha', nameVi: 'Làng Gốm Thanh Hà', nameEn: 'Thanh Ha Pottery Village', categoryVi: 'Làng nghề truyền thống', categoryEn: 'Traditional Craft',
    descriptionVi: 'Làng gốm Thanh Hà ra đời từ cuối thế kỷ XV, nằm bên bờ sông Thu Bồn. Du khách được tận mắt xem nghệ nhân chuốt gốm bằng bàn xoay truyền thống và tự tay nặn những sản phẩm lưu niệm mộc mạc.',
    descriptionEn: 'Founded in the late 15th century on the banks of the Thu Bon River, Thanh Ha Pottery Village lets visitors watch artisans shape clay on traditional wheels and try crafting their own rustic souvenirs.',
    distance: '3.5 km', duration: '9 phút taxi / 9 mins taxi', coordinates: { x: 70, y: 240 },
    images: ['https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80'],
    rating: 4.6, totalReviews: 88,
    historyVi: 'Trải qua hơn 500 năm, làng gốm vẫn giữ nguyên kỹ thuật nung thủ công và là nơi cung cấp gạch ngói cho các công trình cổ của Hội An.',
    historyEn: 'Over 500 years old, the village preserves handmade firing techniques and once supplied bricks and tiles for the ancient constructions of Hoi An.',
    reviews: [{ id: 'r6', author: 'Trần Hòa', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80', rating: 5, date: '2026-06-12', comment: 'Trải nghiệm tự tay xoay gốm rất thú vị, giá vé hợp lý và người dân vô cùng thân thiện.' }],
  },
  {
    id: 'lang-rau-tra-que', nameVi: 'Làng Rau Trà Quế', nameEn: 'Tra Que Vegetable Village', categoryVi: 'Trải nghiệm sinh thái', categoryEn: 'Eco-experience',
    descriptionVi: 'Làng rau Trà Quế nổi tiếng với hơn 20 loại rau thơm được trồng theo phương pháp hữu cơ. Du khách hóa thân thành nông dân, cuốc đất, tưới rau bằng gàu sòng và thưởng thức bữa cơm quê thanh đạm.',
    descriptionEn: 'Tra Que Vegetable Village is famous for over 20 kinds of organic herbs. Visitors become farmers for a day — hoeing, watering with traditional scoops, and enjoying a wholesome countryside meal.',
    distance: '2.5 km', duration: '7 phút taxi / 7 mins taxi', coordinates: { x: 200, y: 200 },
    images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80'],
    rating: 4.7, totalReviews: 74,
    historyVi: 'Rau Trà Quế được bón bằng rong từ sông Cổ Cò tạo nên hương vị đặc trưng đậm đà, là nguyên liệu không thể thiếu trong các món ăn di sản Hội An.',
    historyEn: 'Tra Que herbs are fertilized with algae from the Co Co River, giving them a distinctive flavor essential to Hoi An heritage cuisine.',
    reviews: [{ id: 'r7', author: 'Mai Vy', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', rating: 5, date: '2026-06-14', comment: 'Rau rất sạch và thơm phức, được trải nghiệm tưới nước như nông dân xưa vô cùng ý nghĩa.' }],
  },
];

@Component({
  selector: 'app-nearby-places-page',
  standalone: true,
  imports: [FormsModule, RouterLink, LucideCompass, LucideHeart, LucideMapPin, LucideMessageSquare, LucideNavigation, LucideSearch, LucideStar, LucideX],
  template: `
    <div class="min-h-screen w-full bg-natural-cream px-4 py-12 text-natural-text md:px-8">
      <div class="mx-auto mb-10 max-w-7xl">
        <div class="flex flex-col justify-between gap-4 border-b border-natural-border pb-6 md:flex-row md:items-center">
          <div>
            <span class="mb-1 flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-widest text-natural-accent"><svg lucideCompass class="h-4 w-4 text-natural-gold"></svg>{{ i18n.isVi() ? 'Hệ thống khám phá lân cận Hội An' : 'Hoi An Nearby Discovery System' }}</span>
            <h2 class="font-serif text-3xl font-black leading-tight text-stone-900 md:text-4xl">{{ i18n.isVi() ? 'Khám Phá Địa Điểm Lân Cận' : 'Explore Nearby Places' }}</h2>
            <p class="mt-1.5 max-w-xl text-xs text-stone-500">{{ i18n.isVi() ? 'Tìm kiếm và khám phá các địa danh, thắng cảnh và làng nghề cổ truyền xung quanh hệ thống VietCharm Hội An với ước tính quãng đường cụ thể.' : 'Search and discover legendary landmarks, sandy beaches, and traditional craft villages around VietCharm Hoi An.' }}</p>
          </div>
          <a routerLink="/" class="self-start rounded-full border border-natural-border bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-stone-600 transition-all hover:border-natural-accent hover:text-natural-accent md:self-center">&larr; {{ i18n.isVi() ? 'Quay lại Trang chủ' : 'Back to Home' }}</a>
        </div>
      </div>

      <div class="mx-auto grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-12">
        <!-- LEFT -->
        <div class="space-y-6 lg:col-span-7">
          <div class="space-y-4 rounded-3xl border border-natural-border bg-white p-5 shadow-sm">
            <div class="relative">
              <input type="text" [ngModel]="query()" (ngModelChange)="query.set($event)" [placeholder]="i18n.isVi() ? 'Tìm tên địa điểm, làng nghề, bãi biển...' : 'Search landmark name, village, beach...'" class="w-full rounded-2xl border border-natural-border bg-natural-cream py-3 pl-11 pr-4 text-xs font-medium transition focus:border-natural-accent focus:outline-none" />
              <svg lucideSearch class="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"></svg>
            </div>
            <div class="flex flex-wrap gap-1.5 pt-1">
              @for (cat of categories(); track cat.value) {
                <button type="button" [class]="'rounded-xl border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition ' + (category() === cat.value ? 'border-natural-accent bg-natural-accent text-white' : 'border-natural-border bg-natural-cream text-stone-500 hover:border-natural-accent hover:text-natural-accent')" (click)="category.set(cat.value)">{{ cat.label }}</button>
              }
            </div>
          </div>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            @for (place of filtered(); track place.id) {
              <div [class]="'group cursor-pointer overflow-hidden rounded-3xl border bg-white transition-all duration-300 ' + (activeId() === place.id ? 'border-transparent shadow-md ring-2 ring-natural-accent' : 'border-natural-border hover:border-natural-accent hover:shadow-md')" (click)="select(place)">
                <div class="relative h-44 overflow-hidden bg-stone-100">
                  <img [src]="place.images[0]" [alt]="i18n.isVi() ? place.nameVi : place.nameEn" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <button type="button" class="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow-sm transition hover:scale-110" [title]="i18n.isVi() ? 'Thêm vào yêu thích' : 'Add to favorites'" (click)="$event.stopPropagation(); ui.toggleFavorite(asItem(place))">
                    <svg lucideHeart class="h-4 w-4 transition duration-200" [class.text-rose-600]="ui.isFavorite(place.id)" [class.fill-rose-600]="ui.isFavorite(place.id)" [class.text-stone-400]="!ui.isFavorite(place.id)"></svg>
                  </button>
                  <div class="absolute left-3 top-3 rounded-lg bg-white/95 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-natural-accent shadow-xs backdrop-blur-xs">{{ i18n.isVi() ? place.categoryVi : place.categoryEn }}</div>
                  <div class="absolute bottom-3 right-3 rounded-md bg-natural-accent/90 px-2 py-0.5 font-mono text-[9px] text-white">📍 {{ place.distance }}</div>
                </div>
                <div class="space-y-2 p-5">
                  <div class="flex items-start justify-between gap-1">
                    <h3 class="font-serif text-sm font-black leading-tight text-stone-800 transition-colors group-hover:text-natural-accent">{{ i18n.isVi() ? place.nameVi : place.nameEn }}</h3>
                    <div class="flex shrink-0 items-center gap-0.5 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-500"><svg lucideStar class="h-3 w-3 fill-current"></svg><span>{{ place.rating }}</span></div>
                  </div>
                  <p class="line-clamp-2 text-[11px] leading-relaxed text-stone-500">{{ i18n.isVi() ? place.descriptionVi : place.descriptionEn }}</p>
                  <div class="flex items-center justify-between border-t border-stone-100 pt-2 text-[10px] text-stone-400">
                    <span class="flex items-center gap-1"><svg lucideNavigation class="h-3 w-3 text-natural-accent"></svg><span>{{ place.duration }}</span></span>
                    <button type="button" class="text-[9px] font-bold uppercase tracking-wider text-natural-accent hover:text-natural-olive hover:underline" (click)="$event.stopPropagation(); view(place)">{{ i18n.isVi() ? 'Xem chi tiết &' : 'Details &' }} &rarr;</button>
                  </div>
                </div>
              </div>
            } @empty {
              <div class="col-span-full rounded-3xl border border-natural-border bg-white p-12 text-center">
                <svg lucideCompass class="mx-auto mb-3 h-12 w-12 text-stone-300"></svg>
                <p class="text-xs font-bold uppercase tracking-wider text-stone-400">{{ i18n.isVi() ? 'Không tìm thấy địa điểm nào' : 'No places found' }}</p>
                <p class="mt-1 text-[10px] text-stone-400">{{ i18n.isVi() ? 'Thử tìm với từ khóa khác xem nhé!' : 'Try searching with another keyword!' }}</p>
              </div>
            }
          </div>
        </div>

        <!-- RIGHT -->
        <div class="lg:col-span-5">
          @if (active(); as place) {
            <div class="sticky top-28 overflow-hidden rounded-3xl border border-natural-border bg-white shadow-lg">
              <div class="relative h-64 bg-stone-900">
                <img [src]="place.images[imageIdx()]" [alt]="i18n.isVi() ? place.nameVi : place.nameEn" class="h-full w-full object-cover opacity-95" />
                <button type="button" class="absolute right-4 top-4 rounded-full bg-black/60 p-2 text-white transition hover:bg-black/80" (click)="activeId.set(null)"><svg lucideX class="h-4 w-4"></svg></button>
                <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-16">
                  <div class="mb-1 text-[10px] font-bold uppercase tracking-widest text-amber-300">{{ i18n.isVi() ? place.categoryVi : place.categoryEn }}</div>
                  <h3 class="font-serif text-xl font-black leading-tight text-white md:text-2xl">{{ i18n.isVi() ? place.nameVi : place.nameEn }}</h3>
                </div>
                @if (place.images.length > 1) {
                  <div class="absolute left-4 top-4 flex gap-1 rounded-full bg-black/40 px-2 py-1">
                    @for (img of place.images; track img; let i = $index) {
                      <button type="button" [class]="'h-2 w-2 rounded-full transition-all ' + (imageIdx() === i ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80')" (click)="imageIdx.set(i)"></button>
                    }
                  </div>
                }
              </div>
              <div class="max-h-[calc(100vh-340px)] space-y-6 overflow-y-auto p-6">
                <div class="grid grid-cols-2 gap-3 rounded-2xl border border-natural-border bg-natural-cream p-3">
                  <div class="text-center"><span class="block text-[9px] font-bold uppercase tracking-wider text-stone-400">{{ i18n.isVi() ? 'Quãng đường' : 'Distance' }}</span><span class="font-serif text-sm font-black text-natural-accent">📍 {{ place.distance }}</span></div>
                  <div class="border-l border-natural-border text-center"><span class="block text-[9px] font-bold uppercase tracking-wider text-stone-400">{{ i18n.isVi() ? 'Thời gian di chuyển' : 'Travel Time' }}</span><span class="mt-0.5 block text-[11px] font-semibold text-stone-700">{{ place.duration }}</span></div>
                </div>
                <div class="space-y-2">
                  <h4 class="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-stone-500"><svg lucideCompass class="h-4 w-4 text-natural-accent"></svg>{{ i18n.isVi() ? 'Giới thiệu chung' : 'Overview' }}</h4>
                  <p class="text-justify text-[11px] leading-relaxed text-stone-600">{{ i18n.isVi() ? place.descriptionVi : place.descriptionEn }}</p>
                </div>
                <div class="space-y-1.5 rounded-2xl border border-dashed border-amber-300 bg-amber-50/40 p-4">
                  <h4 class="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-natural-accent">💡 {{ i18n.isVi() ? 'Có thể bạn chưa biết?' : 'Did you know?' }}</h4>
                  <p class="text-[11px] italic leading-relaxed text-natural-text/90">{{ i18n.isVi() ? place.historyVi : place.historyEn }}</p>
                </div>
                <button type="button" class="flex w-full items-center justify-center gap-2 rounded-2xl bg-natural-accent py-3 text-xs font-black uppercase tracking-wider text-white shadow-sm transition duration-300 hover:bg-natural-olive" (click)="view(place)"><svg lucideCompass class="h-4 w-4 text-amber-300"></svg><span>{{ i18n.isVi() ? 'Xem Chi Tiết Lớn & Trải Nghiệm' : 'Immersive Details & Experiences' }}</span></button>
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <h4 class="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-500"><svg lucideMapPin class="h-3.5 w-3.5 text-red-500"></svg>{{ i18n.isVi() ? 'Vị trí trên sơ đồ VietCharm' : 'Sitemap Navigation Location' }}</h4>
                    <span class="rounded bg-stone-100 px-2 py-0.5 font-mono text-[9px] text-stone-500">X: {{ place.coordinates.x }} | Y: {{ place.coordinates.y }}</span>
                  </div>
                  <div class="relative flex h-44 items-center justify-center overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-50/50 shadow-inner">
                    <div class="absolute inset-0 bg-[radial-gradient(#059669_1px,transparent_1px)] opacity-10 [background-size:16px_16px]"></div>
                    <svg class="absolute inset-0 h-full w-full">
                      <path [attr.d]="'M 180 100 L ' + place.coordinates.x + ' ' + place.coordinates.y" fill="none" stroke="currentColor" stroke-width="2.5" stroke-dasharray="5,4" class="animate-pulse text-natural-accent"></path>
                      <path d="M 50 10 Q 150 110 320 220" fill="none" stroke="rgba(14,116,144,0.15)" stroke-width="8"></path>
                    </svg>
                    <div class="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center" style="left: 180px; top: 100px;">
                      <div class="relative"><span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span><div class="flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-amber-600 shadow-md"><span class="h-1.5 w-1.5 rounded-full bg-white"></span></div></div>
                      <span class="mt-1 whitespace-nowrap rounded-md bg-amber-950 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest text-white shadow-xs">🏨 VietCharm Resort</span>
                    </div>
                    <div class="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center" [style.left.px]="place.coordinates.x" [style.top.px]="place.coordinates.y">
                      <div class="relative"><span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span><div class="flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-red-500 shadow-md"><svg lucideMapPin class="h-2.5 w-2.5 text-white"></svg></div></div>
                      <span class="mt-1 whitespace-nowrap rounded-md bg-red-950 px-1.5 py-0.5 text-[8px] font-bold text-white shadow-xs">📍 {{ i18n.isVi() ? place.nameVi : place.nameEn }}</span>
                    </div>
                    <div class="absolute left-2 top-2 rounded-md bg-emerald-50 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-emerald-800">{{ i18n.isVi() ? 'Đường thủy Thu Bồn' : 'Thu Bon Waterway System' }}</div>
                  </div>
                </div>
                <div class="space-y-4 border-t border-stone-100 pt-4">
                  <h4 class="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-stone-500">
                    <span class="flex items-center gap-1.5"><svg lucideMessageSquare class="h-3.5 w-3.5 text-natural-accent"></svg>{{ i18n.isVi() ? 'Đánh giá từ du khách' : 'Traveler Reviews' }} ({{ place.reviews.length }})</span>
                    <span class="flex items-center gap-0.5 rounded bg-amber-50 px-2 py-0.5 font-bold text-amber-500">★ {{ place.rating }}</span>
                  </h4>
                  <div class="space-y-3">
                    @for (r of place.reviews; track r.id) {
                      <div class="space-y-1.5 rounded-2xl bg-stone-50 p-3">
                        <div class="flex items-center justify-between text-[10px]">
                          <div class="flex items-center gap-2"><img [src]="r.avatar" [alt]="r.author" class="h-5 w-5 rounded-full object-cover" /><span class="font-bold text-stone-700">{{ r.author }}</span></div>
                          <div class="flex items-center gap-1 text-stone-400"><span class="text-[9px] font-bold text-amber-500">{{ stars(r.rating) }}</span><span>• {{ r.date }}</span></div>
                        </div>
                        <p class="pl-7 text-[11px] italic leading-relaxed text-stone-600">"{{ r.comment }}"</p>
                      </div>
                    }
                  </div>
                  <form class="space-y-3 rounded-2xl border border-natural-border bg-natural-cream p-4" (ngSubmit)="addReview(place)">
                    <div class="text-[10px] font-black uppercase tracking-wider text-stone-500">✍️ {{ i18n.isVi() ? 'Để lại trải nghiệm của bạn' : 'Write a review' }}</div>
                    <div class="grid grid-cols-2 gap-2">
                      <input type="text" required [ngModel]="reviewerName()" (ngModelChange)="reviewerName.set($event)" name="rname" [placeholder]="i18n.isVi() ? 'Tên của bạn...' : 'Your name...'" class="rounded-xl border border-natural-border bg-white px-3 py-2 text-xs focus:border-natural-accent focus:outline-none" />
                      <div class="flex items-center gap-1.5 rounded-xl border border-natural-border bg-white px-3 py-2">
                        <span class="text-[10px] font-bold uppercase text-stone-400">{{ i18n.isVi() ? 'Điểm:' : 'Rating:' }}</span>
                        <div class="flex gap-0.5">
                          @for (n of [1,2,3,4,5]; track n) { <button type="button" (click)="reviewRating.set(n)"><svg lucideStar class="h-3.5 w-3.5" [class.text-amber-400]="n <= reviewRating()" [class.fill-amber-400]="n <= reviewRating()" [class.text-stone-300]="n > reviewRating()"></svg></button> }
                        </div>
                      </div>
                    </div>
                    <textarea required rows="2" [ngModel]="reviewComment()" (ngModelChange)="reviewComment.set($event)" name="rcomment" [placeholder]="i18n.isVi() ? 'Bạn thích điều gì nhất tại địa điểm này? Chia sẻ cảm nghĩ nhé...' : 'What did you enjoy most about this place?...'" class="w-full resize-none rounded-xl border border-natural-border bg-white p-3 text-xs leading-relaxed focus:border-natural-accent focus:outline-none"></textarea>
                    <button type="submit" class="w-full rounded-xl bg-natural-accent py-2 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-natural-olive">{{ i18n.isVi() ? 'Gửi đánh giá' : 'Submit Review' }}</button>
                  </form>
                </div>
              </div>
            </div>
          } @else {
            <div class="sticky top-28 rounded-3xl border border-dashed border-natural-border bg-natural-cream p-16 text-center">
              <svg lucideCompass class="mx-auto mb-4 h-16 w-16 animate-bounce text-stone-300"></svg>
              <h4 class="font-serif text-sm font-black uppercase tracking-wider text-stone-800">{{ i18n.isVi() ? 'Chưa chọn địa điểm' : 'No Place Selected' }}</h4>
              <p class="mx-auto mt-2 max-w-xs text-[11px] leading-relaxed text-stone-400">{{ i18n.isVi() ? 'Vui lòng nhấn chọn một địa điểm trong danh sách bên trái để khám phá hình ảnh, lịch sử truyền kỳ, toạ độ di chuyển và đánh giá chi tiết.' : 'Please select a place on the left to inspect stunning images, historical trivia, localized routes, and traveler testimonials.' }}</p>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class NearbyPlacesPageComponent {
  readonly places = signal<Place[]>(this.loadPlaces());
  readonly query = signal('');
  readonly category = signal('All');
  readonly activeId = signal<string | null>(null);
  readonly imageIdx = signal(0);
  readonly reviewerName = signal('');
  readonly reviewRating = signal(5);
  readonly reviewComment = signal('');

  readonly active = computed(() => this.places().find((p) => p.id === this.activeId()) ?? null);
  readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const cat = this.category();
    return this.places().filter((p) => {
      const matchQ = !q || `${p.nameVi} ${p.nameEn} ${p.descriptionVi} ${p.descriptionEn}`.toLowerCase().includes(q);
      const matchC = cat === 'All' || p.categoryVi === cat || p.categoryEn === cat;
      return matchQ && matchC;
    });
  });

  constructor(
    readonly i18n: I18nService,
    readonly ui: UiStateService,
  ) {}

  private loadPlaces(): Place[] {
    if (typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem('vc_nearby_places');
        if (saved) return JSON.parse(saved) as Place[];
      } catch {
        // ignore malformed cache
      }
    }
    return INITIAL_PLACES;
  }

  private persist(next: Place[]): void {
    this.places.set(next);
    if (typeof localStorage !== 'undefined') localStorage.setItem('vc_nearby_places', JSON.stringify(next));
  }

  categories(): Array<{ value: string; label: string }> {
    const vi = this.i18n.isVi();
    return [
      { value: 'All', label: vi ? 'Tất cả địa điểm' : 'All places' },
      { value: 'Di sản văn hóa', label: vi ? 'Di sản văn hóa' : 'Cultural Heritage' },
      { value: 'Bãi biển & Thiên nhiên', label: vi ? 'Bãi biển & Thiên nhiên' : 'Beach & Nature' },
      { value: 'Trải nghiệm sinh thái', label: vi ? 'Trải nghiệm sinh thái' : 'Eco-experience' },
      { value: 'Làng nghề truyền thống', label: vi ? 'Làng nghề truyền thống' : 'Traditional Craft' },
    ];
  }

  stars(n: number): string {
    return '★'.repeat(n);
  }

  select(place: Place): void {
    this.activeId.set(place.id);
    this.imageIdx.set(0);
  }

  asItem(place: Place): ViewableItem {
    const vi = this.i18n.isVi();
    return {
      id: place.id,
      type: 'nearby-place',
      name: vi ? place.nameVi : place.nameEn,
      image: place.images[0],
      price: 0,
      description: vi ? place.descriptionVi : place.descriptionEn,
      rating: place.rating,
      reviewsCount: `${place.totalReviews}`,
      duration: place.duration,
      distance: place.distance,
      history: vi ? place.historyVi : place.historyEn,
      coordinates: place.coordinates,
    };
  }

  view(place: Place): void {
    this.ui.viewItem(this.asItem(place));
  }

  addReview(place: Place): void {
    if (!this.reviewerName().trim() || !this.reviewComment().trim()) return;
    const newReview: PlaceReview = {
      id: `review-${Date.now()}`,
      author: this.reviewerName(),
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      rating: this.reviewRating(),
      date: new Date().toISOString().split('T')[0],
      comment: this.reviewComment(),
    };
    const next = this.places().map((p) => {
      if (p.id !== place.id) return p;
      const reviews = [newReview, ...p.reviews];
      const avg = Number((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1));
      return { ...p, reviews, rating: avg, totalReviews: reviews.length };
    });
    this.persist(next);
    this.reviewerName.set('');
    this.reviewComment.set('');
    this.reviewRating.set(5);
  }
}

@Component({
  selector: 'app-not-found-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="mx-auto max-w-3xl px-4 py-20 text-center">
      <p class="text-xs font-black uppercase tracking-[0.25em] text-natural-accent">404</p>
      <h1 class="mt-3 font-serif text-5xl font-black text-natural-ink">{{ i18n.isVi() ? 'Không tìm thấy trang' : 'Page not found' }}</h1>
      <a routerLink="/" class="mt-8 inline-flex min-h-12 items-center rounded-full bg-natural-accent px-6 text-sm font-black text-white">{{ i18n.isVi() ? 'Về trang chủ' : 'Go home' }}</a>
    </section>
  `,
})
export class NotFoundPageComponent {
  constructor(readonly i18n: I18nService) {}
}

export const DISCOVERY_ALL_ITEMS = allCatalogItems;
