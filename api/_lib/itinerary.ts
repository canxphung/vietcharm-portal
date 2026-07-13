import { ActivityModel, type ActivityDocument } from './models/Activity';
import { AttractionModel, type AttractionDocument } from './models/Attraction';
import { HotelModel, type HotelDocument } from './models/Hotel';
import { ProvinceModel, type ProvinceDocument } from './models/Province';
import { VehicleModel, type VehicleDocument } from './models/Vehicle';

export interface ItineraryParams {
  province?: string;
  budget?: number;
  days?: number;
  travelers?: string; // 'couple' | 'family' | 'friends'
  mood?: string; // 'heritage' | 'beach' | 'food' | 'slow'
  pace?: string; // 'easy' | 'balanced' | 'packed'
  keywords?: string; // free text from the user, matched against item names/descriptions
  language?: string;
}

interface TimelineEntry {
  time: string;
  attractionName: string;
  description: string;
  costVND: number;
}

interface ItineraryDay {
  dayNumber: number;
  title: string;
  activities: TimelineEntry[];
}

const MOOD_PATTERNS: Record<string, RegExp> = {
  heritage: /di sản|phố cổ|chùa|đền|lăng|tháp|bảo tàng|cung đình|heritage|ancient|temple|pagoda|museum|citadel/i,
  beach: /biển|đảo|cano|lặn|san hô|bãi|vịnh|beach|island|snorkel|diving|bay|coral/i,
  food: /ẩm thực|đặc sản|món|chợ|quán|food|market|culinary|street/i,
  slow: /cà phê|thư giãn|spa|vườn|làng|đồi|coffee|relax|garden|village|scenic|sunset/i,
};

const TRAVELER_PATTERNS: Record<string, RegExp> = {
  couple: /lãng mạn|cặp đôi|hoàng hôn|đèn|romantic|couple|sunset/i,
  family: /gia đình|trẻ em|an toàn|công viên|làng|family|kids|safe|park/i,
  friends: /phượt|cano|lặn|trekking|leo|nhóm|adventure|group|hik/i,
};

// Matched against item NAMES only (descriptions mention lanterns/nights too often to be a reliable signal).
const MORNING_PATTERN = /bình minh|sáng sớm|sunrise/i;
const EVENING_PATTERN = /hoàng hôn|về đêm|buổi tối|đêm|đèn|sunset|night/i;

