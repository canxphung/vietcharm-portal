import { Component, computed, effect, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { UserAccount } from '@/types';
import { EMAIL_PATTERN, PHONE_PATTERN, USERNAME_PATTERN, isStrongPassword } from '@/utils/account-validation';
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
  ],
  templateUrl: './auth-modal.component.html',
  styleUrl: './auth-modal.component.css',
})
export class AuthModalComponent {
  readonly heroImage = 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80';
  readonly authView = signal<AuthView>('login');
  readonly username = signal('');
  readonly password = signal('');
  readonly showLoginPassword = signal(false);
  readonly showRegisterPassword = signal(false);
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
  readonly showNewPassword = signal(false);
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
        this.showLoginPassword.set(false);
        this.showRegisterPassword.set(false);
        this.showNewPassword.set(false);
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
    this.showLoginPassword.set(false);
    this.showRegisterPassword.set(false);
    this.showNewPassword.set(false);
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
    const vi = this.isVi();
    const users = this.auth.users();
    const username = this.username().trim();
    const email = this.email().trim();
    const phone = this.phone().trim();

    if (!USERNAME_PATTERN.test(username)) {
      this.errorMsg.set(vi ? 'Tên đăng nhập tối thiểu 4 ký tự, chỉ gồm chữ, số, dấu chấm (.) hoặc gạch dưới (_).' : 'Username needs at least 4 characters using letters, digits, dot (.) or underscore (_).');
      return;
    }
    if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
      this.errorMsg.set(vi ? 'Tên đăng nhập này đã tồn tại!' : 'Username already exists!');
      return;
    }
    if (!EMAIL_PATTERN.test(email)) {
      this.errorMsg.set(vi ? 'Địa chỉ Gmail không hợp lệ (VD: ten@gmail.com).' : 'Invalid email address (e.g. name@gmail.com).');
      return;
    }
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      this.errorMsg.set(vi ? 'Địa chỉ Gmail này đã được sử dụng!' : 'Gmail address is already registered!');
      return;
    }
    if (phone && !PHONE_PATTERN.test(phone)) {
      this.errorMsg.set(vi ? 'Số điện thoại không hợp lệ — phải bắt đầu bằng 0 và gồm đúng 10 chữ số.' : 'Invalid phone number — must start with 0 and have exactly 10 digits.');
      return;
    }
    if (!isStrongPassword(this.password().trim())) {
      this.errorMsg.set(vi ? 'Mật khẩu chưa đủ mạnh — tối thiểu 8 ký tự, bao gồm cả chữ cái và chữ số.' : 'Password is too weak — at least 8 characters with both letters and digits.');
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
    this.successMsg.set(this.isVi() ? 'Đăng ký tài khoản thành công! Đang tự động kết nối và đăng nhập...' : 'Account created successfully! Logging in...');
    setTimeout(async () => {
      await this.auth.register(newUser);
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
    this.successMsg.set(this.isVi() ? `Ủy quyền tài khoản ${platform} thành công! Đang đăng nhập...` : `Authorized with ${platform}! Entering system...`);
    setTimeout(async () => {
      await this.auth.register(socialUser);
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

  async handleSaveNewPassword(): Promise<void> {
    this.errorMsg.set('');
    if (!isStrongPassword(this.newPassword().trim())) {
      this.errorMsg.set(this.isVi() ? 'Mật khẩu mới chưa đủ mạnh — tối thiểu 8 ký tự, bao gồm cả chữ cái và chữ số!' : 'New password is too weak — at least 8 characters with both letters and digits!');
      return;
    }
    const updated = await this.auth.updatePasswordByContact(this.forgotEmail(), this.newPassword().trim());
    if (updated) {
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
