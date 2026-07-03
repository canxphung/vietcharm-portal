import { Component, computed, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  LucideAlertCircle,
  LucideArrowLeft,
  LucideAward,
  LucideBadgeCheck,
  LucideCalendar,
  LucideCalendarDays,
  LucideCar,
  LucideCheckCircle2,
  LucideCheckSquare,
  LucideClipboardList,
  LucideClock3,
  LucideCompass,
  LucideCreditCard,
  LucideFileText,
  LucideGift,
  LucideHeart,
  LucideHotel,
  LucideKey,
  LucideKeyRound,
  LucideLockKeyhole,
  LucideMail,
  LucideMapPinned,
  LucidePackageCheck,
  LucidePhone,
  LucideRoute,
  LucideShieldAlert,
  LucideShieldCheck,
  LucideShoppingBag,
  LucideSparkles,
  LucideSquare,
  LucideTrash2,
  LucideUser,
  LucideUserPlus,
  LucideUsersRound,
} from '@lucide/angular';
import type { BookingCartItem, UserAccount } from '@/types';
import { AuthService } from '@/services/auth.service';
import { CartService } from '@/services/cart.service';
import { CatalogService } from '@/services/catalog.service';
import { I18nService } from '@/services/i18n.service';
import { ToastService } from '@/services/toast.service';
import { UiStateService } from '@/services/ui-state.service';
import { LogoComponent } from '@/components/logo.component';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [
    DecimalPipe,
    RouterLink,
    LucideArrowLeft,
    LucideCalendarDays,
    LucideCar,
    LucideCheckSquare,
    LucideClock3,
    LucideCreditCard,
    LucideHotel,
    LucideMapPinned,
    LucidePackageCheck,
    LucideRoute,
    LucideShoppingBag,
    LucideSparkles,
    LucideSquare,
    LucideTrash2,
    LucideUsersRound,
  ],
  template: `
    <main class="py-8 md:py-10">
      <div class="mx-auto max-w-7xl px-4">
        <div class="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div class="space-y-2">
            <a routerLink="/discover" class="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-natural-accent transition hover:text-natural-olive">
              <svg lucideArrowLeft class="h-4 w-4"></svg><span>{{ isVi() ? 'Tiếp tục khám phá' : 'Continue exploring' }}</span>
            </a>
            <div>
              <h1 class="text-3xl font-black tracking-tight text-natural-ink md:text-4xl">{{ isVi() ? 'Giỏ hàng' : 'Travel Cart' }}</h1>
              <p class="mt-1 max-w-2xl text-sm leading-relaxed text-stone-500">{{ isVi() ? 'Kiểm tra dịch vụ đã chọn, bỏ mục không cần và chuyển sang thanh toán khi lịch trình đã ổn.' : 'Review selected services, remove anything unnecessary, then continue to checkout.' }}</p>
            </div>
          </div>

          @if (cart.items().length > 0) {
            <div class="grid grid-cols-3 overflow-hidden rounded-2xl border border-natural-border bg-white text-center shadow-xs">
              <div class="px-4 py-3"><p class="text-[10px] font-black uppercase tracking-wider text-stone-400">{{ isVi() ? 'Dịch vụ' : 'Items' }}</p><p class="mt-1 font-mono text-lg font-black text-natural-ink">{{ cart.selectedCount() }}</p></div>
              <div class="border-x border-natural-border px-4 py-3"><p class="text-[10px] font-black uppercase tracking-wider text-stone-400">{{ isVi() ? 'Ưu đãi' : 'Saving' }}</p><p class="mt-1 font-mono text-lg font-black" [class.text-emerald-700]="isBundleEligible()" [class.text-stone-400]="!isBundleEligible()">{{ isBundleEligible() ? '15%' : '0%' }}</p></div>
              <div class="px-4 py-3"><p class="text-[10px] font-black uppercase tracking-wider text-stone-400">{{ isVi() ? 'Tổng' : 'Total' }}</p><p class="mt-1 font-mono text-lg font-black text-natural-bronze">{{ payableAmount() | number : '1.0-0' }} đ</p></div>
            </div>
          }
        </div>

        @if (cart.items().length === 0) {
          <section class="flex min-h-[420px] items-center justify-center rounded-2xl border border-dashed border-natural-border bg-white px-5 py-12 text-center shadow-xs">
            <div class="max-w-md space-y-5">
              <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-natural-beige text-natural-accent"><svg lucideShoppingBag class="h-8 w-8"></svg></div>
              <div class="space-y-2">
                <h2 class="text-2xl font-black text-natural-ink">{{ isVi() ? 'Giỏ hàng đang trống' : 'Your cart is empty' }}</h2>
                <p class="text-sm leading-relaxed text-stone-500">{{ isVi() ? 'Chọn khách sạn, xe hoặc hoạt động yêu thích rồi quay lại đây để gom lịch trình trước khi thanh toán.' : 'Choose hotels, rides, or experiences first, then return here to review the trip before payment.' }}</p>
              </div>
              <div class="flex flex-col justify-center gap-3 sm:flex-row">
                <button type="button" class="btn-sheen inline-flex items-center justify-center gap-2 rounded-full bg-natural-gold-deep px-5 py-3 text-sm font-black text-natural-ink" (click)="continueShopping()"><svg lucideSparkles class="h-4 w-4"></svg><span>{{ isVi() ? 'Chọn dịch vụ' : 'Browse services' }}</span></button>
                <a routerLink="/" class="inline-flex items-center justify-center gap-2 rounded-full border border-natural-border bg-white px-5 py-3 text-sm font-black text-natural-ink"><svg lucideMapPinned class="h-4 w-4"></svg><span>{{ isVi() ? 'Về trang chủ' : 'Home' }}</span></a>
              </div>
            </div>
          </section>
        } @else {
          <!-- Trip board -->
          <section class="mb-6 overflow-hidden rounded-3xl border border-natural-border bg-[#1F261F] text-white shadow-luxe">
            <div class="grid gap-0 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div class="p-5 md:p-7">
                <div class="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <span class="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-natural-gold"><svg lucideRoute class="h-4 w-4"></svg>Trip board</span>
                    <h2 class="mt-2 font-serif text-2xl font-black tracking-tight md:text-4xl">{{ isVi() ? 'Chuyến đi VietCharm của bạn' : 'Your VietCharm trip' }}</h2>
                    <p class="mt-2 max-w-2xl text-sm leading-relaxed text-white/70">{{ isVi() ? 'Các dịch vụ trong giỏ được gom thành từng chặng để bạn dễ nhìn lại trước khi thanh toán.' : 'Selected services are grouped into route steps so the plan is easy to review before checkout.' }}</p>
                  </div>
                  <div class="rounded-2xl border border-white/12 bg-white/10 px-4 py-3 backdrop-blur-md">
                    <p class="text-[10px] font-black uppercase tracking-wider text-white/55">{{ isVi() ? 'Trạng thái combo' : 'Bundle status' }}</p>
                    <p class="mt-1 text-sm font-black" [class.text-emerald-300]="isBundleEligible()" [class.text-natural-gold]="!isBundleEligible()">{{ isBundleEligible() ? (isVi() ? 'Đã đủ điều kiện giảm 15%' : '15% saving unlocked') : (isVi() ? 'Thêm nhóm dịch vụ để mở ưu đãi' : 'Add another service type to unlock') }}</p>
                  </div>
                </div>
                <div class="grid gap-3 md:grid-cols-3">
                  @for (item of cart.items().slice(0, 3); track item.cartKey || item.id; let i = $index) {
                    <div class="rounded-2xl border border-white/12 bg-white/10 p-4 backdrop-blur-md">
                      <div class="mb-3 flex items-center justify-between gap-3">
                        <span class="rounded-full bg-natural-gold px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-natural-ink">{{ stepLabel(item, i) }}</span>
                        @switch (item.type) {
                          @case ('hotel') { <svg lucideHotel class="h-4 w-4"></svg> }
                          @case ('vehicle') { <svg lucideCar class="h-4 w-4"></svg> }
                          @default { <svg lucideMapPinned class="h-4 w-4"></svg> }
                        }
                      </div>
                      <h3 class="line-clamp-2 text-sm font-black leading-snug text-white">{{ item.name }}</h3>
                      <p class="mt-2 line-clamp-2 text-xs leading-relaxed text-white/62">{{ stepNote(item) }}</p>
                    </div>
                  }
                </div>
              </div>
              <div class="border-t border-white/10 bg-white/[0.08] p-5 md:p-7 lg:border-l lg:border-t-0">
                <div class="grid grid-cols-2 gap-3 lg:grid-cols-1">
                  <div class="rounded-2xl border border-white/12 bg-white/10 p-4"><svg lucideClock3 class="mb-2 h-4 w-4 text-natural-gold"></svg><p class="text-[10px] font-black uppercase tracking-wider text-white/50">{{ isVi() ? 'Số dịch vụ' : 'Services' }}</p><p class="mt-1 font-mono text-2xl font-black">{{ cart.selectedCount() }}</p></div>
                  <div class="rounded-2xl border border-white/12 bg-white/10 p-4"><svg lucideCreditCard class="mb-2 h-4 w-4 text-natural-gold"></svg><p class="text-[10px] font-black uppercase tracking-wider text-white/50">{{ isVi() ? 'Dự tính' : 'Estimate' }}</p><p class="mt-1 font-mono text-xl font-black text-natural-gold">{{ payableAmount() | number : '1.0-0' }} đ</p></div>
                </div>
              </div>
            </div>
          </section>

          <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <section class="space-y-3">
              <div class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-natural-border bg-white px-4 py-3 shadow-xs">
                <div>
                  <h2 class="text-sm font-black uppercase tracking-wider text-natural-ink">{{ isVi() ? 'Dịch vụ đã chọn' : 'Selected services' }}</h2>
                  <p class="mt-0.5 text-xs text-stone-500">{{ isVi() ? 'Tích chọn dịch vụ muốn thanh toán — đã chọn ' + cart.selectedItems().length + '/' + cart.items().length + '.' : 'Tick the services to pay for — ' + cart.selectedItems().length + '/' + cart.items().length + ' selected.' }}</p>
                </div>
                <div class="flex items-center gap-2">
                  <button type="button" class="inline-flex items-center gap-1.5 rounded-xl border border-natural-border bg-natural-bg px-3 py-2 text-xs font-bold text-natural-accent transition hover:bg-natural-beige" (click)="cart.setAllItemsSelected(!cart.allSelected())">
                    @if (cart.allSelected()) { <svg lucideCheckSquare class="h-4 w-4"></svg> } @else { <svg lucideSquare class="h-4 w-4"></svg> }
                    <span>{{ cart.allSelected() ? (isVi() ? 'Bỏ chọn tất cả' : 'Unselect all') : (isVi() ? 'Chọn tất cả' : 'Select all') }}</span>
                  </button>
                  <button type="button" class="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-natural-accent transition hover:bg-natural-beige" (click)="continueShopping()"><svg lucidePackageCheck class="h-4 w-4"></svg><span>{{ isVi() ? 'Chọn thêm' : 'Add more' }}</span></button>
                </div>
              </div>

              <ul class="space-y-3">
                @for (item of cart.items(); track item.cartKey || item.id; let i = $index) {
                  <li [class]="'grid gap-4 rounded-2xl border bg-white p-3 shadow-xs transition sm:grid-cols-[88px_minmax(0,1fr)_auto] sm:items-center ' + (cart.isItemSelected(item.cartKey || item.id) ? 'border-natural-gold/50' : 'border-natural-border opacity-60')">
                    <div class="relative">
                      <img [src]="item.image" [alt]="item.name" class="h-24 w-full rounded-xl border border-natural-border object-cover sm:h-20 sm:w-[5.5rem]" />
                      <button type="button" class="absolute left-1.5 top-1.5 inline-flex h-6 w-6 items-center justify-center rounded-md bg-white/95 shadow-sm backdrop-blur-sm transition hover:scale-105" (click)="cart.toggleItemSelected(item.cartKey || item.id)">
                        @if (cart.isItemSelected(item.cartKey || item.id)) { <svg lucideCheckSquare class="h-4 w-4 text-natural-accent"></svg> } @else { <svg lucideSquare class="h-4 w-4 text-stone-400"></svg> }
                      </button>
                    </div>
                    <div class="min-w-0 space-y-2">
                      <div class="flex flex-wrap items-center gap-2">
                        <span class="inline-flex items-center gap-1.5 rounded-full bg-[#1F261F] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white"><svg lucideRoute class="h-3.5 w-3.5 text-natural-gold"></svg>{{ stepLabel(item, i) }}</span>
                        <span class="inline-flex items-center gap-1.5 rounded-full bg-natural-beige px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-natural-accent">
                          @switch (item.type) {
                            @case ('hotel') { <svg lucideHotel class="h-4 w-4"></svg> }
                            @case ('vehicle') { <svg lucideCar class="h-4 w-4"></svg> }
                            @default { <svg lucideMapPinned class="h-4 w-4"></svg> }
                          }
                          {{ typeLabel(item.type) }}
                        </span>
                        <span class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700"><svg lucideUsersRound class="h-3.5 w-3.5"></svg>x{{ item.quantity }}</span>
                      </div>
                      <h3 class="line-clamp-2 text-base font-black leading-snug text-stone-950">{{ item.name }}</h3>
                      <p class="text-[11px] font-bold text-natural-accent">{{ stepTitle(item) }}</p>
                      @if (item.details) { <p class="line-clamp-2 text-xs leading-relaxed text-stone-500">{{ item.details }}</p> }
                    </div>
                    <div class="flex items-center justify-between gap-4 border-t border-natural-border pt-3 sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
                      <div class="text-left sm:text-right">
                        <p class="text-[10px] font-black uppercase tracking-wider text-stone-400">{{ isVi() ? 'Thành tiền' : 'Line total' }}</p>
                        <p class="mt-1 font-mono text-base font-black text-natural-bronze">{{ item.price * item.quantity | number : '1.0-0' }} đ</p>
                        <p class="mt-0.5 text-[11px] font-semibold text-stone-400">{{ item.price | number : '1.0-0' }} đ / {{ isVi() ? 'mục' : 'item' }}</p>
                      </div>
                      <button type="button" class="inline-flex h-9 min-w-9 items-center justify-center rounded-full border border-red-100 bg-red-50 px-2.5 text-xs font-black uppercase text-red-600 transition hover:bg-red-100" (click)="cart.removeItem(item.cartKey || item.id)"><svg lucideTrash2 class="h-4 w-4"></svg></button>
                    </div>
                  </li>
                }
              </ul>
            </section>

            <aside class="h-fit rounded-2xl border border-natural-border bg-white p-5 shadow-xs lg:sticky lg:top-32">
              <div class="mb-5 flex items-center gap-3 border-b border-natural-border pb-4">
                <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-natural-gold/25 text-natural-bronze"><svg lucideCreditCard class="h-5 w-5"></svg></div>
                <div>
                  <h2 class="font-black text-natural-ink">{{ isVi() ? 'Tóm tắt thanh toán' : 'Payment summary' }}</h2>
                  <p class="text-xs text-stone-500">{{ isBundleEligible() ? (isVi() ? 'Ưu đãi combo được tính tự động.' : 'Bundle discount is applied automatically.') : (isVi() ? 'Cần ít nhất 2 nhóm dịch vụ để nhận combo.' : 'Add at least 2 service types to unlock bundle savings.') }}</p>
                </div>
              </div>
              <div class="space-y-3 text-sm">
                <div class="flex justify-between gap-3"><span class="text-stone-500">{{ isVi() ? 'Tạm tính' : 'Subtotal' }}</span><span class="font-mono font-bold text-stone-900">{{ totalCost() | number : '1.0-0' }} đ</span></div>
                <div class="flex justify-between gap-3" [class.text-emerald-700]="isBundleEligible()" [class.text-stone-400]="!isBundleEligible()">
                  <span class="font-semibold">{{ isBundleEligible() ? (isVi() ? 'Giảm combo 15%' : 'Bundle discount 15%') : (isVi() ? 'Combo chưa đủ điều kiện' : 'Bundle not eligible') }}</span>
                  <span class="font-mono font-bold">{{ isBundleEligible() ? '-' + (bundleDiscount() | number : '1.0-0') + ' đ' : '0 đ' }}</span>
                </div>
                <div class="flex justify-between gap-3 border-t border-natural-border pt-4"><span class="text-xs font-black uppercase tracking-wider text-natural-ink">{{ isVi() ? 'Cần thanh toán' : 'Payable' }}</span><span class="font-mono text-xl font-black text-natural-bronze">{{ payableAmount() | number : '1.0-0' }} đ</span></div>
              </div>
              <div class="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-3 text-xs leading-relaxed text-emerald-800">
                <div class="mb-1 flex items-center gap-1.5 font-black"><svg lucideCalendarDays class="h-4 w-4"></svg><span>{{ isVi() ? 'Lưu ý lịch trình' : 'Trip note' }}</span></div>
                <p>{{ isVi() ? 'Ngày nhận phòng, lịch xe và mô tả dịch vụ sẽ đi theo từng mục trong giỏ để tránh nhầm lịch.' : 'Dates, ride schedules, and service details stay attached to each cart item to prevent mix-ups.' }}</p>
              </div>
              <div class="mt-5 space-y-3">
                <button type="button" class="btn-sheen inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-natural-accent px-4 text-sm font-black text-white disabled:opacity-50" [disabled]="cart.selectedCount() === 0" (click)="checkout()"><svg lucideCreditCard class="h-4 w-4"></svg><span>{{ cart.selectedCount() > 0 ? (isVi() ? 'Thanh toán (' + cart.selectedItems().length + ')' : 'Checkout (' + cart.selectedItems().length + ')') : (isVi() ? 'Chọn dịch vụ để thanh toán' : 'Select items to checkout') }}</span></button>
                <button type="button" class="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-natural-border bg-white px-4 text-sm font-black text-natural-ink" (click)="continueShopping()"><svg lucideShoppingBag class="h-4 w-4"></svg><span>{{ isVi() ? 'Tiếp tục chọn dịch vụ' : 'Continue shopping' }}</span></button>
                <button type="button" class="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-black text-white transition hover:bg-red-700" (click)="confirmClearOpen.set(true)"><svg lucideTrash2 class="h-4 w-4"></svg><span>{{ isVi() ? 'Xóa giỏ hàng' : 'Clear cart' }}</span></button>
              </div>
            </aside>
          </div>
        }
      </div>

      @if (confirmClearOpen()) {
        <div class="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 px-4 backdrop-blur-xs">
          <div class="w-full max-w-sm rounded-2xl border border-natural-border bg-white p-5 shadow-2xl">
            <div class="flex items-start gap-3">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600"><svg lucideTrash2 class="h-5 w-5"></svg></div>
              <div>
                <h2 class="font-black text-natural-ink">{{ isVi() ? 'Xóa toàn bộ giỏ hàng?' : 'Clear the whole cart?' }}</h2>
                <p class="mt-1 text-sm leading-relaxed text-stone-500">{{ isVi() ? 'Các dịch vụ và lịch trình đã chọn sẽ bị xóa khỏi giỏ.' : 'All selected services and schedule details will be removed.' }}</p>
              </div>
            </div>
            <div class="mt-5 grid grid-cols-2 gap-3">
              <button type="button" class="rounded-xl border border-natural-border bg-white px-4 py-2.5 text-xs font-black text-natural-ink transition hover:bg-stone-50" (click)="confirmClearOpen.set(false)">{{ isVi() ? 'Giữ lại' : 'Keep cart' }}</button>
              <button type="button" class="rounded-xl bg-red-600 px-4 py-2.5 text-xs font-black text-white transition hover:bg-red-700" (click)="cart.clearCart(); confirmClearOpen.set(false)">{{ isVi() ? 'Xóa giỏ' : 'Clear' }}</button>
            </div>
          </div>
        </div>
      }
    </main>
  `,
})
export class CartPageComponent {
  readonly confirmClearOpen = signal(false);
  readonly isVi = computed(() => this.i18n.isVi());
  readonly totalCost = computed(() => this.cart.selectedItems().reduce((acc, item) => acc + item.price * item.quantity, 0));
  readonly isBundleEligible = computed(() => {
    const sel = this.cart.selectedItems();
    return sel.length >= 2 && new Set(sel.map((i) => i.type)).size >= 2;
  });
  readonly bundleDiscount = computed(() => (this.isBundleEligible() ? Math.round(this.totalCost() * 0.15) : 0));
  readonly payableAmount = computed(() => Math.max(0, this.totalCost() - this.bundleDiscount()));

