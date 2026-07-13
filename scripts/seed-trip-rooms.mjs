/**
 * Seed dữ liệu giả lập cho tính năng Trip Room (phục vụ demo/chấm bài).
 *
 * Chạy:  pnpm run seed:trip-rooms   (cần .env với MONGODB_URI)
 *
 * Script upsert theo _id nên chạy lại bao nhiêu lần cũng được — dữ liệu demo
 * luôn được reset về trạng thái bên dưới, không tạo bản ghi trùng.
 *
 * Sau khi seed, đăng nhập bằng các tài khoản demo có sẵn trong DB:
 *   - ngandtk244111@st.uel.edu.vn  (Đặng Thị Kim Ngân — trưởng nhóm phòng 1, thành viên phòng 2)
 *   - hoanganh@gmail.com           (Lê Hoàng Anh — thành viên phòng 1, trưởng nhóm phòng 2)
 * rồi vào trang /trip-room để thấy mục "Phòng của bạn".
 * Có thể test luồng "Tham gia bằng mã mời" với mã: NHOM88 hoặc HUE999.
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vietcharm';

// ── Phòng 1: nhóm 4 người, đã điền hồ sơ + bầu chọn xong (demo đầy đủ mọi trạng thái) ──
const roomFull = {
  id: 'VC-DEMO01',
  name: 'Nhóm 8 — Đà Nẵng & Hội An 3N2Đ',
  description: 'Chuyến đi tổng kết môn Phát triển Web — chill di sản, ăn sập Hội An.',
  startDate: '2026-08-14',
  endDate: '2026-08-16',
  maxMembers: 5,
  inviteCode: 'NHOM88',
  ownerEmail: 'ngandtk244111@st.uel.edu.vn',
  active: true,
  createdAt: '2026-07-10T09:00:00.000Z',
  members: [
    {
      id: 'm-ngan',
      name: 'Đặng Thị Kim Ngân (Trưởng nhóm)',
      email: 'ngandtk244111@st.uel.edu.vn',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      budget: 5000000,
      availability: 'Rảnh cả tháng 8, ưu tiên giữa tháng',
      preferences: ['Chụp ảnh phố cổ', 'Cà phê view sông', 'Ẩm thực địa phương'],
      dislikes: 'Đi bộ quá nhiều dưới nắng',
      status: 'paid',
    },
    {
      id: 'm-hoanganh',
      name: 'Lê Hoàng Anh',
      email: 'hoanganh@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      budget: 4500000,
      availability: 'Cuối tuần 14–16/08',
      preferences: ['Lặn ngắm san hô', 'Hải sản tươi'],
      dislikes: 'Khách sạn ồn ào',
      status: 'paid',
    },
    {
      id: 'm-lybang',
      name: 'Phùng Sương Lý Băng',
      email: 'bangpslk24411@st.uel.edu.vn',
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80',
      budget: 6000000,
      availability: 'Từ 10/08 trở đi đều rảnh',
      preferences: ['Hồ bơi vô cực', 'Chụp ảnh sống ảo', 'Làng nghề'],
      dislikes: 'Dậy sớm trước 7h',
      status: 'unpaid',
    },
    {
      id: 'm-thinh',
      name: 'Thịnh Quang',
      email: 'thinhpqk24411@st.uel.edu.vn',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
      budget: 4000000,
      availability: 'Chỉ đi được cuối tuần',
      preferences: ['Chèo thuyền thúng', 'Đồ nướng đêm'],
      dislikes: 'Tour ép mua sắm',
      status: 'unpaid',
    },
  ],
  votingItems: [
    { id: 'h1', nameVi: 'Resort Boutique Di Sản Sông Thu Bồn', nameEn: 'Thu Bon River Heritage Boutique Resort', type: 'hotel', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80', votes: ['m-ngan', 'm-lybang', 'm-hoanganh'], price: 1800000, rating: 4.9, locationVi: 'Ven sông Thu Bồn, Hội An', locationEn: 'Riverside, Hoi An' },
    { id: 'h2', nameVi: 'Khách sạn Heritage Gỗ Mộc Phố Cổ', nameEn: 'Historic Timber Town Hotel', type: 'hotel', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=400&q=80', votes: ['m-thinh'], price: 1100000, rating: 4.6, locationVi: 'Trung tâm Phố cổ, Hội An', locationEn: 'Ancient Town Center, Hoi An' },
    { id: 'r1', nameVi: 'Nhà Hàng Vườn Vy: Cao Lầu & Hoành Thánh Di Sản', nameEn: 'Vy Garden: Heritage Cao Lau & Wontons', type: 'restaurant', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&q=80', votes: ['m-ngan', 'm-hoanganh', 'm-lybang', 'm-thinh'], price: 250000, rating: 4.8, locationVi: 'Đường Bạch Đằng, Hội An', locationEn: 'Bach Dang St, Hoi An' },
    { id: 'r2', nameVi: 'Bếp Hải Sản Đầm Sen Hội An', nameEn: 'Dam Sen Fresh Lagoon Seafood', type: 'restaurant', image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=400&q=80', votes: ['m-hoanganh'], price: 450000, rating: 4.5, locationVi: 'Cẩm An, Hội An', locationEn: 'Cam An, Hoi An' },
    { id: 'a1', nameVi: 'Tour Lặn Ngắm San Hô Đảo Cù Lao Chàm bằng Cano', nameEn: 'Cham Island Snorkeling & Speedboat Adventure', type: 'activity', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=400&q=80', votes: ['m-hoanganh', 'm-thinh'], price: 750000, rating: 4.7, locationVi: 'Bến tàu Cửa Đại', locationEn: 'Cua Dai Pier' },
    { id: 'a2', nameVi: 'Thúng Xoay Rừng Dừa Bảy Mẫu & Thả Hoa Đăng Sông Hoài', nameEn: 'Coconut Forest Spinning Basket Boat & Lantern Release', type: 'activity', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&q=80', votes: ['m-ngan', 'm-hoanganh', 'm-lybang', 'm-thinh'], price: 250000, rating: 4.9, locationVi: 'Rừng dừa Bảy Mẫu', locationEn: 'Bay Mau Coconut Forest' },
  ],
};

// ── Phòng 2: mới tạo, chưa ai bầu chọn (demo trạng thái trống + luồng join) ──
const roomFresh = {
  id: 'VC-DEMO02',
  name: 'Huế cuối tuần — đang rủ rê',
  description: 'Phòng vừa mở, mọi người vào điền gu du lịch rồi cùng bầu chọn nhé!',
  startDate: '',
  endDate: '',
  maxMembers: 4,
  inviteCode: 'HUE999',
  ownerEmail: 'hoanganh@gmail.com',
  active: true,
  createdAt: '2026-07-12T15:30:00.000Z',
  members: [
    {
      id: 'm-ha2',
      name: 'Lê Hoàng Anh (Trưởng nhóm)',
      email: 'hoanganh@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      budget: 3000000,
      availability: 'Cuối tuần nào cũng được',
      preferences: ['Ẩm thực cung đình', 'Đạp xe làng cổ'],
      dislikes: 'Chưa cập nhật',
      status: 'unpaid',
    },
    {
      id: 'm-ngan2',
      name: 'Đặng Thị Kim Ngân',
      email: 'ngandtk244111@st.uel.edu.vn',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      budget: 5000000,
      availability: '',
      preferences: [],
      dislikes: 'Chưa cập nhật',
      status: 'unpaid',
    },
  ],
  votingItems: [
    { id: 'h1', nameVi: 'Silk Path Grand Huế Hotel', nameEn: 'Silk Path Grand Hue Hotel', type: 'hotel', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=400&q=80', votes: [], price: 1300000, rating: 4.7, locationVi: 'Trung tâm TP Huế', locationEn: 'Hue City Center' },
    { id: 'h2', nameVi: 'Homestay Vườn An Hiên bên sông Hương', nameEn: 'An Hien Garden Homestay by Perfume River', type: 'hotel', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80', votes: [], price: 650000, rating: 4.5, locationVi: 'Kim Long, Huế', locationEn: 'Kim Long, Hue' },
    { id: 'r1', nameVi: 'Cơm Hến Đập Đá & Chè Hẻm Cung Đình', nameEn: 'Dap Da Mussel Rice & Royal Sweet Soup', type: 'restaurant', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&q=80', votes: [], price: 150000, rating: 4.6, locationVi: 'Đập Đá, Huế', locationEn: 'Dap Da, Hue' },
    { id: 'a1', nameVi: 'Food Tour Xích Lô Huế Về Đêm', nameEn: 'Hue Cyclo Night Food Tour', type: 'activity', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=400&q=80', votes: [], price: 450000, rating: 4.8, locationVi: 'Đại Nội, Huế', locationEn: 'Imperial City, Hue' },
    { id: 'a2', nameVi: 'Tour Đạp Xe Làng Cổ Thủy Biều', nameEn: 'Thuy Bieu Ancient Village Cycling Tour', type: 'activity', image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=400&q=80', votes: [], price: 250000, rating: 4.7, locationVi: 'Thủy Biều, Huế', locationEn: 'Thuy Bieu, Hue' },
  ],
};

const rooms = [roomFull, roomFresh];

console.log(`Kết nối MongoDB...`);
await mongoose.connect(uri);

const collection = mongoose.connection.db.collection('triprooms');
for (const room of rooms) {
  const { id, ...rest } = room;
  await collection.replaceOne({ _id: id }, { _id: id, ...rest }, { upsert: true });
  console.log(`✓ Seed ${id} — "${room.name}" (mã mời: ${room.inviteCode}, ${room.members.length} thành viên)`);
}

console.log(`
Hoàn tất! Cách demo:
  1. Đăng nhập bằng ngandtk244111@st.uel.edu.vn → vào /trip-room → thấy 2 phòng trong "Phòng của bạn".
  2. Phòng "Nhóm 8" (VC-DEMO01): đã có hồ sơ thành viên, bầu chọn, hạng mục 100% đồng thuận và hóa đơn chia tiền.
  3. Phòng "Huế cuối tuần" (VC-DEMO02): phòng mới — demo trạng thái chưa bầu chọn / chưa có hóa đơn.
  4. Test luồng tham gia: đăng nhập tài khoản khác và nhập mã mời NHOM88 hoặc HUE999.
`);

await mongoose.disconnect();
