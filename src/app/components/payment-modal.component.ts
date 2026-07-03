import { Component, computed, effect, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideCheckCircle2,
  LucideCreditCard,
  LucideLock,
  LucideQrCode,
  LucideSmartphone,
  LucideTicket,
  LucideTrash2,
} from '@lucide/angular';
import { CartService } from '@/services/cart.service';
import { I18nService } from '@/services/i18n.service';

type Step = 'cart' | 'checkout' | 'success';
type Gateway = 'vnpay' | 'momo' | 'visa';

@Component({
  selector: 'app-payment-modal',
  standalone: true,
  imports: [
    DecimalPipe,
    FormsModule,
    LucideCheckCircle2,
    LucideCreditCard,
    LucideLock,
    LucideQrCode,
    LucideSmartphone,
    LucideTicket,
    LucideTrash2,
  ],
  template: `
    @if (cart.isPaymentOpen()) {
      <div class="fixed inset-0 z-[72] flex items-center justify-center overflow-y-auto bg-black/65 p-4 backdrop-blur-xs">
        <div class="relative my-8 w-full max-w-2xl rounded-3xl border border-amber-200 bg-white p-6 shadow-2xl md:p-8">
          <button type="button" class="absolute right-5 top-4 z-10 text-2xl font-black text-stone-400 transition hover:text-stone-800" (click)="close()">×</button>

          <!-- STEP 1: CART -->
          @if (step() === 'cart') {
            <div class="space-y-6">
              <div>
                <h3 class="flex items-center gap-1.5 text-xl font-black uppercase tracking-tight text-stone-950 md:text-2xl">
                  <span>{{ isVi() ? 'Hành Trình Trọn Gói Chọn Lọc' : 'Selected Vacation Bundle' }}</span>
                  @if (isBundleEligible()) { <span class="rounded bg-amber-500 px-2 py-0.5 font-mono text-xs font-black text-stone-900">15% OFF</span> }
                </h3>
                <p class="mt-1 text-xs text-stone-500">{{ isVi() ? 'Kiểm tra tóm tắt giỏ vé trước khi chuyển sang bước thanh toán.' : 'Review your selected services before moving to payment.' }}</p>
              </div>

              @if (items().length === 0) {
                <div class="space-y-4 py-10 text-center">
                  <svg lucideTicket class="mx-auto h-12 w-12 animate-pulse text-stone-300"></svg>
                  <p class="text-xs text-stone-500">{{ isVi() ? 'Không có dịch vụ nào trong gói.' : 'No selections loaded yet. Go add some hotels, rides or excursions!' }}</p>
                  <button type="button" class="rounded-xl bg-natural-gold-deep px-4 py-2 text-xs font-bold text-stone-950 transition hover:bg-natural-gold-dark" (click)="close()">{{ isVi() ? 'Quay lại khám phá' : 'Go discover' }}</button>
                </div>
              } @else {
                <div class="space-y-4">
                  <div class="max-h-[220px] space-y-3 overflow-y-auto border-b border-stone-100 pb-4 pr-2">
                    @for (item of items(); track item.cartKey || item.id) {
                      <div class="flex items-center justify-between rounded-xl border border-stone-150 bg-stone-50 p-3">
                        <div class="flex items-center gap-3">
                          <img [src]="item.image" [alt]="item.name" class="h-10 w-10 shrink-0 rounded-md border border-stone-200 object-cover" />
                          <div class="min-w-0">
                            <h5 class="line-clamp-1 text-xs font-bold text-stone-900">{{ item.name }}</h5>
                            <span class="rounded bg-amber-100/50 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase text-natural-bronze">{{ item.type === 'hotel' ? (isVi() ? 'Khách sạn' : 'Hotel') : item.type === 'vehicle' ? (isVi() ? 'Thuê Xe tự lái' : 'Ride Rental') : (isVi() ? 'Tour di sản' : 'Excursion') }}</span>
                            @if (item.details) { <p class="mt-1 max-w-[260px] truncate text-[10px] text-stone-500">{{ item.details }}</p> }
                          </div>
                        </div>
                        <div class="flex items-center gap-4">
                          <span class="font-mono text-xs font-bold text-stone-800">{{ item.price | number : '1.0-0' }} đ</span>
                          <button type="button" class="rounded-lg px-2 py-1 text-stone-300 transition hover:bg-red-50 hover:text-red-500" (click)="cart.removeItem(item.cartKey || item.id)"><svg lucideTrash2 class="h-4 w-4"></svg></button>
                        </div>
                      </div>
                    }
                  </div>

                  <!-- Voucher -->
                  <div class="space-y-2.5 rounded-2xl border border-stone-200 bg-natural-cream p-4">
                    <label class="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-stone-700"><svg lucideTicket class="h-3.5 w-3.5 text-natural-accent"></svg><span>{{ isVi() ? 'Khuyến mãi & Mã giảm giá (Voucher)' : 'Promotional & Voucher Code' }}</span></label>
                    <div class="flex gap-2">
                      <input type="text" [ngModel]="voucherCode()" (ngModelChange)="onVoucherInput($event)" [disabled]="!!appliedVoucher()" [placeholder]="isVi() ? 'Nhập mã: VIETCHARM15, HOIANWELCOME, GENZTRAVEL...' : 'Enter code (e.g., VIETCHARM15)'" class="flex-1 rounded-xl border border-stone-300 px-3.5 py-2 font-mono text-xs outline-none focus:border-natural-accent disabled:opacity-60" />
                      @if (appliedVoucher()) {
                        <button type="button" class="rounded-xl bg-red-50 px-3.5 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100" (click)="removeVoucher()">{{ isVi() ? 'Xóa mã' : 'Remove' }}</button>
                      } @else {
                        <button type="button" class="rounded-xl bg-natural-accent px-4 py-2 text-xs font-bold text-white transition hover:bg-natural-olive" (click)="applyVoucher()">{{ isVi() ? 'Áp dụng' : 'Apply' }}</button>
                      }
                    </div>
                    @if (voucherError()) { <p class="text-[10px] font-semibold text-red-500">{{ voucherError() }}</p> }
                    @if (appliedVoucher()) { <p class="text-[10px] font-semibold text-emerald-600">{{ isVi() ? '✓ Đã áp dụng mã ' + appliedVoucher() + ' thành công: Giảm thêm -' + (voucherDiscount() | number : '1.0-0') + 'đ!' : '✓ Code ' + appliedVoucher() + ' applied successfully: Extra -' + (voucherDiscount() | number : '1.0-0') + 'đ off!' }}</p> }
                  </div>

                  <!-- Pricing summary -->
                  <div class="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber-200/50 bg-amber-500/5 p-4 text-xs font-medium">
                    <div class="space-y-1">
                      <p class="text-stone-500">{{ isVi() ? 'Tổng tiền gốc:' : 'Initial cost:' }} <span class="font-mono font-bold" [class.line-through]="isBundleEligible()">{{ totalCost() | number : '1.0-0' }} đ</span></p>
                      <p class="font-bold" [class.text-emerald-600]="isBundleEligible()" [class.text-stone-400]="!isBundleEligible()">{{ isBundleEligible() ? (isVi() ? 'Tiết kiệm combo (15%):' : 'Bundle savings (15%):') : (isVi() ? 'Combo chưa đủ điều kiện:' : 'Bundle not eligible:') }} <span class="font-mono">-{{ discountAmount() | number : '1.0-0' }} đ</span></p>
                      @if (voucherDiscount() > 0) { <p class="font-extrabold text-emerald-700">{{ isVi() ? 'Mã voucher (' + appliedVoucher() + '):' : 'Voucher applied (' + appliedVoucher() + '):' }} <span class="font-mono">-{{ voucherDiscount() | number : '1.0-0' }} đ</span></p> }
                    </div>
                    <div class="text-right">
                      <p class="text-[10px] font-bold uppercase text-stone-400">{{ isVi() ? 'CẦN THANH TOÁN' : 'PAYABLE TOTAL' }}</p>
                      <p class="font-mono text-xl font-black text-natural-bronze">{{ payableAmount() | number : '1.0-0' }} đ</p>
                    </div>
                  </div>

                  <div class="flex items-center justify-between pt-2">
                    <button type="button" class="text-xs font-semibold text-stone-400 hover:text-stone-700" (click)="confirmClearOpen.set(true)">{{ isVi() ? 'Xóa giỏ hàng để đặt lại' : 'Clear selections' }}</button>
                    <button type="button" class="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-6 py-2.5 text-xs font-black text-white shadow-md transition hover:bg-emerald-600" (click)="step.set('checkout')"><span>{{ isVi() ? 'TIẾN HÀNH THANH TOÁN' : 'PROCEED TO CHECKOUT' }}</span></button>
                  </div>
                </div>
              }
            </div>
          }

          <!-- STEP 2: CHECKOUT -->
          @if (step() === 'checkout') {
            <div class="space-y-6">
              @if (paymentLoading()) {
                <div class="absolute inset-0 z-40 flex flex-col items-center justify-center rounded-3xl bg-white/95 p-6 text-center backdrop-blur-xs">
                  <div class="relative h-12 w-12">
                    <div class="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
                    <svg lucideLock class="absolute inset-0 m-auto h-4 w-4 animate-pulse text-emerald-500"></svg>
                  </div>
                  <h4 class="mt-6 text-sm font-black text-stone-900">{{ isVi() ? 'Đang xử lý thanh toán...' : 'Processing payment...' }}</h4>
                  <p class="mt-2 max-w-sm whitespace-pre-wrap font-mono text-xs leading-relaxed text-stone-500">{{ loadingText() }}</p>
                </div>
              }

              <div>
                <h3 class="flex items-center gap-1.5 text-xl font-black tracking-tight text-stone-950 md:text-2xl"><svg lucideLock class="h-6 w-6 text-emerald-600"></svg><span>{{ t().securePayment }}</span></h3>
                <p class="mt-1 text-xs text-stone-500">{{ isVi() ? 'Kiểm tra thông tin và xác nhận để hoàn tất đặt chỗ.' : 'Review the details and confirm to complete your booking.' }}</p>
              </div>

              <div class="grid grid-cols-3 gap-3">
                <button type="button" [class]="gatewayClass('visa')" (click)="gateway.set('visa')"><svg lucideCreditCard class="h-5 w-5 text-amber-700"></svg><span class="text-[10px] font-bold">Thẻ Quốc Tế</span></button>
                <button type="button" [class]="gatewayClass('vnpay')" (click)="gateway.set('vnpay')"><svg lucideQrCode class="h-5 w-5 text-blue-700"></svg><span class="text-[10px] font-bold">VNPAY QR</span></button>
                <button type="button" [class]="gatewayClass('momo')" (click)="gateway.set('momo')"><svg lucideSmartphone class="h-5 w-5 text-pink-700"></svg><span class="text-[10px] font-bold">Ví MoMo</span></button>
              </div>

              <form class="space-y-4" (ngSubmit)="submitPayment()">
                @if (gateway() === 'visa') {
                  <div class="space-y-3">
                    <div>
                      <label class="mb-1 block text-[11px] font-bold text-stone-600">{{ isVi() ? 'Số thẻ Visa / Mastercard / JCB' : 'Credit Card Number' }}</label>
                      <input type="text" [ngModel]="cardNo()" (ngModelChange)="onCardNo($event)" name="cardNo" placeholder="4221 0953 8412 5593" required class="w-full rounded border border-stone-300 px-3 py-2 text-xs outline-none focus:border-amber-400" />
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                      <div><label class="mb-1 block text-[11px] font-bold text-stone-600">{{ isVi() ? 'Ngày hết hạn' : 'Expiration date' }}</label><input type="text" name="exp" placeholder="12/28" required class="w-full rounded border border-stone-300 px-3 py-2 text-center text-xs outline-none focus:border-amber-400" /></div>
                      <div><label class="mb-1 block text-[11px] font-bold text-stone-600">CVC / CVV</label><input type="password" name="cvc" placeholder="***" maxlength="3" required class="w-full rounded border border-stone-300 px-3 py-2 text-center text-xs outline-none focus:border-amber-400" /></div>
                    </div>
                    <div><label class="mb-1 block text-[11px] font-bold text-stone-600">{{ isVi() ? 'Chủ tài khoản (Không dấu)' : 'Cardholder Name' }}</label><input type="text" [ngModel]="cardHolder()" (ngModelChange)="cardHolder.set($event.toUpperCase())" name="holder" placeholder="NGUYEN VAN A" required class="w-full rounded border border-stone-300 px-3 py-2 text-xs outline-none focus:border-amber-400" /></div>
                  </div>
                } @else {
                  <div class="space-y-2 rounded-xl border border-stone-150 bg-stone-50 py-4 text-center">
                    <svg lucideSmartphone class="mx-auto h-8 w-8 animate-bounce text-natural-bronze"></svg>
                    <h5 class="text-xs font-bold text-stone-900">{{ isVi() ? 'Cổng quét QR chuyển khoá tức thì' : 'Instant Scan Code Dispatch' }}</h5>
                    <p class="mx-auto max-w-sm text-[11px] leading-relaxed text-stone-500">{{ isVi() ? 'Sau khi xác nhận, VietCharm sẽ tạo mã QR để bạn tiếp tục thanh toán bằng ứng dụng đã chọn.' : 'After confirmation, VietCharm will generate a QR code for your selected payment app.' }}</p>
                  </div>
                }

                <div class="space-y-1 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 text-[10px] leading-relaxed text-stone-600">
                  <p class="flex items-center gap-1.5 font-bold text-emerald-800"><svg lucideCheckCircle2 class="h-4 w-4 text-emerald-600"></svg>{{ isVi() ? 'Xác nhận đặt chỗ VietCharm' : 'VietCharm booking confirmation' }}</p>
                  <p>{{ isVi() ? 'Sau khi thanh toán thành công, mã đặt chỗ và chi tiết dịch vụ sẽ được lưu trong phiếu xác nhận.' : 'After successful payment, your booking code and service details will appear on the confirmation ticket.' }}</p>
                </div>

                <div class="flex gap-4 border-t border-stone-100 pt-4">
                  <button type="button" class="w-1/3 rounded-xl border border-stone-200 py-2.5 text-center text-xs font-bold text-stone-600 transition hover:bg-stone-100 hover:text-stone-900" (click)="step.set('cart')">{{ isVi() ? 'Quay lại' : 'Go back' }}</button>
                  <button type="submit" class="flex w-2/3 items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 text-center text-xs font-black text-white shadow-md transition hover:bg-emerald-600"><span>{{ (isVi() ? 'XÁC NHẬN THANH TOÁN ' : 'CONFIRM PAYMENT ') + (payableAmount() | number : '1.0-0') + ' đ' }}</span></button>
                </div>
              </form>
            </div>
          }

          <!-- STEP 3: SUCCESS -->
          @if (step() === 'success') {
            <div class="space-y-6 text-center">
              <div class="mx-auto flex h-16 w-16 animate-bounce items-center justify-center rounded-full border-2 border-emerald-300 bg-emerald-100 text-emerald-600 shadow-lg"><svg lucideCheckCircle2 class="h-10 w-10"></svg></div>
              <div>
                <h3 class="text-xl font-black tracking-tight text-emerald-600 md:text-2xl">{{ t().paymentSuccess }}</h3>
                <p class="mt-1 text-[11px] font-bold uppercase tracking-widest text-stone-500">{{ isVi() ? 'mã số đặt chỗ: VCHARM-84953' : 'Booking reference: VCHARM-84953' }}</p>
              </div>

              <div class="relative mx-auto max-w-sm rounded-2xl border-2 border-dashed border-amber-300 bg-[#FAF9F5] p-6 text-left shadow-md">
                <div class="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border border-dashed border-amber-300 bg-white"></div>
                <div class="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border border-dashed border-amber-300 bg-white"></div>
                <div class="mb-4 flex items-center justify-between border-b border-stone-200 pb-3 text-xs">
                  <div><h4 class="font-black tracking-tight text-stone-900">{{ t().eTicket }}</h4><span class="text-[9px] font-black uppercase text-natural-bronze">{{ isVi() ? 'Mạng đối tác VietCharm' : 'VietCharm partner network' }}</span></div>
                  <svg lucideTicket class="h-5 w-5 text-amber-500"></svg>
                </div>
                <div class="space-y-3.5 text-xs">
                  <div>
                    <p class="text-[10px] font-bold uppercase text-stone-400">{{ isVi() ? 'DANH SÁCH DỊCH VỤ' : 'LOADED SERVICES' }}</p>
                    <div class="mt-1 space-y-1 text-[11px] font-medium text-stone-700">
                      @for (item of items(); track item.cartKey || item.id) {
                        <div class="flex justify-between"><span class="line-clamp-1 max-w-[200px]">● {{ item.name }}</span><span class="font-mono font-bold text-stone-900">x{{ item.quantity }}</span></div>
                      }
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-4 border-t border-stone-200 pt-3 text-[11px]">
                    <div><span class="block text-[9px] font-bold uppercase text-stone-400">{{ isVi() ? 'TRẠNG THÁI' : 'STATUS' }}</span><span class="mt-0.5 flex items-center gap-0.5 font-black text-emerald-600"><svg lucideLock class="h-3.5 w-3.5"></svg>{{ isVi() ? 'ĐÃ XÁC NHẬN' : 'CONFIRMED' }}</span></div>
                    <div><span class="block text-[9px] font-bold uppercase text-stone-400">{{ isVi() ? 'THỜI GIAN ĐẶT' : 'TIMESTAMP' }}</span><span class="mt-0.5 block font-mono font-bold text-stone-800">{{ timestamp }}</span></div>
                  </div>
                  <div class="flex flex-col items-center justify-center space-y-2 border-t border-stone-200 pt-4">
                    <div class="rounded-lg border border-amber-200 bg-white p-3 shadow-sm">
                      <svg width="100" height="100" viewBox="0 0 100 100">
                        <rect width="100" height="100" fill="white" />
                        <rect x="5" y="5" width="25" height="25" fill="#3A3845" /><rect x="10" y="10" width="15" height="15" fill="white" /><rect x="13" y="13" width="9" height="9" fill="#3A3845" />
                        <rect x="70" y="5" width="25" height="25" fill="#3A3845" /><rect x="75" y="10" width="15" height="15" fill="white" /><rect x="78" y="13" width="9" height="9" fill="#3A3845" />
                        <rect x="5" y="70" width="25" height="25" fill="#3A3845" /><rect x="10" y="75" width="15" height="15" fill="white" /><rect x="13" y="78" width="9" height="9" fill="#3A3845" />
                        <rect x="40" y="10" width="5" height="10" fill="#3A3845" /><rect x="50" y="5" width="10" height="5" fill="#3A3845" /><rect x="70" y="40" width="15" height="5" fill="#3A3845" /><rect x="40" y="50" width="5" height="20" fill="#3A3845" /><rect x="50" y="70" width="10" height="10" fill="#3A3845" /><rect x="80" y="70" width="15" height="15" fill="#3A3845" /><rect x="25" y="45" width="10" height="10" fill="#3A3845" /><rect x="65" y="50" width="5" height="10" fill="#3A3845" /><rect x="50" y="45" width="10" height="15" fill="#3A3835" /><rect x="85" y="45" width="10" height="5" fill="#3A3845" />
                      </svg>
                    </div>
                    <p class="text-[9px] font-bold uppercase tracking-widest text-stone-500">{{ isVi() ? 'QUÉT ĐỂ NHẬN PHÒNG / NHẬN XE' : 'SCAN AT LOUNGE CHECK-IN' }}</p>
                  </div>
                </div>
              </div>

              <div class="mx-auto flex max-w-sm gap-4 pt-4">
                <button type="button" class="w-1/2 rounded-xl border border-stone-200 py-2.5 text-xs font-bold text-stone-700 shadow-xs transition hover:bg-stone-50" (click)="print()">{{ isVi() ? 'In hóa đơn' : 'Print ticket' }}</button>
                <button type="button" class="w-1/2 rounded-xl bg-natural-ink-soft py-2.5 text-xs font-black text-white shadow-md transition hover:bg-[#2A2835]" (click)="finish()">{{ isVi() ? 'Trở về màn hình chủ' : 'Explore further' }}</button>
              </div>
            </div>
          }

          <!-- Confirm clear dialog -->
          @if (confirmClearOpen()) {
            <div class="absolute inset-0 z-50 flex items-center justify-center rounded-3xl bg-white/88 p-5 backdrop-blur-xs">
              <div class="w-full max-w-sm rounded-2xl border border-red-100 bg-white p-5 text-left shadow-2xl">
                <div class="flex items-start gap-3">
                  <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600"><svg lucideTrash2 class="h-5 w-5"></svg></div>
                  <div>
                    <h4 class="font-black text-stone-950">{{ isVi() ? 'Xóa các dịch vụ đang chọn?' : 'Clear selected services?' }}</h4>
                    <p class="mt-1 text-sm leading-relaxed text-stone-500">{{ isVi() ? 'Bạn sẽ cần chọn lại dịch vụ nếu muốn thanh toán sau.' : 'You will need to choose the services again before checkout.' }}</p>
                  </div>
                </div>
                <div class="mt-5 grid grid-cols-2 gap-3">
                  <button type="button" class="rounded-xl border border-stone-200 px-4 py-2.5 text-xs font-black text-stone-600 transition hover:bg-stone-50" (click)="confirmClearOpen.set(false)">{{ isVi() ? 'Giữ lại' : 'Keep' }}</button>
                  <button type="button" class="rounded-xl bg-red-600 px-4 py-2.5 text-xs font-black text-white transition hover:bg-red-700" (click)="doClear()">{{ isVi() ? 'Xóa' : 'Clear' }}</button>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    }
  `,
})
export class PaymentModalComponent {
  readonly step = signal<Step>('cart');
  readonly gateway = signal<Gateway>('visa');
  readonly cardNo = signal('');
  readonly cardHolder = signal('');
  readonly paymentLoading = signal(false);
  readonly loadingText = signal('');
  readonly voucherCode = signal('');
  readonly voucherDiscount = signal(0);
  readonly appliedVoucher = signal<string | null>(null);
  readonly voucherError = signal('');
  readonly confirmClearOpen = signal(false);
  readonly timestamp = new Date().toLocaleDateString('en-CA');

