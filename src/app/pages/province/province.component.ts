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

@Component({
  selector: 'app-province-page',
  standalone: true,
  imports: [ItemCardComponent, LucideMapPin],
  templateUrl: './province.component.html',
  styleUrl: './province.component.css',
})
export class ProvinceComponent {
  private readonly route = inject(ActivatedRoute);
  readonly i18n = inject(I18nService);
  readonly ui = inject(UiStateService);
  private readonly catalogData = inject(CatalogDataService);
  private readonly params = toSignal(this.route.paramMap);
  readonly tabs = SERVICE_TABS;
  readonly activeTab = this.ui.allServicesTab;
  readonly provinceId = computed(() => this.params()?.get('provinceId') ?? 'quang-nam');
  readonly province = computed(() => this.catalogData.provinceById(this.provinceId()));

  private readonly itemsRes = httpResource<(Attraction | Hotel | Activity)[]>(() => {
    const tab = this.activeTab();
    const id = this.provinceId();
    if (tab === 'vehicles') return undefined;
    if (tab === 'hotels') return `/api/hotels?provinceId=${id}`;
    if (tab === 'activities') return `/api/activities?provinceId=${id}`;
    return `/api/attractions?provinceId=${id}`;
  }, { defaultValue: [] });

  readonly items = computed<ViewableItem[]>(() => {
    const tab = this.activeTab();
    if (tab === 'vehicles') return toVehicleItems(this.catalogData.vehicles());
    if (tab === 'hotels') return toHotelItems(this.itemsRes.value() as Hotel[]);
    if (tab === 'activities') return toActivityItems(this.itemsRes.value() as Activity[]);
    return toAttractionItems(this.itemsRes.value() as Attraction[]);
  });

  constructor() {
    effect(() => this.ui.selectedProvinceId.set(this.provinceId()));
  }

  setTab(tab: ServiceTab): void {
    this.ui.allServicesTab.set(tab);
  }
}
