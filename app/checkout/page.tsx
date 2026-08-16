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
  const trimmed = val.trim();
  if (!trimmed.includes("@") || !trimmed.includes(".")) return false;
  const parts = trimmed.split("@");
  if (parts.length !== 2) return false;
  const domain = parts[1];
  return domain.includes(".") && domain.split(".")[1].length >= 2;
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
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) setSettings(data);
      })
      .catch(console.error);
  }, []);

  // Reactive PIN Code Lookup Effect (6 Digits Only)
  useEffect(() => {
    const cleaned = pincode.trim().replace(/[^0-9]/g, "");

    if (cleaned.length !== 6) return;
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
  }, [pincode, autoFilledPin]);

  // Input Handlers
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

  const handleNameInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomerName(val);

    if (!val || val.trim().length === 0) return;

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
        clearCart();
        router.push(`/order-confirmation/${result.orderId}`);
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
            Fast & easy order placement. Factory wholesale Sivakasi fireworks delivered to your doorstep.
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full">
        <form onSubmit={handleSubmitOrder} className="max-w-3xl mx-auto space-y-6 sm:space-y-8" noValidate>
          
          {/* Section 1: Customer Contact Information */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl space-y-5">
            <h2 className="text-sm font-black text-slate-900 border-b border-slate-200 pb-3 uppercase tracking-wider flex items-center gap-2 font-display">
              <span className="w-6 h-6 rounded-full bg-[#6D3FD6] text-white text-xs flex items-center justify-center font-bold">1</span>
              Customer Contact Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Full Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
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
                  className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                    errors.name ? "border-red-500 ring-1 ring-red-500 bg-red-50" : "border-slate-200 focus:ring-[#6D3FD6] focus:border-[#6D3FD6]"
                  }`}
                />
                {errors.name ? (
                  <span id="name-error" className="text-[11px] font-bold text-red-600 mt-1 block">
                    {errors.name}
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Accepts letters (A-Z, a-z) and spaces only. E.g. Abinesh N, Ravi Kumar
                  </span>
                )}
              </div>

              {/* Mobile Input */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
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
                  className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                    errors.phone ? "border-red-500 ring-1 ring-red-500 bg-red-50" : "border-slate-200 focus:ring-[#6D3FD6] focus:border-[#6D3FD6]"
                  }`}
                />
                <span className="text-[10px] text-slate-400 mt-1 block">10-digit Indian mobile number</span>

                {errors.phone && (
                  <span id="phone-error" className="text-[11px] font-bold text-red-600 mt-1 block">
                    {errors.phone}
                  </span>
                )}
              </div>

              {/* Email Address Input */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
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
                  className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                    errors.email ? "border-red-500 ring-1 ring-red-500 bg-red-50" : "border-slate-200 focus:ring-[#6D3FD6] focus:border-[#6D3FD6]"
                  }`}
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Order updates & receipt sent here</span>

                {errors.email && (
                  <span id="email-error" className="text-[11px] font-bold text-red-600 mt-1 block">
                    {errors.email}
                  </span>
                )}
              </div>

            </div>
          </div>

          {/* Section 2: Address & PIN Code */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl space-y-5">
            <h2 className="text-sm font-black text-slate-900 border-b border-slate-200 pb-3 uppercase tracking-wider flex items-center gap-2 font-display">
              <span className="w-6 h-6 rounded-full bg-[#6D3FD6] text-white text-xs flex items-center justify-center font-bold">2</span>
              Delivery Address & Smart Postal Auto-Fill
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
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
                  className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                    errors.address ? "border-red-500 ring-1 ring-red-500 bg-red-50" : "border-slate-200 focus:ring-[#6D3FD6] focus:border-[#6D3FD6]"
                  }`}
                />
                {errors.address && (
                  <span id="address-error" className="text-[11px] font-bold text-red-600 mt-1 block">
                    {errors.address}
                  </span>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Address Line 2 / Landmark (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Near Bus Stand / Opposite SBI Bank"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6D3FD6]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  State *
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D3FD6]"
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st} className="bg-white text-slate-900">{st}</option>
                  ))}
                </select>
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
                  placeholder="641001"
                  value={pincode}
                  onChange={handlePincodeChange}
                  aria-invalid={errors.pincode ? "true" : "false"}
                  aria-describedby={errors.pincode ? "pincode-error" : undefined}
                  className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-900 font-mono focus:outline-none focus:ring-2 transition-all ${
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
              <div className="flex justify-between">
                <span>Estimated Shipping Fee:</span>
                <span className="font-bold text-slate-900">
                  {subtotal >= settings.freeShippingThreshold ? "FREE" : `₹${settings.flatShippingFee}`}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-black text-slate-900">
                <span>Total Amount:</span>
                <span className="text-[#6D3FD6]">₹{grandTotalAmount.toLocaleString("en-IN")}</span>
              </div>
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
                <span>Place Order ₹{grandTotalAmount.toLocaleString("en-IN")} →</span>
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
    </div>
  );
}
