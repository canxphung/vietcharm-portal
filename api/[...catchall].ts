import { app } from './_lib/app';
import { connectDB } from './_lib/db';

export default async function handler(req: any, res: any) {
  await connectDB();
  return (app as unknown as (req: any, res: any) => void)(req, res);
}
