"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  email: "abinesh.ece2003@gmail.com",
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
  const router = useRouter();
  const { items, subtotal, clearCart, isMounted, totalQuantity } = useCart();
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
  const upiRef = useRef<HTMLInputElement | null>(null);

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
  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "QR" | "GPAY" | "PHONEPE" | "PAYTM">("QR");
  const [dummyUpiId, setDummyUpiId] = useState("");
  const [paymentRef, setPaymentRef] = useState("");
  const [paymentAccounts, setPaymentAccounts] = useState<any[]>([]);
  const [copiedToast, setCopiedToast] = useState(false);

  // Submit & Order State
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [confirmedOrder, setConfirmedOrder] = useState<{
    id: number;
    formattedId: string;
    totalAmount: number;
    customerName: string;
    phone: string;
    email: string;
    address: string;
    landmark?: string;
    city: string;
    district: string;
    state: string;
    pincode: string;
    paymentStatus: string;
    paymentMethod: string;
    items: any[];
  } | null>(null);

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

  const qrAccount = paymentAccounts.find((a) => a.isPrimary) || paymentAccounts[0];
  const upiIdToUse = qrAccount?.upiId || "9629525907@upi";

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
  }, [pincode]); // Only run when pincode changes!

  // PIN Code Input Handler with immediate clearing of old location data
  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
    setPincode(cleaned);

    // Clear error immediately on change
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.pincode;
      return copy;
    });
    setPinError("");

    // If pincode is modified or invalidated, immediately clear old location data
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

  // UPI Input Handler
  const handleUpiInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDummyUpiId(val);
    if (val.includes("@")) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.upiId;
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

    if (paymentMethod === "UPI" && (!dummyUpiId || !dummyUpiId.includes("@"))) {
      newErrors.upiId = "Please enter a valid dummy UPI ID (e.g. test@upi).";
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
      else if (firstInvalidField === "upiId") ref = upiRef;

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

  // SUBMIT ORDER HANDLER
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError("");

    if (!validateForm()) return;

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
          paymentMethod === "UPI" ? dummyUpiId : (paymentRef.trim() || `PAY_TEST_${Date.now()}`),
          paymentMethod
         );

        if (paymentRes.success) {
          clearCart();
          setLoading(false);
          router.push(`/order-confirmation/${result.orderId}`);
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
      <div className="min-h-screen bg-[#080B1A] text-[#FFF9EA] flex items-center justify-center">
        <div className="animate-spin text-4xl">🎆</div>
      </div>
    );
  }

  // SAME-PAGE ORDER CONFIRMATION SCREEN
  if (confirmedOrder) {
    return (
      <div className="min-h-screen bg-[#080B1A] text-[#FFF9EA] flex flex-col justify-between relative overflow-hidden">
        <Header settings={settings} />
        <FireworksCanvas durationSeconds={7} />

        <main className="max-w-3xl mx-auto px-4 py-12 flex-1 w-full text-center z-10 space-y-8">
          
          <div className="bg-[#151A35]/90 backdrop-blur-xl border border-[#6D3FD6]/50 p-6 sm:p-10 rounded-3xl shadow-2xl space-y-6">
            
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#F5C451] to-[#6D3FD6] rounded-full text-4xl shadow-lg animate-bounce">
              🎉
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FFE29A] via-[#F5C451] to-[#FFE29A] tracking-tight font-display">
              ORDER CONFIRMED!
            </h1>
            
            <p className="text-[#B9B8C7] text-xs sm:text-sm max-w-md mx-auto">
              Thank you for ordering with <strong className="text-[#F5C451]">{settings.storeName}</strong>! Your cracker order has been successfully placed.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              <div className="bg-[#11152E] p-4 rounded-2xl border border-[#292E4D] space-y-1">
                <span className="text-[10px] text-[#F5C451] font-extrabold uppercase tracking-wider block">
                  Order Number
                </span>
                <span className="text-xl font-black text-[#FFF9EA] font-mono">{confirmedOrder.formattedId}</span>
              </div>

              <div className="bg-[#11152E] p-4 rounded-2xl border border-[#292E4D] space-y-1">
                <span className="text-[10px] text-[#F5C451] font-extrabold uppercase tracking-wider block">
                  Total Amount
                </span>
                <span className="text-xl font-black text-[#F5C451]">₹{Number(confirmedOrder.totalAmount).toLocaleString("en-IN")}</span>
              </div>

              <div className="bg-[#11152E] p-4 rounded-2xl border border-[#292E4D] space-y-1 sm:col-span-2">
                <span className="text-[10px] text-[#F5C451] font-extrabold uppercase tracking-wider block">
                  Delivery Address
                </span>
                <p className="font-extrabold text-[#FFF9EA] text-xs">{confirmedOrder.customerName}</p>
                <p className="text-[#B9B8C7] text-xs leading-relaxed">
                  {confirmedOrder.address}{confirmedOrder.landmark ? `, Near ${confirmedOrder.landmark}` : ""}, {confirmedOrder.city}, {confirmedOrder.district}, {confirmedOrder.state} - <strong className="text-[#FFF9EA]">{confirmedOrder.pincode}</strong>
                </p>
              </div>

              <div className="bg-[#11152E] p-4 rounded-2xl border border-[#292E4D] space-y-1 sm:col-span-2">
                <span className="text-[10px] text-[#F5C451] font-extrabold uppercase tracking-wider block">
                  Contact Information
                </span>
                <p className="text-xs text-[#B9B8C7]">
                  Mobile: <strong className="text-[#FFE29A] font-mono text-sm">{confirmedOrder.phone}</strong>
                </p>
                <p className="text-xs text-[#B9B8C7]">
                  Email: <span className="text-[#FFF9EA]">{confirmedOrder.email}</span>
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#292E4D] flex flex-wrap items-center justify-center gap-4">
              <a
                href={`/api/orders/${confirmedOrder.id}/invoice`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 bg-[#F5C451] hover:bg-[#FFE29A] text-[#080B1A] font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 gold-glow"
              >
                <span>📄 Download Invoice PDF</span>
              </a>

              <Link
                href={`/orders?query=${encodeURIComponent(confirmedOrder.phone)}`}
                className="w-full sm:w-auto px-6 py-3.5 bg-[#11152E] hover:bg-[#151A35] text-[#F5C451] border border-[#292E4D] font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <span>📦 View Order History</span>
              </Link>

              <Link
                href="/products"
                className="w-full sm:w-auto px-6 py-3.5 bg-[#11152E] hover:bg-[#151A35] text-[#FFF9EA] border border-[#292E4D] font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
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
      <div className="min-h-screen bg-[#080B1A] text-[#FFF9EA] flex flex-col justify-between">
        <Header settings={settings} />
        <div className="max-w-md mx-auto my-16 p-8 bg-[#151A35] rounded-3xl border border-[#292E4D] text-center space-y-4 shadow-xl">
          <div className="text-5xl">🛒</div>
          <h2 className="text-lg font-bold text-[#FFF9EA] font-display">Your cart is empty</h2>
          <p className="text-xs text-[#B9B8C7]">Please add items to your cart before proceeding to checkout.</p>
          <Link href="/products" className="inline-block bg-[#F5C451] text-[#080B1A] text-xs font-bold px-6 py-2.5 rounded-xl">
            Browse Products
          </Link>
        </div>
        <Footer settings={settings} />
      </div>
    );
  }

  if (totalQuantity < 2) {
    return (
      <div className="min-h-screen bg-[#080B1A] text-[#FFF9EA] flex flex-col justify-between">
        <Header settings={settings} />
        <div className="max-w-md mx-auto my-16 p-8 bg-[#151A35] rounded-3xl border border-[#292E4D] text-center space-y-4 shadow-xl">
          <div className="text-5xl">⚠️</div>
          <h2 className="text-lg font-bold text-[#FFF9EA] font-display">Minimum Order Not Met</h2>
          <p className="text-xs text-[#B9B8C7]">Minimum purchase quantity is 2 items.</p>
          <Link href="/products" className="inline-block bg-[#F5C451] text-[#080B1A] text-xs font-bold px-6 py-2.5 rounded-xl">
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
    <div className="min-h-screen flex flex-col bg-[#080B1A] text-[#FFF9EA]">
      <Header settings={settings} />

      {/* Copy Toast */}
      {copiedToast && (
        <div className="fixed top-20 right-5 z-50 bg-[#11152E] text-[#F5C451] border border-[#F5C451]/40 text-xs font-extrabold px-4 py-3 rounded-2xl shadow-2xl animate-bounce flex items-center gap-2">
          <span>✓ UPI ID copied to clipboard</span>
        </div>
      )}

      <div className="bg-[#11152E] text-[#FFF9EA] py-8 border-b border-[#292E4D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-[#F5C451] text-xs font-semibold uppercase tracking-wider mb-1">
            <Link href="/cart" className="hover:underline">Cart</Link>
            <span>/</span>
            <span>Guest Checkout</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#FFF9EA] font-display">
            Delivery Details & Order Checkout
          </h1>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        
        {globalError && (
          <div className="mb-6 p-4 bg-[#11152E] border border-[#6D3FD6] text-[#FFE29A] text-xs font-bold rounded-2xl flex items-center justify-between shadow-md">
            <span className="flex items-center gap-2">⚠️ {globalError}</span>
            <button onClick={() => setGlobalError("")} className="text-[#F5C451] hover:text-white font-extrabold text-sm">✕</button>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="max-w-3xl mx-auto space-y-6" noValidate>
          
          {/* Section 1: Customer Contact Information */}
          <div className="bg-[#151A35] rounded-3xl border border-[#292E4D] p-6 sm:p-8 shadow-xl space-y-5">
            <h2 className="text-sm font-black text-[#FFF9EA] border-b border-[#292E4D] pb-3 uppercase tracking-wider flex items-center gap-2 font-display">
              <span className="w-6 h-6 rounded-full bg-[#6D3FD6] text-white text-xs flex items-center justify-center font-bold">1</span>
              Customer Contact Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Full Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#B9B8C7] uppercase tracking-wider mb-1">
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
                  className={`w-full px-4 py-2.5 bg-[#11152E] border rounded-xl text-xs font-semibold text-[#FFF9EA] placeholder-[#B9B8C7]/50 focus:outline-none focus:ring-2 transition-all ${
                    errors.name ? "border-red-500 ring-1 ring-red-500 bg-red-500/5 shadow-[0_0_8px_rgba(239,68,68,0.2)]" : "border-[#292E4D] focus:ring-[#F5C451] focus:border-[#F5C451]"
                  }`}
                />
                {errors.name && (
                  <span id="name-error" className="text-[11px] font-bold text-red-500 mt-1 block">
                    {errors.name}
                  </span>
                )}
              </div>

              {/* Mobile Input */}
              <div>
                <label className="block text-xs font-bold text-[#B9B8C7] uppercase tracking-wider mb-1">
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
                    className={`w-full px-4 py-2.5 bg-[#11152E] border rounded-xl text-xs font-semibold text-[#FFF9EA] font-mono placeholder-[#B9B8C7]/50 focus:outline-none focus:ring-2 transition-all ${
                      errors.phone ? "border-red-500 ring-1 ring-red-500 bg-red-500/5 shadow-[0_0_8px_rgba(239,68,68,0.2)]" : "border-[#292E4D] focus:ring-[#F5C451] focus:border-[#F5C451]"
                    }`}
                  />
                </div>
                <span className="text-[10px] text-[#B9B8C7] mt-1 block">Enter 10-digit Indian mobile number</span>

                {errors.phone && (
                  <span id="phone-error" className="text-[11px] font-bold text-red-500 mt-1 block">
                    {errors.phone}
                  </span>
                )}
              </div>

              {/* Email Address Input */}
              <div>
                <label className="block text-xs font-bold text-[#B9B8C7] uppercase tracking-wider mb-1">
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
                  className={`w-full px-4 py-2.5 bg-[#11152E] border rounded-xl text-xs font-semibold text-[#FFF9EA] placeholder-[#B9B8C7]/50 focus:outline-none focus:ring-2 transition-all ${
                    errors.email ? "border-red-500 ring-1 ring-red-500 bg-red-500/5 shadow-[0_0_8px_rgba(239,68,68,0.2)]" : "border-[#292E4D] focus:ring-[#F5C451] focus:border-[#F5C451]"
                  }`}
                />
                <span className="text-[10px] text-[#B9B8C7] mt-1 block">Order updates & receipt sent here</span>

                {errors.email && (
                  <span id="email-error" className="text-[11px] font-bold text-red-500 mt-1 block">
                    {errors.email}
                  </span>
                )}
              </div>

            </div>
          </div>

          {/* Section 2: Address & PIN Code */}
          <div className="bg-[#151A35] rounded-3xl border border-[#292E4D] p-6 sm:p-8 shadow-xl space-y-5">
            <h2 className="text-sm font-black text-[#FFF9EA] border-b border-[#292E4D] pb-3 uppercase tracking-wider flex items-center gap-2 font-display">
              <span className="w-6 h-6 rounded-full bg-[#6D3FD6] text-white text-xs flex items-center justify-center font-bold">2</span>
              Delivery Address & Smart Postal Auto-Fill
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#B9B8C7] uppercase tracking-wider mb-1">
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
                  className={`w-full px-4 py-2.5 bg-[#11152E] border rounded-xl text-xs font-semibold text-[#FFF9EA] placeholder-[#B9B8C7]/50 focus:outline-none focus:ring-2 transition-all ${
                    errors.address ? "border-red-500 ring-1 ring-red-500 bg-red-500/5 shadow-[0_0_8px_rgba(239,68,68,0.2)]" : "border-[#292E4D] focus:ring-[#F5C451] focus:border-[#F5C451]"
                  }`}
                />
                {errors.address && (
                  <span id="address-error" className="text-[11px] font-bold text-red-500 mt-1 block">
                    {errors.address}
                  </span>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#B9B8C7] uppercase tracking-wider mb-1">
                  Address Line 2 / Landmark (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Near Bus Stand / Opposite SBI Bank"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#11152E] border border-[#292E4D] rounded-xl text-xs font-semibold text-[#FFF9EA] placeholder-[#B9B8C7]/50 focus:outline-none focus:ring-2 focus:ring-[#F5C451]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#B9B8C7] uppercase tracking-wider mb-1">
                  State *
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#11152E] border border-[#292E4D] rounded-xl text-xs font-semibold text-[#FFF9EA] focus:outline-none focus:ring-2 focus:ring-[#F5C451]"
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st} className="bg-[#11152E] text-[#FFF9EA]">{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#B9B8C7] uppercase tracking-wider mb-1">
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
                  className={`w-full px-4 py-2.5 bg-[#11152E] border rounded-xl text-xs font-semibold text-[#FFF9EA] font-mono focus:outline-none focus:ring-2 transition-all ${
                    errors.pincode ? "border-red-500 ring-1 ring-red-500 bg-red-500/5 shadow-[0_0_8px_rgba(239,68,68,0.2)]" : "border-[#292E4D] focus:ring-[#F5C451] focus:border-[#F5C451]"
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
                    <span className="text-red-500 block bg-[#11152E] p-2 rounded-lg border border-red-500/40 text-[11px] mt-1">
                      {pinError}
                    </span>
                  )}
                  {errors.pincode && !pinError && (
                    <span id="pincode-error" className="text-red-500 block text-[11px] mt-1">
                      {errors.pincode}
                    </span>
                  )}
                  {pinVerifiedInfo && pinVerifiedInfo.valid && (
                    <div className="text-[#4ADE80] bg-[#11152E] p-2.5 rounded-lg border border-[#4ADE80]/40 text-[11px] space-y-0.5 mt-1">
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
                <label className="block text-xs font-bold text-[#B9B8C7] uppercase tracking-wider mb-1">
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
                  className={`w-full px-4 py-2.5 bg-[#11152E] border rounded-xl text-xs font-semibold text-[#FFF9EA] focus:outline-none focus:ring-2 transition-all ${
                    errors.city ? "border-red-500 ring-1 ring-red-500 bg-red-500/5 shadow-[0_0_8px_rgba(239,68,68,0.2)]" : "border-[#292E4D] focus:ring-[#F5C451] focus:border-[#F5C451]"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                />
                {errors.city && (
                  <span id="city-error" className="text-[11px] font-bold text-red-500 mt-1 block">
                    {errors.city}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#B9B8C7] uppercase tracking-wider mb-1">
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
                  className={`w-full px-4 py-2.5 bg-[#11152E] border rounded-xl text-xs font-semibold text-[#FFF9EA] focus:outline-none focus:ring-2 transition-all ${
                    errors.district ? "border-red-500 ring-1 ring-red-500 bg-red-500/5 shadow-[0_0_8px_rgba(239,68,68,0.2)]" : "border-[#292E4D] focus:ring-[#F5C451] focus:border-[#F5C451]"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                />
                {errors.district && (
                  <span id="district-error" className="text-[11px] font-bold text-red-500 mt-1 block">
                    {errors.district}
                  </span>
                )}
              </div>

            </div>
          </div>

          {/* Section 3: Payment Options */}
          <div className="bg-[#151A35] rounded-3xl border border-[#292E4D] p-6 sm:p-8 shadow-xl space-y-6">
            <h2 className="text-sm font-black text-[#FFF9EA] border-b border-[#292E4D] pb-3 uppercase tracking-wider flex items-center gap-2 font-display">
              <span className="w-6 h-6 rounded-full bg-[#6D3FD6] text-white text-xs flex items-center justify-center font-bold">3</span>
              Payment Options
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("QR")}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center ${
                  paymentMethod === "QR"
                    ? "border-[#6D3FD6] bg-[#6D3FD6]/20 ring-2 ring-[#6D3FD6]"
                    : "border-[#292E4D] hover:border-[#6D3FD6]/60 bg-[#11152E]"
                }`}
              >
                <span className="text-xl block mb-1">📱</span>
                <span className="font-extrabold text-[11px] text-[#FFF9EA] block">QR Code</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("UPI")}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center ${
                  paymentMethod === "UPI"
                    ? "border-[#6D3FD6] bg-[#6D3FD6]/20 ring-2 ring-[#6D3FD6]"
                    : "border-[#292E4D] hover:border-[#6D3FD6]/60 bg-[#11152E]"
                }`}
              >
                <span className="text-xl block mb-1">💳</span>
                <span className="font-extrabold text-[11px] text-[#FFF9EA] block">UPI ID</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("GPAY")}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center ${
                  paymentMethod === "GPAY"
                    ? "border-[#6D3FD6] bg-[#6D3FD6]/20 ring-2 ring-[#6D3FD6]"
                    : "border-[#292E4D] hover:border-[#6D3FD6]/60 bg-[#11152E]"
                }`}
              >
                <img src="https://cdn.simpleicons.org/googlepay/white" alt="Google Pay" className="w-8 h-8 mb-1 object-contain" />
                <span className="font-extrabold text-[11px] text-[#FFF9EA] block">Google Pay</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("PHONEPE")}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center ${
                  paymentMethod === "PHONEPE"
                    ? "border-[#6D3FD6] bg-[#6D3FD6]/20 ring-2 ring-[#6D3FD6]"
                    : "border-[#292E4D] hover:border-[#6D3FD6]/60 bg-[#11152E]"
                }`}
              >
                <img src="https://cdn.simpleicons.org/phonepe/white" alt="PhonePe" className="w-8 h-8 mb-1 object-contain" />
                <span className="font-extrabold text-[11px] text-[#FFF9EA] block">PhonePe</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("PAYTM")}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center ${
                  paymentMethod === "PAYTM"
                    ? "border-[#6D3FD6] bg-[#6D3FD6]/20 ring-2 ring-[#6D3FD6]"
                    : "border-[#292E4D] hover:border-[#6D3FD6]/60 bg-[#11152E]"
                }`}
              >
                <img src="https://cdn.simpleicons.org/paytm/white" alt="Paytm" className="w-10 h-8 mb-1 object-contain" />
                <span className="font-extrabold text-[11px] text-[#FFF9EA] block">Paytm</span>
              </button>
            </div>

            {/* Dynamic QR Code Card */}
            {paymentMethod === "QR" && (
              <div className="p-6 bg-[#11152E] rounded-3xl text-white space-y-4 text-center border border-[#292E4D]">
                <h3 className="font-bold text-[#F5C451]">TEST QR CODE</h3>
                <div className="inline-block bg-white p-3 rounded-2xl shadow-xl">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=TEST_QR_CODE`}
                    alt="TEST UPI QR Code"
                    className="w-40 h-40 object-contain mx-auto"
                  />
                </div>
                <p className="text-xs text-[#B9B8C7]">Scan this test QR code to simulate a payment.</p>
              </div>
            )}

            {/* UPI Direct App Card */}
            {paymentMethod === "UPI" && (
              <div className="p-6 bg-[#11152E] rounded-3xl text-white space-y-4 border border-[#292E4D]">
                <p className="text-xs text-[#B9B8C7] font-medium">Enter a Dummy UPI ID for testing:</p>
                
                <input
                  ref={upiRef}
                  type="text"
                  placeholder="e.g. test@upi"
                  value={dummyUpiId}
                  onChange={handleUpiInput}
                  aria-invalid={errors.upiId ? "true" : "false"}
                  aria-describedby={errors.upiId ? "upi-error" : undefined}
                  className={`w-full px-4 py-2 bg-[#080B1A] border rounded-xl text-xs font-mono text-[#FFF9EA] focus:outline-none focus:ring-2 transition-all ${
                    errors.upiId ? "border-red-500 ring-1 ring-red-500 bg-red-500/5 shadow-[0_0_8px_rgba(239,68,68,0.2)]" : "border-[#292E4D] focus:ring-[#F5C451] focus:border-[#F5C451]"
                  }`}
                />
                {errors.upiId && (
                  <span id="upi-error" className="text-[11px] font-bold text-red-500 mt-1 block text-left">
                    {errors.upiId}
                  </span>
                )}
              </div>
            )}

            {["GPAY", "PHONEPE", "PAYTM"].includes(paymentMethod) && (
              <div className="p-6 bg-[#11152E] rounded-3xl text-white space-y-4 border border-[#292E4D] text-center">
                <p className="text-xs text-[#B9B8C7] font-medium">Test Payment Selected</p>
                <p className="text-xs font-bold text-[#4ADE80]">Placing the order will simulate a successful {paymentMethod} payment.</p>
              </div>
            )}

            {/* Order Button */}
            <button
              type="submit"
              disabled={loading || items.length < 2}
              className="w-full py-4 mt-6 bg-[#F5C451] hover:bg-[#FFE29A] text-[#080B1A] font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed gold-glow"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-[#080B1A] border-t-transparent rounded-full animate-spin"></span>
                  Processing Order...
                </span>
              ) : items.length < 2 ? (
                <span>Min 2 Items Required to Checkout</span>
              ) : (
                <span>Submit Order & Pay ₹{grandTotal.toLocaleString("en-IN")}</span>
              )}
            </button>

            <div className="text-center text-[10px] text-[#B9B8C7] space-y-1 pt-2">
              <p>🔒 100% Direct Sivakasi Factory Quality Guarantee</p>
              <p>⚡ Instant Same-Page Order Confirmation</p>
            </div>
          </div>

        </form>

      </main>

      <Footer settings={settings} />
    </div>
  );
}
