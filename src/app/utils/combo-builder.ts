import type { Activity, BookingCartItem, Hotel, Vehicle } from '@/types';

/**
 * Build a 3-item saver combo (stay + ride + activity) from REAL catalog data —
 * top-rated picks so the cart only ever contains services that exist in Mongo.
 * Returns null while the catalog is still loading.
 */
export function buildComboItems(
  hotels: Hotel[],
  vehicles: Vehicle[],
  activities: Activity[],
  vi: boolean,
): BookingCartItem[] | null {
  if (!hotels.length || !vehicles.length || !activities.length) return null;
  const topHotel = [...hotels].sort((a, b) => b.rating - a.rating)[0];
  const topVehicle = [...vehicles].sort((a, b) => b.rating - a.rating)[0];
  const topActivity = [...activities].sort((a, b) => b.rating - a.rating)[0];
  return [
    {
      id: topHotel.id,
      type: 'hotel',
      name: topHotel.name,
      price: topHotel.pricePerNight,
      quantity: 1,
      image: topHotel.image,
      details: vi ? 'Lưu trú được đánh giá cao nhất tại điểm đến bạn chọn' : 'Top-rated stay for your chosen destination',
    },
    {
      id: topVehicle.id,
      type: 'vehicle',
      name: topVehicle.name,
      price: topVehicle.pricePerDay,
      quantity: 1,
      image: topVehicle.image,
      details: vi ? 'Phương tiện di chuyển được đánh giá cao nhất' : 'Highest-rated ride available',
    },
    {
      id: topActivity.id,
      type: 'activity',
      name: topActivity.name,
      price: topActivity.price,
      quantity: 2,
      image: topActivity.image,
      details: vi ? 'Hoạt động nổi bật trong gói gợi ý' : 'Featured activity in the suggested bundle',
    },
  ];
}
