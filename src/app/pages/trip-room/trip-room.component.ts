import { Component, computed, input, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  LucideAlertCircle,
  LucideArrowRight,
  LucideBaby,
  LucideBrain,
  LucideCamera,
  LucideCar,
  LucideCheckCircle,
  LucideChevronRight,
  LucideClipboardList,
  LucideClock,
  LucideCoffee,
  LucideCompass,
  LucideFlame,
  LucideGift,
  LucideHeart,
  LucideHelpCircle,
  LucideInfo,
  LucideLeaf,
  LucidePlane,
  LucidePlus,
  LucideShare2,
  LucideShieldCheck,
  LucideShirt,
  LucideSparkles,
  LucideStar,
  LucideTrash2,
  LucideUsers,
  LucideUsersRound,
  LucideWaves,
} from '@lucide/angular';
import { provinces } from '@/data';
import { PREDEFINED_COMBOS } from '@/constants/seed/tourCombos';
import { TOURIST_LOCATIONS } from '@/constants/seed/touristLocations';
import type { BookingCartItem, PartnershipApplication, ViewableItem } from '@/types';
import { CartService } from '@/services/cart.service';
import { CatalogService } from '@/services/catalog.service';
import { I18nService } from '@/services/i18n.service';
import { ToastService } from '@/services/toast.service';
import { UiStateService } from '@/services/ui-state.service';
import { VndPipe } from '@/pipes/vnd.pipe';

interface AIActivity {
  time: string;
  attractionName: string;
  description: string;
  costVND: number;
}

interface AIDay {
  dayNumber: number;
  title: string;
  activities: AIActivity[];
}

interface AIItinerary {
  itineraryTitle: string;
  estimatedSavingsPercent: number;
  totalCostEstimate: number;
  days: AIDay[];
  savingTips: string[];
}

interface AIResponse {
  success: boolean;
  source?: string;
  data?: AIItinerary;
  fallback?: AIItinerary;
}

interface TripMember {
  id: string;
  name: string;
  avatar: string;
  budget: number;
  preferences: string[];
  dislikes: string;
  status: 'paid' | 'unpaid';
}

interface VoteItem {
  id: string;
  nameVi: string;
  nameEn: string;
  type: 'hotel' | 'activity' | 'restaurant';
  image: string;
  votes: string[];
  price: number;
  rating: number;
  locationVi: string;
  locationEn: string;
}

@Component({
  selector: 'app-trip-room-page',
  standalone: true,
  imports: [FormsModule, DecimalPipe, RouterLink, LucideAlertCircle, LucideCheckCircle, LucideChevronRight, LucideInfo, LucidePlus, LucideShare2, LucideShieldCheck, LucideSparkles, LucideTrash2, LucideUsers],
  templateUrl: './trip-room.component.html',
  styleUrl: './trip-room.component.css',
})
export class TripRoomComponent {
  readonly isVi = computed(() => this.i18n.isVi());
  readonly roomId = 'VC-GROUP-889';
  readonly copied = signal(false);
  readonly tab = signal<'invite' | 'voting' | 'checkout'>('invite');
  readonly alertMsg = signal<string | null>(null);
  readonly members = signal<TripMember[]>([]);
  readonly votingItems = signal<VoteItem[]>([]);
  readonly friendName = signal('');
  readonly friendBudget = signal(5000000);
  readonly friendPref = signal('');
  readonly friendDislike = signal('');

  readonly avgBudget = computed(() => Math.round(this.members().reduce((a, m) => a + m.budget, 0) / (this.members().length || 1)));
  readonly paidCount = computed(() => this.members().filter((m) => m.status === 'paid').length);
  readonly unpaidCount = computed(() => this.members().filter((m) => m.status === 'unpaid').length);
  readonly topHotel = computed(() => this.topVoted('hotel'));
  readonly topActivity = computed(() => this.topVoted('activity'));
  readonly topRestaurant = computed(() => this.topVoted('restaurant'));
  readonly packageTotal = computed(() => (this.topHotel()?.price ?? 0) * 2 + (this.topActivity()?.price ?? 0) + (this.topRestaurant()?.price ?? 0));
  readonly perPersonShare = computed(() => Math.round(this.packageTotal() / (this.members().length || 1)));

