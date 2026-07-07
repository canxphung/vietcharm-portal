/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Province {
  id: string;
  name: string;
  image: string;
  description: string;
  active: boolean;
  tagline: string;
}

export interface Attraction {
  id: string;
  name: string;
  image: string;
  description: string;
  rating: number;
  reviewsCount: string;
  lat: number;
  lng: number;
}

export interface Hotel {
  id: string;
  name: string;
  image: string;
  rating: number;
  reviewsCount: string;
  pricePerNight: number;
  description: string;
  lat: number;
  lng: number;
}

export interface Activity {
  id: string;
  name: string;
  image: string;
  price: number;
  description: string;
  rating: number;
  reviewsCount: string;
  lat: number;
  lng: number;
}

export interface Vehicle {
  id: string;
  name: string;
  type: 'motorbike' | 'car';
  pricePerDay: number;
  image: string;
  specs: string;
  rating: number;
}

export interface BookingCartItem {
  /** Stable row key for a concrete selection (same service, different dates/packages). */
  cartKey?: string;
  id: string;
  type: 'hotel' | 'activity' | 'vehicle';
  name: string;
  price: number;
  quantity: number;
  image: string;
  details?: string;
  /** ISO date (check-in / pickup / activity date) marking when the service is actually used. */
  serviceDate?: string;
  /** Selected package tier, when the source item offers standard/premium/luxury packages. */
  packageKey?: 'standard' | 'premium' | 'luxury';
  /** Total price at the 'standard' package tier, used to rescale price when the tier changes in-cart. */
  basePrice?: number;
  /** Customer-confirmed receipt (check-in done / vehicle picked up / activity attended). Required before review. */
  receivedConfirmed?: boolean;
}

export interface BookingSearchCriteria {
  query: string;
  checkInDate: string;
  checkOutDate: string;
  guestsCount: number;
  roomsCount: number;
}

export interface Review {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
  locale: 'vi' | 'en';
}

/** A lightweight item that can be previewed, favorited, or shown in "recently viewed". */
export interface ViewableItem {
  id: string;
  type: string;
  name: string;
  image: string;
  price: number;
  description?: string;
  timestamp?: number;
  rating?: number;
  reviewsCount?: string;
  specs?: string;
  inclusions?: string[];
  duration?: string;
  distance?: string;
  highlights?: string[];
  history?: string;
  coordinates?: { x: number; y: number };
}
