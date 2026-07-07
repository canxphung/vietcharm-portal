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

interface MysteryDestination {
  regionVi: string;
  regionEn: string;
  airportCode: string;
  hotelVi: string;
  hotelEn: string;
  packingVi: string;
  packingEn: string;
  itineraryVi: string[];
  itineraryEn: string[];
}

@Component({
  selector: 'app-blind-travel-page',
  standalone: true,
  imports: [FormsModule, DecimalPipe, RouterLink, LucideCheckCircle, LucideCompass, LucideFlame, LucideGift, LucidePlane, LucideShirt, LucideSparkles],
  templateUrl: './blind-travel.component.html',
  styleUrl: './blind-travel.component.css',
})
export class BlindTravelComponent {
  readonly isVi = computed(() => this.i18n.isVi());
  readonly today = new Date().toISOString().split('T')[0];
  readonly dayOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  readonly budget = signal(3800000);
  readonly days = signal(3);
  readonly departureDate = signal('2026-07-10');
  readonly departureTime = signal('Sáng Sớm (05:00 - 08:00)');
  readonly vibe = signal('chill');
  readonly dislikes = signal('climbing');
  readonly loading = signal(false);
  readonly loadingStep = signal('');
  readonly stage = signal<'idle' | 'loading' | 'sealed-box' | 'opened-gift'>('idle');
  readonly alertMsg = signal<string | null>(null);
  readonly mysteryDest = signal<MysteryDestination | null>(null);

  private timer?: ReturnType<typeof setInterval>;

  constructor(
    readonly i18n: I18nService,
    private readonly cart: CartService,
    private readonly ui: UiStateService,
  ) {}

  vibeOptions(): Array<{ value: string; icon: string; label: string }> {
    const vi = this.isVi();
    return [
      { value: 'chill', icon: '🌾', label: vi ? 'Chill di sản' : 'Chill Heritage' },
      { value: 'sea', icon: '🌊', label: vi ? 'Biển hoang sơ' : 'Secret Beaches' },
      { value: 'culture', icon: '🏺', label: vi ? 'Làng nghề' : 'Artisanal Villages' },
      { value: 'adventure', icon: '⛰️', label: vi ? 'Phiêu lưu' : 'Adventure' },
      { value: 'foodie', icon: '🍲', label: vi ? 'Ẩm thực' : 'Food Safari' },
      { value: 'healing', icon: '🧘', label: vi ? 'Chữa lành' : 'Wellness' },
      { value: 'photography', icon: '📸', label: vi ? 'Chụp ảnh' : 'Photo Hunt' },
      { value: 'nature', icon: '🚲', label: vi ? 'Sinh thái' : 'Eco Cycling' },
      { value: 'glamping', icon: '⛺', label: vi ? 'Glamping' : 'Glamping' },
      { value: 'luxury', icon: '🛥️', label: vi ? 'Sang trọng' : 'Luxury' },
      { value: 'art', icon: '🎨', label: vi ? 'Nghệ thuật' : 'Art Walk' },
      { value: 'cozy', icon: '☕', label: vi ? 'Cà phê sách' : 'Cozy Cafes' },
      { value: 'fisherman', icon: '🎣', label: vi ? 'Ngư dân' : 'Fishing' },
      { value: 'heritage', icon: '👘', label: vi ? 'Việt phục' : 'Heritage Dress' },
      { value: 'nightlife', icon: '🏮', label: vi ? 'Chợ đêm' : 'Night Markets' },
    ];
  }

