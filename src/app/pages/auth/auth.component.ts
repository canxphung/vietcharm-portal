import { Component, computed, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  LucideAlertCircle,
  LucideArrowLeft,
  LucideAward,
  LucideBadgeCheck,
  LucideCalendar,
  LucideCalendarDays,
  LucideCar,
  LucideCheckCircle2,
  LucideCheckSquare,
  LucideClipboardList,
  LucideClock3,
  LucideCompass,
  LucideCreditCard,
  LucideFileText,
  LucideGift,
  LucideHeart,
  LucideHotel,
  LucideKey,
  LucideKeyRound,
  LucideLockKeyhole,
  LucideMail,
  LucideMapPinned,
  LucidePackageCheck,
  LucidePhone,
  LucideRoute,
  LucideShieldAlert,
  LucideShieldCheck,
  LucideShoppingBag,
  LucideSparkles,
  LucideSquare,
  LucideTrash2,
  LucideUser,
  LucideUserPlus,
  LucideUsersRound,
} from '@lucide/angular';
import type { BookingCartItem, UserAccount } from '@/types';
import { AuthService } from '@/services/auth.service';
import { CartService } from '@/services/cart.service';
import { CatalogService } from '@/services/catalog.service';
import { I18nService } from '@/services/i18n.service';
import { ToastService } from '@/services/toast.service';
import { UiStateService } from '@/services/ui-state.service';
import { LogoComponent } from '@/components/logo/logo.component';

@Component({
  selector: 'app-auth-page',
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
  ],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css',
})
export class AuthComponent {
  readonly authImage = 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1400&q=80';
  readonly username = signal('');
  readonly password = signal('');
  readonly fullName = signal('');
  readonly email = signal('');
  readonly phone = signal('');
  readonly errorMsg = signal('');
  readonly successMsg = signal('');
  readonly forgotEmail = signal('');
  readonly sentCode = signal('');
  readonly verificationCode = signal('');
  readonly newPassword = signal('');
  readonly forgotStep = signal<'input-email' | 'verify-code' | 'new-pass'>('input-email');

  readonly isVi = computed(() => this.i18n.isVi());

  constructor(
    readonly auth: AuthService,
    readonly i18n: I18nService,
    private readonly router: Router,
  ) {}

  mode(): 'login' | 'register' | 'forgot-password' {
    const url = this.router.url.split('?')[0];
    if (url.startsWith('/register')) return 'register';
    if (url.startsWith('/forgot-password')) return 'forgot-password';
    return 'login';
  }

  title(): string {
    const m = this.mode();
    if (m === 'register') return this.isVi() ? 'Tạo tài khoản' : 'Create Account';
    if (m === 'forgot-password') return this.isVi() ? 'Quên mật khẩu' : 'Forgot Password';
    return this.isVi() ? 'Đăng nhập' : 'Sign In';
  }

  subtitle(): string {
    const m = this.mode();
    if (m === 'register') return this.isVi() ? 'Mở tài khoản, mở lối đến những vùng đất di sản, ưu đãi riêng và hành trình dành riêng cho bạn.' : 'Open an account and unlock heritage lands, member perks and journeys made just for you.';
    if (m === 'forgot-password') return this.isVi() ? 'Nhập Gmail đã đăng ký để nhận mã xác nhận và đặt lại mật khẩu.' : 'Enter your registered Gmail to receive a code and reset your password.';
    return this.isVi() ? 'Chào mừng trở lại — hành trình VietCharm của bạn vẫn đang chờ phía trước.' : 'Welcome back — your VietCharm journey is waiting right where you left it.';
  }

  switchMode(m: 'login' | 'register' | 'forgot-password'): void {
    this.errorMsg.set('');
    this.successMsg.set('');
    void this.router.navigateByUrl('/' + m);
  }

  private navigateHome(): void {
    void this.router.navigateByUrl('/');
  }

  handleLogin(): void {
    this.errorMsg.set('');
    const cred = this.username().trim().toLowerCase();
    const matched = this.auth.users().find((u) => u.username.toLowerCase() === cred || u.email.toLowerCase() === cred || u.phone === cred);
    if (!matched || (matched.password || '123456') !== this.password()) {
      this.errorMsg.set(this.isVi() ? 'Thông tin đăng nhập hoặc mật khẩu không chính xác.' : 'Incorrect credential or password.');
      return;
    }
    this.successMsg.set(this.isVi() ? `Chào mừng trở lại, ${matched.fullName}!` : `Welcome back, ${matched.fullName}!`);
    setTimeout(() => {
      this.auth.login(matched);
      this.navigateHome();
    }, 700);
  }

