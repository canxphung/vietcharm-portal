/** Seed MongoDB-backed content for the handbook, nearby places, and support pages. */
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vietcharm';

const handbookEntries = [
  {
    id: 'history',
    order: 1,
    labelVi: 'Lịch sử Hội An',
    labelEn: 'Hoi An Lore',
    titleVi: 'Lịch sử thăng trầm của thương cảng Hội An',
    titleEn: 'Hoi An Historical Footprints',
    image:
      'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&w=800&q=80',
    paragraphsVi: [
      'Hội An, ban đầu là cảng biển Lâm Ấp của Vương quốc Champa cổ, từ thế kỷ XV đã vươn lên thành thương cảng quốc tế sầm uất bậc nhất Đông Nam Á của Đại Việt dưới thời chúa Nguyễn. Nơi đây từng là điểm neo đậu lý tưởng của các thuyền buôn từ Nhật Bản, Trung Hoa, Hà Lan, Bồ Đào Nha tìm kiếm hồ tiêu, gốm sứ và tơ lụa cao cấp.',
      'Nhờ sự chuyển hướng dòng chảy sông Thu Bồn đầu thế kỷ XIX, Hội An vô tình bị "bỏ quên" khỏi guồng quay đô thị hóa hiện đại. Chính sự cô lập địa lý đó đã giúp bảo tồn nguyên vẹn hơn 1000 ngôi nhà gỗ, đền đài, hội quán gia tộc mang đậm kiến trúc giao thoa đa văn hóa Việt - Nhật - Hoa độc nhất vô nhị.',
    ],
    paragraphsEn: [
      'Originally a crucial maritime gateway for the ancient Champa Kingdom known as Lam Ap, Hoi An flourished into one of the busiest international trading ports in Southeast Asia from the 15th to the 19th centuries under the Nguyen Lords, serving merchants from Japan, China, and Europe.',
      'The silting of the Thu Bon river mouth in the early 19th century isolated the town from modern industrialization, preserving over 1,000 wooden heritage houses and assembly halls, leading to its declaration as a UNESCO World Heritage site.',
    ],
  },
  {
    id: 'lantern',
    order: 2,
    labelVi: 'Lễ rằm Sông Hoài',
    labelEn: 'Lantern Festival',
    titleVi: 'Lễ hội Đèn lồng & Sắc đêm Sông Hoài',
    titleEn: 'Lantern Festival & Sông Hoài Romance',
    image:
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
    paragraphsVi: [
      'Nếu có dịp ghé thăm Hội An vào ngày 14 Âm lịch hàng tháng (Đêm rằm phố cổ), du khách sẽ lạc bước vào không gian thần tiên cổ tích khi toàn bộ khu phố cổ tắt hết ánh sáng đèn điện, nhường chỗ cho hàng ngàn cánh đèn lồng lụa vẽ chữ thư pháp rực rỡ sắc màu treo dọc mái ngói rêu phong.',
      'Hãy lên một chiếc thuyền gỗ mộc mạc của các cô chú lái đò bên bờ sông Hoài, mua một chiếc đèn hoa đăng làm bằng giấy thủ công với ngọn nến nhỏ chỉ 10,000đ, thắp sáng điều ước lãng mạn của mình và thả trôi bồng bềnh xuôi theo dòng nước lung linh hư ảo.',
    ],
    paragraphsEn: [
      'Held on the 14th day of every lunar month, the Lantern Festival sees the entire historic old town switch off all fluorescent lights, letting traditional silk lanterns illuminate the ancient houses in warm cosmic glows.',
      'Take a gentle wooden boat ride on Sông Hoài river, buy handcrafted paper candle lanterns, and send your innermost wishes floating along the glittering river waters.',
    ],
  },
  {
    id: 'culinary',
    order: 3,
    labelVi: 'Ẩm thực cổ truyền',
    labelEn: 'Culinary Arts',
    titleVi: 'Tinh hoa Ẩm thực: Mì Quảng, Cao Lầu, Nước Mót',
    titleEn: 'Culinary Masterpieces: Cao Lau, My Quang & Mot',
    image:
      'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80',
    paragraphsVi: [
      'Cao Lầu không chỉ là một món ăn, mà là một lát cắt văn hóa lịch sử Hội An. Sợi mì có màu vàng đục, dai giòn sần sật đặc trưng nhờ được nhào trộn với nước giếng cổ Bá Lễ ngàn năm và tro rơm đốt từ cù lao Chàm, ăn kèm thịt xá xíu thái mỏng, tóp mỡ chiên giòn rụm và rau thơm Trà Quế nồng nàn.',
      'Bên cạnh đó, đừng quên nếm thử Mì Quảng đậm đà nước dùng, bánh mì Phượng lừng danh giòn rụm béo ngậy pate, và nhâm nhi một ly nước thảo mộc Mót mát lạnh được đun từ sả, chanh, cam thảo và trang trí bằng cánh sen lãng mạn.',
    ],
    paragraphsEn: [
      'Cao Lau represents a physical slice of Hoi An culinary history. The thick noodles must be made with water from the thousand-year-old Ba Well and ash from Cham Island straw, producing an elastic chewiness served with roast pork and local greens.',
      'Additionally, make sure to experience a bowl of savory My Quang, a crispy Banh Mi Phượng with fatty liver pâté, and sip on a cup of herbal Mot tea infused with lemongrass, licorice, and fresh lotus petals.',
    ],
  },
  {
    id: 'tips',
    order: 4,
    labelVi: 'Ứng xử Di sản',
    labelEn: 'Insider Tips',
    titleVi: 'Kinh nghiệm dạo bước & Quy tắc ứng xử di sản',
    titleEn: 'Travel Etiquette & Local Insider Secrets',
    image:
      'https://images.unsplash.com/photo-1596484552834-6a58bc238517?auto=format&fit=crop&w=800&q=80',
    paragraphsVi: [
      '1. Thời điểm lý tưởng: Buổi sáng sớm khoảng 6h - 8h là lúc phố cổ bình yên nhất, không ồn ào khói xe, rất thích hợp chụp những bức ảnh kiến trúc rêu phong thuần khiết. 2. Trang phục: Vui lòng mặc quần áo kín vai và quá đầu gối khi tham quan các ngôi nhà cổ, hội quán và Chùa Cầu để thể hiện sự tôn trọng tôn nghiêm.',
      '3. Vé tham quan: Hãy mua vé trọn gói tại quầy bán vé của phố cổ để ủng hộ quỹ trùng tu bảo tồn. Chỉ một chiếc vé nhỏ của bạn đã góp phần giữ gìn mái ngói Hội An sừng sững trước mưa bão miền Trung hàng năm.',
    ],
    paragraphsEn: [
      '1. Golden Hour: Wander the streets from 6 AM to 8 AM to enjoy serene, empty ancient lanes under fresh morning light. 2. Heritage Code: Ensure shoulders and knees are modestly covered when entering ancient family houses, shrines, and the historic Japanese Covered Bridge.',
      '3. Conservation Support: Purchasing official entrance tickets directly funds the local artisan renovation teams, protecting these fragile wooden buildings from seasonal typhoons.',
    ],
  },
  {
    id: 'banahills',
    order: 5,
    labelVi: 'Sương mây Bà Nà',
    labelEn: 'Ba Na Hills',
    titleVi: 'Bà Nà Hills & Khám phá Làng Pháp trong sương mây',
    titleEn: 'Bà Nà Hills & French Village in Clouds',
    image:
      'https://images.unsplash.com/photo-1583244532610-2a234e7c3ecd?auto=format&fit=crop&w=800&q=80',
    paragraphsVi: [
      'Tọa lạc trên đỉnh núi Chúa hùng vĩ ở độ cao 1,487m, Bà Nà Hills tựa như một góc châu Âu cổ kính lơ lửng giữa mây ngàn. Khí hậu bốn mùa hội tụ trong cùng một ngày vô cùng mát mẻ sảng khoái kỳ vĩ.',
      'Biểu tượng không thể bỏ lỡ chính là Cầu Vàng (Golden Bridge) lừng danh thế giới, nâng đỡ bởi đôi bàn tay khổng lồ rêu phong vươn ra từ vách đá cheo leo, tạo nên địa điểm check-in tuyệt mỹ của mọi hành trình.',
    ],
    paragraphsEn: [
      'Perched on the majestic peak of Mount Chua at 1,487m, Ba Na Hills feels like a piece of vintage Europe floating among high mountain clouds. Experience four distinct seasons in a single day.',
      'The must-see highlight is the world-renowned Golden Bridge, supported by two mossy stone giant hands stretching from steep cliffs. It serves as an ultimate scenic checkpoint.',
    ],
  },
  {
    id: 'hue_royal',
    order: 6,
    labelVi: 'Nhã nhạc Ca Huế',
    labelEn: 'Royal Court',
    titleVi: 'Nhã nhạc Cung đình Huế: Bản hòa ca vương giả hoàng gia',
    titleEn: 'Hue Royal Court Music: Imperial Harmonies',
    image:
      'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=800&q=80',
    paragraphsVi: [
      'Được UNESCO vinh danh là Kiệt tác di sản truyền khẩu và phi vật thể của nhân loại, Nhã nhạc Cung đình Huế là dòng nhạc chính thống quý phái của triều đình phong kiến nhà Nguyễn xưa tấu bởi dàn nhạc nhạc cụ cổ truyền tinh xảo.',
      'Hãy lên những chiếc thuyền rồng trôi êm đềm trên dòng sông Hương khi hoàng hôn buông xuống, thả đèn hoa đăng lung linh cầu an lành và thưởng thức những làn điệu dân ca ngọt ngào say đắm lòng người.',
    ],
    paragraphsEn: [
      'Inscribed by UNESCO as a Masterpiece of the Oral and Intangible Heritage of Humanity, Nhã nhạc represents the noble, formal court music of the historic Nguyen Dynasty, played with traditional wind, string, and percussion instruments.',
      'Board a colorful dragon boat drifting gently on the Perfume River at dusk, light up candle-lit paper lanterns, and listen to these royal and traditional folk melodies.',
    ],
  },
  {
    id: 'haivan_pass',
    order: 7,
    labelVi: 'Phượt Hải Vân',
    labelEn: 'Hai Van Pass',
    titleVi: 'Kinh nghiệm phượt Đèo Hải Vân bằng xe máy an toàn',
    titleEn: 'Hai Van Pass Scooter Adventure Guide',
    image:
      'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=800&q=80',
    paragraphsVi: [
      'Được mô tả là một trong những con đường ven biển hiểm trở đẹp nhất thế giới, đèo Hải Vân uốn lượn uốn khúc dài 21km ôm trọn eo biển lộng gió hùng vĩ mây phủ bồng bềnh tuyệt đẹp.',
      'Mẹo an toàn: Hãy thuê xe máy số hoặc xe côn tay mạnh mẽ, kiểm tra phanh kỹ trước khi leo đèo. Đi chậm ở khúc cua tay áo, tránh phượt lúc trời mưa và dừng chân thưởng thức cà phê ở đỉnh đèo Hải Vân Quan.',
    ],
    paragraphsEn: [
      'Hailed as one of the best coastal roads in the world, the 21km winding road over Hai Van Pass offers sweeping ocean panoramas and is best explored on two wheels for ultimate freedom.',
      'Safety Guide: Choose a reliable manual bike with serviced brakes. Ride slow around blind hairpin curves, avoid foggy rainy days, and stop at the historic gate "Hải Vân Quan" for photos.',
    ],
  },
  {
    id: 'tailoring',
    order: 8,
    labelVi: 'May đo lấy liền',
    labelEn: 'Tailoring',
    titleVi: 'Nghệ thuật may đo "nóng" lấy liền Hội An nức tiếng',
    titleEn: 'The Art of Hoi An Express Custom Tailoring',
    image:
      'https://images.unsplash.com/photo-1596484552834-6a58bc238517?auto=format&fit=crop&w=800&q=80',
    paragraphsVi: [
      'Hội An nổi tiếng thế giới với dịch vụ may đo váy áo, comple lấy nhanh siêu tốc chỉ trong vài tiếng đồng hồ vừa vặn hoàn hảo, chế tác thủ công tinh xảo dưới bàn tay tài hoa của thợ may bản địa.',
      'Kinh nghiệm: Hãy chọn mẫu thiết kế ưa thích trước, chọn chất liệu vải lụa tơ tằm mềm mịn. Thực hiện lấy số đo vào buổi sáng và bạn có thể nhận bộ trang phục lộng lẫy ngay vào buổi chiều cùng ngày.',
    ],
    paragraphsEn: [
      'Hoi An is internationally celebrated for its speed-tailoring shops that craft bespoke dresses, suits, and traditional Ao Dai within just a few hours. Master tailors deliver perfect fits.',
      'Pro-tip: Browse styles beforehand, select high-grade mulberry silk, take measurements in the morning, and enjoy a final fitting on the very same afternoon!',
    ],
  },
];

