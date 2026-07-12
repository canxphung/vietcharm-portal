import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../api/_lib/db';
import { ProvinceModel } from '../api/_lib/models/Province';
import { AttractionModel } from '../api/_lib/models/Attraction';
import { HotelModel } from '../api/_lib/models/Hotel';
import { ActivityModel } from '../api/_lib/models/Activity';
import { VehicleModel } from '../api/_lib/models/Vehicle';
import { ReviewModel } from '../api/_lib/models/Review';
import { provinces } from '../src/app/data/provinces';
import { attractionsByProvince } from '../src/app/data/attractions';
import { hotelsByProvince } from '../src/app/data/hotels';
import { activitiesByProvince } from '../src/app/data/activities';
import { vehicles } from '../src/app/data/vehicles';
import { reviews } from '../src/app/data/reviews';

function flatten<T extends { id: string }>(byProvince: Record<string, T[]>): Array<T & { provinceId: string }> {
  return Object.entries(byProvince).flatMap(([provinceId, items]) => items.map((item) => ({ ...item, provinceId })));
}

async function upsertMany(model: mongoose.Model<any>, docs: Array<{ id: string; [key: string]: unknown }>) {
  if (docs.length === 0) return;
  await model.bulkWrite(
    docs.map(({ id, ...rest }) => ({
      updateOne: { filter: { _id: id }, update: { $set: { _id: id, ...rest } }, upsert: true },
    })),
  );
}

async function main() {
  await connectDB();

  await upsertMany(ProvinceModel, provinces);
  await upsertMany(AttractionModel, flatten(attractionsByProvince));
  await upsertMany(HotelModel, flatten(hotelsByProvince));
  await upsertMany(ActivityModel, flatten(activitiesByProvince));
  await upsertMany(VehicleModel, vehicles);
  await upsertMany(ReviewModel, reviews);

  console.log('Seed complete:', {
    provinces: provinces.length,
    attractions: Object.values(attractionsByProvince).flat().length,
    hotels: Object.values(hotelsByProvince).flat().length,
    activities: Object.values(activitiesByProvince).flat().length,
    vehicles: vehicles.length,
    reviews: reviews.length,
  });

  await mongoose.disconnect();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  });
