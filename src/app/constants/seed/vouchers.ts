/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { PromoVoucher } from '@/types';

export const DEFAULT_VOUCHERS: PromoVoucher[] = [
  { code: 'VIETCHARM15', description: 'Giảm 15% tổng hóa đơn cho Hội viên VIP', discountType: 'percentage', value: 15, minSpend: 0, active: true },
  { code: 'HOIANWELCOME', description: 'Giảm ngay 100,000đ chào mừng đến Quảng Nam', discountType: 'fixed', value: 100000, minSpend: 300000, active: true },
  { code: 'GENZTRAVEL', description: 'Giảm 20% cho gói phòng nhóm hoặc Tour Combo', discountType: 'percentage', value: 20, minSpend: 500000, active: true },
  { code: 'HELLOMIENTRUNG', description: 'Tặng 100,000đ cho đơn từ 300,000đ trở lên', discountType: 'fixed', value: 100000, minSpend: 300000, active: true },
  { code: 'CHARMHOTEL20', description: 'Giảm 20% cho lượt đặt khách sạn đầu tiên', discountType: 'percentage', value: 20, minSpend: 0, active: true },
];