  readonly isVi = computed(() => this.i18n.isVi());
  readonly t = computed(() => this.i18n.dictionary());
  readonly items = computed(() => this.cart.selectedItems());
  readonly totalCost = computed(() => this.items().reduce((acc, item) => acc + item.price * item.quantity, 0));
  readonly isBundleEligible = computed(() => {
    const types = new Set(this.items().map((i) => i.type)).size;
    return this.items().length >= 2 && types >= 2;
  });
  readonly discountAmount = computed(() => (this.isBundleEligible() ? Math.round(this.totalCost() * 0.15) : 0));
  readonly basePayableAmount = computed(() => this.totalCost() - this.discountAmount());
  readonly payableAmount = computed(() => Math.max(0, this.basePayableAmount() - this.voucherDiscount()));

  private loadingTimer?: ReturnType<typeof setInterval>;

  constructor(
    readonly cart: CartService,
    readonly i18n: I18nService,
  ) {
    // Sync to the requested initial step each time the modal opens.
    effect(() => {
      if (this.cart.isPaymentOpen()) {
        this.step.set(this.cart.paymentInitialStep());
      }
    });
  }

  gatewayClass(g: Gateway): string {
    const active = this.gateway() === g;
    return 'flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 transition ' + (active ? 'border-natural-gold-deep bg-amber-500/5 text-stone-900' : 'border-stone-200 hover:bg-stone-50');
  }

