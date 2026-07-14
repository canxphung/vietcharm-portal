/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/** Centralized localStorage keys so persistence owners are easy to audit. */
export const STORAGE_KEYS = {
  users: 'vc_users',
  applications: 'vc_applications',
  vouchers: 'vc_vouchers',
  bookings: 'vc_bookings',
  currentUser: 'vc_current_user',
  cart: 'vc_cart',
  recentlyViewed: 'vc_recently_viewed',
  favorites: 'vc_favorites',
  serviceReviews: 'vc_service_reviews',
  complaints: 'vc_complaints',
} as const;
