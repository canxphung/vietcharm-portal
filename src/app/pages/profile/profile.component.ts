import { Component, computed, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import type { BookingCartItem, SystemBooking, UserAccount } from '@/types';
import { EMAIL_PATTERN, PHONE_PATTERN, USERNAME_PATTERN } from '@/utils/account-validation';
import { AuthService } from '@/services/auth.service';
import { CartService } from '@/services/cart.service';
import { CatalogService } from '@/services/catalog.service';
import { I18nService } from '@/services/i18n.service';
import { ToastService } from '@/services/toast.service';
import { UiStateService } from '@/services/ui-state.service';
import { LogoComponent } from '@/components/logo/logo.component';

interface BookingItemRef {
  booking: SystemBooking;
  item: BookingCartItem;
}

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [
    DecimalPipe,
    FormsModule,
    RouterLink,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent {
  readonly tab = signal<'bookings' | 'favorites' | 'history' | 'reviews'>('bookings');
  readonly isEditing = signal(false);
  readonly saveSuccess = signal(false);
  readonly draftFullName = signal('');
  readonly draftEmail = signal('');
  readonly draftUsername = signal('');
  readonly draftPhone = signal('');
  readonly draftBio = signal('');
  readonly draftAvatar = signal('');
  readonly usernameError = signal('');
  readonly editError = signal('');
  readonly reportingKey = signal<string | null>(null);
  readonly reportReason = signal('');
  readonly reportMessage = signal('');

  constructor(
    readonly auth: AuthService,
    readonly i18n: I18nService,
    readonly ui: UiStateService,
    readonly catalog: CatalogService,
    private readonly toast: ToastService,
  ) {}

  tabBtn(name: string, color: 'accent' | 'rose'): string {
    const active = this.tab() === name;
    const activeCls = color === 'rose' ? 'bg-rose-600 text-white shadow-xs' : 'bg-natural-accent text-white shadow-xs';
    return 'flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold uppercase transition-all ' + (active ? activeCls : 'text-stone-600 hover:bg-stone-100');
  }

  userBookings(user: UserAccount) {
    return this.catalog.bookings().filter((b) => b.userEmail.toLowerCase() === user.email.toLowerCase());
  }

  userReviews(user: UserAccount) {
    return this.catalog.reviewsByUser(user.email);
  }

  hasUserReviewed(user: UserAccount, itemId: string): boolean {
    return this.userReviews(user).some((r) => r.itemId === itemId);
  }

  private itemKey(it: BookingCartItem): string {
    return it.cartKey ?? it.id;
  }

  private unreviewedConfirmedRefs(user: UserAccount): BookingItemRef[] {
    const reviewedIds = new Set(this.userReviews(user).map((r) => r.itemId));
    const seenIds = new Set<string>();
    const refs: BookingItemRef[] = [];
    for (const booking of this.userBookings(user)) {
      if (booking.status !== 'confirmed') continue;
      for (const item of booking.items) {
        if (reviewedIds.has(item.id) || seenIds.has(item.id)) continue;
        seenIds.add(item.id);
        refs.push({ booking, item });
      }
    }
    return refs;
  }

  /** Confirmed and unreviewed, but the service date hasn't arrived yet. */
  upcomingItems(user: UserAccount): BookingCartItem[] {
    return this.unreviewedConfirmedRefs(user)
      .filter((r) => !this.catalog.isItemUsable(r.item))
      .map((r) => r.item);
  }

  /** Usable now, but the customer hasn't confirmed they actually received the service yet. */
  awaitingConfirmation(user: UserAccount): BookingItemRef[] {
    return this.unreviewedConfirmedRefs(user).filter(
      (r) => this.catalog.isItemUsable(r.item) && !this.catalog.isReceivedConfirmed(r.item),
    );
  }

  /** Received and unreviewed, still inside the review window — ready to review now. */
  pendingReviewItems(user: UserAccount): BookingCartItem[] {
    return this.pendingReviewRefs(user).map((r) => r.item);
  }

  /** Same list but keeping the booking, so the card can also open the report-an-issue flow. */
  pendingReviewRefs(user: UserAccount): BookingItemRef[] {
    return this.unreviewedConfirmedRefs(user).filter((r) => this.catalog.isItemReviewReady(r.item));
  }

  isItemUsable(it: BookingCartItem): boolean {
    return this.catalog.isItemUsable(it);
  }

  serviceDateLabel(it: BookingCartItem): string {
    if (!it.serviceDate) return '';
    const vi = this.i18n.isVi();
    return this.catalog.isItemUsable(it)
      ? (vi ? 'Đã sử dụng ' : 'Used ') + it.serviceDate
      : (vi ? 'Sử dụng từ ' : 'Usable from ') + it.serviceDate;
  }

  viewBookingItem(it: BookingCartItem, scrollToReview = false): void {
    this.ui.viewItem(
      { id: it.id, type: it.type, name: it.name, image: it.image, price: it.price, description: it.details },
      { scrollToReview },
    );
  }

  async confirmReceived(booking: SystemBooking, it: BookingCartItem): Promise<void> {
    await this.catalog.confirmItemReceived(booking.id, this.itemKey(it));
    this.toast.showToast({
      type: 'success',
      title: this.i18n.isVi() ? 'Đã xác nhận nhận dịch vụ' : 'Receipt confirmed',
      message: this.i18n.isVi() ? 'Giờ bạn có thể viết đánh giá cho dịch vụ này.' : 'You can now write a review for this service.',
    });
  }

  reportReasons(): string[] {
    return this.i18n.isVi()
      ? ['Chất lượng dịch vụ kém', 'Không đúng như mô tả', 'Thái độ phục vụ', 'Vấn đề thanh toán', 'Khác']
      : ['Poor service quality', 'Not as described', 'Staff attitude', 'Payment issue', 'Other'];
  }

  hasReported(booking: SystemBooking, it: BookingCartItem): boolean {
    return this.catalog.complaints().some((c) => c.bookingId === booking.id && c.itemId === it.id);
  }

  isReporting(booking: SystemBooking, it: BookingCartItem): boolean {
    return this.reportingKey() === `${booking.id}::${this.itemKey(it)}`;
  }

  openReport(booking: SystemBooking, it: BookingCartItem): void {
    this.reportingKey.set(`${booking.id}::${this.itemKey(it)}`);
    this.reportReason.set(this.reportReasons()[0]);
    this.reportMessage.set('');
  }

  closeReport(): void {
    this.reportingKey.set(null);
  }

  async submitReport(user: UserAccount, booking: SystemBooking, it: BookingCartItem): Promise<void> {
    if (!this.reportMessage().trim()) return;
    await this.catalog.addComplaint({
      id: `cmp-${Date.now()}`,
      bookingId: booking.id,
      itemId: it.id,
      itemName: it.name,
      userEmail: user.email,
      userName: user.fullName,
      reason: this.reportReason(),
      message: this.reportMessage().trim(),
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
    });
    this.closeReport();
    this.toast.showToast({
      type: 'success',
      title: this.i18n.isVi() ? 'Đã gửi khiếu nại' : 'Report submitted',
      message: this.i18n.isVi() ? 'VietCharm sẽ xem xét và phản hồi sớm nhất.' : 'VietCharm will review and respond soon.',
    });
  }

  loyaltyPoints(user: UserAccount): number {
    return this.catalog.loyaltyPoints(user.email);
  }

  reviewsUntilNextMilestone(user: UserAccount): number {
    return this.catalog.reviewsUntilNextMilestone(user.email);
  }

  toggleEdit(user: UserAccount): void {
    if (!this.isEditing()) {
      this.draftFullName.set(user.fullName);
      this.draftEmail.set(user.email);
      this.draftUsername.set(user.username);
      this.draftPhone.set(user.phone);
      this.draftBio.set(user.bio);
      this.draftAvatar.set(user.avatar);
      this.usernameError.set('');
      this.editError.set('');
    }
    this.isEditing.update((v) => !v);
  }

  randomAvatar(): void {
    this.draftAvatar.set(`https://picsum.photos/id/${Math.floor(Math.random() * 1000)}/150/150`);
  }

  /** BPMN "Xác thực dữ liệu?": every field is validated with the same rules as registration
   *  before the update request is sent; any failure keeps the user on the edit form. */
  async save(user: UserAccount): Promise<void> {
    const vi = this.i18n.isVi();
    const users = this.auth.users();
    const nextUsername = this.draftUsername().trim() || user.username;
    const nextEmail = this.draftEmail().trim() || user.email;
    const nextPhone = this.draftPhone().trim();
    this.usernameError.set('');
    this.editError.set('');

    if (!USERNAME_PATTERN.test(nextUsername)) {
      this.usernameError.set(vi ? 'Tên đăng nhập tối thiểu 4 ký tự, chỉ gồm chữ, số, dấu chấm (.) hoặc gạch dưới (_).' : 'Username needs at least 4 characters using letters, digits, dot (.) or underscore (_).');
      return;
    }
    if (users.some((u) => u.id !== user.id && u.username.toLowerCase() === nextUsername.toLowerCase())) {
      this.usernameError.set(vi ? 'Tên đăng nhập đã được sử dụng.' : 'This username is already taken.');
      return;
    }
    if (!EMAIL_PATTERN.test(nextEmail)) {
      this.editError.set(vi ? 'Địa chỉ email không hợp lệ (VD: ten@gmail.com).' : 'Invalid email address (e.g. name@gmail.com).');
      return;
    }
    if (users.some((u) => u.id !== user.id && u.email.toLowerCase() === nextEmail.toLowerCase())) {
      this.editError.set(vi ? 'Email này đã được tài khoản khác sử dụng.' : 'This email is used by another account.');
      return;
    }
    if (nextPhone && !PHONE_PATTERN.test(nextPhone)) {
      this.editError.set(vi ? 'Số điện thoại không hợp lệ — phải bắt đầu bằng 0 và gồm đúng 10 chữ số.' : 'Invalid phone number — must start with 0 and have exactly 10 digits.');
      return;
    }
    if (nextPhone && users.some((u) => u.id !== user.id && u.phone === nextPhone)) {
      this.editError.set(vi ? 'Số điện thoại này đã được tài khoản khác sử dụng.' : 'This phone number is used by another account.');
      return;
    }

    await this.auth.updateProfile({
      ...user,
      fullName: this.draftFullName().trim() || user.fullName,
      email: nextEmail,
      username: nextUsername,
      phone: nextPhone,
      bio: this.draftBio(),
      avatar: this.draftAvatar() || user.avatar,
    });
    this.isEditing.set(false);
    this.saveSuccess.set(true);
    setTimeout(() => this.saveSuccess.set(false), 3000);
  }
}
