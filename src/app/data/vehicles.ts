/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Vehicle } from '@/types';

export const vehicles: Vehicle[] = [
  {
    id: 'veh-sirius',
    name: 'Yamaha Sirius 110cc (Tiết kiệm xăng)',
    type: 'motorbike',
    pricePerDay: 120000,
    image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=400&q=80',
    specs: 'Xe số dẻo dai, tiết kiệm xăng vượt trội, phù hợp vượt đồi lướt thung lũng.',
    rating: 4.7
  },
  {
    id: 'veh-vision',
    name: 'Honda Vision 110cc Smartkey',
    type: 'motorbike',
    pricePerDay: 150000,
    image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=400&q=80',
    specs: 'Khóa thông minh, cốp xe rộng rãi, lái nhẹ nhàng êm ái trên các nẻo đường đô thị.',
    rating: 4.8
  },
  {
    id: 'veh-lead',
    name: 'Honda Lead 125cc Cốp cực rộng',
    type: 'motorbike',
    pricePerDay: 170000,
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=400&q=80',
    specs: 'Cốp xe siêu rộng 37 lít chứa được 2 nón bảo hiểm và nhiều hành lý lặt vặt.',
    rating: 4.8
  },
  {
    id: 'veh-exciter',
    name: 'Yamaha Exciter 150cc Côn Tay',
    type: 'motorbike',
    pricePerDay: 200000,
    image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=400&q=80',
    specs: 'Động cơ côn tay thể thao mạnh mẽ, bốc lửa, phù hợp chinh phục đèo Hải Vân kỳ vĩ.',
    rating: 4.9
  },
  {
    id: 'veh-sh',
    name: 'Honda SH Premium 150cc',
    type: 'motorbike',
    pricePerDay: 250000,
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=400&q=80',
    specs: 'Đẳng cấp lịch lãm phong trần, động cơ cực mạnh phù hợp hành trình đường dài liên tỉnh.',
    rating: 4.9
  },
  {
    id: 'veh-airblade',
    name: 'Honda Air Blade 125cc Thể Thao',
    type: 'motorbike',
    pricePerDay: 180000,
    image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=400&q=80',
    specs: 'Động cơ eSP+ tiên tiến, vận hành mạnh mẽ khỏe khoắn, thiết kế nam tính hiện đại.',
    rating: 4.8
  },
  {
    id: 'veh-vespa',
    name: 'Vespa Primavera 125cc Thời Trang',
    type: 'motorbike',
    pricePerDay: 300000,
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=400&q=80',
    specs: 'Phong cách Ý cổ điển quyến rũ thanh lịch, màu sơn thời trang tôn dáng chụp hình.',
    rating: 4.9
  },
  {
    id: 'veh-raider',
    name: 'Suzuki Raider 150cc Underbone',
    type: 'motorbike',
    pricePerDay: 220000,
    image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=400&q=80',
    specs: 'Kiểu dáng hyper-underbone siêu ngầu, tốc độ bứt phá cực nhanh cho bạn trẻ mê phượt.',
    rating: 4.7
  },
  {
    id: 'veh-giant-bike',
    name: 'Xe đạp địa hình Giant ATX',
    type: 'motorbike',
    pricePerDay: 80000,
    image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=400&q=80',
    specs: 'Khung nhôm siêu nhẹ Aluxx, phuộc nhún êm ái thích hợp đạp thong dong khám phá phố cổ.',
    rating: 4.8
  },
  {
    id: 'veh-i10',
    name: 'Hyundai i10 Hatchback (Tự Lái)',
    type: 'car',
    pricePerDay: 750000,
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80',
    specs: 'Xe số tự động nhỏ gọn, cực kỳ linh hoạt luồn lách qua các ngõ hẻm đô thị.',
    rating: 4.7
  },
  {
    id: 'veh-accent',
    name: 'Hyundai Accent Sedan (Tự Lái)',
    type: 'car',
    pricePerDay: 900000,
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80',
    specs: 'Sedan 5 chỗ thời trang hiện đại, có trang bị cảm biến lùi, bluetooth kết nối rảnh tay.',
    rating: 4.8
  },
  {
    id: 'veh-vios',
    name: 'Toyota Vios 5 Chỗ (Có tài xế riêng)',
    type: 'car',
    pricePerDay: 1000000,
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80',
    specs: 'Xe Sedan mát lạnh sạch sẽ, tài xế cư xử lịch sự am tường lối ngõ lịch trình linh hoạt.',
    rating: 4.8
  },
  {
    id: 'veh-xpander-self',
    name: 'Mitsubishi Xpander 7 Chỗ (Tự Lái)',
    type: 'car',
    pricePerDay: 1100000,
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=400&q=80',
    specs: 'Mẫu xe 7 chỗ tự lái quốc dân rộng rãi, máy lạnh buốt sâu, ghế da êm ái cho cả gia đình.',
    rating: 4.9
  },
  {
    id: 'veh-xpander',
    name: 'Mitsubishi Xpander 7 Chỗ (Có tài xế)',
    type: 'car',
    pricePerDay: 1300000,
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=400&q=80',
    specs: 'Nội thất cực rộng cho đại gia đình, có gá nóc hành lý cồng kềnh đầy tiện nghi.',
    rating: 4.9
  },
  {
    id: 'veh-fortuner',
    name: 'Toyota Fortuner SUV 7 Chỗ (Tự Lái)',
    type: 'car',
    pricePerDay: 1400000,
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=400&q=80',
    specs: 'SUV 7 chỗ gầm cao, máy dầu bền bỉ tiết kiệm, vượt mọi địa hình đồi núi mượt mà.',
    rating: 4.9
  },
  {
    id: 'veh-vf5',
    name: 'VinFast VF5 Electric SUV (Tự Lái)',
    type: 'car',
    pricePerDay: 800000,
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80',
    specs: 'Xe điện đô thị thông minh, bảo vệ môi trường, vận hành cực kỳ êm ái và bốc.',
    rating: 4.8
  },
  {
    id: 'veh-vf8',
    name: 'VinFast VF8 Luxury Electric SUV (Tự Lái)',
    type: 'car',
    pricePerDay: 1600000,
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=400&q=80',
    specs: 'SUV điện hạng sang thông minh đẳng cấp, hệ thống ADAS lái tự động tiện nghi bậc nhất.',
    rating: 5.0
  },
  {
    id: 'veh-camry',
    name: 'Toyota Camry Sedan Hạng Sang (Tự Lái)',
    type: 'car',
    pricePerDay: 1800000,
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80',
    specs: 'Sedan hạng sang lịch lãm chuẩn mực, mang đến sự đẳng cấp, tĩnh lặng tuyệt đối cho quý doanh nhân.',
    rating: 4.9
  },
  {
    id: 'veh-transit',
    name: 'Ford Transit 16 Chỗ (Có tài xế)',
    type: 'car',
    pricePerDay: 1800000,
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=400&q=80',
    specs: 'Xe 16 chỗ đời mới mát mẻ rộng rãi, tài xế đón tiễn tận tình đúng giờ suốt hành trình.',
    rating: 4.8
  },
  {
    id: 'veh-solati-limo',
    name: 'Hyundai Solati Limousine 9 Chỗ VIP (Có tài)',
    type: 'car',
    pricePerDay: 2800000,
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=400&q=80',
    specs: 'Nội thất khoang thương gia siêu sang, ghế massage bọc da cao cấp, sạc USB, tủ lạnh mini tiện nghi.',
    rating: 5.0
  },
  {
    id: 'veh-vespa-lx',
    name: 'Vespa LX 125cc Cổ Điển',
    type: 'motorbike',
    pricePerDay: 200000,
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=400&q=80',
    specs: 'Dòng xe Vespa Ý thời trang thanh lịch cổ điển, cực kỳ tôn dáng khi chụp ảnh check-in kỷ niệm tại phố cổ Hội An.',
    rating: 4.8
  },
  {
    id: 'veh-xe-om-dien',
    name: 'Xe điện Lihaze mini dễ thương',
    type: 'motorbike',
    pricePerDay: 130000,
    image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=400&q=80',
    specs: 'Chạy điện êm ái bảo vệ môi trường, thiết kế mini dễ thương, giỏ xe lớn tiện ích, thích hợp cho các bạn nữ dạo mát nhẹ nhàng.',
    rating: 4.7
  },
  {
    id: 'veh-kia-carnival',
    name: 'Kia Carnival Signature 8 Chỗ (Có tài xế)',
    type: 'car',
    pricePerDay: 2200000,
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=400&q=80',
    specs: 'Chuyên cơ mặt đất 8 chỗ siêu rộng rãi đời mới nhất, ghế thương gia bọc da cao cấp ngả lưng bọc da êm ái phù hợp đón tiễn sân bay Vip.',
    rating: 5.0
  },
  {
    id: 'veh-vinfast-vfe34',
    name: 'VinFast VF e34 SUV Điện (Tự Lái)',
    type: 'car',
    pricePerDay: 700000,
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80',
    specs: 'SUV điện thông minh 5 chỗ rộng rãi mát mẻ, vận hành êm ru không tiếng ồn cực kỳ tiết kiệm chi phí nhiên liệu sạc pin.',
    rating: 4.8
  },
  {
    id: 'veh-giant-ebike',
    name: 'Xe đạp điện Giant E-Bike thông minh',
    type: 'motorbike',
    pricePerDay: 120000,
    image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=400&q=80',
    specs: 'Xe trợ lực điện Giant nhập khẩu chính hãng, pin bền bỉ lâu bền giúp lướt êm ái xuyên phố cổ mà không lo tốn sức.',
    rating: 4.8
  }
];

