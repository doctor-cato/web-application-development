/**
 * paymentService.js
 * Giả lập dịch vụ thanh toán: tạo mã giao dịch, QR code, v.v.
 */

export function createTransaction(amount, method) {
  const date = new Date();
  const txId = `TXN_${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2,'0')}${date.getDate().toString().padStart(2,'0')}_${Math.floor(Math.random()*1000000)}`;
  
  return {
    transactionId: txId,
    amount,
    method,
    status: 'pending',
    createdAt: date.toISOString()
  };
}

export function simulatePayment(transactionId, callback) {
  // Giả lập xử lý thanh toán mất 3 giây
  setTimeout(() => {
    callback({
      transactionId,
      status: 'success',
      paidAt: new Date().toISOString()
    });
  }, 3000);
}

export function generateQRCodeString(bookingData) {
  // Create a string to be encoded into QR Code
  return `3HD2K-TICKET|ID:${bookingData.id}|MOVIE:${bookingData.movieTitle}|SHOW:${bookingData.showtimeText}|SEATS:${bookingData.seats.join(',')}|TOTAL:${bookingData.total}`;
}
