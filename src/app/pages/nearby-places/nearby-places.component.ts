import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  LucideAlertCircle,
  LucideArrowLeft,
  LucideArrowRight,
  LucideArrowUpDown,
  LucideCalendarDays,
  LucideChevronDown,
  LucideCompass,
  LucideHeart,
  LucideHotel,
  LucideMap,
  LucideMapPin,
  LucideMapPinned,
  LucideMessageSquare,
  LucideNavigation,
  LucideSearch,
  LucideShieldCheck,
  LucideSlidersHorizontal,
  LucideSparkles,
  LucideStar,
  LucideUsersRound,
  LucideX,
} from '@lucide/angular';
import { ToastService } from '@/services/toast.service';
import { SERVICE_TABS, isServiceTab, type ServiceTab } from '@/constants/views';
import type { ViewableItem } from '@/types';
import { I18nService } from '@/services/i18n.service';
import { UiStateService } from '@/services/ui-state.service';
import { ItemCardComponent } from '@/components/item-card/item-card.component';
import { JourneyMapComponent } from '@/components/journey-map/journey-map.component';
import { RevealDirective } from '@/directives/reveal.directive';

interface PlaceReview {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
}

interface Place {
  id: string;
  nameVi: string;
  nameEn: string;
  categoryVi: string;
  categoryEn: string;
  descriptionVi: string;
  descriptionEn: string;
  distance: string;
  duration: string;
  coordinates: { x: number; y: number };
  images: string[];
  reviews: PlaceReview[];
  rating: number;
  totalReviews: number;
  historyVi: string;
  historyEn: string;
}