// Each pace maps to fixed time slots per day, alternating sightseeing and paid experiences.
const PACE_SLOTS: Record<string, Array<{ time: string; kind: 'attraction' | 'activity' }>> = {
  easy: [
    { time: '09:00', kind: 'attraction' },
    { time: '15:00', kind: 'activity' },
  ],
  balanced: [
    { time: '08:30', kind: 'attraction' },
    { time: '11:00', kind: 'activity' },
    { time: '16:00', kind: 'attraction' },
  ],
  packed: [
    { time: '08:00', kind: 'attraction' },
    { time: '10:30', kind: 'activity' },
    { time: '14:00', kind: 'attraction' },
    { time: '16:30', kind: 'activity' },
  ],
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function truncate(text: string, max = 140): string {
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}

function escapeRegex(word: string): string {
  return word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** "1.2k" / "850" review-count strings → 0..1 popularity weight (log scale, ~1k reviews ≈ 1). */
function parsePopularity(reviewsCount: string): number {
  const raw = String(reviewsCount ?? '');
  const kMatch = raw.replace(',', '.').match(/([\d.]+)\s*k/i);
  const count = kMatch ? parseFloat(kMatch[1]) * 1000 : parseFloat(raw.replace(/[^\d.]/g, '')) || 0;
  return Math.min(Math.log10(count + 1) / 3, 1);
}

/** Great-circle distance in km between two coordinates. */
function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const rad = Math.PI / 180;
  const h =
    Math.sin(((bLat - aLat) * rad) / 2) ** 2 +
    Math.cos(aLat * rad) * Math.cos(bLat * rad) * Math.sin(((bLng - aLng) * rad) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

/** +1 at the same spot, ~+0.5 at 4 km, fading toward 0 — keeps each day's stops clustered. */
function proximityBonus(km: number): number {
  return 1 / (1 + km / 4);
}

/** Attraction or paid activity normalized for slot-by-slot selection. */
interface Candidate {
  id: string;
  name: string;
  description: string;
  lat: number;
  lng: number;
  price: number;
  base: number;
  morning: boolean;
  evening: boolean;
}

export async function createItinerary({
  province = 'quang-nam',
  budget = 3000000,
  days = 3,
  travelers = 'couple',
  mood = 'heritage',
  pace = 'balanced',
  keywords = '',
  language = 'vi',
}: ItineraryParams) {
  const isVi = language === 'vi';
  const dayCount = clamp(Math.round(Number(days) || 3), 1, 7);
  const budgetVND = Math.max(Number(budget) || 3000000, 500000);

  const [provinceDoc, attractions, activities, hotels, vehicles] = await Promise.all([
    ProvinceModel.findById(province).lean<ProvinceDocument | null>(),
    AttractionModel.find({ provinceId: province }).lean<AttractionDocument[]>(),
    ActivityModel.find({ provinceId: province }).lean<ActivityDocument[]>(),
    HotelModel.find({ provinceId: province }).lean<HotelDocument[]>(),
    VehicleModel.find().lean<VehicleDocument[]>(),
  ]);

  if (!attractions.length && !activities.length) {
    return {
      success: true,
      source: 'local_fallback',
      data: getFallbackItinerary(province, budgetVND, language),
    };
  }

  const moodPattern = MOOD_PATTERNS[mood] ?? MOOD_PATTERNS['heritage'];
  const travelerPattern = TRAVELER_PATTERNS[travelers] ?? null;
  const words = keywords.split(/[\s,.;:!?]+/).filter((w) => w.length > 3);

  // Multi-criteria base score: quality, mood fit, traveler-group fit, keyword hits, review popularity.
  const baseScore = (name: string, description: string, rating: number, reviewsCount: string): number => {
    const haystack = `${name} ${description}`;
    let s = (rating / 5) * 2;
    if (moodPattern.test(haystack)) s += 0.8;
    if (travelerPattern?.test(haystack)) s += 0.6;
    let hits = 0;
    for (const word of words) {
      if (new RegExp(escapeRegex(word), 'i').test(haystack)) hits++;
    }
    s += Math.min(hits, 3) * 0.5;
    s += parsePopularity(reviewsCount) * 0.4;
    return s;
  };

  const toCandidate = (doc: AttractionDocument | ActivityDocument, price: number): Candidate => ({
    id: doc._id,
    name: doc.name,
    description: doc.description,
    lat: doc.lat,
    lng: doc.lng,
    price,
    base: baseScore(doc.name, doc.description, doc.rating, doc.reviewsCount),
    morning: MORNING_PATTERN.test(doc.name),
    evening: EVENING_PATTERN.test(doc.name),
  });
  const attractionPool = attractions.map((a) => toCandidate(a, 0));
  const activityPool = activities.map((a) => toCandidate(a, a.price));

  // The top-scored attractions define the area the trip gravitates around — used to place the hotel.
  const anchors = [...attractionPool].sort((a, b) => b.base - a.base).slice(0, 5);
  const centroid = anchors.length
    ? {
        lat: anchors.reduce((s, a) => s + a.lat, 0) / anchors.length,
        lng: anchors.reduce((s, a) => s + a.lng, 0) / anchors.length,
      }
    : null;

  // Hotel: budget share depends on the mood (resort-style trips spend more on the room),
  // then best mix of rating + proximity to the attraction cluster under the per-night cap.
  const nights = dayCount - 1;
  let hotel: HotelDocument | null = null;
  if (nights > 0 && hotels.length) {
    const hotelShare = mood === 'slow' ? 0.55 : mood === 'beach' ? 0.5 : mood === 'food' ? 0.4 : 0.45;
    const capPerNight = (budgetVND * hotelShare) / nights;
    const affordable = hotels.filter((h) => h.pricePerNight <= capPerNight);
    const pool = affordable.length
      ? affordable
      : [[...hotels].sort((a, b) => a.pricePerNight - b.pricePerNight)[0]];
    const hotelScore = (h: HotelDocument): number =>
      (h.rating / 5) * 2 + (centroid ? proximityBonus(distanceKm(h.lat, h.lng, centroid.lat, centroid.lng)) : 0);
    hotel = [...pool].sort((a, b) => hotelScore(b) - hotelScore(a) || a.pricePerNight - b.pricePerNight)[0];
  }
  const hotelCost = hotel ? hotel.pricePerNight * nights : 0;

  // Vehicle: families get a car, others a motorbike; up to ~20% of budget for the whole trip.
  const preferredType = travelers === 'family' ? 'car' : 'motorbike';
  let vehicle: VehicleDocument | null = null;
  if (vehicles.length) {
    const cap = budgetVND * 0.2;
    const preferred = vehicles.filter((v) => v.type === preferredType && v.pricePerDay * dayCount <= cap);
    const anyAffordable = vehicles.filter((v) => v.pricePerDay * dayCount <= cap);
    const pool = preferred.length
      ? preferred
      : anyAffordable.length
        ? anyAffordable
        : [[...vehicles].sort((a, b) => a.pricePerDay - b.pricePerDay)[0]];
    vehicle = [...pool].sort((a, b) => b.rating - a.rating || a.pricePerDay - b.pricePerDay)[0];
  }
  const vehicleCost = vehicle ? vehicle.pricePerDay * dayCount : 0;

  // Slot-by-slot selection: each pick maximizes base score + time-of-day fit + proximity to the
  // previous stop, so sunrise tours land in morning slots and each day stays geographically clustered.
  let remaining = budgetVND - hotelCost - vehicleCost;
  let activitiesSpent = 0;
  const usedIds = new Set<string>();

  // Avoid visiting the same place twice (e.g. a paid "Mỹ Sơn tour" activity plus the "Mỹ Sơn" attraction).
  const chosenNames: string[] = [];
  const isDuplicatePlace = (name: string): boolean => {
    const lower = name.toLowerCase();
    return chosenNames.some((n) => n.includes(lower) || lower.includes(n));
  };

  const timeFit = (time: string, c: Candidate): number => {
    const hour = Number(time.slice(0, 2));
    if (c.morning) return hour < 11 ? 0.8 : -1.2;
    if (c.evening) return hour >= 16 ? 0.8 : -1.2;
    return 0;
  };

  const pickBest = (pool: Candidate[], time: string, from: { lat: number; lng: number } | null): Candidate | null => {
    let best: Candidate | null = null;
    let bestScore = -Infinity;
    for (const c of pool) {
      if (usedIds.has(c.id) || isDuplicatePlace(c.name)) continue;
      const s = c.base + timeFit(time, c) + (from ? proximityBonus(distanceKm(from.lat, from.lng, c.lat, c.lng)) : 0);
      if (s > bestScore) {
        bestScore = s;
        best = c;
      }
    }
    return best;
  };

  const slots = PACE_SLOTS[pace] ?? PACE_SLOTS['balanced'];
  const daysOut: ItineraryDay[] = [];

  for (let d = 1; d <= dayCount; d++) {
    const entries: TimelineEntry[] = [];
    // Each day starts from the hotel (if any) and chains stops by distance.
    let from = hotel ? { lat: hotel.lat, lng: hotel.lng } : null;
    for (const slot of slots) {
      const affordableActivities = () => activityPool.filter((a) => a.price <= remaining);
      const pick =
        slot.kind === 'activity'
          ? (pickBest(affordableActivities(), slot.time, from) ?? pickBest(attractionPool, slot.time, from))
          : (pickBest(attractionPool, slot.time, from) ?? pickBest(affordableActivities(), slot.time, from));
      if (!pick) continue;
      usedIds.add(pick.id);
      chosenNames.push(pick.name.toLowerCase());
      remaining -= pick.price;
      activitiesSpent += pick.price;
      from = { lat: pick.lat, lng: pick.lng };
      entries.push({
        time: slot.time,
        attractionName: pick.name,
        description: truncate(pick.description),
        costVND: pick.price,
      });
    }

    const title =
      d === 1
        ? isVi
          ? 'Nhận xe, nhận phòng và những điểm đến đầu tiên'
          : 'Pick-up, check-in and first stops'
        : d === dayCount
          ? isVi
            ? 'Những điểm đến còn lại và mua quà'
            : 'Last stops and local gifts'
          : isVi
            ? 'Trải nghiệm nổi bật theo sở thích của bạn'
            : 'Highlights matched to your style';
    daysOut.push({ dayNumber: d, title, activities: entries });
  }

  // Day 1 logistics: vehicle pick-up first thing, hotel check-in at 13:30 (no slot uses that time), sorted into the timeline.
  if (vehicle) {
    daysOut[0].activities.push({
      time: '07:30',
      attractionName: isVi ? `Nhận xe: ${vehicle.name}` : `Vehicle pick-up: ${vehicle.name}`,
      description: `${vehicle.specs} — ${vehicle.pricePerDay.toLocaleString('vi-VN')}đ/${isVi ? 'ngày' : 'day'} × ${dayCount}`,
      costVND: vehicleCost,
    });
  }
  if (hotel) {
    daysOut[0].activities.push({
      time: '13:30',
      attractionName: isVi ? `Nhận phòng: ${hotel.name}` : `Check-in: ${hotel.name}`,
      description: truncate(hotel.description),
      costVND: hotelCost,
    });
  }
  daysOut[0].activities.sort((a, b) => a.time.localeCompare(b.time));

  const total = hotelCost + vehicleCost + activitiesSpent;
  const savingsPercent = clamp(Math.round(((budgetVND - total) / budgetVND) * 100), 0, 60);
  const provinceName = provinceDoc?.name ?? province;

  return {
    success: true,
    source: 'database_filter',
    data: {
      itineraryTitle: isVi
        ? `${provinceName}: hành trình ${dayCount} ngày trong ngân sách ${Math.round(budgetVND / 1000000 * 10) / 10} triệu`
        : `${provinceName}: ${dayCount}-day itinerary within your budget`,
      estimatedSavingsPercent: savingsPercent,
      totalCostEstimate: total,
      days: daysOut,
      savingTips: [
        isVi
          ? `Còn dư khoảng ${savingsPercent}% ngân sách — có thể nâng hạng phòng hoặc thêm một hoạt động.`
          : `About ${savingsPercent}% of your budget is left — upgrade the room or add one more experience.`,
        isVi
          ? 'Các điểm trong cùng ngày được gom theo cụm gần nhau và khớp khung giờ (tour bình minh buổi sáng, hoạt động hoàng hôn chiều tối) để đỡ di chuyển vòng lại.'
          : 'Stops are clustered by distance within each day and matched to the right time of day to cut backtracking.',
        vehicle?.type === 'car'
          ? isVi
            ? 'Ô tô riêng phù hợp gia đình — chia đều chi phí sẽ rẻ hơn đặt taxi từng chặng.'
            : 'A private car suits families — split evenly it beats booking taxis per ride.'
          : isVi
            ? 'Thuê xe máy theo ngày rẻ hơn nhiều so với gọi xe lẻ cho lịch trình nhiều điểm dừng.'
            : 'A daily motorbike rental is far cheaper than ride-hailing across many stops.',
      ],
    },
  };
}

export function getFallbackItinerary(province: string, budget: number, lang: string) {
  const isVi = lang === 'vi';
  const provinceLabel: Record<string, string> = {
    'quang-nam': isVi ? 'Hội An - Quảng Nam' : 'Hoi An - Quang Nam',
    'da-nang': isVi ? 'Đà Nẵng' : 'Da Nang',
    'thua-thien-hue': isVi ? 'Huế' : 'Hue',
    'binh-dinh': isVi ? 'Quy Nhơn - Bình Định' : 'Quy Nhon - Binh Dinh',
    'khanh-hoa': isVi ? 'Nha Trang - Khánh Hòa' : 'Nha Trang - Khanh Hoa',
  };
  const label = provinceLabel[province] ?? provinceLabel['quang-nam'];
  const total = Math.min(Number.isFinite(budget) ? budget : 3000000, province === 'da-nang' ? 3200000 : 2400000);

  return {
    itineraryTitle: isVi ? `Combo ${label} di sản và trải nghiệm địa phương (3N2Đ)` : `${label} heritage and local experience combo (3D2N)`,
    estimatedSavingsPercent: province === 'thua-thien-hue' ? 22 : 18,
    totalCostEstimate: total,
    days: [
      {
        dayNumber: 1,
        title: isVi ? 'Nhịp phố, ẩm thực và điểm biểu tượng' : 'City rhythm, food and landmark icons',
        activities: [
          {
            time: '09:00',
            attractionName: isVi ? 'Check-in điểm biểu tượng' : 'Landmark photo walk',
            description: isVi ? 'Dạo bộ qua khu trung tâm, ghi lại những khung hình đặc trưng nhất.' : 'Walk the central area and collect signature local frames.',
            costVND: 120000,
          },
          {
            time: '12:00',
            attractionName: isVi ? 'Bữa trưa đặc sản địa phương' : 'Local specialty lunch',
            description: isVi ? 'Thử món ăn nổi bật theo mùa, ưu tiên quán địa phương uy tín.' : 'Try seasonal specialties from trusted local spots.',
            costVND: 90000,
          },
          {
            time: '18:30',
            attractionName: isVi ? 'Trải nghiệm đêm' : 'Evening experience',
            description: isVi ? 'Tận hưởng phố đêm, âm nhạc hoặc chợ địa phương tùy điểm đến.' : 'Enjoy night streets, music or a local market depending on the destination.',
            costVND: 180000,
          },
        ],
      },
      {
        dayNumber: 2,
        title: isVi ? 'Thiên nhiên và trải nghiệm có hướng dẫn' : 'Nature and guided experience',
        activities: [
          {
            time: '08:00',
            attractionName: isVi ? 'Tour nửa ngày' : 'Half-day guided tour',
            description: isVi ? 'Ghép điểm đến thiên nhiên với câu chuyện văn hóa để tiết kiệm thời gian di chuyển.' : 'Pair nature stops with cultural context to reduce backtracking.',
            costVND: 650000,
          },
          {
            time: '15:30',
            attractionName: isVi ? 'Cà phê ngắm cảnh' : 'Scenic coffee stop',
            description: isVi ? 'Nghỉ nhịp tại điểm nhìn đẹp, phù hợp chụp ảnh và lên lịch ngày cuối.' : 'Pause at a scenic spot, ideal for photos and planning the final day.',
            costVND: 85000,
          },
        ],
      },
    ],
    savingTips: [
      isVi ? 'Đặt combo lưu trú và phương tiện cùng lúc để giảm chi phí taxi lẻ.' : 'Bundle stay and transport to avoid scattered taxi costs.',
      isVi ? 'Đi các điểm đông khách vào sáng sớm để mát hơn và ít phải chờ.' : 'Visit busy stops early for cooler weather and shorter queues.',
      isVi ? 'Giữ một buổi tối tự do cho ẩm thực địa phương và mua quà.' : 'Keep one evening free for local food and gifts.',
    ],
  };
}
