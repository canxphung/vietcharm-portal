import { Component, computed, effect, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  LucideAlertCircle,
  LucideArrowLeft,
  LucideBadgeCheck,
  LucideCheckCircle2,
  LucideCompass,
  LucideGift,
  LucideKeyRound,
  LucideLockKeyhole,
  LucideMail,
  LucidePhone,
  LucideShieldCheck,
  LucideSparkles,
  LucideUser,
  LucideUserPlus,
  LucideX,
} from '@lucide/angular';
import type { UserAccount } from '@/types';
import { AuthService } from '@/services/auth.service';
import { I18nService } from '@/services/i18n.service';
import { UiStateService } from '@/services/ui-state.service';
import { LogoComponent } from './logo.component';

type AuthView = 'login' | 'register' | 'forgot';
type ForgotStep = 'input-email' | 'verify-code' | 'new-pass';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [
    FormsModule,
    LogoComponent,
    LucideAlertCircle,
    LucideArrowLeft,
    LucideBadgeCheck,
    LucideCheckCircle2,
    LucideCompass,
    LucideGift,
    LucideKeyRound,
    LucideLockKeyhole,
    LucideMail,
    LucidePhone,
    LucideShieldCheck,
    LucideSparkles,
    LucideUser,
    LucideUserPlus,
    LucideX,
  ],
  template: `
    @if (ui.authModalOpen()) {
      <div class="fixed inset-0 z-[75] flex items-center justify-center bg-stone-950/65 p-3 backdrop-blur-sm sm:p-5" (click)="ui.closeAuthModal()">
        <div role="dialog" aria-modal="true" class="relative grid max-h-[calc(100vh-1.5rem)] w-full max-w-5xl overflow-hidden rounded-3xl border border-white/40 bg-natural-bg shadow-2xl md:grid-cols-[0.95fr_1.05fr]" (click)="$event.stopPropagation()">
          <button type="button" [attr.aria-label]="isVi() ? 'Đóng' : 'Close'" class="absolute right-3 top-3 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-white/85 text-stone-600 shadow-sm transition hover:bg-white hover:text-stone-950" (click)="ui.closeAuthModal()"><svg lucideX class="h-4 w-4"></svg></button>

          <!-- Hero aside -->
          <aside class="relative hidden min-h-[650px] overflow-hidden bg-natural-ink text-white md:block">
            <img [src]="heroImage" alt="Hoi An heritage travel" class="absolute inset-0 h-full w-full object-cover" />
            <div class="absolute inset-0 bg-[linear-gradient(145deg,rgba(18,27,25,0.92),rgba(31,40,34,0.62),rgba(158,118,58,0.4))]"></div>
            <div class="relative flex h-full flex-col justify-between p-9">
              <div>
                <div class="mb-8 inline-flex rounded-2xl border border-white/20 bg-white/12 px-3 py-2 backdrop-blur"><app-logo size="sm" /></div>
                <h2 class="max-w-sm font-serif text-4xl font-black leading-tight">{{ isVi() ? 'Một tài khoản cho cả chuyến đi.' : 'One account for the whole trip.' }}</h2>
                <p class="mt-4 max-w-sm text-sm leading-6 text-white/78">{{ isVi() ? 'Đặt dịch vụ, lưu hành trình và nhận chăm sóc thành viên trong cùng một không gian.' : 'Book services, save itineraries and keep member care in one place.' }}</p>
              </div>
              <div class="space-y-4">
                <div class="flex items-start gap-3">
                  <span class="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 text-natural-gold backdrop-blur"><svg lucideCompass class="h-4 w-4"></svg></span>
                  <span><span class="block text-sm font-bold">{{ isVi() ? 'Hành trình rõ ràng' : 'Clear Journey' }}</span><span class="mt-0.5 block text-xs leading-5 text-white/70">{{ isVi() ? 'Theo dõi điểm đến và dịch vụ đã chọn.' : 'Track selected places and services.' }}</span></span>
                </div>
                <div class="flex items-start gap-3">
                  <span class="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 text-natural-gold backdrop-blur"><svg lucideShieldCheck class="h-4 w-4"></svg></span>
                  <span><span class="block text-sm font-bold">{{ isVi() ? 'Thông tin tài khoản' : 'Profile Details' }}</span><span class="mt-0.5 block text-xs leading-5 text-white/70">{{ isVi() ? 'Hồ sơ cá nhân được giữ trong tài khoản.' : 'Your profile stays in your account.' }}</span></span>
                </div>
                <div class="flex items-start gap-3">
                  <span class="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 text-natural-gold backdrop-blur"><svg lucideGift class="h-4 w-4"></svg></span>
                  <span><span class="block text-sm font-bold">{{ isVi() ? 'Ưu đãi thành viên' : 'Member Perks' }}</span><span class="mt-0.5 block text-xs leading-5 text-white/70">{{ isVi() ? 'Kết nối voucher và gợi ý phù hợp.' : 'Connect vouchers and tailored picks.' }}</span></span>
                </div>
              </div>
            </div>
          </aside>

          <!-- Form section -->
          <section class="max-h-[calc(100vh-1.5rem)] overflow-y-auto p-5 sm:p-7 md:p-9">
            <div class="mb-6 overflow-hidden rounded-2xl bg-natural-ink md:hidden">
              <div class="relative min-h-32">
                <img [src]="heroImage" alt="VietCharm" class="absolute inset-0 h-full w-full object-cover" />
                <div class="absolute inset-0 bg-natural-ink/58"></div>
                <div class="relative flex h-full min-h-32 flex-col justify-end p-5 text-white">
                  <span class="mb-1 text-[11px] font-bold uppercase tracking-[0.28em] text-natural-gold">VietCharm</span>
                  <span class="font-serif text-2xl font-black">{{ isVi() ? 'Chuyến đi bắt đầu tại đây' : 'Your trip starts here' }}</span>
                </div>
              </div>
            </div>

            <div class="mb-5 pr-11">
              <span class="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase text-emerald-800 ring-1 ring-emerald-100"><svg lucideSparkles class="h-3.5 w-3.5"></svg>{{ isVi() ? 'Cổng thành viên' : 'Member Portal' }}</span>
              <h3 class="font-serif text-3xl font-black leading-tight text-natural-text">{{ title() }}</h3>
              <p class="mt-2 text-sm leading-6 text-stone-600">{{ subtitle() }}</p>
            </div>

            @if (authView() !== 'forgot') {
              <div class="mb-5 grid grid-cols-2 rounded-xl bg-natural-beige p-1">
                <button type="button" [class]="'inline-flex min-h-10 items-center justify-center gap-2 rounded-lg text-sm font-bold transition ' + (authView() === 'login' ? 'bg-white text-natural-accent shadow-sm' : 'text-stone-500 hover:text-natural-text')" (click)="changeView('login')"><svg lucideUser class="h-4 w-4"></svg>{{ isVi() ? 'Đăng nhập' : 'Sign In' }}</button>
                <button type="button" [class]="'inline-flex min-h-10 items-center justify-center gap-2 rounded-lg text-sm font-bold transition ' + (authView() === 'register' ? 'bg-white text-natural-accent shadow-sm' : 'text-stone-500 hover:text-natural-text')" (click)="changeView('register')"><svg lucideUserPlus class="h-4 w-4"></svg>{{ isVi() ? 'Đăng ký' : 'Register' }}</button>
              </div>
            }

            @if (errorMsg()) { <div class="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold leading-5 text-red-700"><svg lucideAlertCircle class="mt-0.5 h-4 w-4 shrink-0"></svg><span>{{ errorMsg() }}</span></div> }
            @if (successMsg()) { <div class="mb-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold leading-5 text-emerald-800"><svg lucideCheckCircle2 class="mt-0.5 h-4 w-4 shrink-0"></svg><span>{{ successMsg() }}</span></div> }

            @if (authView() === 'login') {
              <form class="space-y-4" (ngSubmit)="handleLogin()">
                <label class="block">
                  <span class="mb-1.5 block text-[11px] font-bold uppercase text-stone-600">{{ isVi() ? 'SĐT / Gmail' : 'Phone / Gmail' }}</span>
                  <span class="afield"><svg lucideUser class="h-4 w-4 shrink-0 text-natural-accent"></svg><input class="ainput" [ngModel]="username()" (ngModelChange)="username.set($event)" name="username" [placeholder]="isVi() ? 'Nhập thông tin đăng nhập' : 'Enter your credential'" required /></span>
                  <span class="mt-1.5 block text-[11px] leading-relaxed text-stone-500">{{ isVi() ? 'Tài khoản dùng thử: ' : 'Try it with: ' }}<span class="font-mono font-semibold text-stone-700">0987654321</span> / <span class="font-mono font-semibold text-stone-700">ngandtk244111&#64;st.uel.edu.vn</span></span>
                </label>
                <div>
                  <div class="mb-1.5 flex items-center justify-between gap-3">
                    <span class="text-[11px] font-bold uppercase text-stone-600">{{ isVi() ? 'Mật khẩu' : 'Password' }}</span>
                    <button type="button" class="inline-flex items-center gap-1 text-xs font-bold text-natural-accent transition hover:text-natural-olive" (click)="changeView('forgot')"><svg lucideKeyRound class="h-3.5 w-3.5"></svg>{{ isVi() ? 'Quên mật khẩu?' : 'Forgot?' }}</button>
                  </div>
                  <span class="afield"><svg lucideLockKeyhole class="h-4 w-4 shrink-0 text-natural-accent"></svg><input class="ainput" type="password" [ngModel]="password()" (ngModelChange)="password.set($event)" name="password" placeholder="••••••••" required /></span>
                  <p class="mt-1.5 text-[11px] leading-relaxed text-stone-500">{{ isVi() ? 'Mật khẩu tài khoản dùng thử: ' : 'Demo password: ' }}<span class="font-mono font-semibold text-stone-700">123456</span></p>
                </div>
                <button type="submit" class="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-natural-accent px-5 text-sm font-black text-white shadow-lg transition hover:bg-natural-olive"><svg lucideShieldCheck class="h-4 w-4"></svg>{{ isVi() ? 'Đăng nhập ngay' : 'Sign In' }}</button>
                <div class="flex items-center gap-3 py-1"><span class="h-px flex-1 bg-natural-border"></span><span class="text-xs font-semibold text-stone-400">{{ isVi() ? 'Hoặc tiếp tục với' : 'Or continue with' }}</span><span class="h-px flex-1 bg-natural-border"></span></div>
                <div class="grid grid-cols-2 gap-3">
                  <button type="button" class="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-natural-border bg-white px-3 text-sm font-bold text-stone-700 shadow-sm transition hover:bg-natural-beige-light" (click)="handleSocial('Google')"><svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24"><path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.63 5.63 0 0 1 8.35 12.89a5.63 5.63 0 0 1 5.64-5.626c1.558 0 2.972.616 4.022 1.624l3.1-3.1C19.14 3.86 16.54 2.5 13.99 2.5a10.37 10.37 0 0 0-10.4 10.39 10.37 10.37 0 0 0 10.4 10.39c5.78 0 10.11-4.06 10.11-10.28 0-.69-.08-1.22-.22-1.72H12.24Z"/></svg><span>Google</span></button>
                  <button type="button" class="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#1877F2] bg-[#1877F2] px-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#166FE5]" (click)="handleSocial('Facebook')"><svg class="h-4 w-4 shrink-0 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg><span>Facebook</span></button>
                </div>
              </form>
            }

            @if (authView() === 'register') {
              <form class="space-y-4" (ngSubmit)="handleRegister()">
                <div class="grid gap-3 sm:grid-cols-2">
                  <label class="block"><span class="mb-1.5 block text-[11px] font-bold uppercase text-stone-600">{{ isVi() ? 'Tên đăng nhập' : 'Username' }}</span><span class="afield"><svg lucideBadgeCheck class="h-4 w-4 shrink-0 text-natural-accent"></svg><input class="ainput" [ngModel]="username()" (ngModelChange)="username.set($event)" name="rusername" placeholder="kimngan26" required /></span></label>
                  <label class="block"><span class="mb-1.5 block text-[11px] font-bold uppercase text-stone-600">{{ isVi() ? 'Họ và tên' : 'Full Name' }}</span><span class="afield"><svg lucideUser class="h-4 w-4 shrink-0 text-natural-accent"></svg><input class="ainput" [ngModel]="fullName()" (ngModelChange)="fullName.set($event)" name="fullName" [placeholder]="isVi() ? 'Đặng Thị Kim Ngân' : 'Kim Ngan Dang'" required /></span></label>
                </div>
                <label class="block"><span class="mb-1.5 block text-[11px] font-bold uppercase text-stone-600">{{ isVi() ? 'Địa chỉ Gmail' : 'Email Address' }}</span><span class="afield"><svg lucideMail class="h-4 w-4 shrink-0 text-natural-accent"></svg><input class="ainput" type="email" [ngModel]="email()" (ngModelChange)="email.set($event)" name="email" placeholder="ngan@gmail.com" required /></span></label>
                <div class="grid gap-3 sm:grid-cols-2">
                  <label class="block"><span class="mb-1.5 block text-[11px] font-bold uppercase text-stone-600">{{ isVi() ? 'Số điện thoại' : 'Phone Number' }}</span><span class="afield"><svg lucidePhone class="h-4 w-4 shrink-0 text-natural-accent"></svg><input class="ainput" type="tel" [ngModel]="phone()" (ngModelChange)="phone.set($event)" name="phone" placeholder="0987654321" required /></span></label>
                  <label class="block"><span class="mb-1.5 block text-[11px] font-bold uppercase text-stone-600">{{ isVi() ? 'Vai trò' : 'Role' }}</span><span class="afield"><svg lucideShieldCheck class="h-4 w-4 shrink-0 text-natural-accent"></svg><select class="ainput appearance-none font-semibold" [ngModel]="role()" (ngModelChange)="role.set($event)" name="role"><option value="user">{{ isVi() ? 'Khách du lịch' : 'Traveler' }}</option><option value="admin">{{ isVi() ? 'Quản trị hệ thống' : 'Administrator' }}</option></select></span></label>
                </div>
                <label class="block"><span class="mb-1.5 block text-[11px] font-bold uppercase text-stone-600">{{ isVi() ? 'Mật khẩu' : 'Password' }}</span><span class="afield"><svg lucideLockKeyhole class="h-4 w-4 shrink-0 text-natural-accent"></svg><input class="ainput" type="password" [ngModel]="password()" (ngModelChange)="password.set($event)" name="rpassword" placeholder="••••••••" required /></span><span class="mt-1.5 block text-[11px] leading-relaxed text-stone-500">{{ isVi() ? 'Tối thiểu 6 ký tự.' : 'At least 6 characters.' }}</span></label>
                <button type="submit" class="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-natural-gold px-5 text-sm font-black text-natural-ink shadow-lg transition hover:bg-natural-gold-dark"><svg lucideUserPlus class="h-4 w-4"></svg>{{ isVi() ? 'Hoàn tất đăng ký' : 'Complete Registration' }}</button>
                <div class="flex items-center gap-3 py-1"><span class="h-px flex-1 bg-natural-border"></span><span class="text-xs font-semibold text-stone-400">{{ isVi() ? 'Hoặc đăng ký bằng' : 'Or register with' }}</span><span class="h-px flex-1 bg-natural-border"></span></div>
                <div class="grid grid-cols-2 gap-3">
                  <button type="button" class="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-natural-border bg-white px-3 text-sm font-bold text-stone-700 shadow-sm transition hover:bg-natural-beige-light" (click)="handleSocial('Google')"><svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24"><path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.63 5.63 0 0 1 8.35 12.89a5.63 5.63 0 0 1 5.64-5.626c1.558 0 2.972.616 4.022 1.624l3.1-3.1C19.14 3.86 16.54 2.5 13.99 2.5a10.37 10.37 0 0 0-10.4 10.39 10.37 10.37 0 0 0 10.4 10.39c5.78 0 10.11-4.06 10.11-10.28 0-.69-.08-1.22-.22-1.72H12.24Z"/></svg><span>Google</span></button>
                  <button type="button" class="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#1877F2] bg-[#1877F2] px-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#166FE5]" (click)="handleSocial('Facebook')"><svg class="h-4 w-4 shrink-0 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg><span>Facebook</span></button>
                </div>
              </form>
            }

            @if (authView() === 'forgot') {
              <div class="space-y-5">
                <button type="button" class="inline-flex items-center gap-2 text-sm font-bold text-natural-accent transition hover:text-natural-olive" (click)="changeView('login')"><svg lucideArrowLeft class="h-4 w-4"></svg>{{ isVi() ? 'Quay lại đăng nhập' : 'Back to sign in' }}</button>
                <div class="grid grid-cols-3 gap-2">
                  @for (step of forgotSteps(); track step.id; let i = $index) {
                    <div class="flex items-center gap-2">
                      <span [class]="'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black ' + (i <= currentStepIndex() ? 'bg-natural-accent text-white' : 'bg-natural-beige text-stone-400')">{{ i + 1 }}</span>
                      <span [class]="'text-xs font-bold ' + (i <= currentStepIndex() ? 'text-natural-text' : 'text-stone-400')">{{ step.label }}</span>
                    </div>
                  }
                </div>
                @if (forgotStep() === 'input-email') {
                  <form class="space-y-4" (ngSubmit)="handleForgotEmail()">
                    <label class="block"><span class="mb-1.5 block text-[11px] font-bold uppercase text-stone-600">{{ isVi() ? 'Gmail nhận mã' : 'Recovery Gmail' }}</span><span class="afield"><svg lucideMail class="h-4 w-4 shrink-0 text-natural-accent"></svg><input class="ainput" type="email" [ngModel]="forgotEmail()" (ngModelChange)="forgotEmail.set($event)" name="femail" placeholder="ngandtk244111@st.uel.edu.vn" required /></span></label>
                    <button type="submit" class="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-natural-accent px-5 text-sm font-black text-white shadow-lg transition hover:bg-natural-olive"><svg lucideMail class="h-4 w-4"></svg>{{ isVi() ? 'Gửi mã xác nhận' : 'Send Verification Code' }}</button>
                  </form>
                }
                @if (forgotStep() === 'verify-code') {
                  <form class="space-y-4" (ngSubmit)="handleVerifyCode()">
                    <label class="block"><span class="mb-1.5 block text-[11px] font-bold uppercase text-stone-600">{{ isVi() ? 'Mã gồm 6 chữ số' : '6-digit Code' }}</span><span class="afield"><svg lucideKeyRound class="h-4 w-4 shrink-0 text-natural-accent"></svg><input class="ainput text-center font-black tracking-[0.35em]" [ngModel]="verificationCode()" (ngModelChange)="verificationCode.set($event)" name="vcode" placeholder="839201" maxlength="6" inputmode="numeric" required /></span></label>
                    <button type="submit" class="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-natural-gold px-5 text-sm font-black text-natural-ink shadow-lg transition hover:bg-natural-gold-dark"><svg lucideBadgeCheck class="h-4 w-4"></svg>{{ isVi() ? 'Xác nhận mã' : 'Verify Code' }}</button>
                  </form>
                }
                @if (forgotStep() === 'new-pass') {
                  <form class="space-y-4" (ngSubmit)="handleSaveNewPassword()">
                    <label class="block"><span class="mb-1.5 block text-[11px] font-bold uppercase text-stone-600">{{ isVi() ? 'Mật khẩu mới' : 'New Password' }}</span><span class="afield"><svg lucideLockKeyhole class="h-4 w-4 shrink-0 text-natural-accent"></svg><input class="ainput" type="password" [ngModel]="newPassword()" (ngModelChange)="newPassword.set($event)" name="npass" placeholder="••••••••" required /></span></label>
                    <button type="submit" class="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 text-sm font-black text-white shadow-lg transition hover:bg-emerald-800"><svg lucideCheckCircle2 class="h-4 w-4"></svg>{{ isVi() ? 'Lưu mật khẩu mới' : 'Save New Password' }}</button>
                  </form>
                }
              </div>
            }
          </section>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .afield { display: flex; min-height: 3rem; align-items: center; gap: 0.75rem; border-radius: 0.75rem; border: 1px solid var(--color-natural-border); background: white; padding-inline: 0.875rem; transition: border-color 0.2s; }
      .afield:focus-within { border-color: var(--color-natural-accent); box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-natural-accent) 15%, transparent); }
      .ainput { height: 2.75rem; min-width: 0; flex: 1; background: transparent; font-size: 0.875rem; color: var(--color-natural-text); outline: none; }
    `,
  ],
})
export class AuthModalComponent {
  readonly heroImage = 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80';
  readonly authView = signal<AuthView>('login');
  readonly username = signal('');
  readonly password = signal('');
  readonly fullName = signal('');
  readonly email = signal('');
  readonly phone = signal('');
  readonly role = signal<'user' | 'admin'>('user');
  readonly errorMsg = signal('');
  readonly successMsg = signal('');
  readonly forgotEmail = signal('');
  readonly sentCode = signal('');
  readonly verificationCode = signal('');
  readonly newPassword = signal('');
  readonly forgotStep = signal<ForgotStep>('input-email');

