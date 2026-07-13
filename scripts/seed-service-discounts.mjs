/**
 * Persist stable service discounts in MongoDB.
 *
 * Run: pnpm run seed:service-discounts
 * The assignment is deterministic and idempotent: the same service id always
 * receives the same discount and rerunning does not create new documents.
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vietcharm';
const collections = ['hotels', 'activities', 'vehicles', 'attractions'];
const discountSteps = [10, 15, 20, 25, 30, 0];

function discountFor(id) {
  let hash = 0;
  for (const char of String(id)) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return discountSteps[Math.abs(hash) % discountSteps.length];
}

await mongoose.connect(uri);

for (const collectionName of collections) {
  const collection = mongoose.connection.db.collection(collectionName);
  const services = await collection.find({}, { projection: { _id: 1 } }).toArray();
  if (services.length === 0) {
    console.log(`${collectionName}: no records found`);
    continue;
  }

  await collection.bulkWrite(
    services.map((service) => ({
      updateOne: {
        filter: { _id: service._id },
        update: { $set: { discountPercent: discountFor(service._id) } },
      },
    })),
  );

  const discountedCount = await collection.countDocuments({ discountPercent: { $gt: 0 } });
  console.log(`${collectionName}: ${discountedCount}/${services.length} discounted`);
}

await mongoose.disconnect();
