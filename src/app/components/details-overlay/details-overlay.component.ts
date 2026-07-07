import { Component, computed, effect, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  LucideArrowLeft,
  LucideCalendar,
  LucideCheck,
  LucideCheckCircle,
  LucideChevronRight,
  LucideClock,
  LucideCreditCard,
  LucideHeart,
  LucideInfo,
  LucideLandmark,
  LucideMapPin,
  LucideMessageSquare,
  LucideNavigation,
  LucideShieldCheck,
  LucideShoppingCart,
  LucideSparkles,
  LucideStar,
  LucideShare2,
} from '@lucide/angular';
import type { BookingCartItem, ViewableItem } from '@/types';
import { CartService } from '@/services/cart.service';
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
  { id: '1', author: 'Nguyễn Văn Hải', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80', rating: 5, date: '2026-06-21', comment: 'Dịch vụ vô cùng đẳng cấp và chuyên nghiệp. Nhân viên chu đáo, nhiệt tình.' },
  { id: '2', author: 'Trần Thị Mai', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', rating: 5, date: '2026-06-19', comment: 'Trải nghiệm tuyệt vời vượt ngoài mong đợi! Rất xứng đáng số tiền bỏ ra.' },
  { id: '3', author: 'David Miller', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80', rating: 4, date: '2026-06-15', comment: 'Excellent service and great attention to detail. Highly recommend to everyone!' },
];

const GALLERY_FALLBACKS: Record<string, string[]> = {
  hotel: [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=900&q=80',
  ],
  vehicle: [
    'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=900&q=80',
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
  selector: 'app-details-overlay',
  standalone: true,
  imports: [
    DecimalPipe,
    FormsModule,
    LucideArrowLeft,
    LucideCalendar,
    LucideCheck,
    LucideCheckCircle,
    LucideChevronRight,
    LucideClock,
    LucideCreditCard,
    LucideHeart,
    LucideInfo,
    LucideLandmark,
    LucideMapPin,
    LucideMessageSquare,
    LucideNavigation,
    LucideShieldCheck,
    LucideShoppingCart,
    LucideSparkles,
    LucideStar,
    LucideShare2,
  ],
  templateUrl: './details-overlay.component.html',
  styleUrl: './details-overlay.component.css',
})
export class DetailsOverlayComponent {
  readonly today = isoOffset(0);
  readonly selectedDate = signal(isoOffset(1));
  readonly checkInDate = signal(isoOffset(1));
  readonly checkOutDate = signal(isoOffset(2));
  readonly selectedPackage = signal<PackageKey>('standard');
  readonly adultsCount = signal(1);
  readonly childrenCount = signal(0);
  readonly roomsCount = signal(1);
  readonly successMsg = signal(false);

  readonly reviews = signal<UserReview[]>([...MOCK_REVIEWS]);
  readonly reviewerName = signal('');
  readonly reviewRating = signal(5);
  readonly reviewComment = signal('');

  readonly isVi = computed(() => this.i18n.isVi());
  readonly minCheckout = computed(() => {
    const d = new Date(this.checkInDate());
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });

  private lastItemId: string | null = null;

  constructor(
    readonly ui: UiStateService,
    readonly i18n: I18nService,
    readonly cart: CartService,
    private readonly toast: ToastService,
    private readonly router: Router,
  ) {
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
      }
    });
  }

  max(a: number, b: number): number {
    return Math.max(a, b);
  }

  stars(n: number): string {
    return '★'.repeat(n);
  }

  back(): void {
    this.ui.clearSelectedItem();
  }

  typeLabel(item: ViewableItem): string {
    const vi = this.isVi();
    switch (item.type) {
      case 'hotel': return vi ? 'Khách sạn / Resort' : 'Hotel / Resort';
      case 'activity': return vi ? 'Hoạt động trải nghiệm' : 'Excursion Activity';
      case 'vehicle': return vi ? 'Phương tiện di chuyển' : 'Transport Rental';
      case 'tour': return vi ? 'Combo Tour Trọn Gói' : 'Heritage Tour Combo';
      case 'nearby-place': return vi ? 'Địa điểm tham quan lân cận' : 'Nearby Landmark';
      default: return item.type;
    }
  }

  isActivityLike(item: ViewableItem): boolean {
    return item.type === 'activity' || item.type === 'tour';
  }

  isBookable(item: ViewableItem): boolean {
    return item.price > 0 && (item.type === 'hotel' || item.type === 'vehicle' || this.isActivityLike(item));
  }

  private modifier(): number {
    const p = this.selectedPackage();
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
      return Math.round(this.pricePerUnit(item) * this.adultsCount() + this.childPricePerUnit(item) * this.childrenCount());
    }
    return Math.round(this.pricePerUnit(item) * this.effectiveQuantity(item));
  }

  packages(): Array<{ key: PackageKey; name: string; desc: string; modifierLabel: string }> {
    const vi = this.isVi();
    return [
      { key: 'standard', modifierLabel: '100%', name: vi ? 'Gói Tiêu Chuẩn (Cơ bản)' : 'Standard Package', desc: vi ? 'Dịch vụ tham quan cơ bản đầy đủ tiện ích và bảo hiểm du lịch.' : 'Full standard admission/service and complimentary travel insurance.' },
      { key: 'premium', modifierLabel: '+30%', name: vi ? 'Gói Cao Cấp (Premium VIP)' : 'Premium VIP Experience', desc: vi ? 'Có đưa đón riêng biệt, lối đi VIP không chờ đợi, tặng voucher ẩm thực 200k.' : 'Private pickup, VIP fast-track entry, 200k VND dining voucher included.' },
      { key: 'luxury', modifierLabel: '+60%', name: vi ? 'Gói Sang Trọng (All-Inclusive)' : 'Luxury All-Inclusive', desc: vi ? 'Dịch vụ thượng lưu trọn gói: HDV riêng, ăn ngự thiện cung đình, tặng đèn lồng lụa cao cấp.' : 'Royal package: Private local guide, luxury traditional dinner, and handmade silk gift.' },
    ];
  }

  cartKey(item: ViewableItem): string {
    const dateStr = item.type === 'hotel' || item.type === 'vehicle' ? `${this.checkInDate()} -> ${this.checkOutDate()}` : this.selectedDate();
    return [
      item.id,
      this.selectedPackage(),
      dateStr,
      this.isActivityLike(item) ? `adults-${this.adultsCount()}` : `qty-${this.effectiveQuantity(item)}`,
      this.isActivityLike(item) ? `children-${this.childrenCount()}` : item.type === 'hotel' ? `rooms-${this.roomsCount()}` : 'single-vehicle',
    ].join('__');
  }

  private detailsStr(item: ViewableItem): string {
    const vi = this.isVi();
    const pkg = this.packages().find((p) => p.key === this.selectedPackage())!.name;
    const dateStr = item.type === 'hotel' || item.type === 'vehicle' ? `${this.checkInDate()} -> ${this.checkOutDate()}` : this.selectedDate();
    if (this.isActivityLike(item)) {
      return vi ? `Gói: ${pkg} | Ngày: ${dateStr} | Vé: ${this.adultsCount()} Người lớn, ${this.childrenCount()} Trẻ em` : `Package: ${pkg} | Date: ${dateStr} | Tickets: ${this.adultsCount()} Adults, ${this.childrenCount()} Children`;
    }
    const tail = item.type === 'hotel' ? (vi ? `Phòng: ${this.roomsCount()} | Đêm: ${this.nights()}` : `Rooms: ${this.roomsCount()} | Nights: ${this.nights()}`) : vi ? `Số ngày thuê: ${this.nights()}` : `Rental days: ${this.nights()}`;
    return vi ? `Gói: ${pkg} | Ngày: ${dateStr} | ${tail}` : `Package: ${pkg} | Date: ${dateStr} | ${tail}`;
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

  private addSelection(item: ViewableItem): void {
    const cartType: BookingCartItem['type'] = item.type === 'hotel' || item.type === 'vehicle' ? item.type : 'activity';
    this.cart.addItem({
      cartKey: this.cartKey(item),
      id: item.id,
      type: cartType,
      name: item.type === 'tour' ? `[Combo] ${item.name}` : item.name,
      price: this.total(item),
      quantity: 1,
      image: item.image,
      details: this.detailsStr(item),
    });
    this.successMsg.set(true);
    setTimeout(() => this.successMsg.set(false), 3000);
  }

  handleAdd(item: ViewableItem): void {
    if (!this.isBookable(item)) return;
    this.ui.requireAuth(() => this.addSelection(item), this.isVi() ? 'Đăng nhập để thêm dịch vụ vào giỏ.' : 'Sign in to add services to your cart.');
  }

  checkout(item: ViewableItem): void {
    this.ui.requireAuth(() => {
      if (!this.cart.isInCart(this.cartKey(item))) this.addSelection(item);
      this.ui.clearSelectedItem();
      void this.router.navigateByUrl('/cart');
    }, this.isVi() ? 'Đăng nhập để thanh toán.' : 'Sign in to checkout.');
  }

  toggleFavorite(item: ViewableItem): void {
    const wasFav = this.ui.isFavorite(item.id);
    this.ui.toggleFavorite(item);
    this.toast.showToast({
      type: wasFav ? 'info' : 'success',
      title: wasFav ? (this.isVi() ? 'Đã bỏ yêu thích' : 'Removed from favorites') : (this.isVi() ? 'Đã lưu yêu thích' : 'Saved to favorites'),
      message: item.name,
    });
  }

  async share(item: ViewableItem): Promise<void> {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    try {
      const nav = navigator as Navigator & { share?: (data: object) => Promise<void> };
      if (nav.share) {
        await nav.share({ title: item.name, text: item.description ?? '', url });
        this.toast.showToast({ type: 'success', title: this.isVi() ? 'Đã mở chia sẻ' : 'Share sheet opened', message: item.name });
        return;
      }
      await navigator.clipboard.writeText(url);
      this.toast.showToast({ type: 'success', title: this.isVi() ? 'Đã sao chép liên kết' : 'Link copied', message: item.name });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      this.toast.showToast({ type: 'error', title: this.isVi() ? 'Chưa thể chia sẻ' : 'Could not share', message: this.isVi() ? 'Vui lòng thử lại sau.' : 'Please try again.' });
    }
  }

  addReview(): void {
    if (!this.reviewerName().trim() || !this.reviewComment().trim()) return;
    this.reviews.update((list) => [
      {
        id: `review-details-${Date.now()}`,
        author: this.reviewerName(),
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        rating: this.reviewRating(),
        date: new Date().toISOString().split('T')[0],
        comment: this.reviewComment(),
      },
      ...list,
    ]);
    this.reviewerName.set('');
    this.reviewComment.set('');
    this.reviewRating.set(5);
  }

  gallery(item: ViewableItem): Array<{ src: string; label: string }> {
    const fallback = GALLERY_FALLBACKS[item.type] ?? GALLERY_FALLBACKS['activity'];
    const labels = this.isVi()
      ? ['Góc nhìn chính', 'Không gian trải nghiệm', 'Chi tiết đáng chú ý', 'Khoảnh khắc nên thử']
      : ['Main view', 'Experience space', 'Notable detail', 'Worth-trying moment'];
    return [item.image, ...fallback].slice(0, 4).map((src, i) => ({ src, label: labels[i] }));
  }

  highlights(item: ViewableItem): string[] {
    if (item.highlights?.length) return item.highlights;
    const vi = this.isVi();
    return [
      vi ? 'Đội ngũ hỗ trợ chuyên nghiệp sẵn sàng 24/7 phục vụ quý khách.' : '24/7 Professional support staff ready to assist you.',
      vi ? 'Bao gồm bảo hiểm lữ hành toàn diện theo chuẩn quốc tế.' : 'Comprehensive international standard travel insurance included.',
      vi ? 'Hỗ trợ thay đổi lịch trình hoặc hủy dịch vụ miễn phí trước 24 giờ.' : 'Free rescheduling or cancellation up to 24 hours in advance.',
      vi ? 'Cam kết chất lượng dịch vụ chính hãng VietCharm uy tín hàng đầu.' : 'VietCharm certified genuine high-quality service guaranteed.',
    ];
  }

  quickFacts(item: ViewableItem): Array<{ icon: string; label: string; value: string }> {
    const vi = this.isVi();
    return [
      { icon: 'clock', label: vi ? 'Thời lượng' : 'Duration', value: item.type === 'hotel' ? (vi ? `${this.nights()} đêm lưu trú` : `${this.nights()} night stay`) : item.duration || (vi ? 'Linh hoạt theo lịch' : 'Flexible timing') },
      { icon: 'map', label: vi ? 'Di chuyển' : 'Getting there', value: item.distance ? (vi ? `Cách trung tâm ${item.distance}` : `${item.distance} from center`) : vi ? 'Dễ ghép vào tuyến đang chọn' : 'Easy to add to the selected route' },
      { icon: 'shield', label: vi ? 'Đặt chỗ' : 'Booking', value: vi ? 'Xác nhận nhanh, thông tin rõ ràng' : 'Fast confirmation, clear details' },
      { icon: 'sparkles', label: vi ? 'Phù hợp' : 'Best for', value: item.type === 'vehicle' ? (vi ? 'Tự do đổi điểm dừng' : 'Flexible stopovers') : item.type === 'hotel' ? (vi ? 'Nghỉ ngơi sau hành trình' : 'Reset between route days') : vi ? 'Thêm điểm nhớ cho chuyến đi' : 'A memorable route highlight' },
    ];
  }

  paired(item: ViewableItem): string[] {
    const vi = this.isVi();
    if (item.type === 'hotel') return [vi ? 'Thêm xe đưa đón sân bay để ngày đầu nhẹ hơn.' : 'Add an airport transfer to make day one easier.', vi ? 'Ghép một hoạt động buổi chiều gần khách sạn.' : 'Pair it with a nearby afternoon experience.'];
    if (item.type === 'vehicle') return [vi ? 'Chọn khách sạn cùng khu để tối ưu giờ nhận xe.' : 'Choose a stay in the same area to simplify pickup.', vi ? 'Thêm điểm dừng ăn uống địa phương trên tuyến.' : 'Add a local food stop along the route.'];
    return [vi ? 'Ghép khách sạn gần điểm khởi hành để không vội buổi sáng.' : 'Pair with a stay near the pickup point.', vi ? 'Thêm xe riêng nếu đi gia đình hoặc nhóm đông.' : 'Add private transport for families or larger groups.'];
  }
}
