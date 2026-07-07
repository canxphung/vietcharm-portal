import { Component, computed } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthModalComponent } from '@/components/auth-modal/auth-modal.component';
import { DetailsOverlayComponent } from '@/components/details-overlay/details-overlay.component';
import { FooterComponent } from '@/components/footer/footer.component';
import { HeaderComponent } from '@/components/header/header.component';
import { HelpPromoComponent } from '@/components/help-promo/help-promo.component';
import { ToastOutletComponent } from '@/components/toast-outlet/toast-outlet.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    AuthModalComponent,
    DetailsOverlayComponent,
    FooterComponent,
    HeaderComponent,
    HelpPromoComponent,
    ToastOutletComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  readonly hideFloatingHelp = computed(() => {
    const url = this.router.url.split('?')[0];
    return ['/cart', '/checkout', '/login', '/register', '/forgot-password'].includes(url);
  });

  constructor(private readonly router: Router) {}
}
