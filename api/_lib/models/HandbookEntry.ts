import { Schema, model, models } from 'mongoose';
import { idTransform } from '../toJsonId';

export interface HandbookEntryDocument {
  _id: string;
  order: number;
  labelVi: string;
  labelEn: string;
  titleVi: string;
  titleEn: string;
  image: string;
  paragraphsVi: string[];
  paragraphsEn: string[];
}

const handbookEntrySchema = new Schema<HandbookEntryDocument>(
  {
    _id: { type: String, required: true },
    order: { type: Number, required: true, min: 0 },
    labelVi: { type: String, required: true },
    labelEn: { type: String, required: true },
    titleVi: { type: String, required: true },
    titleEn: { type: String, required: true },
    image: { type: String, required: true },
    paragraphsVi: { type: [String], required: true },
    paragraphsEn: { type: [String], required: true },
  },
  {
    collection: 'handbook_entries',
    versionKey: false,
    toJSON: { transform: idTransform },
  },
);

export const HandbookEntryModel =
  models['HandbookEntry'] || model<HandbookEntryDocument>('HandbookEntry', handbookEntrySchema);
