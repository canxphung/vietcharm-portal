import { Schema, model, models } from 'mongoose';
import { idTransform } from '../toJsonId';

export interface ProvinceDocument {
  _id: string;
  name: string;
  image: string;
  description: string;
  active: boolean;
  tagline: string;
}

const provinceSchema = new Schema<ProvinceDocument>(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    description: { type: String, required: true },
    active: { type: Boolean, required: true, default: false },
    tagline: { type: String, required: true },
  },
  { versionKey: false, toJSON: { transform: idTransform } },
);

export const ProvinceModel = models['Province'] || model<ProvinceDocument>('Province', provinceSchema);
