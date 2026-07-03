/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { vi } from './vi';
import { en } from './en';

/** The shape of a translation dictionary (derived from the Vietnamese source of truth). */
export type Dictionary = typeof vi;

export const dictionaries: Record<'vi' | 'en', Dictionary> = { vi, en };

export { vi, en };
