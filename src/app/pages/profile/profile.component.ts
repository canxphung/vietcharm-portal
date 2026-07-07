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
  selector: 'app-profile-page',
  standalone: true,
  imports: [
    DecimalPipe,
    FormsModule,
    RouterLink,
    LucideAward,
    LucideCalendar,
    LucideClipboardList,
    LucideCompass,
    LucideFileText,
    LucideGift,
    LucideHeart,
    LucideKey,
    LucideMail,
    LucidePhone,
    LucideUser,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent {
  readonly tab = signal<'bookings' | 'favorites' | 'history' | 'partnerships'>('bookings');
  readonly isEditing = signal(false);
  readonly saveSuccess = signal(false);
  readonly draftFullName = signal('');
  readonly draftEmail = signal('');
  readonly draftPhone = signal('');
  readonly draftBio = signal('');
  readonly draftAvatar = signal('');

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

  userPartnerships(user: UserAccount) {
    return this.catalog.applications().filter((p) => p.email.toLowerCase() === user.email.toLowerCase());
  }

  toggleEdit(user: UserAccount): void {
    if (!this.isEditing()) {
      this.draftFullName.set(user.fullName);
      this.draftEmail.set(user.email);
      this.draftPhone.set(user.phone);
      this.draftBio.set(user.bio);
      this.draftAvatar.set(user.avatar);
    }
    this.isEditing.update((v) => !v);
  }

  randomAvatar(): void {
    this.draftAvatar.set(`https://picsum.photos/id/${Math.floor(Math.random() * 1000)}/150/150`);
  }

  save(user: UserAccount): void {
    this.auth.updateProfile({
      ...user,
      fullName: this.draftFullName() || user.fullName,
      email: this.draftEmail() || user.email,
      phone: this.draftPhone(),
      bio: this.draftBio(),
      avatar: this.draftAvatar() || user.avatar,
    });
    this.isEditing.set(false);
    this.saveSuccess.set(true);
    setTimeout(() => this.saveSuccess.set(false), 3000);
  }
}
