import { Component, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import {
  LucideBike,
  LucideBookOpen,
  LucideCar,
  LucideChevronDown,
  LucideClock,
  LucideCompass,
  LucideGift,
  LucideGlobe,
  LucideHandshake,
  LucideHotel,
  LucideLogOut,
  LucideMapPin,
  LucideMenu,
  LucidePhone,
  LucideRoute,
  LucideSettings,
  LucideShoppingBag,
  LucideSparkles,
  LucideUserRound,
  LucideUsersRound,
  LucideX,
} from '@lucide/angular';
import { AuthService } from '@/services/auth.service';
import { CartService } from '@/services/cart.service';
import { I18nService } from '@/services/i18n.service';
import { UiStateService } from '@/services/ui-state.service';
import { LogoComponent } from './logo.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    LogoComponent,
    LucideBike,
    LucideBookOpen,
    LucideCar,
    LucideChevronDown,
    LucideClock,
    LucideCompass,
    LucideGift,
    LucideGlobe,
    LucideHandshake,
    LucideHotel,
    LucideLogOut,
    LucideMapPin,
    LucideMenu,
    LucidePhone,
    LucideRoute,
    LucideSettings,
    LucideShoppingBag,
    LucideSparkles,
    LucideUserRound,
    LucideUsersRound,
    LucideX,
  ],
  template: `
    <header class="sticky top-0 z-40 w-full border-b border-[#d8c8a7] bg-natural-bg text-natural-text shadow-sm">
      <!-- ===================== MOBILE TOP BAR ===================== -->
      <div class="bg-[#73551F] text-white lg:hidden">
        <div class="mx-auto flex min-h-16 max-w-7xl items-center gap-2 px-4 py-2">
          <button type="button" class="group flex min-w-0 flex-1 items-center gap-2.5" routerLink="/" (click)="closeMenus()">
            <app-logo size="sm" />
          </button>

          <button type="button" class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[11px] font-black uppercase text-white/90 transition hover:bg-white/10 hover:text-white" (click)="i18n.toggleLanguage()" [title]="i18n.isVi() ? 'Switch to English' : 'Chuyển sang Tiếng Việt'">
            {{ i18n.isVi() ? 'EN' : 'VI' }}
          </button>

          <button type="button" class="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white/90 transition hover:bg-white/10 hover:text-white" routerLink="/cart" (click)="closeMenus()" title="Cart">
            <svg lucideShoppingBag class="h-5 w-5"></svg>
            @if (cart.cartCount() > 0) {
              <span class="absolute right-0.5 top-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-natural-gold text-[9px] font-black text-white shadow-sm">{{ cart.cartCount() }}</span>
            }
          </button>

          <button type="button" class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white transition hover:bg-white/10" (click)="mobileOpen.update((o) => !o)" [attr.aria-expanded]="mobileOpen()">
            @if (mobileOpen()) { <svg lucideX class="h-5 w-5"></svg> } @else { <svg lucideMenu class="h-5 w-5"></svg> }
          </button>
        </div>

        @if (mobileOpen()) {
          <div class="fixed inset-x-0 bottom-0 top-16 overflow-y-auto border-t border-natural-border bg-natural-bg px-4 py-4 text-natural-text shadow-2xl">
            <div class="mx-auto max-w-lg space-y-4">
              <div class="rounded-2xl border border-natural-border bg-natural-beige p-3">
                @if (auth.currentUser(); as user) {
                  <div class="flex items-center gap-3">
                    <img [src]="user.avatar" [alt]="user.fullName" class="h-10 w-10 rounded-full object-cover" />
                    <div class="min-w-0 flex-1">
                      <p class="truncate text-sm font-black text-natural-ink">{{ user.fullName }}</p>
                      <p class="truncate text-xs font-semibold text-stone-500">{{ user.email }}</p>
                    </div>
                    <button type="button" class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-natural-accent transition hover:bg-natural-bg" (click)="logout()" [title]="i18n.isVi() ? 'Đăng xuất' : 'Log out'">
                      <svg lucideLogOut class="h-4 w-4"></svg>
                    </button>
                  </div>
                } @else {
                  <div class="grid grid-cols-2 gap-2">
                    <button type="button" class="inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-3 text-sm font-black text-natural-ink transition hover:bg-natural-bg" (click)="openAuth('login')">{{ i18n.isVi() ? 'Đăng nhập' : 'Sign in' }}</button>
                    <button type="button" class="inline-flex min-h-11 items-center justify-center rounded-xl bg-natural-gold px-3 text-sm font-black text-white transition hover:bg-natural-gold-dark" (click)="openAuth('register')">{{ i18n.isVi() ? 'Đăng ký' : 'Sign up' }}</button>
                  </div>
                }
              </div>

              <nav class="grid gap-2">
                <a class="drawer-btn" routerLink="/tours" (click)="closeMenus()"><svg lucideGift class="drawer-ic"></svg><span>{{ i18n.isVi() ? 'Khuyến mãi' : 'Promotions' }}</span></a>
                <a class="drawer-btn" routerLink="/partnership" (click)="closeMenus()"><svg lucideHandshake class="drawer-ic"></svg><span>{{ i18n.isVi() ? 'Hợp tác với chúng tôi' : 'Partner with us' }}</span></a>
                <a class="drawer-btn" routerLink="/recently-viewed" (click)="closeMenus()"><svg lucideClock class="drawer-ic"></svg><span>{{ i18n.isVi() ? 'Xem gần đây' : 'Recent' }}</span></a>
                <a class="drawer-btn" routerLink="/discover" (click)="closeMenus()"><svg lucideCompass class="drawer-ic"></svg><span>{{ i18n.isVi() ? 'Khám phá' : 'Explore' }}</span></a>
                <button type="button" class="drawer-btn" (click)="openServices('hotels')"><svg lucideHotel class="drawer-ic"></svg><span>{{ i18n.isVi() ? 'Khách sạn' : 'Hotels' }}</span></button>
                <button type="button" class="drawer-btn" (click)="openServices('vehicles')"><svg lucideCar class="drawer-ic"></svg><span>{{ i18n.isVi() ? 'Phương tiện di chuyển' : 'Transport' }}</span></button>
                <button type="button" class="drawer-btn" (click)="openServices('activities')"><svg lucideRoute class="drawer-ic"></svg><span>{{ i18n.isVi() ? 'Hoạt động & Vui chơi' : 'Activities' }}</span></button>
                <a class="drawer-btn" routerLink="/trip-room" (click)="closeMenus()"><svg lucideUsersRound class="drawer-ic"></svg><span>Trip Room</span></a>
                <a class="drawer-btn" routerLink="/blind-travel" (click)="closeMenus()"><svg lucideSparkles class="drawer-ic"></svg><span>{{ i18n.isVi() ? 'Hành trình ẩn số' : 'Blind Travel' }}</span></a>
                <a class="drawer-btn" routerLink="/handbook" (click)="closeMenus()"><svg lucideBookOpen class="drawer-ic"></svg><span>{{ i18n.isVi() ? 'Cẩm nang du lịch' : 'Travel handbook' }}</span></a>
                <a class="drawer-btn" routerLink="/nearby-places" (click)="closeMenus()"><svg lucideMapPin class="drawer-ic"></svg><span>{{ i18n.isVi() ? 'Địa điểm lân cận' : 'Nearby places' }}</span></a>
                @if (auth.currentUser()) {
                  <a class="drawer-btn" routerLink="/profile" (click)="closeMenus()"><svg lucideUserRound class="drawer-ic"></svg><span>{{ i18n.isVi() ? 'Hồ sơ cá nhân' : 'Profile' }}</span></a>
                }
                @if (auth.currentUser()?.role === 'admin') {
                  <a class="drawer-btn" routerLink="/admin" (click)="closeMenus()"><svg lucideSettings class="drawer-ic"></svg><span>{{ i18n.isVi() ? 'Quản trị' : 'Admin' }}</span></a>
                }
                <a class="drawer-btn" href="tel:19005040" (click)="closeMenus()"><svg lucidePhone class="drawer-ic"></svg><span>{{ i18n.isVi() ? 'Hỗ trợ' : 'Support' }}</span></a>
              </nav>
            </div>
          </div>
        }
      </div>

      <!-- ===================== DESKTOP TOP BAR ===================== -->
      <div class="hidden bg-[#73551F] text-white lg:block">
        <div class="mx-auto flex min-h-16 max-w-7xl flex-nowrap items-center gap-x-6 px-4">
          <button type="button" class="group flex shrink-0 items-center gap-2.5" routerLink="/" (click)="closeMenus()">
            <app-logo size="sm" />
          </button>

          <nav class="flex flex-1 flex-nowrap items-center justify-center gap-x-4">
            <a class="top-link" routerLink="/tours" routerLinkActive="text-white"><svg lucideGift class="top-ic"></svg><span>{{ i18n.isVi() ? 'Khuyến mãi' : 'Promotions' }}</span></a>
            <a class="top-link" routerLink="/partnership" routerLinkActive="text-white"><svg lucideHandshake class="top-ic"></svg><span>{{ i18n.isVi() ? 'Hợp tác với chúng tôi' : 'Partner with us' }}</span></a>
            <a class="top-link" href="tel:19005040"><svg lucidePhone class="top-ic"></svg><span>{{ i18n.isVi() ? 'Hỗ trợ' : 'Support' }}</span></a>
            <a class="top-link" routerLink="/recently-viewed" routerLinkActive="text-white"><svg lucideClock class="top-ic"></svg><span>{{ i18n.isVi() ? 'Xem gần đây' : 'Recent' }}</span></a>
          </nav>

          <div class="ml-auto flex shrink-0 items-center gap-2">
            <button type="button" class="inline-flex h-9 items-center justify-center gap-1.5 rounded-full px-2.5 text-[11px] font-black uppercase text-white/85 transition hover:bg-white/10 hover:text-white" (click)="i18n.toggleLanguage()" [title]="i18n.isVi() ? 'Switch to English' : 'Chuyển sang Tiếng Việt'">
              <svg lucideGlobe class="h-3.5 w-3.5"></svg>{{ i18n.isVi() ? 'EN' : 'VI' }}
            </button>

            @if (auth.currentUser(); as user) {
              <div class="flex items-center gap-2">
                <button type="button" class="inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-3 text-[11px] font-black text-[#73551F] transition hover:bg-natural-beige" routerLink="/profile" [title]="i18n.isVi() ? 'Quản lý hồ sơ' : 'Manage profile'">
                  <img [src]="user.avatar" alt="Avatar" class="h-5 w-5 rounded-full object-cover" />
                  <span class="hidden max-w-28 truncate sm:inline">{{ user.fullName }}</span>
                </button>
                @if (user.role === 'admin') {
                  <button type="button" class="inline-flex h-9 items-center gap-1 rounded-full bg-red-50 px-3 text-[10px] font-black uppercase text-red-700 transition hover:bg-red-100" routerLink="/admin" [title]="i18n.isVi() ? 'Trang quản trị' : 'Admin panel'">
                    <svg lucideSettings class="h-3.5 w-3.5"></svg><span class="hidden sm:inline">{{ i18n.isVi() ? 'Quản trị' : 'Admin' }}</span>
                  </button>
                }
                <button type="button" class="inline-flex h-9 w-9 items-center justify-center rounded-full text-white/90 transition hover:bg-white/10 hover:text-white" (click)="logout()" [title]="i18n.isVi() ? 'Đăng xuất' : 'Log out'">
                  <svg lucideLogOut class="h-4 w-4"></svg>
                </button>
              </div>
            } @else {
              <div class="flex items-center gap-4">
                <button type="button" class="inline-flex h-10 min-w-28 items-center justify-center rounded-full bg-white px-5 text-sm font-black text-stone-950 shadow-sm transition hover:bg-natural-beige" (click)="openAuth('login')">{{ i18n.isVi() ? 'Đăng nhập' : 'Sign in' }}</button>
                <button type="button" class="inline-flex h-10 min-w-28 items-center justify-center rounded-full bg-natural-gold px-5 text-sm font-black text-white shadow-sm transition hover:bg-natural-gold-dark" (click)="openAuth('register')">{{ i18n.isVi() ? 'Đăng ký' : 'Sign up' }}</button>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- ===================== DESKTOP SUB-NAV (cream) ===================== -->
      <div class="hidden border-t border-[#8A6A2D]/35 bg-[#FFF8E9] lg:block">
        <div class="mx-auto flex min-h-9 max-w-7xl flex-nowrap items-center justify-center gap-x-3 px-4 py-1">
          <nav class="flex flex-nowrap items-center justify-center gap-x-3">
            <a class="nav-item" routerLink="/discover" routerLinkActive="active"><svg lucideCompass class="nav-ic"></svg><span>{{ i18n.isVi() ? 'Khám phá' : 'Explore' }}</span></a>
            <button type="button" class="nav-item" (click)="openServices('hotels')"><svg lucideHotel class="nav-ic"></svg><span>{{ i18n.isVi() ? 'Khách sạn' : 'Hotels' }}</span></button>

            <!-- Transport dropdown -->
            <div class="relative">
              <button type="button" class="nav-item" (click)="toggleTransport()" [attr.aria-expanded]="transportOpen()">
                <svg lucideCar class="nav-ic"></svg><span>{{ i18n.isVi() ? 'Phương tiện di chuyển' : 'Transport' }}</span>
                <svg lucideChevronDown class="h-4 w-4 transition-transform" [class.rotate-180]="transportOpen()"></svg>
              </button>
              @if (transportOpen()) {
                <div class="absolute left-0 top-full z-50 w-52 pt-2">
                  <div class="overflow-hidden rounded-xl border border-natural-border bg-natural-bg py-2 shadow-xl">
                    <button type="button" class="dropdown-item" (click)="openServices('vehicles')"><svg lucideBike class="dd-ic"></svg><span>{{ i18n.isVi() ? 'Thuê xe' : 'Rent a vehicle' }}</span></button>
                    <a class="dropdown-item" routerLink="/taxi" (click)="closeMenus()"><svg lucideCar class="dd-ic"></svg><span>{{ i18n.isVi() ? 'Đặt taxi' : 'Book a taxi' }}</span></a>
                  </div>
                </div>
              }
            </div>

            <button type="button" class="nav-item" (click)="openServices('activities')"><svg lucideRoute class="nav-ic"></svg><span>{{ i18n.isVi() ? 'Hoạt động & Vui chơi' : 'Activities' }}</span></button>
            <a class="nav-item" routerLink="/trip-room" routerLinkActive="active"><svg lucideUsersRound class="nav-ic"></svg><span>Trip Room</span></a>
            <a class="nav-item" routerLink="/blind-travel" routerLinkActive="active"><svg lucideSparkles class="nav-ic"></svg><span>{{ i18n.isVi() ? 'Hành trình ẩn số' : 'Blind Travel' }}</span></a>

            <!-- More dropdown -->
            <div class="relative">
              <button type="button" class="nav-item" (click)="toggleMore()" [attr.aria-expanded]="moreOpen()">
                <span>{{ i18n.isVi() ? 'Xem thêm' : 'More' }}</span>
                <svg lucideChevronDown class="h-4 w-4 transition-transform" [class.rotate-180]="moreOpen()"></svg>
              </button>
              @if (moreOpen()) {
                <div class="absolute right-0 top-full z-50 w-56 pt-2">
                  <div class="overflow-hidden rounded-xl border border-natural-border bg-natural-bg py-2 shadow-xl">
                    <a class="dropdown-item" routerLink="/handbook" (click)="closeMenus()"><svg lucideBookOpen class="dd-ic"></svg><span>{{ i18n.isVi() ? 'Cẩm nang du lịch' : 'Travel handbook' }}</span></a>
                    <a class="dropdown-item" routerLink="/nearby-places" (click)="closeMenus()"><svg lucideMapPin class="dd-ic"></svg><span>{{ i18n.isVi() ? 'Địa điểm lân cận' : 'Nearby places' }}</span></a>
                  </div>
                </div>
              }
            </div>
          </nav>

          <button type="button" class="relative inline-flex h-9 w-10 items-center justify-center text-natural-ink transition hover:text-natural-accent" routerLink="/cart" (click)="closeMenus()" title="Cart">
            <svg lucideShoppingBag class="h-5 w-5"></svg>
            @if (cart.cartCount() > 0) {
              <span class="absolute right-0 top-0 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-natural-gold text-[9px] font-black text-white shadow-sm">{{ cart.cartCount() }}</span>
            }
          </button>
        </div>
      </div>

      <!-- Click-away backdrop for desktop dropdowns -->
      @if (transportOpen() || moreOpen()) {
        <div class="fixed inset-0 z-30" (click)="closeMenus()"></div>
      }
    </header>
  `,
  styles: [
    `
      .top-link { display: inline-flex; height: 3rem; align-items: center; justify-content: center; gap: 0.5rem; padding: 0 0.75rem; font-size: 0.875rem; font-weight: 900; color: rgb(255 255 255 / 0.88); transition: color 0.2s; cursor: pointer; }
      .top-link:hover { color: white; }
      .top-ic { height: 1rem; width: 1rem; flex-shrink: 0; color: var(--color-natural-gold); }
      .nav-item { position: relative; display: inline-flex; height: 2.25rem; align-items: center; justify-content: center; gap: 0.375rem; white-space: nowrap; padding: 0 1rem; font-size: 0.875rem; font-weight: 500; color: var(--color-natural-ink); transition: color 0.2s; cursor: pointer; }
      .nav-item:hover, .nav-item.active { color: var(--color-natural-accent); }
      .nav-item.active::after { content: ""; position: absolute; left: 0.75rem; right: 0.75rem; bottom: 0; height: 2px; border-radius: 999px; background: var(--color-natural-accent); }
      .nav-ic { height: 1rem; width: 1rem; flex-shrink: 0; color: var(--color-natural-accent); }
      .dropdown-item { display: flex; width: 100%; align-items: center; gap: 0.5rem; padding: 0.625rem 1rem; text-align: left; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.025em; color: var(--color-natural-text); transition: background 0.2s; cursor: pointer; }
      .dropdown-item:hover { background: color-mix(in srgb, var(--color-natural-accent) 10%, transparent); }
      .dd-ic { height: 0.875rem; width: 0.875rem; flex-shrink: 0; color: var(--color-natural-gold); }
      .drawer-btn { display: flex; min-height: 3rem; width: 100%; align-items: center; gap: 0.75rem; border-radius: 0.75rem; border: 1px solid var(--color-natural-border); background: white; padding: 0 0.75rem; text-align: left; font-size: 0.875rem; font-weight: 900; color: var(--color-natural-ink); transition: background 0.2s; cursor: pointer; }
      .drawer-btn:hover { background: var(--color-natural-beige); }
      .drawer-ic { height: 1rem; width: 1rem; flex-shrink: 0; color: var(--color-natural-accent); }
    `,
  ],
})
export class HeaderComponent {
  readonly mobileOpen = signal(false);
  readonly transportOpen = signal(false);
  readonly moreOpen = signal(false);

  constructor(
    readonly auth: AuthService,
    readonly cart: CartService,
    readonly i18n: I18nService,
    readonly ui: UiStateService,
    private readonly router: Router,
  ) {}

  toggleTransport(): void {
    this.moreOpen.set(false);
    this.transportOpen.update((o) => !o);
  }

  toggleMore(): void {
    this.transportOpen.set(false);
    this.moreOpen.update((o) => !o);
  }

  closeMenus(): void {
    this.mobileOpen.set(false);
    this.transportOpen.set(false);
    this.moreOpen.set(false);
  }

  openAuth(view: 'login' | 'register'): void {
    this.closeMenus();
    void this.router.navigateByUrl('/' + view);
  }

  openServices(tab: 'hotels' | 'vehicles' | 'activities' | 'attractions'): void {
    this.closeMenus();
    this.ui.openAllServices(tab);
  }

  logout(): void {
    this.closeMenus();
    this.auth.logout();
    void this.router.navigateByUrl('/');
  }
}
