/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/** Top-level navigable views (replaces the inline union in App.tsx). */
export type ViewId =
  | 'regions'
  | 'provinces'
  | 'province'
  | 'ai-explorer'
  | 'blind-travel'
  | 'trip-room'
  | 'group-blind-travel'
  | 'profile'
  | 'taxi'
  | 'tours'
  | 'handbook'
  | 'partnership-register'
  | 'admin'
  | 'recently-viewed'
  | 'nearby-places'
  | 'all-services'
  | 'service-provinces'
  | 'cart'
  | 'login'
  | 'register'
  | 'forgot-password'
  | 'not-found';

/** Tabs for the "all services" catalog view. */
export type ServiceTab = 'attractions' | 'hotels' | 'vehicles' | 'activities';

/** Sub-sections within the province detail view (drives Header active-tab + scroll). */
export type SubView = 'spots' | 'hotels' | 'rentals' | 'experiences';
