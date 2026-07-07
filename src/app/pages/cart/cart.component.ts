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
import { LogoComponent } from '@/components/logo/logo.component';

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
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent {
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
