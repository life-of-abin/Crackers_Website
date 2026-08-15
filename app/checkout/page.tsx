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

// Helper: Basic Email format check
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

  // Payment Selection State
  const [paymentMethod, setPaymentMethod] = useState<"BHIM" | "GPAY" | "PHONEPE" | "PAYTM" | "QR">("GPAY");
  const [paymentAccounts, setPaymentAccounts] = useState<any[]>([]);
  const [showQrOnMobile, setShowQrOnMobile] = useState(false);

  // Idempotent Order & Verification State
  const [pendingOrderId, setPendingOrderId] = useState<number | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<"IDLE" | "VERIFYING" | "SUCCESS" | "PENDING_RETRY">("IDLE");
  const [verificationMessage, setVerificationMessage] = useState("");
  const [openingAppNotice, setOpeningAppNotice] = useState<string | null>(null);

  // Device type detection
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [isAndroidDevice, setIsAndroidDevice] = useState(false);

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

  // Detect device capabilities & restore pending order session if returning
  useEffect(() => {
    if (typeof window !== "undefined") {
      const ua = navigator.userAgent || "";
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
      const android = /Android/i.test(ua);
      setIsMobileDevice(mobile);
      setIsAndroidDevice(android);

      // Mobile defaults to GPay app card, Desktop defaults to QR
      if (!mobile) {
        setPaymentMethod("QR");
      }

      // Check stored pending order ID
      const savedOrderId = sessionStorage.getItem("pending_upi_order_id");
      if (savedOrderId) {
        const parsed = parseInt(savedOrderId, 10);
        if (!isNaN(parsed)) {
          setPendingOrderId(parsed);
        }
      }
    }
  }, []);

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

  // Window Focus / Return from UPI app listener
  useEffect(() => {
    const handleReturnFromApp = () => {
      const activeOrderId = pendingOrderId || (typeof window !== "undefined" ? parseInt(sessionStorage.getItem("pending_upi_order_id") || "0", 10) : 0);
      
      if (activeOrderId && activeOrderId > 0) {
        verifyServerPayment(activeOrderId);
      }
    };

    window.addEventListener("focus", handleReturnFromApp);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        handleReturnFromApp();
      }
    });

    return () => {
      window.removeEventListener("focus", handleReturnFromApp);
    };
  }, [pendingOrderId]);

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
  }, [pincode]);

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

  const qrAccount = paymentAccounts.find((a) => a.isActive || a.isPrimary) || paymentAccounts[0];
  const upiIdToUse = qrAccount?.upiId || "9629525907@upi";

  const dynamicUpiUri = generateUpiUri({
    upiId: upiIdToUse,
    storeName: settings.storeName,
    amount: grandTotalAmount,
    orderId: pendingOrderId || "PAY",
    note: `Sivakasi Crackers Order`,
  });

  // Server-Side Payment Verification Handler
  const verifyServerPayment = async (orderIdToVerify: number) => {
    if (isVerifying) return;

    setIsVerifying(true);
    setVerificationStatus("VERIFYING");
    setVerificationMessage("Verifying Payment... Please wait while we confirm your transaction.");

    try {
      const res = await fetch("/api/payment/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderIdToVerify,
          paymentMethod,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.paymentStatus === "PAID") {
        setVerificationStatus("SUCCESS");
        setVerificationMessage("Payment Verified Successfully! Directing to order confirmation...");
        sessionStorage.removeItem("pending_upi_order_id");
        clearCart();
        setTimeout(() => {
          router.push(`/order-confirmation/${orderIdToVerify}`);
        }, 1200);
      } else {
        setVerificationStatus("PENDING_RETRY");
        setVerificationMessage(
          data.error || "Payment verification is still pending. If you completed payment, tap Check Payment Status."
        );
      }
    } catch (err: any) {
      console.error("Verification API Error:", err);
      setVerificationStatus("PENDING_RETRY");
      setVerificationMessage("Unable to reach payment verification server. Please tap Check Payment Status.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Ensure or create an order idempotently
  const ensureOrderCreated = async (): Promise<number | null> => {
    if (pendingOrderId) return pendingOrderId;

    if (!validateForm()) return null;
    if (items.length === 0) {
      setGlobalError("Your shopping cart is empty.");
      return null;
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
        paymentMethod,
        cartItems: items.map((item) => ({
          productId: item.id,
          quantity: item.cartQuantity,
        })),
      });

      setLoading(false);

      if (result.error) {
        setGlobalError(result.error);
        return null;
      }

      if (result.success && result.orderId) {
        setPendingOrderId(result.orderId);
        sessionStorage.setItem("pending_upi_order_id", String(result.orderId));
        return result.orderId;
      }

      setGlobalError("Failed to initialize order. Please try again.");
      return null;
    } catch (err: any) {
      console.error("Order initialization error:", err);
      setGlobalError("An unexpected error occurred during order initialization.");
      setLoading(false);
      return null;
    }
  };

  // Direct Mobile App Tap / Launch Handler
  const handleAppTap = async (method: "BHIM" | "GPAY" | "PHONEPE" | "PAYTM") => {
    setPaymentMethod(method);
    setShowQrOnMobile(false);
    setOpeningAppNotice(null);

    const appNames: Record<string, string> = {
      BHIM: "BHIM",
      GPAY: "Google Pay",
      PHONEPE: "PhonePe",
      PAYTM: "Paytm",
    };
    const appName = appNames[method] || method;

    // First ensure order is created idempotently
    const orderId = await ensureOrderCreated();
    if (!orderId) return;

    // Generate URI with created Order ID
    const orderUpiUri = generateUpiUri({
      upiId: upiIdToUse,
      storeName: settings.storeName,
      amount: grandTotalAmount,
      orderId,
      note: `Sivakasi Crackers Order #${orderId}`,
    });

    const targetUrl = getAppPaymentLink(method, orderUpiUri, isAndroidDevice);

    setOpeningAppNotice(`Opening ${appName}...`);

    setTimeout(() => {
      try {
        window.location.href = targetUrl;
      } catch (err) {
        console.error("Failed to launch intent:", err);
      }
    }, 150);

    setTimeout(() => {
      setOpeningAppNotice(null);
    }, 3500);
  };

  // Form Submit Handler
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError("");

    if (paymentMethod === "QR" || !isMobileDevice) {
      const orderId = await ensureOrderCreated();
      if (orderId) {
        // Trigger server verification
        verifyServerPayment(orderId);
      }
    } else {
      // Trigger app launch for selected mobile app
      handleAppTap(paymentMethod);
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
            <span>Checkout & Payment</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
            Checkout & Payment
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Safe & secure checkout. Factory wholesale Sivakasi fireworks delivered to your doorstep.
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full">
        
        {/* Verification Status Overlay / Modal */}
        {verificationStatus !== "IDLE" && (
          <div className="mb-6 p-6 bg-white border-2 border-[#6D3FD6] rounded-3xl shadow-2xl text-center space-y-4">
            {verificationStatus === "VERIFYING" && (
              <div className="space-y-3">
                <div className="w-10 h-10 border-4 border-[#6D3FD6] border-t-transparent rounded-full animate-spin mx-auto"></div>
                <h3 className="text-base font-black text-slate-900">Verifying Payment...</h3>
                <p className="text-xs font-medium text-slate-600">
                  Please wait while we confirm your transaction with the server.
                </p>
              </div>
            )}

            {verificationStatus === "SUCCESS" && (
              <div className="space-y-2">
                <span className="text-3xl">✅</span>
                <h3 className="text-base font-black text-emerald-700">Payment Verified Successfully!</h3>
                <p className="text-xs font-medium text-slate-600">Redirecting to order confirmation page...</p>
              </div>
            )}

            {verificationStatus === "PENDING_RETRY" && (
              <div className="space-y-3">
                <span className="text-2xl">⏳</span>
                <h3 className="text-sm font-black text-amber-900">Payment verification is still pending.</h3>
                <p className="text-xs text-slate-600">{verificationMessage}</p>
                
                <div className="flex flex-wrap justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => pendingOrderId && verifyServerPayment(pendingOrderId)}
                    className="px-5 py-2.5 bg-[#6D3FD6] hover:bg-[#5B21B6] text-white font-black rounded-xl text-xs shadow-md transition-all cursor-pointer"
                  >
                    Check Payment Status
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setVerificationStatus("IDLE");
                      if (isMobileDevice && paymentMethod !== "QR") {
                        handleAppTap(paymentMethod);
                      }
                    }}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-all cursor-pointer"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

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

          {/* Section 3: Payment Section (Mobile-First UPI App Direct Launch + Desktop QR) */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl space-y-6 sm:space-y-8">
            <h2 className="text-sm font-black text-slate-900 border-b border-slate-200 pb-3 uppercase tracking-wider flex items-center gap-2 font-display">
              <span className="w-6 h-6 rounded-full bg-[#6D3FD6] text-white text-xs flex items-center justify-center font-bold">3</span>
              Payment Method
            </h2>

            {/* Opening app status notification */}
            {openingAppNotice && (
              <div className="p-4 bg-purple-50 border border-[#6D3FD6] rounded-2xl flex items-center gap-3 text-xs font-bold text-[#6D3FD6] animate-pulse">
                <span className="w-4 h-4 border-2 border-[#6D3FD6] border-t-transparent rounded-full animate-spin"></span>
                <span>{openingAppNotice}</span>
              </div>
            )}

            {/* MOBILE LAYOUT (< 768px): DIRECT UPI APPS FIRST */}
            <div className="block sm:hidden space-y-4">
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Choose your UPI app
                </h3>
                <p className="text-[11px] text-slate-500">
                  Tap to launch app & pay ₹{grandTotalAmount.toLocaleString("en-IN")} directly
                </p>
              </div>

              {/* 4 Clean UPI App Cards */}
              <div className="space-y-2.5">
                
                {/* BHIM Button */}
                <button
                  type="button"
                  onClick={() => handleAppTap("BHIM")}
                  disabled={loading}
                  className={`w-full min-h-[56px] px-5 py-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                    paymentMethod === "BHIM" && !showQrOnMobile
                      ? "border-[#6D3FD6] bg-purple-50/90 ring-2 ring-[#6D3FD6] shadow-md"
                      : "border-slate-200 bg-slate-50/60 hover:border-purple-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src="/payment-logos/BHIM_Preview.png"
                      alt="BHIM UPI"
                      className="h-8 max-w-[100px] object-contain flex-shrink-0"
                    />
                    <span className="font-extrabold text-xs text-slate-900">BHIM UPI</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {paymentMethod === "BHIM" && !showQrOnMobile && (
                      <span className="text-[10px] font-black text-white bg-[#6D3FD6] px-2 py-0.5 rounded-full">✓ Selected</span>
                    )}
                    <span className="text-slate-400 font-bold">›</span>
                  </div>
                </button>

                {/* Google Pay Button */}
                <button
                  type="button"
                  onClick={() => handleAppTap("GPAY")}
                  disabled={loading}
                  className={`w-full min-h-[56px] px-5 py-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                    paymentMethod === "GPAY" && !showQrOnMobile
                      ? "border-[#6D3FD6] bg-purple-50/90 ring-2 ring-[#6D3FD6] shadow-md"
                      : "border-slate-200 bg-slate-50/60 hover:border-purple-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src="/payment-logos/Gpay.png"
                      alt="Google Pay"
                      className="h-8 max-w-[100px] object-contain flex-shrink-0"
                    />
                    <span className="font-extrabold text-xs text-slate-900">Google Pay</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {paymentMethod === "GPAY" && !showQrOnMobile && (
                      <span className="text-[10px] font-black text-white bg-[#6D3FD6] px-2 py-0.5 rounded-full">✓ Selected</span>
                    )}
                    <span className="text-slate-400 font-bold">›</span>
                  </div>
                </button>

                {/* PhonePe Button */}
                <button
                  type="button"
                  onClick={() => handleAppTap("PHONEPE")}
                  disabled={loading}
                  className={`w-full min-h-[56px] px-5 py-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                    paymentMethod === "PHONEPE" && !showQrOnMobile
                      ? "border-[#6D3FD6] bg-purple-50/90 ring-2 ring-[#6D3FD6] shadow-md"
                      : "border-slate-200 bg-slate-50/60 hover:border-purple-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src="/payment-logos/Phonepay.png"
                      alt="PhonePe"
                      className="h-8 max-w-[100px] object-contain flex-shrink-0"
                    />
                    <span className="font-extrabold text-xs text-slate-900">PhonePe</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {paymentMethod === "PHONEPE" && !showQrOnMobile && (
                      <span className="text-[10px] font-black text-white bg-[#6D3FD6] px-2 py-0.5 rounded-full">✓ Selected</span>
                    )}
                    <span className="text-slate-400 font-bold">›</span>
                  </div>
                </button>

                {/* Paytm Button */}
                <button
                  type="button"
                  onClick={() => handleAppTap("PAYTM")}
                  disabled={loading}
                  className={`w-full min-h-[56px] px-5 py-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                    paymentMethod === "PAYTM" && !showQrOnMobile
                      ? "border-[#6D3FD6] bg-purple-50/90 ring-2 ring-[#6D3FD6] shadow-md"
                      : "border-slate-200 bg-slate-50/60 hover:border-purple-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src="/payment-logos/paytm.png"
                      alt="Paytm"
                      className="h-8 max-w-[100px] object-contain flex-shrink-0"
                    />
                    <span className="font-extrabold text-xs text-slate-900">Paytm</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {paymentMethod === "PAYTM" && !showQrOnMobile && (
                      <span className="text-[10px] font-black text-white bg-[#6D3FD6] px-2 py-0.5 rounded-full">✓ Selected</span>
                    )}
                    <span className="text-slate-400 font-bold">›</span>
                  </div>
                </button>

              </div>

              {/* Mobile QR Fallback Toggle Section */}
              <div className="pt-3 border-t border-slate-200 text-center space-y-3">
                <span className="text-[11px] text-slate-500 block font-medium">Or pay another way</span>
                <button
                  type="button"
                  onClick={() => {
                    setShowQrOnMobile(!showQrOnMobile);
                    if (!showQrOnMobile) setPaymentMethod("QR");
                  }}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-2xl text-xs transition-all border border-slate-200 cursor-pointer"
                >
                  {showQrOnMobile ? "← Back to App Options" : "Scan QR Code Instead"}
                </button>

                {/* Mobile QR Container when explicitly toggled */}
                {showQrOnMobile && (
                  <div className="p-5 bg-purple-50/60 rounded-3xl border border-purple-200 text-center space-y-3 mt-2">
                    <div className="bg-white p-3 rounded-2xl shadow-md border border-purple-100 max-w-[200px] mx-auto">
                      {qrAccount?.qrImage ? (
                        <img
                          src={qrAccount.qrImage}
                          alt="Merchant UPI QR Code"
                          className="w-40 h-40 object-contain mx-auto"
                        />
                      ) : (
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(dynamicUpiUri)}`}
                          alt="Merchant UPI QR Code"
                          className="w-40 h-40 object-contain mx-auto"
                        />
                      )}
                    </div>
                    <span className="inline-block text-[11px] font-extrabold text-[#6D3FD6] bg-purple-100 border border-purple-200 px-3 py-1 rounded-full uppercase">
                      Scan and Pay
                    </span>
                    <p className="text-xs font-black text-slate-900">Amount: ₹{grandTotalAmount.toLocaleString("en-IN")}</p>
                    <p className="text-[10px] text-slate-500 font-mono">UPI ID: {upiIdToUse}</p>
                  </div>
                )}
              </div>
            </div>

            {/* DESKTOP LAYOUT (>= 768px): QR CODE PRIMARY VIEW */}
            <div className="hidden sm:block space-y-6">
              
              {/* DESKTOP PRIMARY QR CARD */}
              <div
                onClick={() => setPaymentMethod("QR")}
                className={`p-6 rounded-3xl border transition-all space-y-5 cursor-pointer relative ${
                  paymentMethod === "QR"
                    ? "border-[#6D3FD6] bg-purple-50/70 ring-2 ring-[#6D3FD6] shadow-md"
                    : "border-slate-200 bg-slate-50/60 hover:border-purple-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#6D3FD6] text-white flex items-center justify-center text-xl shadow-xs">
                      📱
                    </div>
                    <div>
                      <span className="font-extrabold text-sm text-slate-900 block">
                        Pay with UPI / Paytm QR Code
                      </span>
                      <span className="text-[11px] text-[#6D3FD6] font-extrabold">
                        Primary Desktop Payment Method • Instant Payment
                      </span>
                    </div>
                  </div>
                  <div className={`w-5.5 h-5.5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === "QR" ? "border-[#6D3FD6] bg-[#6D3FD6]" : "border-slate-300 bg-white"
                  }`}>
                    {paymentMethod === "QR" && <span className="text-[10px] text-white font-black">✓</span>}
                  </div>
                </div>

                <div className="pt-2 flex flex-col items-center justify-center text-center">
                  <div className="bg-white p-4 rounded-3xl shadow-lg border-2 border-purple-200 max-w-[260px] mx-auto">
                    {qrAccount?.qrImage ? (
                      <img
                        src={qrAccount.qrImage}
                        alt="Merchant UPI QR Code"
                        className="w-52 h-52 object-contain mx-auto"
                      />
                    ) : (
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(dynamicUpiUri)}`}
                        alt="Merchant UPI QR Code"
                        className="w-52 h-52 object-contain mx-auto"
                      />
                    )}
                  </div>

                  <div className="mt-3.5 mb-2">
                    <span className="inline-block text-xs font-extrabold text-[#6D3FD6] bg-purple-100/90 border border-purple-200 px-4 py-1.5 rounded-full uppercase tracking-wider shadow-xs">
                      Scan and Pay
                    </span>
                  </div>

                  <div className="mt-1 space-y-1 text-xs text-slate-600">
                    <p>Merchant: <strong className="text-slate-900">{settings.storeName}</strong></p>
                    <p>UPI ID: <strong className="text-[#6D3FD6] font-mono font-bold">{upiIdToUse}</strong></p>
                    <p className="text-xs pt-2 font-bold text-slate-700 uppercase tracking-wider">
                      Amount to Pay
                    </p>
                    <div className="text-2xl font-black text-[#6D3FD6] font-display">
                      ₹{grandTotalAmount.toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop App Selection Cards */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Or select your preferred mobile app
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Will open UPI link directly on supported desktop/mobile handlers
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  
                  <button
                    type="button"
                    onClick={() => handleAppTap("BHIM")}
                    className={`min-h-[52px] px-5 py-3 rounded-2xl border transition-all flex items-center justify-center gap-3 cursor-pointer ${
                      paymentMethod === "BHIM"
                        ? "border-[#6D3FD6] bg-purple-50/90 ring-2 ring-[#6D3FD6] shadow-md"
                        : "border-slate-200 bg-white hover:border-purple-300 hover:shadow-md hover:scale-[1.01]"
                    }`}
                  >
                    <img
                      src="/payment-logos/BHIM_Preview.png"
                      alt="BHIM UPI"
                      className="h-8 max-w-[120px] object-contain flex-shrink-0"
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAppTap("GPAY")}
                    className={`min-h-[52px] px-5 py-3 rounded-2xl border transition-all flex items-center justify-center gap-3 cursor-pointer ${
                      paymentMethod === "GPAY"
                        ? "border-[#6D3FD6] bg-purple-50/90 ring-2 ring-[#6D3FD6] shadow-md"
                        : "border-slate-200 bg-white hover:border-purple-300 hover:shadow-md hover:scale-[1.01]"
                    }`}
                  >
                    <img
                      src="/payment-logos/Gpay.png"
                      alt="Google Pay"
                      className="h-8 max-w-[120px] object-contain flex-shrink-0"
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAppTap("PHONEPE")}
                    className={`min-h-[52px] px-5 py-3 rounded-2xl border transition-all flex items-center justify-center gap-3 cursor-pointer ${
                      paymentMethod === "PHONEPE"
                        ? "border-[#6D3FD6] bg-purple-50/90 ring-2 ring-[#6D3FD6] shadow-md"
                        : "border-slate-200 bg-white hover:border-purple-300 hover:shadow-md hover:scale-[1.01]"
                    }`}
                  >
                    <img
                      src="/payment-logos/Phonepay.png"
                      alt="PhonePe"
                      className="h-8 max-w-[120px] object-contain flex-shrink-0"
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAppTap("PAYTM")}
                    className={`min-h-[52px] px-5 py-3 rounded-2xl border transition-all flex items-center justify-center gap-3 cursor-pointer ${
                      paymentMethod === "PAYTM"
                        ? "border-[#6D3FD6] bg-purple-50/90 ring-2 ring-[#6D3FD6] shadow-md"
                        : "border-slate-200 bg-white hover:border-purple-300 hover:shadow-md hover:scale-[1.01]"
                    }`}
                  >
                    <img
                      src="/payment-logos/paytm.png"
                      alt="Paytm"
                      className="h-8 max-w-[120px] object-contain flex-shrink-0"
                    />
                  </button>

                </div>
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

            {/* Complete Order / Pay Button */}
            <button
              type="submit"
              disabled={loading || items.length === 0}
              className="w-full py-4 mt-6 bg-[#6D3FD6] hover:bg-[#5B21B6] text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-purple-200"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Initializing Order...
                </span>
              ) : (
                <span>Complete Order ₹{grandTotalAmount.toLocaleString("en-IN")} →</span>
              )}
            </button>

            <div className="text-center text-[10px] text-slate-400 space-y-1 pt-1">
              <p>🔒 256-Bit Safe & Encrypted Order Checkout</p>
              <p>⚡ Genuine Sivakasi Factory Quality Guarantee</p>
            </div>
          </div>

        </form>
      </main>

      <Footer settings={settings} />
    </div>
  );
}
