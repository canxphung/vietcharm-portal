import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ToastService } from '@/services/toast.service';
import { SERVICE_TABS, isServiceTab, type ServiceTab } from '@/constants/views';
import type { ViewableItem } from '@/types';
import { I18nService } from '@/services/i18n.service';
import { UiStateService } from '@/services/ui-state.service';
import { CatalogDataService } from '@/services/catalog-data';
import { ItemCardComponent } from '@/components/item-card/item-card.component';
import { JourneyMapComponent } from '@/components/journey-map/journey-map.component';
import { RevealDirective } from '@/directives/reveal.directive';

@Component({
  selector: 'app-service-provinces-page',
  standalone: true,
  imports: [],
  templateUrl: './service-provinces.component.html',
  styleUrl: './service-provinces.component.css',
})
export class ServiceProvincesComponent {
  private readonly catalogData = inject(CatalogDataService);
  readonly provinces = this.catalogData.provinces;

  constructor(
    readonly i18n: I18nService,
    readonly ui: UiStateService,
  ) {}
}
