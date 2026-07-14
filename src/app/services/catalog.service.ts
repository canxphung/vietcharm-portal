import { Injectable, computed, inject } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type {
  BookingCartItem,
  PartnershipApplication,
  PaymentTransaction,
  PromoVoucher,
  ServiceComplaint,
  ServiceReview,
  SystemBooking,
} from '@/types';

/** How many days after the service date a customer may still leave a review. */
const REVIEW_WINDOW_DAYS = 30;
/** Every Nth review earns the reviewer a fresh discount voucher. */
const REVIEW_MILESTONE_INTERVAL = 3;

function today(): string {
  return new Date().toISOString().split('T')[0];
}

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpClient);

  private readonly applicationsRes = httpResource<PartnershipApplication[]>(() => '/api/partnerships', {
    defaultValue: [],
  });
  readonly applications = computed(() => this.applicationsRes.value());

  private readonly vouchersRes = httpResource<PromoVoucher[]>(() => '/api/vouchers', { defaultValue: [] });
  readonly vouchers = computed(() => this.vouchersRes.value());

  private readonly bookingsRes = httpResource<SystemBooking[]>(() => '/api/bookings', { defaultValue: [] });
  readonly bookings = computed(() => this.bookingsRes.value());

  private readonly transactionsRes = httpResource<PaymentTransaction[]>(() => '/api/transactions', { defaultValue: [] });
  readonly transactions = computed(() => this.transactionsRes.value());

  private readonly serviceReviewsRes = httpResource<ServiceReview[]>(() => '/api/service-reviews', {
    defaultValue: [],
  });
  readonly serviceReviews = computed(() => this.serviceReviewsRes.value());

  private readonly complaintsRes = httpResource<ServiceComplaint[]>(() => '/api/complaints', { defaultValue: [] });
  readonly complaints = computed(() => this.complaintsRes.value());

  async addApplication(application: PartnershipApplication): Promise<void> {
    const { id, ...rest } = application;
    await firstValueFrom(this.http.post('/api/partnerships', { id, ...rest }));
    this.applicationsRes.reload();
  }

  async setApplicationStatus(id: string, status: PartnershipApplication['status']): Promise<void> {
    await firstValueFrom(this.http.patch(`/api/partnerships/${id}`, { status }));
    this.applicationsRes.reload();
  }

  /** ERD "GiaoDich": persist every payment attempt, both successes and failures. */
  async recordTransaction(tx: Omit<PaymentTransaction, 'id' | 'code' | 'date'>): Promise<void> {
    const id = `VC-TX-${Date.now()}`;
    const transaction: PaymentTransaction = {
      ...tx,
      id,
      code: `TX-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      date: new Date().toISOString(),
    };
    const { id: txId, ...rest } = transaction;
    await firstValueFrom(this.http.post('/api/transactions', { id: txId, ...rest }));
    this.transactionsRes.reload();
  }

  async setBookingStatus(id: string, status: SystemBooking['status']): Promise<void> {
    await firstValueFrom(this.http.patch(`/api/bookings/${id}`, { status }));
    this.bookingsRes.reload();
  }

  async addVoucher(voucher: PromoVoucher): Promise<void> {
    await firstValueFrom(this.http.post('/api/vouchers', voucher));
    this.vouchersRes.reload();
  }

  async deleteVoucher(code: string): Promise<void> {
    await firstValueFrom(this.http.delete(`/api/vouchers/${code}`));
    this.vouchersRes.reload();
  }

  async createBookingFromCart(
    userEmail: string,
    userName: string,
    items: BookingCartItem[],
    total: number,
    discountApplied: number,
    finalTotal: number,
  ): Promise<SystemBooking> {
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
    const { id, ...rest } = booking;
    await firstValueFrom(this.http.post('/api/bookings', { id, ...rest }));
    this.bookingsRes.reload();
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
  async confirmItemReceived(bookingId: string, itemKey: string): Promise<void> {
    const booking = this.bookings().find((b) => b.id === bookingId);
    if (!booking) return;
    const items = booking.items.map((item) =>
      (item.cartKey ?? item.id) === itemKey ? { ...item, receivedConfirmed: true } : item,
    );
    await firstValueFrom(this.http.patch(`/api/bookings/${bookingId}`, { items }));
    this.bookingsRes.reload();
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
  async addReview(review: ServiceReview): Promise<PromoVoucher | null> {
    const { id, ...rest } = review;
    await firstValueFrom(this.http.post('/api/service-reviews', { id, ...rest }));
    // Count against the pre-reload cache (+1 for the review just posted) so the milestone
    // check doesn't depend on the reload's round-trip having already resolved.
    const count = this.reviewsByUser(review.userEmail).length + 1;
    this.serviceReviewsRes.reload();
    if (count % REVIEW_MILESTONE_INTERVAL !== 0) return null;

    const voucher: PromoVoucher = {
      code: `THANKS${count}${Math.floor(100 + Math.random() * 900)}`,
      description: `Ưu đãi tri ân sau ${count} đánh giá từ bạn`,
      discountType: 'percentage',
      value: 10,
      minSpend: 0,
      active: true,
    };
    await this.addVoucher(voucher);
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

  async addComplaint(complaint: ServiceComplaint): Promise<void> {
    const { id, ...rest } = complaint;
    await firstValueFrom(this.http.post('/api/complaints', { id, ...rest }));
    this.complaintsRes.reload();
  }

  async setComplaintStatus(id: string, status: ServiceComplaint['status']): Promise<void> {
    await firstValueFrom(this.http.patch(`/api/complaints/${id}`, { status }));
    this.complaintsRes.reload();
  }
}
