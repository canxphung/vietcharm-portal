import { Component, computed, signal } from '@angular/core';
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

type Gateway = 'vnpay' | 'momo' | 'visa';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [
    DecimalPipe,
    FormsModule,
    RouterLink,
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
  readonly step = signal<'review' | 'success'>('review');
  readonly gateway = signal<Gateway>('visa');
  readonly cardNo = signal('');
  readonly cardHolder = signal('');
  readonly paymentLoading = signal(false);
  readonly loadingText = signal('');
  readonly voucherCode = signal('');
  readonly voucherDiscount = signal(0);
  readonly appliedVoucher = signal<string | null>(null);
  readonly voucherError = signal('');
  readonly timestamp = new Date().toLocaleDateString('en-CA');
  readonly bookingRef = signal('');

  readonly isVi = computed(() => this.i18n.isVi());
  readonly t = computed(() => this.i18n.dictionary());
  readonly items = computed(() => this.cart.selectedItems());
  readonly totalCost = computed(() => this.items().reduce((acc, item) => acc + item.price * item.quantity, 0));
  readonly isBundleEligible = computed(() => {
    const types = new Set(this.items().map((i) => i.type)).size;
    return this.items().length >= 2 && types >= 2;
  });
  readonly discountAmount = computed(() => (this.isBundleEligible() ? Math.round(this.totalCost() * 0.15) : 0));
  readonly basePayableAmount = computed(() => this.totalCost() - this.discountAmount());
  readonly payableAmount = computed(() => Math.max(0, this.basePayableAmount() - this.voucherDiscount()));

  private loadingTimer?: ReturnType<typeof setInterval>;

  constructor(
    readonly cart: CartService,
    readonly i18n: I18nService,
    private readonly auth: AuthService,
    private readonly catalog: CatalogService,
    private readonly router: Router,
  ) {
    if (this.items().length === 0) {
      void this.router.navigateByUrl('/cart');
    }
  }

  gatewayClass(g: Gateway): string {
    const active = this.gateway() === g;
    return (
      'flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 transition ' +
      (active ? 'border-natural-gold-deep bg-amber-500/5 text-stone-900' : 'border-stone-200 hover:bg-stone-50')
    );
  }

  onVoucherInput(value: string): void {
    this.voucherCode.set(value.toUpperCase());
    this.voucherError.set('');
  }

  onCardNo(value: string): void {
    this.cardNo.set(value.replace(/\D/g, '').substring(0, 16));
  }

  applyVoucher(): void {
    const trimmed = this.voucherCode().trim().toUpperCase();
    if (!trimmed) {
      this.voucherError.set(this.isVi() ? 'Vui lòng nhập mã giảm giá!' : 'Please enter a promo code!');
      return;
    }
    const base = this.basePayableAmount();
    const voucher = this.catalog.vouchers().find((v) => v.code === trimmed && v.active);
    if (!voucher) {
      this.voucherError.set(this.isVi() ? 'Mã giảm giá này không hợp lệ hoặc đã hết hạn!' : 'Invalid voucher code or expired!');
      return;
    }
    if (base < voucher.minSpend) {
      this.voucherError.set(
        this.isVi()
          ? `Đơn hàng cần tối thiểu ${voucher.minSpend.toLocaleString('vi-VN')}đ để dùng mã này.`
          : `This code requires a minimum order of ${voucher.minSpend.toLocaleString('en-US')}đ.`,
      );
      return;
    }
    const discount = voucher.discountType === 'percentage' ? Math.round((base * voucher.value) / 100) : voucher.value;
    this.voucherDiscount.set(discount);
    this.appliedVoucher.set(voucher.code);
    this.voucherError.set('');
  }

  removeVoucher(): void {
    this.appliedVoucher.set(null);
    this.voucherDiscount.set(0);
    this.voucherCode.set('');
  }

  submitPayment(): void {
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
    setTimeout(() => {
      if (this.loadingTimer) clearInterval(this.loadingTimer);
      this.paymentLoading.set(false);
      this.finalizeBooking();
      this.step.set('success');
    }, 4500);
  }

  private finalizeBooking(): void {
    const user = this.auth.currentUser();
    const items = this.items();
    const booking = this.catalog.createBookingFromCart(
      user?.email ?? '',
      user?.fullName ?? '',
      items,
      this.totalCost(),
      this.discountAmount() + this.voucherDiscount(),
      this.payableAmount(),
    );
    this.bookingRef.set(booking.id);
  }

  print(): void {
    if (typeof window !== 'undefined') window.print();
  }

  finish(): void {
    this.cart.clearSelectedItems();
    void this.router.navigateByUrl('/profile');
  }
}
