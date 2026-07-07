import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideAward,
  LucideClock,
  LucideHeadphones,
  LucideMail,
  LucideMapPin,
  LucidePhone,
  LucideShieldCheck,
} from '@lucide/angular';
import { I18nService } from '@/services/i18n.service';
import { UiStateService } from '@/services/ui-state.service';
import { LogoComponent } from '@/components/logo/logo.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    RouterLink,
    LogoComponent,
    LucideAward,
    LucideClock,
    LucideHeadphones,
    LucideMail,
    LucideMapPin,
    LucidePhone,
    LucideShieldCheck,
  ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent {
  constructor(
    readonly i18n: I18nService,
    readonly ui: UiStateService,
  ) {}
}