const INITIAL_PLACES: Place[] = [
  {
    id: 'pho-co-hoi-an', nameVi: 'Phố Cổ Hội An', nameEn: 'Hoi An Ancient Town', categoryVi: 'Di sản văn hóa', categoryEn: 'Cultural Heritage',
    descriptionVi: 'Phố cổ Hội An là một đô thị cổ nằm ở hạ lưu sông Thu Bồn, thuộc đồng bằng ven biển tỉnh Quảng Nam, cách Đà Nẵng khoảng 30 km về phía Nam. Nhờ những yếu tố địa lý và khí hậu thuận lợi, Hội An từng là một thương cảng quốc tế sầm uất.',
    descriptionEn: 'Hoi An Ancient Town is an exceptionally well-preserved example of a South-East Asian trading port from the 15th to the 19th century. Its buildings and street plan reflect indigenous and foreign influences combined into a unique heritage site.',
    distance: '1.2 km', duration: '5 phút đi bộ / 5 mins walk', coordinates: { x: 120, y: 150 },
    images: ['https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80'],
    rating: 4.9, totalReviews: 128,
    historyVi: 'Được UNESCO công nhận là Di sản văn hóa thế giới vào năm 1999. Nổi tiếng với những dãy nhà cổ sơn vàng, lồng đèn lung linh về đêm và các hội quán kiến trúc Hoa - Nhật hòa quyện.',
    historyEn: 'Designated a UNESCO World Heritage Site in 1999. Famed for its golden-painted heritage houses, glowing lanterns at night, and an exquisite architectural fusion of Chinese, Japanese, and Vietnamese styles.',
    reviews: [{ id: 'r1', author: 'Lê Minh', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80', rating: 5, date: '2026-06-20', comment: 'Không gian cổ kính tuyệt vời, đặc biệt là vào buổi tối khi đèn lồng được thắp sáng rực rỡ.' }, { id: 'r2', author: 'Sarah Jenkins', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', rating: 5, date: '2026-06-18', comment: 'An absolute masterpiece of historic preservation. The food here is outstanding too!' }],
  },
  {
    id: 'chua-cau', nameVi: 'Chùa Cầu (Cầu Nhật Bản)', nameEn: 'The Japanese Covered Bridge', categoryVi: 'Di sản văn hóa', categoryEn: 'Cultural Heritage',
    descriptionVi: 'Chùa Cầu là chiếc cầu cổ trong khu phố cổ Hội An, còn có tên là Cầu Nhật Bản hoặc Lai Viễn Kiều. Công trình được các thương nhân Nhật Bản khởi dựng vào khoảng đầu thế kỷ XVII, mang đậm nét kiến trúc độc đáo giao thoa.',
    descriptionEn: "The Japanese Covered Bridge is one of Hoi An's most iconic attractions. Built in the early 17th century by Japanese merchants, it features a unique combination of bridge and temple architecture, symbolizing historical friendship.",
    distance: '0.8 km', duration: '3 phút đi bộ / 3 mins walk', coordinates: { x: 100, y: 160 },
    images: ['https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80'],
    rating: 4.8, totalReviews: 95,
    historyVi: 'Cây cầu lịch sử này được in trên tờ tiền polymer 20.000 VND của Việt Nam. Đây là biểu tượng văn hóa vô giá của vùng đất di sản Hội An.',
    historyEn: "This historic bridge is featured on Vietnam's 20,000 VND polymer banknote. It represents the priceless cultural soul of the Hoi An heritage region.",
    reviews: [{ id: 'r3', author: 'Nguyễn Thảo', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80', rating: 4, date: '2026-06-15', comment: 'Kiến trúc gỗ rất tinh xảo, địa điểm check-in không thể bỏ qua.' }],
  },
  {
    id: 'rung-dua-bay-mau', nameVi: 'Rừng Dừa Bảy Mẫu', nameEn: 'Bay Mau Coconut Forest', categoryVi: 'Trải nghiệm sinh thái', categoryEn: 'Eco-experience',
    descriptionVi: 'Rừng dừa Bảy Mẫu thuộc xã Cẩm Thanh, thành phố Hội An. Trải nghiệm bơi thuyền thúng len lỏi trong rừng dừa nước bạt ngàn và thưởng thức màn múa thúng xoay vòng ngoạn mục từ những người dân chài mộc mạc địa phương.',
    descriptionEn: 'Located in Cam Thanh village, Bay Mau Coconut Forest offers an immersive experience of rowing traditional bamboo basket boats through emerald waterways flanked by coconut palms, alongside high-energy spinning performances.',
    distance: '4.5 km', duration: '10 phút taxi / 10 mins taxi', coordinates: { x: 320, y: 280 },
    images: ['https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'],
    rating: 4.7, totalReviews: 210,
    historyVi: 'Là căn cứ địa cách mạng kiên cường trong kháng chiến chống Mỹ, ngày nay rừng dừa đã trở thành một điểm du lịch sinh thái sông nước độc nhất vô nhị vùng Duyên hải miền Trung.',
    historyEn: "Once a strategic revolutionary base in wartime history, it has transformed into a globally renowned river eco-tourism destination highlighting Hoi An's rustic maritime hospitality.",
    reviews: [{ id: 'r4', author: 'Quốc Bảo', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80', rating: 5, date: '2026-06-22', comment: 'Cực kỳ vui nhộn! Trải nghiệm múa thúng xoay vòng rất đáng tiền và phấn khích.' }],
  },
  {
    id: 'bai-bien-an-bang', nameVi: 'Bãi Biển An Bàng', nameEn: 'An Bang Beach', categoryVi: 'Bãi biển & Thiên nhiên', categoryEn: 'Beach & Nature',
    descriptionVi: 'Bãi biển An Bàng nằm trong top những bãi biển đẹp nhất Châu Á. Nơi đây giữ được vẻ hoang sơ, bãi cát trắng mịn màng và nước biển trong xanh, thích hợp cho việc tắm nắng, thưởng thức hải sản và nghe tiếng sóng vỗ bình yên.',
    descriptionEn: "An Bang Beach is celebrated as one of Asia's most tranquil and beautiful coastal sanctuaries. Characterized by white soft sand, clean breaking waves, and trendy beachfront restaurants serving delicious fresh seafood.",
    distance: '3.0 km', duration: '8 phút taxi / 8 mins taxi', coordinates: { x: 260, y: 120 },
    images: ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=800&q=80'],
    rating: 4.8, totalReviews: 156,
    historyVi: 'An Bàng từng được các tạp chí quốc tế như CNN bình chọn vào danh sách những bãi biển quyến rũ nhất hành tinh nhờ vẻ đẹp nguyên sơ và không khí thư thái.',
    historyEn: 'An Bang has been voted by international media such as CNN as one of the most charming beaches on the planet thanks to its pristine beauty and relaxed atmosphere.',
    reviews: [{ id: 'r5', author: 'Elena Petrova', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80', rating: 5, date: '2026-06-19', comment: 'Super clean beach, very relaxed atmosphere compared to Da Nang. Love the beach bars!' }],
  },
  {
    id: 'lang-gom-thanh-ha', nameVi: 'Làng Gốm Thanh Hà', nameEn: 'Thanh Ha Pottery Village', categoryVi: 'Làng nghề truyền thống', categoryEn: 'Traditional Craft',
    descriptionVi: 'Làng gốm Thanh Hà ra đời từ cuối thế kỷ XV, nằm bên bờ sông Thu Bồn. Du khách được tận mắt xem nghệ nhân chuốt gốm bằng bàn xoay truyền thống và tự tay nặn những sản phẩm lưu niệm mộc mạc.',
    descriptionEn: 'Founded in the late 15th century on the banks of the Thu Bon River, Thanh Ha Pottery Village lets visitors watch artisans shape clay on traditional wheels and try crafting their own rustic souvenirs.',
    distance: '3.5 km', duration: '9 phút taxi / 9 mins taxi', coordinates: { x: 70, y: 240 },
    images: ['https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80'],
    rating: 4.6, totalReviews: 88,
    historyVi: 'Trải qua hơn 500 năm, làng gốm vẫn giữ nguyên kỹ thuật nung thủ công và là nơi cung cấp gạch ngói cho các công trình cổ của Hội An.',
    historyEn: 'Over 500 years old, the village preserves handmade firing techniques and once supplied bricks and tiles for the ancient constructions of Hoi An.',
    reviews: [{ id: 'r6', author: 'Trần Hòa', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80', rating: 5, date: '2026-06-12', comment: 'Trải nghiệm tự tay xoay gốm rất thú vị, giá vé hợp lý và người dân vô cùng thân thiện.' }],
  },
  {
    id: 'lang-rau-tra-que', nameVi: 'Làng Rau Trà Quế', nameEn: 'Tra Que Vegetable Village', categoryVi: 'Trải nghiệm sinh thái', categoryEn: 'Eco-experience',
    descriptionVi: 'Làng rau Trà Quế nổi tiếng với hơn 20 loại rau thơm được trồng theo phương pháp hữu cơ. Du khách hóa thân thành nông dân, cuốc đất, tưới rau bằng gàu sòng và thưởng thức bữa cơm quê thanh đạm.',
    descriptionEn: 'Tra Que Vegetable Village is famous for over 20 kinds of organic herbs. Visitors become farmers for a day — hoeing, watering with traditional scoops, and enjoying a wholesome countryside meal.',
    distance: '2.5 km', duration: '7 phút taxi / 7 mins taxi', coordinates: { x: 200, y: 200 },
    images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80'],
    rating: 4.7, totalReviews: 74,
    historyVi: 'Rau Trà Quế được bón bằng rong từ sông Cổ Cò tạo nên hương vị đặc trưng đậm đà, là nguyên liệu không thể thiếu trong các món ăn di sản Hội An.',
    historyEn: 'Tra Que herbs are fertilized with algae from the Co Co River, giving them a distinctive flavor essential to Hoi An heritage cuisine.',
    reviews: [{ id: 'r7', author: 'Mai Vy', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', rating: 5, date: '2026-06-14', comment: 'Rau rất sạch và thơm phức, được trải nghiệm tưới nước như nông dân xưa vô cùng ý nghĩa.' }],
  },
];

@Component({
  selector: 'app-nearby-places-page',
  standalone: true,
  imports: [FormsModule, RouterLink, LucideCompass, LucideHeart, LucideMapPin, LucideMessageSquare, LucideNavigation, LucideSearch, LucideStar, LucideX],
  templateUrl: './nearby-places.component.html',
  styleUrl: './nearby-places.component.css',
})
export class NearbyPlacesComponent {
  readonly places = signal<Place[]>(this.loadPlaces());
  readonly query = signal('');
  readonly category = signal('All');
  readonly activeId = signal<string | null>(null);
  readonly imageIdx = signal(0);
  readonly reviewerName = signal('');
  readonly reviewRating = signal(5);
  readonly reviewComment = signal('');

  readonly active = computed(() => this.places().find((p) => p.id === this.activeId()) ?? null);
  readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const cat = this.category();
    return this.places().filter((p) => {
      const matchQ = !q || `${p.nameVi} ${p.nameEn} ${p.descriptionVi} ${p.descriptionEn}`.toLowerCase().includes(q);
      const matchC = cat === 'All' || p.categoryVi === cat || p.categoryEn === cat;
      return matchQ && matchC;
    });
  });

  constructor(
    readonly i18n: I18nService,
    readonly ui: UiStateService,
  ) {}

  private loadPlaces(): Place[] {
    if (typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem('vc_nearby_places');
        if (saved) return JSON.parse(saved) as Place[];
      } catch {
        // ignore malformed cache
      }
    }
    return INITIAL_PLACES;
  }

  private persist(next: Place[]): void {
    this.places.set(next);
    if (typeof localStorage !== 'undefined') localStorage.setItem('vc_nearby_places', JSON.stringify(next));
  }

  categories(): Array<{ value: string; label: string }> {
    const vi = this.i18n.isVi();
    return [
      { value: 'All', label: vi ? 'Tất cả địa điểm' : 'All places' },
      { value: 'Di sản văn hóa', label: vi ? 'Di sản văn hóa' : 'Cultural Heritage' },
      { value: 'Bãi biển & Thiên nhiên', label: vi ? 'Bãi biển & Thiên nhiên' : 'Beach & Nature' },
      { value: 'Trải nghiệm sinh thái', label: vi ? 'Trải nghiệm sinh thái' : 'Eco-experience' },
      { value: 'Làng nghề truyền thống', label: vi ? 'Làng nghề truyền thống' : 'Traditional Craft' },
    ];
  }

  stars(n: number): string {
    return '★'.repeat(n);
  }

  select(place: Place): void {
    this.activeId.set(place.id);
    this.imageIdx.set(0);
  }

  asItem(place: Place): ViewableItem {
    const vi = this.i18n.isVi();
    return {
      id: place.id,
      type: 'nearby-place',
      name: vi ? place.nameVi : place.nameEn,
      image: place.images[0],
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

  view(place: Place): void {
    this.ui.viewItem(this.asItem(place));
  }

  addReview(place: Place): void {
    if (!this.reviewerName().trim() || !this.reviewComment().trim()) return;
    const newReview: PlaceReview = {
      id: `review-${Date.now()}`,
      author: this.reviewerName(),
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      rating: this.reviewRating(),
      date: new Date().toISOString().split('T')[0],
      comment: this.reviewComment(),
    };
    const next = this.places().map((p) => {
      if (p.id !== place.id) return p;
      const reviews = [newReview, ...p.reviews];
      const avg = Number((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1));
      return { ...p, reviews, rating: avg, totalReviews: reviews.length };
    });
    this.persist(next);
    this.reviewerName.set('');
    this.reviewComment.set('');
    this.reviewRating.set(5);
  }
}
