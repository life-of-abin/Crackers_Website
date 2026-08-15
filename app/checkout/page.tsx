"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import {
  generateUpiUri,
  getAppPaymentLink,
  isValidCustomerName,
} from "@/lib/payment-utils";
import {
  createOrderAction,
  getPaymentAccountsAction,
} from "@/lib/actions";

export interface StoreSettings {
  id: number;
  storeName: string;
  phone: string;
  email: string;
  address: string;
  googleMapsUrl: string;
  whatsappNumber: string;
  minOrderAmount: number;
  flatShippingFee: number;
  freeShippingThreshold: number;
}

const DEFAULT_SETTINGS: StoreSettings = {
  id: 1,
  storeName: "Sri Sivakasi Crackers",
  phone: "9629525907",
  email: "abinesh.ece2003@gmail.com",
  address: "123 Main Bazaar, Sivakasi, Tamil Nadu 626123",
  googleMapsUrl: "https://maps.google.com/?q=Sivakasi,Tamil+Nadu",
  whatsappNumber: "+919629525907",
  minOrderAmount: 500,
  flatShippingFee: 100,
  freeShippingThreshold: 3000,
};

const INDIAN_STATES = [
  "Tamil Nadu",
  "Andhra Pradesh",
  "Karnataka",
  "Kerala",
  "Telangana",
  "Puducherry",
  "Maharashtra",
  "Gujarat",
  "Goa",
  "Delhi",
  "West Bengal",
  "Other State",
];

