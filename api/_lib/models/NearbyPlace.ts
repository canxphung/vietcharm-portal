import { Schema, model, models } from 'mongoose';
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

const nearbyPlaceSchema = new Schema(
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

export const NearbyPlaceModel = models['NearbyPlace'] || model('NearbyPlace', nearbyPlaceSchema);
