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
  template: `
    <!-- Floating trigger -->
    <div class="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      <button type="button" id="help-promo-center-trigger" class="flex items-center gap-2 rounded-full border border-amber-100 bg-natural-accent px-5 py-3.5 text-xs font-serif font-black uppercase tracking-wider text-white shadow-2xl transition-all hover:scale-105 hover:bg-natural-olive active:scale-95" (click)="open.set(true)">
        <svg lucideHelpCircle class="h-4 w-4 text-natural-gold"></svg>
        <span>{{ i18n.isVi() ? 'Hỗ trợ & Ưu đãi' : 'Help & Promos' }}</span>
        <span class="relative flex h-2 w-2">
          <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-natural-gold opacity-75"></span>
          <span class="relative inline-flex h-2 w-2 rounded-full bg-natural-gold"></span>
        </span>
      </button>
    </div>

    @if (open()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/55 backdrop-blur-xs" (click)="open.set(false)"></div>
        <div class="relative z-10 flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-natural-border bg-natural-bg shadow-2xl">
          <!-- Header -->
          <div class="flex items-center justify-between border-b border-natural-border/20 bg-natural-text p-5 text-white">
            <div class="flex items-center gap-2">
              <div class="rounded-lg bg-natural-accent p-1.5"><svg lucideBookOpen class="h-5 w-5 text-natural-bg"></svg></div>
              <div>
                <h3 class="flex items-center gap-1.5 font-serif text-base font-black uppercase tracking-wide">
                  {{ i18n.isVi() ? 'TRUNG TÂM TRỢ GIÚP & QUÀ TẶNG' : 'GUEST HELP & PROMOTIONS' }}
                  <svg lucideSparkles class="h-4 w-4 animate-pulse text-natural-gold"></svg>
                </h3>
                <p class="font-sans text-[10px] tracking-wide text-stone-300">{{ i18n.isVi() ? 'Hướng dẫn làm chủ VietCharm & Săn Deal hời lữ hành' : 'Learn how to book, customize and capture discounts' }}</p>
              </div>
            </div>
            <button type="button" class="rounded-full p-1 text-white transition hover:bg-white/10" (click)="open.set(false)"><svg lucideX class="h-5 w-5"></svg></button>
          </div>

          <!-- Tabs -->
          <div class="flex border-b border-stone-200 bg-natural-beige text-xs font-bold uppercase tracking-wider">
            <button type="button" (click)="tab.set('guide')" [class]="'flex flex-1 items-center justify-center gap-1.5 border-b-2 py-3 text-center transition ' + (tab() === 'guide' ? 'border-natural-accent bg-natural-bg text-natural-accent' : 'border-transparent text-stone-500 hover:text-stone-700')">
              <svg lucideCompass class="h-4 w-4"></svg><span>{{ i18n.isVi() ? 'Làm gì khi vô Web?' : 'How to Use Web?' }}</span>
            </button>
            <button type="button" (click)="tab.set('promos')" [class]="'flex flex-1 items-center justify-center gap-1.5 border-b-2 py-3 text-center transition ' + (tab() === 'promos' ? 'border-natural-accent bg-natural-bg text-natural-accent' : 'border-transparent text-stone-500 hover:text-stone-700')">
              <svg lucideGift class="h-4 w-4"></svg><span>{{ i18n.isVi() ? 'Mã Giảm Giá & Deal Sốc' : 'Promos & Codes' }}</span>
              <span class="rounded-full bg-natural-gold px-1.5 font-mono text-[9px] text-natural-text">NEW</span>
            </button>
          </div>

          <!-- Content -->
          <div class="max-h-[60vh] space-y-4 overflow-y-auto p-6">
            @if (tab() === 'guide') {
              <div class="space-y-4 text-xs text-natural-text">
                <div class="flex items-start gap-3 rounded-2xl border border-amber-100 bg-natural-cream p-4">
                  <svg lucideAward class="mt-0.5 h-5 w-5 shrink-0 text-amber-500"></svg>
                  <div>
                    <h4 class="font-serif text-sm font-bold text-natural-text">{{ i18n.isVi() ? 'Xin chào Lữ Khách Phương Xa!' : 'Welcome to VietCharm!' }}</h4>
                    <p class="mt-1 leading-relaxed text-natural-text/85">{{ i18n.isVi() ? 'VietCharm là nền tảng du lịch theo vùng, giúp gom điểm đến, dịch vụ và lịch trình vào một flow dễ theo dõi. Chỉ với vài thao tác nhỏ dưới đây, bạn đã có thể sở hữu lịch trình tiết kiệm mộc mạc nhất:' : 'VietCharm is a region-based travel platform that brings destinations, services, and itineraries into one clear flow. Follow these step-by-step instructions to navigate perfectly:' }}</p>
                  </div>
                </div>
                <div class="relative ml-3 space-y-5 border-l border-natural-accent/20 pl-5">
                  @for (st of steps(); track st.title) {
                    <div class="relative">
                      <span class="absolute -left-[27px] top-1.5 rounded-full border border-white bg-natural-accent p-1 text-white shadow-xs">
                        @switch (st.icon) {
                          @case ('map') { <svg lucideMapPin class="h-3 w-3 text-white"></svg> }
                          @case ('hotel') { <svg lucideHotel class="h-3 w-3 text-white"></svg> }
                          @case ('bag') { <svg lucideShoppingBag class="h-3 w-3 text-white"></svg> }
                          @case ('users') { <svg lucideUsers class="h-3 w-3 text-white"></svg> }
                          @case ('check') { <svg lucideCheckSquare class="h-3 w-3 text-white"></svg> }
                        }
                      </span>
                      <h5 class="font-serif text-sm font-bold text-stone-800">{{ st.title }}</h5>
                      <p class="mt-1 text-[11px] leading-relaxed text-stone-600">{{ st.desc }}</p>
                    </div>
                  }
                </div>
                <div class="mt-6 flex flex-col items-center justify-between gap-3 border-t border-natural-border pt-4 sm:flex-row">
                  <div>
                    <p class="text-[10px] font-black uppercase tracking-wider text-stone-400">{{ i18n.isVi() ? 'Đại lý & Bên thứ ba muốn đăng ký?' : 'Are you a local service provider?' }}</p>
                    <p class="text-[11px] text-stone-500">{{ i18n.isVi() ? 'Bạn có thể đăng ký dịch vụ lưu trú, cho thuê xe, hoạt động ngay tại VietCharm.' : 'Apply to host rooms, cars or tours on our verified network.' }}</p>
                  </div>
                  <button type="button" class="whitespace-nowrap rounded-xl bg-natural-accent px-4 py-2 text-[11px] font-bold uppercase text-white shadow-md transition hover:bg-natural-olive" (click)="goPartnership()">{{ i18n.isVi() ? 'Đăng Ký Đối Tác →' : 'Apply Partner →' }}</button>
                </div>
              </div>
            } @else {
              <div class="space-y-4">
                <div class="rounded-2xl border border-stone-200 bg-natural-cream p-4 text-center text-xs">
                  <p class="font-serif text-sm font-black uppercase tracking-tight text-stone-800">{{ i18n.isVi() ? '🔥 KHO VOUCHER KHUYẾN MÃI ĐỘC QUYỀN VIETCHARM' : 'EXCLUSIVE TRAVEL BUNDLED DISCOUNTS' }}</p>
                  <p class="mt-1 text-stone-500">{{ i18n.isVi() ? 'Nhấp chọn mã giảm giá để sao chép trực tiếp, áp dụng ngay ở Giỏ hàng thanh toán!' : 'Click any coupon code to copy it directly, and apply it in the payment checkout cart!' }}</p>
                </div>
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  @for (pr of promos(); track pr.code) {
                    <div class="group relative flex flex-col justify-between rounded-2xl border-2 border-dashed border-natural-border bg-white p-4 shadow-xs transition hover:border-natural-accent">
                      <div>
                        <div class="flex items-start justify-between gap-1">
                          <span class="rounded bg-amber-600/10 px-2 py-0.5 font-mono text-[9px] font-bold uppercase text-amber-700">{{ pr.badge }}</span>
                        </div>
                        <h5 class="mt-2 font-serif text-xs font-bold text-stone-800">{{ pr.title }}</h5>
                        <p class="mt-1 line-clamp-2 text-[11px] leading-relaxed text-stone-500">{{ pr.desc }}</p>
                      </div>
                      <div class="mt-4 flex items-center justify-between gap-2 border-t border-stone-100 pt-3">
                        <span class="select-all rounded-lg border border-natural-border bg-natural-beige px-2.5 py-1 font-mono text-sm font-black text-natural-accent">{{ pr.code }}</span>
                        <button type="button" [class]="'rounded-xl p-2 transition-all ' + (copied() === pr.code ? 'bg-emerald-50 text-emerald-600' : 'bg-natural-accent text-white hover:bg-natural-olive')" (click)="copy(pr.code)">
                          @if (copied() === pr.code) { <svg lucideCheck class="h-3.5 w-3.5"></svg> } @else { <svg lucideCopy class="h-3.5 w-3.5"></svg> }
                        </button>
                      </div>
                    </div>
                  }
                </div>
                <div class="rounded-2xl border border-natural-accent/30 bg-natural-accent/10 p-4 text-xs text-natural-text">
                  <h6 class="flex items-center gap-1 font-bold"><svg lucideHotel class="h-4 w-4 text-natural-accent"></svg>{{ i18n.isVi() ? 'Mẹo Nhận Khuyến Mãi Khách Sạn' : 'Hotel Saving Tip:' }}</h6>
                  <p class="mt-1 leading-relaxed text-stone-600">{{ i18n.isVi() ? 'Mã phòng đẹp giảm cực sâu khi được áp dụng cùng các lựa chọn khách sạn tiêu chuẩn di sản của VietCharm. Hãy cuộn xuống, bấm chọn phòng yêu thích và nhập mã giảm giá!' : 'Book beautiful properties with special rates. Choose any curated boutique hotel below and apply your coupon code during checkout!' }}</p>
                  <button type="button" class="mt-2 block text-xs font-bold text-natural-accent underline" (click)="goHotels()">{{ i18n.isVi() ? 'Đến danh mục Khách sạn ngay →' : 'Navigate to Hotels list now →' }}</button>
                </div>
              </div>
            }
          </div>

          <!-- Footer -->
          <div class="flex flex-wrap items-center justify-between gap-2 border-t border-natural-border bg-natural-cream p-4 text-center font-mono text-[10px] text-stone-400">
            <span>VIETCHARM ONLINE CONCIERGE SUPPORT</span>
            <span>HOTLINE: 1900 5040</span>
          </div>
        </div>
      </div>
    }
  `,
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
      { icon: 'check', title: vi ? '5. Áp Mã Voucher & Thanh toán' : '5. Apply Vouchers & Book', desc: vi ? 'Vào giỏ hàng, dán mã ưu đãi (Ví dụ: VIETCHARM15), điền Email để nhận hóa đơn bảo chứng di sản có QR hoàn hủy linh hoạt.' : 'Open your cart, apply coupon codes, fill in details, and download your heritage-backed travel voucher with cancellation rights.' },
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
}