  windowOptions(): Array<{ value: string; label: string }> {
    const vi = this.isVi();
    return [
      { value: 'Sáng Sớm (05:00 - 08:00)', label: '🌅 ' + (vi ? 'Sáng Sớm (05:00 - 08:00) - Ngắm bình minh' : 'Early Morning (05:00 - 08:00)') },
      { value: 'Sáng (08:00 - 11:00)', label: '☀️ ' + (vi ? 'Sáng (08:00 - 11:00) - Giờ đẹp thong thả' : 'Morning (08:00 - 11:00)') },
      { value: 'Trưa (11:00 - 13:00)', label: '🕛 ' + (vi ? 'Trưa (11:00 - 13:00) - Tiện ăn trưa' : 'Noon (11:00 - 13:00)') },
      { value: 'Đầu Chiều (13:00 - 15:00)', label: '☕ ' + (vi ? 'Đầu Chiều (13:00 - 15:00) - Check-in vừa kịp' : 'Early Afternoon (13:00 - 15:00)') },
      { value: 'Chiều Muộn (15:00 - 17:00)', label: '🌇 ' + (vi ? 'Chiều Muộn (15:00 - 17:00) - Tránh nắng' : 'Late Afternoon (15:00 - 17:00)') },
      { value: 'Hoàng Hôn (17:00 - 19:00)', label: '🌆 ' + (vi ? 'Hoàng Hôn (17:00 - 19:00) - Ngắm hoàng hôn' : 'Sunset Hours (17:00 - 19:00)') },
      { value: 'Tối (19:00 - 22:00)', label: '🌙 ' + (vi ? 'Tối (19:00 - 22:00) - Sau giờ tan làm' : 'Evening (19:00 - 22:00)') },
      { value: 'Đêm Khuya (22:00 - 01:00)', label: '🦉 ' + (vi ? 'Đêm Khuya (22:00 - 01:00) - Bay tiết kiệm' : 'Late Night (22:00 - 01:00)') },
      { value: 'Bay Đêm (01:00 - 05:00)', label: '✈️ ' + (vi ? 'Bay Đêm/Red-eye (01:00 - 05:00) - Ngủ trên máy bay' : 'Red-eye Flight (01:00 - 05:00)') },
      { value: 'Chuyến bay sớm nhất', label: '🥇 ' + (vi ? 'Chuyến sớm nhất trong ngày' : 'Earliest Flight of Day') },
      { value: 'Chuyến bay muộn nhất', label: '🏁 ' + (vi ? 'Chuyến muộn nhất trong ngày' : 'Latest Flight of Day') },
      { value: 'Tránh giờ cao điểm', label: '⚡ ' + (vi ? 'Tránh giờ cao điểm kẹt xe' : 'Avoid Rush Hours') },
      { value: 'Giờ hoàng gia', label: '👑 ' + (vi ? 'Giờ hoàng gia thong thả' : 'Royal Premium Hours') },
      { value: 'Tối ưu giá vé tốt nhất', label: '💎 ' + (vi ? 'Linh hoạt tối ưu giá rẻ nhất' : 'Cheapest Flexi Fare Option') },
      { value: 'Tàu hỏa/Xe giường nằm đêm', label: '🚂 ' + (vi ? 'Xe giường nằm/Tàu hỏa đêm' : 'Overnight Sleeper Train/Bus') },
    ];
  }

  dislikeOptions(): Array<{ value: string; label: string }> {
    const vi = this.isVi();
    return [
      { value: 'climbing', label: '🧗 ' + (vi ? 'Không thích leo núi cao dốc mệt' : 'No exhausting mountain hikes') },
      { value: 'crowds', label: '👥 ' + (vi ? 'Tránh bãi tắm thương mại xô bồ' : 'No overcrowded tourist traps') },
      { value: 'shopping', label: '🛍️ ' + (vi ? 'Ghét đi tour ép mua sắm bắt buộc' : 'No forced commercial shopping stops') },
      { value: 'walking', label: '🥵 ' + (vi ? 'Không thích đi bộ quá nhiều dưới trời nắng' : 'No heavy walking under the hot sun') },
      { value: 'noise', label: '🔊 ' + (vi ? 'Tránh xa bar/vũ trường ồn ào náo nhiệt' : 'No noisy bars & clubs') },
      { value: 'spicy', label: '🌶️ ' + (vi ? 'Không ăn được đồ quá cay nóng' : 'No extremely spicy/hot food') },
      { value: 'seafood', label: '🦐 ' + (vi ? 'Dị ứng/Ngại ăn đồ sống, hải sản gỏi' : 'No raw seafood/sashimi') },
      { value: 'rowing', label: '🚣 ' + (vi ? 'Sợ chèo thuyền thúng, say sóng nước' : 'No spinning baskets or seasickness') },
      { value: 'museums', label: '🏛️ ' + (vi ? 'Ngại tham quan bảo tàng, di tích khô khan' : 'No boring historical museum tours') },
      { value: 'rain', label: '☔ ' + (vi ? 'Tránh hoạt động ngoài trời lúc mưa gió' : 'No rainy outdoor activities') },
      { value: 'photos', label: '📷 ' + (vi ? 'Ngại xếp hàng chụp ảnh sống ảo mệt mỏi' : 'No queuing for visual poses') },
      { value: 'morning', label: '🛌 ' + (vi ? 'Không muốn thức dậy sớm trước 7h sáng' : 'No waking up early before 7 AM') },
      { value: 'kids', label: '👶 ' + (vi ? 'Tránh xa khu vui chơi trẻ em ồn ào' : 'No noisy children playground areas') },
      { value: 'animals', label: '🦟 ' + (vi ? 'Sợ côn trùng, động vật hoang dã' : 'No wild bugs or exotic animals') },
      { value: 'driving', label: '🚗 ' + (vi ? 'Không thích tự lái xe đường dài mệt mỏi' : 'No tedious long-distance driving') },
    ];
  }

