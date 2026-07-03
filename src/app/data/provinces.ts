/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Province } from '@/types';

export const provinces: Province[] = [
  {
    id: 'quang-nam',
    name: 'Quảng Nam - Hội An',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
    description: 'Thương cảng sầm uất thế kỷ XVII giữ gìn nguyên vẹn nét cổ kính rêu phong.',
    tagline: 'Phố cổ đèn lồng, di sản lung linh',
    active: true,
  },
  {
    id: 'da-nang',
    name: 'Đà Nẵng',
    image: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=800&q=80',
    description: 'Thành phố đáng sống bậc nhất Việt Nam với những cây cầu huyền thoại bắc qua sông Hàn.',
    tagline: 'Biển bạc Mỹ Khê, Ngũ Hành Sơn hùng vĩ',
    active: false,
  },
  {
    id: 'thua-thien-hue',
    name: 'Thừa Thiên Huế',
    image: 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=800&q=80',
    description: 'Cố đô ngàn năm văn hiến nằm êm đềm bên dòng sông Hương thơ mộng, cổ kính uy nghiêm.',
    tagline: 'Cung điện uy nghiêm, nhã nhạc cung đình',
    active: false,
  },
  {
    id: 'binh-dinh',
    name: 'Bình Định',
    image: 'https://images.unsplash.com/photo-1621539250328-3e440939bc5d?auto=format&fit=crop&w=800&q=80',
    description: 'Vùng đất võ trời văn với những tháp Chăm cổ kính trầm mặc và bãi biển Kỳ Co ngọc bích.',
    tagline: 'Biển Kỳ Co, tháp Chăm ngàn năm',
    active: false,
  },
  {
    id: 'khanh-hoa',
    name: 'Khánh Hòa - Nha Trang',
    image: 'https://images.unsplash.com/photo-1584013321612-e8c107f27f1b?auto=format&fit=crop&w=800&q=80',
    description: 'Vịnh biển đẹp bậc nhất thế giới với dải cát trắng mịn màng và dừa xanh thơ mộng.',
    tagline: 'Vịnh Nha Trang, thiên đường rực rỡ',
    active: false,
  },
  {
    id: 'quang-binh',
    name: 'Quảng Bình',
    image: 'https://images.unsplash.com/photo-1618083707368-b3823daa2726?auto=format&fit=crop&w=800&q=80',
    description: 'Vương quốc hang động thế giới chứa đựng kiệt tác thiên nhiên Sơn Đoòng và Phong Nha kì vĩ.',
    tagline: 'Kỳ quan Sơn Đoòng, Phong Nha đệ nhất động',
    active: false,
  },
  {
    id: 'phu-yen',
    name: 'Phú Yên',
    image: 'https://images.unsplash.com/photo-1623161474966-2615a0c33fb3?auto=format&fit=crop&w=800&q=80',
    description: 'Vùng đất hoa vàng trên cỏ xanh yên bình với Gành Đá Đĩa kỳ vĩ kiến tạo triệu năm.',
    tagline: 'Xứ sở hoa vàng cỏ xanh, Gành Đá Đĩa độc bản',
    active: false,
  },
  {
    id: 'ninh-thuan',
    name: 'Ninh Thuận',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
    description: 'Vùng đất của nắng, gió, vịnh biển Vĩnh Hy tuyệt sắc bên những đồi cát mênh mông.',
    tagline: 'Vịnh Vĩnh Hy trong xanh, tháp cổ Pô Klong Garai',
    active: false,
  },
  {
    id: 'quang-ngai',
    name: 'Quảng Ngãi',
    image: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&w=800&q=80',
    description: 'Quê hương của đảo tỏi Lý Sơn hoang sơ mộc mạc và những cánh đồng muối trắng ngập nắng.',
    tagline: 'Thiên đường biển đảo Lý Sơn, núi Ấn sông Trà',
    active: false,
  },
  {
    id: 'binh-thuan',
    name: 'Bình Thuận',
    image: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80',
    description: 'Xứ sở cát đỏ Mũi Né lộng gió, dừa xanh nghiêng bóng bên dải sóng đại dương rực nắng.',
    tagline: 'Thủ phủ resort Mũi Né, đồi cát bay ngợp gió',
    active: false,
  },
  {
    id: 'quang-tri',
    name: 'Quảng Trị',
    image: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=800&q=80',
    description: 'Miền đất lịch sử anh hùng tự hào của vĩ tuyến 17 bên sông Bến Hải, cầu Hiền Lương.',
    tagline: 'Vĩ tuyến 17 hào hùng, thành cổ uy nghiêm',
    active: false,
  },
  {
    id: 'nghe-an',
    name: 'Nghệ An',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=800&q=80',
    description: 'Mảnh đất địa linh nhân kiệt với bãi biển Cửa Lò thơ mộng và những thảm hoa hướng dương rực rỡ.',
    tagline: 'Quê hương Sen nở thơm ngát, bãi biển Cửa Lò sóng biếc',
    active: false,
  }
];

