"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import { isValidCustomerName } from "@/lib/payment-utils";
import { createOrderAction } from "@/lib/actions";

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

function isValidGmailFormat(val: string): boolean {
  if (!val) return false;
  const clean = val.trim().toLowerCase();
  // Requires a valid domain ending with a complete TLD like .com, .in, .co.in, .org, .net
  return /^[a-z0-9._%+-]+@[a-z0-9.-]+\.(com|in|co\.in|org|net|edu|gov)$/.test(clean);
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart, isMounted } = useCart();
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

  // Fetch Store Settings on Mount
  useEffect(() => {
    fetch("/api/settings", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) setSettings(data);
      })
      .catch(console.error);
  }, []);

  // Redirect to cart if empty or minimum purchase amount not met
  useEffect(() => {
    if (!isMounted) return;
    const rawMin = Number(settings.minOrderAmount);
    const minOrder = !isNaN(rawMin) && rawMin >= 0 ? rawMin : 500;
    if (items.length === 0 || subtotal < minOrder) {
      router.push("/cart");
    }
  }, [isMounted, items, subtotal, settings.minOrderAmount, router]);

  // Reactive PIN Code Lookup Effect (6 Digits Only & Tamil Nadu Verification)
  useEffect(() => {
    const cleaned = pincode.trim().replace(/[^0-9]/g, "").slice(0, 6);

    if (cleaned.length !== 6) return;

    // Strict Tamil Nadu PIN Code Prefix Check (60xxxx - 64xxxx)
    const tnPrefixes = ["60", "61", "62", "63", "64"];
    const prefix2 = cleaned.slice(0, 2);
    if (!tnPrefixes.includes(prefix2)) {
      setPinError("⚠️ Invalid Tamil Nadu PIN code. Only Tamil Nadu PIN codes (60xxxx - 64xxxx) are accepted.");
      setPinVerifiedInfo(null);
      setAutoFilledPin(null);
      setCity("");
      setDistrict("");
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

        // Check if verified AND state is Tamil Nadu
        const stateNorm = (data?.state || "").toLowerCase().replace(/[^a-z]/g, "");
        const isTN = stateNorm.includes("tamil") || stateNorm.includes("tn");

        if (data && data.valid && isTN) {
          setPinVerifiedInfo(data);
          setAutoFilledPin(cleaned);

          if (data.city) setCity(data.city);
          if (data.district) setDistrict(data.district);
          setState("Tamil Nadu");

          setErrors((prev) => {
            const copy = { ...prev };
            delete copy.pincode;
            delete copy.city;
            delete copy.district;
            return copy;
          });
        } else {
          setPinError("⚠️ Invalid Tamil Nadu PIN code. Only Tamil Nadu PIN codes (60xxxx - 64xxxx) are accepted.");
          setAutoFilledPin(null);
          setPinVerifiedInfo(null);
          setCity("");
          setDistrict("");
        }
      })
      .catch((err) => {
        if (!isCurrent) return;
        if (err.name !== "AbortError") {
          setPinLoading(false);
          setPinError("⚠️ Invalid Tamil Nadu PIN code. Please enter a valid 6-digit Tamil Nadu PIN code.");
          setAutoFilledPin(null);
          setPinVerifiedInfo(null);
          setCity("");
          setDistrict("");
        }
      });

    return () => {
      isCurrent = false;
      controller.abort();
    };
  }, [pincode, autoFilledPin]);

  // Input Handlers
  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
    setPincode(cleaned);

    if (!/^\d{6}$/.test(cleaned)) {
      setErrors((prev) => ({
        ...prev,
        pincode: "Enter a valid 6-digit PIN code.",
      }));
    } else {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.pincode;
        return copy;
      });
    }
    setPinError("");

    if (cleaned.length !== 6 || cleaned !== autoFilledPin) {
      setCity("");
      setDistrict("");
      setState("Tamil Nadu");
      setAutoFilledPin(null);
      setPinVerifiedInfo(null);
    }
  };

  const handleNameInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomerName(val);

    if (!val || val.trim().length < 2) {
      setErrors((prev) => ({
        ...prev,
        name: "Please enter your full name (minimum 2 characters).",
      }));
    } else if (!isValidCustomerName(val)) {
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

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "").slice(0, 10);
    setPhone(raw);

    if (!raw || raw.length === 0) {
      setErrors((prev) => ({
        ...prev,
        phone: "Please enter your 10-digit mobile number.",
      }));
    } else if (raw.length < 10) {
      const needed = 10 - raw.length;
      setErrors((prev) => ({
        ...prev,
        phone: `Please enter all 10 digits (${needed} digit${needed === 1 ? "" : "s"} remaining).`,
      }));
    } else {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.phone;
        return copy;
      });
    }
  };

  const handleEmailInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase();
    setEmail(val);

    if (!val || val.trim().length === 0) {
      setErrors((prev) => ({
        ...prev,
        email: "Please enter your email address (lowercase only).",
      }));
    } else if (!isValidGmailFormat(val)) {
      setErrors((prev) => ({
        ...prev,
        email: "Please enter a valid lowercase email (e.g. name@gmail.com).",
      }));
    } else {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.email;
        return copy;
      });
    }
  };

  const handleAddressInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setAddress(val);

    if (!val || val.trim().length < 5) {
      setErrors((prev) => ({
        ...prev,
        address: "Please enter street address / pickup note (minimum 5 characters).",
      }));
    } else {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.address;
        return copy;
      });
    }
  };

  const handleCityInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCity(val);
    if (!val || val.trim().length < 2) {
      setErrors((prev) => ({
        ...prev,
        city: "Please enter City / Town.",
      }));
    } else {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.city;
        return copy;
      });
    }
  };

  const handleDistrictInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDistrict(val);
    if (!val || val.trim().length < 2) {
      setErrors((prev) => ({
        ...prev,
        district: "Please enter District.",
      }));
    } else {
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
      newErrors.name = "Please enter your full name (letters and spaces only).";
    }

    if (!phone || phone.length !== 10) {
      const needed = 10 - (phone ? phone.length : 0);
      newErrors.phone = `Please enter a valid 10-digit mobile number (${needed} digit${needed === 1 ? "" : "s"} remaining).`;
    }

    if (!email || !isValidGmailFormat(email)) {
      newErrors.email = "Please enter a valid lowercase email address (e.g. name@gmail.com).";
    }

    if (!address || address.trim().length < 5) {
      newErrors.address = "Please enter street address / pickup note (minimum 5 characters).";
    }

    if (!pincode || pincode.length !== 6) {
      const needed = 6 - (pincode ? pincode.length : 0);
      newErrors.pincode = `Please enter a 6-digit PIN code (${needed} digit${needed === 1 ? "" : "s"} remaining).`;
    } else if (pinError) {
      newErrors.pincode = pinError;
    }

    if (!city || city.trim().length < 2) {
      newErrors.city = "Please enter City / Town.";
    }

    if (!district || district.trim().length < 2) {
      newErrors.district = "Please enter District.";
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

  const grandTotalAmount = subtotal;

  // 3-Second Processing Overlay State
  const [processingOverlay, setProcessingOverlay] = useState<{
    active: boolean;
    orderId: number | null;
    progress: number;
    stepText: string;
  }>({
    active: false,
    orderId: null,
    progress: 0,
    stepText: "Processing & Verifying Order...",
  });

  // Form Submit Handler
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
        paymentMethod: "DIRECT_ORDER",
        cartItems: items.map((item) => ({
          productId: item.id,
          quantity: item.cartQuantity,
        })),
      });

      setLoading(false);

      if (result.error) {
        setGlobalError(result.error);
        return;
      }

      if (result.success && result.orderId) {
        // Trigger 3-Second Celebratory Processing Modal
        setProcessingOverlay({
          active: true,
          orderId: result.orderId,
          progress: 0,
          stepText: "Processing & Verifying Order Details...",
        });

        const startTime = Date.now();
        const duration = 3000; // Exactly 3 seconds

        const interval = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const pct = Math.min(100, Math.floor((elapsed / duration) * 100));

          let currentStep = "Processing & Verifying Order Details...";
          if (pct >= 33 && pct < 66) {
            currentStep = `Registering Sivakasi Booking #${result.orderId}...`;
          } else if (pct >= 66) {
            currentStep = "Generating Invoice & Summary Image...";
          }

          setProcessingOverlay({
            active: true,
            orderId: result.orderId,
            progress: pct,
            stepText: currentStep,
          });

          if (elapsed >= duration) {
            clearInterval(interval);
            clearCart();
            router.push(`/order-confirmation/${result.orderId}?autoWhatsapp=true`);
          }
        }, 50);

        return;
      }

      setGlobalError("Failed to place order. Please try again.");
    } catch (err: any) {
      console.error("Order creation error:", err);
      setGlobalError("An unexpected error occurred while placing your order.");
      setLoading(false);
    }
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center">
        <div className="animate-spin text-4xl">🎆</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-[#6D3FD6] selection:text-white">
      <Header settings={settings} />

      {/* Light Theme Checkout Page Header */}
      <div className="bg-white text-slate-900 py-6 sm:py-8 border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-[#6D3FD6] text-xs font-bold uppercase tracking-wider mb-1">
            <Link href="/" className="hover:underline">Home</Link>
            <span>/</span>
            <Link href="/cart" className="hover:underline">Cart</Link>
            <span>/</span>
            <span>Checkout</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
            Place Your Order
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Fast & easy order placement. Factory wholesale Sivakasi fireworks delivered to your doorstep or collected at shop.
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full">
        <form onSubmit={handleSubmitOrder} className="max-w-3xl mx-auto space-y-6 sm:space-y-8" noValidate>
          
          {/* Section 1: Customer Contact Information */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl space-y-5">
            <h2 className="text-sm font-black text-slate-900 border-b border-slate-200 pb-3 uppercase tracking-wider flex items-center gap-2 font-display">
              <span className="w-6 h-6 rounded-full bg-[#6D3FD6] text-white text-xs flex items-center justify-center font-bold">1</span>
              Customer Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  ref={nameRef}
                  type="text"
                  required
                  placeholder="E.g. Abinesh Kumar"
                  value={customerName}
                  onChange={handleNameInput}
                  aria-invalid={errors.name ? "true" : "false"}
                  aria-describedby={errors.name ? "name-error" : undefined}
                  className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                    errors.name ? "border-red-500 ring-1 ring-red-500 bg-red-50" : "border-slate-200 focus:ring-[#6D3FD6] focus:border-[#6D3FD6]"
                  }`}
                />
                {errors.name && (
                  <span id="name-error" className="text-[11px] font-bold text-red-600 mt-1 block">
                    {errors.name}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Mobile Number (10 Digits) *
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 bg-slate-100 text-slate-700 font-bold text-xs">
                    +91
                  </span>
                  <input
                    ref={phoneRef}
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="9629525907"
                    value={phone}
                    onChange={handlePhoneInput}
                    aria-invalid={errors.phone ? "true" : "false"}
                    aria-describedby={errors.phone ? "phone-error" : undefined}
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-r-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                      errors.phone ? "border-red-500 ring-1 ring-red-500 bg-red-50" : "border-slate-200 focus:ring-[#6D3FD6] focus:border-[#6D3FD6]"
                    }`}
                  />
                </div>
                {errors.phone && (
                  <span id="phone-error" className="text-[11px] font-bold text-red-600 mt-1 block">
                    {errors.phone}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <input
                  ref={emailRef}
                  type="email"
                  required
                  placeholder="yourname@gmail.com"
                  value={email}
                  onChange={handleEmailInput}
                  aria-invalid={errors.email ? "true" : "false"}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                    errors.email ? "border-red-500 ring-1 ring-red-500 bg-red-50" : "border-slate-200 focus:ring-[#6D3FD6] focus:border-[#6D3FD6]"
                  }`}
                />
                {errors.email && (
                  <span id="email-error" className="text-[11px] font-bold text-red-600 mt-1 block">
                    {errors.email}
                  </span>
                )}
              </div>

            </div>
          </div>

          {/* Section 2: Delivery / Pickup Address */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl space-y-5">
            <h2 className="text-sm font-black text-slate-900 border-b border-slate-200 pb-3 uppercase tracking-wider flex items-center gap-2 font-display">
              <span className="w-6 h-6 rounded-full bg-[#6D3FD6] text-white text-xs flex items-center justify-center font-bold">2</span>
              Delivery Address / Shop Pickup Note
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Street Address / Shop Pickup Note *
                </label>
                <textarea
                  ref={addressRef}
                  required
                  rows={3}
                  placeholder="Door No, Street Name, Landmark (or enter 'Shop Pickup Sivakasi')"
                  value={address}
                  onChange={handleAddressInput}
                  aria-invalid={errors.address ? "true" : "false"}
                  aria-describedby={errors.address ? "address-error" : undefined}
                  className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                    errors.address ? "border-red-500 ring-1 ring-red-500 bg-red-50" : "border-slate-200 focus:ring-[#6D3FD6] focus:border-[#6D3FD6]"
                  }`}
                />
                {errors.address && (
                  <span id="address-error" className="text-[11px] font-bold text-red-600 mt-1 block">
                    {errors.address}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Landmark (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Near Bus Stand"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D3FD6] focus:border-[#6D3FD6]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  State *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value="Tamil Nadu"
                    className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 cursor-not-allowed select-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-extrabold text-[#6D3FD6] bg-purple-100 border border-purple-200 px-2 py-0.5 rounded-full">
                    Fixed (TN Only)
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  PIN Code (6 Digits) *
                </label>
                <input
                  ref={pinRef}
                  type="text"
                  required
                  maxLength={6}
                  placeholder="626123"
                  value={pincode}
                  onChange={handlePincodeChange}
                  aria-invalid={errors.pincode ? "true" : "false"}
                  aria-describedby={errors.pincode ? "pincode-error" : undefined}
                  className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                    errors.pincode ? "border-red-500 ring-1 ring-red-500 bg-red-50" : "border-slate-200 focus:ring-[#6D3FD6] focus:border-[#6D3FD6]"
                  }`}
                />
                
                <div className="mt-1.5 text-xs font-bold">
                  {pinLoading && (
                    <span className="text-[#6D3FD6] animate-pulse flex items-center gap-1 text-[11px] mt-1">
                      <span className="w-2 h-2 rounded-full bg-[#6D3FD6] animate-ping" />
                      Detecting location...
                    </span>
                  )}
                  {pinError && (
                    <span className="text-red-600 block bg-red-50 p-2 rounded-lg border border-red-200 text-[11px] mt-1">
                      {pinError}
                    </span>
                  )}
                  {errors.pincode && !pinError && (
                    <span id="pincode-error" className="text-red-600 block text-[11px] mt-1">
                      {errors.pincode}
                    </span>
                  )}
                  {pinVerifiedInfo && pinVerifiedInfo.valid && (
                    <div className="text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 text-[11px] space-y-0.5 mt-1">
                      <span className="font-extrabold flex items-center gap-1">
                        ✓ Pincode verified
                      </span>
                      <div>City: {pinVerifiedInfo.city} (Auto-detected)</div>
                      <div>District: {pinVerifiedInfo.district} (Auto-detected)</div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
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
                  className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                    errors.city ? "border-red-500 ring-1 ring-red-500 bg-red-50" : "border-slate-200 focus:ring-[#6D3FD6] focus:border-[#6D3FD6]"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                />
                {errors.city && (
                  <span id="city-error" className="text-[11px] font-bold text-red-600 mt-1 block">
                    {errors.city}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
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
                  className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                    errors.district ? "border-red-500 ring-1 ring-red-500 bg-red-50" : "border-slate-200 focus:ring-[#6D3FD6] focus:border-[#6D3FD6]"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                />
                {errors.district && (
                  <span id="district-error" className="text-[11px] font-bold text-red-600 mt-1 block">
                    {errors.district}
                  </span>
                )}
              </div>

            </div>
          </div>

          {/* Section 3: Order Summary & Place Order Button */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl space-y-6">
            <h2 className="text-sm font-black text-slate-900 border-b border-slate-200 pb-3 uppercase tracking-wider flex items-center gap-2 font-display">
              <span className="w-6 h-6 rounded-full bg-[#6D3FD6] text-white text-xs flex items-center justify-center font-bold">3</span>
              Order Summary
            </h2>

            <div className="space-y-2 text-xs font-semibold text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex justify-between">
                <span>Items Total ({items.reduce((acc, item) => acc + item.cartQuantity, 0)} items):</span>
                <span className="font-bold text-slate-900">₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span>Shipping / Transport:</span>
                <span className="font-bold text-[#6D3FD6] text-xs">
                  Discussed via WhatsApp / Store Pickup
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-black text-slate-900">
                <span>Product Total Amount:</span>
                <span className="text-[#6D3FD6]">₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Shipping & Pickup Note Box */}
            <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-2xl text-xs space-y-1">
              <div className="font-bold text-[#6D3FD6] flex items-center gap-1.5">
                <span>💬 Store Pickup & Delivery Note:</span>
              </div>
              <p className="text-slate-600 leading-relaxed font-normal">
                Once your order is processed and ready, our team will notify you via WhatsApp / Call. You can pick it up directly from our Sivakasi shop with 0 extra charges, or we will assist in arranging outstation parcel transport.
              </p>
            </div>

            {/* Global Error Banner */}
            {globalError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-center">
                <p className="text-xs font-extrabold text-red-700">
                  ⚠️ {globalError}
                </p>
              </div>
            )}

            {/* Place Order Button */}
            <button
              type="submit"
              disabled={loading || items.length === 0}
              className="w-full py-4 bg-[#6D3FD6] hover:bg-[#5B21B6] text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-purple-200"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Placing Order...
                </span>
              ) : (
                <span>Place Order (Product Total ₹{subtotal.toLocaleString("en-IN")}) →</span>
              )}
            </button>

            <div className="text-center text-[10px] text-slate-400 space-y-1 pt-1">
              <p>🔒 Fast & Direct Order Placement</p>
              <p>⚡ Genuine Sivakasi Factory Quality Guarantee</p>
            </div>
          </div>

        </form>
      </main>

      <Footer settings={settings} />

      {/* 3-Second Celebratory Processing Modal Overlay */}
      {processingOverlay.active && (
        <div className="fixed inset-0 z-50 bg-[#080B1A]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white space-y-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#6D3FD6] via-[#8B5CF6] to-[#F5C451] flex items-center justify-center text-5xl shadow-2xl animate-bounce">
              🎆
            </div>
            <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-xs font-bold text-white animate-pulse">
              ✓
            </span>
          </div>

          <div className="space-y-2 max-w-sm">
            <h2 className="text-2xl sm:text-3xl font-black text-[#F5C451] uppercase font-display tracking-tight">
              Order Placed! 🎉
            </h2>
            <p className="text-xs text-slate-300 font-bold animate-pulse">
              {processingOverlay.stepText}
            </p>
          </div>

          {/* Fast 3-Second Progress Bar */}
          <div className="w-full max-w-xs space-y-1.5">
            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-white/10">
              <div
                className="bg-gradient-to-r from-[#6D3FD6] via-purple-400 to-[#F5C451] h-full rounded-full transition-all duration-75 ease-linear"
                style={{ width: `${processingOverlay.progress}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-mono text-slate-400 font-bold px-1">
              <span>Packing Order</span>
              <span className="text-[#F5C451]">{processingOverlay.progress}%</span>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 font-medium pt-2">
            Redirecting to Order Summary & Sending Invoice...
          </p>
        </div>
      )}
    </div>
  );
}
