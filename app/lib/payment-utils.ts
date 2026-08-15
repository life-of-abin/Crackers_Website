/**
 * Payment Utility Functions for Sivakasi Crackers
 */

export interface UpiParams {
  upiId: string;
  storeName: string;
  amount: number;
  orderId: number | string;
  note?: string;
}

/**
 * Generates standard UPI URI spec compliant link:
 * upi://pay?pa=MERCHANT_UPI&pn=MERCHANT_NAME&am=AMOUNT&tn=NOTE&tr=ORDER_ID&cu=INR
 */
export function generateUpiUri(params: UpiParams): string {
  const { upiId, storeName, amount, orderId, note } = params;
  const encodedName = encodeURIComponent(storeName || "Sivakasi Crackers");
  const formattedAmount = Number(amount).toFixed(2);
  const transactionNote = encodeURIComponent(note || `Order #${orderId} - Sivakasi Crackers`);
  const refId = `ORD${orderId}`;

  return `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodedName}&am=${formattedAmount}&tn=${transactionNote}&tr=${refId}&cu=INR`;
}

/**
 * Returns mobile app deep-link for Google Pay, PhonePe, Paytm, or generic UPI
 */
export function getAppPaymentLink(method: "GPAY" | "PHONEPE" | "PAYTM" | "UPI" | "QR", upiUri: string): string {
  if (!upiUri) return "#";
  
  switch (method) {
    case "GPAY":
      return `gpay://upi/pay?${upiUri.replace("upi://pay?", "")}`;
    case "PHONEPE":
      return `phonepe://pay?${upiUri.replace("upi://pay?", "")}`;
    case "PAYTM":
      return `paytmmp://pay?${upiUri.replace("upi://pay?", "")}`;
    case "UPI":
    case "QR":
    default:
      return upiUri;
  }
}

/**
 * Validates UTR / Transaction Reference format from customer input or payment provider
 */
export function validateTransactionRef(ref: string): { valid: boolean; error?: string } {
  if (!ref || typeof ref !== "string") {
    return { valid: false, error: "Please enter a valid Transaction Reference ID or UTR." };
  }

  const cleaned = ref.trim();
  if (cleaned.length < 6) {
    return { valid: false, error: "Transaction Reference ID / UTR must be at least 6 characters." };
  }

  if (cleaned.length > 35) {
    return { valid: false, error: "Transaction Reference ID is too long." };
  }

  if (/^(0{6,}|1{6,}|9{6,}|123456|test|dummy|fake|xxx)$/i.test(cleaned)) {
    return { valid: false, error: "Please enter your real 12-digit UTR or Transaction ID from your payment app." };
  }

  return { valid: true };
}

/**
 * Generates an immutable, unique invoice number: INV-2026-000042
 */
export function generateInvoiceNumber(orderId: number, date?: Date): string {
  const year = (date ? new Date(date) : new Date()).getFullYear();
  const paddedId = String(orderId).padStart(6, "0");
  return `INV-${year}-${paddedId}`;
}
