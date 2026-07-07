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
  recentlyViewed: 'vc_recently_viewed',
  favorites: 'vc_favorites',
  returnTarget: 'vc_return_target',
  serviceReviews: 'vc_service_reviews',
} as const;