  constructor(
    readonly cart: CartService,
    readonly i18n: I18nService,
    private readonly ui: UiStateService,
  ) {}

  typeLabel(type: BookingCartItem['type']): string {
    if (type === 'hotel') return this.isVi() ? 'Khách sạn' : 'Hotel';
    if (type === 'vehicle') return this.isVi() ? 'Xe & đưa đón' : 'Transport';
    return this.isVi() ? 'Hoạt động' : 'Experience';
  }

  stepLabel(item: BookingCartItem, index: number): string {
    const s = index + 1;
    if (item.type === 'hotel') return this.isVi() ? `Đêm ${s}` : `Night ${s}`;
    if (item.type === 'vehicle') return this.isVi() ? `Chặng ${s}` : `Leg ${s}`;
    return this.isVi() ? `Ngày ${s}` : `Day ${s}`;
  }

  stepTitle(item: BookingCartItem): string {
    if (item.type === 'hotel') return this.isVi() ? 'Điểm nghỉ trong hành trình' : 'Stay anchor';
    if (item.type === 'vehicle') return this.isVi() ? 'Di chuyển giữa các điểm' : 'Route transport';
    return this.isVi() ? 'Trải nghiệm đáng nhớ' : 'Trip highlight';
  }

  stepNote(item: BookingCartItem): string {
    if (item.type === 'hotel') return this.isVi() ? 'Giữ chỗ nghỉ để các chặng còn lại dễ sắp xếp hơn.' : 'Anchors the route so the rest of the plan is easier to arrange.';
    if (item.type === 'vehicle') return this.isVi() ? 'Dùng để nối khách sạn, sân bay và điểm trải nghiệm.' : 'Connects stays, airports, and experiences.';
    return this.isVi() ? 'Hoạt động tạo điểm nhấn cho lịch trình.' : 'Adds a memorable moment to the itinerary.';
  }

