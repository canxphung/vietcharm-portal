import { Schema, model, models } from 'mongoose';
import { idTransform } from '../toJsonId';

const supportSectionSchema = new Schema(
  {
    headingVi: { type: String, required: true },
    headingEn: { type: String, required: true },
    bodyVi: { type: String, required: true },
    bodyEn: { type: String, required: true },
  },
  { _id: false },
);

const supportFaqSchema = new Schema(
  {
    qVi: { type: String, required: true },
    qEn: { type: String, required: true },
    aVi: { type: String, required: true },
    aEn: { type: String, required: true },
  },
  { _id: false },
);

const supportPageSchema = new Schema(
  {
    _id: { type: String, required: true },
    order: { type: Number, required: true, min: 0 },
    group: { type: String, required: true, enum: ['support', 'about'] },
    groupVi: { type: String, required: true },
    groupEn: { type: String, required: true },
    titleVi: { type: String, required: true },
    titleEn: { type: String, required: true },
    introVi: { type: String, required: true },
    introEn: { type: String, required: true },
    sections: { type: [supportSectionSchema], default: [] },
    faqs: { type: [supportFaqSchema], default: [] },
  },
  {
    collection: 'support_pages',
    versionKey: false,
    toJSON: { transform: idTransform },
  },
);

export const SupportPageModel = models['SupportPage'] || model('SupportPage', supportPageSchema);
