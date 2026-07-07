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

type HandbookTab = 'history' | 'lantern' | 'culinary' | 'tips' | 'banahills' | 'hue_royal' | 'haivan_pass' | 'tailoring';

@Component({
  selector: 'app-handbook-page',
  standalone: true,
  imports: [],
  templateUrl: './handbook.component.html',
  styleUrl: './handbook.component.css',
})
export class HandbookComponent {
  readonly activeTab = signal<HandbookTab>('history');
  readonly active = computed(() => this.data()[this.activeTab()]);

  constructor(readonly i18n: I18nService) {}

  tabs(): Array<{ id: HandbookTab; label: string }> {
    const vi = this.i18n.isVi();
    return [
      { id: 'history', label: vi ? 'Lịch sử Hội An' : 'Hoi An Lore' },
      { id: 'lantern', label: vi ? 'Lễ rằm Sông Hoài' : 'Lantern Festival' },
      { id: 'culinary', label: vi ? 'Ẩm thực cổ truyền' : 'Culinary Arts' },
      { id: 'tips', label: vi ? 'Ứng xử Di sản' : 'Insider Tips' },
      { id: 'banahills', label: vi ? 'Sương mây Bà Nà' : 'Ba Na Hills' },
      { id: 'hue_royal', label: vi ? 'Nhã nhạc Ca Huế' : 'Royal Court' },
      { id: 'haivan_pass', label: vi ? 'Phượt Hải Vân' : 'Hai Van Pass' },
      { id: 'tailoring', label: vi ? 'May đo lấy liền' : 'Tailoring' },
    ];
  }

