import { Component, computed, effect, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  LucideArrowLeft,
  LucideCalendar,
  LucideCheck,
  LucideCheckCircle,
  LucideChevronRight,
  LucideClock,
  LucideCreditCard,
  LucideHeart,
  LucideInfo,
  LucideLandmark,
  LucideMapPin,
  LucideMessageSquare,
  LucideNavigation,
  LucideShieldCheck,
  LucideShoppingCart,
  LucideSparkles,
  LucideStar,
  LucideShare2,
} from '@lucide/angular';
import type { BookingCartItem, ViewableItem } from '@/types';
import { CartService } from '@/services/cart.service';
import { I18nService } from '@/services/i18n.service';
import { ToastService } from '@/services/toast.service';
import { UiStateService } from '@/services/ui-state.service';

interface UserReview {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
}

type PackageKey = 'standard' | 'premium' | 'luxury';

const MOCK_REVIEWS: UserReview[] = [
  { id: '1', author: 'Nguyễn Văn Hải', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80', rating: 5, date: '2026-06-21', comment: 'Dịch vụ vô cùng đẳng cấp và chuyên nghiệp. Nhân viên chu đáo, nhiệt tình.' },
  { id: '2', author: 'Trần Thị Mai', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', rating: 5, date: '2026-06-19', comment: 'Trải nghiệm tuyệt vời vượt ngoài mong đợi! Rất xứng đáng số tiền bỏ ra.' },
  { id: '3', author: 'David Miller', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80', rating: 4, date: '2026-06-15', comment: 'Excellent service and great attention to detail. Highly recommend to everyone!' },
];

const GALLERY_FALLBACKS: Record<string, string[]> = {
  hotel: [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=900&q=80',
  ],
  vehicle: [
    'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=900&q=80',
  ],
  activity: [
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=900&q=80',
  ],
  tour: [
    'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1559592443-7f87a79f6f82?auto=format&fit=crop&w=900&q=80',
  ],
  'nearby-place': [
    'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=900&q=80',
  ],
};

function isoOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

@Component({
  selector: 'app-details-overlay',
  standalone: true,
  imports: [
    DecimalPipe,
    FormsModule,
    LucideArrowLeft,
    LucideCalendar,
    LucideCheck,
    LucideCheckCircle,
    LucideChevronRight,
    LucideClock,
    LucideCreditCard,
    LucideHeart,
    LucideInfo,
    LucideLandmark,
    LucideMapPin,
    LucideMessageSquare,
    LucideNavigation,
    LucideShieldCheck,
    LucideShoppingCart,
    LucideSparkles,
    LucideStar,
    LucideShare2,
  ],
  template: `
    @if (ui.selectedItem(); as item) {
      <div class="fixed inset-0 z-[70] min-h-screen w-full overflow-y-auto bg-natural-cream px-4 py-10 text-natural-text md:px-8">
        <!-- Back & Share -->
        <div class="mx-auto mb-6 flex max-w-7xl items-center justify-between">
          <button type="button" class="flex items-center gap-2 rounded-full border border-natural-border bg-white px-4 py-2 text-xs font-bold text-stone-600 shadow-xs transition hover:border-natural-accent hover:text-natural-accent" (click)="back()">
            <svg lucideArrowLeft class="h-4 w-4"></svg>
            <span>{{ isVi() ? 'Quay lại danh sách' : 'Back to Listings' }}</span>
          </button>
          <div class="flex gap-2">
            <button type="button" class="rounded-full border border-natural-border bg-white p-2.5 transition hover:bg-stone-50" (click)="toggleFavorite(item)" [attr.aria-pressed]="ui.isFavorite(item.id)">
              <svg lucideHeart class="h-4 w-4 text-natural-accent" [class.fill-natural-accent]="ui.isFavorite(item.id)"></svg>
            </button>
            <button type="button" class="rounded-full border border-natural-border bg-white p-2.5 transition hover:bg-stone-50" (click)="share(item)">
              <svg lucideShare2 class="h-4 w-4 text-stone-500"></svg>
            </button>
          </div>
        </div>

        <div class="mx-auto grid max-w-7xl grid-cols-1 items-start gap-8 lg:grid-cols-12">
          <!-- LEFT: showcase (7) -->
          <div class="space-y-6 lg:col-span-7">
            <!-- Banner -->
            <div class="relative h-96 overflow-hidden rounded-3xl bg-stone-900 shadow-md">
              <img [src]="item.image" [alt]="item.name" class="h-full w-full object-cover" referrerpolicy="no-referrer" />
              <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
              <div class="absolute left-4 top-4 rounded-full bg-natural-accent px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">{{ typeLabel(item) }}</div>
              <div class="absolute bottom-6 left-6 right-6 space-y-2 text-white">
                <h1 class="font-serif text-2xl font-black uppercase leading-tight md:text-3xl">{{ item.name }}</h1>
                <div class="flex flex-wrap items-center gap-4 text-xs font-medium text-amber-200">
                  <span class="flex items-center gap-1">
                    <svg lucideStar class="h-4 w-4 fill-amber-400 stroke-amber-400"></svg>
                    <span class="font-bold text-white">{{ item.rating || 4.9 }}</span>
                    <span class="opacity-75">({{ item.reviewsCount || '1.2k' }} {{ isVi() ? 'đánh giá' : 'reviews' }})</span>
                  </span>
                  @if (item.distance) {
                    <span class="flex items-center gap-1 text-white/90"><svg lucideMapPin class="h-4 w-4"></svg><span>{{ isVi() ? 'Cách trung tâm ' + item.distance : item.distance + ' from center' }}</span></span>
                  }
                </div>
              </div>
            </div>

            <!-- Gallery -->
            <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
              @for (image of gallery(item); track image.src) {
                <div class="group relative h-28 overflow-hidden rounded-2xl border border-natural-border bg-stone-900 text-left shadow-xs">
                  <img [src]="image.src" [alt]="item.name + ' - ' + image.label" class="h-full w-full object-cover transition duration-500 group-hover:scale-105" referrerpolicy="no-referrer" />
                  <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
                  <span class="absolute bottom-3 left-3 right-3 text-[10px] font-black uppercase tracking-wider text-white">{{ image.label }}</span>
                </div>
              }
            </div>

            <!-- Core info -->
            <div class="space-y-6 rounded-3xl border border-natural-border bg-white p-6 md:p-8">
              <div class="grid grid-cols-1 gap-3 md:grid-cols-4">
                @for (fact of quickFacts(item); track fact.label) {
                  <div class="rounded-2xl border border-natural-border bg-natural-cream p-3">
                    @switch (fact.icon) {
                      @case ('clock') { <svg lucideClock class="mb-2 h-4 w-4 text-natural-accent"></svg> }
                      @case ('map') { <svg lucideMapPin class="mb-2 h-4 w-4 text-natural-accent"></svg> }
                      @case ('shield') { <svg lucideShieldCheck class="mb-2 h-4 w-4 text-natural-accent"></svg> }
                      @case ('sparkles') { <svg lucideSparkles class="mb-2 h-4 w-4 text-natural-accent"></svg> }
                    }
                    <p class="text-[9px] font-black uppercase tracking-wider text-stone-400">{{ fact.label }}</p>
                    <p class="mt-1 text-xs font-bold leading-snug text-natural-ink">{{ fact.value }}</p>
                  </div>
                }
              </div>

              <div class="space-y-3">
                <h3 class="border-b border-natural-border pb-2 text-base font-bold uppercase text-stone-800">{{ isVi() ? 'Mô tả chi tiết' : 'Detailed Description' }}</h3>
                <p class="text-justify text-xs leading-relaxed text-stone-600">{{ item.description }}</p>
              </div>

              @if (item.specs) {
                <div class="space-y-3 rounded-2xl border border-natural-border bg-natural-cream p-4">
                  <h4 class="text-xs font-bold uppercase text-stone-700">{{ isVi() ? 'Thông số kỹ thuật & Tiện nghi' : 'Specs & Facilities' }}</h4>
                  <p class="font-mono text-xs font-medium text-natural-accent">⚡ {{ item.specs }}</p>
                </div>
              }

              @if (item.inclusions?.length) {
                <div class="space-y-3">
                  <h4 class="text-xs font-bold uppercase text-stone-800">{{ isVi() ? 'Dịch vụ bao gồm trong gói' : 'What is included in this pack' }}</h4>
                  <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                    @for (inc of item.inclusions; track inc) {
                      <div class="flex items-start gap-2 rounded-xl border border-stone-100 bg-stone-50 p-2.5 text-xs text-stone-600">
                        <svg lucideCheck class="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"></svg><span>{{ inc }}</span>
                      </div>
                    }
                  </div>
                </div>
              }

              <div class="space-y-3">
                <h3 class="text-base font-bold uppercase text-stone-800">{{ isVi() ? 'Điểm nổi bật của dịch vụ' : 'Key Highlights' }}</h3>
                <ul class="space-y-2 text-xs text-stone-600">
                  @for (hl of highlights(item); track hl) {
                    <li class="flex items-start gap-2.5 leading-relaxed"><span class="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-natural-gold"></span><span>{{ hl }}</span></li>
                  }
                </ul>
              </div>

              @if (item.coordinates; as coord) {
                <div class="space-y-3 pt-2">
                  <h4 class="flex items-center gap-1.5 text-xs font-bold uppercase text-stone-800"><svg lucideNavigation class="h-4 w-4 text-red-500"></svg>{{ isVi() ? 'Vị trí bản đồ hành trình' : 'Route Sitemap Location' }}</h4>
                  <div class="relative flex h-48 items-center justify-center overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-50">
                    <div class="absolute inset-0 bg-[radial-gradient(#059669_1px,transparent_1px)] opacity-10 [background-size:16px_16px]"></div>
                    <svg class="absolute inset-0 h-full w-full">
                      <path [attr.d]="'M 150 100 L ' + coord.x + ' ' + coord.y" fill="none" stroke="currentColor" stroke-width="2.5" stroke-dasharray="5,4" class="animate-pulse text-natural-accent"></path>
                    </svg>
                    <div class="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center" style="left: 150px; top: 100px;">
                      <div class="h-3.5 w-3.5 rounded-full border border-white bg-amber-600"></div>
                      <span class="mt-1 rounded bg-amber-950 px-1 py-0.5 text-[7px] font-black uppercase tracking-widest text-white">🏨 VietCharm HQ</span>
                    </div>
                    <div class="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center" [style.left.px]="coord.x" [style.top.px]="coord.y">
                      <svg lucideMapPin class="h-5 w-5 animate-bounce text-red-500"></svg>
                      <span class="mt-0.5 rounded bg-red-950 px-1 py-0.5 text-[7px] font-bold text-white">{{ item.name }}</span>
                    </div>
                  </div>
                </div>
              }
            </div>

            <!-- Reviews -->
            <div class="space-y-6 rounded-3xl border border-natural-border bg-white p-6 md:p-8">
              <h3 class="flex items-center gap-2 text-base font-bold uppercase text-stone-800">
                <svg lucideMessageSquare class="h-4 w-4 text-natural-accent"></svg>
                {{ isVi() ? 'Nhận xét & Đánh giá từ khách hàng' : 'Customer Reviews' }}
              </h3>
              <div class="space-y-4">
                @for (r of reviews(); track r.id) {
                  <div class="space-y-2 rounded-2xl border border-stone-100 bg-natural-cream p-4">
                    <div class="flex items-center justify-between text-xs">
                      <div class="flex items-center gap-2">
                        <img [src]="r.avatar" [alt]="r.author" class="h-6 w-6 rounded-full object-cover" />
                        <span class="font-bold text-stone-700">{{ r.author }}</span>
                      </div>
                      <div class="flex items-center gap-1.5 text-stone-400"><span class="text-amber-500">{{ stars(r.rating) }}</span><span>• {{ r.date }}</span></div>
                    </div>
                    <p class="pl-8 text-xs italic leading-relaxed text-stone-600">"{{ r.comment }}"</p>
                  </div>
                }
              </div>
              <form class="space-y-3 rounded-2xl border border-natural-border bg-natural-cream p-5" (ngSubmit)="addReview()">
                <h4 class="text-xs font-black uppercase tracking-wider text-stone-500">✍️ {{ isVi() ? 'Viết đánh giá của riêng bạn' : 'Leave your feedback' }}</h4>
                <div class="grid grid-cols-2 gap-3">
                  <input type="text" required [(ngModel)]="reviewerName" name="reviewerName" [placeholder]="isVi() ? 'Tên của bạn...' : 'Your name...'" class="rounded-xl border border-natural-border bg-white px-3 py-2.5 text-xs focus:border-natural-accent focus:outline-none" />
                  <div class="flex items-center gap-2 rounded-xl border border-natural-border bg-white px-3 py-2.5">
                    <span class="text-[10px] font-bold uppercase text-stone-400">{{ isVi() ? 'Điểm:' : 'Stars:' }}</span>
                    <div class="flex gap-0.5">
                      @for (num of [1,2,3,4,5]; track num) {
                        <button type="button" (click)="reviewRating.set(num)"><svg lucideStar class="h-3.5 w-3.5" [class.text-amber-400]="num <= reviewRating()" [class.fill-amber-400]="num <= reviewRating()" [class.text-stone-300]="num > reviewRating()"></svg></button>
                      }
                    </div>
                  </div>
                </div>
                <textarea required rows="2" [(ngModel)]="reviewComment" name="reviewComment" [placeholder]="isVi() ? 'Chia sẻ trải nghiệm khách quan của bạn về dịch vụ...' : 'Write an honest feedback on how we can improve...'" class="w-full resize-none rounded-xl border border-natural-border bg-white p-3 text-xs leading-relaxed focus:border-natural-accent focus:outline-none"></textarea>
                <button type="submit" class="w-full rounded-xl bg-natural-accent py-2.5 text-xs font-black uppercase tracking-widest text-white transition hover:bg-natural-olive">{{ isVi() ? 'Đăng đánh giá' : 'Submit Review' }}</button>
              </form>
            </div>
          </div>

          <!-- RIGHT: pricing & reservation (5) -->
          <div class="sticky top-28 space-y-6 lg:col-span-5">
            <div class="space-y-6 rounded-3xl border border-natural-border bg-white p-6 shadow-lg md:p-8">
              <div class="space-y-1">
                <span class="block text-[10px] font-black uppercase tracking-widest text-natural-accent">{{ isVi() ? 'GIÁ NIÊM YẾT CHÍNH HÃNG' : 'GENUINE RETAIL PRICE' }}</span>
                <div class="flex items-baseline gap-1.5">
                  <span class="font-mono text-2xl font-black text-natural-accent md:text-3xl">{{ item.price > 0 ? (item.price | number : '1.0-0') + 'đ' : (isVi() ? 'Miễn phí' : 'Free Entry') }}</span>
                  @if (item.price > 0) {
                    <span class="text-xs text-stone-500">/{{ item.type === 'hotel' ? (isVi() ? 'đêm' : 'night') : (item.type === 'vehicle' ? (isVi() ? 'ngày' : 'day') : (isVi() ? 'khách' : 'guest')) }}</span>
                  }
                </div>
              </div>

              <div class="space-y-3 rounded-2xl border border-stone-150 bg-natural-cream p-4">
                <div class="flex items-center gap-2 text-xs font-bold text-stone-700"><svg lucideShieldCheck class="h-4 w-4 text-emerald-600"></svg><span>{{ isVi() ? 'Cam kết độc quyền VietCharm' : 'VietCharm Exclusives' }}</span></div>
                <div class="space-y-2 text-[11px] text-stone-500">
                  <div class="flex items-center gap-2"><svg lucideCheckCircle class="h-3.5 w-3.5 shrink-0 text-emerald-600"></svg><span>{{ isVi() ? 'Không phát sinh phụ phí ẩn' : 'No hidden fees or taxes' }}</span></div>
                  <div class="flex items-center gap-2"><svg lucideCheckCircle class="h-3.5 w-3.5 shrink-0 text-emerald-600"></svg><span>{{ isVi() ? 'Xác nhận hóa đơn đỏ tức thì' : 'Instant red invoice & booking code' }}</span></div>
                  <div class="flex items-center gap-2"><svg lucideCheckCircle class="h-3.5 w-3.5 shrink-0 text-emerald-600"></svg><span>{{ isVi() ? 'Tích lũy 5% điểm thưởng thành viên' : 'Accumulate 5% member points' }}</span></div>
                </div>
              </div>

              @if (isBookable(item)) {
                <div class="space-y-4 border-t border-stone-150 pt-4">
                  @if (item.type === 'hotel' || item.type === 'vehicle') {
                    <div class="grid grid-cols-2 gap-3 rounded-3xl border border-natural-border bg-natural-cream p-3">
                      <div class="space-y-1.5">
                        <label class="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-stone-500"><svg lucideCalendar class="h-3 w-3 text-natural-accent"></svg><span>{{ item.type === 'hotel' ? (isVi() ? 'Ngày Check-in:' : 'Check-in Date:') : (isVi() ? 'Ngày nhận xe:' : 'Pickup Date:') }}</span></label>
                        <input type="date" [min]="today" [ngModel]="checkInDate()" name="checkIn" (ngModelChange)="setCheckIn($event)" class="w-full rounded-xl border border-natural-border bg-white p-2.5 text-xs font-bold text-stone-700" />
                      </div>
                      <div class="space-y-1.5">
                        <label class="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-stone-500"><svg lucideCalendar class="h-3 w-3 text-natural-accent"></svg><span>{{ item.type === 'hotel' ? (isVi() ? 'Ngày Check-out:' : 'Check-out Date:') : (isVi() ? 'Ngày trả xe:' : 'Return Date:') }}</span></label>
                        <input type="date" [min]="minCheckout()" [ngModel]="checkOutDate()" name="checkOut" (ngModelChange)="setCheckOut($event)" class="w-full rounded-xl border border-natural-border bg-white p-2.5 text-xs font-bold text-stone-700" />
                      </div>
                    </div>
                  } @else {
                    <div class="space-y-2">
                      <label class="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-stone-500"><svg lucideCalendar class="h-3.5 w-3.5 text-natural-accent"></svg><span>{{ isVi() ? 'Vui lòng chọn ngày khởi hành:' : 'Please Select Departure Date:' }}</span></label>
                      <input type="date" [min]="today" [(ngModel)]="selectedDate" name="selectedDate" class="w-full rounded-2xl border border-natural-border bg-natural-cream p-3 text-xs font-bold text-stone-700" />
                    </div>
                  }

                  <div class="space-y-2">
                    <label class="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-stone-500"><svg lucideSparkles class="h-3.5 w-3.5 text-natural-accent"></svg><span>{{ isVi() ? 'Vui lòng chọn gói dịch vụ:' : 'Please Select Service Package:' }}</span></label>
                    <div class="space-y-2">
                      @for (pkg of packages(); track pkg.key) {
                        <button type="button" (click)="selectedPackage.set(pkg.key)"
                          [class]="'flex w-full flex-col gap-1 rounded-2xl border p-3 text-left transition ' + (selectedPackage() === pkg.key ? 'bg-natural-accent/5 border-natural-accent shadow-xs' : 'bg-white border-stone-200 hover:border-natural-accent/50')">
                          <div class="flex w-full items-center justify-between">
                            <span class="text-xs font-bold" [class.text-natural-accent]="selectedPackage() === pkg.key" [class.text-stone-800]="selectedPackage() !== pkg.key">{{ pkg.name }}</span>
                            <span class="font-mono text-[10px] font-bold text-stone-500">{{ pkg.modifierLabel }}</span>
                          </div>
                          <p class="text-[10px] leading-normal text-stone-500">{{ pkg.desc }}</p>
                        </button>
                      }
                    </div>
                  </div>
                </div>
              } @else {
                <div class="rounded-2xl border border-dashed border-natural-border bg-natural-cream p-4 text-xs leading-relaxed text-stone-600">
                  {{ isVi() ? 'Đây là địa điểm tham khảo miễn phí, không cần thêm vào giỏ hay thanh toán. Bạn có thể lưu yêu thích hoặc quay lại để xem dịch vụ đặt chỗ.' : 'This is a free reference place, so it does not need cart or checkout. Save it or go back to browse bookable services.' }}
                </div>
              }

              @if (item.price > 0) {
                @if (isActivityLike(item)) {
                  <div class="space-y-4 border-t border-dashed border-natural-border pt-4">
                    <div class="flex items-center justify-between">
                      <div class="space-y-0.5">
                        <span class="block text-xs font-bold text-stone-700">{{ isVi() ? 'Vé Người Lớn' : 'Adult Ticket' }}</span>
                        <span class="block font-mono text-[10px] text-natural-accent">{{ pricePerUnit(item) | number : '1.0-0' }}đ/{{ isVi() ? 'vé' : 'ticket' }}</span>
                      </div>
                      <div class="flex w-max items-center gap-2 rounded-xl border border-natural-border bg-natural-cream p-1.5">
                        <button type="button" class="stepper" (click)="adultsCount.set(max(1, adultsCount() - 1))">-</button>
                        <span class="w-8 text-center font-mono text-xs font-black text-stone-800">{{ adultsCount() }}</span>
                        <button type="button" class="stepper" (click)="adultsCount.set(adultsCount() + 1)">+</button>
                      </div>
                    </div>
                    <div class="flex items-center justify-between">
                      <div class="space-y-0.5">
                        <div class="flex items-center gap-1.5"><span class="block text-xs font-bold text-stone-700">{{ isVi() ? 'Vé Trẻ Em' : 'Child Ticket' }}</span><span class="rounded bg-emerald-50 px-1 py-0.5 text-[8px] font-black uppercase leading-none text-emerald-800">{{ isVi() ? '-30% Giảm' : '30% Off' }}</span></div>
                        <span class="block font-mono text-[10px] text-natural-accent">{{ childPricePerUnit(item) | number : '1.0-0' }}đ/{{ isVi() ? 'vé' : 'ticket' }}</span>
                      </div>
                      <div class="flex w-max items-center gap-2 rounded-xl border border-natural-border bg-natural-cream p-1.5">
                        <button type="button" class="stepper" (click)="childrenCount.set(max(0, childrenCount() - 1))">-</button>
                        <span class="w-8 text-center font-mono text-xs font-black text-stone-800">{{ childrenCount() }}</span>
                        <button type="button" class="stepper" (click)="childrenCount.set(childrenCount() + 1)">+</button>
                      </div>
                    </div>
                  </div>
                } @else if (item.type === 'hotel' || item.type === 'vehicle') {
                  <div class="flex items-center justify-between space-y-2 border-t border-dashed border-natural-border pt-4">
                    <span class="text-xs font-bold uppercase tracking-wider text-stone-600">{{ item.type === 'hotel' ? (isVi() ? 'Thời gian & số phòng:' : 'Stay duration & rooms:') : (isVi() ? 'Số lượng ngày thuê xe:' : 'Number of rental days:') }}</span>
                    <div class="rounded-2xl border border-natural-border bg-natural-cream px-4 py-2 text-sm font-black text-natural-accent">{{ item.type === 'hotel' ? (nights() + (isVi() ? ' đêm · ' : ' nights · ') + roomsCount() + (isVi() ? ' phòng' : ' rooms')) : (nights() + (isVi() ? ' ngày' : ' days')) }}</div>
                  </div>
                }
              }

              @if (item.price > 0) {
                <div class="flex items-center justify-between border-b border-t border-dashed border-natural-border py-4">
                  <span class="text-xs font-bold uppercase text-stone-600">{{ isVi() ? 'Tổng tiền dự tính' : 'Estimated Subtotal' }}</span>
                  <span class="font-mono text-xl font-black text-natural-accent">{{ total(item) | number : '1.0-0' }}đ</span>
                </div>
              }

              <div class="space-y-3">
                @if (isBookable(item)) {
                  @if (cart.isInCart(cartKey(item))) {
                    <button type="button" class="flex w-full items-center justify-center gap-2 rounded-2xl border border-natural-border bg-natural-cream py-3.5 text-xs font-black uppercase tracking-wider text-natural-text transition hover:bg-stone-100" (click)="cart.removeItem(cartKey(item))">
                      <svg lucideCheckCircle class="h-4 w-4 text-emerald-600"></svg><span>{{ isVi() ? 'Đã thêm lựa chọn này - Hủy' : 'This selection is in cart - Remove' }}</span>
                    </button>
                  } @else {
                    <button type="button" class="flex w-full items-center justify-center gap-2 rounded-2xl bg-natural-accent py-4 text-xs font-black uppercase tracking-widest text-white shadow-md transition hover:bg-natural-olive" (click)="handleAdd(item)">
                      <svg lucideShoppingCart class="h-4 w-4"></svg><span>{{ isVi() ? 'Thêm lựa chọn vào giỏ' : 'Add Selection to Cart' }}</span>
                    </button>
                  }
                  @if (successMsg()) {
                    <div class="rounded-xl border border-emerald-200 bg-emerald-50 py-2 text-center text-xs font-bold text-emerald-800">✓ {{ isVi() ? 'Đã thêm lựa chọn vào giỏ hàng!' : 'Selection added to cart!' }}</div>
                  }
                  <button type="button" class="flex w-full items-center justify-center gap-2 rounded-2xl bg-natural-gold py-4 text-xs font-black uppercase tracking-widest text-natural-text shadow-lg transition hover:bg-natural-gold-dark" (click)="checkout(item)">
                    <svg lucideCreditCard class="h-4 w-4"></svg><span>{{ isVi() ? 'Thanh toán ngay' : 'Checkout & Pay Now' }}</span>
                  </button>
                } @else {
                  <button type="button" class="w-full rounded-2xl bg-natural-accent py-4 text-xs font-black uppercase tracking-widest text-white shadow-md transition hover:bg-natural-olive" (click)="back()">{{ isVi() ? 'Xem dịch vụ có thể đặt' : 'Browse Bookable Services' }}</button>
                }
              </div>
            </div>

            <!-- Paired suggestions -->
            <div class="overflow-hidden rounded-3xl border border-natural-border bg-white shadow-xs">
              <div class="border-b border-natural-border bg-natural-cream px-5 py-4">
                <div class="flex items-center gap-2 text-natural-accent"><svg lucideLandmark class="h-4 w-4"></svg><h3 class="text-xs font-black uppercase tracking-wider">{{ isVi() ? 'Thường được ghép cùng' : 'Usually paired with' }}</h3></div>
              </div>
              <div class="divide-y divide-natural-border">
                @for (s of paired(item); track s) {
                  <button type="button" class="flex w-full items-center justify-between gap-3 px-5 py-3 text-left text-xs font-semibold leading-relaxed text-stone-600 transition hover:bg-natural-cream hover:text-natural-accent" (click)="back()"><span>{{ s }}</span><svg lucideChevronRight class="h-4 w-4 shrink-0"></svg></button>
                }
              </div>
            </div>

            <div class="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50/40 p-4">
              <svg lucideInfo class="h-5 w-5 shrink-0 text-natural-accent"></svg>
              <div class="space-y-1">
                <span class="block text-[11px] font-bold uppercase text-natural-accent">{{ isVi() ? 'Chính sách đặt chỗ rõ ràng' : 'Clear Booking Policy' }}</span>
                <p class="text-[10px] leading-relaxed text-stone-500">{{ isVi() ? 'VietCharm liên kết trực tiếp với khách sạn, hướng dẫn viên và đơn vị vận chuyển địa phương để thông tin đặt chỗ luôn rõ ràng.' : 'We work directly with hotels, local guides, and transport partners so every booking stays easy to understand.' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .stepper { display: flex; height: 1.75rem; width: 1.75rem; align-items: center; justify-content: center; border-radius: 0.5rem; border: 1px solid var(--color-natural-border); background: white; font-size: 0.75rem; font-weight: 900; color: rgb(120 113 108); user-select: none; transition: all 0.2s; }
      .stepper:hover { color: var(--color-natural-accent); border-color: var(--color-natural-accent); }
    `,
  ],
})
export class DetailsOverlayComponent {
  readonly today = isoOffset(0);
  readonly selectedDate = signal(isoOffset(1));
  readonly checkInDate = signal(isoOffset(1));
  readonly checkOutDate = signal(isoOffset(2));
  readonly selectedPackage = signal<PackageKey>('standard');
  readonly adultsCount = signal(1);
  readonly childrenCount = signal(0);
  readonly roomsCount = signal(1);
  readonly successMsg = signal(false);

  readonly reviews = signal<UserReview[]>([...MOCK_REVIEWS]);
  readonly reviewerName = signal('');
  readonly reviewRating = signal(5);
  readonly reviewComment = signal('');

  readonly isVi = computed(() => this.i18n.isVi());
  readonly minCheckout = computed(() => {
    const d = new Date(this.checkInDate());
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });

  private lastItemId: string | null = null;

  constructor(
    readonly ui: UiStateService,
    readonly i18n: I18nService,
    readonly cart: CartService,
    private readonly toast: ToastService,
    private readonly router: Router,
  ) {
    // Reset booking state whenever a different item is opened.
    effect(() => {
      const item = this.ui.selectedItem();
      if (item && item.id !== this.lastItemId) {
        this.lastItemId = item.id;
        this.selectedDate.set(isoOffset(1));
        this.checkInDate.set(isoOffset(1));
        this.checkOutDate.set(isoOffset(2));
        this.selectedPackage.set('standard');
        this.adultsCount.set(1);
        this.childrenCount.set(0);
        this.roomsCount.set(1);
        this.successMsg.set(false);
      }
    });
  }

  max(a: number, b: number): number {
    return Math.max(a, b);
  }

  stars(n: number): string {
    return '★'.repeat(n);
  }

  back(): void {
    this.ui.clearSelectedItem();
  }

  typeLabel(item: ViewableItem): string {
    const vi = this.isVi();
    switch (item.type) {
      case 'hotel': return vi ? 'Khách sạn / Resort' : 'Hotel / Resort';
      case 'activity': return vi ? 'Hoạt động trải nghiệm' : 'Excursion Activity';
      case 'vehicle': return vi ? 'Phương tiện di chuyển' : 'Transport Rental';
      case 'tour': return vi ? 'Combo Tour Trọn Gói' : 'Heritage Tour Combo';
      case 'nearby-place': return vi ? 'Địa điểm tham quan lân cận' : 'Nearby Landmark';
      default: return item.type;
    }
  }

  isActivityLike(item: ViewableItem): boolean {
    return item.type === 'activity' || item.type === 'tour';
  }

  isBookable(item: ViewableItem): boolean {
    return item.price > 0 && (item.type === 'hotel' || item.type === 'vehicle' || this.isActivityLike(item));
  }

  private modifier(): number {
    const p = this.selectedPackage();
    return p === 'premium' ? 1.3 : p === 'luxury' ? 1.6 : 1.0;
  }

  pricePerUnit(item: ViewableItem): number {
    return Math.round(item.price * this.modifier());
  }

  childPricePerUnit(item: ViewableItem): number {
    return Math.round(item.price * this.modifier() * 0.7);
  }

  nights(): number {
    const start = new Date(this.checkInDate());
    const end = new Date(this.checkOutDate());
    const diff = end.getTime() - start.getTime();
    if (isNaN(diff) || diff <= 0) return 1;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 1;
  }

  private effectiveQuantity(item: ViewableItem): number {
    if (item.type === 'hotel') return this.nights() * this.roomsCount();
    if (item.type === 'vehicle') return this.nights();
    return 1;
  }

  total(item: ViewableItem): number {
    if (this.isActivityLike(item)) {
      return Math.round(this.pricePerUnit(item) * this.adultsCount() + this.childPricePerUnit(item) * this.childrenCount());
    }
    return Math.round(this.pricePerUnit(item) * this.effectiveQuantity(item));
  }

  packages(): Array<{ key: PackageKey; name: string; desc: string; modifierLabel: string }> {
    const vi = this.isVi();
    return [
      { key: 'standard', modifierLabel: '100%', name: vi ? 'Gói Tiêu Chuẩn (Cơ bản)' : 'Standard Package', desc: vi ? 'Dịch vụ tham quan cơ bản đầy đủ tiện ích và bảo hiểm du lịch.' : 'Full standard admission/service and complimentary travel insurance.' },
      { key: 'premium', modifierLabel: '+30%', name: vi ? 'Gói Cao Cấp (Premium VIP)' : 'Premium VIP Experience', desc: vi ? 'Có đưa đón riêng biệt, lối đi VIP không chờ đợi, tặng voucher ẩm thực 200k.' : 'Private pickup, VIP fast-track entry, 200k VND dining voucher included.' },
      { key: 'luxury', modifierLabel: '+60%', name: vi ? 'Gói Sang Trọng (All-Inclusive)' : 'Luxury All-Inclusive', desc: vi ? 'Dịch vụ thượng lưu trọn gói: HDV riêng, ăn ngự thiện cung đình, tặng đèn lồng lụa cao cấp.' : 'Royal package: Private local guide, luxury traditional dinner, and handmade silk gift.' },
    ];
  }

  cartKey(item: ViewableItem): string {
    const dateStr = item.type === 'hotel' || item.type === 'vehicle' ? `${this.checkInDate()} -> ${this.checkOutDate()}` : this.selectedDate();
    return [
      item.id,
      this.selectedPackage(),
      dateStr,
      this.isActivityLike(item) ? `adults-${this.adultsCount()}` : `qty-${this.effectiveQuantity(item)}`,
      this.isActivityLike(item) ? `children-${this.childrenCount()}` : item.type === 'hotel' ? `rooms-${this.roomsCount()}` : 'single-vehicle',
    ].join('__');
  }

  private detailsStr(item: ViewableItem): string {
    const vi = this.isVi();
    const pkg = this.packages().find((p) => p.key === this.selectedPackage())!.name;
    const dateStr = item.type === 'hotel' || item.type === 'vehicle' ? `${this.checkInDate()} -> ${this.checkOutDate()}` : this.selectedDate();
    if (this.isActivityLike(item)) {
      return vi ? `Gói: ${pkg} | Ngày: ${dateStr} | Vé: ${this.adultsCount()} Người lớn, ${this.childrenCount()} Trẻ em` : `Package: ${pkg} | Date: ${dateStr} | Tickets: ${this.adultsCount()} Adults, ${this.childrenCount()} Children`;
    }
    const tail = item.type === 'hotel' ? (vi ? `Phòng: ${this.roomsCount()} | Đêm: ${this.nights()}` : `Rooms: ${this.roomsCount()} | Nights: ${this.nights()}`) : vi ? `Số ngày thuê: ${this.nights()}` : `Rental days: ${this.nights()}`;
    return vi ? `Gói: ${pkg} | Ngày: ${dateStr} | ${tail}` : `Package: ${pkg} | Date: ${dateStr} | ${tail}`;
  }

  setCheckIn(value: string): void {
    this.checkInDate.set(value);
    const next = new Date(value);
    next.setDate(next.getDate() + 1);
    const nextStr = next.toISOString().split('T')[0];
    if (this.checkOutDate() <= value) this.checkOutDate.set(nextStr);
  }

  setCheckOut(value: string): void {
    if (value > this.checkInDate()) this.checkOutDate.set(value);
  }

  private addSelection(item: ViewableItem): void {
    const cartType: BookingCartItem['type'] = item.type === 'hotel' || item.type === 'vehicle' ? item.type : 'activity';
    this.cart.addItem({
      cartKey: this.cartKey(item),
      id: item.id,
      type: cartType,
      name: item.type === 'tour' ? `[Combo] ${item.name}` : item.name,
      price: this.total(item),
      quantity: 1,
      image: item.image,
      details: this.detailsStr(item),
    });
    this.successMsg.set(true);
    setTimeout(() => this.successMsg.set(false), 3000);
  }

  handleAdd(item: ViewableItem): void {
    if (!this.isBookable(item)) return;
    this.ui.requireAuth(() => this.addSelection(item), this.isVi() ? 'Đăng nhập để thêm dịch vụ vào giỏ.' : 'Sign in to add services to your cart.');
  }

  checkout(item: ViewableItem): void {
    this.ui.requireAuth(() => {
      if (!this.cart.isInCart(this.cartKey(item))) this.addSelection(item);
      this.ui.clearSelectedItem();
      void this.router.navigateByUrl('/cart');
    }, this.isVi() ? 'Đăng nhập để thanh toán.' : 'Sign in to checkout.');
  }

  toggleFavorite(item: ViewableItem): void {
    const wasFav = this.ui.isFavorite(item.id);
    this.ui.toggleFavorite(item);
    this.toast.showToast({
      type: wasFav ? 'info' : 'success',
      title: wasFav ? (this.isVi() ? 'Đã bỏ yêu thích' : 'Removed from favorites') : (this.isVi() ? 'Đã lưu yêu thích' : 'Saved to favorites'),
      message: item.name,
    });
  }

  async share(item: ViewableItem): Promise<void> {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    try {
      const nav = navigator as Navigator & { share?: (data: object) => Promise<void> };
      if (nav.share) {
        await nav.share({ title: item.name, text: item.description ?? '', url });
        this.toast.showToast({ type: 'success', title: this.isVi() ? 'Đã mở chia sẻ' : 'Share sheet opened', message: item.name });
        return;
      }
      await navigator.clipboard.writeText(url);
      this.toast.showToast({ type: 'success', title: this.isVi() ? 'Đã sao chép liên kết' : 'Link copied', message: item.name });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      this.toast.showToast({ type: 'error', title: this.isVi() ? 'Chưa thể chia sẻ' : 'Could not share', message: this.isVi() ? 'Vui lòng thử lại sau.' : 'Please try again.' });
    }
  }

  addReview(): void {
    if (!this.reviewerName().trim() || !this.reviewComment().trim()) return;
    this.reviews.update((list) => [
      {
        id: `review-details-${Date.now()}`,
        author: this.reviewerName(),
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        rating: this.reviewRating(),
        date: new Date().toISOString().split('T')[0],
        comment: this.reviewComment(),
      },
      ...list,
    ]);
    this.reviewerName.set('');
    this.reviewComment.set('');
    this.reviewRating.set(5);
  }

  gallery(item: ViewableItem): Array<{ src: string; label: string }> {
    const fallback = GALLERY_FALLBACKS[item.type] ?? GALLERY_FALLBACKS['activity'];
    const labels = this.isVi()
      ? ['Góc nhìn chính', 'Không gian trải nghiệm', 'Chi tiết đáng chú ý', 'Khoảnh khắc nên thử']
      : ['Main view', 'Experience space', 'Notable detail', 'Worth-trying moment'];
    return [item.image, ...fallback].slice(0, 4).map((src, i) => ({ src, label: labels[i] }));
  }

  highlights(item: ViewableItem): string[] {
    if (item.highlights?.length) return item.highlights;
    const vi = this.isVi();
    return [
      vi ? 'Đội ngũ hỗ trợ chuyên nghiệp sẵn sàng 24/7 phục vụ quý khách.' : '24/7 Professional support staff ready to assist you.',
      vi ? 'Bao gồm bảo hiểm lữ hành toàn diện theo chuẩn quốc tế.' : 'Comprehensive international standard travel insurance included.',
      vi ? 'Hỗ trợ thay đổi lịch trình hoặc hủy dịch vụ miễn phí trước 24 giờ.' : 'Free rescheduling or cancellation up to 24 hours in advance.',
      vi ? 'Cam kết chất lượng dịch vụ chính hãng VietCharm uy tín hàng đầu.' : 'VietCharm certified genuine high-quality service guaranteed.',
    ];
  }

  quickFacts(item: ViewableItem): Array<{ icon: string; label: string; value: string }> {
    const vi = this.isVi();
    return [
      { icon: 'clock', label: vi ? 'Thời lượng' : 'Duration', value: item.type === 'hotel' ? (vi ? `${this.nights()} đêm lưu trú` : `${this.nights()} night stay`) : item.duration || (vi ? 'Linh hoạt theo lịch' : 'Flexible timing') },
      { icon: 'map', label: vi ? 'Di chuyển' : 'Getting there', value: item.distance ? (vi ? `Cách trung tâm ${item.distance}` : `${item.distance} from center`) : vi ? 'Dễ ghép vào tuyến đang chọn' : 'Easy to add to the selected route' },
      { icon: 'shield', label: vi ? 'Đặt chỗ' : 'Booking', value: vi ? 'Xác nhận nhanh, thông tin rõ ràng' : 'Fast confirmation, clear details' },
      { icon: 'sparkles', label: vi ? 'Phù hợp' : 'Best for', value: item.type === 'vehicle' ? (vi ? 'Tự do đổi điểm dừng' : 'Flexible stopovers') : item.type === 'hotel' ? (vi ? 'Nghỉ ngơi sau hành trình' : 'Reset between route days') : vi ? 'Thêm điểm nhớ cho chuyến đi' : 'A memorable route highlight' },
    ];
  }

  paired(item: ViewableItem): string[] {
    const vi = this.isVi();
    if (item.type === 'hotel') return [vi ? 'Thêm xe đưa đón sân bay để ngày đầu nhẹ hơn.' : 'Add an airport transfer to make day one easier.', vi ? 'Ghép một hoạt động buổi chiều gần khách sạn.' : 'Pair it with a nearby afternoon experience.'];
    if (item.type === 'vehicle') return [vi ? 'Chọn khách sạn cùng khu để tối ưu giờ nhận xe.' : 'Choose a stay in the same area to simplify pickup.', vi ? 'Thêm điểm dừng ăn uống địa phương trên tuyến.' : 'Add a local food stop along the route.'];
    return [vi ? 'Ghép khách sạn gần điểm khởi hành để không vội buổi sáng.' : 'Pair with a stay near the pickup point.', vi ? 'Thêm xe riêng nếu đi gia đình hoặc nhóm đông.' : 'Add private transport for families or larger groups.'];
  }
}
