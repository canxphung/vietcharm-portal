/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { UserAccount } from '@/types';

export const DEFAULT_USERS: UserAccount[] = [
  {
    id: 'u-1',
    username: 'ngandtk',
    password: '123456',
    fullName: 'Đặng Thị Kim Ngân',
    email: 'ngandtk244111@st.uel.edu.vn',
    phone: '0987654321',
    bio: 'Đam mê khám phá di sản lịch sử Việt Nam, yêu mến Hội An.',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    createdAt: '2026-06-20',
  },
  {
    id: 'u-2',
    username: 'traveler_ha',
    password: '123456',
    fullName: 'Lê Hoàng Anh',
    email: 'hoanganh@gmail.com',
    phone: '0912345678',
    bio: 'Thích lướt xe máy Sirius đi dạo phố cổ lồng đèn rực rỡ.',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    createdAt: '2026-06-22',
  },
  {
    id: 'u-3',
    username: 'bang',
    password: '123456',
    fullName: 'Phùng Sương Lý Băng',
    email: 'bangpslk24411@st.uel.edu.vn',
    phone: '0975716228',
    bio: 'Đam mê khám phá di sản lịch sử Việt Nam, yêu mến Hội An.',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    createdAt: '2026-07-07',
  }
];
