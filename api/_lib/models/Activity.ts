import { Schema, model, models } from 'mongoose';
import { idTransform } from '../toJsonId';

export interface ActivityDocument {
  _id: string;
  provinceId: string;
  name: string;
  image: string;
  price: number;
  discountPercent: number;
  description: string;
  rating: number;
  reviewsCount: string;
  lat: number;
  lng: number;
}

const activitySchema = new Schema<ActivityDocument>(
  {
    _id: { type: String, required: true },
    provinceId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    discountPercent: { type: Number, min: 0, max: 90, default: 0 },
    description: { type: String, required: true },
    rating: { type: Number, required: true },
    reviewsCount: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  { versionKey: false, toJSON: { transform: idTransform } },
);

export const ActivityModel = models['Activity'] || model<ActivityDocument>('Activity', activitySchema);
