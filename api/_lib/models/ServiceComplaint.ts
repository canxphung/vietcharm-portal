import { Schema, model, models } from 'mongoose';
import { idTransform } from '../toJsonId';

export interface ServiceComplaintDocument {
  _id: string;
  bookingId: string;
  itemId: string;
  itemName: string;
  userEmail: string;
  userName: string;
  reason: string;
  message: string;
  status: 'pending' | 'reviewing' | 'resolved';
  date: string;
}

const serviceComplaintSchema = new Schema<ServiceComplaintDocument>(
  {
    _id: { type: String, required: true },
    bookingId: { type: String, required: true },
    itemId: { type: String, required: true },
    itemName: { type: String, required: true },
    userEmail: { type: String, required: true, index: true },
    userName: { type: String, required: true },
    reason: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, required: true, enum: ['pending', 'reviewing', 'resolved'], default: 'pending' },
    date: { type: String, required: true },
  },
  { versionKey: false, toJSON: { transform: idTransform } },
);

export const ServiceComplaintModel =
  models['ServiceComplaint'] || model<ServiceComplaintDocument>('ServiceComplaint', serviceComplaintSchema);
