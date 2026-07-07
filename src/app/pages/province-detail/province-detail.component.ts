import { Component, computed, effect, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  LucideArrowRight,
  LucideBadgePercent,
  LucideBike,
  LucideCar,
  LucideCheckCircle2,
  LucideChevronDown,
  LucideChevronLeft,
  LucideChevronRight,
  LucideCompass,
  LucideHeadset,
  LucideHeart,
  LucideNavigation2,
  LucideShieldCheck,
  LucideSparkles,
  LucideStar,
} from '@lucide/angular';
import { activitiesByProvince, attractionsByProvince, hotelsByProvince, provinces, vehicles } from '@/data';
import { getProvinceHero } from '@/constants/provinceHero';
import type { ViewableItem } from '@/types';
import { AuthService } from '@/services/auth.service';
import { CartService } from '@/services/cart.service';
import { CatalogService } from '@/services/catalog.service';
import { I18nService } from '@/services/i18n.service';
import { ToastService } from '@/services/toast.service';
import { UiStateService } from '@/services/ui-state.service';
import { RevealDirective } from '@/directives/reveal.directive';

type ActivityCategory = 'all' | 'heritage' | 'culinary' | 'nature' | 'adventure';
type PriceTier = 'all' | 'under-200k' | '200k-500k' | 'over-500k';

interface DetailReview {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
}

