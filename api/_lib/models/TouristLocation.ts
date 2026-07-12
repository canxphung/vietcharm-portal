import { Schema, model, models } from 'mongoose';
import { idTransform } from '../toJsonId';

export interface TouristLocationDocument {
  _id: string;
  name: string;
  lat: number;
  lng: number;
}

const touristLocationSchema = new Schema<TouristLocationDocument>(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  { versionKey: false, toJSON: { transform: idTransform } },
);

export const TouristLocationModel =
  models['TouristLocation'] || model<TouristLocationDocument>('TouristLocation', touristLocationSchema);
