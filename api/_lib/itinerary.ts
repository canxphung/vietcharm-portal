import { GoogleGenAI, Type } from '@google/genai';

export interface ItineraryParams {
  prompt?: string;
  province?: string;
  budget?: number;
  language?: string;
}

export async function createItinerary({
  prompt,
  province = 'quang-nam',
  budget = 3000000,
  language = 'vi',
}: ItineraryParams) {
  const apiKey = process.env.GEMINI_API_KEY || '';
  const hasApiKey = Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY');

  if (!hasApiKey) {
    return {
      success: true,
      source: 'local_optimized',
      data: getFallbackItinerary(province, Number(budget), language),
    };
  }

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-3.5-flash',
    contents: `
      Generate a realistic Central Vietnam itinerary.
      Province/city: ${province}
      Budget limit VND: ${budget}
      Travel vibe: ${prompt || 'balanced heritage, food and comfort'}
      Language: ${language === 'vi' ? 'Vietnamese' : 'English'}
    `,
    config: {
      systemInstruction:
        'You are a premium Central Vietnam travel concierge. Return strictly valid JSON only.',
      temperature: 0.2,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        required: ['itineraryTitle', 'estimatedSavingsPercent', 'totalCostEstimate', 'days', 'savingTips'],
        properties: {
          itineraryTitle: { type: Type.STRING },
          estimatedSavingsPercent: { type: Type.INTEGER },
          totalCostEstimate: { type: Type.INTEGER },
          days: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              required: ['dayNumber', 'title', 'activities'],
              properties: {
                dayNumber: { type: Type.INTEGER },
                title: { type: Type.STRING },
                activities: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    required: ['time', 'attractionName', 'description', 'costVND'],
                    properties: {
                      time: { type: Type.STRING },
                      attractionName: { type: Type.STRING },
                      description: { type: Type.STRING },
                      costVND: { type: Type.INTEGER },
                    },
                  },
                },
              },
            },
          },
          savingTips: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
      },
    },
  });

  const parsed = JSON.parse((response.text || '').trim());
  return { success: true, source: 'gemini_optimizer', data: parsed };
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
