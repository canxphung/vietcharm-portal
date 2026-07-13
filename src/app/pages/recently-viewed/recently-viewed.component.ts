import { Component } from '@angular/core';
import { I18nService } from '@/services/i18n.service';
import { UiStateService } from '@/services/ui-state.service';
import { ItemCardComponent } from '@/components/item-card/item-card.component';

@Component({
  selector: 'app-recently-viewed-page',
  standalone: true,
  imports: [ItemCardComponent],
  templateUrl: './recently-viewed.component.html',
  styleUrl: './recently-viewed.component.css',
})
export class RecentlyViewedComponent {
  constructor(
    readonly i18n: I18nService,
    readonly ui: UiStateService,
  ) {}
}