  onVoucherInput(value: string): void {
    this.voucherCode.set(value.toUpperCase());
    this.voucherError.set('');
  }

  onCardNo(value: string): void {
    this.cardNo.set(value.replace(/\D/g, '').substring(0, 16));
  }

  applyVoucher(): void {
    const trimmed = this.voucherCode().trim().toUpperCase();
    const base = this.basePayableAmount();
    if (trimmed === 'VIETCHARM15') {
      this.voucherDiscount.set(Math.round(base * 0.15));
      this.appliedVoucher.set('VIETCHARM15');
      this.voucherError.set('');
    } else if (trimmed === 'HOIANWELCOME') {
      this.voucherDiscount.set(100000);
      this.appliedVoucher.set('HOIANWELCOME');
      this.voucherError.set('');
    } else if (trimmed === 'GENZTRAVEL') {
      this.voucherDiscount.set(Math.round(base * 0.2));
      this.appliedVoucher.set('GENZTRAVEL');
      this.voucherError.set('');
    } else if (trimmed === '') {
      this.voucherError.set(this.isVi() ? 'Vui lòng nhập mã giảm giá!' : 'Please enter a promo code!');
    } else {
      this.voucherError.set(this.isVi() ? 'Mã giảm giá này không hợp lệ hoặc đã hết hạn!' : 'Invalid voucher code or expired!');
    }
  }

