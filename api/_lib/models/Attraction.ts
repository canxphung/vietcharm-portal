import { Schema, model, models } from 'mongoose';
import { idTransform } from '../toJsonId';

export interface AttractionDocument {
  _id: string;
  provinceId: string;
  name: string;
  image: string;
  description: string;
  rating: number;
  reviewsCount: string;
  lat: number;
  lng: number;
}

const attractionSchema = new Schema<AttractionDocument>(
  {
    _id: { type: String, required: true },
    provinceId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    description: { type: String, required: true },
    rating: { type: Number, required: true },
    reviewsCount: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  { versionKey: false, toJSON: { transform: idTransform } },
);

export const AttractionModel = models['Attraction'] || model<AttractionDocument>('Attraction', attractionSchema);
