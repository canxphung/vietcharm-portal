import { Component, computed, effect, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideCheckCircle2,
  LucideCreditCard,
  LucideLock,
  LucideQrCode,
  LucideSmartphone,
  LucideTicket,
  LucideTrash2,
} from '@lucide/angular';
import { CartService } from '@/services/cart.service';
import { I18nService } from '@/services/i18n.service';

type Step = 'cart' | 'checkout' | 'success';
type Gateway = 'vnpay' | 'momo' | 'visa';

@Component({
  selector: 'app-payment-modal',
  standalone: true,
  imports: [
    DecimalPipe,
    FormsModule,
    LucideCheckCircle2,
    LucideCreditCard,
    LucideLock,
    LucideQrCode,
    LucideSmartphone,
    LucideTicket,
    LucideTrash2,
  ],
  templateUrl: './payment-modal.component.html',
  styleUrl: './payment-modal.component.css',
})
export class PaymentModalComponent {
  readonly step = signal<Step>('cart');
  readonly gateway = signal<Gateway>('visa');
  readonly cardNo = signal('');
  readonly cardHolder = signal('');
  readonly paymentLoading = signal(false);
  readonly loadingText = signal('');
  readonly voucherCode = signal('');
  readonly voucherDiscount = signal(0);
  readonly appliedVoucher = signal<string | null>(null);
  readonly voucherError = signal('');
  readonly confirmClearOpen = signal(false);
  readonly timestamp = new Date().toLocaleDateString('en-CA');

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
  ) {
    // Sync to the requested initial step each time the modal opens.
    effect(() => {
      if (this.cart.isPaymentOpen()) {
        this.step.set(this.cart.paymentInitialStep());
      }
    });
  }

  gatewayClass(g: Gateway): string {
    const active = this.gateway() === g;
    return 'flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 transition ' + (active ? 'border-natural-gold-deep bg-amber-500/5 text-stone-900' : 'border-stone-200 hover:bg-stone-50');
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
    const base = this.basePayableAmount();
    if (trimmed === 'VIETCHARM15') {
      this.voucherDiscount.set(Math.round(base * 0.15));
      this.appliedVoucher.set('VIETCHARM15');
      this.voucherError.set('');
    } else if (trimmed === 'HOIANWELCOME') {
      this.voucherDiscount.set(100000);
      this.appliedVoucher.set('HOIANWELCOME');
      this.voucherError.set('');
    } else if (trimmed === 'GENZTRAVEL') {
      this.voucherDiscount.set(Math.round(base * 0.2));
      this.appliedVoucher.set('GENZTRAVEL');
      this.voucherError.set('');
    } else if (trimmed === '') {
      this.voucherError.set(this.isVi() ? 'Vui lòng nhập mã giảm giá!' : 'Please enter a promo code!');
    } else {
      this.voucherError.set(this.isVi() ? 'Mã giảm giá này không hợp lệ hoặc đã hết hạn!' : 'Invalid voucher code or expired!');
    }
  }

  removeVoucher(): void {
    this.appliedVoucher.set(null);
    this.voucherDiscount.set(0);
    this.voucherCode.set('');
  }

  submitPayment(): void {
    this.paymentLoading.set(true);
    const steps = this.isVi()
      ? ['Đang xác nhận phương thức thanh toán...', 'Kiểm tra thông tin đặt chỗ...', 'Xác nhận số tiền cần thanh toán...', 'Gửi yêu cầu giữ chỗ đến đối tác dịch vụ...', 'Tạo phiếu xác nhận VietCharm QR...']
      : ['Confirming payment method...', 'Checking booking details...', 'Confirming payable amount...', 'Sending reservation request to service partners...', 'Issuing your VietCharm QR confirmation...'];
    let idx = 0;
    this.loadingText.set(steps[0]);
    this.loadingTimer = setInterval(() => {
      idx++;
      if (idx < steps.length) this.loadingText.set(steps[idx]);
    }, 850);
    setTimeout(() => {
      if (this.loadingTimer) clearInterval(this.loadingTimer);
      this.paymentLoading.set(false);
      this.step.set('success');
    }, 4500);
  }

  print(): void {
    if (typeof window !== 'undefined') window.print();
  }

  close(): void {
    if (this.step() === 'success') this.cart.clearSelectedItems();
    this.cart.closePayment();
    this.reset();
  }

  finish(): void {
    this.cart.clearSelectedItems();
    this.cart.closePayment();
    this.reset();
  }

  doClear(): void {
    this.cart.clearSelectedItems();
    this.confirmClearOpen.set(false);
  }

  private reset(): void {
    this.voucherCode.set('');
    this.voucherDiscount.set(0);
    this.appliedVoucher.set(null);
    this.voucherError.set('');
    this.gateway.set('visa');
    this.cardNo.set('');
    this.cardHolder.set('');
  }
}
