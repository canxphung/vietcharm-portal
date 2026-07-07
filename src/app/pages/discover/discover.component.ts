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
  selector: 'app-provinces-page',
  standalone: true,
  imports: [RouterLink, LucideArrowLeft, LucideArrowRight, LucideMapPin, LucideNavigation, LucideShieldCheck],
  templateUrl: './discover.component.html',
  styleUrl: './discover.component.css',
})
export class DiscoverComponent {
  readonly provinces = provinces;

  constructor(
    readonly i18n: I18nService,
    readonly ui: UiStateService,
    private readonly toast: ToastService,
  ) {}

  showRoadmap(name: string): void {
    this.toast.showToast({
      type: 'info',
      title: this.i18n.isVi() ? 'Tỉnh đang được số hóa' : 'Province is being digitized',
      message: this.i18n.isVi()
        ? `Tỉnh ${name} đang được tích hợp dữ liệu lưu trú và lữ hành. Hiện tại Quảng Nam - Hội An hoạt động đầy đủ.`
        : `${name} is undergoing vendor integration. Quang Nam - Hoi An is currently fully active.`,
    });
  }
}