  removeVoucher(): void {
    this.appliedVoucher.set(null);
    this.voucherDiscount.set(0);
    this.voucherCode.set('');
  }

  submitPayment(): void {
    this.paymentLoading.set(true);
    const steps = this.isVi()
      ? ['Đang xác nhận phương thức thanh toán...', 'Kiểm tra thông tin đặt chỗ...', 'Xác nhận số tiền cần thanh toán...', 'Gửi yêu cầu giữ chỗ đến đối tác dịch vụ...', 'Tạo phiếu xác nhận VietCharm QR...']
      : ['Confirming payment method...', 'Checking booking details...', 'Confirming payable amount...', 'Sending reservation request to service partners...', 'Issuing your VietCharm QR confirmation...'];
    let idx = 0;
    this.loadingText.set(steps[0]);
    this.loadingTimer = setInterval(() => {
      idx++;
      if (idx < steps.length) this.loadingText.set(steps[idx]);
    }, 850);
    setTimeout(() => {
      if (this.loadingTimer) clearInterval(this.loadingTimer);
      this.paymentLoading.set(false);
      this.step.set('success');
    }, 4500);
  }

  print(): void {
    if (typeof window !== 'undefined') window.print();
  }

  close(): void {
    if (this.step() === 'success') this.cart.clearSelectedItems();
    this.cart.closePayment();
    this.reset();
  }

  finish(): void {
    this.cart.clearSelectedItems();
    this.cart.closePayment();
    this.reset();
  }

  doClear(): void {
    this.cart.clearSelectedItems();
    this.confirmClearOpen.set(false);
  }

  private reset(): void {
    this.voucherCode.set('');
    this.voucherDiscount.set(0);
    this.appliedVoucher.set(null);
    this.voucherError.set('');
    this.gateway.set('visa');
    this.cardNo.set('');
    this.cardHolder.set('');
  }
}
