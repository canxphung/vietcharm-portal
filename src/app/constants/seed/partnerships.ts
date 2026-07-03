/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { PartnershipApplication } from '@/types';

export const DEFAULT_PARTNERSHIPS: PartnershipApplication[] = [
  {
    id: 'VC-PARTNER-3012',
    brandName: 'Hội An Lantern Homestay',
    contactName: 'Nguyễn Thị Hoa',
    type: 'hotel',
    phone: '0905123456',
    email: 'hoalantern@gmail.com',
    description: 'Mong muốn hợp tác cung cấp 5 phòng nghỉ view sông Hoài hoài cổ.',
    status: 'approved',
    date: '2026-06-21',
  },
  {
    id: 'VC-PARTNER-4509',
    brandName: 'Taxi Sông Thu Bồn',
    contactName: 'Trần Văn Tiến',
    type: 'taxi',
    phone: '0989333444',
    email: 'songthutaxi@gmail.com',
    description: 'Hãng xe 4 chỗ và 7 chỗ phục vụ đưa đón sân bay Đà Nẵng về Hội An giá ưu đãi.',
    status: 'pending',
    date: '2026-06-22',
  }
];
