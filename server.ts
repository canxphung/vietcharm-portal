import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createItinerary, getFallbackItinerary } from './api/_lib/itinerary';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 4301);

app.use(express.json({ limit: '1mb' }));

app.post('/api/ai/itinerary', async (req, res) => {
  const { prompt, province = 'quang-nam', budget = 3000000, language = 'vi' } = req.body ?? {};

  try {
    return res.json(await createItinerary({ prompt, province, budget, language }));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server Internal Error';
    return res.status(500).json({
      success: false,
      message,
      fallback: getFallbackItinerary(province, Number(budget), language),
    });
  }
});

const distPath = path.join(process.cwd(), 'dist', 'vietcharm-angular', 'browser');
app.use(express.static(distPath));
app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`VietCharm server running on http://localhost:${PORT}`);
});
