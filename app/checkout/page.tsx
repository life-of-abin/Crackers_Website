"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import {
  createOrderAction,
  confirmPaymentAction,
  getPaymentAccountsAction,
} from "@/lib/actions";
import { isValidGmailFormat } from "@/lib/pincode";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import FireworksCanvas from "@/components/ui/FireworksCanvas";

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
  email: "abinesh.ece200@gmail.com",
  address: "123 Main Bazaar, Sivakasi, Tamil Nadu 626123",
  googleMapsUrl: "https://maps.google.com/?q=Sivakasi,Tamil+Nadu",
  whatsappNumber: "+919629525907",
  minOrderAmount: 500,
  flatShippingFee: 100,
  freeShippingThreshold: 3000,
};

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

export default function CheckoutPage() {
  const { items, subtotal, clearCart, isMounted } = useCart();
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);

  // Customer Input Fields
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState(""); // Strictly 10 digits
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("Tamil Nadu");
  const [pincode, setPincode] = useState("");
  const [autoFilledPin, setAutoFilledPin] = useState<string | null>(null);

  // Field DOM References for Focus/Scroll
  const nameRef = useRef<HTMLInputElement | null>(null);
  const phoneRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const addressRef = useRef<HTMLTextAreaElement | null>(null);
  const pinRef = useRef<HTMLInputElement | null>(null);
  const cityRef = useRef<HTMLInputElement | null>(null);
  const districtRef = useRef<HTMLInputElement | null>(null);

  // Validation States
  const [errors, setErrors] = useState<Record<string, string>>({});

  // PIN Code States
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError, setPinError] = useState("");
  const [pinVerifiedInfo, setPinVerifiedInfo] = useState<{
    valid: boolean;
    city?: string;
    district?: string;
    state?: string;
    country?: string;
  } | null>(null);

  // Payment Selection States
  const [paymentMethod, setPaymentMethod] = useState<"RAZORPAY" | "UPI" | "QR">("QR");
  const [paymentRef, setPaymentRef] = useState("");
  const [paymentAccounts, setPaymentAccounts] = useState<any[]>([]);
  const [copiedToast, setCopiedToast] = useState(false);

  // Order Submission & Confirmation State
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [confirmedOrder, setConfirmedOrder] = useState<any | null>(null);

  // Load Settings & Admin Configured Payment Accounts
  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) setSettings(data);
      })
      .catch(console.error);

    getPaymentAccountsAction().then((res) => {
      if (res.success && res.accounts) {
        setPaymentAccounts(res.accounts.filter((acc: any) => acc.isActive));
      }
    });
  }, []);

  // SMART REACTIVE PIN CODE LOOKUP WITH RACE CONDITION SAFETY
  useEffect(() => {
    const cleanPin = pincode.replace(/[^0-9]/g, "").trim();

    setPinVerifiedInfo(null);
    setPinError("");

    if (autoFilledPin && autoFilledPin !== cleanPin) {
      setCity("");
      setDistrict("");
      setAutoFilledPin(null);
    }

    if (cleanPin.length < 6) return;

    if (!/^[1-9][0-9]{5}$/.test(cleanPin)) {
      setPinError("Please enter a valid Indian PIN code.");
      return;
    }

    const controller = new AbortController();
    setPinLoading(true);

    fetch(`/api/pincode?pin=${cleanPin}&state=${encodeURIComponent(state)}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        setPinLoading(false);
        if (!data.valid) {
          setPinError("Please enter a valid Indian PIN code.");
          setCity("");
          setDistrict("");
        } else {
          setPinVerifiedInfo(data);
          setAutoFilledPin(cleanPin);
          if (data.city) setCity(data.city);
          if (data.district) setDistrict(data.district);
          if (data.state && !state) setState(data.state);
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setPinLoading(false);
          setPinError("Please enter a valid Indian PIN code.");
        }
      });

    return () => {
      controller.abort();
    };
  }, [pincode, state]);

  // Name Input Handler (allows letters, spaces, dots, hyphens)
  const handleNameInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomerName(val);
    if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
  };

  // Phone Input Handler (10 digits only)
  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let clean = e.target.value.replace(/[^0-9]/g, "");
    if (clean.length > 10) clean = clean.slice(0, 10);
    setPhone(clean);
    if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
  };

  // Email Input Handler
  const handleEmailInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
  };

  // COPY UPI ID HANDLER
  const activeUpiAccount = paymentAccounts.find((acc) => acc.type === "UPI") || { upiId: "abinesh.ece200@okhdfcbank" };
  const upiIdToUse = activeUpiAccount.upiId || "abinesh.ece200@okhdfcbank";

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(upiIdToUse);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 3000);
  };

  // VALIDATION ON SUBMIT
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const trimmedName = customerName.trim();
    if (!trimmedName || trimmedName.length < 2 || /\d/.test(trimmedName) || /[!@#$%^&*()_+={\}\[\]|;:"<>\/?\\]/.test(trimmedName)) {
      newErrors.name = "Please enter a valid name.";
    }

    if (phone.length !== 10 || !/^[6-9][0-9]{9}$/.test(phone)) {
      newErrors.phone = "Please enter a valid 10-digit Indian mobile number.";
    }

    if (!email || !isValidGmailFormat(email)) {
      newErrors.email = "Please enter a valid Gmail address ending with @gmail.com.";
    }

    if (!address || address.trim().length < 5) {
      newErrors.address = "Please enter a complete delivery address.";
    }

    const cleanPin = pincode.replace(/[^0-9]/g, "").trim();
    if (cleanPin.length !== 6 || !/^[1-9][0-9]{5}$/.test(cleanPin)) {
      newErrors.pincode = "Please enter a valid Indian PIN code.";
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
      if (newErrors.name && nameRef.current) {
        nameRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        nameRef.current.focus();
      } else if (newErrors.phone && phoneRef.current) {
        phoneRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        phoneRef.current.focus();
      } else if (newErrors.email && emailRef.current) {
        emailRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        emailRef.current.focus();
      } else if (newErrors.address && addressRef.current) {
        addressRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        addressRef.current.focus();
      } else if (newErrors.pincode && pinRef.current) {
        pinRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        pinRef.current.focus();
      } else if (newErrors.city && cityRef.current) {
        cityRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        cityRef.current.focus();
      } else if (newErrors.district && districtRef.current) {
        districtRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        districtRef.current.focus();
      }
      return false;
    }

    return true;
  };

  const grandTotalAmount = subtotal >= settings.freeShippingThreshold ? subtotal : subtotal + settings.flatShippingFee;

  // SUBMIT ORDER HANDLER (SAME-PAGE CONFIRMATION + SKYSHOT ANIMATION)
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      const result = await createOrderAction({
        customerName: customerName.trim(),
        phone: `+91${phone}`, // Stored normalized
        email: email.trim(),
        address: address.trim(),
        landmark: landmark.trim() || undefined,
        city: city.trim(),
        district: district.trim(),
        state,
        pincode: pincode.trim(),
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
        const paymentRes = await confirmPaymentAction(
          result.orderId,
          paymentRef.trim() || `PAY_${Date.now()}`
        );

        if (paymentRes.success) {
          const snapshotItems = [...items];
          clearCart();
          setLoading(false);

          // SAME-PAGE CONFIRMATION STATE
          setConfirmedOrder({
            id: result.orderId,
            formattedId: `#ORD-2026-${String(result.orderId).padStart(6, "0")}`,
            totalAmount: grandTotalAmount,
            customerName: customerName.trim(),
            phone: phone,
            email: email.trim(),
            address: address.trim(),
            landmark: landmark.trim(),
            city: city.trim(),
            district: district.trim(),
            state,
            pincode: pincode.trim(),
            paymentStatus: paymentMethod === "RAZORPAY" ? "PAID" : "PAYMENT_REVIEW",
            paymentMethod,
            items: snapshotItems,
          });
        } else {
          setGlobalError(paymentRes.error || "Order creation succeeded but payment status update failed.");
          setLoading(false);
        }
      } else {
        setGlobalError("Failed to create order. Please try again.");
        setLoading(false);
      }
    } catch (err: any) {
      console.error("Submit order error:", err);
      setGlobalError("An unexpected error occurred during order submission.");
      setLoading(false);
    }
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="animate-spin text-4xl">🎆</div>
      </div>
    );
  }

  // =========================================================================
  // SAME-PAGE ORDER CONFIRMATION SCREEN WITH SKYSHOT FIREWORKS ANIMATION
  // =========================================================================
  if (confirmedOrder) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between relative overflow-hidden">
        <Header settings={settings} />

        {/* 🎆 Premium Skyshot Fireworks Canvas Animation */}
        <FireworksCanvas durationSeconds={7} />

        <main className="max-w-3xl mx-auto px-4 py-12 flex-1 w-full text-center z-10 space-y-8">
          
          <div className="bg-slate-900/90 backdrop-blur-xl border border-amber-500/30 p-6 sm:p-10 rounded-3xl shadow-2xl space-y-6">
            
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-red-600 rounded-full text-4xl shadow-lg animate-bounce">
              🎉
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-100 to-amber-400 tracking-tight">
              ORDER CONFIRMED!
            </h1>
            
            <p className="text-slate-300 text-xs sm:text-sm max-w-md mx-auto">
              Thank you for ordering with <strong className="text-amber-400">{settings.storeName}</strong>! Your cracker order has been successfully placed.
            </p>

            {/* Confirmation Summary Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-wider block">
                  Order Number
                </span>
                <span className="text-xl font-black text-white font-mono">{confirmedOrder.formattedId}</span>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-wider block">
                  Total Amount
                </span>
                <span className="text-xl font-black text-red-500">₹{Number(confirmedOrder.totalAmount).toLocaleString("en-IN")}</span>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1 sm:col-span-2">
                <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-wider block">
                  Delivery Address
                </span>
                <p className="font-extrabold text-white text-xs">{confirmedOrder.customerName}</p>
                <p className="text-slate-300 text-xs leading-relaxed">
                  {confirmedOrder.address}{confirmedOrder.landmark ? `, Near ${confirmedOrder.landmark}` : ""}, {confirmedOrder.city}, {confirmedOrder.district}, {confirmedOrder.state} - <strong className="text-white">{confirmedOrder.pincode}</strong>
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1 sm:col-span-2">
                <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-wider block">
                  Contact Information
                </span>
                <p className="text-xs text-slate-300">
                  Mobile: <strong className="text-amber-300 font-mono text-sm">{confirmedOrder.phone}</strong>
                </p>
                <p className="text-xs text-slate-300">
                  Email: <span className="text-slate-200">{confirmedOrder.email}</span>
                </p>
              </div>
            </div>

            {/* Action Buttons: Invoice PDF, View Order, Continue Shopping */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-center gap-4">
              <a
                href={`/api/orders/${confirmedOrder.id}/invoice`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <span>📄 Download Invoice PDF</span>
              </a>

              <Link
                href={`/orders?query=${encodeURIComponent(confirmedOrder.phone)}`}
                className="w-full sm:w-auto px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <span>📦 View Order History</span>
              </Link>

              <Link
                href="/products"
                className="w-full sm:w-auto px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <span>Continue Shopping →</span>
              </Link>
            </div>

          </div>

        </main>

        <Footer settings={settings} />
      </div>
    );
  }

  // =========================================================================
  // EMPTY CART SCREEN
  // =========================================================================
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Header settings={settings} />
        <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
          <div className="text-5xl">🛒</div>
          <h2 className="text-lg font-bold text-slate-900">Your cart is empty</h2>
          <p className="text-xs text-slate-500">Please add items to your cart before proceeding to checkout.</p>
          <Link href="/products" className="inline-block bg-red-600 text-white text-xs font-bold px-6 py-2.5 rounded-xl">
            Browse Products
          </Link>
        </div>
        <Footer settings={settings} />
      </div>
    );
  }

  const shippingFee = subtotal >= settings.freeShippingThreshold ? 0 : settings.flatShippingFee;
  const grandTotal = subtotal + shippingFee;
  const upiDeepLink = `upi://pay?pa=${encodeURIComponent(upiIdToUse)}&pn=${encodeURIComponent(settings.storeName)}&am=${grandTotal}&cu=INR&tn=${encodeURIComponent("Sivakasi Crackers Order")}`;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header settings={settings} />

      {/* Copy Toast */}
      {copiedToast && (
        <div className="fixed top-20 right-5 z-50 bg-slate-900 text-amber-300 border border-amber-500/40 text-xs font-extrabold px-4 py-3 rounded-2xl shadow-2xl animate-bounce flex items-center gap-2">
          <span>✓ UPI ID copied to clipboard</span>
        </div>
      )}

      <div className="bg-slate-900 text-white py-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Link href="/cart">Cart</Link>
            <span>/</span>
            <span>Guest Checkout</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Delivery Details & Order Checkout
          </h1>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        
        {globalError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 text-xs font-bold rounded-2xl flex items-center justify-between shadow-sm">
            <span className="flex items-center gap-2">⚠️ {globalError}</span>
            <button onClick={() => setGlobalError("")} className="text-red-500 hover:text-red-900 font-extrabold text-sm">✕</button>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8" noValidate>
          
          {/* Customer Details Form (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Section 1: Customer Contact Information */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
              <h2 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 uppercase tracking-wider flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs flex items-center justify-center font-bold">1</span>
                Customer Contact Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <input
                    ref={nameRef}
                    type="text"
                    required
                    placeholder="Abinesh Kumar"
                    value={customerName}
                    onChange={handleNameInput}
                    className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                      errors.name ? "border-red-500 ring-1 ring-red-500" : "border-slate-200 focus:ring-red-600"
                    }`}
                  />
                  {errors.name && (
                    <span className="text-[11px] font-bold text-red-600 mt-1 block">
                      {errors.name}
                    </span>
                  )}
                </div>

                {/* 10-Digit Mobile Input — India Only */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Mobile Number *
                  </label>
                  <div className="relative">
                    <input
                      ref={phoneRef}
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="98765 43210"
                      value={phone ? phone.replace(/(\d{5})(\d{5})/, "$1 $2") : ""}
                      onChange={handlePhoneInput}
                      className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-900 font-mono focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                        errors.phone ? "border-red-500 ring-1 ring-red-500" : "border-slate-200 focus:ring-red-600"
                      }`}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">Enter 10-digit Indian mobile number</span>

                  {errors.phone && (
                    <span className="text-[11px] font-bold text-red-600 mt-1 block">
                      {errors.phone}
                    </span>
                  )}
                </div>

                {/* Email Address Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address *
                  </label>
                  <input
                    ref={emailRef}
                    type="email"
                    required
                    placeholder="customer@gmail.com"
                    value={email}
                    onChange={handleEmailInput}
                    className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                      errors.email ? "border-red-500 ring-1 ring-red-500" : "border-slate-200 focus:ring-red-600"
                    }`}
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Order updates & receipt sent here</span>

                  {errors.email && (
                    <span className="text-[11px] font-bold text-red-600 mt-1 block">
                      {errors.email}
                    </span>
                  )}
                </div>

              </div>
            </div>

            {/* Section 2: Smart Reactive PIN Code & Address */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
              <h2 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 uppercase tracking-wider flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs flex items-center justify-center font-bold">2</span>
                Delivery Address & Smart Postal Auto-Fill
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Address Line 1 (House No., Building, Street Name) *
                  </label>
                  <textarea
                    ref={addressRef}
                    required
                    rows={2}
                    placeholder="Door No 42, Gandhi Road"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                      errors.address ? "border-red-500 ring-1 ring-red-500" : "border-slate-200 focus:ring-red-600"
                    }`}
                  />
                  {errors.address && (
                    <span className="text-[11px] font-bold text-red-600 mt-1 block">
                      {errors.address}
                    </span>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Address Line 2 / Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Near Bus Stand / Opposite SBI Bank"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    State *
                  </label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white"
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    PIN Code (6 Digits) *
                  </label>
                  <input
                    ref={pinRef}
                    type="text"
                    required
                    maxLength={6}
                    placeholder="641001"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/[^0-9]/g, ""))}
                    className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-900 font-mono focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                      errors.pincode ? "border-red-500 ring-1 ring-red-500" : "border-slate-200 focus:ring-red-600"
                    }`}
                  />
                  
                  <div className="mt-1.5 text-xs font-bold">
                    {pinLoading && (
                      <span className="text-amber-600 animate-pulse flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                        Checking PIN code...
                      </span>
                    )}
                    {pinError && (
                      <span className="text-red-600 block bg-red-50 p-2 rounded-lg border border-red-200 text-[11px] mt-1">
                        {pinError}
                      </span>
                    )}
                    {errors.pincode && !pinError && (
                      <span className="text-red-600 block text-[11px] mt-1">
                        {errors.pincode}
                      </span>
                    )}
                    {pinVerifiedInfo && pinVerifiedInfo.valid && (
                      <div className="text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 text-[11px] space-y-0.5 mt-1">
                        <span className="font-extrabold flex items-center gap-1">
                          ✓ PIN verified
                        </span>
                        {pinVerifiedInfo.city && <div>City: {pinVerifiedInfo.city}</div>}
                        {pinVerifiedInfo.district && <div>District: {pinVerifiedInfo.district}</div>}
                        {pinVerifiedInfo.state && <div>State: {pinVerifiedInfo.state}</div>}
                        <div className="text-[10px] text-emerald-600 italic">Country: India</div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    City / Town *
                  </label>
                  <input
                    ref={cityRef}
                    type="text"
                    required
                    placeholder="Coimbatore"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                      errors.city ? "border-red-500 ring-1 ring-red-500" : "border-slate-200 focus:ring-red-600"
                    }`}
                  />
                  {errors.city && (
                    <span className="text-[11px] font-bold text-red-600 mt-1 block">
                      {errors.city}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    District *
                  </label>
                  <input
                    ref={districtRef}
                    type="text"
                    required
                    placeholder="Coimbatore District"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                      errors.district ? "border-red-500 ring-1 ring-red-500" : "border-slate-200 focus:ring-red-600"
                    }`}
                  />
                  {errors.district && (
                    <span className="text-[11px] font-bold text-red-600 mt-1 block">
                      {errors.district}
                    </span>
                  )}
                </div>

              </div>
            </div>

            {/* Section 3: Payment Options & UPI QR Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <h2 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 uppercase tracking-wider flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs flex items-center justify-center font-bold">3</span>
                Payment Options
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("QR")}
                  className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    paymentMethod === "QR"
                      ? "border-red-600 bg-red-50/50 ring-2 ring-red-600"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div>
                    <span className="text-xl block mb-1">📱</span>
                    <span className="font-extrabold text-xs text-slate-900 block">Scan UPI QR</span>
                    <span className="text-[10px] text-slate-500 block">GPay / PhonePe / Paytm</span>
                  </div>
                  <span className="text-[10px] font-extrabold text-red-600 mt-2 block">RECOMMENDED</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("UPI")}
                  className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    paymentMethod === "UPI"
                      ? "border-red-600 bg-red-50/50 ring-2 ring-red-600"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div>
                    <span className="text-xl block mb-1">💳</span>
                    <span className="font-extrabold text-xs text-slate-900 block">UPI Direct App</span>
                    <span className="text-[10px] text-slate-500 block">Instant App Payment</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 mt-2 block">Instant</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("RAZORPAY")}
                  className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    paymentMethod === "RAZORPAY"
                      ? "border-red-600 bg-red-50/50 ring-2 ring-red-600"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div>
                    <span className="text-xl block mb-1">⚡</span>
                    <span className="font-extrabold text-xs text-slate-900 block">Razorpay Gateway</span>
                    <span className="text-[10px] text-slate-500 block">Cards / Netbanking</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 mt-2 block">Secure</span>
                </button>
              </div>

              {/* Dynamic QR Code Card */}
              {paymentMethod === "QR" && (
                <div className="p-6 bg-slate-900 rounded-3xl text-white space-y-4 text-center border border-slate-800">
                  <div className="inline-block bg-white p-3 rounded-2xl shadow-xl">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                        upiDeepLink
                      )}`}
                      alt="UPI QR Code"
                      className="w-40 h-40 object-contain mx-auto"
                    />
                  </div>

                  <div>
                    <p className="text-xs text-slate-300 font-medium">Official Store UPI ID:</p>
                    <div className="inline-flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-xl mt-1 border border-slate-700">
                      <span className="font-mono text-xs font-bold text-amber-300">{upiIdToUse}</span>
                      <button
                        type="button"
                        onClick={handleCopyUpiId}
                        className="text-[10px] bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-2.5 py-1 rounded-lg transition-all"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1 text-left">
                      UPI Transaction Reference / UTR No. (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 421098765432"
                      value={paymentRef}
                      onChange={(e) => setPaymentRef(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                </div>
              )}

              {/* UPI Direct App Card */}
              {paymentMethod === "UPI" && (
                <div className="p-6 bg-slate-900 rounded-3xl text-white space-y-4 border border-slate-800">
                  <p className="text-xs text-slate-300 font-medium">Click your preferred UPI app to make instant payment:</p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <a
                      href={upiDeepLink}
                      className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-center text-xs font-bold text-amber-300 border border-slate-700 transition-all block"
                    >
                      Google Pay
                    </a>
                    <a
                      href={upiDeepLink}
                      className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-center text-xs font-bold text-purple-300 border border-slate-700 transition-all block"
                    >
                      PhonePe
                    </a>
                    <a
                      href={upiDeepLink}
                      className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-center text-xs font-bold text-emerald-300 border border-slate-700 transition-all block"
                    >
                      BHIM UPI
                    </a>
                    <a
                      href={upiDeepLink}
                      className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-center text-xs font-bold text-cyan-300 border border-slate-700 transition-all block"
                    >
                      Paytm
                    </a>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                      UPI Transaction Reference / UTR No. (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 421098765432"
                      value={paymentRef}
                      onChange={(e) => setPaymentRef(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === "RAZORPAY" && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs font-semibold">
                  ⚡ Razorpay Gateway mode: Payment signature will be verified server-side after order creation.
                </div>
              )}

            </div>

          </div>

          {/* Order Summary & Submit Button (1 col) */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 sticky top-24">
              <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 uppercase tracking-wider">
                Order Summary ({items.length} items)
              </h3>

              <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-xs">
                    <div className="flex-1 pr-2">
                      <p className="font-extrabold text-slate-900 line-clamp-1">{item.name}</p>
                      <p className="text-[10px] text-slate-500">Qty: {item.cartQuantity} × ₹{item.price}</p>
                    </div>
                    <span className="font-black text-slate-900 font-mono">
                      ₹{Number(item.price * item.cartQuantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-extrabold font-mono">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Shipping Fee</span>
                  {shippingFee === 0 ? (
                    <span className="font-extrabold text-emerald-600 uppercase">FREE</span>
                  ) : (
                    <span className="font-extrabold font-mono">₹{shippingFee}</span>
                  )}
                </div>

                <div className="border-t border-slate-200 pt-3 flex justify-between items-center text-sm">
                  <span className="font-black text-slate-900 uppercase">Grand Total</span>
                  <span className="text-lg font-black text-red-600 font-mono">
                    ₹{grandTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <span>Place & Complete Order (₹{grandTotal.toLocaleString("en-IN")}) →</span>
                )}
              </button>

              <div className="text-center text-[10px] text-slate-400 space-y-1">
                <p>🔒 100% Direct Sivakasi Factory Quality Guarantee</p>
                <p>⚡ Instant Same-Page Order Confirmation</p>
              </div>

            </div>
          </div>

        </form>

      </main>

      <Footer settings={settings} />
    </div>
  );
}