// Helper: Basic Gmail / Email format check
function isValidGmailFormat(val: string): boolean {
  const trimmed = val.trim();
  if (!trimmed.includes("@") || !trimmed.includes(".")) return false;
  const parts = trimmed.split("@");
  if (parts.length !== 2) return false;
  const domain = parts[1];
  return domain.includes(".") && domain.split(".")[1].length >= 2;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, totalQuantity, clearCart, isMounted } = useCart();
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);

  // Form Fields
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [pincode, setPincode] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("Tamil Nadu");

  // Payment Selection State (DEFAULT = QR Paytm/UPI)
  const [paymentMethod, setPaymentMethod] = useState<"QR" | "GPAY" | "PHONEPE" | "PAYTM" | "BHIM">("QR");
  const [paymentAccounts, setPaymentAccounts] = useState<any[]>([]);

  // Pincode Lookup & Error States
  const [pinLoading, setPinLoading] = useState(false);
  const [pinVerifiedInfo, setPinVerifiedInfo] = useState<{
    valid: boolean;
    city?: string;
    district?: string;
    state?: string;
  } | null>(null);

  const [pinError, setPinError] = useState("");
  const [autoFilledPin, setAutoFilledPin] = useState<string | null>(null);

  // App Unavailability Notice State
  const [appNotice, setAppNotice] = useState<string | null>(null);

  // Input Field References for Scrolling
  const nameRef = useRef<HTMLInputElement | null>(null);
  const phoneRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const addressRef = useRef<HTMLTextAreaElement | null>(null);
  const pinRef = useRef<HTMLInputElement | null>(null);
  const cityRef = useRef<HTMLInputElement | null>(null);
  const districtRef = useRef<HTMLInputElement | null>(null);

  // Validation & Processing States
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");

  // Fetch Store Settings & Payment Accounts on Mount
  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) setSettings(data);
      })
      .catch(console.error);

    getPaymentAccountsAction()
      .then((res) => {
        if (res.success && res.accounts) {
          setPaymentAccounts(res.accounts);
        }
      })
      .catch(console.error);
  }, []);

  // Reactive PIN Code Lookup Effect (6 Digits Only)
  useEffect(() => {
    const cleaned = pincode.trim().replace(/[^0-9]/g, "");

    if (cleaned.length !== 6) {
      return;
    }

    if (cleaned === autoFilledPin) return;

    setPinLoading(true);
    setPinError("");
    setPinVerifiedInfo(null);

    const controller = new AbortController();
    let isCurrent = true;

    fetch(`/api/pincode?pin=${cleaned}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        if (!isCurrent) return;
        setPinLoading(false);
        if (data && data.valid) {
          setPinVerifiedInfo(data);
          setAutoFilledPin(cleaned);

          if (data.city) setCity(data.city);
          if (data.district) setDistrict(data.district);
          if (data.state && INDIAN_STATES.includes(data.state)) setState(data.state);

          setErrors((prev) => {
            const copy = { ...prev };
            delete copy.pincode;
            delete copy.city;
            delete copy.district;
            return copy;
          });
        } else {
          setPinError("Location could not be detected. Please check your pincode.");
        }
      })
      .catch((err) => {
        if (!isCurrent) return;
        if (err.name !== "AbortError") {
          setPinLoading(false);
          setPinError("Location could not be detected. Please check your pincode.");
        }
      });

    return () => {
      isCurrent = false;
      controller.abort();
    };
  }, [pincode]);

  // PIN Code Input Handler
  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
    setPincode(cleaned);

    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.pincode;
      return copy;
    });
    setPinError("");

    if (cleaned.length !== 6 || cleaned !== autoFilledPin) {
      setCity("");
      setDistrict("");
      setState("Tamil Nadu");
      setAutoFilledPin(null);
      setPinVerifiedInfo(null);
    }
  };

  // Name Validation (Letters and Spaces ONLY)
  const handleNameInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomerName(val);

    if (!val || val.trim().length === 0) {
      return;
    }

    if (!isValidCustomerName(val)) {
      setErrors((prev) => ({
        ...prev,
        name: "Name can contain letters and spaces only.",
      }));
    } else {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.name;
        return copy;
      });
    }
  };

  // Phone Validation
  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    if (raw.length <= 10) {
      setPhone(raw);
      if (raw.length === 10) {
        setErrors((prev) => {
          const copy = { ...prev };
          delete copy.phone;
          return copy;
        });
      }
    }
  };

  // Email Format Validation
  const handleEmailInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    if (isValidGmailFormat(val)) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.email;
        return copy;
      });
    }
  };

  // Address Input Handler
  const handleAddressInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setAddress(val);
    if (val.trim().length >= 5) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.address;
        return copy;
      });
    }
  };

  // City Input Handler
  const handleCityInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCity(val);
    if (val.trim().length >= 2) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.city;
        return copy;
      });
    }
  };

  // District Input Handler
  const handleDistrictInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDistrict(val);
    if (val.trim().length >= 2) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.district;
        return copy;
      });
    }
  };

  // Form Validation Checklist
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!customerName || customerName.trim().length < 2 || !isValidCustomerName(customerName)) {
      newErrors.name = "Name can contain letters and spaces only.";
    }

    if (!phone || phone.length !== 10) {
      newErrors.phone = "Please enter a valid 10-digit mobile number.";
    }

    if (!email || !isValidGmailFormat(email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!address || address.trim().length < 5) {
      newErrors.address = "Please enter a detailed delivery address (minimum 5 characters).";
    }

    if (!pincode || pincode.length !== 6) {
      newErrors.pincode = "Please enter a valid 6-digit pincode.";
    } else if (pinError) {
      newErrors.pincode = pinError;
    }

    if (!city || city.trim().length < 2) {
      newErrors.city = "Please enter a valid City / Town.";
    }

    if (!district || district.trim().length < 2) {
      newErrors.district = "Please enter a valid District.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstInvalidField = Object.keys(newErrors)[0];
      let ref = null;
      if (firstInvalidField === "name") ref = nameRef;
      else if (firstInvalidField === "phone") ref = phoneRef;
      else if (firstInvalidField === "email") ref = emailRef;
      else if (firstInvalidField === "address") ref = addressRef;
      else if (firstInvalidField === "pincode") ref = pinRef;
      else if (firstInvalidField === "city") ref = cityRef;
      else if (firstInvalidField === "district") ref = districtRef;

      if (ref && ref.current) {
        ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
        ref.current.focus({ preventScroll: true });
      }
      return false;
    }

    return true;
  };

  const grandTotalAmount = subtotal >= settings.freeShippingThreshold ? subtotal : subtotal + settings.flatShippingFee;

  const qrAccount = paymentAccounts.find((a) => a.isActive || a.isPrimary) || paymentAccounts[0];
  const upiIdToUse = qrAccount?.upiId || "9629525907@upi";

  const dynamicUpiUri = generateUpiUri({
    upiId: upiIdToUse,
    storeName: settings.storeName,
    amount: grandTotalAmount,
    orderId: "TEMP",
    note: "Sivakasi Crackers Purchase",
  });

  // Direct App Tap Handler
  const handleAppTap = (method: "BHIM" | "GPAY" | "PHONEPE" | "PAYTM") => {
    setPaymentMethod(method);
    setAppNotice(null);

    const appNames: Record<string, string> = {
      BHIM: "BHIM",
      GPAY: "Google Pay",
      PHONEPE: "PhonePe",
      PAYTM: "Paytm",
    };

    const appName = appNames[method] || method;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      typeof navigator !== "undefined" ? navigator.userAgent : ""
    );

    if (!isMobile) {
      setAppNotice(
        `Direct app payment for ${appName} is available on supported mobile devices. Please scan the QR code using your UPI app.`
      );
      return;
    }

    const deepLink = getAppPaymentLink(method, dynamicUpiUri);
    try {
      window.location.href = deepLink;
      setTimeout(() => {
        setAppNotice(`${appName} is not installed on your device. Please try another payment option.`);
      }, 2500);
    } catch {
      setAppNotice(`${appName} is not installed on your device. Please try another payment option.`);
    }
  };

  // SUBMIT ORDER HANDLER
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError("");

    if (!validateForm()) return;

    if (items.length === 0) {
      setGlobalError("Your shopping cart is empty.");
      return;
    }

    setLoading(true);

    try {
      const result = await createOrderAction({
        customerName: customerName.trim(),
        phone: `+91${phone}`,
        email: email.trim(),
        address: address.trim(),
        landmark: landmark.trim() || undefined,
        city: city.trim(),
        district: district.trim(),
        state,
        pincode: pincode.trim(),
        paymentMethod: paymentMethod,
        cartItems: items.map((item) => ({
          productId: item.id,
          quantity: item.cartQuantity,
        })),
      });

      if (result.error) {
        setGlobalError(result.error);
        setLoading(false);
        return;
      }

      if (result.success && result.orderId) {
        clearCart();
        setLoading(false);
        router.push(`/order-confirmation/${result.orderId}`);
      } else {
        setGlobalError("Failed to complete order. Please try again.");
        setLoading(false);
      }
    } catch (err: any) {
      console.error("Submit order error:", err);
      setGlobalError("An unexpected error occurred during order processing.");
      setLoading(false);
    }
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#080B1A] text-[#FFF9EA] flex items-center justify-center">
        <div className="animate-spin text-4xl">🎆</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#080B1A] text-[#FFF9EA] selection:bg-[#6D3FD6] selection:text-white">
      <Header settings={settings} />

      {/* Guest Checkout Banner */}
      <div className="bg-[#151A35] text-[#FFF9EA] py-8 border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-[#F5C451] text-xs font-bold uppercase tracking-wider mb-1">
            <Link href="/" className="hover:underline">Home</Link>
            <span>/</span>
            <Link href="/cart" className="hover:underline">Cart</Link>
            <span>/</span>
            <span>Guest Checkout</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-display">
            Guest Checkout & Payment
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Fast, secure guest checkout. Order 1 or more festive items with instant factory dispatch.
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full">
        <form onSubmit={handleSubmitOrder} className="max-w-3xl mx-auto space-y-6" noValidate>
          
          {/* Section 1: Customer Contact Information */}
          <div className="bg-[#151A35]/90 rounded-3xl border border-[#6D3FD6]/30 p-6 sm:p-8 shadow-2xl space-y-5 backdrop-blur-md">
            <h2 className="text-sm font-black text-[#FFF9EA] border-b border-white/10 pb-3 uppercase tracking-wider flex items-center gap-2 font-display">
              <span className="w-6 h-6 rounded-full bg-[#6D3FD6] text-white text-xs flex items-center justify-center font-bold">1</span>
              Customer Contact Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Full Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#F5C451] uppercase tracking-wider mb-1">
                  Full Name (Letters & Spaces Only) *
                </label>
                <input
                  ref={nameRef}
                  type="text"
                  required
                  placeholder="Abinesh Kumar"
                  value={customerName}
                  onChange={handleNameInput}
                  aria-invalid={errors.name ? "true" : "false"}
                  aria-describedby={errors.name ? "name-error" : undefined}
                  className={`w-full px-4 py-3 bg-[#080B1A] border rounded-xl text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                    errors.name ? "border-red-500 ring-1 ring-red-500 bg-red-950/20" : "border-white/20 focus:ring-[#6D3FD6] focus:border-[#6D3FD6]"
                  }`}
                />
                {errors.name ? (
                  <span id="name-error" className="text-[11px] font-bold text-red-400 mt-1 block">
                    {errors.name}
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Accepts letters (A-Z, a-z) and spaces. E.g. Abinesh N, Ravi Kumar
                  </span>
                )}
              </div>

              {/* Mobile Input */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Mobile Number *
                </label>
                <input
                  ref={phoneRef}
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="98765 43210"
                  value={phone ? phone.replace(/(\d{5})(\d{5})/, "$1 $2") : ""}
                  onChange={handlePhoneInput}
                  aria-invalid={errors.phone ? "true" : "false"}
                  aria-describedby={errors.phone ? "phone-error" : undefined}
                  className={`w-full px-4 py-3 bg-[#080B1A] border rounded-xl text-xs font-semibold text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                    errors.phone ? "border-red-500 ring-1 ring-red-500 bg-red-950/20" : "border-white/20 focus:ring-[#6D3FD6] focus:border-[#6D3FD6]"
                  }`}
                />
                <span className="text-[10px] text-slate-400 mt-1 block">10-digit Indian mobile number</span>

                {errors.phone && (
                  <span id="phone-error" className="text-[11px] font-bold text-red-400 mt-1 block">
                    {errors.phone}
                  </span>
                )}
              </div>

              {/* Email Address Input */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <input
                  ref={emailRef}
                  type="email"
                  required
                  placeholder="customer@gmail.com"
                  value={email}
                  onChange={handleEmailInput}
                  aria-invalid={errors.email ? "true" : "false"}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className={`w-full px-4 py-3 bg-[#080B1A] border rounded-xl text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                    errors.email ? "border-red-500 ring-1 ring-red-500 bg-red-950/20" : "border-white/20 focus:ring-[#6D3FD6] focus:border-[#6D3FD6]"
                  }`}
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Order updates & invoice sent here</span>

                {errors.email && (
                  <span id="email-error" className="text-[11px] font-bold text-red-400 mt-1 block">
                    {errors.email}
                  </span>
                )}
              </div>

            </div>
          </div>

          {/* Section 2: Address & PIN Code */}
          <div className="bg-[#151A35]/90 rounded-3xl border border-[#6D3FD6]/30 p-6 sm:p-8 shadow-2xl space-y-5 backdrop-blur-md">
            <h2 className="text-sm font-black text-[#FFF9EA] border-b border-white/10 pb-3 uppercase tracking-wider flex items-center gap-2 font-display">
              <span className="w-6 h-6 rounded-full bg-[#6D3FD6] text-white text-xs flex items-center justify-center font-bold">2</span>
              Delivery Address & Postal Code
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Address Line 1 (House No., Building, Street Name) *
                </label>
                <textarea
                  ref={addressRef}
                  required
                  rows={2}
                  placeholder="Door No 42, Gandhi Road"
                  value={address}
                  onChange={handleAddressInput}
                  aria-invalid={errors.address ? "true" : "false"}
                  aria-describedby={errors.address ? "address-error" : undefined}
                  className={`w-full px-4 py-3 bg-[#080B1A] border rounded-xl text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                    errors.address ? "border-red-500 ring-1 ring-red-500 bg-red-950/20" : "border-white/20 focus:ring-[#6D3FD6] focus:border-[#6D3FD6]"
                  }`}
                />
                {errors.address && (
                  <span id="address-error" className="text-[11px] font-bold text-red-400 mt-1 block">
                    {errors.address}
                  </span>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Address Line 2 / Landmark (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Near Bus Stand / Opposite SBI Bank"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="w-full px-4 py-3 bg-[#080B1A] border border-white/20 rounded-xl text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#6D3FD6]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  State *
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-4 py-3 bg-[#080B1A] border border-white/20 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#6D3FD6]"
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st} className="bg-[#080B1A] text-white">{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  PIN Code (6 Digits) *
                </label>
                <input
                  ref={pinRef}
                  type="text"
                  required
                  maxLength={6}
                  placeholder="641001"
                  value={pincode}
                  onChange={handlePincodeChange}
                  aria-invalid={errors.pincode ? "true" : "false"}
                  aria-describedby={errors.pincode ? "pincode-error" : undefined}
                  className={`w-full px-4 py-3 bg-[#080B1A] border rounded-xl text-xs font-semibold text-white font-mono focus:outline-none focus:ring-2 transition-all ${
                    errors.pincode ? "border-red-500 ring-1 ring-red-500 bg-red-950/20" : "border-white/20 focus:ring-[#6D3FD6] focus:border-[#6D3FD6]"
                  }`}
                />
                
                <div className="mt-1.5 text-xs font-bold">
                  {pinLoading && (
                    <span className="text-[#F5C451] animate-pulse flex items-center gap-1 text-[11px] mt-1">
                      <span className="w-2 h-2 rounded-full bg-[#F5C451] animate-ping" />
                      Detecting location...
                    </span>
                  )}
                  {pinError && (
                    <span className="text-red-400 block bg-red-950/40 p-2 rounded-lg border border-red-900/50 text-[11px] mt-1">
                      {pinError}
                    </span>
                  )}
                  {errors.pincode && !pinError && (
                    <span id="pincode-error" className="text-red-400 block text-[11px] mt-1">
                      {errors.pincode}
                    </span>
                  )}
                  {pinVerifiedInfo && pinVerifiedInfo.valid && (
                    <div className="text-emerald-400 bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-800/40 text-[11px] space-y-0.5 mt-1">
                      <span className="font-extrabold flex items-center gap-1">
                        ✓ Pincode verified
                      </span>
                      <div>City: {pinVerifiedInfo.city}</div>
                      <div>District: {pinVerifiedInfo.district}</div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  City / Town *
                </label>
                <input
                  ref={cityRef}
                  type="text"
                  required
                  placeholder={pinLoading ? "Auto-detecting..." : "Coimbatore"}
                  disabled={pinLoading}
                  value={city}
                  onChange={handleCityInput}
                  aria-invalid={errors.city ? "true" : "false"}
                  aria-describedby={errors.city ? "city-error" : undefined}
                  className={`w-full px-4 py-3 bg-[#080B1A] border rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 transition-all ${
                    errors.city ? "border-red-500 ring-1 ring-red-500 bg-red-950/20" : "border-white/20 focus:ring-[#6D3FD6] focus:border-[#6D3FD6]"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                />
                {errors.city && (
                  <span id="city-error" className="text-[11px] font-bold text-red-400 mt-1 block">
                    {errors.city}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  District *
                </label>
                <input
                  ref={districtRef}
                  type="text"
                  required
                  placeholder={pinLoading ? "Auto-detecting..." : "Coimbatore District"}
                  disabled={pinLoading}
                  value={district}
                  onChange={handleDistrictInput}
                  aria-invalid={errors.district ? "true" : "false"}
                  aria-describedby={errors.district ? "district-error" : undefined}
                  className={`w-full px-4 py-3 bg-[#080B1A] border rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 transition-all ${
                    errors.district ? "border-red-500 ring-1 ring-red-500 bg-red-950/20" : "border-white/20 focus:ring-[#6D3FD6] focus:border-[#6D3FD6]"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                />
                {errors.district && (
                  <span id="district-error" className="text-[11px] font-bold text-red-400 mt-1 block">
                    {errors.district}
                  </span>
                )}
              </div>

            </div>
          </div>

          {/* Section 3: Payment Section (Default: Paytm / UPI QR) */}
          <div className="bg-[#151A35]/90 rounded-3xl border border-[#6D3FD6]/30 p-6 sm:p-8 shadow-2xl space-y-6 backdrop-blur-md">
            <h2 className="text-sm font-black text-[#FFF9EA] border-b border-white/10 pb-3 uppercase tracking-wider flex items-center gap-2 font-display">
              <span className="w-6 h-6 rounded-full bg-[#6D3FD6] text-white text-xs flex items-center justify-center font-bold">3</span>
              Payment Method
            </h2>

            {/* DEFAULT PAYMENT OPTION: PAYTM / UPI QR CODE (Selected by default) */}
            <div
              onClick={() => {
                setPaymentMethod("QR");
                setAppNotice(null);
              }}
              className={`p-6 rounded-3xl border transition-all space-y-4 cursor-pointer relative ${
                paymentMethod === "QR"
                  ? "border-[#6D3FD6] bg-[#6D3FD6]/20 ring-2 ring-[#6D3FD6] shadow-xl"
                  : "border-white/10 bg-[#080B1A]/80 hover:border-[#6D3FD6]/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#6D3FD6] text-white flex items-center justify-center text-xl font-bold">
                    📱
                  </div>
                  <div>
                    <span className="font-extrabold text-sm text-white block">
                      Paytm / UPI QR Code
                    </span>
                    <span className="text-[11px] text-[#F5C451] font-semibold">
                      Selected by Default • Instant Payment
                    </span>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === "QR" ? "border-[#F5C451] bg-[#F5C451]" : "border-slate-500"
                }`}>
                  {paymentMethod === "QR" && <span className="text-[10px] text-black font-black">✓</span>}
                </div>
              </div>

              {/* Scan & Pay Details */}
              <div className="pt-2 text-center space-y-3">
                <span className="inline-block px-3 py-1 bg-[#6D3FD6]/30 border border-[#6D3FD6]/50 rounded-full text-xs font-bold text-[#F5C451]">
                  Scan & Pay
                </span>

                <div className="inline-block bg-white p-4 rounded-3xl shadow-2xl border-4 border-[#F5C451]">
                  {qrAccount?.qrImage ? (
                    <img
                      src={qrAccount.qrImage}
                      alt="Merchant UPI QR Code"
                      className="w-48 h-48 object-contain mx-auto"
                    />
                  ) : (
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(dynamicUpiUri)}`}
                      alt="Merchant UPI QR Code"
                      className="w-48 h-48 object-contain mx-auto"
                    />
                  )}
                </div>

                <div className="space-y-1 text-xs text-slate-300">
                  <p>Merchant: <strong className="text-white">{settings.storeName}</strong></p>
                  <p>UPI ID: <strong className="text-[#F5C451] font-mono">{upiIdToUse}</strong></p>
                  <p className="text-sm pt-1">
                    Payment Amount: <strong className="text-lg text-[#F5C451] font-black font-display">₹{grandTotalAmount.toLocaleString("en-IN")}</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* OTHER PAYMENT OPTIONS SECTION */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-extrabold text-[#F5C451] uppercase tracking-wider">
                Other Payment Options
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* BHIM Button */}
                <button
                  type="button"
                  onClick={() => handleAppTap("BHIM")}
                  className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center space-y-1.5 cursor-pointer ${
                    paymentMethod === "BHIM"
                      ? "border-[#6D3FD6] bg-[#6D3FD6]/30 ring-2 ring-[#6D3FD6]"
                      : "border-white/10 bg-[#080B1A] hover:border-purple-500/40"
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-black text-amber-400 text-xs">
                    BHIM
                  </div>
                  <span className="font-bold text-xs text-white">BHIM</span>
                </button>

                {/* Google Pay Button */}
                <button
                  type="button"
                  onClick={() => handleAppTap("GPAY")}
                  className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center space-y-1.5 cursor-pointer ${
                    paymentMethod === "GPAY"
                      ? "border-[#6D3FD6] bg-[#6D3FD6]/30 ring-2 ring-[#6D3FD6]"
                      : "border-white/10 bg-[#080B1A] hover:border-purple-500/40"
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center font-black text-blue-400 text-xs">
                    GPay
                  </div>
                  <span className="font-bold text-xs text-white">Google Pay</span>
                </button>

                {/* PhonePe Button */}
                <button
                  type="button"
                  onClick={() => handleAppTap("PHONEPE")}
                  className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center space-y-1.5 cursor-pointer ${
                    paymentMethod === "PHONEPE"
                      ? "border-[#6D3FD6] bg-[#6D3FD6]/30 ring-2 ring-[#6D3FD6]"
                      : "border-white/10 bg-[#080B1A] hover:border-purple-500/40"
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center font-black text-purple-300 text-xs">
                    PhonePe
                  </div>
                  <span className="font-bold text-xs text-white">PhonePe</span>
                </button>

                {/* Paytm Button */}
                <button
                  type="button"
                  onClick={() => handleAppTap("PAYTM")}
                  className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center space-y-1.5 cursor-pointer ${
                    paymentMethod === "PAYTM"
                      ? "border-[#6D3FD6] bg-[#6D3FD6]/30 ring-2 ring-[#6D3FD6]"
                      : "border-white/10 bg-[#080B1A] hover:border-purple-500/40"
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center font-black text-cyan-300 text-xs">
                    Paytm
                  </div>
                  <span className="font-bold text-xs text-white">Paytm</span>
                </button>
              </div>
            </div>

            {/* App Not Installed / Desktop Warning Box */}
            {appNotice && (
              <div className="p-4 bg-amber-950/40 border border-amber-500/40 rounded-2xl space-y-2 text-center text-xs">
                <p className="font-extrabold text-[#F5C451]">
                  ⚠️ {appNotice}
                </p>
                <div className="flex flex-wrap justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod("QR");
                      setAppNotice(null);
                    }}
                    className="px-3.5 py-1.5 bg-[#6D3FD6] text-white font-bold rounded-xl text-xs cursor-pointer hover:bg-[#5B21B6]"
                  >
                    Scan QR Code Instead
                  </button>
                  <button
                    type="button"
                    onClick={() => setAppNotice(null)}
                    className="px-3.5 py-1.5 bg-white/10 text-slate-300 font-bold rounded-xl text-xs cursor-pointer hover:bg-white/20"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {/* Global Error Banner */}
            {globalError && (
              <div className="p-4 bg-red-950/40 border border-red-500/40 rounded-2xl text-center">
                <p className="text-xs font-extrabold text-red-400">
                  ⚠️ {globalError}
                </p>
              </div>
            )}

            {/* Submit & Complete Order Button */}
            <button
              type="submit"
              disabled={loading || items.length === 0}
              className="w-full py-4 mt-6 bg-[#6D3FD6] hover:bg-[#5B21B6] text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-purple-900/40"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Processing Order...
                </span>
              ) : (
                <span>Complete Order ₹{grandTotalAmount.toLocaleString("en-IN")} →</span>
              )}
            </button>

            <div className="text-center text-[10px] text-slate-400 space-y-1 pt-1">
              <p>🔒 Safe & Verified Festive Order Checkout</p>
              <p>⚡ Direct Sivakasi Factory Wholesale Price & Quality Guarantee</p>
            </div>
          </div>

        </form>
      </main>

      <Footer settings={settings} />
    </div>
  );
}
