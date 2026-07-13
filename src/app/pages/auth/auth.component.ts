import { Component, computed, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import type { BookingCartItem, UserAccount } from '@/types';
import { EMAIL_PATTERN, PHONE_PATTERN, USERNAME_PATTERN, isStrongPassword } from '@/utils/account-validation';
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
  ],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css',
})
export class AuthComponent {
  readonly authImage = 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1400&q=80';
  readonly username = signal('');
  readonly password = signal('');
  readonly showLoginPassword = signal(false);
  readonly showRegisterPassword = signal(false);
  readonly fullName = signal('');
  readonly email = signal('');
  readonly phone = signal('');
  readonly errorMsg = signal('');
  readonly successMsg = signal('');
  readonly forgotContact = signal('');
  readonly sentCode = signal('');
  readonly verificationCode = signal('');
  readonly newPassword = signal('');
  readonly showNewPassword = signal(false);
  readonly forgotStep = signal<'input-contact' | 'verify-code' | 'new-pass'>('input-contact');

  // Register flow follows the BPMN: contact (Gmail/SĐT) -> simulated OTP -> account details.
  readonly registerStep = signal<'contact' | 'verify-otp' | 'details'>('contact');
  readonly registerContact = signal('');
  readonly registerSentCode = signal('');
  readonly registerOtp = signal('');

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
    if (m === 'forgot-password') return this.isVi() ? 'Nhập Gmail hoặc SĐT đã đăng ký để nhận mã xác nhận và đặt lại mật khẩu.' : 'Enter your registered Gmail or phone number to receive a code and reset your password.';
    return this.isVi() ? 'Chào mừng trở lại — hành trình VietCharm của bạn vẫn đang chờ phía trước.' : 'Welcome back — your VietCharm journey is waiting right where you left it.';
  }

  switchMode(m: 'login' | 'register' | 'forgot-password'): void {
    this.errorMsg.set('');
    this.successMsg.set('');
    this.showLoginPassword.set(false);
    this.showRegisterPassword.set(false);
    this.showNewPassword.set(false);
    this.forgotStep.set('input-contact');
    this.verificationCode.set('');
    this.registerStep.set('contact');
    this.registerOtp.set('');
    void this.router.navigateByUrl('/' + m);
  }

  /** 6-digit simulated OTP (shown on screen — there is no real SMS/email gateway in this demo). */
  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /** Find an existing account by Gmail or phone number. */
  private findByContact(contact: string): UserAccount | undefined {
    const normalized = contact.trim().toLowerCase();
    return this.auth.users().find((u) => u.email.toLowerCase() === normalized || u.phone === contact.trim());
  }

  private isValidContact(contact: string): boolean {
    const trimmed = contact.trim();
    if (!trimmed) return false;
    if (trimmed.includes('@')) return EMAIL_PATTERN.test(trimmed);
    return PHONE_PATTERN.test(trimmed);
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

  /** Register step 1 (BPMN: Nhập SĐT/Gmail -> Gửi mã OTP). */
  handleRegisterContact(): void {
    this.errorMsg.set('');
    this.successMsg.set('');
    const contact = this.registerContact().trim();
    if (!this.isValidContact(contact)) {
      this.errorMsg.set(this.isVi() ? 'Vui lòng nhập Gmail hợp lệ hoặc SĐT (bắt đầu bằng 0, đủ 10 số).' : 'Please enter a valid Gmail or phone number (starts with 0, 10 digits).');
      return;
    }
    if (this.findByContact(contact)) {
      this.errorMsg.set(this.isVi() ? 'Gmail/SĐT này đã được đăng ký tài khoản. Hãy đăng nhập hoặc dùng Quên mật khẩu.' : 'This Gmail/phone is already registered. Sign in or use Forgot Password.');
      return;
    }
    const code = this.generateOtp();
    this.registerSentCode.set(code);
    this.registerStep.set('verify-otp');
    this.successMsg.set(this.isVi() ? `Đã gửi mã OTP đến ${contact}. Mã của bạn: ${code}` : `OTP sent to ${contact}. Your code: ${code}`);
  }

  /** BPMN: "Bạn đã nhận được mã OTP chưa?" -> Chọn "Gửi lại mã OTP". */
  resendRegisterOtp(): void {
    this.errorMsg.set('');
    const code = this.generateOtp();
    this.registerSentCode.set(code);
    this.successMsg.set(this.isVi() ? `Đã gửi lại mã OTP mới. Mã của bạn: ${code}` : `A new OTP was sent. Your code: ${code}`);
  }

  /** Register step 2 (BPMN: Nhập mã OTP -> "Mã OTP đúng?"). */
  handleRegisterVerifyOtp(): void {
    this.errorMsg.set('');
    if (this.registerOtp().trim() !== this.registerSentCode()) {
      this.errorMsg.set(this.isVi() ? 'Mã OTP không đúng. Kiểm tra lại hoặc bấm "Gửi lại mã OTP".' : 'Incorrect OTP. Check again or tap "Resend OTP".');
      return;
    }
    // Pre-fill the verified contact into the matching account field.
    const contact = this.registerContact().trim();
    if (contact.includes('@')) this.email.set(contact);
    else this.phone.set(contact);
    this.registerStep.set('details');
    this.successMsg.set(this.isVi() ? 'Xác minh OTP thành công! Hãy hoàn tất thông tin tài khoản và đặt mật khẩu.' : 'OTP verified! Complete your account details and set a password.');
  }

  /** Register step 3 (BPMN: Nhập mật khẩu -> Nhấn "Đăng ký" -> Lưu vào Thông tin Khách hàng). */
  handleRegister(): void {
    this.errorMsg.set('');
    this.successMsg.set('');
    const vi = this.isVi();
    const users = this.auth.users();
    const username = this.username().trim();
    const fullName = this.fullName().trim();
    const email = this.email().trim();
    const phone = this.phone().trim();
    const password = this.password().trim();

    if (!USERNAME_PATTERN.test(username)) {
      this.errorMsg.set(vi ? 'Tên đăng nhập tối thiểu 4 ký tự, chỉ gồm chữ, số, dấu chấm (.) hoặc gạch dưới (_).' : 'Username needs at least 4 characters using letters, digits, dot (.) or underscore (_).');
      return;
    }
    if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
      this.errorMsg.set(vi ? 'Tên đăng nhập này đã tồn tại.' : 'Username already exists.');
      return;
    }
    if (fullName.length < 2) {
      this.errorMsg.set(vi ? 'Vui lòng nhập họ và tên đầy đủ.' : 'Please enter your full name.');
      return;
    }
    if (!EMAIL_PATTERN.test(email)) {
      this.errorMsg.set(vi ? 'Địa chỉ Gmail không hợp lệ (VD: ten@gmail.com).' : 'Invalid email address (e.g. name@gmail.com).');
      return;
    }
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      this.errorMsg.set(vi ? 'Địa chỉ Gmail này đã được sử dụng.' : 'Gmail address is already registered.');
      return;
    }
    if (!PHONE_PATTERN.test(phone)) {
      this.errorMsg.set(vi ? 'Số điện thoại không hợp lệ — phải bắt đầu bằng 0 và gồm đúng 10 chữ số.' : 'Invalid phone number — must start with 0 and have exactly 10 digits.');
      return;
    }
    if (users.some((u) => u.phone === phone)) {
      this.errorMsg.set(vi ? 'Số điện thoại này đã được sử dụng.' : 'Phone number is already registered.');
      return;
    }
    if (!isStrongPassword(password)) {
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

  isPhoneRegistrationError(): boolean {
    if (this.mode() !== 'register' || this.registerStep() !== 'details') return false;
    const message = this.errorMsg().toLowerCase();
    return message.includes('số điện thoại') || message.includes('phone number');
  }

  onRegisterPhoneInput(value: string): void {
    this.phone.set(value.replace(/\D/g, '').slice(0, 10));
    if (this.isPhoneRegistrationError()) this.errorMsg.set('');
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

  /** Forgot step 1 (BPMN: Nhập SĐT/Gmail đã đăng ký -> Truy vấn database -> "Đúng?"). */
  handleForgotContact(): void {
    this.errorMsg.set('');
    const contact = this.forgotContact().trim();
    if (!this.isValidContact(contact)) {
      this.errorMsg.set(this.isVi() ? 'Vui lòng nhập Gmail hợp lệ hoặc SĐT (bắt đầu bằng 0, đủ 10 số).' : 'Please enter a valid Gmail or phone number (starts with 0, 10 digits).');
      return;
    }
    if (!this.findByContact(contact)) {
      this.errorMsg.set(this.isVi() ? 'Gmail/SĐT này chưa được đăng ký trong hệ thống.' : 'This Gmail/phone is not registered.');
      return;
    }
    const code = this.generateOtp();
    this.sentCode.set(code);
    this.forgotStep.set('verify-code');
    this.successMsg.set(this.isVi() ? `Đã gửi mã xác nhận đến ${contact}. Mã của bạn: ${code}` : `Verification code sent to ${contact}. Your code: ${code}`);
  }

  /** BPMN: "Đã nhận được mã OTP chưa?" -> gửi lại. */
  resendForgotCode(): void {
    this.errorMsg.set('');
    const code = this.generateOtp();
    this.sentCode.set(code);
    this.successMsg.set(this.isVi() ? `Đã gửi lại mã mới. Mã của bạn: ${code}` : `A new code was sent. Your code: ${code}`);
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
    if (!isStrongPassword(this.newPassword().trim())) {
      this.errorMsg.set(this.isVi() ? 'Mật khẩu mới chưa đủ mạnh — tối thiểu 8 ký tự, bao gồm cả chữ cái và chữ số.' : 'New password is too weak — at least 8 characters with both letters and digits.');
      return;
    }
    const updated = await this.auth.updatePasswordByContact(this.forgotContact(), this.newPassword().trim());
    if (!updated) {
      this.errorMsg.set(this.isVi() ? 'Không tìm thấy tài khoản để cập nhật mật khẩu.' : 'No account found to update.');
      return;
    }
    this.successMsg.set(this.isVi() ? 'Đặt mật khẩu mới thành công. Vui lòng đăng nhập.' : 'New password saved. Please sign in.');
    setTimeout(() => this.switchMode('login'), 900);
  }
}
