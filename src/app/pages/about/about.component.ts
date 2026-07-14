import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '@/services/i18n.service';

interface StoryChapter {
  id: number;
  phaseVi: string;
  phaseEn: string;
  titleVi: string;
  titleEn: string;
  icon: string;
  image: string;
  captionVi: string;
  captionEn: string;
  paragraphsVi: string[];
  paragraphsEn: string[];
  markVi: string;
  markEn: string;
}

interface TeamMember {
  name: string;
  roleVi: string;
  roleEn: string;
  email: string;
  image: string;
  bioVi: string;
  bioEn: string;
}

interface CoreValue {
  icon: string;
  titleVi: string;
  titleEn: string;
  bodyVi: string;
  bodyEn: string;
}

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=1600&q=80',
];

@Component({
  selector: 'app-about-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css',
})
export class AboutComponent implements OnDestroy {
  readonly i18n = inject(I18nService);
  readonly isVi = computed(() => this.i18n.isVi());

  readonly heroImages = HERO_IMAGES;
  readonly heroIndex = signal(0);
  readonly activeChapter = signal(1);

  private readonly heroTimer = setInterval(() => {
    this.heroIndex.update((i) => (i + 1) % this.heroImages.length);
  }, 4500);

  ngOnDestroy(): void {
    clearInterval(this.heroTimer);
  }

  marqueeItems(): string[] {
    return this.isVi()
      ? ['Hỗ trợ nghệ nhân làng nghề', 'Công nghệ kể chuyện di sản', 'Khám phá di sản Việt', 'Hành trình ẩn số độc bản', 'Lữ hành xanh bền vững']
      : ['Supporting craft artisans', 'Tech that tells heritage stories', 'Discover Vietnamese heritage', 'One-of-a-kind mystery journeys', 'Green sustainable travel'];
  }

  chapter(): StoryChapter {
    return this.chapters().find((c) => c.id === this.activeChapter()) ?? this.chapters()[0];
  }

