import { Schema, model, models, type Model } from 'mongoose';
import { idTransform } from '../toJsonId';

const nearbyReviewSchema = new Schema(
  {
    id: { type: String, required: true },
    author: { type: String, required: true },
    avatar: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    date: { type: String, required: true },
    comment: { type: String, required: true },
  },
  { _id: false },
);

export interface NearbyPlaceDocument {
  _id: string;
  order: number;
  nameVi: string;
  nameEn: string;
  categoryVi: string;
  categoryEn: string;
  descriptionVi: string;
  descriptionEn: string;
  distance: string;
  duration: string;
  coordinates: { x: number; y: number };
  images: string[];
  reviews: Array<{
    id: string;
    author: string;
    avatar: string;
    rating: number;
    date: string;
    comment: string;
  }>;
  rating: number;
  totalReviews: number;
  historyVi: string;
  historyEn: string;
}

const nearbyPlaceSchema = new Schema<NearbyPlaceDocument>(
  {
    _id: { type: String, required: true },
    order: { type: Number, required: true, min: 0 },
    nameVi: { type: String, required: true },
    nameEn: { type: String, required: true },
    categoryVi: { type: String, required: true },
    categoryEn: { type: String, required: true },
    descriptionVi: { type: String, required: true },
    descriptionEn: { type: String, required: true },
    distance: { type: String, required: true },
    duration: { type: String, required: true },
    coordinates: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
    },
    images: { type: [String], required: true },
    reviews: { type: [nearbyReviewSchema], default: [] },
    rating: { type: Number, required: true, min: 0, max: 5 },
    totalReviews: { type: Number, required: true, min: 0 },
    historyVi: { type: String, required: true },
    historyEn: { type: String, required: true },
  },
  {
    collection: 'nearby_places',
    versionKey: false,
    toJSON: { transform: idTransform },
  },
);

export const NearbyPlaceModel: Model<NearbyPlaceDocument> =
  (models['NearbyPlace'] as Model<NearbyPlaceDocument> | undefined) ||
  model<NearbyPlaceDocument>('NearbyPlace', nearbyPlaceSchema);
