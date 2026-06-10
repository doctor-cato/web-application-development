/**
 * movieService.js — small helper for price formatting
 */

import { lsGet, lsSet } from './storage.js';

export function formatPrice(amount) {
  if (typeof amount !== 'number') amount = Number(amount) || 0;
  return amount.toLocaleString('vi-VN') + ' đ';
}
