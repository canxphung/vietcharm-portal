/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Review } from '@/types';

export const reviews: Review[] = [
  {
    id: 'rev-1',
    author: 'Nguyễn Minh Hải',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
    rating: 5,
    date: '2026-06-15',
    comment: 'Tôi vô cùng ấn tượng với tính năng Lên lịch trình tự động bằng AI! Chỉ cần nhập chi phí và sở thích, hệ thống đã tối ưu toàn bộ từ khách sạn, xe máy đến thứ tự tham quan Hội An - Đà Nẵng cực kỳ mượt mà, giúp gia đình tiết kiệm được 15% tổng hóa đơn!',
    locale: 'vi'
  },
  {
    id: 'rev-2',
    author: 'Sarah Jenkins',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
    rating: 5,
    date: '2026-06-12',
    comment: 'The booking process was flawless! Recommended hotels and localized tours in Hoi An matched perfectly with Klook levels of detail. Clear pricing and instant digital receipts made them stand out!',
    locale: 'en'
  },
  {
    id: 'rev-3',
    author: 'Trần Vũ Hoàng',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=100&q=80',
    rating: 5,
    date: '2026-06-08',
    comment: 'Tuyệt đỉnh! Dễ dàng đổi qua lại ngôn ngữ. Được thuê xe máy Sirius lướt thong thả từ Đà Nẵng ra Hội An theo định vị bản đồ thời gian thực tích hợp bên trong cực kì an toàn và chính xác.',
    locale: 'vi'
  }
];
