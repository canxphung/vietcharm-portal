import { Schema, model, models } from 'mongoose';
import { idTransform } from '../toJsonId';

export interface ServiceReviewDocument {
  _id: string;
  itemId: string;
  itemName: string;
  itemImage?: string;
  userEmail: string;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
}

const serviceReviewSchema = new Schema<ServiceReviewDocument>(
  {
    _id: { type: String, required: true },
    itemId: { type: String, required: true, index: true },
    itemName: { type: String, required: true },
    itemImage: { type: String },
    userEmail: { type: String, required: true, index: true },
    author: { type: String, required: true },
    avatar: { type: String, required: true },
    rating: { type: Number, required: true },
    date: { type: String, required: true },
    comment: { type: String, required: true },
  },
  { versionKey: false, toJSON: { transform: idTransform } },
);

export const ServiceReviewModel =
  models['ServiceReview'] || model<ServiceReviewDocument>('ServiceReview', serviceReviewSchema);
