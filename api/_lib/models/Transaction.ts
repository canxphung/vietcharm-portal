import { Schema, model, models } from 'mongoose';
import { idTransform } from '../toJsonId';

/** Payment attempt record (ERD "GiaoDich"): one row per gateway call, success or failure. */
export interface TransactionDocument {
  _id: string;
  bookingId: string; // empty when the attempt failed before an order was created
  code: string;
  method: 'visa' | 'vnpay' | 'momo';
  status: 'success' | 'failed';
  amount: number;
  userEmail: string;
  date: string;
}

const transactionSchema = new Schema<TransactionDocument>(
  {
    _id: { type: String, required: true },
    bookingId: { type: String, default: '', index: true },
    code: { type: String, required: true },
    method: { type: String, required: true, enum: ['visa', 'vnpay', 'momo'] },
    status: { type: String, required: true, enum: ['success', 'failed'] },
    amount: { type: Number, required: true, min: 0 },
    userEmail: { type: String, default: '' },
    date: { type: String, required: true },
  },
  { versionKey: false, toJSON: { transform: idTransform } },
);

export const TransactionModel =
  models['Transaction'] || model<TransactionDocument>('Transaction', transactionSchema);
