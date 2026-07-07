import { Component, computed, effect, inject, signal } from '@angular/core';
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
import { provinces } from '@/data';
import { SERVICE_TABS, isServiceTab, type ServiceTab } from '@/constants/views';
import type { ViewableItem } from '@/types';
import { I18nService } from '@/services/i18n.service';
import { UiStateService } from '@/services/ui-state.service';
import { allCatalogItems, allProvinceItems, itemsForTab, provinceById } from '@/services/catalog-data';
import { ItemCardComponent } from '@/components/item-card/item-card.component';
import { JourneyMapComponent } from '@/components/journey-map/journey-map.component';
import { RevealDirective } from '@/directives/reveal.directive';

function reviewsCountNumber(value: string | undefined): number {
  if (!value) return 0;
  const trimmed = value.trim().toLowerCase();
  if (trimmed.endsWith('k')) return parseFloat(trimmed) * 1000;
  return parseFloat(trimmed) || 0;
}

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
  readonly provinces = provinces;
  private readonly queryParams = toSignal(this.route.queryParamMap);
  readonly tabs = SERVICE_TABS;
  readonly query = signal('');
  readonly province = signal('all');
  readonly sortBy = signal<'default' | 'price-asc' | 'price-desc' | 'rating-desc' | 'reviews-desc'>('default');
  readonly category = signal('all');
  readonly minRating = signal(0);
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

  readonly items = computed(() => {
    const tab = this.activeTab();
    const prov = this.province();
    if (tab === 'vehicles') return itemsForTab('vehicles', prov === 'all' ? 'quang-nam' : prov);
    if (prov === 'all') return this.provinces.flatMap((p) => itemsForTab(tab, p.id));
    return itemsForTab(tab, prov);
  });

  readonly filteredItems = computed(() => {
    const normalized = this.query().trim().toLowerCase();
    let list = this.items();
    if (normalized) list = list.filter((item) => `${item.name} ${item.description ?? ''}`.toLowerCase().includes(normalized));
    if (this.activeTab() === 'activities' && this.category() !== 'all') {
      const cat = this.category();
      list = list.filter((item) => `${item.name} ${item.description ?? ''}`.toLowerCase().includes(cat));
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
      { id: 'culinary', label: vi ? 'Lớp học Ẩm thực' : 'Culinary' },
      { id: 'nature', label: vi ? 'Sinh thái & Làng quê' : 'Eco-Nature' },
      { id: 'adventure', label: vi ? 'Phiêu lưu & Lặn biển' : 'Adventure' },
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
      this.visibleCount.set(9);
    });
  }

  resetFilters(): void {
    this.query.set('');
    this.province.set('all');
    this.sortBy.set('default');
    this.category.set('all');
    this.minRating.set(0);
  }

  setTab(tab: ServiceTab): void {
    void this.router.navigate(['/services'], { queryParams: { tab, province: this.province() } });
  }
}
