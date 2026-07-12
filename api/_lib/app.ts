import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { createItinerary, getFallbackItinerary } from './itinerary';
import provincesRouter from './routes/provinces';
import attractionsRouter from './routes/attractions';
import hotelsRouter from './routes/hotels';
import activitiesRouter from './routes/activities';
import vehiclesRouter from './routes/vehicles';
import reviewsRouter from './routes/reviews';

/** Shared Express app mounted by both `server.ts` (standalone) and `api/[...catchall].ts` (Vercel). */
export const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));

app.use('/api/provinces', provincesRouter);
app.use('/api/attractions', attractionsRouter);
app.use('/api/hotels', hotelsRouter);
app.use('/api/activities', activitiesRouter);
app.use('/api/vehicles', vehiclesRouter);
app.use('/api/reviews', reviewsRouter);

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
