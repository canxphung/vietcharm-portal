import { Injectable } from '@angular/core';
import { DEFAULT_SYSTEM_BOOKINGS } from '@/constants/seed/bookings';
import { DEFAULT_PARTNERSHIPS } from '@/constants/seed/partnerships';
import { DEFAULT_VOUCHERS } from '@/constants/seed/vouchers';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import type {
  BookingCartItem,
  PartnershipApplication,
  PromoVoucher,
  ServiceComplaint,
  ServiceReview,
  SystemBooking,
} from '@/types';
import { storedSignal } from './storage';

/** How many days after the service date a customer may still leave a review. */
const REVIEW_WINDOW_DAYS = 30;
/** Every Nth review earns the reviewer a fresh discount voucher. */
const REVIEW_MILESTONE_INTERVAL = 3;

function today(): string {
  return new Date().toISOString().split('T')[0];
}

@Injectable({ providedIn: 'root' })
export class CatalogService {
  readonly applications = storedSignal<PartnershipApplication[]>(STORAGE_KEYS.applications, DEFAULT_PARTNERSHIPS);
  readonly vouchers = storedSignal<PromoVoucher[]>(STORAGE_KEYS.vouchers, DEFAULT_VOUCHERS);
  readonly bookings = storedSignal<SystemBooking[]>(STORAGE_KEYS.bookings, DEFAULT_SYSTEM_BOOKINGS);
  readonly serviceReviews = storedSignal<ServiceReview[]>(STORAGE_KEYS.serviceReviews, []);
  readonly complaints = storedSignal<ServiceComplaint[]>(STORAGE_KEYS.complaints, []);

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
      date: today(),
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

  /** True once the service date has arrived (or there is no date to gate on, e.g. quick-add items). */
  isItemUsable(item: BookingCartItem): boolean {
    if (!item.serviceDate) return true;
    return item.serviceDate <= today();
  }

  /** True once the customer has explicitly confirmed they received the service (or there's no checkpoint to confirm). */
  isReceivedConfirmed(item: BookingCartItem): boolean {
    if (!item.serviceDate) return true;
    return !!item.receivedConfirmed;
  }

  /** Last date a review may still be submitted for this item, or null if there's no service date to count from. */
  reviewDeadline(item: BookingCartItem): string | null {
    if (!item.serviceDate) return null;
    const d = new Date(item.serviceDate);
    d.setDate(d.getDate() + REVIEW_WINDOW_DAYS);
    return d.toISOString().split('T')[0];
  }

  isWithinReviewWindow(item: BookingCartItem): boolean {
    const deadline = this.reviewDeadline(item);
    return !deadline || today() <= deadline;
  }

  /** Full readiness check: date arrived, receipt confirmed, and still inside the review window. */
  isItemReviewReady(item: BookingCartItem): boolean {
    return this.isItemUsable(item) && this.isReceivedConfirmed(item) && this.isWithinReviewWindow(item);
  }

  /** Marks a specific booking's item as received (check-in done / vehicle picked up / activity attended). */
  confirmItemReceived(bookingId: string, itemKey: string): void {
    this.bookings.update((bookings) =>
      bookings.map((booking) =>
        booking.id === bookingId
          ? {
              ...booking,
              items: booking.items.map((item) =>
                (item.cartKey ?? item.id) === itemKey ? { ...item, receivedConfirmed: true } : item,
              ),
            }
          : booking,
      ),
    );
  }

  canReview(itemId: string, userEmail: string): boolean {
    return this.canReviewAny([itemId], userEmail);
  }

  /** True if the user has a confirmed, received, still-in-window booking containing any of the given item ids. */
  canReviewAny(itemIds: string[], userEmail: string): boolean {
    const normalized = userEmail.toLowerCase();
    const idSet = new Set(itemIds);
    return this.bookings().some(
      (booking) =>
        booking.status === 'confirmed' &&
        booking.userEmail.toLowerCase() === normalized &&
        booking.items.some((item) => idSet.has(item.id) && this.isItemReviewReady(item)),
    );
  }

  /**
   * Adds the review and, every REVIEW_MILESTONE_INTERVAL-th review from this user, mints them a
   * one-time thank-you voucher. Returns that voucher so the caller can celebrate it in the UI.
   */
  addReview(review: ServiceReview): PromoVoucher | null {
    this.serviceReviews.update((reviews) => [review, ...reviews]);
    const count = this.reviewsByUser(review.userEmail).length;
    if (count === 0 || count % REVIEW_MILESTONE_INTERVAL !== 0) return null;

    const voucher: PromoVoucher = {
      code: `THANKS${count}${Math.floor(100 + Math.random() * 900)}`,
      description: `Ưu đãi tri ân sau ${count} đánh giá từ bạn`,
      discountType: 'percentage',
      value: 10,
      minSpend: 0,
      active: true,
    };
    this.addVoucher(voucher);
    return voucher;
  }

  loyaltyPoints(userEmail: string): number {
    return this.reviewsByUser(userEmail).length * 20;
  }

  /** How many more reviews until the next thank-you voucher unlocks. */
  reviewsUntilNextMilestone(userEmail: string): number {
    const remainder = this.reviewsByUser(userEmail).length % REVIEW_MILESTONE_INTERVAL;
    return remainder === 0 ? REVIEW_MILESTONE_INTERVAL : REVIEW_MILESTONE_INTERVAL - remainder;
  }

  complaintsByUser(userEmail: string): ServiceComplaint[] {
    const normalized = userEmail.toLowerCase();
    return this.complaints().filter((c) => c.userEmail.toLowerCase() === normalized);
  }

  addComplaint(complaint: ServiceComplaint): void {
    this.complaints.update((list) => [complaint, ...list]);
  }

  setComplaintStatus(id: string, status: ServiceComplaint['status']): void {
    this.complaints.update((list) => list.map((c) => (c.id === id ? { ...c, status } : c)));
  }
}
