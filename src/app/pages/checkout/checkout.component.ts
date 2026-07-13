import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  LucideArrowLeft,
  LucideCheckCircle2,
  LucideCreditCard,
  LucideLock,
  LucideQrCode,
  LucideSmartphone,
  LucideTicket,
} from '@lucide/angular';
import { AuthService } from '@/services/auth.service';
import { CartService } from '@/services/cart.service';
import { CatalogService } from '@/services/catalog.service';
import { I18nService } from '@/services/i18n.service';
import type { BookingCartItem } from '@/types';
import { VoucherPickerComponent } from '@/components/voucher-picker/voucher-picker.component';

type Gateway = 'vnpay' | 'momo' | 'visa';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [
    DecimalPipe,
    FormsModule,
    RouterLink,
    VoucherPickerComponent,
    LucideArrowLeft,
    LucideCheckCircle2,
    LucideCreditCard,
    LucideLock,
    LucideQrCode,
    LucideSmartphone,
    LucideTicket,
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
})
export class CheckoutComponent {
  readonly cart = inject(CartService);
  readonly i18n = inject(I18nService);
  private readonly auth = inject(AuthService);
  private readonly catalog = inject(CatalogService);
  private readonly router = inject(Router);

  readonly step = signal<'review' | 'success'>('review');
  readonly gateway = signal<Gateway>('visa');
  readonly cardNo = signal('');
  readonly cardHolder = signal('');
  readonly paymentLoading = signal(false);
  readonly loadingText = signal('');
  readonly paymentError = signal('');
  readonly timestamp = new Date().toLocaleDateString('en-CA');
  readonly bookingRef = signal('');
  readonly completedItems = signal<BookingCartItem[]>([]);
  readonly vehicleIdNumber = signal('');
  readonly vehicleIdError = signal('');

  readonly isVi = computed(() => this.i18n.isVi());
  readonly t = computed(() => this.i18n.dictionary());
  readonly items = computed(() => this.cart.selectedItems());
  readonly hasVehicleItem = computed(() => this.items().some((item) => item.type === 'vehicle'));

  // Delegate to the shared cart pricing/voucher state so cart and checkout always agree.
  readonly totalCost = this.cart.totalCost;
  readonly isBundleEligible = this.cart.isBundleEligible;
  readonly discountAmount = this.cart.bundleDiscount;
  readonly payableAmount = this.cart.payableAmount;
  readonly voucherDiscount = this.cart.voucherDiscount;

  private loadingTimer?: ReturnType<typeof setInterval>;

  constructor() {
    if (this.items().length === 0) {
      void this.router.navigateByUrl('/cart');
    }
  }

  gatewayClass(g: Gateway): string {
    const active = this.gateway() === g;
    return (
      'flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 transition ' +
      (active
        ? 'border-natural-gold-deep bg-amber-500/5 text-stone-900'
        : 'border-stone-200 hover:bg-stone-50')
    );
  }

  onCardNo(value: string): void {
    this.cardNo.set(value.replace(/\D/g, '').substring(0, 16));
  }

  onVehicleIdInput(value: string): void {
    this.vehicleIdNumber.set(value);
    this.vehicleIdError.set('');
  }

  submitPayment(): void {
    if (this.paymentLoading()) return;
    if (this.hasVehicleItem() && this.vehicleIdNumber().trim().length < 9) {
      this.vehicleIdError.set(
        this.isVi()
          ? 'Vui lòng nhập số CCCD/CMND hợp lệ để thuê xe.'
          : 'Please enter a valid ID card number to rent a vehicle.',
      );
      return;
    }
    this.paymentError.set('');
    this.paymentLoading.set(true);
    const steps = this.isVi()
      ? [
          'Đang xác nhận phương thức thanh toán...',
          'Kiểm tra thông tin đặt chỗ...',
          'Xác nhận số tiền cần thanh toán...',
          'Gửi yêu cầu giữ chỗ đến đối tác dịch vụ...',
          'Tạo phiếu xác nhận VietCharm QR...',
        ]
      : [
          'Confirming payment method...',
          'Checking booking details...',
          'Confirming payable amount...',
          'Sending reservation request to service partners...',
          'Issuing your VietCharm QR confirmation...',
        ];
    let idx = 0;
    this.loadingText.set(steps[0]);
    this.loadingTimer = setInterval(() => {
      idx++;
      if (idx < steps.length) this.loadingText.set(steps[idx]);
    }, 850);
    setTimeout(async () => {
      if (this.loadingTimer) clearInterval(this.loadingTimer);
      try {
        await this.finalizeBooking();
        this.step.set('success');
      } catch {
        this.paymentError.set(
          this.isVi()
            ? 'Chưa thể hoàn tất thanh toán. Giỏ hàng của bạn vẫn được giữ nguyên, vui lòng thử lại.'
            : 'Payment could not be completed. Your cart is unchanged; please try again.',
        );
      } finally {
        this.paymentLoading.set(false);
      }
    }, 4500);
  }

  private async finalizeBooking(): Promise<void> {
    const user = this.auth.currentUser();
    const idLabel = this.isVi() ? 'CCCD thuê xe' : 'Rental ID';
    const idValue = this.vehicleIdNumber().trim();
    const checkoutItems = this.items();
    const subtotal = this.totalCost();
    const discount = this.discountAmount() + this.voucherDiscount();
    const finalTotal = this.payableAmount();
    const items = checkoutItems.map((item) =>
      item.type === 'vehicle' && idValue
        ? {
            ...item,
            details: item.details
              ? `${item.details} | ${idLabel}: ${idValue}`
              : `${idLabel}: ${idValue}`,
          }
        : item,
    );
    const booking = await this.catalog.createBookingFromCart(
      user?.email ?? '',
      user?.fullName ?? '',
      items,
      subtotal,
      discount,
      finalTotal,
    );
    this.completedItems.set(items);
    this.bookingRef.set(booking.id);
    this.cart.clearSelectedItems();
  }

  print(): void {
    if (typeof window !== 'undefined') window.print();
  }

  finish(): void {
    void this.router.navigateByUrl('/profile');
  }
}
