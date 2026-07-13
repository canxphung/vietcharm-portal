import { Component, computed, effect, inject, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ToastService } from '@/services/toast.service';
import { SERVICE_TABS, isServiceTab, type ServiceTab } from '@/constants/views';
import type { Activity, Attraction, Hotel, ViewableItem } from '@/types';
import { I18nService } from '@/services/i18n.service';
import { UiStateService } from '@/services/ui-state.service';
import {
  CatalogDataService,
  toAttractionItems,
  toActivityItems,
  toHotelItems,
  toVehicleItems,
} from '@/services/catalog-data';
import { ItemCardComponent } from '@/components/item-card/item-card.component';
import { QuickViewPopupComponent } from '@/components/ui/quick-view-popup/quick-view-popup.component';
import { JourneyMapComponent } from '@/components/journey-map/journey-map.component';
import { RevealDirective } from '@/directives/reveal.directive';

function reviewsCountNumber(value: string | undefined): number {
  if (!value) return 0;
  const trimmed = value.trim().toLowerCase();
  if (trimmed.endsWith('k')) return parseFloat(trimmed) * 1000;
  return parseFloat(trimmed) || 0;
}

// Theme filters match bilingual keywords against name+description (the data is Vietnamese, ids are English).
const CATEGORY_PATTERNS: Record<string, RegExp> = {
  heritage:
    /di sản|phố cổ|chùa|đền|lăng|tháp|bảo tàng|cố đô|thành|cung đình|văn hóa|heritage|ancient|temple|pagoda|museum|citadel/i,
  culinary: /ẩm thực|món|đặc sản|chợ|nấu ăn|lớp học|quán|food|culinary|cooking|market|street/i,
  nature:
    /sinh thái|làng|rừng|vườn|thiên nhiên|sông|núi|đồi|ruộng|eco|nature|village|garden|river|mountain/i,
  adventure:
    /lặn|cano|san hô|phiêu lưu|trekking|leo|thuyền|đảo|biển|mạo hiểm|adventure|diving|snorkel|kayak|island|beach/i,
};

const LIVE_PROVINCE_ID = 'quang-nam';

