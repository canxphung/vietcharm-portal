import { Schema, model, models } from 'mongoose';
import { idTransform } from '../toJsonId';

export interface VehicleDocument {
  _id: string;
  name: string;
  type: 'motorbike' | 'car';
  pricePerDay: number;
  discountPercent: number;
  image: string;
  gallery: string[];
  specs: string;
  rating: number;
  rentalPackages: Array<{
    key: 'standard' | 'premium' | 'luxury';
    priceModifier: number;
    nameVi: string;
    nameEn: string;
    descriptionVi: string;
    descriptionEn: string;
  }>;
}

const rentalPackageSchema = new Schema(
  {
    key: { type: String, required: true, enum: ['standard', 'premium', 'luxury'] },
    priceModifier: { type: Number, required: true, min: 1 },
    nameVi: { type: String, required: true },
    nameEn: { type: String, required: true },
    descriptionVi: { type: String, required: true },
    descriptionEn: { type: String, required: true },
  },
  { _id: false },
);

const vehicleSchema = new Schema<VehicleDocument>(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true, enum: ['motorbike', 'car'] },
    pricePerDay: { type: Number, required: true },
    discountPercent: { type: Number, min: 0, max: 90, default: 0 },
    image: { type: String, required: true },
    gallery: { type: [String], default: [] },
    specs: { type: String, required: true },
    rating: { type: Number, required: true },
    rentalPackages: { type: [rentalPackageSchema], default: [] },
  },
  { versionKey: false, toJSON: { transform: idTransform } },
);

export const VehicleModel = models['Vehicle'] || model<VehicleDocument>('Vehicle', vehicleSchema);
