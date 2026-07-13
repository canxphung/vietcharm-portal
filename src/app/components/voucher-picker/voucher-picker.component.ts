import { Component, computed, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import type { PromoVoucher } from '@/types';
import { CartService } from '@/services/cart.service';
import { I18nService } from '@/services/i18n.service';

@Component({
  selector: 'app-voucher-picker',
  standalone: true,
  imports: [DecimalPipe, FormsModule],
  templateUrl: './voucher-picker.component.html',
  styleUrl: './voucher-picker.component.css',
})
export class VoucherPickerComponent {
  readonly open = signal(false);
  readonly draftSelection = signal<string | null>(null);

  readonly isVi = computed(() => this.i18n.isVi());

  constructor(
    readonly cart: CartService,
    readonly i18n: I18nService,
  ) {}

  openPicker(): void {
    this.draftSelection.set(this.cart.appliedVoucher());
    this.cart.voucherCode.set('');
    this.cart.voucherError.set('');
    this.open.set(true);
  }

  close(): void {
    this.open.set(false);
  }

  selectCard(code: string): void {
    this.draftSelection.set(this.draftSelection() === code ? null : code);
  }

  applyTyped(): void {
    this.cart.applyVoucher();
    if (this.cart.appliedVoucher()) this.draftSelection.set(this.cart.appliedVoucher());
  }

  confirm(): void {
    const code = this.draftSelection();
    if (code) this.cart.selectVoucher(code);
    else this.cart.removeVoucher();
    this.close();
  }

  discountLabel(v: PromoVoucher): string {
    return v.discountType === 'percentage' ? `-${v.value}%` : `-${(v.value / 1000).toLocaleString('en-US')}k`;
  }

  conditionLabel(v: PromoVoucher): string {
    const vi = this.isVi();
    if (v.minSpend <= 0) return vi ? 'Áp dụng cho mọi đơn hàng' : 'Valid on any order';
    return vi
      ? `Áp dụng cho đơn từ ${v.minSpend.toLocaleString('vi-VN')}đ`
      : `Valid on orders from ${v.minSpend.toLocaleString('en-US')}đ`;
  }
}
