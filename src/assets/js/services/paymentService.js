/**
 * paymentService.js — lightweight simulated payment flow
 */

import { lsGet, lsSet, getPendingPayments, savePendingPayments, saveLastBooking } from './storage.js';
import { confirmBooking } from './bookingService.js';

function formatTransactionId() {
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `TX${t}${r}`;
}

export function buildQrString(booking) {
  if (!booking) return '';
  const seats = (booking.seats || []).join('_') || 'NONE';
  const combo = booking.combo || 'NONE';
  const showId = booking.showtimeId || 'unknown';
  return `TICKET_${booking.id}_SEATS_${seats}_SHOW_${showId}_COMBO_${combo}`;
}

export function createTransaction(checkoutData) {
  // minimal validation
  const txId = formatTransactionId();
  const amount = typeof checkoutData?.total === 'number' ? checkoutData.total : checkoutData?.amount || 0;
  const provider = checkoutData?.provider || 'momo';

  const pending = getPendingPayments();
  pending[txId] = {
    id: txId,
    checkout: checkoutData,
    provider,
    amount,
    status: 'pending',
    createdAt: Date.now()
  };
  savePendingPayments(pending);

  return { txId, provider, amount };
}

export function confirmPayment(txId) {
  const pending = getPendingPayments();
  const record = pending[txId];
  if (!record) throw new Error('Transaction not found: ' + txId);

  record.status = 'paid';
  record.paidAt = Date.now();
  // persist
  savePendingPayments(pending);

  // confirm booking (create booking record, etc.)
  const booking = confirmBooking({ ...record.checkout, transactionId: txId, paymentMethod: record.provider });

  // save last booking for invoice
  saveLastBooking(booking);

  return booking;
}

export function cancelPayment(txId) {
  const pending = getPendingPayments();
  if (pending[txId]) {
    // For simplicity, just delete the pending record
    delete pending[txId];
    savePendingPayments(pending);
    return true;
  }
  return false;
}

export function getPaymentRedirectUrl(provider, txId) {
  // client-side simulation: pages are in same folder
  return `payment_simulation.html?provider=${encodeURIComponent(provider)}&txId=${encodeURIComponent(txId)}`;
}