const nearbyPlaces = [
  {
    id: 'pho-co-hoi-an',
    order: 1,
    nameVi: 'Phố Cổ Hội An',
    nameEn: 'Hoi An Ancient Town',
    categoryVi: 'Di sản văn hóa',
    categoryEn: 'Cultural Heritage',
    descriptionVi:
      'Phố cổ Hội An là một đô thị cổ nằm ở hạ lưu sông Thu Bồn, thuộc đồng bằng ven biển tỉnh Quảng Nam, cách Đà Nẵng khoảng 30 km về phía Nam. Nhờ những yếu tố địa lý và khí hậu thuận lợi, Hội An từng là một thương cảng quốc tế sầm uất.',
    descriptionEn:
      'Hoi An Ancient Town is an exceptionally well-preserved example of a South-East Asian trading port from the 15th to the 19th century. Its buildings and street plan reflect indigenous and foreign influences combined into a unique heritage site.',
    distance: '1.2 km',
    duration: '5 phút đi bộ / 5 mins walk',
    coordinates: { x: 120, y: 150 },
    images: [
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
    ],
    rating: 4.9,
    totalReviews: 128,
    historyVi:
      'Được UNESCO công nhận là Di sản văn hóa thế giới vào năm 1999. Nổi tiếng với những dãy nhà cổ sơn vàng, lồng đèn lung linh về đêm và các hội quán kiến trúc Hoa - Nhật hòa quyện.',
    historyEn:
      'Designated a UNESCO World Heritage Site in 1999. Famed for its golden-painted heritage houses, glowing lanterns at night, and an exquisite architectural fusion of Chinese, Japanese, and Vietnamese styles.',
    reviews: [
      {
        id: 'r1',
        author: 'Lê Minh',
        avatar:
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        rating: 5,
        date: '2026-06-20',
        comment:
          'Không gian cổ kính tuyệt vời, đặc biệt là vào buổi tối khi đèn lồng được thắp sáng rực rỡ.',
      },
      {
        id: 'r2',
        author: 'Sarah Jenkins',
        avatar:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
        rating: 5,
        date: '2026-06-18',
        comment:
          'An absolute masterpiece of historic preservation. The food here is outstanding too!',
      },
    ],
  },
  {
    id: 'chua-cau',
    order: 2,
    nameVi: 'Chùa Cầu (Cầu Nhật Bản)',
    nameEn: 'The Japanese Covered Bridge',
    categoryVi: 'Di sản văn hóa',
    categoryEn: 'Cultural Heritage',
    descriptionVi:
      'Chùa Cầu là chiếc cầu cổ trong khu phố cổ Hội An, còn có tên là Cầu Nhật Bản hoặc Lai Viễn Kiều. Công trình được các thương nhân Nhật Bản khởi dựng vào khoảng đầu thế kỷ XVII, mang đậm nét kiến trúc độc đáo giao thoa.',
    descriptionEn:
      "The Japanese Covered Bridge is one of Hoi An's most iconic attractions. Built in the early 17th century by Japanese merchants, it features a unique combination of bridge and temple architecture, symbolizing historical friendship.",
    distance: '0.8 km',
    duration: '3 phút đi bộ / 3 mins walk',
    coordinates: { x: 100, y: 160 },
    images: [
      'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
    ],
    rating: 4.8,
    totalReviews: 95,
    historyVi:
      'Cây cầu lịch sử này được in trên tờ tiền polymer 20.000 VND của Việt Nam. Đây là biểu tượng văn hóa vô giá của vùng đất di sản Hội An.',
    historyEn:
      "This historic bridge is featured on Vietnam's 20,000 VND polymer banknote. It represents the priceless cultural soul of the Hoi An heritage region.",
    reviews: [
      {
        id: 'r3',
        author: 'Nguyễn Thảo',
        avatar:
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
        rating: 4,
        date: '2026-06-15',
        comment: 'Kiến trúc gỗ rất tinh xảo, địa điểm check-in không thể bỏ qua.',
      },
    ],
  },
  {
    id: 'rung-dua-bay-mau',
    order: 3,
    nameVi: 'Rừng Dừa Bảy Mẫu',
    nameEn: 'Bay Mau Coconut Forest',
    categoryVi: 'Trải nghiệm sinh thái',
    categoryEn: 'Eco-experience',
    descriptionVi:
      'Rừng dừa Bảy Mẫu thuộc xã Cẩm Thanh, thành phố Hội An. Trải nghiệm bơi thuyền thúng len lỏi trong rừng dừa nước bạt ngàn và thưởng thức màn múa thúng xoay vòng ngoạn mục từ những người dân chài mộc mạc địa phương.',
    descriptionEn:
      'Located in Cam Thanh village, Bay Mau Coconut Forest offers an immersive experience of rowing traditional bamboo basket boats through emerald waterways flanked by coconut palms, alongside high-energy spinning performances.',
    distance: '4.5 km',
    duration: '10 phút taxi / 10 mins taxi',
    coordinates: { x: 320, y: 280 },
    images: [
      'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    ],
    rating: 4.7,
    totalReviews: 210,
    historyVi:
      'Là căn cứ địa cách mạng kiên cường trong kháng chiến chống Mỹ, ngày nay rừng dừa đã trở thành một điểm du lịch sinh thái sông nước độc nhất vô nhị vùng Duyên hải miền Trung.',
    historyEn:
      "Once a strategic revolutionary base in wartime history, it has transformed into a globally renowned river eco-tourism destination highlighting Hoi An's rustic maritime hospitality.",
    reviews: [
      {
        id: 'r4',
        author: 'Quốc Bảo',
        avatar:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
        rating: 5,
        date: '2026-06-22',
        comment: 'Cực kỳ vui nhộn! Trải nghiệm múa thúng xoay vòng rất đáng tiền và phấn khích.',
      },
    ],
  },
  {
    id: 'bai-bien-an-bang',
    order: 4,
    nameVi: 'Bãi Biển An Bàng',
    nameEn: 'An Bang Beach',
    categoryVi: 'Bãi biển & Thiên nhiên',
    categoryEn: 'Beach & Nature',
    descriptionVi:
      'Bãi biển An Bàng nằm trong top những bãi biển đẹp nhất Châu Á. Nơi đây giữ được vẻ hoang sơ, bãi cát trắng mịn màng và nước biển trong xanh, thích hợp cho việc tắm nắng, thưởng thức hải sản và nghe tiếng sóng vỗ bình yên.',
    descriptionEn:
      "An Bang Beach is celebrated as one of Asia's most tranquil and beautiful coastal sanctuaries. Characterized by white soft sand, clean breaking waves, and trendy beachfront restaurants serving delicious fresh seafood.",
    distance: '3.0 km',
    duration: '8 phút taxi / 8 mins taxi',
    coordinates: { x: 260, y: 120 },
    images: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=800&q=80',
    ],
    rating: 4.8,
    totalReviews: 156,
    historyVi:
      'An Bàng từng được các tạp chí quốc tế như CNN bình chọn vào danh sách những bãi biển quyến rũ nhất hành tinh nhờ vẻ đẹp nguyên sơ và không khí thư thái.',
    historyEn:
      'An Bang has been voted by international media such as CNN as one of the most charming beaches on the planet thanks to its pristine beauty and relaxed atmosphere.',
    reviews: [
      {
        id: 'r5',
        author: 'Elena Petrova',
        avatar:
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
        rating: 5,
        date: '2026-06-19',
        comment:
          'Super clean beach, very relaxed atmosphere compared to Da Nang. Love the beach bars!',
      },
    ],
  },
  {
    id: 'lang-gom-thanh-ha',
    order: 5,
    nameVi: 'Làng Gốm Thanh Hà',
    nameEn: 'Thanh Ha Pottery Village',
    categoryVi: 'Làng nghề truyền thống',
    categoryEn: 'Traditional Craft',
    descriptionVi:
      'Làng gốm Thanh Hà ra đời từ cuối thế kỷ XV, nằm bên bờ sông Thu Bồn. Du khách được tận mắt xem nghệ nhân chuốt gốm bằng bàn xoay truyền thống và tự tay nặn những sản phẩm lưu niệm mộc mạc.',
    descriptionEn:
      'Founded in the late 15th century on the banks of the Thu Bon River, Thanh Ha Pottery Village lets visitors watch artisans shape clay on traditional wheels and try crafting their own rustic souvenirs.',
    distance: '3.5 km',
    duration: '9 phút taxi / 9 mins taxi',
    coordinates: { x: 70, y: 240 },
    images: [
      'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80',
    ],
    rating: 4.6,
    totalReviews: 88,
    historyVi:
      'Trải qua hơn 500 năm, làng gốm vẫn giữ nguyên kỹ thuật nung thủ công và là nơi cung cấp gạch ngói cho các công trình cổ của Hội An.',
    historyEn:
      'Over 500 years old, the village preserves handmade firing techniques and once supplied bricks and tiles for the ancient constructions of Hoi An.',
    reviews: [
      {
        id: 'r6',
        author: 'Trần Hòa',
        avatar:
          'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
        rating: 5,
        date: '2026-06-12',
        comment:
          'Trải nghiệm tự tay xoay gốm rất thú vị, giá vé hợp lý và người dân vô cùng thân thiện.',
      },
    ],
  },
  {
    id: 'lang-rau-tra-que',
    order: 6,
    nameVi: 'Làng Rau Trà Quế',
    nameEn: 'Tra Que Vegetable Village',
    categoryVi: 'Trải nghiệm sinh thái',
    categoryEn: 'Eco-experience',
    descriptionVi:
      'Làng rau Trà Quế nổi tiếng với hơn 20 loại rau thơm được trồng theo phương pháp hữu cơ. Du khách hóa thân thành nông dân, cuốc đất, tưới rau bằng gàu sòng và thưởng thức bữa cơm quê thanh đạm.',
    descriptionEn:
      'Tra Que Vegetable Village is famous for over 20 kinds of organic herbs. Visitors become farmers for a day — hoeing, watering with traditional scoops, and enjoying a wholesome countryside meal.',
    distance: '2.5 km',
    duration: '7 phút taxi / 7 mins taxi',
    coordinates: { x: 200, y: 200 },
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80',
    ],
    rating: 4.7,
    totalReviews: 74,
    historyVi:
      'Rau Trà Quế được bón bằng rong từ sông Cổ Cò tạo nên hương vị đặc trưng đậm đà, là nguyên liệu không thể thiếu trong các món ăn di sản Hội An.',
    historyEn:
      'Tra Que herbs are fertilized with algae from the Co Co River, giving them a distinctive flavor essential to Hoi An heritage cuisine.',
    reviews: [
      {
        id: 'r7',
        author: 'Mai Vy',
        avatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        rating: 5,
        date: '2026-06-14',
        comment:
          'Rau rất sạch và thơm phức, được trải nghiệm tưới nước như nông dân xưa vô cùng ý nghĩa.',
      },
    ],
  },
];

