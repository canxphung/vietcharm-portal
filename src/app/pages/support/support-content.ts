/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SupportTopicId =
  | 'help'
  | 'faq'
  | 'booking-guide'
  | 'refund'
  | 'terms'
  | 'privacy'
  | 'about'
  | 'careers'
  | 'partners'
  | 'blog'
  | 'contact';

export interface SupportSection {
  headingVi: string;
  headingEn: string;
  bodyVi: string;
  bodyEn: string;
}

export interface SupportFaqEntry {
  qVi: string;
  qEn: string;
  aVi: string;
  aEn: string;
}

export interface SupportTopic {
  id: SupportTopicId;
  groupVi: string;
  groupEn: string;
  titleVi: string;
  titleEn: string;
  introVi: string;
  introEn: string;
  sections: SupportSection[];
  faqs?: SupportFaqEntry[];
}

export const SUPPORT_TOPICS: Record<SupportTopicId, SupportTopic> = {
  help: {
    id: 'help',
    groupVi: 'Hỗ trợ',
    groupEn: 'Support',
    titleVi: 'Trung tâm hỗ trợ',
    titleEn: 'Help Center',
    introVi: 'Mọi câu hỏi về đặt dịch vụ, thanh toán và lịch trình đều có thể được giải đáp tại đây. Nếu chưa tìm thấy điều bạn cần, hãy gọi hotline hoặc gửi email cho đội ngũ VietCharm.',
    introEn: 'Find answers about bookings, payments, and itineraries here. If you still need help, call our hotline or email the VietCharm team.',
    sections: [
      {
        headingVi: 'Kênh hỗ trợ trực tiếp',
        headingEn: 'Direct support channels',
        bodyVi: 'Hotline 1900 5040 hoạt động từ 8:00 đến 21:00 mỗi ngày. Email info@vietcharm.com được phản hồi trong vòng 24 giờ làm việc.',
        bodyEn: 'Hotline 1900 5040 is available daily from 8:00 AM to 9:00 PM. Emails to info@vietcharm.com are answered within 24 business hours.',
      },
      {
        headingVi: 'Trước khi liên hệ',
        headingEn: 'Before you contact us',
        bodyVi: 'Hãy chuẩn bị mã đặt chỗ (nếu có) trong hồ sơ cá nhân của bạn để đội ngũ hỗ trợ tra cứu nhanh hơn.',
        bodyEn: 'Have your booking reference from your profile ready so our team can look up your reservation faster.',
      },
    ],
  },
  faq: {
    id: 'faq',
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
  'booking-guide': {
    id: 'booking-guide',
    groupVi: 'Hỗ trợ',
    groupEn: 'Support',
    titleVi: 'Hướng dẫn đặt dịch vụ',
    titleEn: 'Booking Guide',
    introVi: 'Các bước để đặt khách sạn, thuê xe hoặc hoạt động trải nghiệm trên VietCharm.',
    introEn: 'The steps to book a hotel, vehicle, or experience on VietCharm.',
    sections: [
      { headingVi: '1. Chọn điểm đến', headingEn: '1. Choose a destination', bodyVi: 'Duyệt danh mục điểm đến hoặc dùng ô tìm kiếm để tới đúng khu vực bạn muốn khám phá.', bodyEn: 'Browse destinations or use the search box to jump to the region you want to explore.' },
      { headingVi: '2. Xem chi tiết dịch vụ', headingEn: '2. Review service details', bodyVi: 'Mở một khách sạn, xe hoặc hoạt động để xem giá, mô tả và chọn gói phù hợp.', bodyEn: 'Open a hotel, vehicle, or activity to see pricing, details, and pick the right package.' },
      { headingVi: '3. Thêm vào giỏ và thanh toán', headingEn: '3. Add to cart and pay', bodyVi: 'Thêm các dịch vụ vào giỏ hàng, áp dụng mã giảm giá nếu có, rồi hoàn tất tại trang Thanh toán.', bodyEn: 'Add services to your cart, apply a discount code if you have one, then complete payment on the Checkout page.' },
    ],
  },
  refund: {
    id: 'refund',
    groupVi: 'Hỗ trợ',
    groupEn: 'Support',
    titleVi: 'Chính sách hủy & hoàn tiền',
    titleEn: 'Cancellation & Refund Policy',
    introVi: 'VietCharm hướng đến chính sách rõ ràng, minh bạch cho mọi dịch vụ đã đặt.',
    introEn: 'VietCharm aims for a clear, transparent policy across every booked service.',
    sections: [
      { headingVi: 'Hủy trước 24 giờ', headingEn: 'Cancelling 24+ hours ahead', bodyVi: 'Được hoàn 100% giá trị dịch vụ nếu hủy trước thời gian nhận phòng, nhận xe hoặc khởi hành ít nhất 24 giờ.', bodyEn: 'Get a full refund if you cancel at least 24 hours before check-in, pickup, or departure.' },
      { headingVi: 'Hủy trong vòng 24 giờ', headingEn: 'Cancelling within 24 hours', bodyVi: 'Áp dụng phí xử lý tương ứng với từng đối tác dịch vụ, thường từ 20-50% giá trị đơn.', bodyEn: 'A processing fee applies depending on the partner, typically 20-50% of the order value.' },
      { headingVi: 'Thời gian hoàn tiền', headingEn: 'Refund timing', bodyVi: 'Khoản hoàn thường về lại phương thức thanh toán gốc trong 5-7 ngày làm việc.', bodyEn: 'Refunds are typically returned to your original payment method within 5-7 business days.' },
    ],
  },
  terms: {
    id: 'terms',
    groupVi: 'Hỗ trợ',
    groupEn: 'Support',
    titleVi: 'Điều khoản sử dụng',
    titleEn: 'Terms of Use',
    introVi: 'Khi sử dụng nền tảng VietCharm, bạn đồng ý với các điều khoản dưới đây.',
    introEn: 'By using the VietCharm platform, you agree to the terms below.',
    sections: [
      { headingVi: 'Tài khoản người dùng', headingEn: 'User accounts', bodyVi: 'Bạn chịu trách nhiệm bảo mật thông tin đăng nhập và mọi hoạt động dưới tài khoản của mình.', bodyEn: 'You are responsible for keeping your login credentials secure and for activity under your account.' },
      { headingVi: 'Nội dung do người dùng cung cấp', headingEn: 'User-submitted content', bodyVi: 'Đánh giá và bình luận cần phản ánh trải nghiệm thật; VietCharm có quyền gỡ nội dung sai lệch.', bodyEn: 'Reviews and comments must reflect a real experience; VietCharm may remove misleading content.' },
      { headingVi: 'Thay đổi điều khoản', headingEn: 'Changes to these terms', bodyVi: 'VietCharm có thể cập nhật điều khoản theo thời gian và sẽ thông báo các thay đổi quan trọng.', bodyEn: 'VietCharm may update these terms over time and will announce material changes.' },
    ],
  },
  privacy: {
    id: 'privacy',
    groupVi: 'Hỗ trợ',
    groupEn: 'Support',
    titleVi: 'Chính sách bảo mật',
    titleEn: 'Privacy Policy',
    introVi: 'VietCharm tôn trọng quyền riêng tư và bảo vệ dữ liệu cá nhân của khách hàng.',
    introEn: 'VietCharm respects your privacy and protects your personal data.',
    sections: [
      { headingVi: 'Dữ liệu chúng tôi thu thập', headingEn: 'Data we collect', bodyVi: 'Thông tin tài khoản, lịch sử đặt dịch vụ và tùy chọn ngôn ngữ được lưu để cá nhân hóa trải nghiệm của bạn.', bodyEn: 'Account details, booking history, and language preference are stored to personalize your experience.' },
      { headingVi: 'Cách chúng tôi sử dụng dữ liệu', headingEn: 'How we use your data', bodyVi: 'Dữ liệu chỉ dùng để xử lý đặt chỗ, hỗ trợ khách hàng và cải thiện dịch vụ, không bán cho bên thứ ba.', bodyEn: 'Data is used only to process bookings, provide support, and improve our service — never sold to third parties.' },
    ],
  },
  about: {
    id: 'about',
    groupVi: 'Về VietCharm',
    groupEn: 'About VietCharm',
    titleVi: 'Giới thiệu về chúng tôi',
    titleEn: 'About Us',
    introVi: 'VietCharm là nền tảng du lịch theo vùng, kết nối du khách với khách sạn, phương tiện và trải nghiệm địa phương tại Hội An và khắp Việt Nam.',
    introEn: 'VietCharm is a region-based travel platform connecting travelers with hotels, transport, and local experiences across Hoi An and Vietnam.',
    sections: [
      { headingVi: 'Sứ mệnh', headingEn: 'Our mission', bodyVi: 'Giúp mỗi chuyến đi trở nên rõ ràng, minh bạch và dễ lên kế hoạch hơn, dù đi một mình hay theo nhóm.', bodyEn: 'Make every trip easier to plan with clear, transparent information — whether traveling solo or in a group.' },
      { headingVi: 'Mạng lưới đối tác', headingEn: 'Partner network', bodyVi: 'Chúng tôi hợp tác trực tiếp với khách sạn, hướng dẫn viên và đơn vị vận chuyển địa phương đã được thẩm định.', bodyEn: 'We work directly with vetted hotels, local guides, and transport operators.' },
    ],
  },
  careers: {
    id: 'careers',
    groupVi: 'Về VietCharm',
    groupEn: 'About VietCharm',
    titleVi: 'Tuyển dụng',
    titleEn: 'Careers',
    introVi: 'VietCharm luôn tìm kiếm những người yêu du lịch và công nghệ để cùng xây dựng sản phẩm.',
    introEn: 'VietCharm is always looking for people who love travel and technology to help build our product.',
    sections: [
      { headingVi: 'Vị trí đang tuyển', headingEn: 'Open roles', bodyVi: 'Hiện chưa có vị trí tuyển dụng công khai. Vui lòng gửi CV qua email info@vietcharm.com để được liên hệ khi có cơ hội phù hợp.', bodyEn: 'There are no public openings right now. Send your CV to info@vietcharm.com and we will reach out when a fitting role opens up.' },
    ],
  },
  partners: {
    id: 'partners',
    groupVi: 'Về VietCharm',
    groupEn: 'About VietCharm',
    titleVi: 'Đối tác & Liên kết',
    titleEn: 'Partners & Affiliates',
    introVi: 'Bạn sở hữu khách sạn, dịch vụ cho thuê xe hoặc tour trải nghiệm? Hãy trở thành đối tác của VietCharm.',
    introEn: 'Do you run a hotel, vehicle rental, or tour experience? Become a VietCharm partner.',
    sections: [
      { headingVi: 'Vì sao hợp tác với VietCharm', headingEn: 'Why partner with VietCharm', bodyVi: 'Tiếp cận khách du lịch trong nước và quốc tế thông qua nền tảng đặt dịch vụ minh bạch.', bodyEn: 'Reach domestic and international travelers through a transparent booking platform.' },
    ],
  },
  blog: {
    id: 'blog',
    groupVi: 'Về VietCharm',
    groupEn: 'About VietCharm',
    titleVi: 'Tin tức & Blog',
    titleEn: 'News & Blog',
    introVi: 'Cập nhật những câu chuyện, mẹo du lịch và tin tức mới nhất từ VietCharm.',
    introEn: 'The latest stories, travel tips, and news from VietCharm.',
    sections: [
      { headingVi: 'Sắp ra mắt', headingEn: 'Coming soon', bodyVi: 'Chuyên mục blog đang được xây dựng. Trong lúc chờ đợi, hãy xem Cẩm nang du lịch của VietCharm.', bodyEn: 'Our blog section is under construction. In the meantime, check out the VietCharm Travel Handbook.' },
    ],
  },
  contact: {
    id: 'contact',
    groupVi: 'Về VietCharm',
    groupEn: 'About VietCharm',
    titleVi: 'Liên hệ',
    titleEn: 'Contact',
    introVi: 'Liên hệ trực tiếp với đội ngũ VietCharm qua các kênh dưới đây.',
    introEn: 'Reach the VietCharm team directly through the channels below.',
    sections: [
      { headingVi: 'Địa chỉ', headingEn: 'Address', bodyVi: '123 Trần Phú, Minh An, Hội An, Quảng Nam.', bodyEn: '123 Tran Phu, Minh An, Hoi An, Quang Nam.' },
      { headingVi: 'Hotline', headingEn: 'Hotline', bodyVi: '1900 5040, phục vụ từ 8:00 đến 21:00 mỗi ngày.', bodyEn: '1900 5040, available daily from 8:00 AM to 9:00 PM.' },
      { headingVi: 'Email', headingEn: 'Email', bodyVi: 'info@vietcharm.com', bodyEn: 'info@vietcharm.com' },
    ],
  },
};

export const SUPPORT_TOPIC_ORDER: SupportTopicId[] = [
  'help',
  'faq',
  'booking-guide',
  'refund',
  'terms',
  'privacy',
  'about',
  'careers',
  'partners',
  'blog',
  'contact',
];
