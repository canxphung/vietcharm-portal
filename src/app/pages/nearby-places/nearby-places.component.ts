import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  LucideCompass,
  LucideHeart,
  LucideMapPin,
  LucideMessageSquare,
  LucideNavigation,
  LucideSearch,
  LucideStar,
  LucideX,
} from '@lucide/angular';
import { ContentService } from '@/services/content.service';
import { I18nService } from '@/services/i18n.service';
import { UiStateService } from '@/services/ui-state.service';
import type { NearbyPlace, NearbyPlaceReview, ViewableItem } from '@/types';

@Component({
  selector: 'app-nearby-places-page',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    LucideCompass,
    LucideHeart,
    LucideMapPin,
    LucideMessageSquare,
    LucideNavigation,
    LucideSearch,
    LucideStar,
    LucideX,
  ],
  templateUrl: './nearby-places.component.html',
  styleUrl: './nearby-places.component.css',
})
export class NearbyPlacesComponent {
  private readonly content = inject(ContentService);
  readonly places = this.content.nearbyPlaces;
  readonly loading = this.content.nearbyPlacesLoading;
  readonly query = signal('');
  readonly category = signal('All');
  readonly activeId = signal<string | null>(null);
  readonly imageIdx = signal(0);
  readonly reviewerName = signal('');
  readonly reviewRating = signal(5);
  readonly reviewComment = signal('');
  readonly submittingReview = signal(false);

  readonly active = computed(
    () => this.places().find((place) => place.id === this.activeId()) ?? null,
  );
  readonly filtered = computed(() => {
    const query = this.query().trim().toLowerCase();
    const category = this.category();
    return this.places().filter((place) => {
      const matchesQuery =
        !query ||
        `${place.nameVi} ${place.nameEn} ${place.descriptionVi} ${place.descriptionEn}`
          .toLowerCase()
          .includes(query);
      const matchesCategory =
        category === 'All' || place.categoryVi === category || place.categoryEn === category;
      return matchesQuery && matchesCategory;
    });
  });

  constructor(
    readonly i18n: I18nService,
    readonly ui: UiStateService,
  ) {}

  categories(): Array<{ value: string; label: string }> {
    const vi = this.i18n.isVi();
    return [
      { value: 'All', label: vi ? 'Tất cả địa điểm' : 'All places' },
      { value: 'Di sản văn hóa', label: vi ? 'Di sản văn hóa' : 'Cultural Heritage' },
      { value: 'Bãi biển & Thiên nhiên', label: vi ? 'Bãi biển & Thiên nhiên' : 'Beach & Nature' },
      { value: 'Trải nghiệm sinh thái', label: vi ? 'Trải nghiệm sinh thái' : 'Eco-experience' },
      {
        value: 'Làng nghề truyền thống',
        label: vi ? 'Làng nghề truyền thống' : 'Traditional Craft',
      },
    ];
  }

  stars(rating: number): string {
    return '★'.repeat(rating);
  }

  select(place: NearbyPlace): void {
    this.activeId.set(place.id);
    this.imageIdx.set(0);
  }

  asItem(place: NearbyPlace): ViewableItem {
    const vi = this.i18n.isVi();
    return {
      id: place.id,
      type: 'nearby-place',
      name: vi ? place.nameVi : place.nameEn,
      image: place.images[0] ?? '',
      price: 0,
      description: vi ? place.descriptionVi : place.descriptionEn,
      rating: place.rating,
      reviewsCount: `${place.totalReviews}`,
      duration: place.duration,
      distance: place.distance,
      history: vi ? place.historyVi : place.historyEn,
      coordinates: place.coordinates,
    };
  }

  view(place: NearbyPlace): void {
    this.ui.viewItem(this.asItem(place));
  }

  async addReview(place: NearbyPlace): Promise<void> {
    if (!this.reviewerName().trim() || !this.reviewComment().trim() || this.submittingReview())
      return;
    const review: NearbyPlaceReview = {
      id: `review-${Date.now()}`,
      author: this.reviewerName().trim(),
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      rating: this.reviewRating(),
      date: new Date().toISOString().split('T')[0] ?? '',
      comment: this.reviewComment().trim(),
    };

    this.submittingReview.set(true);
    try {
      await this.content.addNearbyReview(place.id, review);
      this.reviewerName.set('');
      this.reviewComment.set('');
      this.reviewRating.set(5);
    } finally {
      this.submittingReview.set(false);
    }
  }
}
