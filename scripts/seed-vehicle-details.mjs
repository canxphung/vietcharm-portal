/** Persist vehicle-specific galleries and rental packages in MongoDB. */
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vietcharm';

const galleries = {
  motorbike: [
    'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1524591652733-73fa1ae7b5ee?auto=format&fit=crop&w=900&q=80',
  ],
  car: [
    'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80',
  ],
};

const commonProtectionPackage = {
  key: 'luxury',
  priceModifier: 1.6,
  nameVi: 'Gói An Tâm Toàn Diện',
  nameEn: 'Complete Protection',
  descriptionVi: 'Bảo vệ thiệt hại mở rộng, giảm mức cọc, cứu hộ 24/7 và ưu tiên đổi xe khi có sự cố.',
  descriptionEn: 'Extended damage cover, reduced deposit, 24/7 roadside assistance, and priority replacement vehicle.',
};

const packages = {
  motorbike: [
    {
      key: 'standard', priceModifier: 1,
      nameVi: 'Gói Tự Lái Tiêu Chuẩn', nameEn: 'Standard Self-drive',
      descriptionVi: 'Xe đã kiểm tra, 2 mũ bảo hiểm, áo mưa, khóa chống trộm và bảo hiểm bắt buộc.',
      descriptionEn: 'Inspected bike, 2 helmets, raincoats, anti-theft lock, and compulsory insurance.',
    },
    {
      key: 'premium', priceModifier: 1.3,
      nameVi: 'Gói Giao Nhận Tận Nơi', nameEn: 'Door-to-door Delivery',
      descriptionVi: 'Giao và nhận xe trong Hội An, kèm giá đỡ điện thoại và hỗ trợ cứu hộ ưu tiên.',
      descriptionEn: 'Hoi An delivery and collection, phone holder, and priority roadside support.',
    },
    commonProtectionPackage,
  ],
  car: [
    {
      key: 'standard', priceModifier: 1,
      nameVi: 'Gói Tự Lái Tiêu Chuẩn', nameEn: 'Standard Self-drive',
      descriptionVi: 'Xe đã kiểm tra kỹ thuật, bảo hiểm bắt buộc và định mức 200 km/ngày.',
      descriptionEn: 'Fully inspected car, compulsory insurance, and 200 km/day allowance.',
    },
    {
      key: 'premium', priceModifier: 1.3,
      nameVi: 'Gói Giao Nhận Tận Nơi', nameEn: 'Door-to-door Delivery',
      descriptionVi: 'Giao và nhận xe tận nơi trong Hội An, thêm tài xế phụ và ghế trẻ em theo yêu cầu.',
      descriptionEn: 'Hoi An door-to-door delivery, an additional driver, and a child seat on request.',
    },
    commonProtectionPackage,
  ],
};

await mongoose.connect(uri);
const collection = mongoose.connection.db.collection('vehicles');
const vehicles = await collection.find({}, { projection: { _id: 1, type: 1 } }).toArray();

if (vehicles.length) {
  await collection.bulkWrite(vehicles.map((vehicle) => {
    const type = vehicle.type === 'car' ? 'car' : 'motorbike';
    return {
      updateOne: {
        filter: { _id: vehicle._id },
        update: { $set: { gallery: galleries[type], rentalPackages: packages[type] } },
      },
    };
  }));
}

const updated = await collection.countDocuments({ gallery: { $exists: true, $ne: [] }, rentalPackages: { $size: 3 } });
console.log(`vehicles: ${updated}/${vehicles.length} updated with gallery and rental packages`);
await mongoose.disconnect();