  readonly isVi = computed(() => this.i18n.isVi());
  readonly currentStepIndex = computed(() => ['input-email', 'verify-code', 'new-pass'].indexOf(this.forgotStep()));

  private wasOpen = false;

  constructor(
    readonly auth: AuthService,
    readonly i18n: I18nService,
    readonly ui: UiStateService,
  ) {
    // Sync to the requested view each time the modal opens.
    effect(() => {
      const open = this.ui.authModalOpen();
      if (open && !this.wasOpen) {
        this.authView.set(this.ui.authModalView() === 'register' ? 'register' : 'login');
        this.errorMsg.set('');
        this.successMsg.set('');
        this.forgotStep.set('input-email');
      }
      this.wasOpen = open;
    });
  }

  forgotSteps(): Array<{ id: ForgotStep; label: string }> {
    const vi = this.isVi();
    return [
      { id: 'input-email', label: vi ? 'Email' : 'Email' },
      { id: 'verify-code', label: vi ? 'Mã' : 'Code' },
      { id: 'new-pass', label: vi ? 'Mật khẩu' : 'Password' },
    ];
  }

  title(): string {
    const v = this.authView();
    if (v === 'register') return this.isVi() ? 'Tạo tài khoản mới' : 'Create Account';
    if (v === 'forgot') return this.isVi() ? 'Khôi phục mật khẩu' : 'Reset Password';
    return this.isVi() ? 'Chào mừng trở lại' : 'Welcome Back';
  }

