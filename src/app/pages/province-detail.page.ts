import { Component, computed, effect, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  LucideArrowRight,
  LucideBadgePercent,
  LucideBike,
  LucideCar,
  LucideCheckCircle2,
  LucideChevronDown,
  LucideChevronRight,
  LucideCompass,
  LucideHeadset,
  LucideHeart,
  LucideNavigation2,
  LucideShieldCheck,
  LucideSparkles,
  LucideStar,
} from '@lucide/angular';
import { activitiesByProvince, attractionsByProvince, hotelsByProvince, provinces, vehicles } from '@/data';
import { getProvinceHero } from '@/constants/provinceHero';
import type { ViewableItem } from '@/types';
import { CartService } from '@/services/cart.service';
import { I18nService } from '@/services/i18n.service';
import { UiStateService } from '@/services/ui-state.service';
import { RevealDirective } from '@/components/reveal.directive';

type ActivityCategory = 'all' | 'heritage' | 'culinary' | 'nature' | 'adventure';
type PriceTier = 'all' | 'under-200k' | '200k-500k' | 'over-500k';

interface DetailReview {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
}

const SEED_REVIEWS: DetailReview[] = [
  { id: 'rv1', author: 'Ngọc Anh', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80', rating: 5, date: '2026-06-21', comment: 'Dịch vụ chuẩn chỉnh, khách sạn view sông tuyệt đẹp, sẽ quay lại VietCharm lần nữa!' },
  { id: 'rv2', author: 'Minh Đức', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80', rating: 5, date: '2026-06-17', comment: 'Đặt combo tiết kiệm hơn hẳn, xe giao tận nơi đúng giờ, hoạt động rất đáng trải nghiệm.' },
  { id: 'rv3', author: 'Sarah L.', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80', rating: 4, date: '2026-06-11', comment: 'Smooth booking flow and lovely heritage stays. The lantern night tour was magical!' },
];

@Component({
  selector: 'app-province-detail-page',
  standalone: true,
  imports: [
    DecimalPipe,
    FormsModule,
    RouterLink,
    RevealDirective,
    LucideArrowRight,
    LucideBadgePercent,
    LucideBike,
    LucideCar,
    LucideCheckCircle2,
    LucideChevronDown,
    LucideChevronRight,
    LucideCompass,
    LucideHeadset,
    LucideHeart,
    LucideNavigation2,
    LucideShieldCheck,
    LucideSparkles,
    LucideStar,
  ],
  template: `
    <div class="space-y-0">
      <!-- HERO -->
      <div class="relative flex h-[340px] w-full items-center overflow-hidden sm:h-[480px] md:h-[600px]">
        <img [src]="hero().image" alt="Province background" class="animate-kenburns absolute inset-0 h-full w-full select-none object-cover" />
        <div class="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-black/35 to-black/15"></div>
        <div class="absolute inset-0 z-10 bg-gradient-to-r from-black/55 via-transparent to-transparent"></div>
        <div class="absolute inset-0 z-10 opacity-60 mix-blend-soft-light" style="background: radial-gradient(120% 90% at 15% 100%, rgba(227,176,75,0.45), transparent 60%);"></div>
        <div class="absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-t from-natural-bg/90 to-transparent"></div>
        <div class="relative z-20 mx-auto w-full max-w-7xl px-4 text-white">
          <div class="hero-stagger space-y-2.5 md:space-y-4">
            <div class="flex items-center gap-3"><span class="h-px w-10 bg-natural-gold/80"></span><p class="text-gold-gradient font-serif text-base font-semibold italic tracking-wide md:text-2xl">Khám phá vẻ đẹp</p></div>
            <h2 class="font-serif text-4xl font-black uppercase tracking-[0.06em] text-white sm:text-6xl md:text-8xl" style="text-shadow: 0 4px 30px rgba(0,0,0,0.55);">{{ hero().title }}</h2>
            <p class="max-w-xl text-sm font-medium leading-relaxed text-stone-100/90 drop-shadow-md md:text-lg">{{ hero().subtitle }}</p>
            <div class="pt-2"><button type="button" class="btn-sheen group inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-natural-gold via-amber-300 to-natural-gold-deep px-7 py-3 text-xs font-black uppercase tracking-widest text-stone-950 shadow-luxe-lg transition duration-200 hover:-translate-y-0.5 active:scale-95 sm:px-9 sm:py-3.5 sm:text-sm" (click)="scrollTo('featured-attractions-section')"><span>{{ t().exploreNow }}</span><span class="transition-transform duration-200 group-hover:translate-x-1">→</span></button></div>
          </div>
        </div>
      </div>

      <!-- SEARCH BAR -->
      <div class="relative z-30 mx-auto max-w-7xl -translate-y-10 px-4 sm:-translate-y-14">
        <div class="glass-panel flex flex-col items-stretch justify-between gap-4 rounded-3xl p-4 shadow-luxe-lg md:flex-row md:p-6">
          <div class="flex-1 space-y-1 border-b border-stone-150 pb-3 md:border-b-0 md:border-r md:pb-0 md:pr-4">
            <span class="block text-[10px] font-black uppercase tracking-wider text-stone-400">{{ t().heroSearchTitle }}</span>
            <input type="text" [ngModel]="searchInput()" (ngModelChange)="searchInput.set($event)" [placeholder]="t().searchPlaceholder" class="w-full bg-transparent text-xs font-bold text-stone-900 outline-none placeholder:text-stone-400 sm:text-sm" />
          </div>
          <div class="flex-1 space-y-1 border-b border-stone-150 pb-3 md:border-b-0 md:border-r md:px-4 md:pb-0">
            <span class="block text-[10px] font-black uppercase tracking-wider text-stone-400">{{ t().checkIn }}</span>
            <input type="date" [min]="today" [ngModel]="checkIn()" (ngModelChange)="setCheckIn($event)" name="ci" class="w-full bg-transparent text-xs font-bold text-stone-700 outline-none sm:text-sm" />
          </div>
          <div class="flex-1 space-y-1 border-b border-stone-150 pb-3 md:border-b-0 md:border-r md:px-4 md:pb-0">
            <span class="block text-[10px] font-black uppercase tracking-wider text-stone-400">{{ t().checkOut }}</span>
            <input type="date" [min]="minCheckOut()" [ngModel]="checkOut()" (ngModelChange)="checkOut.set($event)" name="co" class="w-full bg-transparent text-xs font-bold text-stone-700 outline-none sm:text-sm" />
          </div>
          <div class="relative flex-1 space-y-1 border-b border-stone-150 pb-3 md:border-b-0 md:px-4 md:pb-0">
            <span class="block text-[10px] font-black uppercase tracking-wider text-stone-400">{{ t().guestsNum }}</span>
            <button type="button" class="group -m-1 flex w-full items-center justify-between rounded-lg p-1 text-left transition hover:bg-stone-50/50" (click)="showGuests.update((v) => !v)">
              <span class="block text-xs font-bold text-stone-700 sm:text-sm">{{ i18n.isVi() ? guests() + ' Khách, ' + rooms() + ' Phòng' : guests() + ' Guests, ' + rooms() + ' Rooms' }}</span>
              <svg lucideChevronDown class="h-4 w-4 text-stone-400 transition group-hover:text-stone-600"></svg>
            </button>
            @if (showGuests()) {
              <div class="fixed inset-0 z-40" (click)="showGuests.set(false)"></div>
              <div class="absolute left-0 top-full z-50 mt-2 w-64 space-y-4 rounded-2xl border border-natural-border bg-white p-4 shadow-xl md:right-0">
                <div class="flex items-center justify-between">
                  <div class="space-y-0.5"><span class="block text-xs font-bold text-stone-800">{{ i18n.isVi() ? 'Số khách' : 'Guests' }}</span><span class="block text-[10px] text-stone-500">{{ i18n.isVi() ? 'Người lớn & trẻ em' : 'Adults & children' }}</span></div>
                  <div class="flex items-center gap-3"><button type="button" class="stepper" [disabled]="guests() <= 1" (click)="guests.set(max(1, guests() - 1))">-</button><span class="w-4 text-center text-xs font-bold text-stone-800">{{ guests() }}</span><button type="button" class="stepper-plus" (click)="guests.set(min(20, guests() + 1))">+</button></div>
                </div>
                <div class="flex items-center justify-between border-t border-stone-100 pt-3">
                  <div class="space-y-0.5"><span class="block text-xs font-bold text-stone-800">{{ i18n.isVi() ? 'Số phòng' : 'Rooms' }}</span><span class="block text-[10px] text-stone-500">{{ i18n.isVi() ? 'Số phòng ngủ cần đặt' : 'Rooms needed' }}</span></div>
                  <div class="flex items-center gap-3"><button type="button" class="stepper" [disabled]="rooms() <= 1" (click)="rooms.set(max(1, rooms() - 1))">-</button><span class="w-4 text-center text-xs font-bold text-stone-800">{{ rooms() }}</span><button type="button" class="stepper-plus" (click)="rooms.set(min(10, rooms() + 1))">+</button></div>
                </div>
                <button type="button" class="w-full rounded-xl bg-natural-accent py-2 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-natural-olive" (click)="showGuests.set(false)">{{ i18n.isVi() ? 'Áp dụng' : 'Apply' }}</button>
              </div>
            }
          </div>
          <button type="button" class="btn-sheen self-center shrink-0 rounded-2xl bg-gradient-to-br from-natural-gold via-amber-300 to-natural-gold-deep px-6 py-3 text-xs font-black uppercase tracking-wide text-stone-950 shadow-luxe transition duration-200 hover:-translate-y-0.5 hover:shadow-luxe-lg active:scale-95 md:w-fit md:text-sm" (click)="applySearch()">{{ t().searchBtn }}</button>
        </div>
      </div>

      <!-- BREADCRUMB -->
      <div class="mx-auto -mt-6 max-w-7xl px-4 pb-6">
        <nav class="flex flex-wrap items-center gap-2 text-xs font-bold text-stone-500">
          <a routerLink="/" class="transition hover:text-natural-accent">{{ i18n.isVi() ? 'Trang chủ' : 'Home' }}</a>
          <span aria-hidden="true">/</span>
          <a routerLink="/discover" class="transition hover:text-natural-accent">{{ i18n.isVi() ? 'Miền Trung' : 'Central Vietnam' }}</a>
          <span aria-hidden="true">/</span>
          <span class="text-natural-text" aria-current="page">{{ province()?.name || provinceId() }}</span>
        </nav>
      </div>

      <!-- USPS -->
      <div reveal class="mx-auto max-w-7xl px-4 pb-12">
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          @for (usp of usps(); track usp.title; let i = $index) {
            <div class="group flex h-full items-start gap-3.5 rounded-2xl border border-natural-border bg-white/70 p-4 transition duration-300 ease-out hover:-translate-y-1 hover:border-natural-gold/45 hover:shadow-luxe">
              <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-natural-gold/25 to-natural-bronze/15 text-natural-bronze transition group-hover:from-natural-gold/40">
                @switch (i) {
                  @case (0) { <svg lucideShieldCheck class="h-5 w-5"></svg> }
                  @case (1) { <svg lucideSparkles class="h-5 w-5"></svg> }
                  @case (2) { <svg lucideHeadset class="h-5 w-5"></svg> }
                  @default { <svg lucideBadgePercent class="h-5 w-5"></svg> }
                }
              </span>
              <div class="space-y-1"><span class="block text-sm font-bold text-stone-900">{{ usp.title }}</span><p class="text-[11px] leading-relaxed text-stone-500">{{ usp.subtitle }}</p></div>
            </div>
          }
        </div>
      </div>

      <!-- BLIND TRAVEL BANNER -->
      <section reveal class="w-full border-y border-natural-border bg-[#1F261F] px-4 py-12 text-white shadow-inner">
        <div class="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div class="max-w-2xl">
            <span class="text-[11px] font-black uppercase tracking-[0.24em] text-natural-gold">{{ i18n.isVi() ? 'Hành trình ẩn số' : 'Blind Travel' }}</span>
            <h2 class="mt-2 font-serif text-3xl font-black tracking-tight md:text-5xl">{{ i18n.isVi() ? 'Đi thẳng tới chuyến đi bất ngờ.' : 'Go straight to a surprise trip.' }}</h2>
            <p class="mt-3 text-sm leading-relaxed text-white/70">{{ i18n.isVi() ? 'Khám phá một chuyến đi bất ngờ với điểm đến và combo phù hợp được VietCharm gợi ý sẵn.' : 'Skip the long brief. VietCharm will open a mystery journey with a ready-made suggested bundle.' }}</p>
          </div>
          <a routerLink="/blind-travel" class="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-natural-gold px-5 text-xs font-black uppercase tracking-wide text-natural-ink shadow-lg transition hover:bg-natural-gold-dark md:self-center"><svg lucideSparkles class="h-4 w-4"></svg><span>{{ i18n.isVi() ? 'Mở hành trình ẩn số' : 'Open Blind Travel' }}</span><svg lucideArrowRight class="h-4 w-4"></svg></a>
        </div>
      </section>

      <!-- VISIT OTHER PROVINCES -->
      <div class="border-y border-natural-border bg-natural-beige py-10 text-natural-text">
        <div class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 md:flex-row">
          <div>
            <h4 class="flex items-center gap-1.5 font-serif text-lg font-bold uppercase text-natural-text"><svg lucideNavigation2 class="h-5 w-5 text-natural-accent"></svg><span>{{ t().visitOtherProvinces }}</span></h4>
            <p class="mt-1 max-w-xl text-xs leading-relaxed text-natural-text/80">{{ i18n.isVi() ? 'Dễ dàng di chuyển bằng xe máy Sirius chỉ mất 1 tiếng từ Hội An đến các cây cầu nổi tiếng của Đà Nẵng hoặc cung điện nguy nga của Huế.' : 'Effortlessly commute by rented Sirius motorbikes within 1 hour between Hội An, Đà Nẵng beach and Cố Đô Huế.' }}</p>
          </div>
          <a routerLink="/discover" class="rounded-xl border border-natural-border bg-natural-bg px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-natural-accent shadow-xs transition hover:bg-natural-beige">{{ i18n.isVi() ? 'Xem điểm đến khác' : 'Explore other destinations' }}</a>
        </div>
      </div>

      <!-- FEATURED ATTRACTIONS -->
      <div reveal id="featured-attractions-section" class="mx-auto max-w-7xl px-4 py-16">
        <div class="mb-8 flex items-end justify-between border-b border-amber-200/50 pb-4">
          <div>
            <span class="text-gold-gradient text-[11px] font-black uppercase tracking-[0.22em]">{{ i18n.isVi() ? 'Tuyển chọn nổi bật' : 'Handpicked' }}</span>
            <h3 class="mt-1 font-serif text-xl font-black uppercase tracking-tight text-stone-900 md:text-3xl">{{ t().featuredSpots }}</h3>
            <p class="mt-1 text-xs text-stone-500">{{ t().spotSubtitle }}</p>
          </div>
          <button type="button" class="group flex shrink-0 items-center gap-1 text-xs font-bold text-amber-700 transition hover:text-stone-900" (click)="ui.openAllServices('attractions', provinceId())">{{ i18n.isVi() ? 'Xem tất cả' : 'View all' }}<svg lucideArrowRight class="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"></svg></button>
        </div>
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          @for (spot of attractions(); track spot.id) {
            <div class="group h-full cursor-pointer overflow-hidden rounded-2xl border border-stone-150 bg-white shadow-xs transition duration-300 ease-out hover:-translate-y-1.5 hover:border-natural-gold/45 hover:shadow-luxe-lg" (click)="ui.viewItem(attractionItem(spot))">
              <div class="relative h-44 overflow-hidden">
                <img [src]="spot.image" [alt]="spot.name" class="h-full w-full object-cover transition duration-[600ms] ease-out group-hover:scale-110" />
                <button type="button" class="absolute left-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-natural-border bg-natural-bg/95 shadow-sm backdrop-blur-md transition hover:scale-110" (click)="$event.stopPropagation(); ui.toggleFavorite(attractionItem(spot))"><svg lucideHeart class="h-4 w-4 transition duration-200" [class.text-rose-600]="ui.isFavorite(spot.id)" [class.fill-rose-600]="ui.isFavorite(spot.id)" [class.text-stone-400]="!ui.isFavorite(spot.id)"></svg></button>
                <div class="absolute right-3 top-3 flex items-center gap-0.5 rounded-lg border border-stone-200 bg-white/90 px-2 py-0.5 text-[10px] font-bold text-stone-800 backdrop-blur-md"><svg lucideStar class="h-3.5 w-3.5 fill-amber-400 stroke-amber-400"></svg><span>{{ spot.rating }} ({{ spot.reviewsCount }})</span></div>
              </div>
              <div class="p-4"><h4 class="line-clamp-1 font-serif text-sm font-bold leading-snug tracking-tight text-stone-900 transition-colors group-hover:text-natural-accent">{{ spot.name }}</h4><p class="mt-1 line-clamp-2 text-[11px] leading-relaxed text-stone-500">{{ spot.description }}</p></div>
            </div>
          }
        </div>
      </div>

      <!-- BOOKING DETAILS -->
      <div class="w-full space-y-16 bg-natural-bg px-4 py-14">
        <div class="mx-auto max-w-7xl space-y-16">
          <!-- Hotels -->
          <section reveal id="hotels-section" class="scroll-mt-20">
            <div class="mb-8 flex items-end justify-between border-b border-natural-border pb-4">
              <div>
                <h3 class="font-serif text-xl font-bold uppercase tracking-tight text-natural-text md:text-2xl">{{ t().lovedHotels }}</h3>
                <p class="mt-1 text-xs text-natural-text/70">{{ t().hotelSubtitle }}</p>
                @if (query()) { <p class="mt-2 text-[11px] font-bold text-natural-accent">{{ i18n.isVi() ? 'Đang lọc theo: "' + query() + '"' : 'Filtered by: "' + query() + '"' }}</p> }
              </div>
              <button type="button" class="flex items-center gap-1 text-xs font-bold text-natural-accent transition hover:text-natural-olive" (click)="ui.openAllServices('hotels', provinceId())">{{ i18n.isVi() ? 'Xem tất cả' : 'View all' }}<svg lucideChevronRight class="h-4 w-4"></svg></button>
            </div>
            @if (filteredHotels().length === 0) { <p class="rounded-3xl border border-dashed border-natural-border bg-natural-cream py-10 text-center text-xs text-stone-400">{{ i18n.isVi() ? 'Không tìm thấy khách sạn phù hợp từ khóa hiện tại.' : 'No hotels match your current search.' }}</p> }
            @else {
              <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                @for (hotel of filteredHotels().slice(0, 4); track hotel.id) {
                  <div class="flex cursor-pointer flex-col justify-between overflow-hidden rounded-3xl border border-natural-border bg-natural-beige-light shadow-xs transition duration-300 hover:border-natural-accent hover:shadow-xl" (click)="ui.viewItem(hotelItem(hotel))">
                    <div class="relative h-48 overflow-hidden">
                      <img [src]="hotel.image" [alt]="hotel.name" class="h-full w-full object-cover transition hover:scale-105" />
                      <button type="button" class="absolute left-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-natural-border bg-natural-bg/95 shadow-sm backdrop-blur-md transition hover:scale-110" (click)="$event.stopPropagation(); ui.toggleFavorite(hotelItem(hotel))"><svg lucideHeart class="h-4 w-4 transition duration-200" [class.text-rose-600]="ui.isFavorite(hotel.id)" [class.fill-rose-600]="ui.isFavorite(hotel.id)" [class.text-stone-400]="!ui.isFavorite(hotel.id)"></svg></button>
                      <div class="absolute right-3 top-3 flex items-center gap-0.5 rounded-lg border border-natural-border bg-natural-bg/95 px-2 py-0.5 text-[10px] font-bold text-natural-text shadow-sm backdrop-blur-md"><svg lucideStar class="h-3.5 w-3.5 fill-natural-gold stroke-natural-gold"></svg><span>{{ hotel.rating }}</span></div>
                    </div>
                    <div class="flex flex-1 flex-col justify-between space-y-3 p-4">
                      <div><h4 class="line-clamp-2 min-h-[40px] font-serif text-sm font-bold leading-snug tracking-tight text-natural-text">{{ hotel.name }}</h4><p class="mt-1 line-clamp-2 min-h-[32px] text-[11px] text-natural-text/80">{{ hotel.description }}</p></div>
                      <div class="flex items-center justify-between border-t border-natural-border pt-2">
                        <div><span class="mb-0.5 block text-[10px] font-bold uppercase text-natural-accent">{{ i18n.isVi() ? 'GIÁ CHỈ TỪ' : 'FROM ONLY' }}</span><span class="font-mono text-sm font-black text-natural-accent">{{ hotel.pricePerNight | number : '1.0-0' }}đ</span><span class="text-[10px] text-natural-text/60">{{ t().perNight }}</span></div>
                        @if (cart.isInCart(hotel.id)) {
                          <button type="button" class="flex items-center gap-1 rounded-xl border border-natural-border bg-natural-beige px-3 py-1.5 text-[11px] font-bold text-natural-text transition hover:bg-natural-border" (click)="$event.stopPropagation(); cart.removeItem(hotel.id)"><svg lucideCheckCircle2 class="h-3.5 w-3.5 text-emerald-600"></svg><span>{{ i18n.isVi() ? 'Đã thêm' : 'In Bundle' }}</span></button>
                        } @else {
                          <button type="button" class="rounded-xl bg-natural-accent px-3.5 py-2 text-[11px] font-bold text-white shadow-xs transition hover:bg-natural-olive" (click)="$event.stopPropagation(); ui.viewItem(hotelItem(hotel))">{{ i18n.isVi() ? 'Đặt phòng' : 'Book' }}</button>
                        }
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
          </section>

          <!-- Vehicles -->
          <section reveal id="rentals-section" class="scroll-mt-20">
            <div class="mb-8 flex items-end justify-between border-b border-natural-border pb-4">
              <div><h3 class="font-serif text-xl font-bold uppercase tracking-tight text-natural-text md:text-2xl">{{ t().rentVehicles }}</h3><p class="mt-1 text-xs text-natural-text/70">{{ i18n.isVi() ? 'Ô tô tự lái và xe máy đời mới, bảo dưỡng kỹ, giao xe tận nơi.' : 'Late-model self-drive cars & scooters, well-maintained and delivered to you.' }}</p></div>
              <button type="button" class="flex items-center gap-1 text-xs font-bold text-natural-accent transition hover:text-natural-olive" (click)="ui.openAllServices('vehicles', provinceId())">{{ i18n.isVi() ? 'Xem tất cả' : 'View all' }}<svg lucideChevronRight class="h-4 w-4"></svg></button>
            </div>
            <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              @for (veh of filteredVehicles().slice(0, 6); track veh.id) {
                <div class="flex cursor-pointer items-center gap-4 overflow-hidden rounded-3xl border border-natural-border bg-natural-beige-light p-4 shadow-xs transition hover:border-natural-accent hover:shadow-lg" (click)="ui.viewItem(vehicleItem(veh))">
                  <div class="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-natural-beige">
                    <img [src]="veh.image" [alt]="veh.name" class="h-full w-full object-cover" />
                    <button type="button" class="absolute left-1 top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white/95 shadow-sm transition hover:scale-110" (click)="$event.stopPropagation(); ui.toggleFavorite(vehicleItem(veh))"><svg lucideHeart class="h-3.5 w-3.5 transition duration-200" [class.text-rose-600]="ui.isFavorite(veh.id)" [class.fill-rose-600]="ui.isFavorite(veh.id)" [class.text-stone-400]="!ui.isFavorite(veh.id)"></svg></button>
                    <div class="absolute bottom-1 right-1 rounded-full bg-black/70 p-1 text-white">@if (veh.type === 'motorbike') { <svg lucideBike class="h-3.5 w-3.5"></svg> } @else { <svg lucideCar class="h-3.5 w-3.5"></svg> }</div>
                  </div>
                  <div class="flex flex-1 flex-col justify-between space-y-2">
                    <div><h4 class="font-serif text-xs font-bold leading-snug tracking-tight text-natural-text md:text-sm">{{ veh.name }}</h4><p class="line-clamp-1 text-[10px] leading-relaxed text-natural-text/75">{{ veh.specs }}</p></div>
                    <div class="flex items-center justify-between border-t border-natural-border pt-1">
                      <div><span class="font-mono text-xs font-bold text-natural-accent">{{ veh.pricePerDay | number : '1.0-0' }}đ</span><span class="text-[10px] text-natural-text/60">/{{ i18n.isVi() ? 'ngày' : 'day' }}</span></div>
                      @if (cart.isInCart(veh.id)) {
                        <button type="button" class="rounded-lg border border-natural-border bg-natural-beige px-2.5 py-1.5 text-[10px] font-bold text-natural-text transition hover:bg-natural-border" (click)="$event.stopPropagation(); cart.removeItem(veh.id)">{{ i18n.isVi() ? 'Bỏ chọn' : 'Remove' }}</button>
                      } @else {
                        <button type="button" class="rounded-lg bg-natural-accent px-3 py-1.5 text-[10px] font-bold text-white shadow-xs transition hover:bg-natural-olive" (click)="$event.stopPropagation(); ui.viewItem(vehicleItem(veh))">{{ i18n.isVi() ? 'Chọn thuê' : 'Rent Vehicle' }}</button>
                      }
                    </div>
                  </div>
                </div>
              }
            </div>
          </section>

          <!-- Activities -->
          <section reveal id="experiences-section" class="scroll-mt-20">
            <div class="mb-8 flex flex-col items-start justify-between gap-4 border-b border-natural-border pb-4 md:flex-row md:items-end">
              <div><h3 class="font-serif text-xl font-bold uppercase tracking-tight text-natural-text md:text-2xl">{{ t().activitiesTitle }}</h3><p class="mt-1 text-xs text-natural-text/70">{{ t().activitiesSubtitle }}</p></div>
              <div class="flex items-center gap-3">
                <button type="button" class="flex items-center gap-1 text-xs font-bold text-natural-accent transition hover:text-natural-olive" (click)="ui.openAllServices('activities', provinceId())">{{ i18n.isVi() ? 'Xem tất cả' : 'View all' }}<svg lucideChevronRight class="h-4 w-4"></svg></button>
                <span class="rounded-full border border-natural-border bg-natural-beige px-3.5 py-1.5 text-xs font-bold text-natural-accent">{{ i18n.isVi() ? 'Tìm thấy ' + filteredActivities().length + ' hoạt động' : 'Found ' + filteredActivities().length + ' activities' }}</span>
              </div>
            </div>
            <div class="mb-6 flex flex-col justify-between gap-4 rounded-2xl border border-natural-border bg-natural-cream p-4 text-xs sm:flex-row">
              <div class="space-y-1.5">
                <span class="block font-bold uppercase tracking-wider text-stone-500">{{ i18n.isVi() ? 'Phân loại chủ đề' : 'Filter by Theme' }}</span>
                <div class="flex flex-wrap gap-1.5">
                  @for (c of categoryOptions(); track c.id) { <button type="button" [class]="'rounded-lg px-3 py-1.5 font-semibold transition ' + (category() === c.id ? 'bg-natural-accent text-white' : 'border border-stone-150 bg-white text-stone-600 hover:bg-stone-50')" (click)="category.set(c.id)">{{ c.label }}</button> }
                </div>
              </div>
              <div class="space-y-1.5">
                <span class="block font-bold uppercase tracking-wider text-stone-500">{{ i18n.isVi() ? 'Lọc theo giá vé' : 'Filter by Budget' }}</span>
                <div class="flex flex-wrap gap-1.5">
                  @for (tier of tierOptions(); track tier.id) { <button type="button" [class]="'rounded-lg px-3 py-1.5 font-semibold transition ' + (priceTier() === tier.id ? 'bg-natural-accent text-white' : 'border border-stone-150 bg-white text-stone-600 hover:bg-stone-50')" (click)="priceTier.set(tier.id)">{{ tier.label }}</button> }
                </div>
              </div>
            </div>
            @if (filteredActivities().length === 0) {
              <div class="rounded-3xl border border-dashed border-natural-border bg-natural-cream py-10 text-center text-xs text-stone-400"><svg lucideCompass class="mx-auto mb-2 h-8 w-8 text-stone-300"></svg><p>{{ i18n.isVi() ? 'Không có hoạt động nào phù hợp bộ lọc hiện tại. Thử chọn lại chủ đề hoặc ngân sách khác!' : 'No activities match the current filters. Expand your budget or category.' }}</p></div>
            } @else {
              <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
                @for (act of filteredActivities().slice(0, 10); track act.id) {
                  <div class="flex cursor-pointer flex-col justify-between overflow-hidden rounded-3xl border border-natural-border bg-natural-beige-light shadow-xs transition duration-300 hover:border-natural-accent hover:shadow-lg" (click)="ui.viewItem(activityItem(act))">
                    <div class="relative h-36 overflow-hidden">
                      <img [src]="act.image" [alt]="act.name" class="h-full w-full object-cover transition hover:scale-105" />
                      <button type="button" class="absolute left-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 shadow-sm transition hover:scale-110" (click)="$event.stopPropagation(); ui.toggleFavorite(activityItem(act))"><svg lucideHeart class="h-3.5 w-3.5 transition duration-200" [class.text-rose-600]="ui.isFavorite(act.id)" [class.fill-rose-600]="ui.isFavorite(act.id)" [class.text-stone-400]="!ui.isFavorite(act.id)"></svg></button>
                      <div class="absolute right-2 top-2 flex items-center gap-0.5 rounded bg-black/50 px-1.5 py-0.5 text-[9px] font-bold text-white"><svg lucideStar class="h-3 w-3 fill-amber-400 stroke-amber-400"></svg><span>{{ act.rating }}</span></div>
                    </div>
                    <div class="flex flex-1 flex-col justify-between space-y-2 p-3">
                      <h4 class="line-clamp-2 min-h-[34px] font-serif text-xs font-bold leading-snug tracking-tight text-natural-text">{{ act.name }}</h4>
                      <div class="flex items-center justify-between border-t border-natural-border pt-2">
                        <div><span class="font-mono text-xs font-bold text-natural-accent">{{ act.price | number : '1.0-0' }}đ</span></div>
                        <button type="button" class="rounded-lg bg-natural-accent px-2.5 py-1 text-[10px] font-bold text-white shadow-xs transition hover:bg-natural-olive" (click)="$event.stopPropagation(); ui.viewItem(activityItem(act))">{{ i18n.isVi() ? 'Xem' : 'View' }}</button>
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
          </section>

          <!-- Reviews -->
          <section reveal id="reviews-section" class="rounded-3xl border border-natural-border bg-natural-beige p-6 md:p-8">
            <h3 class="text-xl font-bold uppercase text-natural-text md:text-2xl">{{ i18n.isVi() ? 'Đánh giá từ khách hàng' : 'Customer Reviews' }}</h3>
            <div class="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
              <div class="space-y-3">
                @for (rev of reviews(); track rev.id) {
                  <div class="rounded-2xl border border-natural-border bg-white p-4">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2"><img [src]="rev.avatar" [alt]="rev.author" class="h-8 w-8 rounded-full object-cover" /><div><h5 class="text-xs font-bold text-natural-text">{{ rev.author }}</h5><div class="text-amber-500">{{ stars(rev.rating) }}</div></div></div>
                      <span class="text-[10px] text-stone-400">{{ rev.date }}</span>
                    </div>
                    <p class="mt-2 text-xs italic leading-relaxed text-stone-600">"{{ rev.comment }}"</p>
                  </div>
                }
              </div>
              <form class="h-fit space-y-3 rounded-2xl border border-natural-border bg-white p-5" (ngSubmit)="addReview()">
                <h4 class="mb-1 border-b border-natural-border pb-2 font-serif text-sm font-bold uppercase text-natural-text">{{ i18n.isVi() ? 'Viết đánh giá' : 'Write a review' }}</h4>
                <input type="text" required [ngModel]="revAuthor()" (ngModelChange)="revAuthor.set($event)" name="ra" [placeholder]="i18n.isVi() ? 'Tên của bạn...' : 'Your name...'" class="w-full rounded-xl border border-natural-border bg-natural-beige-light px-3 py-2 text-xs outline-none focus:border-natural-accent" />
                <div class="flex items-center gap-1.5">
                  <span class="text-[10px] font-bold uppercase text-stone-400">{{ i18n.isVi() ? 'Điểm:' : 'Rating:' }}</span>
                  @for (n of [1,2,3,4,5]; track n) { <button type="button" (click)="revRating.set(n)"><svg lucideStar class="h-4 w-4" [class.text-amber-400]="n <= revRating()" [class.fill-amber-400]="n <= revRating()" [class.text-stone-300]="n > revRating()"></svg></button> }
                </div>
                <textarea required rows="3" [ngModel]="revComment()" (ngModelChange)="revComment.set($event)" name="rc" [placeholder]="i18n.isVi() ? 'Chia sẻ trải nghiệm của bạn...' : 'Share your experience...'" class="w-full resize-none rounded-xl border border-natural-border bg-natural-beige-light p-3 text-xs leading-relaxed outline-none focus:border-natural-accent"></textarea>
                <button type="submit" class="w-full rounded-xl bg-natural-accent py-2.5 text-xs font-black uppercase tracking-widest text-white transition hover:bg-natural-olive">{{ i18n.isVi() ? 'Đăng đánh giá' : 'Submit Review' }}</button>
              </form>
            </div>
          </section>
        </div>
      </div>

      <!-- NEWSLETTER -->
      <div reveal class="w-full bg-natural-accent px-4 py-14 text-white shadow-inner">
        <div class="mx-auto max-w-3xl space-y-6 text-center">
          <div class="space-y-2"><h3 class="font-serif text-2xl font-bold tracking-tight text-natural-bg md:text-4xl">{{ t().promoBannerTitle }}</h3><p class="mx-auto max-w-xl text-xs leading-relaxed text-natural-beige/90 md:text-sm">{{ i18n.isVi() ? 'Đăng ký email để nhận gợi ý điểm đến, ưu đãi và lịch trình theo từng vùng cùng VietCharm.' : 'Subscribe for destination ideas, deals, and regional itineraries from VietCharm.' }}</p></div>
          <form class="mx-auto flex max-w-md gap-2" (ngSubmit)="subscribe()">
            <input type="email" required [ngModel]="subEmail()" (ngModelChange)="subEmail.set($event)" name="se" [placeholder]="t().subPlaceholder" class="flex-1 rounded-xl border border-natural-border bg-natural-bg px-4 py-3 text-xs font-medium text-natural-text outline-none placeholder:text-stone-400 md:text-sm" />
            <button type="submit" class="whitespace-nowrap rounded-xl bg-natural-gold px-5 py-3 text-xs font-bold uppercase tracking-wider text-natural-text shadow-md transition hover:bg-natural-gold-dark md:text-sm">{{ i18n.isVi() ? 'Đăng ký' : 'Subscribe' }}</button>
          </form>
          @if (subscribed()) { <p class="mt-2 text-xs font-black text-emerald-100">✓ {{ i18n.isVi() ? 'Đăng ký thành công! Voucher ưu đãi 10% đã gửi đi.' : 'Subscribed successfully! 10% Coupon dispatched.' }}</p> }
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .stepper { display: flex; height: 2rem; width: 2rem; align-items: center; justify-content: center; border-radius: 999px; border: 1px solid rgb(231 229 228); font-size: 0.875rem; font-weight: 700; color: rgb(87 83 78); transition: background 0.2s; }
      .stepper:hover:not(:disabled) { background: rgb(250 250 249); }
      .stepper:disabled { opacity: 0.4; }
      .stepper-plus { display: flex; height: 2rem; width: 2rem; align-items: center; justify-content: center; border-radius: 999px; border: 1px solid var(--color-natural-accent); font-size: 0.875rem; font-weight: 700; color: var(--color-natural-accent); transition: background 0.2s; }
      .stepper-plus:hover { background: rgb(255 251 235 / 0.5); }
    `,
  ],
})
export class ProvinceDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  readonly i18n = inject(I18nService);
  readonly ui = inject(UiStateService);
  readonly cart = inject(CartService);

  private readonly params = toSignal(this.route.paramMap);
  readonly provinceId = computed(() => this.params()?.get('provinceId') ?? 'quang-nam');
  readonly province = computed(() => provinces.find((p) => p.id === this.provinceId()));
  readonly hero = computed(() => getProvinceHero(this.provinceId()));
  readonly t = computed(() => this.i18n.dictionary());

  readonly today = new Date().toISOString().split('T')[0];
  readonly searchInput = signal('');
  readonly query = signal('');
  readonly checkIn = signal(this.offset(1));
  readonly checkOut = signal(this.offset(5));
  readonly guests = signal(1);
  readonly rooms = signal(1);
  readonly showGuests = signal(false);
  readonly minCheckOut = computed(() => {
    const d = new Date(this.checkIn());
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });

  readonly category = signal<ActivityCategory>('all');
  readonly priceTier = signal<PriceTier>('all');

  readonly reviews = signal<DetailReview[]>([...SEED_REVIEWS]);
  readonly revAuthor = signal('');
  readonly revRating = signal(5);
  readonly revComment = signal('');
  readonly subEmail = signal('');
  readonly subscribed = signal(false);

  readonly attractions = computed(() => attractionsByProvince[this.provinceId()] ?? []);
  readonly hotels = computed(() => hotelsByProvince[this.provinceId()] ?? []);
  readonly activities = computed(() => activitiesByProvince[this.provinceId()] ?? []);

  readonly filteredHotels = computed(() => {
    const q = this.query();
    if (!q) return this.hotels();
    return this.hotels().filter((h) => `${h.name} ${h.description}`.toLowerCase().includes(q));
  });
  readonly filteredVehicles = computed(() => {
    const q = this.query();
    if (!q) return vehicles;
    return vehicles.filter((v) => `${v.name} ${v.specs}`.toLowerCase().includes(q));
  });
  readonly filteredActivities = computed(() => {
    const q = this.query();
    const cat = this.category();
    const tier = this.priceTier();
    return this.activities().filter((act) => {
      let catType: ActivityCategory = 'heritage';
      if (act.id.includes('cooking') || act.id.includes('food')) catType = 'culinary';
      else if (act.id.includes('bike') || act.id.includes('village') || act.id.includes('pottery')) catType = 'nature';
      else if (act.id.includes('cham') || act.id.includes('island') || act.id.includes('adventure')) catType = 'adventure';
      const matchCat = cat === 'all' || catType === cat;
      let pt: PriceTier = 'under-200k';
      if (act.price > 500000) pt = 'over-500k';
      else if (act.price >= 200000) pt = '200k-500k';
      const matchPrice = tier === 'all' || pt === tier;
      const matchSearch = !q || `${act.name} ${act.description}`.toLowerCase().includes(q);
      return matchCat && matchPrice && matchSearch;
    });
  });

  constructor() {
    effect(() => this.ui.selectedProvinceId.set(this.provinceId()));
  }

  private offset(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  }

  max(a: number, b: number): number {
    return Math.max(a, b);
  }
  min(a: number, b: number): number {
    return Math.min(a, b);
  }

  stars(n: number): string {
    return '★'.repeat(n);
  }

  setCheckIn(value: string): void {
    this.checkIn.set(value);
    if (this.checkOut() <= value) {
      const d = new Date(value);
      d.setDate(d.getDate() + 1);
      this.checkOut.set(d.toISOString().split('T')[0]);
    }
  }

  applySearch(): void {
    this.query.set(this.searchInput().trim().toLowerCase());
    this.scrollTo('hotels-section');
  }

  scrollTo(id: string): void {
    if (typeof document !== 'undefined') document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  usps(): Array<{ title: string; subtitle: string }> {
    const t = this.t();
    return [
      { title: t.uspsTitle1, subtitle: t.uspsSub1 },
      { title: t.uspsTitle2, subtitle: t.uspsSub2 },
      { title: t.uspsTitle3, subtitle: t.uspsSub3 },
      { title: t.uspsTitle4, subtitle: t.uspsSub4 },
    ];
  }

  categoryOptions(): Array<{ id: ActivityCategory; label: string }> {
    const vi = this.i18n.isVi();
    return [
      { id: 'all', label: vi ? 'Tất cả' : 'All' },
      { id: 'heritage', label: vi ? 'Di sản & Văn hóa' : 'Heritage' },
      { id: 'culinary', label: vi ? 'Lớp học Ẩm thực' : 'Culinary' },
      { id: 'nature', label: vi ? 'Sinh thái & Làng quê' : 'Eco-Nature' },
      { id: 'adventure', label: vi ? 'Phiêu lưu & Lặn biển' : 'Adventure' },
    ];
  }

  tierOptions(): Array<{ id: PriceTier; label: string }> {
    const vi = this.i18n.isVi();
    return [
      { id: 'all', label: vi ? 'Mọi ngân sách' : 'Any Budget' },
      { id: 'under-200k', label: vi ? 'Dưới 200,000đ' : 'Under 200k' },
      { id: '200k-500k', label: vi ? '200,000đ - 500,000đ' : '200k - 500k' },
      { id: 'over-500k', label: vi ? 'Trên 500,000đ' : 'Over 500k' },
    ];
  }

  attractionItem(spot: { id: string; name: string; image: string; description: string }): ViewableItem {
    return { id: spot.id, type: 'nearby-place', name: spot.name, image: spot.image, price: 0, description: spot.description };
  }
  hotelItem(h: { id: string; name: string; image: string; pricePerNight: number; description: string }): ViewableItem {
    return { id: h.id, type: 'hotel', name: h.name, image: h.image, price: h.pricePerNight, description: h.description };
  }
  vehicleItem(v: { id: string; name: string; image: string; pricePerDay: number; specs: string }): ViewableItem {
    return { id: v.id, type: 'vehicle', name: v.name, image: v.image, price: v.pricePerDay, description: v.specs };
  }
  activityItem(a: { id: string; name: string; image: string; price: number; description: string }): ViewableItem {
    return { id: a.id, type: 'activity', name: a.name, image: a.image, price: a.price, description: a.description };
  }

  addReview(): void {
    if (!this.revAuthor().trim() || !this.revComment().trim()) return;
    this.reviews.update((list) => [
      { id: `rev-${Date.now()}`, author: this.revAuthor().trim(), avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80', rating: this.revRating(), date: new Date().toISOString().split('T')[0], comment: this.revComment().trim() },
      ...list,
    ]);
    this.revAuthor.set('');
    this.revComment.set('');
    this.revRating.set(5);
  }

  subscribe(): void {
    if (!this.subEmail().trim()) return;
    this.subscribed.set(true);
    this.subEmail.set('');
    setTimeout(() => this.subscribed.set(false), 4000);
  }
}
