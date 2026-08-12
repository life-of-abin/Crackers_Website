/**
 * India-wide Postal PIN Code Validation & State Cross-Verification Service
 * Grounded in official India Post data (api.postalpincode.in)
 */

export interface PinValidationResult {
  valid: boolean;
  pincode: string;
  state?: string;
  district?: string;
  city?: string;
  country?: string;
  error?: string;
  mismatch?: boolean;
  serviceFailure?: boolean;
  message?: string;
}

// Indian state alias normalizer for robust cross-checking
export function normalizeStateName(state: string): string {
  if (!state) return "";
  const cleaned = state.toLowerCase().trim().replace(/[^a-z]/g, "");
  
  const aliases: Record<string, string> = {
    tn: "tamilnadu",
    tamilnadu: "tamilnadu",
    kl: "kerala",
    kerala: "kerala",
    ka: "karnataka",
    karnataka: "karnataka",
    ap: "andhrapradesh",
    andhrapradesh: "andhrapradesh",
    ts: "telangana",
    telangana: "telangana",
    mh: "maharashtra",
    maharashtra: "maharashtra",
    dl: "delhi",
    delhi: "delhi",
    wb: "westbengal",
    westbengal: "westbengal",
    gj: "gujarat",
    gujarat: "gujarat",
    rj: "rajasthan",
    rajasthan: "rajasthan",
    up: "uttarpradesh",
    uttarpradesh: "uttarpradesh",
    mp: "madhyapradesh",
    madhyapradesh: "madhyapradesh",
    pb: "punjab",
    punjab: "punjab",
    hr: "haryana",
    haryana: "haryana",
    br: "bihar",
    bihar: "bihar",
    or: "odisha",
    odisha: "odisha",
    orissa: "odisha",
    py: "puducherry",
    puducherry: "puducherry",
    pondicherry: "puducherry",
  };

  return aliases[cleaned] || cleaned;
}

/**
 * Validates PIN format: exactly 6 digits, 1-9 start, non-repeating dummy digits
 */
export function isValidIndianPinFormat(pin: string): boolean {
  if (!pin) return false;
  const cleanPin = pin.trim();
  if (!/^[1-9][0-9]{5}$/.test(cleanPin)) return false;
  if (/^(\d)\1{5}$/.test(cleanPin)) return false; // Rejects 000000, 111111, 999999, etc.
  return true;
}

/**
 * Normalizes Indian Mobile Phone Numbers to canonical +919876543210 format.
 * Accepts: 9876543210, +919876543210, +91 9876543210, 09876543210
 * Rejects: 12345, 123456789, abcdefghij, 123456789012, or numbers starting with 0-5
 */
export function normalizeIndianPhone(phone: string): { valid: boolean; phone: string } {
  if (!phone) return { valid: false, phone: "" };
  const rawClean = phone.trim();
  
  // Reject non-numeric inputs (other than leading + and spaces)
  if (/[^0-9\s+]/.test(rawClean)) {
    return { valid: false, phone: rawClean };
  }

  const cleanedDigits = rawClean.replace(/[^0-9]/g, "");

  // Standard 10 digits starting with 6,7,8,9
  if (cleanedDigits.length === 10 && /^[6-9]\d{9}$/.test(cleanedDigits)) {
    return { valid: true, phone: `+91${cleanedDigits}` };
  }

  // 12 digits starting with country code 91 and valid mobile digit
  if (cleanedDigits.length === 12 && /^91[6-9]\d{9}$/.test(cleanedDigits)) {
    return { valid: true, phone: `+${cleanedDigits}` };
  }

  // 11 digits starting with trunk 0 and valid mobile digit
  if (cleanedDigits.length === 11 && /^0[6-9]\d{9}$/.test(cleanedDigits)) {
    return { valid: true, phone: `+91${cleanedDigits.slice(1)}` };
  }

  return { valid: false, phone: rawClean };
}

/**
 * Validates Gmail addresses strictly ending with @gmail.com
 * Rejects @yahoo.com, @outlook.com, @gmail.in, @gmail, etc.
 */
export function isValidGmailFormat(email: string): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return /^[A-Za-z0-9._%+-]+@gmail\.com$/i.test(clean);
}

/**
 * Validates email addresses (alias to Gmail validator)
 */
export function isValidEmailFormat(email: string): boolean {
  return isValidGmailFormat(email);
}

/**
 * Verifies Indian PIN Code against official India Post Database
 */
export async function verifyIndianPincode(pincode: string, userState?: string): Promise<PinValidationResult> {
  const cleanPin = pincode ? pincode.trim() : "";

  if (!isValidIndianPinFormat(cleanPin)) {
    return {
      valid: false,
      pincode: cleanPin,
      error: "Invalid Indian PIN code format. Must be a valid 6-digit postal code.",
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4-second timeout

    const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`, {
      signal: controller.signal,
      headers: { "Accept": "application/json" },
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Postal API returned HTTP ${res.status}`);
    }

    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0 || data[0].Status !== "Success" || !data[0].PostOffice || data[0].PostOffice.length === 0) {
      return {
        valid: false,
        pincode: cleanPin,
        error: `Invalid Indian PIN code (${cleanPin} not found in postal directory).`,
      };
    }

    const po = data[0].PostOffice[0];
    const verifiedState = po.State || "";
    const verifiedDistrict = po.District || "";
    const verifiedCity = po.Block || po.Name || po.District || "";
    const country = po.Country || "India";

    // PIN + State Cross-Validation
    if (userState && userState.trim()) {
      const normUserState = normalizeStateName(userState);
      const normPostalState = normalizeStateName(verifiedState);

      if (normUserState && normPostalState && normUserState !== normPostalState) {
        return {
          valid: false,
          pincode: cleanPin,
          state: verifiedState,
          district: verifiedDistrict,
          city: verifiedCity,
          country,
          mismatch: true,
          error: `PIN code and state do not match. ${cleanPin} belongs to ${verifiedState}. Please correct your address.`,
          message: `PIN code and state do not match. ${cleanPin} belongs to ${verifiedState}. Please correct your address.`,
        };
      }
    }

    return {
      valid: true,
      pincode: cleanPin,
      state: verifiedState,
      district: verifiedDistrict,
      city: verifiedCity,
      country,
    };
  } catch (err: any) {
    // Network or service timeout error - do not falsely claim valid
    return {
      valid: false,
      pincode: cleanPin,
      serviceFailure: true,
      error: "Unable to verify PIN code right now. Please try again.",
    };
  }
}
