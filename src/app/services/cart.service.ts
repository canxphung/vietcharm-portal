import { computed, Injectable, signal } from '@angular/core';
import type { BookingCartItem } from '@/types';
import { CatalogService } from './catalog.service';
import { I18nService } from './i18n.service';
import { ToastService } from './toast.service';

function cartKey(item: BookingCartItem): string {
  return item.cartKey ?? item.id;
}

const PACKAGE_MODIFIERS: Record<NonNullable<BookingCartItem['packageKey']>, number> = {
  standard: 1,
  premium: 1.3,
  luxury: 1.6,
};

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly deselectedKeys = signal<string[]>([]);
  readonly items = signal<BookingCartItem[]>([]);
  readonly cartCount = computed(() => this.items().reduce((sum, item) => sum + item.quantity, 0));
  readonly selectedItems = computed(() => this.items().filter((item) => !this.deselectedKeys().includes(cartKey(item))));
  readonly selectedCount = computed(() => this.selectedItems().reduce((sum, item) => sum + item.quantity, 0));
  readonly allSelected = computed(() => this.items().length > 0 && this.selectedItems().length === this.items().length);
  readonly total = computed(() => this.items().reduce((sum, item) => sum + item.price * item.quantity, 0));
  readonly selectedTotal = computed(() => this.selectedItems().reduce((sum, item) => sum + item.price * item.quantity, 0));

  // Shared pricing so the cart and checkout pages always agree on totals.
  readonly totalCost = computed(() => this.selectedItems().reduce((sum, item) => sum + item.price * item.quantity, 0));
  readonly isBundleEligible = computed(() => {
    const items = this.selectedItems();
    return items.length >= 2 && new Set(items.map((item) => item.type)).size >= 2;
  });
  readonly bundleDiscount = computed(() => (this.isBundleEligible() ? Math.round(this.totalCost() * 0.15) : 0));
  readonly basePayableAmount = computed(() => this.totalCost() - this.bundleDiscount());
  readonly payableAmount = computed(() => Math.max(0, this.basePayableAmount() - this.voucherDiscount()));

  // Shared voucher state so a code applied in the cart carries over to checkout.
  readonly voucherCode = signal('');
  readonly appliedVoucher = signal<string | null>(null);
  readonly voucherError = signal('');
  /** Recomputed from the live cart total, so editing the cart after applying a code
   *  can never leave a stale discount or bypass the voucher's minimum spend. */
  readonly voucherDiscount = computed(() => {
    const code = this.appliedVoucher();
    if (!code) return 0;
    const voucher = this.catalog.vouchers().find((v) => v.code === code && v.active);
    if (!voucher) return 0;
    const base = this.basePayableAmount();
    if (base < voucher.minSpend) return 0;
    return voucher.discountType === 'percentage' ? Math.round((base * voucher.value) / 100) : Math.min(voucher.value, base);
  });
  readonly availableVouchers = computed(() => this.catalog.vouchers().filter((v) => v.active));

  constructor(
    private readonly i18n: I18nService,
    private readonly toast: ToastService,
    private readonly catalog: CatalogService,
  ) {}

  onVoucherInput(value: string): void {
    this.voucherCode.set(value.toUpperCase());
    this.voucherError.set('');
  }

  applyVoucher(): void {
    const trimmed = this.voucherCode().trim().toUpperCase();
    if (!trimmed) {
      this.voucherError.set(this.i18n.isVi() ? 'Vui lòng nhập mã giảm giá!' : 'Please enter a promo code!');
      return;
    }
    const voucher = this.catalog.vouchers().find((v) => v.code === trimmed && v.active);
    if (!voucher) {
      this.voucherError.set(this.i18n.isVi() ? 'Mã giảm giá này không hợp lệ hoặc đã hết hạn!' : 'Invalid voucher code or expired!');
      return;
    }
    const base = this.basePayableAmount();
    if (base < voucher.minSpend) {
      this.voucherError.set(
        this.i18n.isVi()
          ? `Đơn hàng cần tối thiểu ${voucher.minSpend.toLocaleString('vi-VN')}đ để dùng mã này.`
          : `This code requires a minimum order of ${voucher.minSpend.toLocaleString('en-US')}đ.`,
      );
      return;
    }
    this.appliedVoucher.set(voucher.code);
    this.voucherError.set('');
  }

  removeVoucher(): void {
    this.appliedVoucher.set(null);
    this.voucherCode.set('');
    this.voucherError.set('');
  }

  /** Picking a voucher from the list fills the code in and applies it immediately. */
  selectVoucher(code: string): void {
    this.voucherCode.set(code);
    this.applyVoucher();
  }

  isItemSelected(key: string): boolean {
    return !this.deselectedKeys().includes(key);
  }

  toggleItemSelected(key: string): void {
    this.deselectedKeys.update((keys) => (keys.includes(key) ? keys.filter((item) => item !== key) : [...keys, key]));
  }

  setAllItemsSelected(selected: boolean): void {
    this.deselectedKeys.set(selected ? [] : this.items().map(cartKey));
  }

  clearSelectedItems(): void {
    this.items.update((items) => items.filter((item) => this.deselectedKeys().includes(cartKey(item))));
    this.deselectedKeys.set([]);
    this.removeVoucher();
  }

  addItem(item: BookingCartItem): void {
    this.items.update((items) => {
      const key = cartKey(item);
      const exists = items.some((existing) => cartKey(existing) === key);
      if (exists) {
        return items.map((existing) => (cartKey(existing) === key ? { ...existing, quantity: existing.quantity + 1 } : existing));
      }
      return [...items, item];
    });
    this.toast.showToast({
      type: 'success',
      title: this.i18n.isVi() ? 'Đã thêm vào giỏ' : 'Added to cart',
      message: item.name,
    });
  }

  addCombo(items: BookingCartItem[]): void {
    const replacesCart = items.some((item) => item.id.startsWith('plan-'));
    this.items.update((current) => (replacesCart ? [...items] : [...current, ...items]));
    this.deselectedKeys.set([]);
    this.toast.showToast({
      type: 'success',
      title: this.i18n.isVi() ? 'Đã áp dụng combo' : 'Combo applied',
      message: this.i18n.isVi() ? 'Các dịch vụ gợi ý đã sẵn sàng thanh toán.' : 'Suggested services are ready for checkout.',
    });
  }

  removeItem(id: string): void {
    const snapshot = this.items();
    const deselectedSnapshot = this.deselectedKeys();
    const removed = snapshot
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => cartKey(item) === id || item.id === id);
    if (removed.length === 0) return;

    const removedKeys = new Set(removed.map(({ item }) => cartKey(item)));
    this.items.set(snapshot.filter((item) => cartKey(item) !== id && item.id !== id));
    this.deselectedKeys.set(deselectedSnapshot.filter((key) => !removedKeys.has(key) && key !== id));
    this.toast.showToast({
      type: 'info',
      title: this.i18n.isVi() ? 'Đã xóa khỏi giỏ hàng' : 'Removed from cart',
      message: removed[0]?.item.name,
      durationMs: 7000,
      action: {
        label: this.i18n.isVi() ? 'Hoàn tác' : 'Undo',
        onClick: () => {
          this.items.set(snapshot);
          this.deselectedKeys.set(deselectedSnapshot);
        },
      },
    });
  }

  clearCart(): void {
    if (this.items().length === 0) return;
    const snapshot = this.items();
    const deselectedSnapshot = this.deselectedKeys();
    this.items.set([]);
    this.deselectedKeys.set([]);
    this.removeVoucher();
    this.toast.showToast({
      type: 'info',
      title: this.i18n.isVi() ? 'Đã xóa giỏ hàng' : 'Cart cleared',
      message: this.i18n.isVi() ? 'Các dịch vụ đã chọn vừa được gỡ khỏi giỏ.' : 'Your selected services were removed.',
      durationMs: 8000,
      action: {
        label: this.i18n.isVi() ? 'Hoàn tác' : 'Undo',
        onClick: () => {
          this.items.set(snapshot);
          this.deselectedKeys.set(deselectedSnapshot);
        },
      },
    });
  }

  isInCart(id: string): boolean {
    return this.items().some((item) => cartKey(item) === id || item.id === id);
  }

  incrementQuantity(key: string): void {
    this.items.update((items) => items.map((item) => (cartKey(item) === key ? { ...item, quantity: item.quantity + 1 } : item)));
  }

  decrementQuantity(key: string): void {
    const target = this.items().find((item) => cartKey(item) === key);
    if (!target) return;
    if (target.quantity <= 1) {
      this.removeItem(key);
      return;
    }
    this.items.update((items) => items.map((item) => (cartKey(item) === key ? { ...item, quantity: item.quantity - 1 } : item)));
  }

  packageLabel(key: NonNullable<BookingCartItem['packageKey']>): string {
    const vi = this.i18n.isVi();
    if (key === 'premium') return vi ? 'Gói Cao Cấp (Premium VIP)' : 'Premium VIP Experience';
    if (key === 'luxury') return vi ? 'Gói Sang Trọng (All-Inclusive)' : 'Luxury All-Inclusive';
    return vi ? 'Gói Tiêu Chuẩn (Cơ bản)' : 'Standard Package';
  }

  /** Switches the package tier for a cart item in place, rescaling its price from the stored base price. */
  setItemPackage(key: string, packageKey: NonNullable<BookingCartItem['packageKey']>): void {
    this.items.update((items) =>
      items.map((item) => {
        if (cartKey(item) !== key || item.basePrice == null) return item;
        const price = Math.round(item.basePrice * PACKAGE_MODIFIERS[packageKey]);
        const details = this.withPackageLabel(item.details, packageKey);
        return { ...item, packageKey, price, details };
      }),
    );
  }

  private withPackageLabel(details: string | undefined, packageKey: NonNullable<BookingCartItem['packageKey']>): string | undefined {
    if (!details) return details;
    const segments = details.split(' | ');
    const prefixMatch = segments[0].match(/^[^:]*:\s*/);
    if (!prefixMatch) return details;
    segments[0] = prefixMatch[0] + this.packageLabel(packageKey);
    return segments.join(' | ');
  }
}
