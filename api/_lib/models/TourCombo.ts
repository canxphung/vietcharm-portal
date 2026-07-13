import { Schema, model, models } from 'mongoose';
import { idTransform } from '../toJsonId';

export interface TourComboDocument {
  _id: string;
  name: string;
  image: string;
  days: string;
  price: number;
  oldPrice: number;
  includes: string[];
  rating: number;
  tag: string;
}

const tourComboSchema = new Schema<TourComboDocument>(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    days: { type: String, required: true },
    price: { type: Number, required: true },
    oldPrice: { type: Number, required: true },
    includes: { type: [String], required: true },
    rating: { type: Number, required: true },
    tag: { type: String, required: true },
  },
  { versionKey: false, toJSON: { transform: idTransform } },
);

export const TourComboModel = models['TourCombo'] || model<TourComboDocument>('TourCombo', tourComboSchema);