  private alert(msg: string): void {
    this.alertMsg.set(msg);
    setTimeout(() => this.alertMsg.set(null), 6000);
  }

  private destinations(): MysteryDestination[] {
    return [
      {
        regionVi: 'Phố Cổ Hội An & Đầm nước Rừng dừa dật', regionEn: 'Ancient Town Hoi An & Secret Coconut Marshes', airportCode: 'DAD (Sân bay Đà Nẵng)',
        hotelVi: 'Resort boutique Di sản 5 sao biệt lập bên sông Thu Bồn', hotelEn: 'Secluded 5-star Heritage Boutique Riverside Resort',
        packingVi: 'Chuẩn bị váy áo lụa tơ tằm bồng bềnh, dép xỏ ngón mộc, đồ bơi rực rỡ và máy ảnh lấy ngay. VietCharm tặng kèm một nón lá cao cấp thêu tên bạn đặt sẵn tại sảnh.', packingEn: 'Pack flowy silk dresses, rustic slide sandals, bright swimsuits, and an instant camera. A custom-embroidered conical hat will be waiting at the reception.',
        itineraryVi: ['Ngày 1: Xe riêng đón sân bay & Thả hoa đăng cầu bình an sông Hoài dưới ngàn đèn lồng.', 'Ngày 2: Sáng sớm chèo thuyền thúng len lỏi rừng dừa nước, chiều học nấu mâm cơm di sản tại vườn rau hữu cơ.', 'Ngày 3: Thư giãn trị liệu thảo mộc truyền thống, ăn trưa ẩm thực Cao Lầu trứ danh & Tiễn bay.'],
        itineraryEn: ['Day 1: Private airport transfer & Lantern-releasing boat trip on Hoai River beneath thousands of silk lanterns.', 'Day 2: Sunrise spinning basket boat ride through coconut forests; afternoon heritage cooking class in an organic farm.', 'Day 3: Signature herbal wellness spa session, farewell lunch featuring local Cao Lau noodles, and private airport drop-off.'],
      },
      {
        regionVi: 'Biển xanh Quy Nhơn & Tháp Chăm Di sản ngàn năm', regionEn: 'Emerald Quy Nhon Beach & Ancient Thousand-Year Cham Towers', airportCode: 'UIH (Sân bay Phù Cát)',
        hotelVi: 'Biệt thự hướng biển vách đá hoang sơ Kỳ Co', hotelEn: 'Private Cliffside Oceanfront Villa in Ky Co',
        packingVi: 'Chuẩn bị quần áo linen thoáng mát, mũ cói rộng vành, kem chống nắng thân thiện rạn san hô, kính râm sành điệu. Gợi ý mang thêm trang phục màu trắng/be cổ điển để check-in Tháp Bánh Ít.', packingEn: 'Bring breathable linen outfits, wide-brim straw hats, reef-safe sunscreen, and retro sunglasses. We suggest classic white or beige attire for the Banh It Cham towers.',
        itineraryVi: ['Ngày 1: Đón rước về biệt thự vách đá, tối nghe nhạc jazz mộc mạc bên sóng biển vỗ rì rào.', 'Ngày 2: Cano riêng đi đảo Kỳ Co lặn ngắm san hô, chiều viếng quần thể Tháp Chăm linh thiêng rực nắng vàng.', 'Ngày 3: Đón bình minh tuyệt đỉnh Eo Gió, trưa thưởng thức lẩu cua huỳnh đế di sản & Tiễn sân bay.'],
        itineraryEn: ['Day 1: Private ride to the cliffside villa, cozy candlelight evening listening to beachside jazz acoustic rhythms.', 'Day 2: Private boat trip to Ky Co marine sanctuary; afternoon sun-drenched exploration of sacred Cham towers.', 'Day 3: Magical sunrise viewing at Eo Gio bay, signature local Curlew Crab hotpot feast, and airport transfer.'],
      },
    ];
  }

