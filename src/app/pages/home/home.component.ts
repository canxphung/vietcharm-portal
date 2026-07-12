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

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    RouterLink,
    JourneyMapComponent,
    RevealDirective,
    LucideAlertCircle,
    LucideArrowRight,
    LucideCalendarDays,
    LucideChevronDown,
    LucideCompass,
    LucideHotel,
    LucideMap,
    LucideMapPinned,
    LucideShieldCheck,
    LucideSparkles,
    LucideUsersRound,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  readonly heroImage =
    'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1800&q=85';
  readonly stats = [
    { icon: 'calendar', valueVi: 'AI', valueEn: 'AI', labelVi: 'lịch trình theo gu', labelEn: 'mood-based routes', label: 'routes' },
    { icon: 'hotel', valueVi: '18+', valueEn: '18+', labelVi: 'lưu trú chọn lọc', labelEn: 'curated stays', label: 'stays' },
    { icon: 'map', valueVi: 'Bắc-Trung-Nam', valueEn: 'N-C-S', labelVi: 'khung vùng du lịch', labelEn: 'regional framework', label: 'framework' },
    { icon: 'users', valueVi: 'Nhóm', valueEn: 'Groups', labelVi: 'cùng vote lịch trình', labelEn: 'co-plan together', label: 'group' },
  ];

  readonly showModal = signal(false);
  readonly selectedRegion = signal<'north' | 'south'>('north');
  readonly regionPreview = computed(() => {
    const vi = this.i18n.isVi();
    if (this.selectedRegion() === 'north') {
      return {
        title: vi ? 'Miền Bắc đang được mở dữ liệu' : 'Northern Vietnam is being mapped',
        body: vi
          ? 'Hà Nội, Hạ Long và Sa Pa sẽ có lịch trình riêng cho đô thị cổ, vịnh biển và cung núi. Hiện tại VietCharm đang ưu tiên hoàn thiện kho lưu trú và tour đối tác trước khi mở đặt chỗ.'
          : 'Hanoi, Halong and Sapa will get dedicated city, bay and mountain planning flows. VietCharm is finishing partner inventory before opening booking.',
        note: vi ? 'Gợi ý sắp tới: Hà Nội 2N1Đ, Hạ Long du thuyền, Sa Pa trekking nhẹ.' : 'Coming next: Hanoi 2D1N, Halong cruise, soft Sapa trekking.',
      };
    }
    return {
      title: vi ? 'Miền Nam đang được mở dữ liệu' : 'Southern Vietnam is being mapped',
      body: vi
        ? 'Sài Gòn, Miền Tây và Phú Quốc sẽ được tách theo nhịp đô thị, sông nước và nghỉ dưỡng đảo. Dữ liệu nhà cung cấp đang được kiểm tra để tránh mở dịch vụ rỗng.'
        : 'Saigon, Mekong and Phu Quoc will be split into city, river and island-rest flows. Vendor data is being verified before booking opens.',
      note: vi ? 'Gợi ý sắp tới: city tour Sài Gòn, chợ nổi, resort Phú Quốc.' : 'Coming next: Saigon city tours, floating markets, Phu Quoc resorts.',
    };
  });

  constructor(
    readonly i18n: I18nService,
    readonly ui: UiStateService,
  ) {}

  openRegion(region: 'north' | 'south'): void {
    this.selectedRegion.set(region);
    this.showModal.set(true);
  }
}