  chapters(): StoryChapter[] {
    return [
      {
        id: 1,
        phaseVi: 'Giai đoạn 1', phaseEn: 'Phase 1',
        titleVi: 'Chương 1: Khởi nguồn từ dòng Sông Hoài thơ mộng', titleEn: 'Chapter 1: Born by the poetic Hoai River',
        icon: 'bi-bank',
        image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1000&q=80',
        captionVi: 'Giấc mơ hồi sinh nét cổ kính trầm mặc của thương cảng xưa', captionEn: 'A dream of reviving the quiet charm of the old trading port',
        paragraphsVi: [
          'Mùa thu năm 2018, trong một buổi chiều hoàng hôn vàng vọt nhuộm thẫm những mái ngói âm dương rêu phong, bên quán trà mộc mạc nhìn ra dòng sông Hoài lấp lánh hàng trăm ánh đèn hoa đăng trôi lững lờ, một nhóm người trẻ tràn đầy nhiệt huyết lữ hành đã ngồi lại bên nhau. Chúng tôi cùng đau đáu trước một câu hỏi lớn: "Làm thế nào để đưa di sản lồng đèn rực rỡ và những bức tường vàng rêu phong huyền thoại của phố cổ Hội An đi vào lòng du khách trong và ngoài nước một cách chân thực nhất, sâu sắc nhất?".',
          'Từ ý tưởng bên chén trà ấy, VietCharm được nhen nhóm và ra đời. Chúng tôi không muốn tạo ra những chuyến đi cưỡi ngựa xem hoa thông thường, mà khát khao mở ra chiếc chìa khóa thời gian, đưa người lữ khách thực sự hòa nhập, sống và cảm nhận linh hồn di sản của mảnh đất Quảng Nam văn hiến.',
        ],
        paragraphsEn: [
          'In the autumn of 2018, as a golden sunset washed over mossy yin-yang tiled roofs, a group of passionate young travelers gathered at a rustic tea house overlooking the Hoai River, where hundreds of flower lanterns drifted by. One question kept us restless: "How can the radiant lantern heritage and legendary moss-gold walls of Hoi An reach travelers—at home and abroad—in the truest, deepest way?".',
          'From that idea over a pot of tea, VietCharm was born. We never wanted to run ordinary sightseeing trips; we longed to hand travelers a key to the past, letting them truly live within and feel the heritage soul of Quang Nam.',
        ],
        markVi: 'Khởi đầu từ chiếc bàn gỗ nhỏ đơn sơ nằm nép mình bên hông Chùa Cầu cổ kính.',
        markEn: 'It all began at a small wooden table tucked beside the ancient Japanese Covered Bridge.',
      },
      {
        id: 2,
        phaseVi: 'Giai đoạn 2', phaseEn: 'Phase 2',
        titleVi: 'Chương 2: Sứ mệnh Thắp sáng và Bảo tồn làng nghề', titleEn: 'Chapter 2: A mission to light up craft villages',
        icon: 'bi-lightbulb',
        image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1000&q=80',
        captionVi: 'Đôi bàn tay nghệ nhân giữ lửa nghề qua bao thế hệ', captionEn: 'Artisan hands keeping the craft flame alive across generations',
        paragraphsVi: [
          'Đi sâu vào từng con ngõ nhỏ, chúng tôi gặp những cụ nghệ nhân già của làng gốm Thanh Hà, làng mộc Kim Bồng vẫn thầm lặng giữ nghề giữa cơn lốc đô thị hóa. VietCharm chọn cho mình một sứ mệnh: mỗi tour trải nghiệm làng nghề đều trích một phần doanh thu nuôi dưỡng sinh kế các nghệ nhân cao tuổi, để ngọn lửa nghề trăm năm không bao giờ tắt.',
          'Chúng tôi kết nối trực tiếp du khách với xưởng gốm, khung cửi và bếp lửa bản địa — không qua trung gian, không kịch bản dàn dựng. Mỗi chiếc đèn lồng, mỗi sản phẩm gốm mộc du khách mang về đều là một câu chuyện thật của người thợ Quảng Nam.',
        ],
        paragraphsEn: [
          'Wandering deep into small alleys, we met elderly artisans of Thanh Ha pottery and Kim Bong carpentry quietly holding on to their craft against the tide of urbanisation. VietCharm chose its mission: every craft-village tour sets aside part of its revenue to sustain senior artisans, so the century-old flame never dies.',
          'We connect travelers directly with local kilns, looms and kitchens — no middlemen, no staged scripts. Every lantern and piece of rustic pottery carried home tells a true story of a Quang Nam craftsman.',
        ],
        markVi: 'Một phần doanh thu của mỗi tour làng nghề được gửi lại cho chính các nghệ nhân.',
        markEn: 'A share of every craft-village tour goes straight back to the artisans themselves.',
      },
      {
        id: 3,
        phaseVi: 'Giai đoạn 3', phaseEn: 'Phase 3',
        titleVi: 'Chương 3: Số hóa Văn hóa cùng Thế hệ sáng tạo', titleEn: 'Chapter 3: Digitising culture with a creative generation',
        icon: 'bi-cpu',
        image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1000&q=80',
        captionVi: 'Công nghệ trẻ kể lại câu chuyện trăm năm', captionEn: 'Young technology retelling hundred-year-old stories',
        paragraphsVi: [
          'Thế hệ sáng tạo của VietCharm tin rằng công nghệ sinh ra không phải để thay thế quá khứ, mà để kể chuyện lịch sử theo cách sinh động nhất. Từ đó, phòng lập kế hoạch nhóm Trip Room, Hành trình Ẩn số bất ngờ và thuật toán gợi ý lịch trình theo ngân sách lần lượt ra đời — biến việc lên kế hoạch vốn nhức đầu thành một trải nghiệm đầy cảm hứng.',
          'Toàn bộ cẩm nang di sản, địa điểm lân cận và dịch vụ bản địa được số hóa và cập nhật liên tục, để dù ở bất kỳ đâu, du khách cũng chạm được vào Hội An chỉ sau một cú nhấp chuột.',
        ],
        paragraphsEn: [
          'VietCharm’s creative generation believes technology exists not to replace the past, but to tell history in its most vivid form. That belief gave birth to the Trip Room group planner, the surprise Mystery Journey, and a budget-aware itinerary engine — turning stressful planning into an inspiring experience.',
          'Our entire heritage handbook, nearby places and local services are digitised and continuously updated, so travelers anywhere can touch Hoi An with a single click.',
        ],
        markVi: 'Trip Room, Hành trình Ẩn số và cẩm nang số — di sản trong tầm tay thế hệ mới.',
        markEn: 'Trip Room, Mystery Journey and the digital handbook — heritage within reach of a new generation.',
      },
      {
        id: 4,
        phaseVi: 'Giai đoạn 4', phaseEn: 'Phase 4',
        titleVi: 'Chương 4: Hành trình Xanh tiến vào Tương lai', titleEn: 'Chapter 4: A green journey into the future',
        icon: 'bi-tree',
        image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80',
        captionVi: 'Giữ phố cổ xanh cho trăm năm kế tiếp', captionEn: 'Keeping the old town green for the next hundred years',
        paragraphsVi: [
          'Tương lai của du lịch di sản phải là một tương lai xanh. VietCharm ưu tiên phương tiện năng lượng sạch, khuyến khích xe đạp và đi bộ trong lõi phố cổ, đồng thời giảm thiểu rác thải nhựa đè nặng lên hạ tầng trăm năm tuổi.',
          'Chúng tôi mơ về một Hội An mà mười năm nữa, con cháu của những nghệ nhân hôm nay vẫn thắp đèn lồng bên dòng sông Hoài trong veo — và VietCharm được góp một tay giữ gìn khung cảnh ấy.',
        ],
        paragraphsEn: [
          'The future of heritage travel must be green. VietCharm prioritises clean-energy transport, encourages cycling and walking within the old quarter, and works to cut the plastic waste weighing on century-old infrastructure.',
          'We dream of a Hoi An where, ten years from now, the artisans’ grandchildren still light lanterns beside a crystal-clear Hoai River — with VietCharm lending a hand to preserve that scene.',
        ],
        markVi: 'Ưu tiên di chuyển xanh và nói không với rác nhựa trong lõi di sản.',
        markEn: 'Green mobility first, and no plastic waste inside the heritage core.',
      },
    ];
  }