  run(): void {
    this.loading.set(true);
    this.stage.set('loading');
    const vi = this.isVi();
    const steps = vi
      ? ['🔮 Phân tích tâm lý & gu du lịch thế hệ mới...', '✈️ Đang thương lượng với các hãng hàng không chặng bay vàng...', '🏨 Gửi mã đặt chỗ kín tới hệ thống Resort Di sản 5 sao đối tác...', '🎁 Đóng gói phong thư bất ngờ chứa mã đặt chỗ độc bản...']
      : ['🔮 Analyzing psychological desires & generational taste...', '✈️ Sourcing exclusive charter flight corridors...', '🏨 Securing hidden inventory at boutique heritage villas...', '🎁 Packing your mystery oracle card in the lockbox...'];
    let idx = 0;
    this.loadingStep.set(steps[0]);
    this.timer = setInterval(() => {
      idx++;
      if (idx < steps.length) this.loadingStep.set(steps[idx]);
    }, 850);
    setTimeout(() => {
      if (this.timer) clearInterval(this.timer);
      this.loading.set(false);
      const v = this.vibe();
      const selected = v === 'sea' || v === 'glamping' || v === 'adventure' || v === 'fisherman' ? this.destinations()[1] : this.destinations()[0];
      this.mysteryDest.set(selected);
      this.stage.set('sealed-box');
      this.alert(vi ? '✓ Đã tạo thành công Lá Số Hành Trình Ẩn Số!' : '✓ Mystery Journey Oracle compiled successfully!');
    }, 3500);
  }

  openGift(): void {
    this.stage.set('opened-gift');
    this.alert(this.isVi() ? '🎁 Mở tung chiếc hộp quà - Hành trình ẩn số hiển lộ!' : '🎁 Surprise box unlocked! Unveiling your destination!');
  }

  reset(): void {
    this.stage.set('idle');
    this.mysteryDest.set(null);
  }

  book(): void {
    const dest = this.mysteryDest();
    if (!dest) return;
    const vi = this.isVi();
    const v = this.vibe();
    const item: BookingCartItem = {
      id: `blind-travel-mystery-${Date.now()}`,
      type: 'activity',
      name: vi ? `[Hành trình Ẩn Số] Vé máy bay khứ hồi & Resort bí mật` : `[Mystery Escape] Roundtrip Flight & 5-Star Secret Stay`,
      price: this.budget(),
      quantity: 1,
      image: v === 'sea' || v === 'glamping' || v === 'adventure' || v === 'fisherman' ? 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=500&q=80' : 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=500&q=80',
      details: vi
        ? `Thời gian: ${this.days()} ngày. Khởi hành ngày ${this.departureDate()} (${this.departureTime()}). Chi tiết điểm đến được niêm phong cho đến khi ra sân bay.`
        : `Duration: ${this.days()} Days. Depart on ${this.departureDate()} (${this.departureTime()}). Exact itinerary sealed until airport arrival.`,
    };
    this.ui.requireAuth(() => {
      this.cart.addCombo([item]);
      this.alert(vi ? '✓ Đã đóng gói chuyến đi bất ngờ vào giỏ hành lý!' : '✓ Loaded surprise getaway pack into your travel bundle!');
    }, vi ? 'Đăng nhập để đặt chuyến đi ẩn số.' : 'Sign in to book the mystery trip.');
  }
}
