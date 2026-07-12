import { Schema, model, models } from 'mongoose';
import { idTransform } from '../toJsonId';

export interface BookingCartItemDocument {
  cartKey?: string;
  id: string;
  type: 'hotel' | 'activity' | 'vehicle';
  name: string;
  price: number;
  quantity: number;
  image: string;
  details?: string;
  serviceDate?: string;
  packageKey?: 'standard' | 'premium' | 'luxury';
  basePrice?: number;
  receivedConfirmed?: boolean;
}

export interface SystemBookingDocument {
  _id: string;
  userEmail: string;
  userName: string;
  items: BookingCartItemDocument[];
  total: number;
  discountApplied: number;
  finalTotal: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  date: string;
}

const bookingItemSchema = new Schema<BookingCartItemDocument>(
  {
    cartKey: { type: String },
    id: { type: String, required: true },
    type: { type: String, required: true, enum: ['hotel', 'activity', 'vehicle'] },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    image: { type: String, default: '' },
    details: { type: String },
    serviceDate: { type: String },
    packageKey: { type: String, enum: ['standard', 'premium', 'luxury'] },
    basePrice: { type: Number },
    receivedConfirmed: { type: Boolean },
  },
  { _id: false },
);

const systemBookingSchema = new Schema<SystemBookingDocument>(
  {
    _id: { type: String, required: true },
    userEmail: { type: String, required: true, index: true },
    userName: { type: String, required: true },
    items: { type: [bookingItemSchema], required: true },
    total: { type: Number, required: true },
    discountApplied: { type: Number, required: true },
    finalTotal: { type: Number, required: true },
    status: { type: String, required: true, enum: ['pending', 'confirmed', 'cancelled'] },
    date: { type: String, required: true },
  },
  { versionKey: false, toJSON: { transform: idTransform } },
);

export const SystemBookingModel =
  models['SystemBooking'] || model<SystemBookingDocument>('SystemBooking', systemBookingSchema);
