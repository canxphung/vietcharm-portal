import type { ViewableItem } from '@/types';

export function hotDealSalePrice(price: number, discount: number): number {
  return Math.round((price * (100 - discount)) / 100 / 1000) * 1000;
}

/** Applies the discount persisted with the catalog record to the display price. */
export function withDiscountPricing(item: ViewableItem): ViewableItem {
  const discountPercent = Math.max(0, Math.min(90, item.discountPercent ?? 0));
  if (discountPercent === 0) return item;
  const originalPrice = item.originalPrice ?? item.price;
  return {
    ...item,
    originalPrice,
    price: hotDealSalePrice(originalPrice, discountPercent),
    discountPercent,
  };
}