  continueShopping(): void {
    this.ui.openAllServices('hotels');
  }

  checkout(): void {
    this.ui.requireAuth(() => this.cart.openPayment('checkout'), this.isVi() ? 'Đăng nhập để thanh toán.' : 'Sign in to checkout.');
  }
}

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [
    FormsModule,
    LogoComponent,
    LucideAlertCircle,
    LucideArrowLeft,
    LucideBadgeCheck,
    LucideCheckCircle2,
    LucideCompass,
    LucideGift,
    LucideKeyRound,
    LucideLockKeyhole,
    LucideMail,
    LucidePhone,
    LucideShieldCheck,
    LucideSparkles,
    LucideUser,
    LucideUserPlus,
  ],
  template: `
    <main class="bg-natural-bg">
      <section class="relative overflow-hidden border-b border-natural-border">
        <div class="absolute inset-0">
          <img [src]="authImage" alt="VietCharm heritage travel" class="h-full w-full object-cover" />
          <div class="absolute inset-0 bg-[linear-gradient(110deg,rgba(30,29,21,0.88),rgba(74,74,53,0.72),rgba(253,252,248,0.84))]"></div>
        </div>

        <div class="relative mx-auto grid min-h-[calc(100vh-7rem)] max-w-7xl items-center gap-8 px-4 py-10 lg:grid-cols-[0.95fr_1.05fr]">
          <!-- Hero copy -->
          <div class="max-w-xl text-white">
            <span class="mb-5 inline-flex rounded-2xl border border-white/25 bg-white/15 px-3 py-2 backdrop-blur"><app-logo size="sm" /></span>
            <h1 class="font-serif text-4xl font-black leading-tight sm:text-5xl">{{ isVi() ? 'Một tài khoản cho những hành trình Việt Nam theo vùng.' : 'One account for Vietnam journeys by region.' }}</h1>
            <p class="mt-5 max-w-lg text-sm leading-7 text-white/78">{{ isVi() ? 'Đăng nhập hoặc tạo tài khoản để lưu hồ sơ, quản lý đặt chỗ và nhận ưu đãi phù hợp với chuyến đi của bạn.' : 'Sign in or create an account to save your profile, manage bookings and unlock travel perks.' }}</p>
            <div class="mt-8 grid max-w-lg gap-3 sm:grid-cols-3">
              <div class="rounded-2xl border border-white/18 bg-white/12 p-4 text-sm font-bold backdrop-blur"><svg lucideCompass class="mb-3 h-5 w-5 text-natural-gold"></svg>{{ isVi() ? 'Lưu hành trình' : 'Saved trips' }}</div>
              <div class="rounded-2xl border border-white/18 bg-white/12 p-4 text-sm font-bold backdrop-blur"><svg lucideShieldCheck class="mb-3 h-5 w-5 text-natural-gold"></svg>{{ isVi() ? 'Hồ sơ rõ ràng' : 'Profile details' }}</div>
              <div class="rounded-2xl border border-white/18 bg-white/12 p-4 text-sm font-bold backdrop-blur"><svg lucideGift class="mb-3 h-5 w-5 text-natural-gold"></svg>{{ isVi() ? 'Ưu đãi riêng' : 'Member perks' }}</div>
            </div>
          </div>

          <!-- Card -->
          <div class="mx-auto w-full max-w-xl rounded-3xl border border-white/70 bg-natural-bg/96 p-5 shadow-2xl backdrop-blur sm:p-7">
            <div class="mb-6">
              <span class="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase text-emerald-800 ring-1 ring-emerald-100"><svg lucideSparkles class="h-3.5 w-3.5"></svg>{{ isVi() ? 'Khu vực thành viên' : 'Member Area' }}</span>
              <h2 class="font-serif text-3xl font-black text-natural-text">{{ title() }}</h2>
              <p class="mt-2 text-sm leading-6 text-stone-600">{{ subtitle() }}</p>
            </div>

            @if (mode() !== 'forgot-password') {
              <div class="mb-5 grid grid-cols-2 rounded-xl bg-natural-beige p-1">
                <button type="button" [class]="'inline-flex min-h-10 items-center justify-center gap-2 rounded-lg text-sm font-bold transition ' + (mode() === 'login' ? 'bg-white text-natural-accent shadow-sm' : 'text-stone-500 hover:text-natural-text')" (click)="switchMode('login')"><svg lucideUser class="h-4 w-4"></svg>{{ isVi() ? 'Đăng nhập' : 'Sign In' }}</button>
                <button type="button" [class]="'inline-flex min-h-10 items-center justify-center gap-2 rounded-lg text-sm font-bold transition ' + (mode() === 'register' ? 'bg-white text-natural-accent shadow-sm' : 'text-stone-500 hover:text-natural-text')" (click)="switchMode('register')"><svg lucideUserPlus class="h-4 w-4"></svg>{{ isVi() ? 'Đăng ký' : 'Register' }}</button>
              </div>
            }

            @if (errorMsg()) { <div class="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold leading-5 text-red-700"><svg lucideAlertCircle class="mt-0.5 h-4 w-4 shrink-0"></svg><span>{{ errorMsg() }}</span></div> }
            @if (successMsg()) { <div class="mb-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold leading-5 text-emerald-800"><svg lucideCheckCircle2 class="mt-0.5 h-4 w-4 shrink-0"></svg><span>{{ successMsg() }}</span></div> }

            @if (mode() === 'login') {
              <form class="space-y-4" (ngSubmit)="handleLogin()">
                <label class="block">
                  <span class="mb-1.5 block text-[11px] font-bold uppercase text-stone-600">{{ isVi() ? 'SĐT / Gmail / Tên đăng nhập' : 'Phone / Gmail / Username' }}</span>
                  <span class="afield"><svg lucideUser class="h-4 w-4 shrink-0 text-natural-accent"></svg><input class="ainput" [ngModel]="username()" (ngModelChange)="username.set($event)" name="username" [placeholder]="isVi() ? 'Nhập thông tin đăng nhập' : 'Enter your credential'" required /></span>
                  <span class="mt-1.5 block text-[11px] leading-relaxed text-stone-500">{{ isVi() ? 'Tài khoản dùng thử: ' : 'Try it with: ' }}<span class="font-mono font-semibold text-stone-700">0987654321</span>{{ isVi() ? ' / Mật khẩu: ' : ' / Password: ' }}<span class="font-mono font-semibold text-stone-700">123456</span></span>
                </label>
                <label class="block">
                  <span class="mb-1.5 block text-[11px] font-bold uppercase text-stone-600">{{ isVi() ? 'Mật khẩu' : 'Password' }}</span>
                  <span class="afield"><svg lucideLockKeyhole class="h-4 w-4 shrink-0 text-natural-accent"></svg><input class="ainput" type="password" [ngModel]="password()" (ngModelChange)="password.set($event)" name="password" placeholder="••••••••" required /></span>
                </label>
                <div class="flex justify-end"><button type="button" class="inline-flex items-center gap-1 text-xs font-bold text-natural-accent hover:text-natural-olive" (click)="switchMode('forgot-password')"><svg lucideKeyRound class="h-3.5 w-3.5"></svg>{{ isVi() ? 'Quên mật khẩu?' : 'Forgot password?' }}</button></div>
                <button type="submit" class="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-natural-accent px-5 text-sm font-black text-white shadow-lg transition hover:bg-natural-olive"><svg lucideShieldCheck class="h-4 w-4"></svg>{{ isVi() ? 'Đăng nhập' : 'Sign In' }}</button>
              </form>
            }

            @if (mode() === 'register') {
              <form class="space-y-4" (ngSubmit)="handleRegister()">
                <div class="grid gap-3 sm:grid-cols-2">
                  <label class="block"><span class="mb-1.5 block text-[11px] font-bold uppercase text-stone-600">{{ isVi() ? 'Tên đăng nhập' : 'Username' }}</span><span class="afield"><svg lucideBadgeCheck class="h-4 w-4 shrink-0 text-natural-accent"></svg><input class="ainput" [ngModel]="username()" (ngModelChange)="username.set($event)" name="rusername" placeholder="kimngan26" required /></span></label>
                  <label class="block"><span class="mb-1.5 block text-[11px] font-bold uppercase text-stone-600">{{ isVi() ? 'Họ và tên' : 'Full Name' }}</span><span class="afield"><svg lucideUser class="h-4 w-4 shrink-0 text-natural-accent"></svg><input class="ainput" [ngModel]="fullName()" (ngModelChange)="fullName.set($event)" name="fullName" [placeholder]="isVi() ? 'Đặng Thị Kim Ngân' : 'Kim Ngan Dang'" required /></span></label>
                </div>
                <label class="block"><span class="mb-1.5 block text-[11px] font-bold uppercase text-stone-600">{{ isVi() ? 'Địa chỉ Gmail' : 'Email Address' }}</span><span class="afield"><svg lucideMail class="h-4 w-4 shrink-0 text-natural-accent"></svg><input class="ainput" type="email" [ngModel]="email()" (ngModelChange)="email.set($event)" name="email" placeholder="ngan@gmail.com" required /></span></label>
                <div class="grid gap-3 sm:grid-cols-2">
                  <label class="block"><span class="mb-1.5 block text-[11px] font-bold uppercase text-stone-600">{{ isVi() ? 'Số điện thoại' : 'Phone Number' }}</span><span class="afield"><svg lucidePhone class="h-4 w-4 shrink-0 text-natural-accent"></svg><input class="ainput" type="tel" [ngModel]="phone()" (ngModelChange)="phone.set($event)" name="phone" placeholder="0987654321" required /></span></label>
                  <label class="block"><span class="mb-1.5 block text-[11px] font-bold uppercase text-stone-600">{{ isVi() ? 'Mật khẩu' : 'Password' }}</span><span class="afield"><svg lucideLockKeyhole class="h-4 w-4 shrink-0 text-natural-accent"></svg><input class="ainput" type="password" [ngModel]="password()" (ngModelChange)="password.set($event)" name="rpassword" placeholder="••••••••" required /></span></label>
                </div>
                <p class="text-[11px] leading-relaxed text-stone-500">{{ isVi() ? 'Tài khoản mới mặc định là khách du lịch. Quyền quản trị được cấp trong trang quản trị.' : 'New accounts are travelers by default. Admin access is granted from the admin dashboard.' }}</p>
                <button type="submit" class="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-natural-gold px-5 text-sm font-black text-natural-ink shadow-lg transition hover:bg-natural-gold-dark"><svg lucideUserPlus class="h-4 w-4"></svg>{{ isVi() ? 'Tạo tài khoản' : 'Create Account' }}</button>
              </form>
            }

            @if (mode() === 'forgot-password') {
              <div class="space-y-5">
                <button type="button" class="inline-flex items-center gap-2 text-sm font-bold text-natural-accent transition hover:text-natural-olive" (click)="switchMode('login')"><svg lucideArrowLeft class="h-4 w-4"></svg>{{ isVi() ? 'Quay lại đăng nhập' : 'Back to sign in' }}</button>
                @if (forgotStep() === 'input-email') {
                  <form class="space-y-4" (ngSubmit)="handleForgotEmail()">
                    <label class="block"><span class="mb-1.5 block text-[11px] font-bold uppercase text-stone-600">{{ isVi() ? 'Gmail nhận mã' : 'Recovery Gmail' }}</span><span class="afield"><svg lucideMail class="h-4 w-4 shrink-0 text-natural-accent"></svg><input class="ainput" type="email" [ngModel]="forgotEmail()" (ngModelChange)="forgotEmail.set($event)" name="femail" placeholder="ngandtk244111@st.uel.edu.vn" required /></span></label>
                    <button type="submit" class="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-natural-accent px-5 text-sm font-black text-white shadow-lg transition hover:bg-natural-olive"><svg lucideMail class="h-4 w-4"></svg>{{ isVi() ? 'Gửi mã xác nhận' : 'Send Verification Code' }}</button>
                  </form>
                }
                @if (forgotStep() === 'verify-code') {
                  <form class="space-y-4" (ngSubmit)="handleVerifyCode()">
                    <label class="block"><span class="mb-1.5 block text-[11px] font-bold uppercase text-stone-600">{{ isVi() ? 'Mã gồm 6 chữ số' : '6-digit Code' }}</span><span class="afield"><svg lucideKeyRound class="h-4 w-4 shrink-0 text-natural-accent"></svg><input class="ainput text-center font-black tracking-[0.35em]" [ngModel]="verificationCode()" (ngModelChange)="verificationCode.set($event)" name="vcode" placeholder="839201" maxlength="6" inputmode="numeric" required /></span></label>
                    <button type="submit" class="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-natural-gold px-5 text-sm font-black text-natural-ink shadow-lg transition hover:bg-natural-gold-dark"><svg lucideBadgeCheck class="h-4 w-4"></svg>{{ isVi() ? 'Xác nhận mã' : 'Verify Code' }}</button>
                  </form>
                }
                @if (forgotStep() === 'new-pass') {
                  <form class="space-y-4" (ngSubmit)="handleSaveNewPassword()">
                    <label class="block"><span class="mb-1.5 block text-[11px] font-bold uppercase text-stone-600">{{ isVi() ? 'Mật khẩu mới' : 'New Password' }}</span><span class="afield"><svg lucideLockKeyhole class="h-4 w-4 shrink-0 text-natural-accent"></svg><input class="ainput" type="password" [ngModel]="newPassword()" (ngModelChange)="newPassword.set($event)" name="npass" placeholder="••••••••" required /></span></label>
                    <button type="submit" class="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 text-sm font-black text-white shadow-lg transition hover:bg-emerald-800"><svg lucideCheckCircle2 class="h-4 w-4"></svg>{{ isVi() ? 'Lưu mật khẩu mới' : 'Save New Password' }}</button>
                  </form>
                }
              </div>
            }

            @if (mode() !== 'forgot-password') {
              <div class="my-5 flex items-center gap-3"><span class="h-px flex-1 bg-natural-border"></span><span class="text-xs font-semibold text-stone-400">{{ isVi() ? 'Hoặc tiếp tục với' : 'Or continue with' }}</span><span class="h-px flex-1 bg-natural-border"></span></div>
              <div class="grid grid-cols-2 gap-3">
                <button type="button" class="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-natural-border bg-white px-3 text-sm font-bold text-stone-700 shadow-sm transition hover:bg-natural-beige-light" (click)="handleSocial('Google')">
                  <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24"><path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.63 5.63 0 0 1 8.35 12.89a5.63 5.63 0 0 1 5.64-5.626c1.558 0 2.972.616 4.022 1.624l3.1-3.1C19.14 3.86 16.54 2.5 13.99 2.5a10.37 10.37 0 0 0-10.4 10.39 10.37 10.37 0 0 0 10.4 10.39c5.78 0 10.11-4.06 10.11-10.28 0-.69-.08-1.22-.22-1.72H12.24Z"/></svg>
                  <span>Google</span>
                </button>
                <button type="button" class="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#1877F2] bg-[#1877F2] px-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#166FE5]" (click)="handleSocial('Facebook')">
                  <svg class="h-4 w-4 shrink-0 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  <span>Facebook</span>
                </button>
              </div>
            }
          </div>
        </div>
      </section>
    </main>
  `,
  styles: [
    `
      .afield { display: flex; min-height: 3rem; align-items: center; gap: 0.75rem; border-radius: 0.75rem; border: 1px solid var(--color-natural-border); background: white; padding-inline: 0.875rem; transition: border-color 0.2s; }
      .afield:focus-within { border-color: var(--color-natural-accent); box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-natural-accent) 15%, transparent); }
      .ainput { height: 2.75rem; min-width: 0; flex: 1; background: transparent; font-size: 0.875rem; color: var(--color-natural-text); outline: none; }
    `,
  ],
})
export class AuthPageComponent {
  readonly authImage = 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1400&q=80';
  readonly username = signal('');
  readonly password = signal('');
  readonly fullName = signal('');
  readonly email = signal('');
  readonly phone = signal('');
  readonly errorMsg = signal('');
  readonly successMsg = signal('');
  readonly forgotEmail = signal('');
  readonly sentCode = signal('');
  readonly verificationCode = signal('');
  readonly newPassword = signal('');
  readonly forgotStep = signal<'input-email' | 'verify-code' | 'new-pass'>('input-email');

