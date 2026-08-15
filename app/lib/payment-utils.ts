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
 * Generates standard UPI URI spec compliant link with strict URL encoding:
 * upi://pay?pa=MERCHANT_UPI&pn=MERCHANT_NAME&am=AMOUNT&tn=NOTE&tr=ORDER_ID&cu=INR
 */
export function generateUpiUri(params: UpiParams): string {
  const { upiId, storeName, amount, orderId, note } = params;
  const encodedName = encodeURIComponent(storeName || "Sri Sivakasi Crackers");
  const formattedAmount = Number(amount).toFixed(2);
  const transactionNote = encodeURIComponent(note || `Order #${orderId} - Sivakasi Crackers`);
  const refId = `ORD${orderId}`;

  return `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodedName}&am=${formattedAmount}&tn=${transactionNote}&tr=${refId}&cu=INR`;
}

/**
 * Returns package-specific Android intent for direct app launching (BHIM, Google Pay, PhonePe, Paytm)
 * Format: intent://pay?...#Intent;scheme=upi;package=PACKAGE_NAME;end;
 */
export function getAndroidPackageIntent(
  method: "GPAY" | "PHONEPE" | "PAYTM" | "BHIM" | "UPI" | "QR",
  upiUri: string
): string {
  if (!upiUri) return "#";
  const queryParams = upiUri.replace("upi://pay?", "");

  const androidPackages: Record<string, string> = {
    BHIM: "in.org.npci.upiapp",
    GPAY: "com.google.android.apps.nbu.paisa.user",
    PHONEPE: "com.phonepe.app",
    PAYTM: "net.one97.paytm",
  };

  const pkg = androidPackages[method];
  if (pkg) {
    return `intent://pay?${queryParams}#Intent;scheme=upi;package=${pkg};end;`;
  }

  return upiUri;
}

/**
 * Returns mobile app deep-link for Google Pay, PhonePe, Paytm, BHIM or generic UPI
 */
export function getAppPaymentLink(
  method: "GPAY" | "PHONEPE" | "PAYTM" | "BHIM" | "UPI" | "QR",
  upiUri: string,
  isAndroid: boolean = false
): string {
  if (!upiUri) return "#";
  const queryParams = upiUri.replace("upi://pay?", "");

  if (isAndroid) {
    return getAndroidPackageIntent(method, upiUri);
  }

  // iOS / Custom App Scheme Fallbacks
  switch (method) {
    case "GPAY":
      return `gpay://upi/pay?${queryParams}`;
    case "PHONEPE":
      return `phonepe://pay?${queryParams}`;
    case "PAYTM":
      return `paytmmp://pay?${queryParams}`;
    case "BHIM":
      return `bhim://pay?${queryParams}`;
    case "UPI":
    case "QR":
    default:
      return upiUri;
  }
}

/**
 * Validates customer full name (Alphabetic characters A-Z, a-z and spaces ONLY)
 */
export function isValidCustomerName(name: string): boolean {
  if (!name || typeof name !== "string") return false;
  const trimmed = name.trim();
  if (trimmed.length < 2) return false;
  return /^[A-Za-z\s]+$/.test(trimmed);
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