@Component({
  selector: 'app-services-page',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    ItemCardComponent,
    QuickViewPopupComponent,
  ],
  templateUrl: './services.component.html',
  styleUrl: './services.component.css',
})
export class ServicesComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly i18n = inject(I18nService);
  readonly ui = inject(UiStateService);
  private readonly catalogData = inject(CatalogDataService);
  readonly provinces = this.catalogData.provinces;
  private readonly queryParams = toSignal(this.route.queryParamMap);
  readonly promotionMode = computed(() => this.queryParams()?.get('promotion') === 'hot');
  readonly tabs = SERVICE_TABS;
  readonly query = signal('');
  readonly province = signal('all');
  readonly sortBy = signal<
    'default' | 'promotion' | 'price-asc' | 'price-desc' | 'rating-desc' | 'reviews-desc'
  >('default');
  readonly category = signal('all');
  readonly minRating = signal(0);
  readonly priceMaxLimit = 50000000;
  readonly priceStep = 100000;
  readonly minPrice = signal(0);
  readonly maxPrice = signal(this.priceMaxLimit);
  readonly minPriceDraft = signal<string | null>(null);
  readonly maxPriceDraft = signal<string | null>(null);
  readonly vehicleType = signal<'all' | 'motorbike' | 'car'>('all');
  readonly visibleCount = signal(9);
  readonly filterOpen = signal(false);
  readonly checkInDate = signal('');
  readonly checkOutDate = signal('');
  readonly guests = signal(2);
  readonly rooms = signal(1);
  readonly occupancyOpen = signal(false);
  readonly quickViewItem = signal<ViewableItem | null>(null);
  readonly popularFilters = signal<string[]>([]);
  readonly hotelStars = signal<string[]>([]);
  readonly hotelAreas = signal<string[]>([]);
  readonly hotelTypes = signal<string[]>([]);
  readonly hotelPolicies = signal<string[]>([]);
  readonly hotelAmenities = signal<string[]>([]);
  readonly expandedFilterSections = signal<string[]>([]);

  readonly activeFilterCount = computed(() => {
    let count = 0;
    if (this.promotionMode()) count++;
    if (this.query().trim()) count++;
    if (this.province() !== 'all') count++;
    if (this.category() !== 'all') count++;
    if (this.minRating() > 0) count++;
    if (this.minPrice() > 0 || this.maxPrice() !== this.priceMaxLimit) count++;
    if (this.vehicleType() !== 'all') count++;
    count += this.popularFilters().length;
    count += this.hotelStars().length;
    count += this.hotelAreas().length;
    count += this.hotelTypes().length;
    count += this.hotelPolicies().length;
    count += this.hotelAmenities().length;
    return count;
  });

  readonly selectedProvinceName = computed(
    () => this.provinces().find((item) => item.id === this.province())?.name ?? '',
  );

  readonly selectedProvinceInactive = computed(() => {
    if (this.province() === 'all') return false;
    const selected = this.provinces().find((item) => item.id === this.province());
    return selected ? !selected.active : false;
  });

  readonly minPricePercent = computed(() =>
    Math.min(100, (this.minPrice() / this.priceMaxLimit) * 100),
  );
  readonly maxPricePercent = computed(() =>
    Math.min(100, (this.maxPrice() / this.priceMaxLimit) * 100),
  );

  readonly activeTab = computed<ServiceTab>(() => {
    const tab = this.queryParams()?.get('tab');
    return isServiceTab(tab) ? tab : this.ui.allServicesTab();
  });

  readonly heading = computed(() => {
    const vi = this.i18n.isVi();
    if (this.promotionMode()) return vi ? 'Khuyến mãi HOT' : 'HOT Deals';
    switch (this.activeTab()) {
      case 'hotels':
        return vi ? 'Lưu trú & Khách sạn' : 'Stays & Hotels';
      case 'vehicles':
        return vi ? 'Phương tiện di chuyển' : 'Transport & Rides';
      case 'activities':
        return vi ? 'Hoạt động & Trải nghiệm' : 'Activities & Experiences';
      default:
        return vi ? 'Điểm đến tham quan' : 'Attractions & Spots';
    }
  });

  readonly scopeDescription = computed(() =>
    this.promotionMode()
      ? this.i18n.isVi()
        ? 'Tất cả dịch vụ lưu trú và hoạt động đang có giá ưu đãi. Bạn vẫn có thể lọc theo điểm đến, ngân sách và đánh giá.'
        : 'All discounted stays and activities. You can still filter by destination, budget, and rating.'
      : this.i18n.isVi()
        ? 'Danh sách được lọc theo điểm đến bạn đang xem. Bạn vẫn có thể đổi tỉnh trong bộ lọc.'
        : 'This list is filtered by the destination you were viewing. You can still change province in the filters.',
  );

  private readonly itemsRes = httpResource<(Attraction | Hotel | Activity)[]>(
    () => {
      if (this.promotionMode()) return undefined;
      const tab = this.activeTab();
      if (tab === 'vehicles') return undefined;
      const prov = this.province();
      const endpoint =
        tab === 'hotels' ? 'hotels' : tab === 'activities' ? 'activities' : 'attractions';
      return prov === 'all' ? `/api/${endpoint}` : `/api/${endpoint}?provinceId=${prov}`;
    },
    { defaultValue: [] },
  );

  private readonly promoHotelsRes = httpResource<Hotel[]>(
    () => {
      if (!this.promotionMode()) return undefined;
      const prov = this.province();
      return prov === 'all' ? '/api/hotels' : `/api/hotels?provinceId=${prov}`;
    },
    { defaultValue: [] },
  );

  private readonly promoActivitiesRes = httpResource<Activity[]>(
    () => {
      if (!this.promotionMode()) return undefined;
      const prov = this.province();
      return prov === 'all' ? '/api/activities' : `/api/activities?provinceId=${prov}`;
    },
    { defaultValue: [] },
  );

  readonly items = computed<ViewableItem[]>(() => {
    if (this.promotionMode()) {
      return [
        ...toHotelItems(this.promoHotelsRes.value()),
        ...toActivityItems(this.promoActivitiesRes.value()),
      ]
        .filter((item) => (item.discountPercent ?? 0) > 0)
        .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    }
    const tab = this.activeTab();
    if (tab === 'vehicles') return toVehicleItems(this.catalogData.vehicles());
    if (tab === 'hotels') return toHotelItems(this.itemsRes.value() as Hotel[]);
    if (tab === 'activities') return toActivityItems(this.itemsRes.value() as Activity[]);
    return toAttractionItems(this.itemsRes.value() as Attraction[]);
  });

  readonly filteredItems = computed(() => {
    const normalized = this.query().trim().toLowerCase();
    const tab = this.activeTab();
    let list = this.items();
    if (normalized)
      list = list.filter((item) =>
        `${item.name} ${item.description ?? ''}`.toLowerCase().includes(normalized),
      );
    if (
      !this.promotionMode() &&
      (tab === 'activities' || tab === 'attractions') &&
      this.category() !== 'all'
    ) {
      const pattern = CATEGORY_PATTERNS[this.category()];
      if (pattern)
        list = list.filter((item) => pattern.test(`${item.name} ${item.description ?? ''}`));
    }
    if (!this.promotionMode() && tab === 'vehicles' && this.vehicleType() !== 'all') {
      list = list.filter((item) => item.vehicleType === this.vehicleType());
    }
    if (
      (this.promotionMode() || tab !== 'attractions') &&
      (this.minPrice() > 0 || this.maxPrice() !== this.priceMaxLimit)
    ) {
      list = list.filter(
        (item) =>
          item.price >= this.minPrice() &&
          (this.maxPrice() === this.priceMaxLimit || item.price <= this.maxPrice()),
      );
    }
    if (this.minRating() > 0) list = list.filter((item) => (item.rating ?? 0) >= this.minRating());
    if (!this.promotionMode() && tab === 'hotels')
      list = list.filter((item) => this.matchesHotelFilters(item));
    const sort = this.sortBy();
    if (sort === 'promotion')
      list = [...list].sort(
        (a, b) =>
          (b.discountPercent ?? 0) - (a.discountPercent ?? 0) || (b.rating ?? 0) - (a.rating ?? 0),
      );
    else if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    else if (sort === 'rating-desc')
      list = [...list].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    else if (sort === 'reviews-desc')
      list = [...list].sort(
        (a, b) => reviewsCountNumber(b.reviewsCount) - reviewsCountNumber(a.reviewsCount),
      );
    if (this.province() === 'all') {
      list = [...list].sort((a, b) => this.availabilityRank(a) - this.availabilityRank(b));
    }
    return list;
  });

  readonly visibleItems = computed(() => this.filteredItems().slice(0, this.visibleCount()));

  ratingOptions(): Array<{ value: number; label: string }> {
    const vi = this.i18n.isVi();
    return [
      { value: 0, label: vi ? 'Mọi mức đánh giá' : 'Any rating' },
      { value: 4, label: vi ? '4.0 trở lên' : '4.0 & up' },
      { value: 4.5, label: vi ? '4.5 trở lên' : '4.5 & up' },
      { value: 4.8, label: vi ? '4.8 trở lên' : '4.8 & up' },
    ];
  }

  activityCategories(): Array<{ id: string; label: string }> {
    const vi = this.i18n.isVi();
    return [
      { id: 'all', label: vi ? 'Tất cả' : 'All' },
      { id: 'heritage', label: vi ? 'Di sản & Văn hóa' : 'Heritage' },
      { id: 'culinary', label: vi ? 'Ẩm thực & Chợ' : 'Culinary' },
      { id: 'nature', label: vi ? 'Sinh thái & Làng quê' : 'Eco-Nature' },
      { id: 'adventure', label: vi ? 'Phiêu lưu & Biển đảo' : 'Adventure' },
    ];
  }

  vehicleTypeOptions(): Array<{ id: 'all' | 'motorbike' | 'car'; label: string }> {
    const vi = this.i18n.isVi();
    return [
      { id: 'all', label: vi ? 'Tất cả' : 'All' },
      { id: 'motorbike', label: vi ? 'Xe máy' : 'Motorbike' },
      { id: 'car', label: vi ? 'Ô tô' : 'Car' },
    ];
  }

  popularOptions(): Array<{ id: string; vi: string; en: string }> {
    return [
      { id: 'family', vi: 'Thích hợp cho gia đình', en: 'Family friendly' },
      { id: 'new', vi: 'Mới xây / cải tạo', en: 'Newly built / renovated' },
      { id: 'central', vi: 'Gần trung tâm thành phố', en: 'Near the city center' },
      { id: 'topRated', vi: 'Đánh giá 4.5+', en: 'Rated 4.5+' },
    ];
  }

  hotelAreaOptions(): Array<{ id: string; vi: string; en: string }> {
    return [
      { id: 'oldTown', vi: 'Phố cổ & khu di sản', en: 'Old town & heritage area' },
      { id: 'center', vi: 'Trung tâm thành phố', en: 'City center' },
      { id: 'beach', vi: 'Khu vực ven biển', en: 'Beach area' },
      { id: 'riverside', vi: 'Khu vực ven sông', en: 'Riverside area' },
    ];
  }

  hotelTypeOptions(): Array<{ id: string; vi: string; en: string }> {
    return [
      { id: 'hotel', vi: 'Khách sạn', en: 'Hotel' },
      { id: 'resort', vi: 'Khu nghỉ dưỡng', en: 'Resort' },
      { id: 'homestay', vi: 'Homestay & nhà khách', en: 'Homestay & guesthouse' },
      { id: 'villa', vi: 'Biệt thự', en: 'Villa' },
    ];
  }

  hotelPolicyOptions(): Array<{ id: string; vi: string; en: string }> {
    return [
      { id: 'freeCancel', vi: 'Miễn phí hủy phòng', en: 'Free cancellation' },
      { id: 'payLater', vi: 'Thanh toán tại chỗ nghỉ', en: 'Pay at the property' },
      { id: 'breakfast', vi: 'Bao gồm bữa sáng', en: 'Breakfast included' },
    ];
  }

  hotelAmenityOptions(): Array<{ id: string; vi: string; en: string }> {
    return [
      { id: 'wifi', vi: 'WiFi miễn phí', en: 'Free WiFi' },
      { id: 'pool', vi: 'Hồ bơi', en: 'Swimming pool' },
      { id: 'restaurant', vi: 'Nhà hàng', en: 'Restaurant' },
      { id: 'parking', vi: 'Bãi đỗ xe', en: 'Parking' },
      { id: 'familyRoom', vi: 'Phòng gia đình', en: 'Family rooms' },
      { id: 'airConditioning', vi: 'Điều hòa', en: 'Air conditioning' },
    ];
  }

  constructor() {
    const initialProvince = this.queryParams()?.get('province');
    if (initialProvince) this.province.set(initialProvince);
    effect(() => {
      this.ui.allServicesTab.set(this.activeTab());
      const prov = this.province();
      if (prov !== 'all') this.ui.selectedProvinceId.set(prov);
    });
    // Reset pagination whenever filters change.
    effect(() => {
      this.activeTab();
      this.promotionMode();
      this.query();
      this.province();
      this.sortBy();
      this.category();
      this.minRating();
      this.minPrice();
      this.maxPrice();
      this.vehicleType();
      this.popularFilters();
      this.hotelStars();
      this.hotelAreas();
      this.hotelTypes();
      this.hotelPolicies();
      this.hotelAmenities();
      this.visibleCount.set(9);
    });
  }

  resetFilters(): void {
    const clearPromotion = this.promotionMode();
    this.query.set('');
    this.province.set('all');
    this.sortBy.set('default');
    this.category.set('all');
    this.minRating.set(0);
    this.resetPrice();
    this.vehicleType.set('all');
    this.popularFilters.set([]);
    this.hotelStars.set([]);
    this.hotelAreas.set([]);
    this.hotelTypes.set([]);
    this.hotelPolicies.set([]);
    this.hotelAmenities.set([]);
    if (clearPromotion) this.clearPromotion();
  }

  closeFilters(): void {
    this.filterOpen.set(false);
  }

  openQuickView(item: ViewableItem): void {
    this.occupancyOpen.set(false);
    this.quickViewItem.set(item);
  }

  closeQuickView(): void {
    this.quickViewItem.set(null);
  }

  categoryLabel(id: string): string {
    return this.activityCategories().find((item) => item.id === id)?.label ?? id;
  }

  setMinPrice(value: number | string): void {
    const amount = Math.max(0, this.parsePriceInput(value));
    if (amount >= this.maxPrice()) this.maxPrice.set(amount + this.priceStep);
    this.minPrice.set(amount);
  }

  setMaxPrice(value: number | string): void {
    const amount = this.parsePriceInput(value) || this.priceMaxLimit;
    if (amount <= this.minPrice()) this.minPrice.set(Math.max(0, amount - this.priceStep));
    this.maxPrice.set(amount);
  }

  setPricePreset(min: number, max: number): void {
    this.clearPriceDrafts();
    this.minPrice.set(min);
    this.maxPrice.set(max);
  }

  isPricePreset(min: number, max: number): boolean {
    return this.minPrice() === min && this.maxPrice() === max;
  }

  resetPrice(): void {
    this.clearPriceDrafts();
    this.minPrice.set(0);
    this.maxPrice.set(this.priceMaxLimit);
  }

  commitMinPriceInput(): void {
    const value = this.minPriceDraft();
    if (value !== null) this.setMinPrice(value);
    this.minPriceDraft.set(null);
  }

  commitMaxPriceInput(): void {
    const value = this.maxPriceDraft();
    if (value !== null) this.setMaxPrice(value);
    this.maxPriceDraft.set(null);
  }

  updatePriceDraft(kind: 'min' | 'max', input: HTMLInputElement): void {
    const digits = input.value.replace(/[^0-9]/g, '');
    const formatted = digits ? new Intl.NumberFormat('vi-VN').format(Number(digits)) : '';
    input.value = formatted;
    (kind === 'min' ? this.minPriceDraft : this.maxPriceDraft).set(formatted);
  }

  formatPrice(value: number): string {
    if (value === 0) return '0đ';
    if (value >= 1000000)
      return `${Number((value / 1000000).toFixed(1))} ${this.i18n.isVi() ? 'triệu' : 'M'}`;
    return `${Math.round(value / 1000)}${this.i18n.isVi() ? ' nghìn' : 'K'}`;
  }

  formatPriceInput(value: number): string {
    return new Intl.NumberFormat('vi-VN').format(value);
  }

  isHotelFilterSelected(
    group: 'popular' | 'stars' | 'areas' | 'types' | 'policies' | 'amenities',
    id: string,
  ): boolean {
    return this.hotelFilterSignal(group)().includes(id);
  }

  toggleHotelFilter(
    group: 'popular' | 'stars' | 'areas' | 'types' | 'policies' | 'amenities',
    id: string,
  ): void {
    const target = this.hotelFilterSignal(group);
    target.update((items) =>
      items.includes(id) ? items.filter((item) => item !== id) : [...items, id],
    );
  }

  clearHotelFilter(
    group: 'popular' | 'stars' | 'areas' | 'types' | 'policies' | 'amenities',
  ): void {
    this.hotelFilterSignal(group).set([]);
  }

  isFilterSectionExpanded(section: string): boolean {
    return this.expandedFilterSections().includes(section);
  }

  toggleFilterSection(section: string): void {
    this.expandedFilterSections.update((sections) =>
      sections.includes(section)
        ? sections.filter((item) => item !== section)
        : [...sections, section],
    );
  }

  isComingSoonTab(tab: ServiceTab): boolean {
    return this.selectedProvinceInactive() && (tab === 'hotels' || tab === 'activities');
  }

  isServiceItemComingSoon(item: ViewableItem): boolean {
    if (item.type === 'vehicle') return false;
    const itemProvinceId =
      item.provinceId ?? (this.province() !== 'all' ? this.province() : undefined);
    return itemProvinceId ? itemProvinceId !== LIVE_PROVINCE_ID : false;
  }

  private availabilityRank(item: ViewableItem): number {
    return item.provinceId === LIVE_PROVINCE_ID ? 0 : 1;
  }

  applySearch(): void {
    this.occupancyOpen.set(false);
    if (typeof document !== 'undefined')
      document
        .getElementById('catalog-results')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  adjustGuests(change: number): void {
    const next = Math.max(1, Math.min(20, this.guests() + change));
    this.guests.set(next);
    if (this.rooms() > next) this.rooms.set(next);
  }

  adjustRooms(change: number): void {
    const maximum = Math.min(10, this.guests());
    this.rooms.set(Math.max(1, Math.min(maximum, this.rooms() + change)));
  }

  setTab(tab: ServiceTab): void {
    void this.router.navigate(['/services'], {
      queryParams: { tab, province: this.province(), promotion: null },
    });
  }

  updateSort(
    value: 'default' | 'promotion' | 'price-asc' | 'price-desc' | 'rating-desc' | 'reviews-desc',
  ): void {
    this.sortBy.set(value);
  }

  clearPromotion(): void {
    if (this.sortBy() === 'promotion') this.sortBy.set('default');
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { promotion: null },
      queryParamsHandling: 'merge',
    });
  }

  private hotelFilterSignal(
    group: 'popular' | 'stars' | 'areas' | 'types' | 'policies' | 'amenities',
  ) {
    switch (group) {
      case 'popular':
        return this.popularFilters;
      case 'stars':
        return this.hotelStars;
      case 'areas':
        return this.hotelAreas;
      case 'types':
        return this.hotelTypes;
      case 'policies':
        return this.hotelPolicies;
      default:
        return this.hotelAmenities;
    }
  }

  private parsePriceInput(value: number | string): number {
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
    return Number(value.replace(/[^0-9]/g, '')) || 0;
  }

  private clearPriceDrafts(): void {
    this.minPriceDraft.set(null);
    this.maxPriceDraft.set(null);
  }

  private matchesHotelFilters(item: ViewableItem): boolean {
    const text = `${item.name} ${item.description ?? ''}`.toLowerCase();
    const hash = [...item.id].reduce((total, char) => total + char.charCodeAt(0), 0);
    const star =
      item.price >= 1800000 ? '5' : item.price >= 1100000 ? '4' : item.price >= 650000 ? '3' : '2';
    const area = /biển|beach|an bàng/.test(text)
      ? 'beach'
      : /sông|river/.test(text)
        ? 'riverside'
        : /phố cổ|heritage|ancient/.test(text)
          ? 'oldTown'
          : 'center';
    const type = /resort|khu nghỉ/.test(text)
      ? 'resort'
      : /villa|biệt thự/.test(text)
        ? 'villa'
        : /homestay|nhà khách|guesthouse/.test(text)
          ? 'homestay'
          : 'hotel';
    const popular: Record<string, boolean> = {
      family: /gia đình|family|resort|villa/.test(text) || hash % 2 === 0,
      new: /mới|new|modern|hiện đại/.test(text) || hash % 3 === 0,
      central: area === 'center' || area === 'oldTown',
      topRated: (item.rating ?? 0) >= 4.5,
    };
    const policies: Record<string, boolean> = {
      freeCancel: hash % 2 === 0 || (item.rating ?? 0) >= 4.7,
      payLater: hash % 3 !== 0,
      breakfast: /bữa sáng|breakfast|ẩm thực|restaurant/.test(text) || hash % 2 === 1,
    };
    const amenities: Record<string, boolean> = {
      wifi: true,
      pool: /hồ bơi|pool|resort/.test(text) || hash % 3 === 0,
      restaurant: /nhà hàng|restaurant|ẩm thực/.test(text) || hash % 2 === 0,
      parking: hash % 3 !== 1,
      familyRoom: popular['family'],
      airConditioning: true,
    };
    return (
      (!this.hotelStars().length || this.hotelStars().includes(star)) &&
      (!this.hotelAreas().length || this.hotelAreas().includes(area)) &&
      (!this.hotelTypes().length || this.hotelTypes().includes(type)) &&
      this.popularFilters().every((id) => popular[id]) &&
      this.hotelPolicies().every((id) => policies[id]) &&
      this.hotelAmenities().every((id) => amenities[id])
    );
  }
}
