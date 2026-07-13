import { Component, computed, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import type { BookingCartItem, UserAccount } from '@/types';
import { AuthService } from '@/services/auth.service';
import { CartService } from '@/services/cart.service';
import { CatalogService } from '@/services/catalog.service';
import { I18nService } from '@/services/i18n.service';
import { ToastService } from '@/services/toast.service';
import { UiStateService } from '@/services/ui-state.service';
import { LogoComponent } from '@/components/logo/logo.component';
import { VoucherPickerComponent } from '@/components/voucher-picker/voucher-picker.component';

type CartRemovalIntent =
  | { kind: 'item'; key: string; name: string }
  | { kind: 'selected'; count: number }
  | { kind: 'all'; count: number };

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [
    DecimalPipe,
    RouterLink,
    VoucherPickerComponent,
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent {
  @ViewChild('confirmRemoveDialog', { static: true })
  private confirmRemoveDialog?: ElementRef<HTMLDialogElement>;

  readonly cart = inject(CartService);
  readonly i18n = inject(I18nService);
  private readonly ui = inject(UiStateService);
  private readonly router = inject(Router);

  readonly pendingRemoval = signal<CartRemovalIntent | null>(null);
  readonly isVi = computed(() => this.i18n.isVi());
  readonly removalTitle = computed(() => {
    const intent = this.pendingRemoval();
    if (!intent) return '';
    if (intent.kind === 'item') {
      return this.isVi() ? `Xóa “${intent.name}”?` : `Remove “${intent.name}”?`;
    }
    if (intent.kind === 'selected') {
      return this.isVi()
        ? `Xóa ${intent.count} dịch vụ đã chọn?`
        : `Remove ${intent.count} selected services?`;
    }
    return this.isVi()
      ? `Xóa toàn bộ ${intent.count} dịch vụ?`
      : `Remove all ${intent.count} services?`;
  });
  readonly removalDescription = computed(() => {
    const intent = this.pendingRemoval();
    if (!intent) return '';
    if (intent.kind === 'item') {
      return this.isVi()
        ? 'Dịch vụ này sẽ được gỡ khỏi lịch trình. Bạn vẫn có thể hoàn tác từ thông báo sau khi xóa.'
        : 'This service will be removed from your itinerary. You can still undo it from the notification.';
    }
    if (intent.kind === 'selected') {
      return this.isVi()
        ? 'Chỉ những dịch vụ đang được tích chọn sẽ bị gỡ; các mục còn lại vẫn được giữ nguyên.'
        : 'Only checked services will be removed; everything else will stay in your cart.';
    }
    return this.isVi()
      ? 'Toàn bộ dịch vụ và thông tin lịch trình trong giỏ sẽ được gỡ. Bạn vẫn có thể hoàn tác sau đó.'
      : 'Every service and its schedule details will be removed. You can still undo this action afterward.';
  });
  readonly removalConfirmLabel = computed(() => {
    const intent = this.pendingRemoval();
    if (!intent) return '';
    if (intent.kind === 'item') return this.isVi() ? 'Xóa dịch vụ' : 'Remove service';
    if (intent.kind === 'selected') return this.isVi() ? 'Xóa mục đã chọn' : 'Remove selected';
    return this.isVi() ? 'Xóa toàn bộ' : 'Remove all';
  });
  readonly packageKeys: Array<NonNullable<BookingCartItem['packageKey']>> = [
    'standard',
    'premium',
    'luxury',
  ];

  // Shared with the checkout page so both agree on totals and any applied voucher.
  readonly totalCost = this.cart.totalCost;
  readonly isBundleEligible = this.cart.isBundleEligible;
  readonly bundleDiscount = this.cart.bundleDiscount;
  readonly payableAmount = this.cart.payableAmount;

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
    if (item.type === 'hotel')
      return this.isVi()
        ? 'Giữ chỗ nghỉ để các chặng còn lại dễ sắp xếp hơn.'
        : 'Anchors the route so the rest of the plan is easier to arrange.';
    if (item.type === 'vehicle')
      return this.isVi()
        ? 'Dùng để nối khách sạn, sân bay và điểm trải nghiệm.'
        : 'Connects stays, airports, and experiences.';
    return this.isVi()
      ? 'Hoạt động tạo điểm nhấn cho lịch trình.'
      : 'Adds a memorable moment to the itinerary.';
  }

  continueShopping(): void {
    this.ui.openAllServices('hotels');
  }

  checkout(): void {
    this.ui.requireAuth(
      () => void this.router.navigateByUrl('/checkout'),
      this.isVi() ? 'Đăng nhập để thanh toán.' : 'Sign in to checkout.',
    );
  }

  requestRemoveItem(item: BookingCartItem): void {
    this.pendingRemoval.set({
      kind: 'item',
      key: item.cartKey ?? item.id,
      name: item.name,
    });
    this.openRemovalDialog();
  }

  requestRemoveSelected(): void {
    const count = this.cart.selectedItems().length;
    if (count === 0) return;
    this.pendingRemoval.set({ kind: 'selected', count });
    this.openRemovalDialog();
  }

  requestClearCart(): void {
    const count = this.cart.items().length;
    if (count === 0) return;
    this.pendingRemoval.set({ kind: 'all', count });
    this.openRemovalDialog();
  }

  closeRemovalDialog(): void {
    const dialog = this.confirmRemoveDialog?.nativeElement;
    if (dialog?.open) dialog.close();
    this.pendingRemoval.set(null);
  }

  onRemovalDialogCancel(event: Event): void {
    event.preventDefault();
    this.closeRemovalDialog();
  }

  onRemovalDialogClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.closeRemovalDialog();
  }

  confirmRemoval(): void {
    const intent = this.pendingRemoval();
    if (!intent) return;

    this.closeRemovalDialog();
    if (intent.kind === 'item') {
      this.cart.removeItem(intent.key);
    } else if (intent.kind === 'selected') {
      this.cart.clearSelectedItems();
    } else {
      this.cart.clearCart();
    }
  }

  private openRemovalDialog(): void {
    const dialog = this.confirmRemoveDialog?.nativeElement;
    if (dialog && !dialog.open) dialog.showModal();
  }
}
