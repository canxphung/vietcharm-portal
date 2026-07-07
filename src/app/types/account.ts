/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { BookingCartItem } from './domain';

export interface UserAccount {
  id: string;
  username: string;
  /** Demo/local auth password. Existing saved demo users may not have this yet. */
  password?: string;
  fullName: string;
  email: string;
  phone: string;
  bio: string;
  role: 'user' | 'admin';
  avatar: string;
  createdAt: string;
}

export interface PartnershipApplication {
  id: string;
  brandName: string;
  contactName: string;
  type: 'hotel' | 'taxi' | 'experience' | 'artisan' | 'guide' | 'vehicle';
  phone: string;
  email: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
}

export interface PromoVoucher {
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minSpend: number;
  active: boolean;
}

export interface SystemBooking {
  id: string;
  userEmail: string;
  userName: string;
  items: BookingCartItem[];
  total: number;
  discountApplied: number;
  finalTotal: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  date: string;
}

/** A customer review tied to a specific bookable service and its author. */
export interface ServiceReview {
  id: string;
  itemId: string;
  itemName: string;
  itemImage?: string;
  userEmail: string;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
}

/** A customer complaint reported straight to VietCharm about a bad experience. */
export interface ServiceComplaint {
  id: string;
  bookingId: string;
  itemId: string;
  itemName: string;
  userEmail: string;
  userName: string;
  reason: string;
  message: string;
  status: 'pending' | 'reviewing' | 'resolved';
  date: string;
}
