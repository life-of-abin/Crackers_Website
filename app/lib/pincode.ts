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
  isTamilNadu?: boolean;
  postOffices?: string[];
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
  if (/0000$/.test(cleanPin)) return false; // Rejects 600000, 620000, 626000, etc. (No Indian postal PIN ends in 0000)
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
 * Formats any phone input into a valid 12-digit Indian WhatsApp number string (e.g. "919629525907").
 * Strictly prevents country code duplication like 91919629525907 or leading + sign.
 */
export function formatWhatsAppNumber(phone: string): string {
  if (!phone) return "919629525907";
  const digits = phone.replace(/[^0-9]/g, "");
  // If 10 digits -> add 91
  if (digits.length === 10) {
    return `91${digits}`;
  }
  // If 12 digits starting with 91 -> return as is
  if (digits.length === 12 && digits.startsWith("91")) {
    return digits;
  }
  // If 11 digits starting with 0 -> remove 0 and add 91
  if (digits.length === 11 && digits.startsWith("0")) {
    return `91${digits.slice(1)}`;
  }
  // Fallback if country code was duplicated (e.g. 91919629525907) or longer: take last 10 digits and prepend 91
  if (digits.length > 10) {
    return `91${digits.slice(-10)}`;
  }
  return digits || "919629525907";
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
 * Intelligent Location Resolver from India Post Office Records
 * Extracts the true main City/Town name, corrects updated Tamil Nadu district names,
 * and compiles all unique local post office names under the PIN code.
 */
export function resolveLocationFromPO(poList: any[]): {
  city: string;
  district: string;
  state: string;
  country: string;
  postOffices: string[];
} | null {
  if (!Array.isArray(poList) || poList.length === 0) return null;

  const firstPO = poList[0];
  const rawDistrict = (firstPO.District || "").trim();
  const rawState = (firstPO.State || "").trim();
  const rawCountry = (firstPO.Country || "India").trim();
  const rawDivision = (firstPO.Division || "").trim();
  const blockName = (firstPO.Block || "").trim();

  // 1. Precise Tamil Nadu District Corrections & Harmonization
  let district = rawDistrict;
  const distLower = rawDistrict.toLowerCase();
  const blockLower = blockName.toLowerCase();
  const divLower = rawDivision.toLowerCase();

  if (distLower === "kanchipuram" && (blockLower.includes("chingleput") || blockLower.includes("chengalpattu") || divLower.includes("tambaram"))) {
    district = "Chengalpattu";
  } else if (distLower === "vellore" && (blockLower.includes("ranipet") || divLower.includes("ranipet"))) {
    district = "Ranipet";
  } else if (distLower === "vellore" && (blockLower.includes("tirupathur") || divLower.includes("tirupathur"))) {
    district = "Tirupathur";
  } else if (distLower === "villupuram" && (blockLower.includes("kallakurichi") || divLower.includes("kallakurichi"))) {
    district = "Kallakurichi";
  } else if (distLower === "nagapattinam" && (blockLower.includes("mayiladuthurai") || divLower.includes("mayiladuthurai"))) {
    district = "Mayiladuthurai";
  } else if (distLower === "tirunelveli" && (blockLower.includes("tenkasi") || divLower.includes("tenkasi"))) {
    district = "Tenkasi";
  }

  // 2. Intelligent Main City / Town Extraction
  let city = "";

  // Priority A: PO whose name matches the District name (e.g., "Madurai", "Salem", "Coimbatore", "Erode", "Sivakasi")
  const exactDistPO = poList.find((p: any) => {
    const name = (p.Name || "").trim().toLowerCase();
    return name === distLower || name === district.toLowerCase();
  });
  if (exactDistPO) {
    city = exactDistPO.Name.trim();
  }

  // Priority B: Check if any PO is a Head Post Office (HPO)
  if (!city) {
    const hpo = poList.find((p: any) => p.BranchType === "Head Post Office");
    if (hpo) {
      city = hpo.Name.replace(/GPO|HO|Head Post Office|Bazaar|Bus Stand|Town/gi, "").trim();
    }
  }

  // Priority C: Check if a PO Name matches Block name (when Block is meaningful and not "NA")
  if (!city && blockName && blockName.toUpperCase() !== "NA") {
    const blockPO = poList.find((p: any) => (p.Name || "").trim().toLowerCase() === blockLower);
    if (blockPO) {
      city = blockPO.Name.trim();
    } else {
      city = blockName;
    }
  }

  // Priority D: Clean Division name
  if (!city && rawDivision) {
    const cleanDiv = rawDivision.replace(/Division|GPO|Central|North|South|East|West/gi, "").trim();
    if (cleanDiv.length > 2) {
      city = cleanDiv;
    }
  }

  // Priority E: Fallback to first PO Name
  if (!city) {
    city = (firstPO.Name || "").trim();
  }

  // Clean trailing spaces or redundant strings from city name
  city = city.replace(/\s+/g, " ").trim();

  // All unique local post offices / area names
  const postOffices: string[] = Array.from(
    new Set(poList.map((p: any) => (p.Name || "").trim()).filter(Boolean))
  );

  return {
    city,
    district,
    state: rawState,
    country: rawCountry,
    postOffices,
  };
}

/**
 * Detailed offline Tamil Nadu postal dataset mapping sub-prefixes to districts and major cities
 */
export function getLocalPincodeDetails(pin: string) {
  const cleanPin = pin ? pin.trim() : "";
  if (!/^\d{6}$/.test(cleanPin)) return null;
  if (/0000$/.test(cleanPin)) return null; // Reject fake numbers ending in 0000

  const prefix3 = cleanPin.slice(0, 3);
  const prefix2 = cleanPin.slice(0, 2);

  // Exact matches for prominent Tamil Nadu cities & postal divisions
  const exactMatches: Record<string, { city: string; district: string; state: string }> = {
    "626123": { city: "Sivakasi", district: "Virudhunagar", state: "Tamil Nadu" },
    "626124": { city: "Sivakasi", district: "Virudhunagar", state: "Tamil Nadu" },
    "626189": { city: "Sivakasi", district: "Virudhunagar", state: "Tamil Nadu" },
    "626001": { city: "Virudhunagar", district: "Virudhunagar", state: "Tamil Nadu" },
    "626101": { city: "Rajapalayam", district: "Virudhunagar", state: "Tamil Nadu" },
    "626201": { city: "Sattur", district: "Virudhunagar", state: "Tamil Nadu" },
    "626106": { city: "Aruppukottai", district: "Virudhunagar", state: "Tamil Nadu" },
    "600001": { city: "Chennai", district: "Chennai", state: "Tamil Nadu" },
    "600002": { city: "Chennai", district: "Chennai", state: "Tamil Nadu" },
    "600028": { city: "Chennai", district: "Chennai", state: "Tamil Nadu" },
    "600040": { city: "Chennai", district: "Chennai", state: "Tamil Nadu" },
    "641001": { city: "Coimbatore", district: "Coimbatore", state: "Tamil Nadu" },
    "625001": { city: "Madurai", district: "Madurai", state: "Tamil Nadu" },
    "636001": { city: "Salem", district: "Salem", state: "Tamil Nadu" },
    "620001": { city: "Tiruchirappalli", district: "Tiruchirappalli", state: "Tamil Nadu" },
    "627001": { city: "Tirunelveli", district: "Tirunelveli", state: "Tamil Nadu" },
    "638001": { city: "Erode", district: "Erode", state: "Tamil Nadu" },
    "632001": { city: "Vellore", district: "Vellore", state: "Tamil Nadu" },
    "628001": { city: "Thoothukudi", district: "Thoothukudi", state: "Tamil Nadu" },
    "629001": { city: "Nagercoil", district: "Kanyakumari", state: "Tamil Nadu" },
    "613001": { city: "Thanjavur", district: "Thanjavur", state: "Tamil Nadu" },
    "603001": { city: "Chengalpattu", district: "Chengalpattu", state: "Tamil Nadu" },
    "603103": { city: "Kelambakkam", district: "Chengalpattu", state: "Tamil Nadu" },
    "631201": { city: "Ranipet", district: "Ranipet", state: "Tamil Nadu" },
    "635801": { city: "Tirupathur", district: "Tirupathur", state: "Tamil Nadu" },
    "606201": { city: "Kallakurichi", district: "Kallakurichi", state: "Tamil Nadu" },
    "609001": { city: "Mayiladuthurai", district: "Mayiladuthurai", state: "Tamil Nadu" },
    "627811": { city: "Tenkasi", district: "Tenkasi", state: "Tamil Nadu" },
    "560001": { city: "Bengaluru", district: "Bengaluru", state: "Karnataka" },
    "400001": { city: "Mumbai", district: "Mumbai", state: "Maharashtra" },
    "110001": { city: "New Delhi", district: "New Delhi", state: "Delhi" },
    "700001": { city: "Kolkata", district: "Kolkata", state: "West Bengal" },
  };

  if (exactMatches[cleanPin]) {
    return exactMatches[cleanPin];
  }

  // Comprehensive 3-Digit Sub-Prefix Map for Tamil Nadu
  const prefix3TNMap: Record<string, { district: string; city: string }> = {
    "600": { district: "Chennai", city: "Chennai" },
    "601": { district: "Tiruvallur", city: "Tiruvallur" },
    "602": { district: "Kanchipuram", city: "Kanchipuram" },
    "603": { district: "Chengalpattu", city: "Chengalpattu" },
    "604": { district: "Tiruvannamalai", city: "Tiruvannamalai" },
    "605": { district: "Villupuram", city: "Villupuram" },
    "606": { district: "Kallakurichi", city: "Kallakurichi" },
    "607": { district: "Cuddalore", city: "Cuddalore" },
    "608": { district: "Cuddalore", city: "Chidambaram" },
    "609": { district: "Mayiladuthurai", city: "Mayiladuthurai" },
    "610": { district: "Thiruvarur", city: "Thiruvarur" },
    "611": { district: "Nagapattinam", city: "Nagapattinam" },
    "612": { district: "Thanjavur", city: "Kumbakonam" },
    "613": { district: "Thanjavur", city: "Thanjavur" },
    "614": { district: "Thanjavur", city: "Pattukkottai" },
    "620": { district: "Tiruchirappalli", city: "Tiruchirappalli" },
    "621": { district: "Perambalur", city: "Perambalur" },
    "622": { district: "Pudukkottai", city: "Pudukkottai" },
    "623": { district: "Ramanathapuram", city: "Ramanathapuram" },
    "624": { district: "Dindigul", city: "Dindigul" },
    "625": { district: "Madurai", city: "Madurai" },
    "626": { district: "Virudhunagar", city: "Sivakasi" },
    "627": { district: "Tirunelveli", city: "Tirunelveli" },
    "628": { district: "Thoothukudi", city: "Thoothukudi" },
    "629": { district: "Kanyakumari", city: "Nagercoil" },
    "630": { district: "Sivaganga", city: "Karaikudi" },
    "631": { district: "Ranipet", city: "Ranipet" },
    "632": { district: "Vellore", city: "Vellore" },
    "635": { district: "Krishnagiri", city: "Hosur" },
    "636": { district: "Salem", city: "Salem" },
    "637": { district: "Namakkal", city: "Namakkal" },
    "638": { district: "Erode", city: "Erode" },
    "639": { district: "Karur", city: "Karur" },
    "641": { district: "Coimbatore", city: "Coimbatore" },
    "642": { district: "Tiruppur", city: "Pollachi" },
    "643": { district: "Nilgiris", city: "Udhagamandalam" },
  };

  if (prefix3TNMap[prefix3]) {
    return {
      city: prefix3TNMap[prefix3].city,
      district: prefix3TNMap[prefix3].district,
      state: "Tamil Nadu",
    };
  }

  // 2-digit fallbacks for non-TN state detection
  const prefix2Map: Record<string, string> = {
    "11": "Delhi", "12": "Haryana", "13": "Haryana", "14": "Punjab", "15": "Punjab",
    "16": "Punjab", "17": "Himachal Pradesh", "18": "Jammu & Kashmir", "19": "Jammu & Kashmir",
    "20": "Uttar Pradesh", "21": "Uttar Pradesh", "22": "Uttar Pradesh", "23": "Uttar Pradesh",
    "24": "Uttar Pradesh", "25": "Uttar Pradesh", "26": "Uttar Pradesh", "27": "Uttar Pradesh",
    "28": "Uttar Pradesh", "30": "Rajasthan", "31": "Rajasthan", "32": "Rajasthan",
    "33": "Rajasthan", "34": "Rajasthan", "36": "Gujarat", "37": "Gujarat", "38": "Gujarat",
    "39": "Gujarat", "40": "Maharashtra", "41": "Maharashtra", "42": "Maharashtra",
    "43": "Maharashtra", "44": "Maharashtra", "45": "Madhya Pradesh", "46": "Madhya Pradesh",
    "47": "Madhya Pradesh", "48": "Madhya Pradesh", "49": "Chhattisgarh", "50": "Telangana",
    "51": "Andhra Pradesh", "52": "Andhra Pradesh", "53": "Andhra Pradesh", "56": "Karnataka",
    "57": "Karnataka", "58": "Karnataka", "59": "Karnataka", "60": "Tamil Nadu",
    "61": "Tamil Nadu", "62": "Tamil Nadu", "63": "Tamil Nadu", "64": "Tamil Nadu",
    "67": "Kerala", "68": "Kerala", "69": "Kerala", "70": "West Bengal", "71": "West Bengal",
    "72": "West Bengal", "73": "West Bengal", "74": "West Bengal", "75": "Odisha",
    "76": "Odisha", "77": "Odisha", "78": "Assam", "79": "Assam", "80": "Bihar",
    "81": "Bihar", "82": "Bihar", "83": "Jharkhand", "84": "Bihar", "85": "Bihar",
  };

  const detectedState = prefix2Map[prefix2];
  if (!detectedState) return null;

  return {
    city: "",
    district: detectedState === "Tamil Nadu" ? "Tamil Nadu Postal Region" : "",
    state: detectedState,
  };
}

/**
 * Dedicated Tamil Nadu Pincode Detector & Validator API Engine
 * Queries official India Post directory and cross-verifies strict Tamil Nadu state rules.
 */
export async function verifyIndianPincode(
  pincode: string,
  userState?: string,
  tnOnly: boolean = true
): Promise<PinValidationResult> {
  const cleanPin = pincode ? pincode.trim() : "";

  if (!isValidIndianPinFormat(cleanPin)) {
    return {
      valid: false,
      pincode: cleanPin,
      isTamilNadu: false,
      error: "Invalid 6-digit PIN code format. Please enter a valid Indian postal PIN code.",
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s quick API timeout

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
        isTamilNadu: false,
        error: `PIN code ${cleanPin} is invalid and was not found in official India Post directory records. Please check your PIN code.`,
      };
    }

    const resolved = resolveLocationFromPO(data[0].PostOffice);
    if (!resolved) {
      throw new Error("Could not resolve location from postal office data");
    }

    const verifiedState = resolved.state || "Tamil Nadu";
    const verifiedDistrict = resolved.district || "";
    const verifiedCity = resolved.city || "";
    const country = resolved.country || "India";
    const poNames = resolved.postOffices;

    const normPostalState = normalizeStateName(verifiedState);
    const isTN = normPostalState === "tamilnadu";

    // Enforce strict Tamil Nadu restriction if requested
    if (tnOnly && !isTN) {
      return {
        valid: false,
        pincode: cleanPin,
        state: verifiedState,
        district: verifiedDistrict,
        city: verifiedCity,
        country,
        isTamilNadu: false,
        mismatch: true,
        error: `PIN code ${cleanPin} belongs to ${verifiedState}. We currently accept orders for Tamil Nadu only.`,
        message: `PIN code ${cleanPin} belongs to ${verifiedState}. We currently accept orders for Tamil Nadu only.`,
      };
    }

    // Optional userState validation (if user picked a different state manually)
    if (userState && userState.trim()) {
      const normUserState = normalizeStateName(userState);
      if (normUserState && normPostalState && normUserState !== normPostalState) {
        return {
          valid: false,
          pincode: cleanPin,
          state: verifiedState,
          district: verifiedDistrict,
          city: verifiedCity,
          country,
          isTamilNadu: isTN,
          mismatch: true,
          error: `PIN code ${cleanPin} belongs to ${verifiedState}. Your selected state (${userState}) does not match.`,
          message: `PIN code ${cleanPin} belongs to ${verifiedState}. Your selected state (${userState}) does not match.`,
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
      isTamilNadu: isTN,
      postOffices: poNames,
    };
  } catch (err: any) {
    // Fallback to local dataset on network/API failure
    const local = getLocalPincodeDetails(cleanPin);
    if (local) {
      const isTNLocal = normalizeStateName(local.state) === "tamilnadu";
      if (tnOnly && !isTNLocal) {
        return {
          valid: false,
          pincode: cleanPin,
          state: local.state,
          isTamilNadu: false,
          error: `PIN code ${cleanPin} belongs to ${local.state}. We currently deliver to Tamil Nadu only.`,
        };
      }

      return {
        valid: true,
        pincode: cleanPin,
        state: local.state || "Tamil Nadu",
        district: local.district || "",
        city: local.city || "",
        isTamilNadu: isTNLocal,
        serviceFailure: true,
        message: "PIN code verified via offline Tamil Nadu postal dataset.",
      };
    }

    return {
      valid: false,
      pincode: cleanPin,
      isTamilNadu: false,
      error: "Unable to verify PIN code online. Please double check your 6-digit PIN code.",
    };
  }
}

/**
 * Explicit helper for Tamil Nadu Pincode Detection API
 */
export async function verifyTamilNaduPincode(pincode: string): Promise<PinValidationResult> {
  return verifyIndianPincode(pincode, "Tamil Nadu", true);
}

