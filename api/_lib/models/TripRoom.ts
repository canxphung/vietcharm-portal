import { Schema, model, models } from 'mongoose';
import { idTransform } from '../toJsonId';

export interface TripRoomMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  budget: number;
  availability: string; // free text: when this member can travel
  preferences: string[];
  dislikes: string;
  status: 'paid' | 'unpaid';
}

export interface TripRoomVoteItem {
  id: string;
  nameVi: string;
  nameEn: string;
  type: 'hotel' | 'activity' | 'restaurant';
  image: string;
  votes: string[];
  price: number;
  rating: number;
  locationVi: string;
  locationEn: string;
}

export interface TripRoomDocument {
  _id: string; // room id, e.g. VC-X7K2F9
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  maxMembers: number;
  inviteCode: string;
  ownerEmail: string;
  members: TripRoomMember[];
  votingItems: TripRoomVoteItem[];
  active: boolean;
  createdAt: string;
}

const memberSchema = new Schema<TripRoomMember>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, default: '' },
    avatar: { type: String, default: '' },
    budget: { type: Number, default: 0 },
    availability: { type: String, default: '' },
    preferences: { type: [String], default: [] },
    dislikes: { type: String, default: '' },
    status: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid' },
  },
  { _id: false },
);

const voteItemSchema = new Schema<TripRoomVoteItem>(
  {
    id: { type: String, required: true },
    nameVi: { type: String, required: true },
    nameEn: { type: String, required: true },
    type: { type: String, required: true, enum: ['hotel', 'activity', 'restaurant'] },
    image: { type: String, default: '' },
    votes: { type: [String], default: [] },
    price: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    locationVi: { type: String, default: '' },
    locationEn: { type: String, default: '' },
  },
  { _id: false },
);

const tripRoomSchema = new Schema<TripRoomDocument>(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    startDate: { type: String, default: '' },
    endDate: { type: String, default: '' },
    maxMembers: { type: Number, default: 4 },
    inviteCode: { type: String, required: true, index: true },
    ownerEmail: { type: String, required: true, index: true },
    members: { type: [memberSchema], default: [] },
    votingItems: { type: [voteItemSchema], default: [] },
    active: { type: Boolean, required: true, default: true },
    createdAt: { type: String, required: true },
  },
  { versionKey: false, toJSON: { transform: idTransform } },
);

export const TripRoomModel = models['TripRoom'] || model<TripRoomDocument>('TripRoom', tripRoomSchema);
