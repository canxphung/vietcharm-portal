import { Injectable, computed } from '@angular/core';
import { httpResource } from '@angular/common/http';
import type { Activity, Attraction, Hotel, Province, TourCombo, TouristLocation, Vehicle, ViewableItem } from '@/types';

/** Live catalog reference data (provinces, vehicles, tour combos, tourist locations) fetched once from the API and shared app-wide. */
@Injectable({ providedIn: 'root' })
export class CatalogDataService {
  private readonly provincesRes = httpResource<Province[]>(() => '/api/provinces', { defaultValue: [] });
  readonly provinces = computed(() => this.provincesRes.value());

  private readonly vehiclesRes = httpResource<Vehicle[]>(() => '/api/vehicles', { defaultValue: [] });
  readonly vehicles = computed(() => this.vehiclesRes.value());

  private readonly tourCombosRes = httpResource<TourCombo[]>(() => '/api/tour-combos', { defaultValue: [] });
  readonly tourCombos = computed(() => this.tourCombosRes.value());

  private readonly touristLocationsRes = httpResource<TouristLocation[]>(() => '/api/tourist-locations', {
    defaultValue: [],
  });
  readonly touristLocations = computed(() => this.touristLocationsRes.value());

  provinceById(id: string): Province | undefined {
    return this.provinces().find((province) => province.id === id) ?? this.provinces()[0];
  }
}

export function toAttractionItems(list: Attraction[]): ViewableItem[] {
  return list.map((item, index) => ({
    ...item,
    type: 'attraction',
    price: index === 0 ? 120000 : 80000,
  }));
}

export function toHotelItems(list: Hotel[]): ViewableItem[] {
  return list.map((item) => ({
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

export function toActivityItems(list: Activity[]): ViewableItem[] {
  return list.map((item) => ({ ...item, type: 'activity' }));
}

export function toVehicleItems(list: Vehicle[]): ViewableItem[] {
  return list.map((item) => ({
    id: item.id,
    type: 'vehicle',
    name: item.name,
    image: item.image,
    price: item.pricePerDay,
    description: item.specs,
    specs: item.specs,
    rating: item.rating,
    vehicleType: item.type,
  }));
}