  private data(): Record<HandbookTab, { title: string; img: string; p1: string; p2: string }> {
    const vi = this.i18n.isVi();
    return {
      history: {
        title: vi ? 'Lịch sử thăng trầm của thương cảng Hội An' : 'Hoi An Historical Footprints',
        img: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&w=800&q=80',
        p1: vi ? 'Hội An, ban đầu là cảng biển Lâm Ấp của Vương quốc Champa cổ, từ thế kỷ XV đã vươn lên thành thương cảng quốc tế sầm uất bậc nhất Đông Nam Á của Đại Việt dưới thời chúa Nguyễn. Nơi đây từng là điểm neo đậu lý tưởng của các thuyền buôn từ Nhật Bản, Trung Hoa, Hà Lan, Bồ Đào Nha tìm kiếm hồ tiêu, gốm sứ và tơ lụa cao cấp.' : 'Originally a crucial maritime gateway for the ancient Champa Kingdom known as Lam Ap, Hoi An flourished into one of the busiest international trading ports in Southeast Asia from the 15th to the 19th centuries under the Nguyen Lords, serving merchants from Japan, China, and Europe.',
        p2: vi ? 'Nhờ sự chuyển hướng dòng chảy sông Thu Bồn đầu thế kỷ XIX, Hội An vô tình bị "bỏ quên" khỏi guồng quay đô thị hóa hiện đại. Chính sự cô lập địa lý đó đã giúp bảo tồn nguyên vẹn hơn 1000 ngôi nhà gỗ, đền đài, hội quán gia tộc mang đậm kiến trúc giao thoa đa văn hóa Việt - Nhật - Hoa độc nhất vô nhị.' : 'The silting of the Thu Bon river mouth in the early 19th century isolated the town from modern industrialization, preserving over 1,000 wooden heritage houses and assembly halls, leading to its declaration as a UNESCO World Heritage site.',
      },
      lantern: {
        title: vi ? 'Lễ hội Đèn lồng & Sắc đêm Sông Hoài' : 'Lantern Festival & Sông Hoài Romance',
        img: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
        p1: vi ? 'Nếu có dịp ghé thăm Hội An vào ngày 14 Âm lịch hàng tháng (Đêm rằm phố cổ), du khách sẽ lạc bước vào không gian thần tiên cổ tích khi toàn bộ khu phố cổ tắt hết ánh sáng đèn điện, nhường chỗ cho hàng ngàn cánh đèn lồng lụa vẽ chữ thư pháp rực rỡ sắc màu treo dọc mái ngói rêu phong.' : 'Held on the 14th day of every lunar month, the Lantern Festival sees the entire historic old town switch off all fluorescent lights, letting traditional silk lanterns illuminate the ancient houses in warm cosmic glows.',
        p2: vi ? 'Hãy lên một chiếc thuyền gỗ mộc mạc của các cô chú lái đò bên bờ sông Hoài, mua một chiếc đèn hoa đăng làm bằng giấy thủ công với ngọn nến nhỏ chỉ 10,000đ, thắp sáng điều ước lãng mạn của mình và thả trôi bồng bềnh xuôi theo dòng nước lung linh hư ảo.' : 'Take a gentle wooden boat ride on Sông Hoài river, buy handcrafted paper candle lanterns, and send your innermost wishes floating along the glittering river waters.',
      },
      culinary: {
        title: vi ? 'Tinh hoa Ẩm thực: Mì Quảng, Cao Lầu, Nước Mót' : 'Culinary Masterpieces: Cao Lau, My Quang & Mot',
        img: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80',
        p1: vi ? 'Cao Lầu không chỉ là một món ăn, mà là một lát cắt văn hóa lịch sử Hội An. Sợi mì có màu vàng đục, dai giòn sần sật đặc trưng nhờ được nhào trộn với nước giếng cổ Bá Lễ ngàn năm và tro rơm đốt từ cù lao Chàm, ăn kèm thịt xá xíu thái mỏng, tóp mỡ chiên giòn rụm và rau thơm Trà Quế nồng nàn.' : 'Cao Lau represents a physical slice of Hoi An culinary history. The thick noodles must be made with water from the thousand-year-old Ba Well and ash from Cham Island straw, producing an elastic chewiness served with roast pork and local greens.',
        p2: vi ? 'Bên cạnh đó, đừng quên nếm thử Mì Quảng đậm đà nước dùng, bánh mì Phượng lừng danh giòn rụm béo ngậy pate, và nhâm nhi một ly nước thảo mộc Mót mát lạnh được đun từ sả, chanh, cam thảo và trang trí bằng cánh sen lãng mạn.' : 'Additionally, make sure to experience a bowl of savory My Quang, a crispy Banh Mi Phượng with fatty liver pâté, and sip on a cup of herbal Mot tea infused with lemongrass, licorice, and fresh lotus petals.',
      },
      tips: {
        title: vi ? 'Kinh nghiệm dạo bước & Quy tắc ứng xử di sản' : 'Travel Etiquette & Local Insider Secrets',
        img: 'https://images.unsplash.com/photo-1596484552834-6a58bc238517?auto=format&fit=crop&w=800&q=80',
        p1: vi ? '1. Thời điểm lý tưởng: Buổi sáng sớm khoảng 6h - 8h là lúc phố cổ bình yên nhất, không ồn ào khói xe, rất thích hợp chụp những bức ảnh kiến trúc rêu phong thuần khiết. 2. Trang phục: Vui lòng mặc quần áo kín vai và quá đầu gối khi tham quan các ngôi nhà cổ, hội quán và Chùa Cầu để thể hiện sự tôn trọng tôn nghiêm.' : '1. Golden Hour: Wander the streets from 6 AM to 8 AM to enjoy serene, empty ancient lanes under fresh morning light. 2. Heritage Code: Ensure shoulders and knees are modestly covered when entering ancient family houses, shrines, and the historic Japanese Covered Bridge.',
        p2: vi ? '3. Vé tham quan: Hãy mua vé trọn gói tại quầy bán vé của phố cổ để ủng hộ quỹ trùng tu bảo tồn. Chỉ một chiếc vé nhỏ của bạn đã góp phần giữ gìn mái ngói Hội An sừng sững trước mưa bão miền Trung hàng năm.' : '3. Conservation Support: Purchasing official entrance tickets directly funds the local artisan renovation teams, protecting these fragile wooden buildings from seasonal typhoons.',
      },
      banahills: {
        title: vi ? 'Bà Nà Hills & Khám phá Làng Pháp trong sương mây' : 'Bà Nà Hills & French Village in Clouds',
        img: 'https://images.unsplash.com/photo-1583244532610-2a234e7c3ecd?auto=format&fit=crop&w=800&q=80',
        p1: vi ? 'Tọa lạc trên đỉnh núi Chúa hùng vĩ ở độ cao 1,487m, Bà Nà Hills tựa như một góc châu Âu cổ kính lơ lửng giữa mây ngàn. Khí hậu bốn mùa hội tụ trong cùng một ngày vô cùng mát mẻ sảng khoái kỳ vĩ.' : 'Perched on the majestic peak of Mount Chua at 1,487m, Ba Na Hills feels like a piece of vintage Europe floating among high mountain clouds. Experience four distinct seasons in a single day.',
        p2: vi ? 'Biểu tượng không thể bỏ lỡ chính là Cầu Vàng (Golden Bridge) lừng danh thế giới, nâng đỡ bởi đôi bàn tay khổng lồ rêu phong vươn ra từ vách đá cheo leo, tạo nên địa điểm check-in tuyệt mỹ của mọi hành trình.' : 'The must-see highlight is the world-renowned Golden Bridge, supported by two mossy stone giant hands stretching from steep cliffs. It serves as an ultimate scenic checkpoint.',
      },
      hue_royal: {
        title: vi ? 'Nhã nhạc Cung đình Huế: Bản hòa ca vương giả hoàng gia' : 'Hue Royal Court Music: Imperial Harmonies',
        img: 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=800&q=80',
        p1: vi ? 'Được UNESCO vinh danh là Kiệt tác di sản truyền khẩu và phi vật thể của nhân loại, Nhã nhạc Cung đình Huế là dòng nhạc chính thống quý phái của triều đình phong kiến nhà Nguyễn xưa tấu bởi dàn nhạc nhạc cụ cổ truyền tinh xảo.' : 'Inscribed by UNESCO as a Masterpiece of the Oral and Intangible Heritage of Humanity, Nhã nhạc represents the noble, formal court music of the historic Nguyen Dynasty, played with traditional wind, string, and percussion instruments.',
        p2: vi ? 'Hãy lên những chiếc thuyền rồng trôi êm đềm trên dòng sông Hương khi hoàng hôn buông xuống, thả đèn hoa đăng lung linh cầu an lành và thưởng thức những làn điệu dân ca ngọt ngào say đắm lòng người.' : 'Board a colorful dragon boat drifting gently on the Perfume River at dusk, light up candle-lit paper lanterns, and listen to these royal and traditional folk melodies.',
      },
      haivan_pass: {
        title: vi ? 'Kinh nghiệm phượt Đèo Hải Vân bằng xe máy an toàn' : 'Hai Van Pass Scooter Adventure Guide',
        img: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=800&q=80',
        p1: vi ? 'Được mô tả là một trong những con đường ven biển hiểm trở đẹp nhất thế giới, đèo Hải Vân uốn lượn uốn khúc dài 21km ôm trọn eo biển lộng gió hùng vĩ mây phủ bồng bềnh tuyệt đẹp.' : 'Hailed as one of the best coastal roads in the world, the 21km winding road over Hai Van Pass offers sweeping ocean panoramas and is best explored on two wheels for ultimate freedom.',
        p2: vi ? 'Mẹo an toàn: Hãy thuê xe máy số hoặc xe côn tay mạnh mẽ, kiểm tra phanh kỹ trước khi leo đèo. Đi chậm ở khúc cua tay áo, tránh phượt lúc trời mưa và dừng chân thưởng thức cà phê ở đỉnh đèo Hải Vân Quan.' : 'Safety Guide: Choose a reliable manual bike with serviced brakes. Ride slow around blind hairpin curves, avoid foggy rainy days, and stop at the historic gate "Hải Vân Quan" for photos.',
      },
      tailoring: {
        title: vi ? 'Nghệ thuật may đo "nóng" lấy liền Hội An nức tiếng' : 'The Art of Hoi An Express Custom Tailoring',
        img: 'https://images.unsplash.com/photo-1596484552834-6a58bc238517?auto=format&fit=crop&w=800&q=80',
        p1: vi ? 'Hội An nổi tiếng thế giới với dịch vụ may đo váy áo, comple lấy nhanh siêu tốc chỉ trong vài tiếng đồng hồ vừa vặn hoàn hảo, chế tác thủ công tinh xảo dưới bàn tay tài hoa của thợ may bản địa.' : 'Hoi An is internationally celebrated for its speed-tailoring shops that craft bespoke dresses, suits, and traditional Ao Dai within just a few hours. Master tailors deliver perfect fits.',
        p2: vi ? 'Kinh nghiệm: Hãy chọn mẫu thiết kế ưa thích trước, chọn chất liệu vải lụa tơ tằm mềm mịn. Thực hiện lấy số đo vào buổi sáng và bạn có thể nhận bộ trang phục lộng lẫy ngay vào buổi chiều cùng ngày.' : 'Pro-tip: Browse styles beforehand, select high-grade mulberry silk, take measurements in the morning, and enjoy a final fitting on the very same afternoon!',
      },
    };
  }
}
