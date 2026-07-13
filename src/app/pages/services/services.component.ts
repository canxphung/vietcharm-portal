import { Component, computed, effect, inject, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  LucideAlertCircle,
  LucideArrowLeft,
  LucideArrowRight,
  LucideArrowUpDown,
  LucideCalendarDays,
  LucideChevronDown,
  LucideCompass,
  LucideHeart,
  LucideHotel,
  LucideMap,
  LucideMapPin,
  LucideMapPinned,
  LucideMessageSquare,
  LucideNavigation,
  LucideSearch,
  LucideShieldCheck,
  LucideSlidersHorizontal,
  LucideStar,
  LucideUsersRound,
  LucideX,
} from '@lucide/angular';
import { ToastService } from '@/services/toast.service';
import { SERVICE_TABS, isServiceTab, type ServiceTab } from '@/constants/views';
import type { Activity, Attraction, Hotel, ViewableItem } from '@/types';
import { I18nService } from '@/services/i18n.service';
import { UiStateService } from '@/services/ui-state.service';
import { CatalogDataService, toAttractionItems, toActivityItems, toHotelItems, toVehicleItems } from '@/services/catalog-data';
import { ItemCardComponent } from '@/components/item-card/item-card.component';
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
  heritage: /di sản|phố cổ|chùa|đền|lăng|tháp|bảo tàng|cố đô|thành|cung đình|văn hóa|heritage|ancient|temple|pagoda|museum|citadel/i,
  culinary: /ẩm thực|món|đặc sản|chợ|nấu ăn|lớp học|quán|food|culinary|cooking|market|street/i,
  nature: /sinh thái|làng|rừng|vườn|thiên nhiên|sông|núi|đồi|ruộng|eco|nature|village|garden|river|mountain/i,
  adventure: /lặn|cano|san hô|phiêu lưu|trekking|leo|thuyền|đảo|biển|mạo hiểm|adventure|diving|snorkel|kayak|island|beach/i,
};

