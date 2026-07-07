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
  LucideMessageSquare,
  LucidePackageCheck,
  LucidePhone,
  LucideRoute,
  LucideShieldAlert,
  LucideShieldCheck,
  LucideShoppingBag,
  LucideSparkles,
  LucideSquare,
  LucideStar,
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
  selector: 'app-profile-page',
  standalone: true,
  imports: [
    DecimalPipe,
    FormsModule,
    RouterLink,
    LucideAward,
    LucideCalendar,
    LucideClipboardList,
    LucideFileText,
    LucideGift,
    LucideHeart,
    LucideKey,
    LucideMail,
    LucideMessageSquare,
    LucidePhone,
    LucideStar,
    LucideUser,
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

  constructor(
    readonly auth: AuthService,
    readonly i18n: I18nService,
    readonly ui: UiStateService,
    readonly catalog: CatalogService,
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

  pendingReviewItems(user: UserAccount): BookingCartItem[] {
    const reviewedIds = new Set(this.userReviews(user).map((r) => r.itemId));
    const seenIds = new Set<string>();
    const items: BookingCartItem[] = [];
    for (const booking of this.userBookings(user)) {
      if (booking.status !== 'confirmed') continue;
      for (const it of booking.items) {
        if (reviewedIds.has(it.id) || seenIds.has(it.id)) continue;
        seenIds.add(it.id);
        items.push(it);
      }
    }
    return items;
  }

  viewBookingItem(it: BookingCartItem, scrollToReview = false): void {
    this.ui.viewItem(
      { id: it.id, type: it.type, name: it.name, image: it.image, price: it.price, description: it.details },
      { scrollToReview },
    );
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
    }
    this.isEditing.update((v) => !v);
  }

  randomAvatar(): void {
    this.draftAvatar.set(`https://picsum.photos/id/${Math.floor(Math.random() * 1000)}/150/150`);
  }

  save(user: UserAccount): void {
    const nextUsername = this.draftUsername().trim() || user.username;
    const isTaken = this.auth
      .users()
      .some((u) => u.id !== user.id && u.username.toLowerCase() === nextUsername.toLowerCase());
    if (isTaken) {
      this.usernameError.set(this.i18n.isVi() ? 'Tên đăng nhập đã được sử dụng.' : 'This username is already taken.');
      return;
    }
    this.usernameError.set('');
    this.auth.updateProfile({
      ...user,
      fullName: this.draftFullName() || user.fullName,
      email: this.draftEmail() || user.email,
      username: nextUsername,
      phone: this.draftPhone(),
      bio: this.draftBio(),
      avatar: this.draftAvatar() || user.avatar,
    });
    this.isEditing.set(false);
    this.saveSuccess.set(true);
    setTimeout(() => this.saveSuccess.set(false), 3000);
  }
}
