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
  LucideSparkles,
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

const PRICE_RANGES: Array<{ id: string; min: number; max: number }> = [
  { id: 'all', min: 0, max: Infinity },
  { id: 'lt300', min: 0, max: 300000 },
  { id: '300-1000', min: 300000, max: 1000000 },
  { id: '1000-2000', min: 1000000, max: 2000000 },
  { id: 'gt2000', min: 2000000, max: Infinity },
];

@Component({
  selector: 'app-services-page',
  standalone: true,
  imports: [FormsModule, RouterLink, ItemCardComponent, LucideArrowLeft, LucideArrowUpDown, LucideSearch, LucideSlidersHorizontal],
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
  readonly priceRange = signal('all');
  readonly vehicleType = signal<'all' | 'motorbike' | 'car'>('all');
  readonly visibleCount = signal(9);

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
    if (tab !== 'attractions' && this.priceRange() !== 'all') {
      const range = PRICE_RANGES.find((r) => r.id === this.priceRange());
      if (range) list = list.filter((item) => item.price >= range.min && item.price < range.max);
    }
    if (this.minRating() > 0) list = list.filter((item) => (item.rating ?? 0) >= this.minRating());
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

  priceOptions(): Array<{ id: string; label: string }> {
    const vi = this.i18n.isVi();
    return [
      { id: 'all', label: vi ? 'Mọi mức giá' : 'Any price' },
      { id: 'lt300', label: vi ? 'Dưới 300 nghìn' : 'Under 300K' },
      { id: '300-1000', label: vi ? '300 nghìn – 1 triệu' : '300K – 1M' },
      { id: '1000-2000', label: vi ? '1 – 2 triệu' : '1M – 2M' },
      { id: 'gt2000', label: vi ? 'Trên 2 triệu' : 'Over 2M' },
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
      this.priceRange();
      this.vehicleType();
      this.visibleCount.set(9);
    });
  }

  resetFilters(): void {
    this.query.set('');
    this.province.set('all');
    this.sortBy.set('default');
    this.category.set('all');
    this.minRating.set(0);
    this.priceRange.set('all');
    this.vehicleType.set('all');
  }

  setTab(tab: ServiceTab): void {
    void this.router.navigate(['/services'], { queryParams: { tab, province: this.province() } });
  }
}