  readonly isVi = computed(() => this.i18n.isVi());

  constructor(
    readonly auth: AuthService,
    readonly i18n: I18nService,
    private readonly router: Router,
  ) {}

  mode(): 'login' | 'register' | 'forgot-password' {
    const url = this.router.url.split('?')[0];
    if (url.startsWith('/register')) return 'register';
    if (url.startsWith('/forgot-password')) return 'forgot-password';
    return 'login';
  }

  title(): string {
    const m = this.mode();
    if (m === 'register') return this.isVi() ? 'Tạo tài khoản' : 'Create Account';
    if (m === 'forgot-password') return this.isVi() ? 'Quên mật khẩu' : 'Forgot Password';
    return this.isVi() ? 'Đăng nhập' : 'Sign In';
  }

  subtitle(): string {
    const m = this.mode();
    if (m === 'register') return this.isVi() ? 'Mở tài khoản, mở lối đến những vùng đất di sản, ưu đãi riêng và hành trình dành riêng cho bạn.' : 'Open an account and unlock heritage lands, member perks and journeys made just for you.';
    if (m === 'forgot-password') return this.isVi() ? 'Nhập Gmail đã đăng ký để nhận mã xác nhận và đặt lại mật khẩu.' : 'Enter your registered Gmail to receive a code and reset your password.';
    return this.isVi() ? 'Chào mừng trở lại — hành trình VietCharm của bạn vẫn đang chờ phía trước.' : 'Welcome back — your VietCharm journey is waiting right where you left it.';
  }

