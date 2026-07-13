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
import touristLocationsRouter from './routes/touristLocations';
import tourCombosRouter from './routes/tourCombos';
import usersRouter from './routes/users';
import bookingsRouter from './routes/bookings';
import vouchersRouter from './routes/vouchers';
import partnershipsRouter from './routes/partnerships';
import serviceReviewsRouter from './routes/serviceReviews';
import complaintsRouter from './routes/complaints';

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
app.use('/api/tourist-locations', touristLocationsRouter);
app.use('/api/tour-combos', tourCombosRouter);
app.use('/api/users', usersRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/vouchers', vouchersRouter);
app.use('/api/partnerships', partnershipsRouter);
app.use('/api/service-reviews', serviceReviewsRouter);
app.use('/api/complaints', complaintsRouter);

app.post('/api/itinerary', async (req, res) => {
  const { province = 'quang-nam', budget = 3000000, language = 'vi' } = req.body ?? {};

  try {
    return res.json(await createItinerary(req.body ?? {}));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server Internal Error';
    return res.status(500).json({
      success: false,
      message,
      fallback: getFallbackItinerary(province, Number(budget), language),
    });
  }
});
