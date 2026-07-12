import { Schema, model, models } from 'mongoose';
import { idTransform } from '../toJsonId';

export interface VehicleDocument {
  _id: string;
  name: string;
  type: 'motorbike' | 'car';
  pricePerDay: number;
  image: string;
  specs: string;
  rating: number;
}

const vehicleSchema = new Schema<VehicleDocument>(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true, enum: ['motorbike', 'car'] },
    pricePerDay: { type: Number, required: true },
    image: { type: String, required: true },
    specs: { type: String, required: true },
    rating: { type: Number, required: true },
  },
  { versionKey: false, toJSON: { transform: idTransform } },
);

export const VehicleModel = models['Vehicle'] || model<VehicleDocument>('Vehicle', vehicleSchema);
