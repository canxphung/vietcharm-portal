import { Schema, model, models } from 'mongoose';
import { idTransform } from '../toJsonId';

export interface PartnershipApplicationDocument {
  _id: string;
  brandName: string;
  contactName: string;
  type: 'hotel' | 'taxi' | 'experience' | 'artisan' | 'guide' | 'vehicle';
  phone: string;
  email: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
}

const partnershipApplicationSchema = new Schema<PartnershipApplicationDocument>(
  {
    _id: { type: String, required: true },
    brandName: { type: String, required: true },
    contactName: { type: String, required: true },
    type: { type: String, required: true, enum: ['hotel', 'taxi', 'experience', 'artisan', 'guide', 'vehicle'] },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, required: true, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    date: { type: String, required: true },
  },
  { versionKey: false, toJSON: { transform: idTransform } },
);

export const PartnershipApplicationModel =
  models['PartnershipApplication'] ||
  model<PartnershipApplicationDocument>('PartnershipApplication', partnershipApplicationSchema);