  subtitle(): string {
    const v = this.authView();
    if (v === 'register') return this.isVi() ? 'Lưu hồ sơ du lịch và kết nối ưu đãi thành viên.' : 'Save your travel profile and member privileges.';
    if (v === 'forgot') return this.isVi() ? 'Nhận mã xác minh và đặt lại mật khẩu an toàn.' : 'Verify your email and set a secure new password.';
    return this.isVi() ? 'Đăng nhập để tiếp tục hành trình cùng VietCharm.' : 'Sign in to continue your VietCharm journey.';
  }

  changeView(view: AuthView): void {
    this.authView.set(view);
    this.errorMsg.set('');
    this.successMsg.set('');
    if (view !== 'forgot') this.forgotStep.set('input-email');
  }

  handleLogin(): void {
    this.errorMsg.set('');
    const cred = this.username().trim().toLowerCase();
    const matched = this.auth.users().find((u) => u.username.toLowerCase() === cred || u.email.toLowerCase() === cred || u.phone === cred);
    if (!matched || (matched.password || '123456') !== this.password()) {
      this.errorMsg.set(this.isVi() ? 'Số điện thoại/Gmail hoặc mật khẩu không chính xác.' : 'Incorrect Phone number/Gmail/Username or password.');
      return;
    }
    this.successMsg.set(this.isVi() ? `Đăng nhập thành công! Chào mừng ${matched.fullName}.` : `Welcome back, ${matched.fullName}!`);
    setTimeout(() => {
      this.auth.login(matched);
      this.close();
    }, 700);
  }