  constructor(
    readonly i18n: I18nService,
    private readonly cart: CartService,
  ) {
    const vi = this.i18n.isVi();
    this.members.set([
      { id: 'm1', name: vi ? 'Trần Tuấn (Bạn/Trưởng Nhóm)' : 'Tran Tuan (You/Leader)', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80', budget: 5000000, preferences: vi ? ['Gần Phố Cổ', 'Ăn đặc sản', 'Chill sông nước'] : ['Near Ancient Town', 'Local food', 'Riverside chilling'], dislikes: vi ? 'Đi bộ quá nhiều' : 'Too much walking', status: 'unpaid' },
      { id: 'm2', name: 'Khánh Vy', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', budget: 6000000, preferences: vi ? ['Chụp ảnh đẹp', 'Hồ bơi vô cực', 'Café hoài cổ'] : ['Aesthetic photos', 'Infinity pool', 'Vintage café'], dislikes: vi ? 'Dậy quá sớm' : 'Waking up too early', status: 'unpaid' },
      { id: 'm3', name: 'Hoàng Long', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', budget: 4500000, preferences: vi ? ['Chèo thuyền thúng', 'Hải sản tươi', 'Gần biển'] : ['Basket boat tour', 'Fresh seafood', 'Near beach'], dislikes: vi ? 'Khách sạn ồn ào' : 'Noisy hotels', status: 'unpaid' },
    ]);
    this.votingItems.set([
      { id: 'h1', nameVi: 'Resort Boutique Di Sản Sông Thu Bồn', nameEn: 'Thu Bon River Heritage Boutique Resort', type: 'hotel', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80', votes: ['m1', 'm2'], price: 1800000, rating: 4.9, locationVi: 'Ven sông Thu Bồn, Hội An', locationEn: 'Riverside, Hoi An' },
      { id: 'h2', nameVi: 'Khách sạn Heritage Gỗ Mộc Phố Cổ', nameEn: 'Historic Timber Town Hotel', type: 'hotel', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=400&q=80', votes: ['m3'], price: 1100000, rating: 4.6, locationVi: 'Trung tâm Phố cổ, Hội An', locationEn: 'Ancient Town Center, Hoi An' },
      { id: 'r1', nameVi: 'Nhà Hàng Vườn Vy: Cao Lầu & Hoành Thánh Di Sản', nameEn: 'Vy Garden: Heritage Cao Lau & Wontons', type: 'restaurant', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&q=80', votes: ['m1', 'm2', 'm3'], price: 250000, rating: 4.8, locationVi: 'Đường Bạch Đằng, Hội An', locationEn: 'Bach Dang St, Hoi An' },
      { id: 'r2', nameVi: 'Bếp Hải Sản Đầm Sen Hội An', nameEn: 'Dam Sen Fresh Lagoon Seafood', type: 'restaurant', image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=400&q=80', votes: ['m3'], price: 450000, rating: 4.5, locationVi: 'Cẩm An, Hội An', locationEn: 'Cam An, Hoi An' },
      { id: 'a1', nameVi: 'Tour Lặn Ngắm San Hô Đảo Cù Lao Chàm bằng Cano', nameEn: 'Cham Island Snorkeling & Speedboat Adventure', type: 'activity', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=400&q=80', votes: ['m1', 'm3'], price: 750000, rating: 4.7, locationVi: 'Bến tàu Cửa Đại', locationEn: 'Cua Dai Pier' },
      { id: 'a2', nameVi: 'Thúng Xoay Rừng Dừa Bảy Mẫu & Thả Hoa Đăng Sông Hoài', nameEn: 'Coconut Forest Spinning Basket Boat & Lantern Release', type: 'activity', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&q=80', votes: ['m2', 'm1', 'm3'], price: 250000, rating: 4.9, locationVi: 'Rừng dừa Bảy Mẫu', locationEn: 'Bay Mau Coconut Forest' },
    ]);
  }

  tabClass(t: 'invite' | 'voting' | 'checkout'): string {
    return 'pb-2 text-xs font-bold uppercase tracking-wider transition ' + (this.tab() === t ? 'border-b-2 border-natural-accent font-black text-natural-accent' : 'text-natural-text/60 hover:text-natural-accent');
  }

  voteCategories(): Array<{ type: 'hotel' | 'restaurant' | 'activity'; label: string }> {
    const vi = this.isVi();
    return [
      { type: 'hotel', label: vi ? '🏡 1. Nơi Ở / Lưu Trú' : '🏡 1. Accommodations' },
      { type: 'restaurant', label: vi ? '🥢 2. Quán Ăn / Ẩm Thực' : '🥢 2. Dining & Flavors' },
      { type: 'activity', label: vi ? '🛶 3. Hoạt Động Trải Nghiệm' : '🛶 3. Activities' },
    ];
  }

  itemsOfType(type: 'hotel' | 'restaurant' | 'activity'): VoteItem[] {
    return this.votingItems().filter((v) => v.type === type);
  }

  memberById(id: string): TripMember | undefined {
    return this.members().find((m) => m.id === id);
  }

  percent(item: VoteItem): number {
    return Math.round((item.votes.length / (this.members().length || 1)) * 100);
  }

  private topVoted(type: 'hotel' | 'activity' | 'restaurant'): VoteItem | null {
    const items = this.votingItems().filter((v) => v.type === type);
    if (!items.length) return null;
    return items.reduce((prev, cur) => (prev.votes.length > cur.votes.length ? prev : cur));
  }

  alert(msg: string): void {
    this.alertMsg.set(msg);
    setTimeout(() => this.alertMsg.set(null), 6000);
  }

  copyLink(): void {
    this.copied.set(true);
    if (typeof navigator !== 'undefined' && navigator.clipboard) void navigator.clipboard.writeText(`https://vietcharm.vn/triproom/${this.roomId}`);
    this.alert(this.isVi() ? '✓ Đã sao chép link phòng lập kế hoạch!' : '✓ Group trip room link copied!');
    setTimeout(() => this.copied.set(false), 2000);
  }

  addMember(): void {
    if (!this.friendName().trim()) return;
    const avatars = ['https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80'];
    const id = `m${this.members().length + 1}`;
    const vi = this.isVi();
    const member: TripMember = {
      id, name: this.friendName(), avatar: avatars[Math.floor(Math.random() * avatars.length)], budget: this.friendBudget(),
      preferences: this.friendPref() ? this.friendPref().split(',').map((s) => s.trim()) : vi ? ['Tự do', 'Chill chill'] : ['Flexible', 'Chill'],
      dislikes: this.friendDislike() || (vi ? 'Không có' : 'None'), status: 'unpaid',
    };
    this.members.update((list) => [...list, member]);
    this.votingItems.update((items) => items.map((it) => (Math.random() > 0.4 ? { ...it, votes: [...it.votes, id] } : it)));
    this.alert(vi ? `✓ Đã mời ${this.friendName()} vào phòng nhóm!` : `✓ Invited ${this.friendName()} to the trip room!`);
    this.friendName.set('');
    this.friendPref.set('');
    this.friendDislike.set('');
  }

  deleteMember(id: string): void {
    if (id === 'm1') {
      this.alert(this.isVi() ? 'Bạn không thể xóa chính mình!' : 'You cannot remove yourself!');
      return;
    }
    this.members.update((list) => list.filter((m) => m.id !== id));
    this.votingItems.update((items) => items.map((it) => ({ ...it, votes: it.votes.filter((v) => v !== id) })));
    this.alert(this.isVi() ? 'Đã gỡ thành viên khỏi nhóm.' : 'Removed member from the room.');
  }

  vote(itemId: string): void {
    this.votingItems.update((items) => items.map((it) => {
      if (it.id !== itemId) return it;
      const voted = it.votes.includes('m1');
      return { ...it, votes: voted ? it.votes.filter((v) => v !== 'm1') : [...it.votes, 'm1'] };
    }));
  }

  pay(id: string): void {
    this.members.update((list) => list.map((m) => (m.id === id ? { ...m, status: 'paid' } : m)));
    this.alert(this.isVi() ? '✓ Ghi nhận thanh toán thành công!' : '✓ Payment verified successfully!');
  }

  checkoutGroup(): void {
    const vi = this.isVi();
    const items: BookingCartItem[] = [];
    const hotel = this.topHotel();
    const activity = this.topActivity();
    if (hotel) items.push({ id: `group-hotel-${hotel.id}`, type: 'hotel', name: `[Group Room] ${vi ? hotel.nameVi : hotel.nameEn}`, price: hotel.price * 2, quantity: this.members().length, image: hotel.image, details: vi ? `Bình chọn nhiều nhất bởi cả nhóm ${this.roomId}` : `Top-voted stay by group ${this.roomId}` });
    if (activity) items.push({ id: `group-act-${activity.id}`, type: 'activity', name: `[Group Room] ${vi ? activity.nameVi : activity.nameEn}`, price: activity.price, quantity: this.members().length, image: activity.image, details: vi ? `Phục vụ nhóm ${this.members().length} khách` : `Reserved for ${this.members().length} guests` });
    this.cart.addCombo(items);
    this.alert(vi ? '✓ Đã đồng bộ các lựa chọn hàng đầu của nhóm vào Giỏ hành lý!' : '✓ Syncing consensus group selections to Cart!');
    this.tab.set('checkout');
  }
}
