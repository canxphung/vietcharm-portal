import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { I18nService } from './i18n.service';
import { ToastService } from './toast.service';
import { UiStateService } from './ui-state.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  if (auth.currentUser()) return true;

  const i18n = inject(I18nService);
  inject(ToastService).showToast({
    type: 'info',
    title: i18n.isVi() ? 'Cần đăng nhập' : 'Sign in required',
    message: i18n.isVi() ? 'Vui lòng đăng nhập để dùng tính năng này.' : 'Please sign in to use this feature.',
  });
  inject(UiStateService).openAuthModal('login');
  return inject(Router).parseUrl('/');
};