@Component({
  selector: 'app-services-page',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    ItemCardComponent,
    LucideArrowLeft,
    LucideArrowUpDown,
    LucideCalendarDays,
    LucideChevronDown,
    LucideHotel,
    LucideMapPin,
    LucideSearch,
    LucideShieldCheck,
    LucideSlidersHorizontal,
    LucideStar,
    LucideUsersRound,
    LucideX,
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
  readonly tabs = SERVICE_TABS;
  readonly query = signal('');
  readonly province = signal('all');
  readonly sortBy = signal<'default' | 'price-asc' | 'price-desc' | 'rating-desc' | 'reviews-desc'>('default');
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
  readonly popularFilters = signal<string[]>([]);
  readonly hotelStars = signal<string[]>([]);
  readonly hotelAreas = signal<string[]>([]);
  readonly hotelTypes = signal<string[]>([]);
  readonly hotelPolicies = signal<string[]>([]);
  readonly hotelAmenities = signal<string[]>([]);
  readonly expandedFilterSections = signal<string[]>([]);

  readonly activeFilterCount = computed(() => {
    let count = 0;
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

  readonly selectedProvinceName = computed(() =>
    this.provinces().find((item) => item.id === this.province())?.name ?? '',
  );

  readonly minPricePercent = computed(() => Math.min(100, (this.minPrice() / this.priceMaxLimit) * 100));
  readonly maxPricePercent = computed(() => Math.min(100, (this.maxPrice() / this.priceMaxLimit) * 100));

  readonly activeTab = computed<ServiceTab>(() => {
    const tab = this.queryParams()?.get('tab');
    return isServiceTab(tab) ? tab : this.ui.allServicesTab();
  });

  readonly heading = computed(() => {
    const vi = this.i18n.isVi();
    switch (this.activeTab()) {
      case 'hotels': return vi ? 'Lưu trú & Khách sạn' : 'Stays & Hotels';
      case 'vehicles': return vi ? 'Phương tiện di chuyển' : 'Transport & Rides';
      case 'activities': return vi ? 'Hoạt động & Trải nghiệm' : 'Activities & Experiences';
      default: return vi ? 'Điểm đến tham quan' : 'Attractions & Spots';
    }
  });

  readonly scopeDescription = computed(() =>
    this.i18n.isVi()
      ? 'Danh sách được lọc theo điểm đến bạn đang xem. Bạn vẫn có thể đổi tỉnh trong bộ lọc.'
      : 'This list is filtered by the destination you were viewing. You can still change province in the filters.',
  );

  private readonly itemsRes = httpResource<(Attraction | Hotel | Activity)[]>(() => {
    const tab = this.activeTab();
    if (tab === 'vehicles') return undefined;
    const prov = this.province();
    const endpoint = tab === 'hotels' ? 'hotels' : tab === 'activities' ? 'activities' : 'attractions';
    return prov === 'all' ? `/api/${endpoint}` : `/api/${endpoint}?provinceId=${prov}`;
  }, { defaultValue: [] });

  readonly items = computed<ViewableItem[]>(() => {
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
    if (normalized) list = list.filter((item) => `${item.name} ${item.description ?? ''}`.toLowerCase().includes(normalized));
    if ((tab === 'activities' || tab === 'attractions') && this.category() !== 'all') {
      const pattern = CATEGORY_PATTERNS[this.category()];
      if (pattern) list = list.filter((item) => pattern.test(`${item.name} ${item.description ?? ''}`));
    }
    if (tab === 'vehicles' && this.vehicleType() !== 'all') {
      list = list.filter((item) => item.vehicleType === this.vehicleType());
    }
    if (tab !== 'attractions' && (this.minPrice() > 0 || this.maxPrice() !== this.priceMaxLimit)) {
      list = list.filter((item) => item.price >= this.minPrice() && (this.maxPrice() === this.priceMaxLimit || item.price <= this.maxPrice()));
    }
    if (this.minRating() > 0) list = list.filter((item) => (item.rating ?? 0) >= this.minRating());
    if (tab === 'hotels') list = list.filter((item) => this.matchesHotelFilters(item));
    const sort = this.sortBy();
    if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    else if (sort === 'rating-desc') list = [...list].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    else if (sort === 'reviews-desc') list = [...list].sort((a, b) => reviewsCountNumber(b.reviewsCount) - reviewsCountNumber(a.reviewsCount));
    return list;
  });

  readonly visibleItems = computed(() => this.filteredItems().slice(0, this.visibleCount()));

  ratingOptions(): Array<{ value: number; label: string }> {
    const vi = this.i18n.isVi();
    return [
      { value: 0, label: vi ? 'Mọi mức đánh giá' : 'Any rating' },
      { value: 4, label: vi ? '4.0★ trở lên' : '4.0★ & up' },
      { value: 4.5, label: vi ? '4.5★ trở lên' : '4.5★ & up' },
      { value: 4.8, label: vi ? '4.8★ trở lên' : '4.8★ & up' },
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
  }

  closeFilters(): void {
    this.filterOpen.set(false);
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
    if (value >= 1000000) return `${Number((value / 1000000).toFixed(1))} ${this.i18n.isVi() ? 'triệu' : 'M'}`;
    return `${Math.round(value / 1000)}${this.i18n.isVi() ? ' nghìn' : 'K'}`;
  }

  formatPriceInput(value: number): string {
    return new Intl.NumberFormat('vi-VN').format(value);
  }

  isHotelFilterSelected(group: 'popular' | 'stars' | 'areas' | 'types' | 'policies' | 'amenities', id: string): boolean {
    return this.hotelFilterSignal(group)().includes(id);
  }

  toggleHotelFilter(group: 'popular' | 'stars' | 'areas' | 'types' | 'policies' | 'amenities', id: string): void {
    const target = this.hotelFilterSignal(group);
    target.update((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  }

  clearHotelFilter(group: 'popular' | 'stars' | 'areas' | 'types' | 'policies' | 'amenities'): void {
    this.hotelFilterSignal(group).set([]);
  }

  isFilterSectionExpanded(section: string): boolean {
    return this.expandedFilterSections().includes(section);
  }

  toggleFilterSection(section: string): void {
    this.expandedFilterSections.update((sections) => sections.includes(section)
      ? sections.filter((item) => item !== section)
      : [...sections, section]);
  }

  applySearch(): void {
    if (typeof document !== 'undefined') document.getElementById('catalog-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  updateOccupancy(value: string): void {
    const [guests, rooms] = value.split('-').map(Number);
    this.guests.set(guests || 2);
    this.rooms.set(rooms || 1);
  }

  setTab(tab: ServiceTab): void {
    void this.router.navigate(['/services'], { queryParams: { tab, province: this.province() } });
  }

  private hotelFilterSignal(group: 'popular' | 'stars' | 'areas' | 'types' | 'policies' | 'amenities') {
    switch (group) {
      case 'popular': return this.popularFilters;
      case 'stars': return this.hotelStars;
      case 'areas': return this.hotelAreas;
      case 'types': return this.hotelTypes;
      case 'policies': return this.hotelPolicies;
      default: return this.hotelAmenities;
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
    const star = item.price >= 1800000 ? '5' : item.price >= 1100000 ? '4' : item.price >= 650000 ? '3' : '2';
    const area = /biển|beach|an bàng/.test(text) ? 'beach' : /sông|river/.test(text) ? 'riverside' : /phố cổ|heritage|ancient/.test(text) ? 'oldTown' : 'center';
    const type = /resort|khu nghỉ/.test(text) ? 'resort' : /villa|biệt thự/.test(text) ? 'villa' : /homestay|nhà khách|guesthouse/.test(text) ? 'homestay' : 'hotel';
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
    return (!this.hotelStars().length || this.hotelStars().includes(star))
      && (!this.hotelAreas().length || this.hotelAreas().includes(area))
      && (!this.hotelTypes().length || this.hotelTypes().includes(type))
      && this.popularFilters().every((id) => popular[id])
      && this.hotelPolicies().every((id) => policies[id])
      && this.hotelAmenities().every((id) => amenities[id]);
  }
}