  switchMode(m: 'login' | 'register' | 'forgot-password'): void {
    this.errorMsg.set('');
    this.successMsg.set('');
    void this.router.navigateByUrl('/' + m);
  }

  private navigateHome(): void {
    void this.router.navigateByUrl('/');
  }

  handleLogin(): void {
    this.errorMsg.set('');
    const cred = this.username().trim().toLowerCase();
    const matched = this.auth.users().find((u) => u.username.toLowerCase() === cred || u.email.toLowerCase() === cred || u.phone === cred);
    if (!matched || (matched.password || '123456') !== this.password()) {
      this.errorMsg.set(this.isVi() ? 'Thông tin đăng nhập hoặc mật khẩu không chính xác.' : 'Incorrect credential or password.');
      return;
    }
    this.successMsg.set(this.isVi() ? `Chào mừng trở lại, ${matched.fullName}!` : `Welcome back, ${matched.fullName}!`);
    setTimeout(() => {
      this.auth.login(matched);
      this.navigateHome();
    }, 700);
  }

  handleRegister(): void {
    this.errorMsg.set('');
    const users = this.auth.users();
    if (users.some((u) => u.username.toLowerCase() === this.username().trim().toLowerCase())) {
      this.errorMsg.set(this.isVi() ? 'Tên đăng nhập này đã tồn tại.' : 'Username already exists.');
      return;
    }
    if (users.some((u) => u.email.toLowerCase() === this.email().trim().toLowerCase())) {
      this.errorMsg.set(this.isVi() ? 'Địa chỉ Gmail này đã được sử dụng.' : 'Gmail address is already registered.');
      return;
    }
    if (this.password().trim().length < 6) {
      this.errorMsg.set(this.isVi() ? 'Mật khẩu phải từ 6 ký tự trở lên.' : 'Password must be at least 6 characters.');
      return;
    }
    const newUser: UserAccount = {
      id: `u-${Date.now()}`,
      username: this.username().trim(),
      password: this.password().trim(),
      fullName: this.fullName().trim() || this.username().trim(),
      email: this.email().trim(),
      phone: this.phone().trim(),
      bio: this.isVi() ? 'Thành viên của cộng đồng du lịch VietCharm.' : 'Member of the VietCharm travel community.',
      role: 'user',
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 999999)}?auto=format&fit=crop&w=150&q=80`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    this.successMsg.set(this.isVi() ? 'Tạo tài khoản thành công! Đang đưa bạn về trang chủ...' : 'Account created! Taking you home...');
    setTimeout(() => {
      this.auth.register(newUser);
      this.navigateHome();
    }, 800);
  }

  handleSocial(platform: 'Google' | 'Facebook'): void {
    const suffix = Math.floor(Math.random() * 900) + 100;
    const socialUser: UserAccount = {
      id: `u-social-${Date.now()}`,
      username: `${platform.toLowerCase()}_user${suffix}`,
      password: `oauth-${platform.toLowerCase()}`,
      fullName: platform === 'Google' ? `Google User #${suffix}` : `Facebook User #${suffix}`,
      email: `${platform.toLowerCase()}.${suffix}@st.uel.edu.vn`,
      phone: `0987${suffix}244`,
      bio: this.isVi() ? `Tài khoản đăng nhập qua ${platform}.` : `Linked via ${platform}.`,
      role: 'user',
      avatar: platform === 'Google' ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80' : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      createdAt: new Date().toISOString().split('T')[0],
    };
    this.successMsg.set(this.isVi() ? `Đã liên kết với ${platform} thành công!` : `Authorized with ${platform}!`);
    setTimeout(() => {
      this.auth.register(socialUser);
      this.navigateHome();
    }, 700);
  }

  handleForgotEmail(): void {
    this.errorMsg.set('');
    if (!this.forgotEmail().trim() || !this.forgotEmail().includes('@')) {
      this.errorMsg.set(this.isVi() ? 'Vui lòng nhập Gmail hợp lệ.' : 'Please enter a valid Gmail.');
      return;
    }
    const matched = this.auth.users().find((u) => u.email.toLowerCase() === this.forgotEmail().trim().toLowerCase());
    if (!matched) {
      this.errorMsg.set(this.isVi() ? 'Gmail này chưa tồn tại trong hệ thống.' : 'This Gmail is not registered.');
      return;
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    this.sentCode.set(code);
    this.forgotStep.set('verify-code');
    this.successMsg.set(this.isVi() ? `Đã gửi mã xác nhận đến Gmail của bạn. Mã của bạn: ${code}` : `Verification code sent to your Gmail. Your code: ${code}`);
  }

  handleVerifyCode(): void {
    this.errorMsg.set('');
    if (this.verificationCode().trim() !== this.sentCode()) {
      this.errorMsg.set(this.isVi() ? 'Mã xác nhận không khớp.' : 'Incorrect verification code.');
      return;
    }
    this.forgotStep.set('new-pass');
    this.successMsg.set(this.isVi() ? 'Xác minh thành công. Hãy đặt mật khẩu mới.' : 'Code verified. Choose a new password.');
  }

  handleSaveNewPassword(): void {
    this.errorMsg.set('');
    if (this.newPassword().trim().length < 6) {
      this.errorMsg.set(this.isVi() ? 'Mật khẩu mới phải từ 6 ký tự trở lên.' : 'Password must be at least 6 characters.');
      return;
    }
    if (!this.auth.updatePasswordByEmail(this.forgotEmail(), this.newPassword().trim())) {
      this.errorMsg.set(this.isVi() ? 'Không tìm thấy tài khoản để cập nhật mật khẩu.' : 'No account found to update.');
      return;
    }
    this.successMsg.set(this.isVi() ? 'Đặt mật khẩu mới thành công. Vui lòng đăng nhập.' : 'New password saved. Please sign in.');
    setTimeout(() => this.switchMode('login'), 900);
  }
}

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [
    DecimalPipe,
    FormsModule,
    RouterLink,
    LucideAward,
    LucideCalendar,
    LucideClipboardList,
    LucideCompass,
    LucideFileText,
    LucideGift,
    LucideHeart,
    LucideKey,
    LucideMail,
    LucidePhone,
    LucideUser,
  ],
  template: `
    @if (auth.currentUser(); as user) {
      <div class="mx-auto max-w-6xl space-y-8 px-4 py-10 text-natural-text">
        <!-- Header -->
        <div class="flex flex-col items-center justify-between gap-6 rounded-3xl border border-natural-border bg-natural-beige p-6 md:flex-row anim-rise">
          <div class="flex flex-col items-center gap-6 sm:flex-row">
            <div class="group relative">
              <img [src]="isEditing() ? draftAvatar() : user.avatar" [alt]="user.fullName" class="h-24 w-24 rounded-full border-4 border-amber-200 object-cover shadow-lg transition-transform duration-300 group-hover:scale-105" />
              @if (isEditing()) {
                <button type="button" class="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-[10px] font-bold text-white opacity-0 transition duration-200 group-hover:opacity-100" (click)="randomAvatar()">Đổi ảnh (Random)</button>
              }
            </div>
            <div class="space-y-1 text-center sm:text-left">
              <span class="inline-block rounded-full bg-natural-accent px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">{{ user.role === 'admin' ? 'SYSTEM ADMINISTRATOR' : 'PREMIUM MEMBER' }}</span>
              <h2 class="font-serif text-2xl font-black text-stone-900">{{ isEditing() ? draftFullName() : user.fullName }}</h2>
              <p class="flex items-center justify-center gap-1 text-xs font-semibold text-natural-accent sm:justify-start"><svg lucideMail class="h-3.5 w-3.5"></svg> {{ isEditing() ? draftEmail() : user.email }}</p>
              <p class="mt-1 max-w-md text-xs italic text-stone-500">"{{ (isEditing() ? draftBio() : user.bio) || (i18n.isVi() ? 'Hội viên cao cấp của VietCharm.' : 'Premium member of VietCharm.') }}"</p>
            </div>
          </div>
          <div class="flex gap-3">
            <button type="button" class="rounded-xl border border-natural-border bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-natural-accent shadow-xs transition hover:bg-natural-cream" (click)="toggleEdit(user)">{{ isEditing() ? (i18n.isVi() ? 'Hủy bỏ' : 'Cancel') : (i18n.isVi() ? 'Chỉnh sửa hồ sơ' : 'Edit Profile') }}</button>
            <a routerLink="/" class="rounded-xl bg-natural-accent px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md transition hover:bg-natural-olive">{{ i18n.isVi() ? 'Về Trang chủ' : 'To Home' }}</a>
          </div>
        </div>

        @if (saveSuccess()) { <div class="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center text-xs font-bold text-emerald-800 anim-rise">✓ {{ i18n.isVi() ? 'Cập nhật thông tin cá nhân thành công!' : 'Profile updated successfully!' }}</div> }

        <div class="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
          <!-- LEFT: details / edit -->
          <div class="space-y-6 rounded-3xl border border-natural-border bg-white p-6 shadow-sm lg:col-span-1 anim-rise">
            <h3 class="flex items-center gap-2 border-b border-natural-border pb-3 font-serif text-lg font-bold text-stone-800"><svg lucideAward class="h-5 w-5 text-amber-500"></svg><span>{{ i18n.isVi() ? 'Thông tin cá nhân' : 'Personal Details' }}</span></h3>

            @if (isEditing()) {
              <form class="space-y-4" (ngSubmit)="save(user)">
                <div><label class="mb-1 block text-xs font-bold uppercase text-stone-500">{{ i18n.isVi() ? 'Họ và tên' : 'Full Name' }}</label><input type="text" required [ngModel]="draftFullName()" (ngModelChange)="draftFullName.set($event)" name="fn" class="w-full rounded-lg border border-natural-border bg-white px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-natural-accent" /></div>
                <div><label class="mb-1 block text-xs font-bold uppercase text-stone-500">{{ i18n.isVi() ? 'Địa chỉ Email' : 'Email' }}</label><input type="email" required [ngModel]="draftEmail()" (ngModelChange)="draftEmail.set($event)" name="em" class="w-full rounded-lg border border-natural-border bg-white px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-natural-accent" /></div>
                <div><label class="mb-1 block text-xs font-bold uppercase text-stone-500">{{ i18n.isVi() ? 'Số điện thoại' : 'Phone' }}</label><input type="text" [ngModel]="draftPhone()" (ngModelChange)="draftPhone.set($event)" name="ph" class="w-full rounded-lg border border-natural-border bg-white px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-natural-accent" /></div>
                <div><label class="mb-1 block text-xs font-bold uppercase text-stone-500">{{ i18n.isVi() ? 'Giới thiệu bản thân' : 'Biography' }}</label><textarea rows="3" [ngModel]="draftBio()" (ngModelChange)="draftBio.set($event)" name="bio" class="w-full rounded-lg border border-natural-border bg-white px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-natural-accent"></textarea></div>
                <button type="submit" class="w-full rounded-xl bg-natural-gold py-2.5 text-xs font-black uppercase tracking-wider text-natural-text transition hover:bg-natural-gold-dark">{{ i18n.isVi() ? 'Lưu thay đổi' : 'Save Changes' }}</button>
              </form>
            } @else {
              <div class="space-y-4 text-xs">
                <div class="flex items-center justify-between border-b border-stone-100 py-2.5"><span class="flex items-center gap-1.5 font-bold uppercase tracking-wider text-stone-500"><svg lucideUser class="h-3.5 w-3.5 text-natural-accent"></svg>{{ i18n.isVi() ? 'Họ và tên' : 'Full Name' }}</span><span class="font-serif text-sm font-black text-stone-800">{{ user.fullName }}</span></div>
                <div class="flex items-center justify-between border-b border-stone-100 py-2.5"><span class="flex items-center gap-1.5 font-bold uppercase tracking-wider text-stone-500"><svg lucideMail class="h-3.5 w-3.5 text-natural-accent"></svg>{{ i18n.isVi() ? 'Địa chỉ Email' : 'Email' }}</span><span class="font-semibold text-natural-accent">{{ user.email }}</span></div>
                <div class="flex items-center justify-between border-b border-stone-100 py-2.5"><span class="flex items-center gap-1.5 font-bold uppercase tracking-wider text-stone-500"><svg lucideKey class="h-3.5 w-3.5 text-natural-accent"></svg>{{ i18n.isVi() ? 'Tên đăng nhập' : 'Username' }}</span><span class="font-mono font-bold text-stone-800">{{ user.username }}</span></div>
                <div class="flex items-center justify-between border-b border-stone-100 py-2.5"><span class="flex items-center gap-1.5 font-bold uppercase tracking-wider text-stone-500"><svg lucidePhone class="h-3.5 w-3.5 text-natural-accent"></svg>{{ i18n.isVi() ? 'Số điện thoại' : 'Phone' }}</span><span class="font-semibold text-stone-800">{{ user.phone || (i18n.isVi() ? 'Chưa cung cấp' : 'Not provided') }}</span></div>
                <div class="flex items-center justify-between border-b border-stone-100 py-2.5"><span class="flex items-center gap-1.5 font-bold uppercase tracking-wider text-stone-500"><svg lucideCalendar class="h-3.5 w-3.5 text-natural-accent"></svg>{{ i18n.isVi() ? 'Ngày tham gia' : 'Date Joined' }}</span><span class="font-medium text-stone-800">{{ user.createdAt }}</span></div>
                <div class="flex items-center justify-between border-b border-stone-100 py-2.5"><span class="flex items-center gap-1.5 font-bold uppercase tracking-wider text-stone-500"><svg lucideAward class="h-3.5 w-3.5 text-amber-500"></svg>{{ i18n.isVi() ? 'Nhóm đặc quyền' : 'Privilege Level' }}</span><span class="font-black text-emerald-700">{{ user.role === 'admin' ? (i18n.isVi() ? 'Quản trị hệ thống' : 'System SuperAdmin') : (i18n.isVi() ? 'Thành viên VIP Gold' : 'VIP Gold Member') }}</span></div>
                <div class="pt-3">
                  <span class="mb-1.5 flex items-center gap-1.5 font-bold uppercase tracking-wider text-stone-500"><svg lucideFileText class="h-3.5 w-3.5 text-natural-accent"></svg>{{ i18n.isVi() ? 'Giới thiệu bản thân' : 'Biography' }}</span>
                  <p class="rounded-xl border border-natural-border bg-natural-cream p-3 italic leading-relaxed text-stone-600">{{ user.bio || (i18n.isVi() ? 'Hội viên chưa thiết lập lời giới thiệu.' : 'No biography provided.') }}</p>
                </div>
                <div class="mt-6 space-y-3 border-t border-natural-border pt-6">
                  <h4 class="flex items-center gap-1.5 font-serif text-xs font-black uppercase text-natural-accent"><svg lucideGift class="h-4 w-4 text-natural-gold"></svg><span>{{ i18n.isVi() ? 'Ví Voucher ưu đãi của tôi' : 'My Coupon Wallet' }}</span></h4>
                  <div class="space-y-3">
                    @for (v of catalog.vouchers(); track v.code) {
                      <div class="group relative flex items-center justify-between overflow-hidden rounded-2xl border border-natural-border bg-natural-cream p-4 shadow-xs transition-all duration-300 hover:border-natural-accent">
                        <div class="absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-r border-natural-border bg-white"></div>
                        <div class="absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-l border-natural-border bg-white"></div>
                        <div class="flex-1 space-y-1 pl-3 pr-2">
                          <span class="select-all rounded-md bg-stone-100 px-2 py-0.5 font-mono text-xs font-black tracking-wider text-natural-accent transition-colors hover:bg-natural-accent/10">{{ v.code }}</span>
                          <span class="block text-[10px] leading-relaxed text-stone-500">{{ v.description }}</span>
                        </div>
                        <div class="flex min-w-[70px] shrink-0 flex-col items-center justify-center border-l border-dashed border-natural-border py-1 pl-4">
                          <span class="mb-0.5 block text-[9px] font-bold uppercase tracking-wider text-stone-400">{{ i18n.isVi() ? 'GIẢM' : 'OFF' }}</span>
                          <span class="block text-xs font-black text-amber-600">{{ v.discountType === 'percentage' ? v.value + '%' : (v.value >= 1000 ? (v.value / 1000) + 'k' : v.value + 'đ') }}</span>
                        </div>
                      </div>
                    }
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- RIGHT: tabs -->
          <div class="space-y-6 lg:col-span-2">
            <div class="flex flex-wrap gap-1 rounded-2xl border border-natural-border bg-natural-beige p-1.5">
              <button type="button" [class]="tabBtn('bookings', 'accent')" (click)="tab.set('bookings')"><svg lucideClipboardList class="h-4 w-4"></svg><span>{{ i18n.isVi() ? 'Lịch sử đặt vé' : 'Bookings' }}</span></button>
              <button type="button" [class]="tabBtn('favorites', 'rose')" (click)="tab.set('favorites')"><svg lucideHeart class="h-4 w-4 fill-current"></svg><span>{{ i18n.isVi() ? 'Yêu thích' : 'Favorites' }}</span>@if (ui.favorites().length > 0) { <span [class]="'rounded-full px-1.5 py-0.5 text-[9px] font-black ' + (tab() === 'favorites' ? 'bg-white text-rose-600' : 'bg-rose-100 text-rose-600')">{{ ui.favorites().length }}</span> }</button>
              <button type="button" [class]="tabBtn('history', 'accent')" (click)="tab.set('history')"><svg lucideCalendar class="h-4 w-4"></svg><span>{{ i18n.isVi() ? 'Đã xem' : 'Recent' }}</span>@if (ui.recentlyViewed().length > 0) { <span [class]="'rounded-full px-1.5 py-0.5 text-[9px] font-black ' + (tab() === 'history' ? 'bg-white text-stone-700' : 'bg-stone-200 text-stone-700')">{{ ui.recentlyViewed().length }}</span> }</button>
              <button type="button" [class]="tabBtn('partnerships', 'accent')" (click)="tab.set('partnerships')"><svg lucideCompass class="h-4 w-4"></svg><span>{{ i18n.isVi() ? 'Hợp tác' : 'Partnerships' }}</span></button>
            </div>

            <div class="anim-rise" [attr.data-tab]="tab()">
              @switch (tab()) {
                @case ('bookings') {
                  <div class="space-y-4 rounded-3xl border border-natural-border bg-white p-6 shadow-sm">
                    <h3 class="flex items-center gap-2 border-b border-natural-border pb-3 font-serif text-base font-bold text-stone-800"><svg lucideClipboardList class="h-5 w-5 text-natural-accent"></svg><span>{{ i18n.isVi() ? 'Lịch sử đặt vé & khách sạn' : 'Booking & Ticket History' }}</span></h3>
                    @if (userBookings(user).length === 0) {
                      <div class="space-y-2 py-8 text-center text-xs text-stone-400"><svg lucideFileText class="mx-auto h-10 w-10 text-stone-300"></svg><p>{{ i18n.isVi() ? 'Bạn chưa có đơn đặt chỗ nào trong hệ thống.' : 'No active bookings registered yet.' }}</p><a routerLink="/" class="mt-2 inline-block rounded-xl border border-natural-border bg-natural-cream px-4 py-2 text-[11px] font-bold uppercase text-natural-accent transition hover:bg-natural-beige">{{ i18n.isVi() ? 'Khám phá và đặt ngay' : 'Explore Attractions Now' }}</a></div>
                    } @else {
                      <div class="space-y-4">
                        @for (b of userBookings(user); track b.id) {
                          <div class="space-y-3 rounded-2xl border border-stone-200 p-4 transition hover:shadow-md">
                            <div class="flex flex-wrap items-start justify-between gap-2"><div><span class="font-mono text-[10px] font-bold text-stone-500">MÃ ĐƠN: {{ b.id }}</span><h4 class="mt-0.5 text-xs font-bold text-stone-800">{{ b.date }}</h4></div><span [class]="'rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ' + (b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : b.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800')">{{ b.status === 'confirmed' ? 'Đã thanh toán (Thẻ vé hợp lệ)' : b.status === 'pending' ? 'Chờ xử lý' : 'Đã hủy' }}</span></div>
                            <div class="space-y-1.5 rounded-xl bg-stone-50 p-3 text-xs">@for (it of b.items; track it.cartKey || it.id) { <div class="flex justify-between text-stone-600"><span>{{ it.name }} <strong class="text-stone-800">x{{ it.quantity }}</strong></span><span>{{ it.price * it.quantity | number : '1.0-0' }}đ</span></div> }</div>
                            <div class="flex items-center justify-between border-t border-stone-100 pt-3 text-xs"><span class="text-stone-500">{{ i18n.isVi() ? 'Giảm voucher:' : 'Discount:' }} -{{ b.discountApplied | number : '1.0-0' }}đ</span><span class="font-bold text-stone-900">{{ i18n.isVi() ? 'Thành tiền:' : 'Paid Balance:' }} <strong class="font-serif text-sm font-black text-natural-accent">{{ b.finalTotal | number : '1.0-0' }}đ</strong></span></div>
                          </div>
                        }
                      </div>
                    }
                  </div>
                }
                @case ('favorites') {
                  <div class="space-y-4 rounded-3xl border border-natural-border bg-white p-6 shadow-sm">
                    <h3 class="flex items-center gap-2 border-b border-natural-border pb-3 font-serif text-base font-bold text-stone-800"><svg lucideHeart class="h-5 w-5 fill-rose-500 text-rose-500"></svg><span>{{ i18n.isVi() ? 'Mục dịch vụ yêu thích của tôi' : 'My Favorite Services' }}</span></h3>
                    @if (ui.favorites().length === 0) {
                      <div class="space-y-2 py-8 text-center text-xs text-stone-400"><svg lucideHeart class="mx-auto h-10 w-10 animate-pulse text-stone-200"></svg><p>{{ i18n.isVi() ? 'Danh sách yêu thích trống.' : 'No favorites added yet.' }}</p><p class="mx-auto max-w-sm text-[10px] text-stone-400">{{ i18n.isVi() ? 'Hãy bấm hình trái tim tại các khách sạn, trải nghiệm hay thuê xe để lưu lại.' : 'Tap heart icons on hotels, tours, or activities to save them.' }}</p></div>
                    } @else {
                      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        @for (fav of ui.favorites(); track fav.id) {
                          <div class="flex flex-col justify-between overflow-hidden rounded-2xl border border-natural-border bg-natural-cream shadow-xs transition hover:border-natural-accent">
                            <div class="relative h-32 shrink-0 overflow-hidden"><img [src]="fav.image" [alt]="fav.name" class="h-full w-full object-cover" /><button type="button" class="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-rose-600 shadow-sm transition hover:scale-105" (click)="ui.toggleFavorite(fav)"><svg lucideHeart class="h-4 w-4 fill-current text-rose-600"></svg></button></div>
                            <div class="flex flex-1 flex-col justify-between space-y-2 p-3">
                              <div><span class="mb-1 inline-block rounded-full border border-amber-100 bg-amber-50 px-2 py-0.5 text-[9px] font-bold uppercase text-amber-700">{{ fav.type === 'hotel' ? (i18n.isVi() ? 'Khách sạn' : 'Hotel') : fav.type === 'vehicle' ? (i18n.isVi() ? 'Thuê xe' : 'Vehicle') : (i18n.isVi() ? 'Trải nghiệm' : 'Activity') }}</span><h4 class="line-clamp-1 text-xs font-bold text-stone-800">{{ fav.name }}</h4><p class="line-clamp-1 text-[10px] text-stone-500">{{ fav.description || '' }}</p></div>
                              <div class="flex items-center justify-between border-t border-stone-200 pt-2"><span class="font-mono text-xs font-black text-natural-accent">{{ fav.price | number : '1.0-0' }}đ{{ fav.type === 'hotel' ? (i18n.isVi() ? '/đêm' : '/night') : '' }}</span><button type="button" class="rounded-lg bg-natural-accent px-3 py-1 text-[10px] font-bold text-white transition hover:bg-natural-olive" (click)="ui.viewItem(fav)">{{ i18n.isVi() ? 'Xem' : 'View' }}</button></div>
                            </div>
                          </div>
                        }
                      </div>
                    }
                  </div>
                }
                @case ('history') {
                  <div class="space-y-4 rounded-3xl border border-natural-border bg-white p-6 shadow-sm">
                    <h3 class="flex items-center gap-2 border-b border-natural-border pb-3 font-serif text-base font-bold text-stone-800"><svg lucideCalendar class="h-5 w-5 text-natural-accent"></svg><span>{{ i18n.isVi() ? 'Dịch vụ đã xem gần đây' : 'Recently Viewed' }}</span></h3>
                    @if (ui.recentlyViewed().length === 0) {
                      <div class="space-y-2 py-8 text-center text-xs text-stone-400"><svg lucideCalendar class="mx-auto h-10 w-10 text-stone-200"></svg><p>{{ i18n.isVi() ? 'Bạn chưa xem dịch vụ nào gần đây.' : 'No recently viewed items yet.' }}</p></div>
                    } @else {
                      <div class="space-y-3">
                        @for (item of ui.recentlyViewed(); track item.id) {
                          <div class="flex cursor-pointer gap-3 rounded-xl border border-natural-border bg-natural-cream p-3 transition hover:bg-natural-beige" (click)="ui.viewItem(item)">
                            <img [src]="item.image" [alt]="item.name" class="h-16 w-16 shrink-0 rounded-lg object-cover" />
                            <div class="flex min-w-0 flex-1 flex-col justify-between"><div><h4 class="truncate text-xs font-bold text-stone-800">{{ item.name }}</h4><p class="line-clamp-1 text-[10px] text-stone-500">{{ item.description || '' }}</p></div><div class="mt-1 flex items-center justify-between"><span class="font-mono text-[11px] font-black text-natural-accent">{{ item.price | number : '1.0-0' }}đ</span><span class="text-[9px] italic text-stone-400">{{ i18n.isVi() ? 'Bấm để xem' : 'Click to view' }}</span></div></div>
                          </div>
                        }
                      </div>
                    }
                  </div>
                }
                @case ('partnerships') {
                  <div class="space-y-4 rounded-3xl border border-natural-border bg-white p-6 shadow-sm">
                    <h3 class="flex items-center gap-2 border-b border-natural-border pb-3 font-serif text-base font-bold text-stone-800"><svg lucideCompass class="h-5 w-5 text-amber-600"></svg><span>{{ i18n.isVi() ? 'Yêu cầu hợp tác lữ hành' : 'Partnership Applications Status' }}</span></h3>
                    @if (userPartnerships(user).length === 0) {
                      <p class="py-4 text-center text-xs text-stone-400">{{ i18n.isVi() ? 'Bạn chưa đăng ký liên kết kinh doanh dịch vụ nào.' : 'No brand partnership requests on file.' }}</p>
                    } @else {
                      <div class="space-y-3">
                        @for (p of userPartnerships(user); track p.id) {
                          <div class="flex flex-col items-start justify-between gap-4 rounded-2xl border border-stone-150 bg-stone-50 p-4 text-xs sm:flex-row sm:items-center">
                            <div class="space-y-1"><div class="flex items-center gap-2"><span class="font-mono text-[9px] font-bold text-stone-400">{{ p.id }}</span><strong class="text-sm text-stone-800">{{ p.brandName }}</strong></div><p class="text-stone-500">Người liên hệ: {{ p.contactName }} - Loại hình: <span class="font-semibold uppercase text-natural-accent">{{ p.type }}</span></p><span class="block text-[10px] text-stone-400">Đăng ngày: {{ p.date }}</span></div>
                            <span [class]="'rounded-full px-3 py-1 text-[10px] font-bold uppercase ' + (p.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : p.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800')">{{ p.status === 'approved' ? '✓ ĐÃ PHÊ DUYỆT' : p.status === 'pending' ? '● CHỜ DUYỆT' : '✕ TỪ CHỐI' }}</span>
                          </div>
                        }
                      </div>
                    }
                  </div>
                }
              }
            </div>
          </div>
        </div>
      </div>
    } @else {
      <section class="mx-auto max-w-5xl px-4 py-10">
        <div class="rounded-3xl border border-natural-border bg-white p-8 text-center shadow-luxe">
          <h1 class="font-serif text-3xl font-black text-natural-ink">{{ i18n.isVi() ? 'Bạn chưa đăng nhập' : 'You are not signed in' }}</h1>
          <a routerLink="/login" class="mt-5 inline-flex min-h-12 items-center rounded-xl bg-natural-accent px-5 text-sm font-black text-white">{{ i18n.isVi() ? 'Đăng nhập' : 'Sign in' }}</a>
        </div>
      </section>
    }
  `,
})
export class ProfilePageComponent {
  readonly tab = signal<'bookings' | 'favorites' | 'history' | 'partnerships'>('bookings');
  readonly isEditing = signal(false);
  readonly saveSuccess = signal(false);
  readonly draftFullName = signal('');
  readonly draftEmail = signal('');
  readonly draftPhone = signal('');
  readonly draftBio = signal('');
  readonly draftAvatar = signal('');

