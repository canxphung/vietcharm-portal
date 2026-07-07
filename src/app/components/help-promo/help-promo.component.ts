import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  LucideAward,
  LucideBookOpen,
  LucideCheck,
  LucideCheckSquare,
  LucideCompass,
  LucideCopy,
  LucideGift,
  LucideHelpCircle,
  LucideHotel,
  LucideMapPin,
  LucideShoppingBag,
  LucideSparkles,
  LucideUsers,
  LucideX,
} from '@lucide/angular';
import { I18nService } from '@/services/i18n.service';
import { UiStateService } from '@/services/ui-state.service';

@Component({
  selector: 'app-help-promo',
  standalone: true,
  imports: [
    LucideAward,
    LucideBookOpen,
    LucideCheck,
    LucideCheckSquare,
    LucideCompass,
    LucideCopy,
    LucideGift,
    LucideHelpCircle,
    LucideHotel,
    LucideMapPin,
    LucideShoppingBag,
    LucideSparkles,
    LucideUsers,
    LucideX,
  ],
  templateUrl: './help-promo.component.html',
  styleUrl: './help-promo.component.css',
})
export class HelpPromoComponent {
  readonly open = signal(false);
  readonly tab = signal<'guide' | 'promos'>('guide');
  readonly copied = signal<string | null>(null);

  constructor(
    readonly i18n: I18nService,
    readonly ui: UiStateService,
    private readonly router: Router,
  ) {}

  steps(): Array<{ icon: string; title: string; desc: string }> {
    const vi = this.i18n.isVi();
    return [
      { icon: 'map', title: vi ? '1. Khám phá Điểm đến' : '1. Select Province', desc: vi ? 'Chọn một vùng hoặc điểm đến đang có dữ liệu dịch vụ để xem khách sạn, tour và phương tiện phù hợp.' : 'Choose a region or destination with available service data to browse hotels, tours, and rentals.' },
      { icon: 'hotel', title: vi ? '2. Đặt Khách Sạn & Nghỉ Dưỡng' : '2. Premium Hotel Booking', desc: vi ? 'Duyệt và lựa chọn các cơ sở lưu trú, khách sạn cao cấp, homestay địa phương đã được bảo chứng chất lượng bởi VietCharm.' : 'Browse and select high-quality hotels, luxury resorts, and boutique homestays curated by VietCharm.' },
      { icon: 'bag', title: vi ? '3. Đặt Phòng, Thuê Xe & Hoạt Động' : '3. Customize Bookings', desc: vi ? 'Duyệt danh mục phía dưới để đặt riêng lẻ hoặc tùy chỉnh các dịch vụ khách sạn, xe máy, xe tự lái và tour trải nghiệm địa phương.' : 'Browse lists below the map to add vetted accommodations, local motorbikes, self-drive cars, or immersive tours to your cart.' },
      { icon: 'users', title: vi ? '4. Kết nối Trip Room Ẩn Số' : '4. Group Up & Split Bills', desc: vi ? 'Tạo hoặc tham gia phòng chat ghép đôi dạo chơi ẩn danh, cùng bình chọn lịch trình yêu thích và tính toán chia sẻ tiền phòng.' : 'Create or join a Mystery Room to chat anonymously, vote for favorite spots, and split bills dynamically with group members.' },
      { icon: 'check', title: vi ? '5. Áp Mã Voucher & Thanh toán' : '5. Apply Vouchers & Book', desc: vi ? 'Từ giỏ hàng, bấm Thanh toán để sang trang Checkout riêng, dán mã ưu đãi (Ví dụ: VIETCHARM15) rồi xác nhận để nhận hóa đơn điện tử có mã QR.' : 'From your cart, tap Checkout to open the dedicated checkout page, apply a coupon code (e.g. VIETCHARM15), then confirm to get your QR e-ticket.' },
    ];
  }

  promos(): Array<{ code: string; title: string; desc: string; badge: string }> {
    const vi = this.i18n.isVi();
    return [
      { code: 'VIETCHARM15', title: vi ? 'Ưu Đãi Đặc Quyền Heritage' : 'Elite Heritage Discount', desc: vi ? 'Giảm ngay 15% tổng hóa đơn thanh toán cho tất cả dịch vụ lữ hành.' : '15% Off all bookings including hotels and motorbike rentals.', badge: vi ? 'HỘI VIÊN VIP' : 'VIP MEMBER' },
      { code: 'HELLOMIENTRUNG', title: vi ? 'Chào Mừng Duyên Hải' : 'Coastal Welcome Pack', desc: vi ? 'Tặng trực tiếp 100,000đ cho đơn đặt dịch vụ từ 300,000đ trở lên.' : 'Get 100,000 VND cashback on orders starting at 300,000 VND.', badge: vi ? 'MỚI ĐĂNG KÝ' : 'WELCOME' },
      { code: 'CHARMHOTEL20', title: vi ? 'Ưu Đãi Đặt Khách Sạn' : 'Hotel Super Saver', desc: vi ? 'Giảm ngay 20% tối đa cho lượt đặt phòng khách sạn đầu tiên trên toàn hệ thống.' : 'Enjoy 20% discount on your first boutique hotel reservation.', badge: vi ? 'PHÒNG ĐẸP' : 'HOTEL DEAL' },
      { code: 'GENZTRAVEL', title: vi ? 'Phượt Bụi Đồng Hành' : 'Backpacker Freedom', desc: vi ? 'Giảm thẳng 10% khi thuê xe máy tự lái Sirius/Exciter dạo phố lồng đèn.' : '10% Off on all local motorbike rentals for students and solo travelers.', badge: vi ? 'GEN Z PHƯỢT' : 'SOLO RIDER' },
    ];
  }

  copy(code: string): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(code);
    }
    this.copied.set(code);
    setTimeout(() => this.copied.set(null), 2000);
  }

  goPartnership(): void {
    this.open.set(false);
    void this.router.navigateByUrl('/partnership');
  }

  goHotels(): void {
    this.open.set(false);
    this.ui.openAllServices('hotels');
  }

  goSupport(): void {
    this.open.set(false);
    void this.router.navigateByUrl('/support/help');
  }
}
