import { Injectable, computed, inject } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type {
  HandbookEntry,
  NearbyPlace,
  NearbyPlaceReview,
  SupportTopic,
} from '@/types';

@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly http = inject(HttpClient);

  private readonly handbookResource = httpResource<HandbookEntry[]>(() => '/api/handbook-entries', {
    defaultValue: [],
  });
  readonly handbookEntries = computed(() => this.handbookResource.value());
  readonly handbookLoading = computed(() => this.handbookResource.isLoading());

  private readonly nearbyPlacesResource = httpResource<NearbyPlace[]>(() => '/api/nearby-places', {
    defaultValue: [],
  });
  readonly nearbyPlaces = computed(() => this.nearbyPlacesResource.value());
  readonly nearbyPlacesLoading = computed(() => this.nearbyPlacesResource.isLoading());

  private readonly supportTopicsResource = httpResource<SupportTopic[]>(() => '/api/support-pages', {
    defaultValue: [],
  });
  readonly supportTopics = computed(() => this.supportTopicsResource.value());
  readonly supportTopicsLoading = computed(() => this.supportTopicsResource.isLoading());

  async addNearbyReview(placeId: string, review: NearbyPlaceReview): Promise<void> {
    await firstValueFrom(this.http.post(`/api/nearby-places/${placeId}/reviews`, review));
    this.nearbyPlacesResource.reload();
  }
}