  constructor(
    readonly auth: AuthService,
    readonly i18n: I18nService,
    readonly ui: UiStateService,
    readonly catalog: CatalogService,
  ) {}

  tabBtn(name: string, color: 'accent' | 'rose'): string {
    const active = this.tab() === name;
    const activeCls = color === 'rose' ? 'bg-rose-600 text-white shadow-xs' : 'bg-natural-accent text-white shadow-xs';
    return 'flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold uppercase transition-all ' + (active ? activeCls : 'text-stone-600 hover:bg-stone-100');
  }

  userBookings(user: UserAccount) {
    return this.catalog.bookings().filter((b) => b.userEmail.toLowerCase() === user.email.toLowerCase());
  }

  userPartnerships(user: UserAccount) {
    return this.catalog.applications().filter((p) => p.email.toLowerCase() === user.email.toLowerCase());
  }

  toggleEdit(user: UserAccount): void {
    if (!this.isEditing()) {
      this.draftFullName.set(user.fullName);
      this.draftEmail.set(user.email);
      this.draftPhone.set(user.phone);
      this.draftBio.set(user.bio);
      this.draftAvatar.set(user.avatar);
    }
    this.isEditing.update((v) => !v);
  }

  randomAvatar(): void {
    this.draftAvatar.set(`https://picsum.photos/id/${Math.floor(Math.random() * 1000)}/150/150`);
  }

