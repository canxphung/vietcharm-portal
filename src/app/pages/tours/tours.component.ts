import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { LucideArrowRight, LucideFlame, LucideGift, LucideHeart, LucideMapPin, LucideStar } from '@lucide/angular';
import type { Activity, Attraction, Hotel, PromoVoucher, TourCombo, ViewableItem } from '@/types';
import { CatalogDataService, toActivityItems, toAttractionItems, toHotelItems } from '@/services/catalog-data';
import { CatalogService } from '@/services/catalog.service';
import { I18nService } from '@/services/i18n.service';
import { ToastService } from '@/services/toast.service';
import { UiStateService } from '@/services/ui-state.service';

interface HotDeal {
  item: ViewableItem;
  discount: number;
  salePrice: number;
}

@Component({
  selector: 'app-tours-page',
  standalone: true,
  imports: [DecimalPipe, RouterLink, LucideArrowRight, LucideFlame, LucideGift, LucideHeart, LucideMapPin, LucideStar],
  templateUrl: './tours.component.html',
  styleUrl: './tours.component.css',
})
export class ToursComponent {
  private readonly catalogData = inject(CatalogDataService);
  private readonly catalog = inject(CatalogService);
  private readonly toast = inject(ToastService);
  readonly i18n = inject(I18nService);
  readonly ui = inject(UiStateService);

  readonly combos = this.catalogData.tourCombos;
  readonly hotDealSort = signal<'hot' | 'price-asc' | 'price-desc'>('hot');
  readonly comboSort = signal<'featured' | 'price-asc' | 'price-desc'>('featured');

  private readonly hotelsRes = httpResource<Hotel[]>(() => '/api/hotels', { defaultValue: [] });
  private readonly activitiesRes = httpResource<Activity[]>(() => '/api/activities', { defaultValue: [] });
  private readonly attractionsRes = httpResource<Attraction[]>(() => '/api/attractions', { defaultValue: [] });

  /** Top-rated hotels + activities dressed up as hot deals with a % off badge. */
  readonly hotDeals = computed<HotDeal[]>(() => {
    const pool = [...toHotelItems(this.hotelsRes.value()), ...toActivityItems(this.activitiesRes.value())]
      .filter((item) => (item.discountPercent ?? 0) > 0)
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
      .slice(0, 8);
    return pool.map((item) => ({ item, discount: item.discountPercent ?? 0, salePrice: item.price }));
  });

  readonly sortedHotDeals = computed(() => {
    const deals = [...this.hotDeals()];
    if (this.hotDealSort() === 'price-asc') return deals.sort((a, b) => a.salePrice - b.salePrice);
    if (this.hotDealSort() === 'price-desc') return deals.sort((a, b) => b.salePrice - a.salePrice);
    return deals.sort((a, b) => b.discount - a.discount || (b.item.rating ?? 0) - (a.item.rating ?? 0));
  });

  readonly sortedCombos = computed(() => {
    const combos = [...this.combos()];
    if (this.comboSort() === 'price-asc') return combos.sort((a, b) => a.price - b.price);
    if (this.comboSort() === 'price-desc') return combos.sort((a, b) => b.price - a.price);
    return combos.sort((a, b) => b.rating - a.rating || this.comboDiscount(b) - this.comboDiscount(a));
  });

  readonly hotPlaces = computed(() =>
    toAttractionItems(this.attractionsRes.value())
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
      .slice(0, 6),
  );

  readonly activeVouchers = computed(() => this.catalog.vouchers().filter((v) => v.active));

  viewDeal(deal: HotDeal): void {
    this.ui.viewItem({ ...deal.item, price: deal.salePrice });
  }

  viewPlace(place: ViewableItem): void {
    this.ui.viewItem(place);
  }

  dealTypeLabel(type: string): string {
    const vi = this.i18n.isVi();
    if (type === 'hotel') return vi ? 'Lưu trú' : 'Stay';
    if (type === 'activity') return vi ? 'Hoạt động' : 'Activity';
    return vi ? 'Dịch vụ' : 'Service';
  }

  voucherValue(voucher: PromoVoucher): string {
    return voucher.discountType === 'percentage'
      ? `-${voucher.value}%`
      : `-${new Intl.NumberFormat('vi-VN').format(voucher.value)}đ`;
  }

  copyVoucher(voucher: PromoVoucher): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) void navigator.clipboard.writeText(voucher.code);
    const vi = this.i18n.isVi();
    this.toast.showToast({
      type: 'success',
      title: vi ? `✓ Đã sao chép mã ${voucher.code}` : `✓ Copied code ${voucher.code}`,
      message: vi ? 'Dán mã ở bước thanh toán để nhận ưu đãi.' : 'Paste it at checkout to redeem the discount.',
    });
  }

  comboDiscount(combo: TourCombo): number {
    return combo.oldPrice > combo.price ? Math.round((1 - combo.price / combo.oldPrice) * 100) : 0;
  }

  asItem(combo: TourCombo): ViewableItem {
    return {
      id: combo.id,
      type: 'activity',
      name: `[Tour Combo] ${combo.name}`,
      image: combo.image,
      price: combo.price,
      description: combo.includes.join('. '),
    };
  }

  view(combo: TourCombo): void {
    this.ui.viewItem(this.asItem(combo));
  }
}