  handleRegister(): void {
    this.errorMsg.set('');
    const users = this.auth.users();
    if (users.some((u) => u.username.toLowerCase() === this.username().trim().toLowerCase())) {
      this.errorMsg.set(this.isVi() ? 'Tên đăng nhập này đã tồn tại.' : 'Username already exists.');
      return;
    }
    if (users.some((u) => u.email.toLowerCase() === this.email().trim().toLowerCase())) {
      this.errorMsg.set(this.isVi() ? 'Địa chỉ Gmail này đã được sử dụng.' : 'Gmail address is already registered.');
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
      bio: this.isVi() ? 'Thành viên của cộng đồng du lịch VietCharm.' : 'Member of the VietCharm travel community.',
      role: 'user',
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 999999)}?auto=format&fit=crop&w=150&q=80`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    this.successMsg.set(this.isVi() ? 'Tạo tài khoản thành công! Đang đưa bạn về trang chủ...' : 'Account created! Taking you home...');
    setTimeout(async () => {
      await this.auth.register(newUser);
      this.navigateHome();
    }, 800);
  }

  handleSocial(platform: 'Google' | 'Facebook'): void {
    const suffix = Math.floor(Math.random() * 900) + 100;
    const socialUser: UserAccount = {
      id: `u-social-${Date.now()}`,
      username: `${platform.toLowerCase()}_user${suffix}`,
      password: `oauth-${platform.toLowerCase()}`,
      fullName: platform === 'Google' ? `Google User #${suffix}` : `Facebook User #${suffix}`,
      email: `${platform.toLowerCase()}.${suffix}@st.uel.edu.vn`,
      phone: `0987${suffix}244`,
      bio: this.isVi() ? `Tài khoản đăng nhập qua ${platform}.` : `Linked via ${platform}.`,
      role: 'user',
      avatar: platform === 'Google' ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80' : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      createdAt: new Date().toISOString().split('T')[0],
    };
    this.successMsg.set(this.isVi() ? `Đã liên kết với ${platform} thành công!` : `Authorized with ${platform}!`);
    setTimeout(async () => {
      await this.auth.register(socialUser);
      this.navigateHome();
    }, 700);
  }

  handleForgotEmail(): void {
    this.errorMsg.set('');
    if (!this.forgotEmail().trim() || !this.forgotEmail().includes('@')) {
      this.errorMsg.set(this.isVi() ? 'Vui lòng nhập Gmail hợp lệ.' : 'Please enter a valid Gmail.');
      return;
    }
    const matched = this.auth.users().find((u) => u.email.toLowerCase() === this.forgotEmail().trim().toLowerCase());
    if (!matched) {
      this.errorMsg.set(this.isVi() ? 'Gmail này chưa tồn tại trong hệ thống.' : 'This Gmail is not registered.');
      return;
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    this.sentCode.set(code);
    this.forgotStep.set('verify-code');
    this.successMsg.set(this.isVi() ? `Đã gửi mã xác nhận đến Gmail của bạn. Mã của bạn: ${code}` : `Verification code sent to your Gmail. Your code: ${code}`);
  }

  handleVerifyCode(): void {
    this.errorMsg.set('');
    if (this.verificationCode().trim() !== this.sentCode()) {
      this.errorMsg.set(this.isVi() ? 'Mã xác nhận không khớp.' : 'Incorrect verification code.');
      return;
    }
    this.forgotStep.set('new-pass');
    this.successMsg.set(this.isVi() ? 'Xác minh thành công. Hãy đặt mật khẩu mới.' : 'Code verified. Choose a new password.');
  }

  async handleSaveNewPassword(): Promise<void> {
    this.errorMsg.set('');
    if (this.newPassword().trim().length < 6) {
      this.errorMsg.set(this.isVi() ? 'Mật khẩu mới phải từ 6 ký tự trở lên.' : 'Password must be at least 6 characters.');
      return;
    }
    const updated = await this.auth.updatePasswordByEmail(this.forgotEmail(), this.newPassword().trim());
    if (!updated) {
      this.errorMsg.set(this.isVi() ? 'Không tìm thấy tài khoản để cập nhật mật khẩu.' : 'No account found to update.');
      return;
    }
    this.successMsg.set(this.isVi() ? 'Đặt mật khẩu mới thành công. Vui lòng đăng nhập.' : 'New password saved. Please sign in.');
    setTimeout(() => this.switchMode('login'), 900);
  }
}
