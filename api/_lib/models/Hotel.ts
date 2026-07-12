import { Schema, model, models } from 'mongoose';
import { idTransform } from '../toJsonId';

export interface HotelDocument {
  _id: string;
  provinceId: string;
  name: string;
  image: string;
  rating: number;
  reviewsCount: string;
  pricePerNight: number;
  description: string;
  lat: number;
  lng: number;
}

const hotelSchema = new Schema<HotelDocument>(
  {
    _id: { type: String, required: true },
    provinceId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    rating: { type: Number, required: true },
    reviewsCount: { type: String, required: true },
    pricePerNight: { type: Number, required: true },
    description: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  { versionKey: false, toJSON: { transform: idTransform } },
);

export const HotelModel = models['Hotel'] || model<HotelDocument>('Hotel', hotelSchema);
