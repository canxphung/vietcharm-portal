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
import { LogoComponent } from '@/components/logo/logo.component';

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
  templateUrl: './auth-modal.component.html',
  styleUrl: './auth-modal.component.css',
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
