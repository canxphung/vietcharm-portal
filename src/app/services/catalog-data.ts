import { activitiesByProvince, attractionsByProvince, hotelsByProvince, provinces, vehicles } from '@/data';
import type { ServiceTab } from '@/constants/views';
import type { Province, ViewableItem } from '@/types';

export function provinceById(id: string): Province {
  return provinces.find((province) => province.id === id) ?? provinces[0];
}

export function attractionItems(provinceId: string): ViewableItem[] {
  return (attractionsByProvince[provinceId] ?? []).map((item, index) => ({
    ...item,
    type: 'attraction',
    price: index === 0 ? 120000 : 80000,
  }));
}

export function hotelItems(provinceId: string): ViewableItem[] {
  return (hotelsByProvince[provinceId] ?? []).map((item) => ({
    id: item.id,
    type: 'hotel',
    name: item.name,
    image: item.image,
    price: item.pricePerNight,
    description: item.description,
    rating: item.rating,
    reviewsCount: item.reviewsCount,
  }));
}

export function activityItems(provinceId: string): ViewableItem[] {
  return (activitiesByProvince[provinceId] ?? []).map((item) => ({
    ...item,
    type: 'activity',
  }));
}

export function vehicleItems(): ViewableItem[] {
  return vehicles.map((item) => ({
    id: item.id,
    type: 'vehicle',
    name: item.name,
    image: item.image,
    price: item.pricePerDay,
    description: item.specs,
    specs: item.specs,
    rating: item.rating,
  }));
}

export function itemsForTab(tab: ServiceTab, provinceId: string): ViewableItem[] {
  if (tab === 'hotels') return hotelItems(provinceId);
  if (tab === 'vehicles') return vehicleItems();
  if (tab === 'activities') return activityItems(provinceId);
  return attractionItems(provinceId);
}

export function allProvinceItems(provinceId: string): ViewableItem[] {
  return [
    ...attractionItems(provinceId),
    ...hotelItems(provinceId),
    ...activityItems(provinceId),
    ...vehicleItems().slice(0, 6),
  ];
}

export function allCatalogItems(): ViewableItem[] {
  return provinces.flatMap((province) => allProvinceItems(province.id));
}
