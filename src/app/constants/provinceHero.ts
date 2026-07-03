/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ProvinceHeroConfig {
  image: string;
  title: string;
  subtitle: string;
}

export const provinceHeroById: Record<string, ProvinceHeroConfig> = {
  'quang-nam': {
    image: 'https://images.unsplash.com/photo-1701397955118-79059690ef50?auto=format&fit=crop&w=1600&q=80',
    title: 'HỘI AN',
    subtitle: 'Nơi thời gian chậm lại để bạn cảm nhận những điều bình yên và mộc mạc nhất',
  },
  'da-nang': {
    image: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=1600&q=80',
    title: 'ĐÀ NẴNG',
    subtitle: 'Nơi sóng vỗ bờ cát Mỹ Khê hòa quyện cùng cầu vàng đỉnh non sương khói',
  },
  'thua-thien-hue': {
    image: 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=1600&q=80',
    title: 'CỐ ĐÔ HUẾ',
    subtitle: 'Cố đô cổ kính ngàn năm văn hiến thầm lặng soi bóng bên dòng Hương Giang',
  },
  'binh-dinh': {
    image: 'https://images.unsplash.com/photo-1621539250328-3e440939bc5d?auto=format&fit=crop&w=1600&q=80',
    title: 'QUY NHƠN',
    subtitle: 'Miền đất võ trời văn với những tháp Chăm trầm mặc và làn nước Kỳ Co xanh trong',
  },
  'khanh-hoa': {
    image: 'https://images.unsplash.com/photo-1584013321612-e8c107f27f1b?auto=format&fit=crop&w=1600&q=80',
    title: 'NHA TRANG',
    subtitle: 'Thiên đường vịnh biển rực rỡ cát trắng nắng vàng, đảo ngọc xanh biếc quyến rũ lòng người',
  },
};

export function getProvinceHero(provinceId: string): ProvinceHeroConfig {
  return provinceHeroById[provinceId] ?? provinceHeroById['khanh-hoa'];
}
