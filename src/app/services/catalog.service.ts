import { Injectable } from '@angular/core';
import { DEFAULT_SYSTEM_BOOKINGS } from '@/constants/seed/bookings';
import { DEFAULT_PARTNERSHIPS } from '@/constants/seed/partnerships';
import { DEFAULT_VOUCHERS } from '@/constants/seed/vouchers';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import type { PartnershipApplication, PromoVoucher, SystemBooking } from '@/types';
import { storedSignal } from './storage';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  readonly applications = storedSignal<PartnershipApplication[]>(STORAGE_KEYS.applications, DEFAULT_PARTNERSHIPS);
  readonly vouchers = storedSignal<PromoVoucher[]>(STORAGE_KEYS.vouchers, DEFAULT_VOUCHERS);
  readonly bookings = storedSignal<SystemBooking[]>(STORAGE_KEYS.bookings, DEFAULT_SYSTEM_BOOKINGS);

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
}