const supportPages = [
  {
    id: 'help',
    order: 1,
    group: 'support',
    groupVi: 'Hỗ trợ',
    groupEn: 'Support',
    titleVi: 'Trung tâm hỗ trợ',
    titleEn: 'Help Center',
    introVi:
      'Mọi câu hỏi về đặt dịch vụ, thanh toán và lịch trình đều có thể được giải đáp tại đây. Nếu chưa tìm thấy điều bạn cần, hãy gọi hotline hoặc gửi email cho đội ngũ VietCharm.',
    introEn:
      'Find answers about bookings, payments, and itineraries here. If you still need help, call our hotline or email the VietCharm team.',
    sections: [
      {
        headingVi: 'Kênh hỗ trợ trực tiếp',
        headingEn: 'Direct support channels',
        bodyVi:
          'Hotline 1900 5040 hoạt động từ 8:00 đến 21:00 mỗi ngày. Email info@vietcharm.com được phản hồi trong vòng 24 giờ làm việc.',
        bodyEn:
          'Hotline 1900 5040 is available daily from 8:00 AM to 9:00 PM. Emails to info@vietcharm.com are answered within 24 business hours.',
      },
      {
        headingVi: 'Trước khi liên hệ',
        headingEn: 'Before you contact us',
        bodyVi:
          'Hãy chuẩn bị mã đặt chỗ (nếu có) trong hồ sơ cá nhân của bạn để đội ngũ hỗ trợ tra cứu nhanh hơn.',
        bodyEn:
          'Have your booking reference from your profile ready so our team can look up your reservation faster.',
      },
    ],
    faqs: [],
  },
  {
    id: 'faq',
    order: 2,
    group: 'support',
    groupVi: 'Hỗ trợ',
    groupEn: 'Support',
    titleVi: 'Câu hỏi thường gặp',
    titleEn: 'Frequently Asked Questions',
    introVi: 'Tổng hợp các câu hỏi khách hàng thường gặp nhất khi sử dụng VietCharm.',
    introEn: 'The questions travelers ask us most often when using VietCharm.',
    sections: [],
    faqs: [
      {
        qVi: 'Tôi cần đăng nhập để đặt dịch vụ không?',
        qEn: 'Do I need to sign in to book a service?',
        aVi: 'Có. Đăng nhập giúp lưu lịch sử đặt chỗ và cho phép bạn đánh giá dịch vụ sau khi đã hoàn tất chuyến đi.',
        aEn: 'Yes. Signing in keeps your booking history and lets you leave a review after your trip is confirmed.',
      },
      {
        qVi: 'Làm sao để áp dụng mã giảm giá?',
        qEn: 'How do I apply a discount code?',
        aVi: 'Tại trang Thanh toán, nhập mã ở ô "Khuyến mãi & Mã giảm giá" rồi bấm Áp dụng trước khi xác nhận thanh toán.',
        aEn: 'On the Checkout page, enter your code in the "Promotional & Voucher Code" field and tap Apply before confirming payment.',
      },
      {
        qVi: 'Tôi có thể hủy dịch vụ đã đặt không?',
        qEn: 'Can I cancel a booking I already made?',
        aVi: 'Có, tuỳ theo chính sách hủy của từng dịch vụ. Xem chi tiết tại mục Chính sách hủy & hoàn tiền.',
        aEn: 'Yes, depending on that service’s cancellation policy. See the Cancellation & Refund page for details.',
      },
      {
        qVi: 'Vì sao tôi chưa thể viết đánh giá cho một dịch vụ?',
        qEn: 'Why can’t I write a review for a service yet?',
        aVi: 'VietCharm chỉ cho phép đánh giá sau khi bạn đã đặt và thanh toán thành công dịch vụ đó, để đảm bảo đánh giá đến từ khách đã trải nghiệm thật.',
        aEn: 'VietCharm only allows reviews after you have successfully booked and paid for that service, so every review comes from a real guest.',
      },
    ],
  },
  {
    id: 'booking-guide',
    order: 3,
    group: 'support',
    groupVi: 'Hỗ trợ',
    groupEn: 'Support',
    titleVi: 'Hướng dẫn đặt dịch vụ',
    titleEn: 'Booking Guide',
    introVi:
      'Các bước để đặt khách sạn, phương tiện di chuyển hoặc hoạt động trải nghiệm trên VietCharm.',
    introEn: 'The steps to book a hotel, vehicle, or experience on VietCharm.',
    sections: [
      {
        headingVi: '1. Chọn điểm đến',
        headingEn: '1. Choose a destination',
        bodyVi:
          'Duyệt danh mục điểm đến hoặc dùng ô tìm kiếm để tới đúng khu vực bạn muốn khám phá.',
        bodyEn:
          'Browse destinations or use the search box to jump to the region you want to explore.',
      },
      {
        headingVi: '2. Xem chi tiết dịch vụ',
        headingEn: '2. Review service details',
        bodyVi:
          'Mở một khách sạn, phương tiện hoặc hoạt động để xem giá, mô tả và chọn gói phù hợp.',
        bodyEn:
          'Open a hotel, vehicle, or activity to see pricing, details, and pick the right package.',
      },
      {
        headingVi: '3. Thêm vào giỏ và thanh toán',
        headingEn: '3. Add to cart and pay',
        bodyVi:
          'Thêm các dịch vụ vào giỏ hàng, áp dụng mã giảm giá nếu có, rồi hoàn tất tại trang Thanh toán.',
        bodyEn:
          'Add services to your cart, apply a discount code if you have one, then complete payment on the Checkout page.',
      },
    ],
    faqs: [],
  },
  {
    id: 'refund',
    order: 4,
    group: 'support',
    groupVi: 'Hỗ trợ',
    groupEn: 'Support',
    titleVi: 'Chính sách hủy & hoàn tiền',
    titleEn: 'Cancellation & Refund Policy',
    introVi: 'VietCharm hướng đến chính sách rõ ràng, minh bạch cho mọi dịch vụ đã đặt.',
    introEn: 'VietCharm aims for a clear, transparent policy across every booked service.',
    sections: [
      {
        headingVi: 'Hủy trước 24 giờ',
        headingEn: 'Cancelling 24+ hours ahead',
        bodyVi:
          'Được hoàn 100% giá trị dịch vụ nếu hủy trước thời gian nhận phòng, nhận xe hoặc khởi hành ít nhất 24 giờ.',
        bodyEn:
          'Get a full refund if you cancel at least 24 hours before check-in, pickup, or departure.',
      },
      {
        headingVi: 'Hủy trong vòng 24 giờ',
        headingEn: 'Cancelling within 24 hours',
        bodyVi:
          'Áp dụng phí xử lý tương ứng với từng đối tác dịch vụ, thường từ 20-50% giá trị đơn.',
        bodyEn:
          'A processing fee applies depending on the partner, typically 20-50% of the order value.',
      },
      {
        headingVi: 'Thời gian hoàn tiền',
        headingEn: 'Refund timing',
        bodyVi: 'Khoản hoàn thường về lại phương thức thanh toán gốc trong 5-7 ngày làm việc.',
        bodyEn:
          'Refunds are typically returned to your original payment method within 5-7 business days.',
      },
    ],
    faqs: [],
  },
  {
    id: 'terms',
    order: 5,
    group: 'support',
    groupVi: 'Hỗ trợ',
    groupEn: 'Support',
    titleVi: 'Điều khoản sử dụng',
    titleEn: 'Terms of Use',
    introVi: 'Khi sử dụng nền tảng VietCharm, bạn đồng ý với các điều khoản dưới đây.',
    introEn: 'By using the VietCharm platform, you agree to the terms below.',
    sections: [
      {
        headingVi: 'Tài khoản người dùng',
        headingEn: 'User accounts',
        bodyVi:
          'Bạn chịu trách nhiệm bảo mật thông tin đăng nhập và mọi hoạt động dưới tài khoản của mình.',
        bodyEn:
          'You are responsible for keeping your login credentials secure and for activity under your account.',
      },
      {
        headingVi: 'Nội dung do người dùng cung cấp',
        headingEn: 'User-submitted content',
        bodyVi:
          'Đánh giá và bình luận cần phản ánh trải nghiệm thật; VietCharm có quyền gỡ nội dung sai lệch.',
        bodyEn:
          'Reviews and comments must reflect a real experience; VietCharm may remove misleading content.',
      },
      {
        headingVi: 'Thay đổi điều khoản',
        headingEn: 'Changes to these terms',
        bodyVi:
          'VietCharm có thể cập nhật điều khoản theo thời gian và sẽ thông báo các thay đổi quan trọng.',
        bodyEn: 'VietCharm may update these terms over time and will announce material changes.',
      },
    ],
    faqs: [],
  },
  {
    id: 'privacy',
    order: 6,
    group: 'support',
    groupVi: 'Hỗ trợ',
    groupEn: 'Support',
    titleVi: 'Chính sách bảo mật',
    titleEn: 'Privacy Policy',
    introVi: 'VietCharm tôn trọng quyền riêng tư và bảo vệ dữ liệu cá nhân của khách hàng.',
    introEn: 'VietCharm respects your privacy and protects your personal data.',
    sections: [
      {
        headingVi: 'Dữ liệu chúng tôi thu thập',
        headingEn: 'Data we collect',
        bodyVi:
          'Thông tin tài khoản, lịch sử đặt dịch vụ và tùy chọn ngôn ngữ được lưu để cá nhân hóa trải nghiệm của bạn.',
        bodyEn:
          'Account details, booking history, and language preference are stored to personalize your experience.',
      },
      {
        headingVi: 'Cách chúng tôi sử dụng dữ liệu',
        headingEn: 'How we use your data',
        bodyVi:
          'Dữ liệu chỉ dùng để xử lý đặt chỗ, hỗ trợ khách hàng và cải thiện dịch vụ, không bán cho bên thứ ba.',
        bodyEn:
          'Data is used only to process bookings, provide support, and improve our service — never sold to third parties.',
      },
    ],
    faqs: [],
  },
  {
    id: 'about',
    order: 7,
    group: 'about',
    groupVi: 'Về VietCharm',
    groupEn: 'About VietCharm',
    titleVi: 'Giới thiệu về chúng tôi',
    titleEn: 'About Us',
    introVi:
      'VietCharm là nền tảng du lịch theo vùng, kết nối du khách với khách sạn, phương tiện và trải nghiệm địa phương tại Hội An và khắp Việt Nam.',
    introEn:
      'VietCharm is a region-based travel platform connecting travelers with hotels, transport, and local experiences across Hoi An and Vietnam.',
    sections: [
      {
        headingVi: 'Sứ mệnh',
        headingEn: 'Our mission',
        bodyVi:
          'Giúp mỗi chuyến đi trở nên rõ ràng, minh bạch và dễ lên kế hoạch hơn, dù đi một mình hay theo nhóm.',
        bodyEn:
          'Make every trip easier to plan with clear, transparent information — whether traveling solo or in a group.',
      },
      {
        headingVi: 'Mạng lưới đối tác',
        headingEn: 'Partner network',
        bodyVi:
          'Chúng tôi hợp tác trực tiếp với khách sạn, hướng dẫn viên và đơn vị vận chuyển địa phương đã được thẩm định.',
        bodyEn: 'We work directly with vetted hotels, local guides, and transport operators.',
      },
    ],
    faqs: [],
  },
  {
    id: 'careers',
    order: 8,
    group: 'about',
    groupVi: 'Về VietCharm',
    groupEn: 'About VietCharm',
    titleVi: 'Tuyển dụng',
    titleEn: 'Careers',
    introVi:
      'VietCharm luôn tìm kiếm những người yêu du lịch và công nghệ để cùng xây dựng sản phẩm.',
    introEn:
      'VietCharm is always looking for people who love travel and technology to help build our product.',
    sections: [
      {
        headingVi: 'Vị trí đang tuyển',
        headingEn: 'Open roles',
        bodyVi:
          'Hiện chưa có vị trí tuyển dụng công khai. Vui lòng gửi CV qua email info@vietcharm.com để được liên hệ khi có cơ hội phù hợp.',
        bodyEn:
          'There are no public openings right now. Send your CV to info@vietcharm.com and we will reach out when a fitting role opens up.',
      },
    ],
    faqs: [],
  },
  {
    id: 'partners',
    order: 9,
    group: 'about',
    groupVi: 'Về VietCharm',
    groupEn: 'About VietCharm',
    titleVi: 'Đối tác & Liên kết',
    titleEn: 'Partners & Affiliates',
    introVi:
      'Bạn sở hữu khách sạn, dịch vụ phương tiện di chuyển hoặc tour trải nghiệm? Hãy trở thành đối tác của VietCharm.',
    introEn: 'Do you run a hotel, vehicle rental, or tour experience? Become a VietCharm partner.',
    sections: [
      {
        headingVi: 'Vì sao hợp tác với VietCharm',
        headingEn: 'Why partner with VietCharm',
        bodyVi:
          'Tiếp cận khách du lịch trong nước và quốc tế thông qua nền tảng đặt dịch vụ minh bạch.',
        bodyEn:
          'Reach domestic and international travelers through a transparent booking platform.',
      },
    ],
    faqs: [],
  },
  {
    id: 'blog',
    order: 10,
    group: 'about',
    groupVi: 'Về VietCharm',
    groupEn: 'About VietCharm',
    titleVi: 'Tin tức & Blog',
    titleEn: 'News & Blog',
    introVi: 'Cập nhật những câu chuyện, mẹo du lịch và tin tức mới nhất từ VietCharm.',
    introEn: 'The latest stories, travel tips, and news from VietCharm.',
    sections: [
      {
        headingVi: 'Sắp ra mắt',
        headingEn: 'Coming soon',
        bodyVi:
          'Chuyên mục blog đang được xây dựng. Trong lúc chờ đợi, hãy xem Cẩm nang du lịch của VietCharm.',
        bodyEn:
          'Our blog section is under construction. In the meantime, check out the VietCharm Travel Handbook.',
      },
    ],
    faqs: [],
  },
  {
    id: 'contact',
    order: 11,
    group: 'about',
    groupVi: 'Về VietCharm',
    groupEn: 'About VietCharm',
    titleVi: 'Liên hệ',
    titleEn: 'Contact',
    introVi: 'Liên hệ trực tiếp với đội ngũ VietCharm qua các kênh dưới đây.',
    introEn: 'Reach the VietCharm team directly through the channels below.',
    sections: [
      {
        headingVi: 'Địa chỉ',
        headingEn: 'Address',
        bodyVi: '123 Trần Phú, Minh An, Hội An, Quảng Nam.',
        bodyEn: '123 Tran Phu, Minh An, Hoi An, Quang Nam.',
      },
      {
        headingVi: 'Hotline',
        headingEn: 'Hotline',
        bodyVi: '1900 5040, phục vụ từ 8:00 đến 21:00 mỗi ngày.',
        bodyEn: '1900 5040, available daily from 8:00 AM to 9:00 PM.',
      },
      {
        headingVi: 'Email',
        headingEn: 'Email',
        bodyVi: 'info@vietcharm.com',
        bodyEn: 'info@vietcharm.com',
      },
    ],
    faqs: [],
  },
];

async function upsertCollection(name, items) {
  const collection = mongoose.connection.db.collection(name);
  await collection.bulkWrite(
    items.map(({ id, ...data }) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: data },
        upsert: true,
      },
    })),
  );
  return collection.countDocuments({ _id: { $in: items.map((item) => item.id) } });
}

await mongoose.connect(uri);
const handbookCount = await upsertCollection('handbook_entries', handbookEntries);
const nearbyCount = await upsertCollection('nearby_places', nearbyPlaces);
const supportCount = await upsertCollection('support_pages', supportPages);

console.log(`handbook_entries: ${handbookCount}/${handbookEntries.length}`);
console.log(`nearby_places: ${nearbyCount}/${nearbyPlaces.length}`);
console.log(`support_pages: ${supportCount}/${supportPages.length}`);
await mongoose.disconnect();
