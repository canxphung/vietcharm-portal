import { Schema, model, models } from 'mongoose';

export interface PromoVoucherDocument {
  _id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minSpend: number;
  active: boolean;
}

/** Vouchers key off `code`, not `id` — strip Mongo internals but don't rename `_id`. */
function voucherTransform(_doc: unknown, ret: Record<string, unknown>): Record<string, unknown> {
  delete ret['_id'];
  delete ret['__v'];
  return ret;
}

const promoVoucherSchema = new Schema<PromoVoucherDocument>(
  {
    _id: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    discountType: { type: String, required: true, enum: ['percentage', 'fixed'] },
    value: { type: Number, required: true },
    minSpend: { type: Number, required: true },
    active: { type: Boolean, required: true, default: true },
  },
  { versionKey: false, toJSON: { transform: voucherTransform } },
);

export const PromoVoucherModel =
  models['PromoVoucher'] || model<PromoVoucherDocument>('PromoVoucher', promoVoucherSchema);
