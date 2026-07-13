import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  LucideAlertCircle,
  LucideArrowRight,
  LucideCheckCircle,
  LucideChevronRight,
  LucideInfo,
  LucidePlus,
  LucideShare2,
  LucideShieldCheck,
  LucideSparkles,
  LucideTrash2,
  LucideUsers,
  LucideUsersRound,
} from '@lucide/angular';
import type { BookingCartItem } from '@/types';
import { AuthService } from '@/services/auth.service';
import { CartService } from '@/services/cart.service';
import { I18nService } from '@/services/i18n.service';

interface TripMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  budget: number;
  availability?: string;
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

interface TripRoom {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  maxMembers: number;
  inviteCode: string;
  ownerEmail: string;
  members: TripMember[];
  votingItems: VoteItem[];
  active: boolean;
  createdAt: string;
}

const AVATARS = [
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
];

function randomCode(length = 6): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

@Component({
  selector: 'app-trip-room-page',
  standalone: true,
  imports: [FormsModule, DecimalPipe, RouterLink, LucideAlertCircle, LucideArrowRight, LucideCheckCircle, LucideChevronRight, LucidePlus, LucideShare2, LucideShieldCheck, LucideSparkles, LucideTrash2, LucideUsers, LucideUsersRound],
  templateUrl: './trip-room.component.html',
  styleUrl: './trip-room.component.css',
})
export class TripRoomComponent {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly cart = inject(CartService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly i18n = inject(I18nService);

  readonly isVi = computed(() => this.i18n.isVi());

  // BPMN stages: landing (choose create/join) -> create form -> room (planning UI).
  readonly stage = signal<'landing' | 'create' | 'room'>('landing');
  readonly room = signal<TripRoom | null>(null);
  readonly myRooms = signal<TripRoom[]>([]);

  // Create-room form: only the name is required; member cap uses a -/+ stepper.
  readonly formName = signal('');
  readonly formDescription = signal('');
  readonly formMaxMembers = signal(4);
  readonly formError = signal<string | null>(null);
  readonly creating = signal(false);

  // Join-by-invite-code form.
  readonly joinCode = signal('');
  readonly joinError = signal<string | null>(null);
  readonly joining = signal(false);

  readonly copied = signal(false);
  readonly tab = signal<'invite' | 'voting' | 'checkout'>('invite');
  readonly alertMsg = signal<string | null>(null);
  readonly members = signal<TripMember[]>([]);
  readonly votingItems = signal<VoteItem[]>([]);

  // Per-member travel profile form (tab 1): budget, availability, likes, dislikes.
  readonly profileBudget = signal(5000000);
  readonly profileAvailability = signal('');
  readonly profilePrefs = signal('');
  readonly profileDislikes = signal('');

  readonly myEmail = computed(() => this.auth.currentUser()?.email ?? '');
  readonly myName = computed(() => this.auth.currentUser()?.fullName || this.auth.currentUser()?.username || (this.isVi() ? 'Bạn' : 'You'));
  readonly myId = computed(() => this.members().find((m) => m.email === this.myEmail())?.id ?? this.members()[0]?.id ?? '');
  readonly isOwner = computed(() => this.room()?.ownerEmail === this.myEmail());
  readonly shareLink = computed(() => {
    const r = this.room();
    if (!r) return '';
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://vietcharm.vn';
    return `${origin}/trip-room?join=${r.inviteCode}`;
  });

  readonly avgBudget = computed(() => Math.round(this.members().reduce((a, m) => a + m.budget, 0) / (this.members().length || 1)));
  readonly paidCount = computed(() => this.members().filter((m) => m.status === 'paid').length);
  readonly unpaidCount = computed(() => this.members().filter((m) => m.status === 'unpaid').length);
  readonly topHotel = computed(() => this.topVoted('hotel'));
  readonly topActivity = computed(() => this.topVoted('activity'));
  readonly topRestaurant = computed(() => this.topVoted('restaurant'));
  readonly packageTotal = computed(() => (this.topHotel()?.price ?? 0) * 2 + (this.topActivity()?.price ?? 0) + (this.topRestaurant()?.price ?? 0));
  readonly perPersonShare = computed(() => Math.round(this.packageTotal() / (this.members().length || 1)));
  /** Winning items across categories — drives the bill breakdown. */
  readonly chosenItems = computed(() => [this.topHotel(), this.topRestaurant(), this.topActivity()].filter((v): v is VoteItem => v !== null));
  /** Items the whole room agreed on (100% votes) — drives the consensus-discount banner. */
  readonly consensusItems = computed(() => this.votingItems().filter((v) => v.votes.length > 0 && v.votes.length === this.members().length));

  // Live group aggregates for tab 1 — built from what members actually filled in, nothing hardcoded.
  readonly allPreferences = computed(() => {
    const set = new Set<string>();
    for (const m of this.members()) for (const p of m.preferences) if (p.trim()) set.add(p.trim());
    return [...set];
  });
  readonly allDislikes = computed(() =>
    this.members()
      .map((m) => m.dislikes)
      .filter((d) => d && !['Chưa cập nhật', 'Not set', 'Không có', 'None'].includes(d)),
  );
  readonly availabilityList = computed(() =>
    this.members()
      .filter((m) => (m.availability ?? '').trim())
      .map((m) => ({ name: m.name, availability: m.availability! })),
  );

  constructor() {
    // Arriving through a shared invite link (?join=CODE) pre-fills the join form (BPMN flow 2).
    const joinParam = this.route.snapshot.queryParamMap.get('join');
    if (joinParam) this.joinCode.set(joinParam.toUpperCase());
    void this.loadMyRooms();
  }

  /** Human-readable reason for a failed API call — surfaces the real cause instead of a generic retry hint. */
  private describeError(error: unknown): string {
    const vi = this.isVi();
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0 || error.status === 502 || error.status === 504) {
        return vi
          ? 'Không kết nối được máy chủ — hãy chắc chắn backend đang chạy (pnpm run api).'
          : 'Cannot reach the server — make sure the backend is running (pnpm run api).';
      }
      const body = error.error as { message?: string } | null;
      if (body?.message) return body.message;
    }
    return vi ? 'Đã có lỗi xảy ra, thử lại sau.' : 'Something went wrong, please retry.';
  }

  private async loadMyRooms(): Promise<void> {
    const email = this.myEmail();
    if (!email) return;
    try {
      const rooms = await firstValueFrom(this.http.get<TripRoom[]>(`/api/trip-rooms?memberEmail=${encodeURIComponent(email)}`));
      this.myRooms.set(rooms.filter((r) => r.active));
    } catch {
      this.myRooms.set([]);
    }
  }

  decMembers(): void {
    this.formMaxMembers.update((v) => Math.max(2, v - 1));
  }

  incMembers(): void {
    this.formMaxMembers.update((v) => Math.min(20, v + 1));
  }

  setMembers(value: number | string): void {
    const n = Math.round(Number(value) || 2);
    this.formMaxMembers.set(Math.min(20, Math.max(2, n)));
  }

  enterRoom(room: TripRoom): void {
    this.room.set(room);
    this.members.set(room.members);
    this.votingItems.set(room.votingItems);
    this.stage.set('room');
    this.tab.set('invite');
    // Pre-fill the profile form with what this member already shared.
    const me = room.members.find((m) => m.email === this.myEmail());
    if (me) {
      this.profileBudget.set(me.budget || 5000000);
      this.profileAvailability.set(me.availability ?? '');
      this.profilePrefs.set(me.preferences.join(', '));
      this.profileDislikes.set(['Chưa cập nhật', 'Not set', 'Không có', 'None'].includes(me.dislikes) ? '' : me.dislikes);
    }
  }

  /** Save the current member's travel profile and share it with the room. */
  saveProfile(): void {
    const vi = this.isVi();
    const me = this.myId();
    if (!me) return;
    this.members.update((list) =>
      list.map((m) =>
        m.id === me
          ? {
              ...m,
              budget: Math.max(0, Math.round(Number(this.profileBudget()) || 0)),
              availability: this.profileAvailability().trim(),
              preferences: this.profilePrefs().split(',').map((s) => s.trim()).filter(Boolean),
              dislikes: this.profileDislikes().trim() || (vi ? 'Không có' : 'None'),
            }
          : m,
      ),
    );
    this.syncRoom();
    this.alert(vi ? '✓ Đã lưu gu du lịch của bạn — cả nhóm sẽ thấy ngay!' : '✓ Travel profile saved — the whole room can see it!');
  }

  /** BPMN flow 1: validate input -> generate Room ID + invite code -> persist -> show the new room. */
  async createRoom(): Promise<void> {
    const vi = this.isVi();
    const name = this.formName().trim();
    const max = this.formMaxMembers();
    // Only the room name is required; dates get settled later inside the room.
    if (!name) {
      this.formError.set(vi ? 'Vui lòng nhập tên phòng.' : 'Please enter a room name.');
      return;
    }
    this.formError.set(null);
    this.creating.set(true);

    const user = this.auth.currentUser();
    const owner: TripMember = {
      id: `m-${randomCode(4)}`,
      name: `${this.myName()}${vi ? ' (Trưởng nhóm)' : ' (Leader)'}`,
      email: user?.email ?? '',
      avatar: user?.avatar || AVATARS[0],
      budget: 5000000,
      availability: '',
      preferences: [],
      dislikes: vi ? 'Chưa cập nhật' : 'Not set',
      status: 'unpaid',
    };
    const room: TripRoom = {
      id: `VC-${randomCode(6)}`,
      name,
      description: this.formDescription().trim(),
      startDate: '',
      endDate: '',
      maxMembers: max,
      inviteCode: randomCode(6),
      ownerEmail: user?.email ?? '',
      members: [owner],
      votingItems: this.defaultSuggestions(),
      active: true,
      createdAt: new Date().toISOString(),
    };
    try {
      const created = await firstValueFrom(this.http.post<TripRoom>('/api/trip-rooms', room));
      this.enterRoom(created);
      this.myRooms.update((list) => [...list, created]);
      this.alert(vi ? `✓ Đã tạo phòng "${name}" — mã mời: ${room.inviteCode}. Sao chép link để mời bạn bè!` : `✓ Room "${name}" created — invite code: ${room.inviteCode}. Copy the link to invite friends!`);
    } catch (error) {
      this.formError.set(this.describeError(error));
    } finally {
      this.creating.set(false);
    }
  }

  /** BPMN flow 2: check the room exists & is active -> add the member -> show the room, else explain. */
  async joinRoom(): Promise<void> {
    const vi = this.isVi();
    const code = this.joinCode().trim().toUpperCase();
    if (!code) {
      this.joinError.set(vi ? 'Vui lòng nhập mã mời.' : 'Please enter an invite code.');
      return;
    }
    this.joinError.set(null);
    this.joining.set(true);
    try {
      const rooms = await firstValueFrom(this.http.get<TripRoom[]>(`/api/trip-rooms?inviteCode=${encodeURIComponent(code)}`));
      const room = rooms[0];
      if (!room || !room.active) {
        this.joinError.set(vi ? 'Phòng không tồn tại hoặc đã hết hạn.' : 'This room does not exist or has expired.');
        return;
      }
      const existing = room.members.find((m) => m.email === this.myEmail());
      if (existing) {
        this.enterRoom(room);
        this.alert(vi ? `✓ Chào mừng quay lại phòng "${room.name}"!` : `✓ Welcome back to "${room.name}"!`);
        return;
      }
      if (room.members.length >= room.maxMembers) {
        this.joinError.set(vi ? 'Phòng đã đủ số thành viên tối đa.' : 'This room is already full.');
        return;
      }
      const user = this.auth.currentUser();
      const member: TripMember = {
        id: `m-${randomCode(4)}`,
        name: this.myName(),
        email: user?.email ?? '',
        avatar: user?.avatar || AVATARS[Math.floor(Math.random() * AVATARS.length)],
        budget: 5000000,
        availability: '',
        preferences: [],
        dislikes: vi ? 'Chưa cập nhật' : 'Not set',
        status: 'unpaid',
      };
      const updatedMembers = [...room.members, member];
      const updated = await firstValueFrom(this.http.patch<TripRoom>(`/api/trip-rooms/${room.id}`, { members: updatedMembers }));
      this.enterRoom(updated);
      this.myRooms.update((list) => (list.some((r) => r.id === updated.id) ? list : [...list, updated]));
      this.alert(vi ? `✓ Đã tham gia phòng "${room.name}" thành công!` : `✓ Joined "${room.name}" successfully!`);
    } catch (error) {
      this.joinError.set(this.describeError(error));
    } finally {
      this.joining.set(false);
    }
  }

  leaveToLanding(): void {
    this.stage.set('landing');
    this.room.set(null);
    void this.loadMyRooms();
  }

  /** Owner-only: delete a room after confirmation (works from inside the room or the landing list). */
  async deleteRoom(room?: TripRoom | null): Promise<void> {
    const target = room ?? this.room();
    if (!target) return;
    const vi = this.isVi();
    if (target.ownerEmail !== this.myEmail()) {
      this.alert(vi ? 'Chỉ trưởng nhóm mới được xoá phòng.' : 'Only the room owner can delete it.');
      return;
    }
    const ok = typeof window === 'undefined' || window.confirm(vi ? `Xoá phòng "${target.name}"? Toàn bộ dữ liệu bầu chọn sẽ mất và không thể hoàn tác.` : `Delete "${target.name}"? All voting data will be lost. This cannot be undone.`);
    if (!ok) return;
    try {
      await firstValueFrom(this.http.delete(`/api/trip-rooms/${target.id}`));
      this.myRooms.update((list) => list.filter((r) => r.id !== target.id));
      if (this.room()?.id === target.id) {
        this.room.set(null);
        this.stage.set('landing');
      }
      this.alert(vi ? `✓ Đã xoá phòng "${target.name}".` : `✓ Deleted "${target.name}".`);
    } catch (error) {
      this.alert(this.describeError(error));
    }
  }

  /** Persist members + votes to the room document (fire-and-forget, demo scale). */
  private syncRoom(): void {
    const room = this.room();
    if (!room) return;
    void firstValueFrom(this.http.patch<TripRoom>(`/api/trip-rooms/${room.id}`, { members: this.members(), votingItems: this.votingItems() })).catch(() => {});
  }

  private defaultSuggestions(): VoteItem[] {
    return [
      { id: 'h1', nameVi: 'Resort Boutique Di Sản Sông Thu Bồn', nameEn: 'Thu Bon River Heritage Boutique Resort', type: 'hotel', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80', votes: [], price: 1800000, rating: 4.9, locationVi: 'Ven sông Thu Bồn, Hội An', locationEn: 'Riverside, Hoi An' },
      { id: 'h2', nameVi: 'Khách sạn Heritage Gỗ Mộc Phố Cổ', nameEn: 'Historic Timber Town Hotel', type: 'hotel', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=400&q=80', votes: [], price: 1100000, rating: 4.6, locationVi: 'Trung tâm Phố cổ, Hội An', locationEn: 'Ancient Town Center, Hoi An' },
      { id: 'r1', nameVi: 'Nhà Hàng Vườn Vy: Cao Lầu & Hoành Thánh Di Sản', nameEn: 'Vy Garden: Heritage Cao Lau & Wontons', type: 'restaurant', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&q=80', votes: [], price: 250000, rating: 4.8, locationVi: 'Đường Bạch Đằng, Hội An', locationEn: 'Bach Dang St, Hoi An' },
      { id: 'r2', nameVi: 'Bếp Hải Sản Đầm Sen Hội An', nameEn: 'Dam Sen Fresh Lagoon Seafood', type: 'restaurant', image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=400&q=80', votes: [], price: 450000, rating: 4.5, locationVi: 'Cẩm An, Hội An', locationEn: 'Cam An, Hoi An' },
      { id: 'a1', nameVi: 'Tour Lặn Ngắm San Hô Đảo Cù Lao Chàm bằng Cano', nameEn: 'Cham Island Snorkeling & Speedboat Adventure', type: 'activity', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=400&q=80', votes: [], price: 750000, rating: 4.7, locationVi: 'Bến tàu Cửa Đại', locationEn: 'Cua Dai Pier' },
      { id: 'a2', nameVi: 'Thúng Xoay Rừng Dừa Bảy Mẫu & Thả Hoa Đăng Sông Hoài', nameEn: 'Coconut Forest Spinning Basket Boat & Lantern Release', type: 'activity', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&q=80', votes: [], price: 250000, rating: 4.9, locationVi: 'Rừng dừa Bảy Mẫu', locationEn: 'Bay Mau Coconut Forest' },
    ];
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

  hasMyVote(item: VoteItem): boolean {
    return item.votes.includes(this.myId());
  }

  /** The winning option of a category — only counts once somebody actually voted (no votes = no pick, no bill). */
  private topVoted(type: 'hotel' | 'activity' | 'restaurant'): VoteItem | null {
    const items = this.votingItems().filter((v) => v.type === type && v.votes.length > 0);
    if (!items.length) return null;
    return items.reduce((prev, cur) => (prev.votes.length > cur.votes.length ? prev : cur));
  }

  alert(msg: string): void {
    this.alertMsg.set(msg);
    setTimeout(() => this.alertMsg.set(null), 6000);
  }

  copyLink(): void {
    this.copied.set(true);
    if (typeof navigator !== 'undefined' && navigator.clipboard) void navigator.clipboard.writeText(this.shareLink());
    this.alert(this.isVi() ? '✓ Đã sao chép link mời vào phòng!' : '✓ Trip room invite link copied!');
    setTimeout(() => this.copied.set(false), 2000);
  }

  copyText(value: string | undefined): void {
    if (!value) return;
    if (typeof navigator !== 'undefined' && navigator.clipboard) void navigator.clipboard.writeText(value);
    this.alert(this.isVi() ? `✓ Đã sao chép: ${value}` : `✓ Copied: ${value}`);
  }

  typeLabel(type: 'hotel' | 'restaurant' | 'activity'): string {
    const vi = this.isVi();
    if (type === 'hotel') return vi ? '🏡 Lưu trú (2 đêm)' : '🏡 Stay (2 nights)';
    if (type === 'restaurant') return vi ? '🥢 Ẩm thực' : '🥢 Dining';
    return vi ? '🛶 Hoạt động' : '🛶 Activity';
  }

  deleteMember(id: string): void {
    if (id === this.myId()) {
      this.alert(this.isVi() ? 'Bạn không thể xóa chính mình!' : 'You cannot remove yourself!');
      return;
    }
    this.members.update((list) => list.filter((m) => m.id !== id));
    this.votingItems.update((items) => items.map((it) => ({ ...it, votes: it.votes.filter((v) => v !== id) })));
    this.syncRoom();
    this.alert(this.isVi() ? 'Đã gỡ thành viên khỏi nhóm.' : 'Removed member from the room.');
  }

  vote(itemId: string): void {
    const me = this.myId();
    if (!me) return;
    this.votingItems.update((items) => items.map((it) => {
      if (it.id !== itemId) return it;
      const voted = it.votes.includes(me);
      return { ...it, votes: voted ? it.votes.filter((v) => v !== me) : [...it.votes, me] };
    }));
    this.syncRoom();
  }

  pay(id: string): void {
    this.members.update((list) => list.map((m) => (m.id === id ? { ...m, status: 'paid' } : m)));
    this.syncRoom();
    this.alert(this.isVi() ? '✓ Ghi nhận thanh toán thành công!' : '✓ Payment verified successfully!');
  }

  checkoutGroup(): void {
    const room = this.room();
    if (!room) return;
    const vi = this.isVi();
    if (!this.chosenItems().length) {
      this.alert(vi ? 'Nhóm chưa bầu chọn hạng mục nào — hãy bầu chọn trước nhé!' : 'Nothing has been voted yet — cast some votes first!');
      return;
    }
    const items: BookingCartItem[] = [];
    const hotel = this.topHotel();
    const activity = this.topActivity();
    if (hotel) items.push({ id: `group-hotel-${hotel.id}`, type: 'hotel', name: `[${room.name}] ${vi ? hotel.nameVi : hotel.nameEn}`, price: hotel.price * 2, quantity: this.members().length, image: hotel.image, details: vi ? `Bình chọn nhiều nhất bởi cả nhóm ${room.id}` : `Top-voted stay by group ${room.id}` });
    if (activity) items.push({ id: `group-act-${activity.id}`, type: 'activity', name: `[${room.name}] ${vi ? activity.nameVi : activity.nameEn}`, price: activity.price, quantity: this.members().length, image: activity.image, details: vi ? `Phục vụ nhóm ${this.members().length} khách` : `Reserved for ${this.members().length} guests` });
    this.cart.addCombo(items);
    this.alert(vi ? '✓ Đã đồng bộ các lựa chọn hàng đầu của nhóm vào Giỏ hành lý!' : '✓ Syncing consensus group selections to Cart!');
    this.tab.set('checkout');
  }

  payGroupDeposit(): void {
    void this.router.navigateByUrl('/checkout');
  }
}