  team(): TeamMember[] {
    return [
      {
        name: 'Đỗ Tú Ngân',
        roleVi: 'Người sáng lập & Giám đốc điều hành (CEO & Founder)', roleEn: 'CEO & Founder',
        email: 'ngandtk244111@st.uel.edu.vn',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=500&q=80',
        bioVi: 'Là người con của mảnh đất miền Trung đầy nắng gió, Tú Ngân mang trong mình niềm đam mê cháy bỏng với các di sản văn hóa Việt Nam. Với hơn 8 năm kinh nghiệm trong ngành quản trị lữ hành, cô là linh hồn định hình tầm nhìn chiến lược cho VietCharm, kết nối tinh tế giữa giá trị truyền thống xưa cũ và tư duy lữ hành hiện đại.',
        bioEn: 'A daughter of Vietnam’s sun-drenched central coast, Tu Ngan carries a burning passion for Vietnamese cultural heritage. With over 8 years in travel management, she shapes VietCharm’s strategic vision, gracefully bridging old traditions and modern travel thinking.',
      },
      {
        name: 'Mai Thị Phương Thảo',
        roleVi: 'Giám đốc Sáng tạo Nội dung & Nghệ thuật (Creative Director)', roleEn: 'Creative Director',
        email: 'thaomtp@vietcharm.vn',
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80',
        bioVi: 'Sở hữu tâm hồn lãng mạn cùng gu thẩm mỹ tinh tế, Phương Thảo chịu trách nhiệm thổi hồn nghệ thuật vào từng trang nhật ký hành trình, các ấn phẩm và câu chuyện thương hiệu. Cô luôn tỉ mỉ chọn lọc từng gam màu vàng rêu, từng chi tiết đèn lồng để lưu giữ nguyên vẹn cái hồn thơ mộng của phố cổ xưa.',
        bioEn: 'With a romantic soul and refined taste, Phuong Thao breathes art into every journey journal, publication and brand story. She curates each moss-gold hue and lantern detail to preserve the poetic soul of the ancient town.',
      },
      {
        name: 'Trần Thảo Như',
        roleVi: 'Giám đốc Công nghệ (CTO)', roleEn: 'Chief Technology Officer',
        email: 'nhutt@vietcharm.vn',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80',
        bioVi: 'Thảo Như là bộ óc đứng sau hệ thống định tuyến thông minh của "Hành trình Ẩn số", phòng kết nối "Trip Room" đa người dùng và thuật toán gợi ý lịch trình theo ngân sách. Cô luôn tin rằng công nghệ tiên tiến sinh ra không phải để thay thế quá khứ, mà là để kể câu chuyện lịch sử theo cách kỳ thú và sinh động nhất.',
        bioEn: 'Thao Nhu is the mind behind the Mystery Journey routing, the multi-user Trip Room and the budget-aware itinerary engine. She believes advanced technology exists not to replace the past, but to tell history in its most fascinating, vivid way.',
      },
      {
        name: 'Phùng Sương Lý Băng',
        roleVi: 'Giám đốc Vận hành & Hợp tác Bản địa (COO)', roleEn: 'Chief Operating Officer',
        email: 'bangpsl@vietcharm.vn',
        image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=500&q=80',
        bioVi: 'Bằng sự khéo léo và thấu hiểu lòng dân, Lý Băng là cầu nối bền chặt giữa VietCharm và cộng đồng nghệ nhân tại các làng nghề truyền thống. Cô trực tiếp quản lý chuỗi cung ứng dịch vụ lữ hành xanh, điều phối các tour trải nghiệm gốm, mộc gỗ và nông trại xanh một cách hoàn hảo.',
        bioEn: 'With tact and a deep understanding of local communities, Ly Bang is the steadfast bridge between VietCharm and traditional craft villages. She directly manages the green travel supply chain, orchestrating pottery, carpentry and farm experiences to perfection.',
      },
      {
        name: 'Phùng Quang Thịnh',
        roleVi: 'Trưởng phòng Thiết kế Trải nghiệm Người dùng (Lead UI/UX Designer)', roleEn: 'Lead UI/UX Designer',
        email: 'thinhp@vietcharm.vn',
        image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=500&q=80',
        bioVi: 'Quang Thịnh là tác giả của toàn bộ giao diện sống động, những bức ảnh polaroid cổ điển và hệ thống mộc dấu lưu niệm tương tác của VietCharm. Anh không ngừng nghiên cứu hành vi người dùng trên mọi thiết bị để mang lại trải nghiệm mượt mà, đầy cảm xúc và đậm nét nghệ thuật lữ hành.',
        bioEn: 'Quang Thinh authored VietCharm’s vivid interface, vintage polaroid frames and interactive souvenir-stamp system. He relentlessly studies user behaviour across devices to deliver a smooth, emotional, artfully crafted travel experience.',
      },
    ];
  }

