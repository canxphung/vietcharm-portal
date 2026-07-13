/* eslint-disable @typescript-eslint/no-explicit-any */
/** Mongoose documents use `_id`; every frontend type in `src/app/types/domain.ts` uses `id`. */
export function idTransform(_doc: any, ret: any): any {
  ret.id = ret._id;
  delete ret._id;
  delete ret.__v;
  return ret;
}
