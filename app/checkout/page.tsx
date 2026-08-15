"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import FireworksCanvas from "@/components/ui/FireworksCanvas";
import {
  validateTransactionRef,
  generateUpiUri,
  getAppPaymentLink,
} from "@/lib/payment-utils";
import {
  createOrderAction,
  verifyAndConfirmPaymentAction,
  handlePaymentFailureAction,
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

  // Payment Selection & Reference State
  const [paymentMethod, setPaymentMethod] = useState<"GPAY" | "PHONEPE" | "PAYTM" | "QR">("QR");
  const [paymentRef, setPaymentRef] = useState("");
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

  // Input Field References for Scrolling
  const nameRef = useRef<HTMLInputElement | null>(null);
  const phoneRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const addressRef = useRef<HTMLTextAreaElement | null>(null);
  const pinRef = useRef<HTMLInputElement | null>(null);
  const cityRef = useRef<HTMLInputElement | null>(null);
  const districtRef = useRef<HTMLInputElement | null>(null);
  const upiRef = useRef<HTMLInputElement | null>(null);

  // Validation & Processing States
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [paymentState, setPaymentState] = useState<"IDLE" | "PROCESSING" | "SUCCESS" | "FAILED">("IDLE");
  const [copiedToast, setCopiedToast] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);

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

  // Name Validation
  const handleNameInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomerName(val);
    if (val.trim().length >= 2) {
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

    if (!customerName || customerName.trim().length < 2) {
      newErrors.name = "Please enter your full name (minimum 2 characters).";
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

    // UTR / Transaction Reference Validation
    const refCheck = validateTransactionRef(paymentRef);
    if (!refCheck.valid) {
      newErrors.paymentRef = refCheck.error || "Please enter your valid 12-digit UTR or Transaction Reference ID.";
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
      else if (firstInvalidField === "paymentRef") ref = upiRef;

      if (ref && ref.current) {
        ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
        ref.current.focus({ preventScroll: true });
      }
      return false;
    }

    if (totalQuantity < 2) {
      setGlobalError("Minimum purchase quantity is 2 items.");
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
    note: "Sivakasi Crackers Festive Purchase",
  });

  // SUBMIT ORDER HANDLER
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError("");
    setPaymentState("IDLE");

    if (!validateForm()) return;

    setLoading(true);
    setPaymentState("PROCESSING");

    try {
      // 1. Create Pending Order
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
        cartItems: items.map((item) => ({
          productId: item.id,
          quantity: item.cartQuantity,
        })),
      });

      if (result.error) {
        setGlobalError(result.error);
        setLoading(false);
        setPaymentState("FAILED");
        return;
      }

      if (result.success && result.orderId) {
        // 2. Server-Side Payment Verification
        const paymentRes = await verifyAndConfirmPaymentAction(
          result.orderId,
          paymentRef.trim(),
          paymentMethod
        );

        if (paymentRes.success) {
          clearCart();
          setLoading(false);
          router.push(`/order-confirmation/${result.orderId}`);
        } else {
          // Handle payment verification failure cleanly without losing cart
          await handlePaymentFailureAction(result.orderId, "FAILED");
          setGlobalError(paymentRes.error || "Payment could not be verified. Please check your 12-digit UTR/Transaction ID.");
          setLoading(false);
          setPaymentState("FAILED");
        }
      } else {
        setGlobalError("Failed to initialize payment session. Please try again.");
        setLoading(false);
        setPaymentState("FAILED");
      }
    } catch (err: any) {
      console.error("Submit order error:", err);
      setGlobalError("An unexpected error occurred during payment processing.");
      setLoading(false);
      setPaymentState("FAILED");
    }
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex items-center justify-center">
        <div className="animate-spin text-4xl">🎆</div>
      </div>
    );
  }

  // SAME-PAGE ORDER CONFIRMATION SCREEN
  if (confirmedOrder) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between relative overflow-hidden">
        <Header settings={settings} />
        <FireworksCanvas durationSeconds={7} />

        <main className="max-w-3xl mx-auto px-4 py-12 flex-1 w-full text-center z-10 space-y-8">
          
          <div className="bg-white border border-purple-200 p-6 sm:p-10 rounded-3xl shadow-xl space-y-6">
            
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#6D3FD6] to-[#8B5CF6] rounded-full text-4xl shadow-lg animate-bounce text-white">
              🎉
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-[#6D3FD6] tracking-tight font-display">
              ORDER CONFIRMED!
            </h1>
            
            <p className="text-slate-600 text-xs sm:text-sm max-w-md mx-auto">
              Thank you for ordering with <strong className="text-[#6D3FD6]">{settings.storeName}</strong>! Your cracker order has been successfully placed.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-[#6D3FD6] font-extrabold uppercase tracking-wider block">
                  Order Number
                </span>
                <span className="text-xl font-black text-slate-900 font-mono">{confirmedOrder.formattedId}</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-[#6D3FD6] font-extrabold uppercase tracking-wider block">
                  Total Amount
                </span>
                <span className="text-xl font-black text-[#6D3FD6]">₹{Number(confirmedOrder.totalAmount).toLocaleString("en-IN")}</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1 sm:col-span-2">
                <span className="text-[10px] text-[#6D3FD6] font-extrabold uppercase tracking-wider block">
                  Delivery Address
                </span>
                <p className="font-extrabold text-slate-900 text-xs">{confirmedOrder.customerName}</p>
                <p className="text-slate-600 text-xs leading-relaxed">
                  {confirmedOrder.address}{confirmedOrder.landmark ? `, Near ${confirmedOrder.landmark}` : ""}, {confirmedOrder.city}, {confirmedOrder.district}, {confirmedOrder.state} - <strong className="text-slate-900">{confirmedOrder.pincode}</strong>
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1 sm:col-span-2">
                <span className="text-[10px] text-[#6D3FD6] font-extrabold uppercase tracking-wider block">
                  Contact Information
                </span>
                <p className="text-xs text-slate-600">
                  Mobile: <strong className="text-slate-900 font-mono text-sm">{confirmedOrder.phone}</strong>
                </p>
                <p className="text-xs text-slate-600">
                  Email: <span className="text-slate-900">{confirmedOrder.email}</span>
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-center gap-4">
              <a
                href={`/api/orders/${confirmedOrder.id}/invoice`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 bg-[#6D3FD6] hover:bg-[#5B21B6] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>📄 Download Invoice PDF</span>
              </a>

              <Link
                href={`/orders?query=${encodeURIComponent(confirmedOrder.phone)}`}
                className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-[#6D3FD6] border border-slate-200 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <span>📦 View Order History</span>
              </Link>

              <Link
                href="/products"
                className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
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

  // EMPTY CART SCREEN
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between">
        <Header settings={settings} />
        <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-md">
          <div className="text-5xl">🛒</div>
          <h2 className="text-lg font-bold text-slate-900 font-display">Your cart is empty</h2>
          <p className="text-xs text-slate-500">Please add items to your cart before proceeding to checkout.</p>
          <Link href="/products" className="inline-block bg-[#6D3FD6] text-white text-xs font-bold px-6 py-2.5 rounded-xl">
            Browse Products
          </Link>
        </div>
        <Footer settings={settings} />
      </div>
    );
  }

  if (totalQuantity < 2) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between">
        <Header settings={settings} />
        <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-md">
          <div className="text-5xl">⚠️</div>
          <h2 className="text-lg font-bold text-slate-900 font-display">Minimum Order Not Met</h2>
          <p className="text-xs text-slate-500">Minimum purchase quantity is 2 items.</p>
          <Link href="/products" className="inline-block bg-[#6D3FD6] text-white text-xs font-bold px-6 py-2.5 rounded-xl">
            Browse Products
          </Link>
        </div>
        <Footer settings={settings} />
      </div>
    );
  }

  const shippingFee = subtotal >= settings.freeShippingThreshold ? 0 : settings.flatShippingFee;
  const grandTotal = subtotal + shippingFee;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
      <Header settings={settings} />

      {/* Copy Toast */}
      {copiedToast && (
        <div className="fixed top-20 right-5 z-50 bg-slate-900 text-amber-300 border border-amber-400 text-xs font-extrabold px-4 py-3 rounded-2xl shadow-2xl animate-bounce flex items-center gap-2">
          <span>✓ UPI ID copied to clipboard</span>
        </div>
      )}

      <div className="bg-white text-slate-900 py-8 border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-[#6D3FD6] text-xs font-bold uppercase tracking-wider mb-1">
            <Link href="/cart" className="hover:underline">Cart</Link>
            <span>/</span>
            <span>Guest Checkout</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
            Delivery Details & Order Checkout
          </h1>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        
        {globalError && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold rounded-2xl flex items-center justify-between shadow-xs">
            <span className="flex items-center gap-2">⚠️ {globalError}</span>
            <button onClick={() => setGlobalError("")} className="text-amber-900 hover:text-black font-extrabold text-sm cursor-pointer">✕</button>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="max-w-3xl mx-auto space-y-6" noValidate>
          
          {/* Section 1: Customer Contact Information */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl space-y-5">
            <h2 className="text-sm font-black text-slate-900 border-b border-slate-200 pb-3 uppercase tracking-wider flex items-center gap-2 font-display">
              <span className="w-6 h-6 rounded-full bg-[#6D3FD6] text-white text-xs flex items-center justify-center font-bold">1</span>
              Customer Contact Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Full Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Full Name *
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
                  className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                    errors.name ? "border-red-500 ring-1 ring-red-500 bg-red-50" : "border-slate-200 focus:ring-[#6D3FD6] focus:border-[#6D3FD6]"
                  }`}
                />
                {errors.name && (
                  <span id="name-error" className="text-[11px] font-bold text-red-600 mt-1 block">
                    {errors.name}
                  </span>
                )}
              </div>

              {/* Mobile Input */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
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
                    aria-invalid={errors.phone ? "true" : "false"}
                    aria-describedby={errors.phone ? "phone-error" : undefined}
                    className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                      errors.phone ? "border-red-500 ring-1 ring-red-500 bg-red-50" : "border-slate-200 focus:ring-[#6D3FD6] focus:border-[#6D3FD6]"
                    }`}
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">Enter 10-digit Indian mobile number</span>

                {errors.phone && (
                  <span id="phone-error" className="text-[11px] font-bold text-red-600 mt-1 block">
                    {errors.phone}
                  </span>
                )}
              </div>

              {/* Email Address Input */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
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
                  className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
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
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
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
                  className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
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
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Address Line 2 / Landmark (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Near Bus Stand / Opposite SBI Bank"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6D3FD6]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  State *
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D3FD6]"
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st} className="bg-white text-slate-900">{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
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
                  className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-900 font-mono focus:outline-none focus:ring-2 transition-all ${
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
                      <div>City: {pinVerifiedInfo.city} (Automatically detected)</div>
                      <div>District: {pinVerifiedInfo.district} (Automatically detected)</div>
                      <div>State: {pinVerifiedInfo.state} (Automatically detected)</div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
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
                  className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 transition-all ${
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
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
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
                  className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 transition-all ${
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

          {/* Section 3: Payment Options */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl space-y-6">
            <h2 className="text-sm font-black text-slate-900 border-b border-slate-200 pb-3 uppercase tracking-wider flex items-center gap-2 font-display">
              <span className="w-6 h-6 rounded-full bg-[#6D3FD6] text-white text-xs flex items-center justify-center font-bold">3</span>
              Choose Payment Method
            </h2>

            {/* Payment Method Selector Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Option 1: Google Pay */}
              <button
                type="button"
                onClick={() => setPaymentMethod("GPAY")}
                className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center space-y-2 cursor-pointer ${
                  paymentMethod === "GPAY"
                    ? "border-[#6D3FD6] bg-purple-50 ring-2 ring-[#6D3FD6]"
                    : "border-slate-200 hover:border-purple-300 bg-slate-50"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-[#4285F4]/10 border border-[#4285F4]/30 flex items-center justify-center text-xl font-bold text-[#4285F4]">
                  G
                </div>
                <span className="font-extrabold text-xs text-slate-900 block">Google Pay</span>
                <span className="text-[10px] text-slate-500">Direct App / UPI</span>
              </button>

              {/* Option 2: PhonePe */}
              <button
                type="button"
                onClick={() => setPaymentMethod("PHONEPE")}
                className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center space-y-2 cursor-pointer ${
                  paymentMethod === "PHONEPE"
                    ? "border-[#6D3FD6] bg-purple-50 ring-2 ring-[#6D3FD6]"
                    : "border-slate-200 hover:border-purple-300 bg-slate-50"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-[#5f259f]/10 border border-[#5f259f]/30 flex items-center justify-center text-xl font-bold text-[#5f259f]">
                  P
                </div>
                <span className="font-extrabold text-xs text-slate-900 block">PhonePe</span>
                <span className="text-[10px] text-slate-500">Instant Transfer</span>
              </button>

              {/* Option 3: Paytm */}
              <button
                type="button"
                onClick={() => setPaymentMethod("PAYTM")}
                className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center space-y-2 cursor-pointer ${
                  paymentMethod === "PAYTM"
                    ? "border-[#6D3FD6] bg-purple-50 ring-2 ring-[#6D3FD6]"
                    : "border-slate-200 hover:border-purple-300 bg-slate-50"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-[#00baf2]/10 border border-[#00baf2]/30 flex items-center justify-center text-xl font-bold text-[#00baf2]">
                  Paytm
                </div>
                <span className="font-extrabold text-xs text-slate-900 block">Paytm</span>
                <span className="text-[10px] text-slate-500">Paytm App / UPI</span>
              </button>

              {/* Option 4: UPI QR Code */}
              <button
                type="button"
                onClick={() => setPaymentMethod("QR")}
                className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center space-y-2 cursor-pointer ${
                  paymentMethod === "QR"
                    ? "border-[#6D3FD6] bg-purple-50 ring-2 ring-[#6D3FD6]"
                    : "border-slate-200 hover:border-purple-300 bg-slate-50"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-xl">
                  📱
                </div>
                <span className="font-extrabold text-xs text-slate-900 block">UPI QR Code</span>
                <span className="text-[10px] text-slate-500">Scan & Pay</span>
              </button>
            </div>

            {/* PAYMENT METHOD DETAILS CARD */}
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 text-center space-y-6">
              
              {/* App Opening Deep-Link for Mobile (Google Pay / PhonePe / Paytm) */}
              {["GPAY", "PHONEPE", "PAYTM"].includes(paymentMethod) && (
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 border border-purple-200 rounded-full text-[11px] font-extrabold text-[#6D3FD6]">
                    ⚡ Mobile App Payment Supported
                  </div>
                  <p className="text-xs text-slate-600">
                    Tap below to open <strong className="text-slate-900">{paymentMethod === "GPAY" ? "Google Pay" : paymentMethod === "PHONEPE" ? "PhonePe" : "Paytm"}</strong> on your mobile device, or scan the QR code below.
                  </p>
                  
                  <a
                    href={getAppPaymentLink(paymentMethod, dynamicUpiUri)}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#6D3FD6] hover:bg-[#5B21B6] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    <span>Open {paymentMethod === "GPAY" ? "Google Pay" : paymentMethod === "PHONEPE" ? "PhonePe" : "Paytm"} App →</span>
                  </a>
                </div>
              )}

              {/* QR Code Section - Scan & Pay */}
              <div className="space-y-4">
                <h3 className="font-extrabold text-sm text-[#6D3FD6] uppercase tracking-wider">
                  Scan & Pay
                </h3>

                <div className="inline-block bg-white p-4 rounded-3xl shadow-xl border-4 border-amber-300">
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

                <div className="space-y-1 text-xs text-slate-600">
                  <p>Merchant: <strong className="text-slate-900">{settings.storeName}</strong></p>
                  <p>UPI ID: <strong className="text-[#6D3FD6] font-mono">{upiIdToUse}</strong></p>
                  <p>Amount to Pay: <strong className="text-base text-emerald-700 font-black">₹{grandTotalAmount.toLocaleString("en-IN")}</strong></p>
                </div>
              </div>

              {/* UTR / Transaction Reference ID Input for Server Verification */}
              <div className="pt-4 border-t border-slate-200 space-y-3 text-left max-w-md mx-auto">
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Enter 12-Digit UTR / Transaction Reference ID *
                </label>
                <input
                  ref={upiRef}
                  type="text"
                  required
                  maxLength={35}
                  placeholder="e.g. 423456789012"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  className={`w-full px-4 py-3 bg-white border rounded-xl text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                    errors.paymentRef ? "border-red-500 ring-1 ring-red-500" : "border-slate-200 focus:ring-[#6D3FD6]"
                  }`}
                />
                {errors.paymentRef && (
                  <span className="text-[11px] font-bold text-red-600 block">
                    {errors.paymentRef}
                  </span>
                )}
                <span className="text-[10px] text-slate-500 block">
                  Copy the 12-digit UTR/Ref number from your payment app receipt after completing payment.
                </span>
              </div>

            </div>

            {/* Error & Failure Handling Alert */}
            {globalError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl space-y-3 text-center">
                <p className="text-xs font-extrabold text-red-700">
                  ⚠️ {globalError}
                </p>
                {paymentState === "FAILED" && (
                  <div className="flex flex-wrap justify-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setGlobalError("");
                        setPaymentState("IDLE");
                      }}
                      className="px-4 py-2 bg-[#6D3FD6] text-white text-xs font-black rounded-xl hover:bg-[#5B21B6] cursor-pointer"
                    >
                      Try Payment Again
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setGlobalError("");
                        setPaymentState("IDLE");
                        setPaymentMethod("QR");
                      }}
                      className="px-4 py-2 bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Change Payment Method
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Submit Order & Verify Payment Button */}
            <button
              type="submit"
              disabled={loading || items.length < 2}
              className="w-full py-4 mt-6 bg-[#6D3FD6] hover:bg-[#5B21B6] text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-md transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Verifying Payment Server-Side...
                </span>
              ) : items.length < 2 ? (
                <span>Min 2 Items Required to Checkout</span>
              ) : (
                <span>Pay & Verify Order ₹{grandTotalAmount.toLocaleString("en-IN")} →</span>
              )}
            </button>

            <div className="text-center text-[10px] text-slate-500 space-y-1 pt-2">
              <p>🔒 100% Secure & Server-Verified Payment Flow</p>
              <p>⚡ Direct Sivakasi Factory Quality Guarantee</p>
            </div>
          </div>

        </form>

      </main>

      <Footer settings={settings} />
    </div>
  );
}
