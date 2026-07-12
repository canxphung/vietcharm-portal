import { Schema, model, models } from 'mongoose';
import { idTransform } from '../toJsonId';

export interface ReviewDocument {
  _id: string;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
  locale: 'vi' | 'en';
}

const reviewSchema = new Schema<ReviewDocument>(
  {
    _id: { type: String, required: true },
    author: { type: String, required: true },
    avatar: { type: String, required: true },
    rating: { type: Number, required: true },
    date: { type: String, required: true },
    comment: { type: String, required: true },
    locale: { type: String, required: true, enum: ['vi', 'en'] },
  },
  { versionKey: false, toJSON: { transform: idTransform } },
);

export const ReviewModel = models['Review'] || model<ReviewDocument>('Review', reviewSchema);
