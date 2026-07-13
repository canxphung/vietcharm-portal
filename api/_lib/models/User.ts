import { Schema, model, models } from 'mongoose';
import { idTransform } from '../toJsonId';

export interface UserDocument {
  _id: string;
  username: string;
  password?: string;
  fullName: string;
  email: string;
  phone: string;
  bio: string;
  role: 'user' | 'admin';
  avatar: string;
  createdAt: string;
}

const userSchema = new Schema<UserDocument>(
  {
    _id: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String },
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    bio: { type: String, required: true, default: '' },
    role: { type: String, required: true, enum: ['user', 'admin'], default: 'user' },
    avatar: { type: String, required: true },
    createdAt: { type: String, required: true },
  },
  { versionKey: false, toJSON: { transform: idTransform } },
);

export const UserModel = models['User'] || model<UserDocument>('User', userSchema);