const SEED_REVIEWS: DetailReview[] = [
  { id: 'rv1', author: 'Ngọc Anh', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80', rating: 5, date: '2026-06-21', comment: 'Dịch vụ chuẩn chỉnh, khách sạn view sông tuyệt đẹp, sẽ quay lại VietCharm lần nữa!' },
  { id: 'rv2', author: 'Minh Đức', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80', rating: 5, date: '2026-06-17', comment: 'Đặt combo tiết kiệm hơn hẳn, xe giao tận nơi đúng giờ, hoạt động rất đáng trải nghiệm.' },
  { id: 'rv3', author: 'Sarah L.', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80', rating: 4, date: '2026-06-11', comment: 'Smooth booking flow and lovely heritage stays. The lantern night tour was magical!' },
];

@Component({
  selector: 'app-province-detail-page',
  standalone: true,
  imports: [
    DecimalPipe,
    FormsModule,
    RouterLink,
    RevealDirective,
    LucideArrowRight,
    LucideBadgePercent,
    LucideBike,
    LucideCar,
    LucideCheckCircle2,
    LucideChevronDown,
    LucideChevronLeft,
    LucideChevronRight,
    LucideCompass,
    LucideHeadset,
    LucideHeart,
    LucideNavigation2,
    LucideShieldCheck,
    LucideSparkles,
    LucideStar,
  ],
  templateUrl: './province-detail.component.html',
  styleUrl: './province-detail.component.css',
})
export class ProvinceDetailComponent {
  private readonly route = inject(ActivatedRoute);
  readonly i18n = inject(I18nService);
  readonly ui = inject(UiStateService);
  readonly cart = inject(CartService);
  readonly auth = inject(AuthService);
  readonly catalog = inject(CatalogService);
  private readonly toast = inject(ToastService);

  private readonly params = toSignal(this.route.paramMap);
  readonly provinceId = computed(() => this.params()?.get('provinceId') ?? 'quang-nam');
  readonly province = computed(() => provinces.find((p) => p.id === this.provinceId()));
  readonly hero = computed(() => getProvinceHero(this.provinceId()));
  readonly t = computed(() => this.i18n.dictionary());

  readonly activeSlide = signal(0);
  readonly heroSlides = computed(() => {
    const gallery = [
      this.hero().image,
      ...this.attractions().map((a) => a.image),
      ...this.hotels().map((h) => h.image),
    ];
    return Array.from(new Set(gallery)).slice(0, 4);
  });

  readonly today = new Date().toISOString().split('T')[0];
  readonly searchInput = signal('');
  readonly query = signal('');
  readonly checkIn = signal(this.offset(1));
  readonly checkOut = signal(this.offset(5));
  readonly guests = signal(1);
  readonly rooms = signal(1);
  readonly showGuests = signal(false);
  readonly minCheckOut = computed(() => {
    const d = new Date(this.checkIn());
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });

  readonly category = signal<ActivityCategory>('all');
  readonly priceTier = signal<PriceTier>('all');

  readonly revRating = signal(5);
  readonly revComment = signal('');
  readonly subEmail = signal('');
  readonly subscribed = signal(false);

  readonly attractions = computed(() => attractionsByProvince[this.provinceId()] ?? []);
  readonly hotels = computed(() => hotelsByProvince[this.provinceId()] ?? []);
  readonly activities = computed(() => activitiesByProvince[this.provinceId()] ?? []);

  readonly provinceReviewId = computed(() => `province-${this.provinceId()}`);
  readonly reviews = computed<DetailReview[]>(() => {
    const submitted = this.catalog.reviewsForItem(this.provinceReviewId()).map((r) => ({
      id: r.id,
      author: r.author,
      avatar: r.avatar,
      rating: r.rating,
      date: r.date,
      comment: r.comment,
    }));
    return [...submitted, ...SEED_REVIEWS];
  });
  readonly canReview = computed(() => {
    const user = this.auth.currentUser();
    if (!user) return false;
    const ids = [...this.attractions().map((a) => a.id), ...this.hotels().map((h) => h.id), ...this.activities().map((a) => a.id)];
    return this.catalog.canReviewAny(ids, user.email);
  });

  readonly filteredHotels = computed(() => {
    const q = this.query();
    if (!q) return this.hotels();
    return this.hotels().filter((h) => `${h.name} ${h.description}`.toLowerCase().includes(q));
  });
  readonly filteredVehicles = computed(() => {
    const q = this.query();
    if (!q) return vehicles;
    return vehicles.filter((v) => `${v.name} ${v.specs}`.toLowerCase().includes(q));
  });
  readonly filteredActivities = computed(() => {
    const q = this.query();
    const cat = this.category();
    const tier = this.priceTier();
    return this.activities().filter((act) => {
      let catType: ActivityCategory = 'heritage';
      if (act.id.includes('cooking') || act.id.includes('food')) catType = 'culinary';
      else if (act.id.includes('bike') || act.id.includes('village') || act.id.includes('pottery')) catType = 'nature';
      else if (act.id.includes('cham') || act.id.includes('island') || act.id.includes('adventure')) catType = 'adventure';
      const matchCat = cat === 'all' || catType === cat;
      let pt: PriceTier = 'under-200k';
      if (act.price > 500000) pt = 'over-500k';
      else if (act.price >= 200000) pt = '200k-500k';
      const matchPrice = tier === 'all' || pt === tier;
      const matchSearch = !q || `${act.name} ${act.description}`.toLowerCase().includes(q);
      return matchCat && matchPrice && matchSearch;
    });
  });

  constructor() {
    effect(() => this.ui.selectedProvinceId.set(this.provinceId()));
    effect(() => {
      this.provinceId();
      this.activeSlide.set(0);
    });
  }

  nextSlide(): void {
    this.activeSlide.update((i) => (i + 1) % this.heroSlides().length);
  }

  prevSlide(): void {
    this.activeSlide.update((i) => (i - 1 + this.heroSlides().length) % this.heroSlides().length);
  }

  goToSlide(index: number): void {
    this.activeSlide.set(index);
  }

  private offset(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  }

  max(a: number, b: number): number {
    return Math.max(a, b);
  }
  min(a: number, b: number): number {
    return Math.min(a, b);
  }

  stars(n: number): string {
    return '★'.repeat(n);
  }

  setCheckIn(value: string): void {
    this.checkIn.set(value);
    if (this.checkOut() <= value) {
      const d = new Date(value);
      d.setDate(d.getDate() + 1);
      this.checkOut.set(d.toISOString().split('T')[0]);
    }
  }

  applySearch(): void {
    this.query.set(this.searchInput().trim().toLowerCase());
    this.scrollTo('hotels-section');
  }

  scrollTo(id: string): void {
    if (typeof document !== 'undefined') document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  usps(): Array<{ title: string; subtitle: string }> {
    const t = this.t();
    return [
      { title: t.uspsTitle1, subtitle: t.uspsSub1 },
      { title: t.uspsTitle2, subtitle: t.uspsSub2 },
      { title: t.uspsTitle3, subtitle: t.uspsSub3 },
      { title: t.uspsTitle4, subtitle: t.uspsSub4 },
    ];
  }

  categoryOptions(): Array<{ id: ActivityCategory; label: string }> {
    const vi = this.i18n.isVi();
    return [
      { id: 'all', label: vi ? 'Tất cả' : 'All' },
      { id: 'heritage', label: vi ? 'Di sản & Văn hóa' : 'Heritage' },
      { id: 'culinary', label: vi ? 'Lớp học Ẩm thực' : 'Culinary' },
      { id: 'nature', label: vi ? 'Sinh thái & Làng quê' : 'Eco-Nature' },
      { id: 'adventure', label: vi ? 'Phiêu lưu & Lặn biển' : 'Adventure' },
    ];
  }

  tierOptions(): Array<{ id: PriceTier; label: string }> {
    const vi = this.i18n.isVi();
    return [
      { id: 'all', label: vi ? 'Mọi ngân sách' : 'Any Budget' },
      { id: 'under-200k', label: vi ? 'Dưới 200,000đ' : 'Under 200k' },
      { id: '200k-500k', label: vi ? '200,000đ - 500,000đ' : '200k - 500k' },
      { id: 'over-500k', label: vi ? 'Trên 500,000đ' : 'Over 500k' },
    ];
  }

  attractionItem(spot: { id: string; name: string; image: string; description: string }): ViewableItem {
    return { id: spot.id, type: 'nearby-place', name: spot.name, image: spot.image, price: 0, description: spot.description };
  }
  hotelItem(h: { id: string; name: string; image: string; pricePerNight: number; description: string }): ViewableItem {
    return { id: h.id, type: 'hotel', name: h.name, image: h.image, price: h.pricePerNight, description: h.description };
  }
  vehicleItem(v: { id: string; name: string; image: string; pricePerDay: number; specs: string }): ViewableItem {
    return { id: v.id, type: 'vehicle', name: v.name, image: v.image, price: v.pricePerDay, description: v.specs };
  }
  activityItem(a: { id: string; name: string; image: string; price: number; description: string }): ViewableItem {
    return { id: a.id, type: 'activity', name: a.name, image: a.image, price: a.price, description: a.description };
  }

  addReview(): void {
    const comment = this.revComment().trim();
    if (!comment) return;
    this.ui.requireAuth(() => {
      const user = this.auth.currentUser()!;
      if (!this.canReview()) {
        this.toast.showToast({
          type: 'info',
          title: this.i18n.isVi() ? 'Chưa thể đánh giá' : 'Review not available yet',
          message: this.i18n.isVi()
            ? 'Bạn cần đặt và thanh toán thành công một dịch vụ tại đây trước khi viết đánh giá.'
            : 'You need a confirmed booking for a service here before you can leave a review.',
        });
        return;
      }
      const milestoneVoucher = this.catalog.addReview({
        id: `rev-${Date.now()}`,
        itemId: this.provinceReviewId(),
        itemName: this.province()?.name ?? this.provinceId(),
        itemImage: this.hero().image,
        userEmail: user.email,
        author: user.fullName,
        avatar: user.avatar,
        rating: this.revRating(),
        date: new Date().toISOString().split('T')[0],
        comment,
      });
      this.revComment.set('');
      this.revRating.set(5);
      if (milestoneVoucher) {
        this.toast.showToast({
          type: 'success',
          title: this.i18n.isVi() ? '🎉 Cảm ơn bạn đã tích cực đánh giá!' : '🎉 Thanks for being an active reviewer!',
          message: this.i18n.isVi()
            ? `Bạn nhận được mã ${milestoneVoucher.code} giảm ${milestoneVoucher.value}% cho lần đặt tiếp theo.`
            : `You earned code ${milestoneVoucher.code} for ${milestoneVoucher.value}% off your next booking.`,
          durationMs: 10000,
        });
      }
    }, this.i18n.isVi() ? 'Đăng nhập để viết đánh giá.' : 'Sign in to write a review.');
  }

  subscribe(): void {
    if (!this.subEmail().trim()) return;
    this.subscribed.set(true);
    this.subEmail.set('');
    setTimeout(() => this.subscribed.set(false), 4000);
  }
}
