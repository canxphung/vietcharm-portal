import {
  afterNextRender,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { DecimalPipe, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  LucideArrowLeft,
  LucideCalendar,
  LucideCheck,
  LucideCheckCircle,
  LucideChevronLeft,
  LucideChevronRight,
  LucideClock,
  LucideCreditCard,
  LucideHeart,
  LucideInfo,
  LucideLandmark,
  LucideMapPin,
  LucideMaximize2,
  LucideMessageSquare,
  LucideNavigation,
  LucideShieldCheck,
  LucideShoppingCart,
  LucideSparkles,
  LucideStar,
  LucideShare2,
  LucideX,
} from '@lucide/angular';
import type { BookingCartItem, ViewableItem } from '@/types';
import { AuthService } from '@/services/auth.service';
import { CartService } from '@/services/cart.service';
import { CatalogDataService } from '@/services/catalog-data';
import { CatalogService } from '@/services/catalog.service';
import { I18nService } from '@/services/i18n.service';
import { ToastService } from '@/services/toast.service';
import { UiStateService } from '@/services/ui-state.service';

interface UserReview {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
}

type PackageKey = 'standard' | 'premium' | 'luxury';

const MOCK_REVIEWS: UserReview[] = [
  {
    id: '1',
    author: 'Nguyễn Văn Hải',
    avatar:
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    date: '2026-06-21',
    comment: 'Dịch vụ vô cùng đẳng cấp và chuyên nghiệp. Nhân viên chu đáo, nhiệt tình.',
  },
  {
    id: '2',
    author: 'Trần Thị Mai',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    date: '2026-06-19',
    comment: 'Trải nghiệm tuyệt vời vượt ngoài mong đợi! Rất xứng đáng số tiền bỏ ra.',
  },
  {
    id: '3',
    author: 'David Miller',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    rating: 4,
    date: '2026-06-15',
    comment: 'Excellent service and great attention to detail. Highly recommend to everyone!',
  },
];

const GALLERY_FALLBACKS: Record<string, string[]> = {
  hotel: [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=900&q=80',
  ],
  'vehicle-motorbike': [
    'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1524591652733-73fa1ae7b5ee?auto=format&fit=crop&w=900&q=80',
  ],
  'vehicle-car': [
    'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80',
  ],
  activity: [
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=900&q=80',
  ],
  tour: [
    'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1559592443-7f87a79f6f82?auto=format&fit=crop&w=900&q=80',
  ],
  'nearby-place': [
    'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=900&q=80',
  ],
};

function isoOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

@Component({
  selector: 'app-item-detail-page',
  standalone: true,
  imports: [
    DecimalPipe,
    FormsModule,
    LucideArrowLeft,
    LucideCalendar,
    LucideCheck,
    LucideCheckCircle,
    LucideChevronLeft,
    LucideChevronRight,
    LucideClock,
    LucideCreditCard,
    LucideHeart,
    LucideInfo,
    LucideLandmark,
    LucideMapPin,
    LucideMaximize2,
    LucideMessageSquare,
    LucideNavigation,
    LucideShieldCheck,
    LucideShoppingCart,
    LucideSparkles,
    LucideStar,
    LucideShare2,
    LucideX,
  ],
  templateUrl: './item-detail.component.html',
  styleUrl: './item-detail.component.css',
})
export class ItemDetailComponent {
  private readonly catalogData = inject(CatalogDataService);
  readonly today = isoOffset(0);
  readonly selectedDate = signal(isoOffset(1));
  readonly checkInDate = signal(isoOffset(1));
  readonly checkOutDate = signal(isoOffset(2));
  readonly selectedPackage = signal<PackageKey>('standard');
  readonly adultsCount = signal(1);
  readonly childrenCount = signal(0);
  readonly roomsCount = signal(1);
  readonly maxRooms = 10;
  readonly successMsg = signal(false);
  readonly rentalLocations = this.catalogData.touristLocations;
  readonly pickupLocationId = signal('dad-airport');
  readonly returnLocationId = signal('dad-airport');

  readonly reviewRating = signal(5);
  readonly reviewComment = signal('');
  readonly lightboxIndex = signal(0);

  readonly isVi = computed(() => this.i18n.isVi());
  readonly reviews = computed<UserReview[]>(() => {
    const item = this.ui.selectedItem();
    if (!item) return [...MOCK_REVIEWS];
    const submitted = this.catalog.reviewsForItem(item.id).map((r) => ({
      id: r.id,
      author: r.author,
      avatar: r.avatar,
      rating: r.rating,
      date: r.date,
      comment: r.comment,
    }));
    return [...submitted, ...MOCK_REVIEWS];
  });
  readonly canReview = computed(() => {
    const item = this.ui.selectedItem();
    const user = this.auth.currentUser();
    if (!item || !user) return false;
    return this.catalog.canReview(item.id, user.email);
  });
  readonly minCheckout = computed(() => {
    const d = new Date(this.checkInDate());
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });

  private lastItemId: string | null = null;
  private readonly reviewTextarea = viewChild<ElementRef<HTMLTextAreaElement>>('reviewTextarea');
  private readonly galleryDialog = viewChild<ElementRef<HTMLDialogElement>>('galleryDialog');

  constructor(
    readonly ui: UiStateService,
    readonly i18n: I18nService,
    readonly cart: CartService,
    private readonly auth: AuthService,
    private readonly catalog: CatalogService,
    private readonly toast: ToastService,
    private readonly router: Router,
    private readonly location: Location,
  ) {
    // Landed here directly (e.g. page refresh) with no item selected: send back to browsing.
    if (!this.ui.selectedItem()) {
      void this.router.navigateByUrl('/discover');
    }

    // Reset booking state whenever a different item is opened.
    effect(() => {
      const item = this.ui.selectedItem();
      if (item && item.id !== this.lastItemId) {
        this.lastItemId = item.id;
        this.selectedDate.set(isoOffset(1));
        this.checkInDate.set(isoOffset(1));
        this.checkOutDate.set(isoOffset(2));
        this.selectedPackage.set('standard');
        this.adultsCount.set(1);
        this.childrenCount.set(0);
        this.roomsCount.set(1);
        this.successMsg.set(false);
        this.pickupLocationId.set('dad-airport');
        this.returnLocationId.set('dad-airport');
        this.lightboxIndex.set(0);
      }
    });

    // Arrived here to write a review: jump straight to the review form instead of making the user scroll.
    if (this.ui.consumeScrollToReviews()) {
      afterNextRender(() => {
        // Run after the router's own "scroll to top" restoration settles, so our scroll wins the race.
        setTimeout(() => {
          document
            .getElementById('write-review-block')
            ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          this.reviewTextarea()?.nativeElement.focus({ preventScroll: true });
        }, 80);
      });
    }
  }

  max(a: number, b: number): number {
    return Math.max(a, b);
  }

  stars(n: number): string {
    return '★'.repeat(n);
  }

  back(): void {
    this.location.back();
  }

  typeLabel(item: ViewableItem): string {
    const vi = this.isVi();
    switch (item.type) {
      case 'hotel':
        return vi ? 'Khách sạn / Resort' : 'Hotel / Resort';
      case 'activity':
        return vi ? 'Hoạt động trải nghiệm' : 'Excursion Activity';
      case 'vehicle':
        return vi ? 'Phương tiện di chuyển' : 'Transport Rental';
      case 'tour':
        return vi ? 'Combo Tour Trọn Gói' : 'Heritage Tour Combo';
      case 'nearby-place':
        return vi ? 'Địa điểm tham quan lân cận' : 'Nearby Landmark';
      default:
        return item.type;
    }
  }

  isActivityLike(item: ViewableItem): boolean {
    return item.type === 'activity' || item.type === 'tour';
  }

  isBookable(item: ViewableItem): boolean {
    return (
      item.price > 0 &&
      (item.type === 'hotel' || item.type === 'vehicle' || this.isActivityLike(item))
    );
  }

  private modifier(): number {
    const p = this.selectedPackage();
    const persistedModifier = this.ui
      .selectedItem()
      ?.rentalPackages?.find((pkg) => pkg.key === p)?.priceModifier;
    if (persistedModifier) return persistedModifier;
    return p === 'premium' ? 1.3 : p === 'luxury' ? 1.6 : 1.0;
  }

  pricePerUnit(item: ViewableItem): number {
    return Math.round(item.price * this.modifier());
  }

  childPricePerUnit(item: ViewableItem): number {
    return Math.round(item.price * this.modifier() * 0.7);
  }

  nights(): number {
    const start = new Date(this.checkInDate());
    const end = new Date(this.checkOutDate());
    const diff = end.getTime() - start.getTime();
    if (isNaN(diff) || diff <= 0) return 1;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 1;
  }

  private effectiveQuantity(item: ViewableItem): number {
    if (item.type === 'hotel') return this.nights() * this.roomsCount();
    if (item.type === 'vehicle') return this.nights();
    return 1;
  }

  total(item: ViewableItem): number {
    if (this.isActivityLike(item)) {
      return Math.round(
        this.pricePerUnit(item) * this.adultsCount() +
          this.childPricePerUnit(item) * this.childrenCount(),
      );
    }
    return Math.round(this.pricePerUnit(item) * this.effectiveQuantity(item));
  }

  packages(): Array<{ key: PackageKey; name: string; desc: string; modifierLabel: string }> {
    const vi = this.isVi();
    const item = this.ui.selectedItem();
    if (item?.type === 'vehicle') {
      if (item.rentalPackages?.length) {
        return item.rentalPackages.map((pkg) => ({
          key: pkg.key,
          modifierLabel:
            pkg.priceModifier === 1 ? '100%' : `+${Math.round((pkg.priceModifier - 1) * 100)}%`,
          name: vi ? pkg.nameVi : pkg.nameEn,
          desc: vi ? pkg.descriptionVi : pkg.descriptionEn,
        }));
      }
      const motorbike = this.isMotorbike(item);
      return [
        {
          key: 'standard',
          modifierLabel: '100%',
          name: vi ? 'Gói Tự Lái Tiêu Chuẩn' : 'Standard Self-drive',
          desc: motorbike
            ? vi
              ? 'Xe đã kiểm tra, 2 mũ bảo hiểm, áo mưa, khóa chống trộm và bảo hiểm bắt buộc.'
              : 'Inspected bike, 2 helmets, raincoats, anti-theft lock, and compulsory insurance.'
            : vi
              ? 'Xe đã kiểm tra kỹ thuật, bảo hiểm bắt buộc và định mức 200 km/ngày.'
              : 'Fully inspected car, compulsory insurance, and 200 km/day allowance.',
        },
        {
          key: 'premium',
          modifierLabel: '+30%',
          name: vi ? 'Gói Giao Nhận Tận Nơi' : 'Door-to-door Delivery',
          desc: motorbike
            ? vi
              ? 'Giao và nhận xe trong Hội An, kèm giá đỡ điện thoại và hỗ trợ cứu hộ ưu tiên.'
              : 'Hoi An delivery and collection, phone holder, and priority roadside support.'
            : vi
              ? 'Giao và nhận xe tận nơi trong Hội An, thêm tài xế phụ và ghế trẻ em theo yêu cầu.'
              : 'Hoi An door-to-door delivery, an additional driver, and a child seat on request.',
        },
        {
          key: 'luxury',
          modifierLabel: '+60%',
          name: vi ? 'Gói An Tâm Toàn Diện' : 'Complete Protection',
          desc: vi
            ? 'Bảo vệ thiệt hại mở rộng, giảm mức cọc, cứu hộ 24/7 và ưu tiên đổi xe khi có sự cố.'
            : 'Extended damage cover, reduced deposit, 24/7 roadside assistance, and priority replacement vehicle.',
        },
      ];
    }
    return [
      {
        key: 'standard',
        modifierLabel: '100%',
        name: vi ? 'Gói Tiêu Chuẩn (Cơ bản)' : 'Standard Package',
        desc: vi
          ? 'Dịch vụ tham quan cơ bản đầy đủ tiện ích và bảo hiểm du lịch.'
          : 'Full standard admission/service and complimentary travel insurance.',
      },
      {
        key: 'premium',
        modifierLabel: '+30%',
        name: vi ? 'Gói Cao Cấp (Premium VIP)' : 'Premium VIP Experience',
        desc: vi
          ? 'Có đưa đón riêng biệt, lối đi VIP không chờ đợi, tặng voucher ẩm thực 200k.'
          : 'Private pickup, VIP fast-track entry, 200k VND dining voucher included.',
      },
      {
        key: 'luxury',
        modifierLabel: '+60%',
        name: vi ? 'Gói Sang Trọng (All-Inclusive)' : 'Luxury All-Inclusive',
        desc: vi
          ? 'Dịch vụ thượng lưu trọn gói: HDV riêng, ăn ngự thiện cung đình, tặng đèn lồng lụa cao cấp.'
          : 'Royal package: Private local guide, luxury traditional dinner, and handmade silk gift.',
      },
    ];
  }

  cartKey(item: ViewableItem): string {
    const dateStr =
      item.type === 'hotel' || item.type === 'vehicle'
        ? `${this.checkInDate()} -> ${this.checkOutDate()}`
        : this.selectedDate();
    return [
      item.id,
      this.selectedPackage(),
      dateStr,
      this.isActivityLike(item)
        ? `adults-${this.adultsCount()}`
        : `qty-${this.effectiveQuantity(item)}`,
      this.isActivityLike(item)
        ? `children-${this.childrenCount()}`
        : item.type === 'hotel'
          ? `rooms-${this.roomsCount()}`
          : 'single-vehicle',
    ].join('__');
  }

  locationName(id: string): string {
    return this.rentalLocations().find((l) => l.id === id)?.name ?? id;
  }

  private detailsStr(item: ViewableItem): string {
    const vi = this.isVi();
    const pkg = this.packages().find((p) => p.key === this.selectedPackage())!.name;
    const dateStr =
      item.type === 'hotel' || item.type === 'vehicle'
        ? `${this.checkInDate()} -> ${this.checkOutDate()}`
        : this.selectedDate();
    if (this.isActivityLike(item)) {
      return vi
        ? `Gói: ${pkg} | Ngày: ${dateStr} | Vé: ${this.adultsCount()} Người lớn, ${this.childrenCount()} Trẻ em`
        : `Package: ${pkg} | Date: ${dateStr} | Tickets: ${this.adultsCount()} Adults, ${this.childrenCount()} Children`;
    }
    if (item.type === 'vehicle') {
      const pickupName = this.locationName(this.pickupLocationId());
      const returnName = this.locationName(this.returnLocationId());
      return vi
        ? `Gói: ${pkg} | Ngày: ${dateStr} | Số ngày thuê: ${this.nights()} | Nhận xe: ${pickupName} | Trả xe: ${returnName}`
        : `Package: ${pkg} | Date: ${dateStr} | Rental days: ${this.nights()} | Pickup: ${pickupName} | Return: ${returnName}`;
    }
    const tail = vi
      ? `Phòng: ${this.roomsCount()} | Đêm: ${this.nights()}`
      : `Rooms: ${this.roomsCount()} | Nights: ${this.nights()}`;
    return vi
      ? `Gói: ${pkg} | Ngày: ${dateStr} | ${tail}`
      : `Package: ${pkg} | Date: ${dateStr} | ${tail}`;
  }

  setCheckIn(value: string): void {
    this.checkInDate.set(value);
    const next = new Date(value);
    next.setDate(next.getDate() + 1);
    const nextStr = next.toISOString().split('T')[0];
    if (this.checkOutDate() <= value) this.checkOutDate.set(nextStr);
  }

  setCheckOut(value: string): void {
    if (value > this.checkInDate()) this.checkOutDate.set(value);
  }

  adjustRooms(change: number): void {
    this.roomsCount.update((current) => Math.max(1, Math.min(this.maxRooms, current + change)));
  }

  private addSelection(item: ViewableItem): void {
    const cartType: BookingCartItem['type'] =
      item.type === 'hotel' || item.type === 'vehicle' ? item.type : 'activity';
    const serviceDate =
      item.type === 'hotel' || item.type === 'vehicle' ? this.checkInDate() : this.selectedDate();
    this.cart.addItem({
      cartKey: this.cartKey(item),
      id: item.id,
      type: cartType,
      name: item.type === 'tour' ? `[Combo] ${item.name}` : item.name,
      price: this.total(item),
      quantity: 1,
      image: item.image,
      details: this.detailsStr(item),
      serviceDate,
      packageKey: this.selectedPackage(),
      basePrice: Math.round(this.total(item) / this.modifier()),
    });
    this.successMsg.set(true);
    setTimeout(() => this.successMsg.set(false), 3000);
  }

  handleAdd(item: ViewableItem): void {
    if (!this.isBookable(item)) return;
    this.ui.requireAuth(
      () => this.addSelection(item),
      this.isVi() ? 'Đăng nhập để thêm dịch vụ vào giỏ.' : 'Sign in to add services to your cart.',
    );
  }

  checkout(item: ViewableItem): void {
    this.ui.requireAuth(
      () => {
        if (!this.cart.isInCart(this.cartKey(item))) this.addSelection(item);
        void this.router.navigateByUrl('/checkout');
      },
      this.isVi() ? 'Đăng nhập để thanh toán.' : 'Sign in to checkout.',
    );
  }

  toggleFavorite(item: ViewableItem): void {
    const wasFav = this.ui.isFavorite(item.id);
    this.ui.toggleFavorite(item);
    this.toast.showToast({
      type: wasFav ? 'info' : 'success',
      title: wasFav
        ? this.isVi()
          ? 'Đã bỏ yêu thích'
          : 'Removed from favorites'
        : this.isVi()
          ? 'Đã lưu yêu thích'
          : 'Saved to favorites',
      message: item.name,
    });
  }

  async share(item: ViewableItem): Promise<void> {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    try {
      const nav = navigator as Navigator & { share?: (data: object) => Promise<void> };
      if (nav.share) {
        await nav.share({ title: item.name, text: item.description ?? '', url });
        this.toast.showToast({
          type: 'success',
          title: this.isVi() ? 'Đã mở chia sẻ' : 'Share sheet opened',
          message: item.name,
        });
        return;
      }
      await navigator.clipboard.writeText(url);
      this.toast.showToast({
        type: 'success',
        title: this.isVi() ? 'Đã sao chép liên kết' : 'Link copied',
        message: item.name,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      this.toast.showToast({
        type: 'error',
        title: this.isVi() ? 'Chưa thể chia sẻ' : 'Could not share',
        message: this.isVi() ? 'Vui lòng thử lại sau.' : 'Please try again.',
      });
    }
  }

  addReview(item: ViewableItem): void {
    const comment = this.reviewComment().trim();
    if (!comment) return;
    this.ui.requireAuth(
      async () => {
        const user = this.auth.currentUser()!;
        if (!this.catalog.canReview(item.id, user.email)) {
          this.toast.showToast({
            type: 'info',
            title: this.isVi() ? 'Chưa thể đánh giá' : 'Review not available yet',
            message: this.isVi()
              ? 'Bạn cần đặt và thanh toán thành công dịch vụ này trước khi viết đánh giá.'
              : 'You need a confirmed booking for this service before you can leave a review.',
          });
          return;
        }
        const milestoneVoucher = await this.catalog.addReview({
          id: `review-details-${Date.now()}`,
          itemId: item.id,
          itemName: item.name,
          itemImage: item.image,
          userEmail: user.email,
          author: user.fullName,
          avatar: user.avatar,
          rating: this.reviewRating(),
          date: new Date().toISOString().split('T')[0],
          comment,
        });
        this.reviewComment.set('');
        this.reviewRating.set(5);
        if (milestoneVoucher) {
          this.toast.showToast({
            type: 'success',
            title: this.isVi()
              ? '🎉 Cảm ơn bạn đã tích cực đánh giá!'
              : '🎉 Thanks for being an active reviewer!',
            message: this.isVi()
              ? `Bạn nhận được mã ${milestoneVoucher.code} giảm ${milestoneVoucher.value}% cho lần đặt tiếp theo.`
              : `You earned code ${milestoneVoucher.code} for ${milestoneVoucher.value}% off your next booking.`,
            durationMs: 10000,
          });
        }
      },
      this.isVi() ? 'Đăng nhập để viết đánh giá.' : 'Sign in to write a review.',
    );
  }

  gallery(item: ViewableItem): Array<{ src: string; label: string }> {
    const galleryKey =
      item.type === 'vehicle'
        ? `vehicle-${this.isMotorbike(item) ? 'motorbike' : 'car'}`
        : item.type;
    const fallback = GALLERY_FALLBACKS[galleryKey] ?? GALLERY_FALLBACKS['activity'];
    const galleryImages = item.gallery?.length ? item.gallery : fallback;
    const labels =
      item.type === 'vehicle'
        ? this.isVi()
          ? ['Góc nhìn chính', 'Thiết kế xe', 'Trang bị đi kèm', 'Trải nghiệm vận hành']
          : ['Main view', 'Vehicle design', 'Included equipment', 'Driving experience']
        : this.isVi()
          ? [
              'Góc nhìn chính',
              'Không gian trải nghiệm',
              'Chi tiết đáng chú ý',
              'Khoảnh khắc nên thử',
            ]
          : ['Main view', 'Experience space', 'Notable detail', 'Worth-trying moment'];
    const uniqueImages = galleryImages.filter((src) => src !== item.image);
    return [item.image, ...uniqueImages].slice(0, 4).map((src, i) => ({ src, label: labels[i] }));
  }

  activeGalleryImage(item: ViewableItem): { src: string; label: string } {
    const images = this.gallery(item);
    return images[this.lightboxIndex()] ?? images[0];
  }

  openGallery(index: number): void {
    this.lightboxIndex.set(index);
    const dialog = this.galleryDialog()?.nativeElement;
    if (dialog && !dialog.open) dialog.showModal();
  }

  closeGallery(): void {
    const dialog = this.galleryDialog()?.nativeElement;
    if (dialog?.open) dialog.close();
  }

  moveGallery(item: ViewableItem, step: number): void {
    const total = this.gallery(item).length;
    if (total < 2) return;
    this.lightboxIndex.update((index) => (index + step + total) % total);
  }

  onGalleryKeydown(event: KeyboardEvent, item: ViewableItem): void {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.moveGallery(item, -1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.moveGallery(item, 1);
    }
  }

  onGalleryCancel(event: Event): void {
    event.preventDefault();
    this.closeGallery();
  }

  onGalleryDialogClick(event: MouseEvent): void {
    if (event.target === this.galleryDialog()?.nativeElement) this.closeGallery();
  }

  highlights(item: ViewableItem): string[] {
    if (item.highlights?.length) return item.highlights;
    const vi = this.isVi();
    if (item.type === 'vehicle') {
      return [
        vi
          ? 'Xe được kiểm tra phanh, lốp, đèn và nhiên liệu trước khi bàn giao.'
          : 'Brakes, tires, lights, and fuel are checked before every handover.',
        vi
          ? 'Điều khoản tiền cọc, nhiên liệu và giới hạn quãng đường được thông báo rõ ràng.'
          : 'Deposit, fuel, and mileage terms are clearly disclosed.',
        vi
          ? 'Hỗ trợ cứu hộ 24/7 và đổi xe nếu phát sinh lỗi kỹ thuật từ nhà cung cấp.'
          : '24/7 roadside assistance and replacement for provider-side technical faults.',
        vi
          ? 'Miễn phí thay đổi thời gian nhận xe trước 24 giờ.'
          : 'Free pickup-time changes up to 24 hours in advance.',
      ];
    }
    return [
      vi
        ? 'Đội ngũ hỗ trợ chuyên nghiệp sẵn sàng 24/7 phục vụ quý khách.'
        : '24/7 Professional support staff ready to assist you.',
      vi
        ? 'Bao gồm bảo hiểm lữ hành toàn diện theo chuẩn quốc tế.'
        : 'Comprehensive international standard travel insurance included.',
      vi
        ? 'Hỗ trợ thay đổi lịch trình hoặc hủy dịch vụ miễn phí trước 24 giờ.'
        : 'Free rescheduling or cancellation up to 24 hours in advance.',
      vi
        ? 'Cam kết chất lượng dịch vụ chính hãng VietCharm uy tín hàng đầu.'
        : 'VietCharm certified genuine high-quality service guaranteed.',
    ];
  }

  quickFacts(item: ViewableItem): Array<{ icon: string; label: string; value: string }> {
    const vi = this.isVi();
    if (item.type === 'vehicle') {
      return [
        {
          icon: 'clock',
          label: vi ? 'Thời gian thuê' : 'Rental duration',
          value: vi ? `${this.nights()} ngày, có thể gia hạn` : `${this.nights()} days, extendable`,
        },
        {
          icon: 'map',
          label: vi ? 'Giao nhận xe' : 'Pickup & return',
          value: vi ? 'Chọn điểm nhận và trả linh hoạt' : 'Flexible pickup and return points',
        },
        {
          icon: 'shield',
          label: vi ? 'Thủ tục' : 'Requirements',
          value: vi ? 'GPLX phù hợp và tiền cọc' : 'Valid license and security deposit',
        },
        {
          icon: 'sparkles',
          label: vi ? 'Bao gồm' : 'Included',
          value: this.isMotorbike(item)
            ? vi
              ? '2 mũ bảo hiểm và khóa xe'
              : '2 helmets and bike lock'
            : vi
              ? 'Bảo hiểm bắt buộc và cứu hộ'
              : 'Compulsory insurance and roadside support',
        },
      ];
    }
    return [
      {
        icon: 'clock',
        label: vi ? 'Thời lượng' : 'Duration',
        value:
          item.type === 'hotel'
            ? vi
              ? `${this.nights()} đêm lưu trú`
              : `${this.nights()} night stay`
            : item.duration || (vi ? 'Linh hoạt theo lịch' : 'Flexible timing'),
      },
      {
        icon: 'map',
        label: vi ? 'Di chuyển' : 'Getting there',
        value: item.distance
          ? vi
            ? `Cách trung tâm ${item.distance}`
            : `${item.distance} from center`
          : vi
            ? 'Dễ ghép vào tuyến đang chọn'
            : 'Easy to add to the selected route',
      },
      {
        icon: 'shield',
        label: vi ? 'Đặt chỗ' : 'Booking',
        value: vi ? 'Xác nhận nhanh, thông tin rõ ràng' : 'Fast confirmation, clear details',
      },
      {
        icon: 'sparkles',
        label: vi ? 'Phù hợp' : 'Best for',
        value:
          item.type === 'vehicle'
            ? vi
              ? 'Tự do đổi điểm dừng'
              : 'Flexible stopovers'
            : item.type === 'hotel'
              ? vi
                ? 'Nghỉ ngơi sau hành trình'
                : 'Reset between route days'
              : vi
                ? 'Thêm điểm nhớ cho chuyến đi'
                : 'A memorable route highlight',
      },
    ];
  }

  paired(item: ViewableItem): string[] {
    const vi = this.isVi();
    if (item.type === 'hotel')
      return [
        vi
          ? 'Thêm xe đưa đón sân bay để ngày đầu nhẹ hơn.'
          : 'Add an airport transfer to make day one easier.',
        vi
          ? 'Ghép một hoạt động buổi chiều gần khách sạn.'
          : 'Pair it with a nearby afternoon experience.',
      ];
    if (item.type === 'vehicle')
      return [
        vi
          ? 'Chọn khách sạn cùng khu để tối ưu giờ nhận xe.'
          : 'Choose a stay in the same area to simplify pickup.',
        vi
          ? 'Thêm điểm dừng ăn uống địa phương trên tuyến.'
          : 'Add a local food stop along the route.',
      ];
    return [
      vi
        ? 'Ghép khách sạn gần điểm khởi hành để không vội buổi sáng.'
        : 'Pair with a stay near the pickup point.',
      vi
        ? 'Thêm xe riêng nếu đi gia đình hoặc nhóm đông.'
        : 'Add private transport for families or larger groups.',
    ];
  }

  isMotorbike(item: ViewableItem): boolean {
    if (item.vehicleType) return item.vehicleType === 'motorbike';
    return /xe máy|motorbike|motorcycle|scooter|yamaha|honda|sirius|vision|airblade|exciter/i.test(
      item.name,
    );
  }
}
