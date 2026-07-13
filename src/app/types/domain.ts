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

export interface TouristLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface HandbookEntry {
  id: string;
  order: number;
  labelVi: string;
  labelEn: string;
  titleVi: string;
  titleEn: string;
  image: string;
  paragraphsVi: string[];
  paragraphsEn: string[];
}

export interface NearbyPlaceReview {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
}

export interface NearbyPlace {
  id: string;
  order: number;
  nameVi: string;
  nameEn: string;
  categoryVi: string;
  categoryEn: string;
  descriptionVi: string;
  descriptionEn: string;
  distance: string;
  duration: string;
  coordinates: { x: number; y: number };
  images: string[];
  reviews: NearbyPlaceReview[];
  rating: number;
  totalReviews: number;
  historyVi: string;
  historyEn: string;
}

export type SupportTopicId =
  | 'help'
  | 'faq'
  | 'booking-guide'
  | 'refund'
  | 'terms'
  | 'privacy'
  | 'about'
  | 'careers'
  | 'partners'
  | 'blog'
  | 'contact';

export interface SupportSection {
  headingVi: string;
  headingEn: string;
  bodyVi: string;
  bodyEn: string;
}

export interface SupportFaqEntry {
  qVi: string;
  qEn: string;
  aVi: string;
  aEn: string;
}

export interface SupportTopic {
  id: SupportTopicId;
  order: number;
  group: 'support' | 'about';
  groupVi: string;
  groupEn: string;
  titleVi: string;
  titleEn: string;
  introVi: string;
  introEn: string;
  sections: SupportSection[];
  faqs: SupportFaqEntry[];
}

export interface TourCombo {
  id: string;
  name: string;
  image: string;
  days: string;
  price: number;
  oldPrice: number;
  includes: string[];
  rating: number;
  tag: string;
}

export interface Attraction {
  id: string;
  provinceId?: string;
  name: string;
  image: string;
  description: string;
  discountPercent?: number;
  rating: number;
  reviewsCount: string;
  lat: number;
  lng: number;
}

export interface Hotel {
  id: string;
  provinceId?: string;
  name: string;
  image: string;
  rating: number;
  reviewsCount: string;
  pricePerNight: number;
  discountPercent?: number;
  description: string;
  lat: number;
  lng: number;
}

export interface Activity {
  id: string;
  provinceId?: string;
  name: string;
  image: string;
  price: number;
  discountPercent?: number;
  description: string;
  rating: number;
  reviewsCount: string;
  lat: number;
  lng: number;
}

export interface VehicleRentalPackage {
  key: 'standard' | 'premium' | 'luxury';
  priceModifier: number;
  nameVi: string;
  nameEn: string;
  descriptionVi: string;
  descriptionEn: string;
}

export interface Vehicle {
  id: string;
  name: string;
  type: 'motorbike' | 'car';
  pricePerDay: number;
  discountPercent?: number;
  image: string;
  gallery?: string[];
  specs: string;
  rating: number;
  rentalPackages?: VehicleRentalPackage[];
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
  provinceId?: string;
  type: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  description?: string;
  timestamp?: number;
  rating?: number;
  reviewsCount?: string;
  specs?: string;
  vehicleType?: 'motorbike' | 'car';
  gallery?: string[];
  rentalPackages?: VehicleRentalPackage[];
  inclusions?: string[];
  duration?: string;
  distance?: string;
  highlights?: string[];
  history?: string;
  coordinates?: { x: number; y: number };
}