  handleRegister(): void {
    this.errorMsg.set('');
    const users = this.auth.users();
    if (users.some((u) => u.username.toLowerCase() === this.username().trim().toLowerCase())) {
      this.errorMsg.set(this.isVi() ? 'Tên đăng nhập này đã tồn tại!' : 'Username already exists!');
      return;
    }
    if (users.some((u) => u.email.toLowerCase() === this.email().trim().toLowerCase())) {
      this.errorMsg.set(this.isVi() ? 'Địa chỉ Gmail này đã được sử dụng!' : 'Gmail address is already registered!');
      return;
    }
    if (this.password().trim().length < 6) {
      this.errorMsg.set(this.isVi() ? 'Mật khẩu phải từ 6 ký tự trở lên.' : 'Password must be at least 6 characters.');
      return;
    }
    const newUser: UserAccount = {
      id: `u-${Date.now()}`,
      username: this.username().trim(),
      password: this.password().trim(),
      fullName: this.fullName().trim() || this.username().trim(),
      email: this.email().trim(),
      phone: this.phone().trim(),
      bio: this.isVi() ? 'Thành viên tự hào của VietCharm Hoi An.' : 'Proud member of VietCharm Hoi An.',
      role: this.role(),
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 999999)}?auto=format&fit=crop&w=150&q=80`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    this.auth.register(newUser);
    this.successMsg.set(this.isVi() ? 'Đăng ký tài khoản thành công! Đang tự động kết nối và đăng nhập...' : 'Account created successfully! Logging in...');
    setTimeout(() => {
      this.auth.login(newUser);
      this.close();
    }, 1200);
  }

  handleSocial(platform: 'Google' | 'Facebook'): void {
    this.errorMsg.set('');
    const suffix = Math.floor(Math.random() * 900) + 100;
    const socialUser: UserAccount = {
      id: `u-social-${Date.now()}`,
      username: `${platform.toLowerCase()}_user${suffix}`,
      password: `oauth-${platform.toLowerCase()}`,
      fullName: platform === 'Google' ? `Google User #${suffix}` : `Facebook User #${suffix}`,
      email: `${platform.toLowerCase()}.${suffix}@st.uel.edu.vn`,
      phone: `0987${suffix}244`,
      bio: this.isVi() ? `Đăng nhập liên kết thành công qua tài khoản ${platform}.` : `Linked via ${platform}.`,
      role: 'user',
      avatar: platform === 'Google' ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80' : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      createdAt: new Date().toISOString().split('T')[0],
    };
    this.auth.register(socialUser);
    this.successMsg.set(this.isVi() ? `Ủy quyền tài khoản ${platform} thành công! Đang đăng nhập...` : `Authorized with ${platform}! Entering system...`);
    setTimeout(() => {
      this.auth.login(socialUser);
      this.close();
    }, 1200);
  }

  handleForgotEmail(): void {
    this.errorMsg.set('');
    if (!this.forgotEmail().trim() || !this.forgotEmail().includes('@')) {
      this.errorMsg.set(this.isVi() ? 'Vui lòng nhập địa chỉ Gmail hợp lệ!' : 'Please enter a valid Gmail!');
      return;
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    this.sentCode.set(code);
    this.forgotStep.set('verify-code');
    this.successMsg.set(this.isVi() ? `Mã khôi phục đã gửi vào ${this.forgotEmail()}! Mã của bạn: ${code}` : `Verification code sent to ${this.forgotEmail()}! Your code: ${code}`);
  }

  handleVerifyCode(): void {
    this.errorMsg.set('');
    if (this.verificationCode().trim() === this.sentCode()) {
      this.forgotStep.set('new-pass');
      this.successMsg.set(this.isVi() ? 'Xác minh thành công! Hãy đặt mật khẩu mới của bạn.' : 'Code verified! Choose a new password.');
    } else {
      this.errorMsg.set(this.isVi() ? 'Mã xác nhận không khớp! Thử lại.' : 'Incorrect code! Please try again.');
    }
  }

  handleSaveNewPassword(): void {
    this.errorMsg.set('');
    if (this.newPassword().trim().length < 6) {
      this.errorMsg.set(this.isVi() ? 'Mật khẩu mới phải từ 6 ký tự trở lên!' : 'Password must be at least 6 characters!');
      return;
    }
    if (this.auth.updatePasswordByEmail(this.forgotEmail(), this.newPassword().trim())) {
      const matched = this.auth.users().find((u) => u.email.toLowerCase() === this.forgotEmail().trim().toLowerCase());
      this.successMsg.set(this.isVi() ? `Khôi phục thành công mật khẩu cho tài khoản ${matched?.fullName || this.forgotEmail()}! Vui lòng đăng nhập.` : 'Password successfully reset! Please login.');
    } else {
      this.errorMsg.set(this.isVi() ? 'Không tìm thấy tài khoản để cập nhật mật khẩu.' : 'No account found to update.');
      return;
    }
    setTimeout(() => {
      this.changeView('login');
      this.forgotEmail.set('');
      this.verificationCode.set('');
      this.newPassword.set('');
      this.successMsg.set('');
    }, 2000);
  }

  private close(): void {
    this.ui.closeAuthModal();
    this.successMsg.set('');
    this.username.set('');
    this.password.set('');
    this.fullName.set('');
    this.email.set('');
    this.phone.set('');
  }
}
