/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { SystemBooking } from '@/types';

export const DEFAULT_SYSTEM_BOOKINGS: SystemBooking[] = [
  {
    id: 'VC-BK-58902',
    userEmail: 'hoanganh@gmail.com',
    userName: 'Lê Hoàng Anh',
    items: [
      { id: 'allegro-hoian', type: 'hotel', name: 'Allegro Hoi An Luxury Hotel & Spa', price: 1250000, quantity: 2, image: '' }
    ],
    total: 2500000,
    discountApplied: 375000,
    finalTotal: 2125000,
    status: 'confirmed',
    date: '2026-06-22',
  }
];
