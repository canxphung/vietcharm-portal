import { computed, Injectable, signal } from '@angular/core';
import type { BookingCartItem } from '@/types';
import { I18nService } from './i18n.service';
import { ToastService } from './toast.service';

export type PaymentInitialStep = 'cart' | 'checkout';

function cartKey(item: BookingCartItem): string {
  return item.cartKey ?? item.id;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly deselectedKeys = signal<string[]>([]);
  readonly items = signal<BookingCartItem[]>([]);
  readonly isPaymentOpen = signal(false);
  readonly paymentInitialStep = signal<PaymentInitialStep>('checkout');
  readonly cartCount = computed(() => this.items().reduce((sum, item) => sum + item.quantity, 0));
  readonly selectedItems = computed(() => this.items().filter((item) => !this.deselectedKeys().includes(cartKey(item))));
  readonly selectedCount = computed(() => this.selectedItems().reduce((sum, item) => sum + item.quantity, 0));
  readonly allSelected = computed(() => this.items().length > 0 && this.selectedItems().length === this.items().length);
  readonly total = computed(() => this.items().reduce((sum, item) => sum + item.price * item.quantity, 0));
  readonly selectedTotal = computed(() => this.selectedItems().reduce((sum, item) => sum + item.price * item.quantity, 0));

  constructor(
    private readonly i18n: I18nService,
    private readonly toast: ToastService,
  ) {}

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
  }

  openPayment(step: PaymentInitialStep = 'checkout'): void {
    this.paymentInitialStep.set(step);
    this.isPaymentOpen.set(true);
  }

  closePayment(): void {
    this.isPaymentOpen.set(false);
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
    const replacesCart = items.some((item) => item.id.startsWith('ai-'));
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
}
