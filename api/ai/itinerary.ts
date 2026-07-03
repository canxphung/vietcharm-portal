import { createItinerary, getFallbackItinerary } from '../_lib/itinerary';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { prompt, province = 'quang-nam', budget = 3000000, language = 'vi' } = req.body ?? {};

  try {
    return res.status(200).json(await createItinerary({ prompt, province, budget, language }));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server Internal Error';
    return res.status(500).json({
      success: false,
      message,
      fallback: getFallbackItinerary(province, Number(budget), language),
    });
  }
}
