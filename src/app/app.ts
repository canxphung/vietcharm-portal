import { Component, computed } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthModalComponent } from './components/auth-modal.component';
import { DetailsOverlayComponent } from './components/details-overlay.component';
import { FooterComponent } from './components/footer.component';
import { HeaderComponent } from './components/header.component';
import { HelpPromoComponent } from './components/help-promo.component';
import { PaymentModalComponent } from './components/payment-modal.component';
import { ToastOutletComponent } from './components/toast-outlet.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    AuthModalComponent,
    DetailsOverlayComponent,
    FooterComponent,
    HeaderComponent,
    HelpPromoComponent,
    PaymentModalComponent,
    ToastOutletComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly hideFloatingHelp = computed(() => {
    const url = this.router.url.split('?')[0];
    return ['/cart', '/login', '/register', '/forgot-password'].includes(url);
  });

  constructor(private readonly router: Router) {}
}
