import { Injectable } from '@angular/core';
import { DEFAULT_SYSTEM_BOOKINGS } from '@/constants/seed/bookings';
import { DEFAULT_PARTNERSHIPS } from '@/constants/seed/partnerships';
import { DEFAULT_VOUCHERS } from '@/constants/seed/vouchers';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import type { BookingCartItem, PartnershipApplication, PromoVoucher, ServiceReview, SystemBooking } from '@/types';
import { storedSignal } from './storage';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  readonly applications = storedSignal<PartnershipApplication[]>(STORAGE_KEYS.applications, DEFAULT_PARTNERSHIPS);
  readonly vouchers = storedSignal<PromoVoucher[]>(STORAGE_KEYS.vouchers, DEFAULT_VOUCHERS);
  readonly bookings = storedSignal<SystemBooking[]>(STORAGE_KEYS.bookings, DEFAULT_SYSTEM_BOOKINGS);
  readonly serviceReviews = storedSignal<ServiceReview[]>(STORAGE_KEYS.serviceReviews, []);

  addApplication(application: PartnershipApplication): void {
    this.applications.update((applications) => [application, ...applications]);
  }

  setApplicationStatus(id: string, status: PartnershipApplication['status']): void {
    this.applications.update((applications) =>
      applications.map((application) => (application.id === id ? { ...application, status } : application)),
    );
  }

  setBookingStatus(id: string, status: SystemBooking['status']): void {
    this.bookings.update((bookings) => bookings.map((booking) => (booking.id === id ? { ...booking, status } : booking)));
  }

  addVoucher(voucher: PromoVoucher): void {
    this.vouchers.update((vouchers) => [voucher, ...vouchers]);
  }

  deleteVoucher(code: string): void {
    this.vouchers.update((vouchers) => vouchers.filter((voucher) => voucher.code !== code));
  }

  createBookingFromCart(
    userEmail: string,
    userName: string,
    items: BookingCartItem[],
    total: number,
    discountApplied: number,
    finalTotal: number,
  ): SystemBooking {
    const booking: SystemBooking = {
      id: `VC-BK-${Date.now()}`,
      userEmail,
      userName,
      items,
      total,
      discountApplied,
      finalTotal,
      status: 'confirmed',
      date: new Date().toISOString().split('T')[0],
    };
    this.bookings.update((bookings) => [booking, ...bookings]);
    return booking;
  }

  reviewsForItem(itemId: string): ServiceReview[] {
    return this.serviceReviews().filter((review) => review.itemId === itemId);
  }

  reviewsByUser(userEmail: string): ServiceReview[] {
    const normalized = userEmail.toLowerCase();
    return this.serviceReviews().filter((review) => review.userEmail.toLowerCase() === normalized);
  }

  canReview(itemId: string, userEmail: string): boolean {
    return this.canReviewAny([itemId], userEmail);
  }

  /** True if the user has a confirmed booking containing any of the given item ids. */
  canReviewAny(itemIds: string[], userEmail: string): boolean {
    const normalized = userEmail.toLowerCase();
    const idSet = new Set(itemIds);
    return this.bookings().some(
      (booking) =>
        booking.status === 'confirmed' &&
        booking.userEmail.toLowerCase() === normalized &&
        booking.items.some((item) => idSet.has(item.id)),
    );
  }

  addReview(review: ServiceReview): void {
    this.serviceReviews.update((reviews) => [review, ...reviews]);
  }
}
