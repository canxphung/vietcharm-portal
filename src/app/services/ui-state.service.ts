import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import type { ServiceTab } from '@/constants/views';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import type { ViewableItem } from '@/types';
import { AuthService } from './auth.service';
import { I18nService } from './i18n.service';
import { storedSignal } from './storage';
import { ToastService } from './toast.service';

export type AuthModalView = 'login' | 'register';

@Injectable({ providedIn: 'root' })
export class UiStateService {
  readonly selectedProvinceId = signal('quang-nam');
  readonly selectedItem = signal<ViewableItem | null>(null);
  readonly allServicesTab = signal<ServiceTab>('attractions');
  readonly allServicesVehicleMode = signal<'rent' | 'taxi'>('rent');
  readonly allServicesServicePicker = signal<ServiceTab>('hotels');
  readonly recentlyViewed = storedSignal<ViewableItem[]>(STORAGE_KEYS.recentlyViewed, []);
  readonly favorites = storedSignal<ViewableItem[]>(STORAGE_KEYS.favorites, []);
  readonly authModalOpen = signal(false);
  readonly authModalView = signal<AuthModalView>('login');

  constructor(
    private readonly auth: AuthService,
    private readonly i18n: I18nService,
    private readonly router: Router,
    private readonly toast: ToastService,
  ) {}

  openAuthModal(view: AuthModalView = 'login'): void {
    this.authModalView.set(view);
    this.authModalOpen.set(true);
  }

  closeAuthModal(): void {
    this.authModalOpen.set(false);
  }

  navigateHome(): void {
    void this.router.navigateByUrl('/');
  }

  selectProvince(id: string): void {
    this.selectedProvinceId.set(id);
    this.selectedItem.set(null);
    void this.router.navigate(['/province', id]);
  }

  openAllServices(tab: ServiceTab, provinceId = this.selectedProvinceId()): void {
    this.allServicesTab.set(tab);
    void this.router.navigate(['/services'], { queryParams: { tab, province: provinceId } });
  }

  viewItem(item: ViewableItem): void {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(
        STORAGE_KEYS.returnTarget,
        JSON.stringify({ provinceId: this.selectedProvinceId(), itemId: item.id, scrollY: window.scrollY }),
      );
      window.scrollTo({ top: 0 });
    }
    this.recentlyViewed.update((items) => [{ ...item, timestamp: Date.now() }, ...items.filter((x) => x.id !== item.id)].slice(0, 24));
    this.selectedItem.set(item);
  }

  clearSelectedItem(): void {
    this.selectedItem.set(null);
    if (typeof window === 'undefined') return;
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEYS.returnTarget);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { scrollY?: number };
      if (typeof parsed.scrollY === 'number') {
        window.requestAnimationFrame(() => window.scrollTo({ top: parsed.scrollY }));
      }
      window.sessionStorage.removeItem(STORAGE_KEYS.returnTarget);
    } catch {
      // Ignore malformed old session data.
    }
  }

  clearRecentlyViewed(): void {
    this.recentlyViewed.set([]);
  }

  removeRecentlyViewed(id: string): void {
    this.recentlyViewed.update((items) => items.filter((item) => item.id !== id));
  }

  toggleFavorite(item: ViewableItem): void {
    this.favorites.update((items) =>
      items.some((favorite) => favorite.id === item.id)
        ? items.filter((favorite) => favorite.id !== item.id)
        : [...items, item],
    );
  }

  isFavorite(id: string): boolean {
    return this.favorites().some((item) => item.id === id);
  }

  requireAuth(action: () => void, message?: string): void {
    if (this.auth.currentUser()) {
      action();
      return;
    }
    this.toast.showToast({
      type: 'info',
      title: this.i18n.isVi() ? 'Cần đăng nhập' : 'Sign in required',
      message: message ?? (this.i18n.isVi() ? 'Vui lòng đăng nhập để tiếp tục.' : 'Please sign in to continue.'),
    });
    this.openAuthModal('login');
  }
}
