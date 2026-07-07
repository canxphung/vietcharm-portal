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
  private readonly params = toSignal(this.route.paramMap);
  readonly tabs = SERVICE_TABS;
  readonly activeTab = this.ui.allServicesTab;
  readonly provinceId = computed(() => this.params()?.get('provinceId') ?? 'quang-nam');
  readonly province = computed(() => provinceById(this.provinceId()));
  readonly items = computed(() => itemsForTab(this.activeTab(), this.provinceId()));

  constructor() {
    effect(() => this.ui.selectedProvinceId.set(this.provinceId()));
  }

  setTab(tab: ServiceTab): void {
    this.ui.allServicesTab.set(tab);
  }
}