  save(user: UserAccount): void {
    this.auth.updateProfile({
      ...user,
      fullName: this.draftFullName() || user.fullName,
      email: this.draftEmail() || user.email,
      phone: this.draftPhone(),
      bio: this.draftBio(),
      avatar: this.draftAvatar() || user.avatar,
    });
    this.isEditing.set(false);
    this.saveSuccess.set(true);
    setTimeout(() => this.saveSuccess.set(false), 3000);
  }
}

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [FormsModule, LucideShieldAlert],
  template: `
    <section class="mx-auto max-w-7xl px-4 py-10">
      @if (auth.currentUser()?.role === 'admin') {
        <div class="mb-7">
          <p class="text-xs font-black uppercase tracking-[0.25em] text-natural-accent">Admin</p>
          <h1 class="font-serif text-4xl font-black text-natural-ink">{{ i18n.isVi() ? 'Bảng điều khiển VietCharm' : 'VietCharm dashboard' }}</h1>
        </div>
        <div class="grid gap-5 md:grid-cols-3">
          <div class="stat"><span>{{ auth.users().length }}</span>{{ i18n.isVi() ? 'Người dùng' : 'Users' }}</div>
          <div class="stat"><span>{{ catalog.applications().length }}</span>{{ i18n.isVi() ? 'Đối tác' : 'Partners' }}</div>
          <div class="stat"><span>{{ catalog.bookings().length }}</span>{{ i18n.isVi() ? 'Booking' : 'Bookings' }}</div>
        </div>
        <div class="mt-8 grid gap-6 lg:grid-cols-2">
          <section class="panel">
            <h2 class="panel-title">{{ i18n.isVi() ? 'Phân quyền người dùng' : 'User roles' }}</h2>
            @for (user of auth.users(); track user.id) {
              <div class="row">
                <div><b>{{ user.fullName }}</b><small>{{ user.email }}</small></div>
                <select class="select" [ngModel]="user.role" (ngModelChange)="auth.setUserRole(user.id, $event)">
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
              </div>
            }
          </section>
          <section class="panel">
            <h2 class="panel-title">{{ i18n.isVi() ? 'Đơn đăng ký đối tác' : 'Partner applications' }}</h2>
            @for (app of catalog.applications(); track app.id) {
              <div class="row">
                <div><b>{{ app.brandName }}</b><small>{{ app.contactName }} - {{ app.type }}</small></div>
                <select class="select" [ngModel]="app.status" (ngModelChange)="catalog.setApplicationStatus(app.id, $event)">
                  <option value="pending">pending</option>
                  <option value="approved">approved</option>
                  <option value="rejected">rejected</option>
                </select>
              </div>
            }
          </section>
        </div>
      } @else {
        <div class="mx-auto max-w-md rounded-3xl border border-red-200 bg-white p-8 text-center shadow-luxe">
          <svg lucideShieldAlert class="mx-auto h-12 w-12 text-red-500"></svg>
          <h1 class="mt-4 font-serif text-3xl font-black text-natural-ink">{{ i18n.isVi() ? 'Không có quyền truy cập' : 'Access denied' }}</h1>
          <p class="mt-2 text-sm text-natural-text/65">{{ i18n.isVi() ? 'Bạn cần tài khoản admin để vào dashboard.' : 'An admin account is required.' }}</p>
        </div>
      }
    </section>
  `,
  styles: [
    `.stat { border-radius: 1.5rem; border: 1px solid var(--color-natural-border); background: white; padding: 1.25rem; font-weight: 900; color: var(--color-natural-text); box-shadow: 0 18px 40px -26px rgb(0 0 0 / .3); } .stat span { display: block; font-family: var(--font-serif); font-size: 2.4rem; color: var(--color-natural-ink); } .panel { border-radius: 1.5rem; border: 1px solid var(--color-natural-border); background: white; padding: 1rem; } .panel-title { margin-bottom: .75rem; font-family: var(--font-serif); font-size: 1.4rem; font-weight: 900; color: var(--color-natural-ink); } .row { display: flex; align-items: center; justify-content: space-between; gap: 1rem; border-top: 1px solid var(--color-natural-border); padding: .8rem 0; } .row small { display: block; color: rgb(74 74 53 / .6); } .select { border-radius: .75rem; border: 1px solid var(--color-natural-border); padding: .55rem .7rem; font-weight: 800; }`,
  ],
})
export class AdminPageComponent {
  constructor(
    readonly auth: AuthService,
    readonly catalog: CatalogService,
    readonly i18n: I18nService,
  ) {}
}
