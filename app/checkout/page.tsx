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

function isValidGmailFormat(val: string): boolean {
  if (!val) return false;
  const clean = val.trim().toLowerCase();
  return /^[a-z0-9._%+-]+@[a-z0-9.-]+\.(com|in|co\.in|org|net|edu|gov)$/.test(clean);
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart, isMounted } = useCart();
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);

  // ─── Order Type ───────────────────────────────────────────────────────────
  const [orderType, setOrderType] = useState<"DELIVERY" | "PICKUP">("DELIVERY");

  // ─── Form Fields ──────────────────────────────────────────────────────────
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [pincode, setPincode] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("Tamil Nadu");

  // ─── Pincode Lookup ───────────────────────────────────────────────────────
  const [pinLoading, setPinLoading] = useState(false);
  const [pinVerifiedInfo, setPinVerifiedInfo] = useState<{
    valid: boolean;
    city?: string;
    district?: string;
    state?: string;
    postOffices?: string[];
  } | null>(null);
  const [pinError, setPinError] = useState("");
  const [autoFilledPin, setAutoFilledPin] = useState<string | null>(null);
  const [showAllAreas, setShowAllAreas] = useState(false);

  // ─── Refs ─────────────────────────────────────────────────────────────────
  const nameRef = useRef<HTMLInputElement | null>(null);
  const phoneRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const addressRef = useRef<HTMLTextAreaElement | null>(null);
  const pinRef = useRef<HTMLInputElement | null>(null);
  const cityRef = useRef<HTMLInputElement | null>(null);
  const districtRef = useRef<HTMLInputElement | null>(null);

  // ─── State ────────────────────────────────────────────────────────────────
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");

  // ─── Settings Load ────────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/settings", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => { if (data && !data.error) setSettings(data); })
      .catch(console.error);
  }, []);

  // ─── Cart Guard ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isMounted) return;
    const rawMin = Number(settings.minOrderAmount);
    const minOrder = !isNaN(rawMin) && rawMin >= 0 ? rawMin : 500;
    if (items.length === 0 || subtotal < minOrder) {
      router.push("/cart");
    }
  }, [isMounted, items, subtotal, settings.minOrderAmount, router]);

  // ─── PIN Code Lookup (DELIVERY only) ─────────────────────────────────────
  useEffect(() => {
    if (orderType !== "DELIVERY") return;
    const cleaned = pincode.trim().replace(/[^0-9]/g, "").slice(0, 6);
    if (cleaned.length !== 6) {
      if (autoFilledPin !== null) {
        setAutoFilledPin(null);
        setPinVerifiedInfo(null);
        setCity("");
        setDistrict("");
        setLandmark("");
        setShowAllAreas(false);
      }
      return;
    }
    if (cleaned === autoFilledPin) return;
    setPinLoading(true);
    setPinError("");
    setPinVerifiedInfo(null);
    const controller = new AbortController();
    let isCurrent = true;
    fetch(`/api/pincode?pin=${cleaned}&tnOnly=true`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        if (!isCurrent) return;
        setPinLoading(false);
        if (data && data.valid && data.isTamilNadu !== false) {
          setPinVerifiedInfo(data);
          setAutoFilledPin(cleaned);
          if (data.city) setCity(data.city);
          if (data.district) setDistrict(data.district);
          setState("Tamil Nadu");
          setErrors((prev) => { const c = { ...prev }; delete c.pincode; delete c.city; delete c.district; return c; });
        } else {
          setPinError(data?.error || "⚠️ Invalid Tamil Nadu PIN code. Only valid Tamil Nadu PIN codes are accepted.");
          setAutoFilledPin(null); setPinVerifiedInfo(null); setCity(""); setDistrict(""); setLandmark(""); setShowAllAreas(false);
        }
      })
      .catch((err) => {
        if (!isCurrent) return;
        if (err.name !== "AbortError") {
          setPinLoading(false);
          setPinError("⚠️ Unable to detect PIN code. Please enter a valid 6-digit Tamil Nadu PIN code.");
          setAutoFilledPin(null); setPinVerifiedInfo(null); setCity(""); setDistrict(""); setLandmark(""); setShowAllAreas(false);
        }
      });
    return () => { isCurrent = false; controller.abort(); };
  }, [pincode, autoFilledPin, orderType]);

  // ─── Input Handlers ───────────────────────────────────────────────────────
  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
    setPincode(cleaned);
    if (!/^\d{6}$/.test(cleaned)) {
      setErrors((prev) => ({ ...prev, pincode: "Enter a valid 6-digit PIN code." }));
    } else {
      setErrors((prev) => { const c = { ...prev }; delete c.pincode; return c; });
    }
    setPinError("");
    if (cleaned.length !== 6 || cleaned !== autoFilledPin) {
      setCity(""); setDistrict(""); setLandmark(""); setShowAllAreas(false);
      setState("Tamil Nadu"); setAutoFilledPin(null); setPinVerifiedInfo(null);
    }
  };

  const handleNameInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomerName(val);
    if (!val || val.trim().length < 2) setErrors((p) => ({ ...p, name: "Please enter your full name (minimum 2 characters)." }));
    else if (!isValidCustomerName(val)) setErrors((p) => ({ ...p, name: "Name can contain letters and spaces only." }));
    else setErrors((p) => { const c = { ...p }; delete c.name; return c; });
  };

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "").slice(0, 10);
    setPhone(raw);
    if (!raw || raw.length === 0) setErrors((p) => ({ ...p, phone: "Please enter your 10-digit mobile number." }));
    else if (raw.length < 10) { const n = 10 - raw.length; setErrors((p) => ({ ...p, phone: `Please enter all 10 digits (${n} digit${n === 1 ? "" : "s"} remaining).` })); }
    else setErrors((p) => { const c = { ...p }; delete c.phone; return c; });
  };

  const handleEmailInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase();
    setEmail(val);
    if (!val || val.trim().length === 0) setErrors((p) => ({ ...p, email: "Please enter your email address (lowercase only)." }));
    else if (!isValidGmailFormat(val)) setErrors((p) => ({ ...p, email: "Please enter a valid lowercase email (e.g. name@gmail.com)." }));
    else setErrors((p) => { const c = { ...p }; delete c.email; return c; });
  };

  const handleAddressInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setAddress(val);
    if (!val || val.trim().length < 5) setErrors((p) => ({ ...p, address: "Please enter your street address (minimum 5 characters)." }));
    else setErrors((p) => { const c = { ...p }; delete c.address; return c; });
  };

  const handleCityInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value; setCity(val);
    if (!val || val.trim().length < 2) setErrors((p) => ({ ...p, city: "Please enter City / Town." }));
    else setErrors((p) => { const c = { ...p }; delete c.city; return c; });
  };

  const handleDistrictInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value; setDistrict(val);
    if (!val || val.trim().length < 2) setErrors((p) => ({ ...p, district: "Please enter District." }));
    else setErrors((p) => { const c = { ...p }; delete c.district; return c; });
  };

  // ─── Validation ───────────────────────────────────────────────────────────
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

    // Address fields only required for DELIVERY
    if (orderType === "DELIVERY") {
      if (!address || address.trim().length < 5) {
        newErrors.address = "Please enter your delivery address (minimum 5 characters).";
      }
      if (!pincode || pincode.length !== 6) {
        const needed = 6 - (pincode ? pincode.length : 0);
        newErrors.pincode = `Please enter a 6-digit PIN code (${needed} digit${needed === 1 ? "" : "s"} remaining).`;
      } else if (pinError) {
        newErrors.pincode = pinError;
      }
      if (!city || city.trim().length < 2) newErrors.city = "Please enter City / Town.";
      if (!district || district.trim().length < 2) newErrors.district = "Please enter District.";
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

  // ─── Processing Overlay ───────────────────────────────────────────────────
  const [processingOverlay, setProcessingOverlay] = useState<{
    active: boolean;
    orderId: number | null;
    progress: number;
    stepText: string;
  }>({ active: false, orderId: null, progress: 0, stepText: "Processing & Verifying Order..." });

  // ─── Submit Handler ───────────────────────────────────────────────────────
  const handleSubmitOrder = async (selectedOrderType: "DELIVERY" | "PICKUP") => {
    setGlobalError("");
    if (!validateForm()) return;
    if (items.length === 0) { setGlobalError("Your shopping cart is empty."); return; }

    // Prevent double-submission
    setLoading(true);

    try {
      const result = await createOrderAction({
        customerName: customerName.trim(),
        phone: `+91${phone}`,
        email: email.trim(),
        address: selectedOrderType === "PICKUP" ? "Store Pickup" : address.trim(),
        landmark: selectedOrderType === "PICKUP" ? undefined : (landmark.trim() || undefined),
        city: selectedOrderType === "PICKUP" ? "Sivakasi" : city.trim(),
        district: selectedOrderType === "PICKUP" ? "Virudhunagar" : district.trim(),
        state: "Tamil Nadu",
        pincode: selectedOrderType === "PICKUP" ? "626123" : pincode.trim(),
        paymentMethod: "DIRECT_ORDER",
        orderType: selectedOrderType,
        cartItems: items.map((item) => ({
          productId: item.id,
          quantity: item.cartQuantity,
        })),
      });

      setLoading(false);

      if (result.error) { setGlobalError(result.error); return; }

      if (result.success && result.orderId) {
        setProcessingOverlay({
          active: true,
          orderId: result.orderId,
          progress: 0,
          stepText: "Processing & Verifying Order Details...",
        });

        const startTime = Date.now();
        const duration = 3000;

        const interval = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const pct = Math.min(100, Math.floor((elapsed / duration) * 100));

          let currentStep = "Processing & Verifying Order Details...";
          if (pct >= 33 && pct < 66) {
            currentStep = `Registering Order #${result.orderId}...`;
          } else if (pct >= 66) {
            currentStep = "Generating Order Summary Image...";
          }

          setProcessingOverlay({ active: true, orderId: result.orderId, progress: pct, stepText: currentStep });

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

      {/* Page Header */}
      <div className="bg-white text-slate-900 py-6 sm:py-8 border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-[#6D3FD6] text-xs font-bold uppercase tracking-wider mb-1">
            <Link href="/" className="hover:underline">Home</Link>
            <span>/</span>
            <Link href="/cart" className="hover:underline">Cart</Link>
            <span>/</span>
            <span>Checkout</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">Place Your Order</h1>
          <p className="text-xs text-slate-500 mt-1">
            Choose Home Delivery or Store Pickup — then fill in your details below.
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full">
        <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">

          {/* ── Section 0: Order Type Selector ── */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl space-y-4">
            <h2 className="text-sm font-black text-slate-900 border-b border-slate-200 pb-3 uppercase tracking-wider flex items-center gap-2 font-display">
              <span className="w-6 h-6 rounded-full bg-[#6D3FD6] text-white text-xs flex items-center justify-center font-bold">1</span>
              How Would You Like to Receive Your Order?
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* DELIVERY Option */}
              <button
                type="button"
                onClick={() => setOrderType("DELIVERY")}
                className={`relative p-5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  orderType === "DELIVERY"
                    ? "border-[#6D3FD6] bg-purple-50 shadow-md shadow-purple-100"
                    : "border-slate-200 bg-white hover:border-purple-300 hover:bg-purple-50/40"
                }`}
              >
                {orderType === "DELIVERY" && (
                  <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#6D3FD6] text-white flex items-center justify-center text-xs font-bold">✓</span>
                )}
                <div className="text-3xl mb-2">🚚</div>
                <div className={`font-black text-sm mb-1 ${orderType === "DELIVERY" ? "text-[#6D3FD6]" : "text-slate-800"}`}>
                  Deliver to My Home
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                  Delivery charge will be confirmed by our team after your order is received.
                </p>
              </button>

              {/* PICKUP Option */}
              <button
                type="button"
                onClick={() => setOrderType("PICKUP")}
                className={`relative p-5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  orderType === "PICKUP"
                    ? "border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-100"
                    : "border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/40"
                }`}
              >
                {orderType === "PICKUP" && (
                  <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">✓</span>
                )}
                <div className="text-3xl mb-2">🏪</div>
                <div className={`font-black text-sm mb-1 ${orderType === "PICKUP" ? "text-emerald-700" : "text-slate-800"}`}>
                  I&apos;ll Pick Up from Store
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                  Pick up from our Sivakasi shop. We&apos;ll contact you when your order is ready. No delivery charge.
                </p>
              </button>
            </div>

            {/* Selected type info banner */}
            {orderType === "DELIVERY" && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700 font-medium flex items-start gap-2">
                <span className="text-base">ℹ️</span>
                <span>You selected <strong>Home Delivery</strong>. Please fill in your delivery address below. Our team will contact you to confirm the delivery charge before processing.</span>
              </div>
            )}
            {orderType === "PICKUP" && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-medium flex items-start gap-2">
                <span className="text-base">🏪</span>
                <span>You selected <strong>Store Pickup</strong>. No delivery address needed. We&apos;ll notify you via WhatsApp when your order is ready at our Sivakasi shop.</span>
              </div>
            )}
          </div>

          {/* ── Section 1: Customer Details ── */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl space-y-5">
            <h2 className="text-sm font-black text-slate-900 border-b border-slate-200 pb-3 uppercase tracking-wider flex items-center gap-2 font-display">
              <span className="w-6 h-6 rounded-full bg-[#6D3FD6] text-white text-xs flex items-center justify-center font-bold">2</span>
              Customer Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Full Name *</label>
                <input
                  ref={nameRef}
                  type="text"
                  required
                  placeholder="E.g. Abinesh Kumar"
                  value={customerName}
                  onChange={handleNameInput}
                  aria-invalid={errors.name ? "true" : "false"}
                  className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                    errors.name ? "border-red-500 ring-1 ring-red-500 bg-red-50" : "border-slate-200 focus:ring-[#6D3FD6] focus:border-[#6D3FD6]"
                  }`}
                />
                {errors.name && <span className="text-[11px] font-bold text-red-600 mt-1 block">{errors.name}</span>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Mobile Number (10 Digits) *</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 bg-slate-100 text-slate-700 font-bold text-xs">+91</span>
                  <input
                    ref={phoneRef}
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="9629525907"
                    value={phone}
                    onChange={handlePhoneInput}
                    aria-invalid={errors.phone ? "true" : "false"}
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-r-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                      errors.phone ? "border-red-500 ring-1 ring-red-500 bg-red-50" : "border-slate-200 focus:ring-[#6D3FD6] focus:border-[#6D3FD6]"
                    }`}
                  />
                </div>
                {errors.phone && <span className="text-[11px] font-bold text-red-600 mt-1 block">{errors.phone}</span>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Email Address *</label>
                <input
                  ref={emailRef}
                  type="email"
                  required
                  placeholder="yourname@gmail.com"
                  value={email}
                  onChange={handleEmailInput}
                  aria-invalid={errors.email ? "true" : "false"}
                  className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                    errors.email ? "border-red-500 ring-1 ring-red-500 bg-red-50" : "border-slate-200 focus:ring-[#6D3FD6] focus:border-[#6D3FD6]"
                  }`}
                />
                {errors.email && <span className="text-[11px] font-bold text-red-600 mt-1 block">{errors.email}</span>}
              </div>
            </div>
          </div>

          {/* ── Section 2: Delivery Address (DELIVERY only) ── */}
          {orderType === "DELIVERY" && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl space-y-5">
              <h2 className="text-sm font-black text-slate-900 border-b border-slate-200 pb-3 uppercase tracking-wider flex items-center gap-2 font-display">
                <span className="w-6 h-6 rounded-full bg-[#6D3FD6] text-white text-xs flex items-center justify-center font-bold">3</span>
                Delivery Address
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Street Address *</label>
                  <textarea
                    ref={addressRef}
                    required
                    rows={3}
                    placeholder="Door No, Street Name, Landmark"
                    value={address}
                    onChange={handleAddressInput}
                    aria-invalid={errors.address ? "true" : "false"}
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                      errors.address ? "border-red-500 ring-1 ring-red-500 bg-red-50" : "border-slate-200 focus:ring-[#6D3FD6] focus:border-[#6D3FD6]"
                    }`}
                  />
                  {errors.address && <span className="text-[11px] font-bold text-red-600 mt-1 block">{errors.address}</span>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Landmark (Optional)</label>
                  <input
                    type="text"
                    placeholder="Near Bus Stand"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D3FD6] focus:border-[#6D3FD6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">State *</label>
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
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">PIN Code (6 Digits) *</label>
                  <input
                    ref={pinRef}
                    type="text"
                    required
                    maxLength={6}
                    placeholder="626123"
                    value={pincode}
                    onChange={handlePincodeChange}
                    aria-invalid={errors.pincode ? "true" : "false"}
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
                      <span className="text-red-600 block bg-red-50 p-2 rounded-lg border border-red-200 text-[11px] mt-1">{pinError}</span>
                    )}
                    {errors.pincode && !pinError && (
                      <span className="text-red-600 block text-[11px] mt-1">{errors.pincode}</span>
                    )}
                    {pinVerifiedInfo && pinVerifiedInfo.valid && (
                      <div className="text-emerald-800 bg-emerald-50/90 p-3 rounded-xl border border-emerald-200 text-[11px] space-y-1.5 mt-1 shadow-xs">
                        <div className="font-black flex items-center justify-between text-emerald-900">
                          <span className="flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">✓</span>
                            Tamil Nadu Location Verified
                          </span>
                          <span className="text-[10px] font-bold bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-full">India Post</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1 pt-0.5 text-[11px]">
                          <div><span className="font-bold text-slate-500">City/Town:</span> <span className="font-black text-slate-900">{pinVerifiedInfo.city}</span></div>
                          <div><span className="font-bold text-slate-500">District:</span> <span className="font-black text-slate-900">{pinVerifiedInfo.district}</span></div>
                        </div>
                        {pinVerifiedInfo.postOffices && pinVerifiedInfo.postOffices.length > 0 && (
                          <div className="pt-2 border-t border-emerald-200/60 mt-1">
                            <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 mb-1.5">
                              <span>Covered Postal Areas / Localities ({pinVerifiedInfo.postOffices.length}):</span>
                              <span className="text-[9px] text-slate-400 font-medium">Click area to fill Landmark</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5 max-h-52 overflow-y-auto pr-1">
                              {(showAllAreas ? pinVerifiedInfo.postOffices : pinVerifiedInfo.postOffices.slice(0, 6)).map((area, idx) => {
                                const isSelected = landmark.trim().toLowerCase() === area.trim().toLowerCase();
                                return (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setLandmark(area)}
                                    className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg border transition-all ${
                                      isSelected
                                        ? "bg-[#6D3FD6] text-white border-[#6D3FD6] shadow-xs"
                                        : "bg-white hover:bg-purple-50 text-slate-800 border-slate-200 hover:border-purple-300"
                                    }`}
                                  >
                                    {isSelected ? `✓ ${area}` : area}
                                  </button>
                                );
                              })}
                              {pinVerifiedInfo.postOffices.length > 6 && (
                                <button
                                  type="button"
                                  onClick={() => setShowAllAreas(!showAllAreas)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black px-2.5 py-1 rounded-lg border border-emerald-600 shadow-2xs transition-all cursor-pointer flex items-center gap-1"
                                >
                                  {showAllAreas ? "Show Less ▲" : `+${pinVerifiedInfo.postOffices.length - 6} more ▼`}
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">City / Town *</label>
                  <input
                    ref={cityRef}
                    type="text"
                    required
                    placeholder={pinLoading ? "Auto-detecting..." : "Coimbatore"}
                    disabled={pinLoading}
                    value={city}
                    onChange={handleCityInput}
                    aria-invalid={errors.city ? "true" : "false"}
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                      errors.city ? "border-red-500 ring-1 ring-red-500 bg-red-50" : "border-slate-200 focus:ring-[#6D3FD6] focus:border-[#6D3FD6]"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  />
                  {errors.city && <span className="text-[11px] font-bold text-red-600 mt-1 block">{errors.city}</span>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">District *</label>
                  <input
                    ref={districtRef}
                    type="text"
                    required
                    placeholder={pinLoading ? "Auto-detecting..." : "Coimbatore District"}
                    disabled={pinLoading}
                    value={district}
                    onChange={handleDistrictInput}
                    aria-invalid={errors.district ? "true" : "false"}
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                      errors.district ? "border-red-500 ring-1 ring-red-500 bg-red-50" : "border-slate-200 focus:ring-[#6D3FD6] focus:border-[#6D3FD6]"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  />
                  {errors.district && <span className="text-[11px] font-bold text-red-600 mt-1 block">{errors.district}</span>}
                </div>
              </div>
            </div>
          )}

          {/* ── Section 2 (Pickup): Store Info ── */}
          {orderType === "PICKUP" && (
            <div className="bg-white rounded-3xl border border-emerald-200 p-6 sm:p-8 shadow-xl space-y-4">
              <h2 className="text-sm font-black text-slate-900 border-b border-slate-200 pb-3 uppercase tracking-wider flex items-center gap-2 font-display">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">3</span>
                Store Pickup Details
              </h2>
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-emerald-800">
                  <span className="text-2xl">🏪</span>
                  <div>
                    <p className="font-black text-sm text-emerald-900">{settings.storeName}</p>
                    <p className="text-xs text-emerald-700 font-medium mt-0.5">{settings.address}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="bg-white rounded-xl p-3 border border-emerald-200 text-center">
                    <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider block">Pickup Charge</span>
                    <span className="font-black text-lg text-emerald-700">FREE</span>
                  </div>
                  <div className="bg-white rounded-xl p-3 border border-emerald-200 text-center">
                    <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider block">Contact</span>
                    <span className="font-black text-sm text-emerald-700">{settings.phone}</span>
                  </div>
                </div>
                <p className="text-[11px] text-emerald-700 font-medium bg-white border border-emerald-200 rounded-xl px-3 py-2">
                  📱 We will contact you on WhatsApp when your order is packed and ready for pickup.
                </p>
                {settings.googleMapsUrl && (
                  <a
                    href={settings.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] text-emerald-700 font-bold hover:underline"
                  >
                    📍 View Store on Google Maps →
                  </a>
                )}
              </div>
            </div>
          )}

          {/* ── Section 3: Order Summary & Place Order ── */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl space-y-6">
            <h2 className="text-sm font-black text-slate-900 border-b border-slate-200 pb-3 uppercase tracking-wider flex items-center gap-2 font-display">
              <span className="w-6 h-6 rounded-full bg-[#6D3FD6] text-white text-xs flex items-center justify-center font-bold">
                {orderType === "PICKUP" ? "4" : "4"}
              </span>
              Order Summary
            </h2>

            <div className="space-y-2 text-xs font-semibold text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex justify-between">
                <span>Items Total ({items.reduce((acc, item) => acc + item.cartQuantity, 0)} items):</span>
                <span className="font-bold text-slate-900">₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span>{orderType === "PICKUP" ? "Store Pickup:" : "Delivery Charge:"}</span>
                <span className={`font-bold text-xs ${orderType === "PICKUP" ? "text-emerald-600" : "text-amber-600"}`}>
                  {orderType === "PICKUP" ? "FREE ✓" : "To be Confirmed by Our Team"}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-black text-slate-900">
                <span>{orderType === "PICKUP" ? "Final Amount:" : "Order Value:"}</span>
                <span className="text-[#6D3FD6]">₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              {orderType === "DELIVERY" && (
                <p className="text-[10px] text-amber-600 font-bold bg-amber-50 border border-amber-200 rounded-lg px-2 py-1">
                  ⚠️ Final amount includes delivery charge which will be confirmed by our team.
                </p>
              )}
            </div>

            {/* Global Error Banner */}
            {globalError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-center">
                <p className="text-xs font-extrabold text-red-700">⚠️ {globalError}</p>
              </div>
            )}

            {/* Place Order Buttons */}
            <div className="space-y-3">
              {orderType === "DELIVERY" ? (
                <button
                  type="button"
                  id="btn-place-delivery-order"
                  onClick={() => handleSubmitOrder("DELIVERY")}
                  disabled={loading || items.length === 0}
                  className="w-full py-4 bg-[#6D3FD6] hover:bg-[#5B21B6] text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-purple-200 px-4"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Placing Order...
                    </span>
                  ) : (
                    <span className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 text-center w-full">
                      <span>🚚 Order for Home Delivery</span>
                      <span className="text-[11px] sm:text-xs text-purple-200 normal-case tracking-normal">
                        (Order Value ₹{subtotal.toLocaleString("en-IN")}) →
                      </span>
                    </span>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  id="btn-place-pickup-order"
                  onClick={() => handleSubmitOrder("PICKUP")}
                  disabled={loading || items.length === 0}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-emerald-200 px-4"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Placing Order...
                    </span>
                  ) : (
                    <span className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 text-center w-full">
                      <span>🏪 I&apos;ll Pick Up from Store</span>
                      <span className="text-[11px] sm:text-xs text-emerald-200 normal-case tracking-normal">
                        (₹{subtotal.toLocaleString("en-IN")} · Pickup FREE) →
                      </span>
                    </span>
                  )}
                </button>
              )}
            </div>

            <div className="text-center text-[10px] text-slate-400 space-y-1 pt-1">
              <p>🔒 256-Bit SSL Encrypted Checkout</p>
              <p>⚡ Genuine Sivakasi Factory Quality Guarantee</p>
            </div>
          </div>

        </div>
      </main>

      <Footer settings={settings} />

      {/* Processing Overlay */}
      {processingOverlay.active && (
        <div className="fixed inset-0 z-50 bg-[#080B1A]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white space-y-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#6D3FD6] via-[#8B5CF6] to-[#F5C451] flex items-center justify-center text-5xl shadow-2xl animate-bounce">
              🎆
            </div>
            <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-xs font-bold text-white animate-pulse">✓</span>
          </div>

          <div className="space-y-2 max-w-sm">
            <h2 className="text-2xl sm:text-3xl font-black text-[#F5C451] uppercase font-display tracking-tight">
              Order Placed! 🎉
            </h2>
            <p className="text-xs text-slate-300 font-bold animate-pulse">{processingOverlay.stepText}</p>
          </div>

          <div className="w-full max-w-xs space-y-1.5">
            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-white/10">
              <div
                className="bg-gradient-to-r from-[#6D3FD6] via-purple-400 to-[#F5C451] h-full rounded-full transition-all duration-75 ease-linear"
                style={{ width: `${processingOverlay.progress}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-mono text-slate-400 font-bold px-1">
              <span>Preparing Order Summary</span>
              <span className="text-[#F5C451]">{processingOverlay.progress}%</span>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 font-medium pt-2">Redirecting to Order Confirmation...</p>
        </div>
      )}
    </div>
  );
}