  values(): CoreValue[] {
    return [
      { icon: 'bi-shield-check', titleVi: '100% Bảo mật & Minh bạch', titleEn: '100% Secure & Transparent', bodyVi: 'Mọi dịch vụ từ khách sạn đến thuê xe đều có cam kết giá trực tiếp từ nhà cung cấp, tuyệt đối không phụ phí ẩn.', bodyEn: 'Every service, from hotels to rentals, carries direct supplier pricing with absolutely no hidden fees.' },
      { icon: 'bi-heart', titleVi: 'Tâm Huyết Bản Địa', titleEn: 'Local Devotion', bodyVi: 'Hỗ trợ bảo tồn và trích một phần doanh thu nuôi dưỡng sinh kế các nghệ nhân cao tuổi neo đơn giữ nghề cổ truyền.', bodyEn: 'We fund preservation and share revenue to sustain elderly artisans who keep traditional crafts alive.' },
      { icon: 'bi-tree', titleVi: 'Lữ Hành Xanh & Bền Vững', titleEn: 'Green & Sustainable Travel', bodyVi: 'Ưu tiên phương tiện năng lượng xanh, giảm thiểu rác thải nhựa đè nặng lên hạ tầng phố cổ trăm năm tuổi.', bodyEn: 'We prioritise clean-energy transport and cut the plastic waste burdening century-old town infrastructure.' },
      { icon: 'bi-stars', titleVi: 'Công Nghệ Phục Vụ Di Sản', titleEn: 'Technology Serving Heritage', bodyVi: 'Số hóa trải nghiệm đặt dịch vụ, phòng lập kế hoạch nhóm và cẩm nang di sản để văn hóa Việt đến gần thế hệ mới.', bodyEn: 'We digitise bookings, group planning and the heritage handbook so Vietnamese culture reaches a new generation.' },
    ];
  }
}
