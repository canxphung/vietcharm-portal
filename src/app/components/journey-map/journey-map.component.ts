import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideArrowRight,
  LucideClock3,
  LucideCompass,
  LucideHotel,
  LucideMapPinned,
  LucideRoute,
  LucideUtensils,
} from '@lucide/angular';
import { I18nService } from '@/services/i18n.service';

type RouteId = 'north' | 'central' | 'south';

interface RouteCopy {
  name: string;
  eyebrow: string;
  stay: string;
  food: string;
  route: string;
  status: string;
}

interface RouteEntry {
  id: RouteId;
  x: string;
  y: string;
  image: string;
  vi: RouteCopy;
  en: RouteCopy;
}

const ROUTES: RouteEntry[] = [
  {
    id: 'north',
    x: '35%',
    y: '28%',
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=900&q=80',
    vi: {
      name: 'Miền Bắc',
      eyebrow: 'Hà Nội, Hạ Long, Sa Pa',
      stay: 'Khách sạn phố cổ hoặc retreat vùng núi',
      food: 'Phở, bún chả, đặc sản vùng cao',
      route: 'Gợi ý: phố cổ Hà Nội, vịnh biển, ruộng bậc thang và bản làng.',
      status: 'Đang bổ sung dữ liệu đối tác',
    },
    en: {
      name: 'Northern Vietnam',
      eyebrow: 'Hanoi, Ha Long, Sa Pa',
      stay: 'Old Quarter hotels or mountain retreats',
      food: 'Pho, bun cha, highland specialties',
      route: 'Idea: Hanoi old streets, bay views, rice terraces, and village stays.',
      status: 'Partner data being added',
    },
  },
  {
    id: 'central',
    x: '54%',
    y: '52%',
    image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=900&q=80',
    vi: {
      name: 'Miền Trung',
      eyebrow: 'Hội An, Đà Nẵng, Huế',
      stay: 'Boutique phố cổ, khách sạn biển hoặc resort yên tĩnh',
      food: 'Mì Quảng, cao lầu, bún bò, hải sản',
      route: 'Gợi ý: phố cổ, bãi biển, cố đô và một chặng ẩm thực địa phương.',
      status: 'Đang mở đặt dịch vụ',
    },
    en: {
      name: 'Central Vietnam',
      eyebrow: 'Hoi An, Da Nang, Hue',
      stay: 'Ancient-town boutiques, beach hotels, or quiet resorts',
      food: 'Mi quang, cao lau, bun bo, seafood',
      route: 'Idea: old town, beach time, imperial sites, and a local food leg.',
      status: 'Now open for booking',
    },
  },
  {
    id: 'south',
    x: '70%',
    y: '72%',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=900&q=80',
    vi: {
      name: 'Miền Nam',
      eyebrow: 'Sài Gòn, miền Tây, Phú Quốc',
      stay: 'Khách sạn trung tâm, homestay sông nước hoặc resort đảo',
      food: 'Cơm tấm, hủ tiếu, trái cây miệt vườn',
      route: 'Gợi ý: city break, chợ nổi, vườn trái cây và vài ngày nghỉ biển.',
      status: 'Đang bổ sung dữ liệu đối tác',
    },
    en: {
      name: 'Southern Vietnam',
      eyebrow: 'Saigon, Mekong, Phu Quoc',
      stay: 'City hotels, riverside homestays, or island resorts',
      food: 'Com tam, hu tieu, orchard fruit',
      route: 'Idea: city break, floating market, orchards, and a beach reset.',
      status: 'Partner data being added',
    },
  },
];

@Component({
  selector: 'app-journey-map',
  standalone: true,
  imports: [
    RouterLink,
    LucideArrowRight,
    LucideClock3,
    LucideCompass,
    LucideHotel,
    LucideMapPinned,
    LucideRoute,
    LucideUtensils,
  ],
  templateUrl: './journey-map.component.html',
  styleUrl: './journey-map.component.css',
})
export class JourneyMapComponent {
  readonly routes = ROUTES;
  readonly activeRouteId = signal<RouteId>('central');
  readonly isVi = computed(() => this.i18n.isVi());
  readonly active = computed(() => this.routes.find((r) => r.id === this.activeRouteId()) ?? this.routes[1]);
  readonly copy = computed(() => (this.isVi() ? this.active().vi : this.active().en));

  constructor(private readonly i18n: I18nService) {}
}
