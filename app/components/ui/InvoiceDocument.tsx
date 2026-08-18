"use client";

import React from "react";
import { numberToWords } from "@/lib/numberToWords";

interface InvoiceDocumentProps {
  order: {
    id: number;
    customerName: string;
    phone: string;
    email: string | null;
    address: string;
    landmark: string | null;
    city: string;
    district: string | null;
    state: string;
    pincode: string;
    billingAddress: string | null;
    billingCity: string | null;
    billingState: string | null;
    billingPincode: string | null;
    customerGstin: string | null;
    placeOfSupply: string | null;
    invoiceNumber: string | null;
    subtotal: any;
    discount: any;
    shipping: any;
    totalAmount: any;
    paymentStatus: string;
    orderStatus: string;
    paymentId: string | null;
    createdAt: Date | string;
    items: {
      id: number;
      productId: number;
      productName: string;
      quantity: number;
      unitType: string | null;
      packSize: string | null;
      price: any;
      total: any;
    }[];
    payments?: {
      paymentMethod: string | null;
      paymentRef: string | null;
    }[];
  };
  settings: {
    storeName: string;
    phone: string;
    email: string;
    address: string;
    gstin?: string | null;
    legalName?: string | null;
    invoiceTerms?: string | null;
    isGstRegistered?: boolean;
    signatureImage?: string | null;
  };
  products: {
    id: number;
    hsnCode: string | null;
    taxRate: any;
    mrp: any;
    price: any;
  }[];
}

export default function InvoiceDocument({ order, settings, products }: InvoiceDocumentProps) {
  const isGst = !!settings.isGstRegistered && !!settings.gstin;
  const isInterState = isGst && order.state.toLowerCase().trim() !== "tamil nadu";

  const productMap = new Map(products.map((p) => [p.id, p]));

  // Calculate items with GST values
  const enrichedItems = order.items.map((item, idx) => {
    const prod = productMap.get(item.productId);
    const hsn = prod?.hsnCode || "-";
    const taxRate = prod?.taxRate ? Number(prod.taxRate) : 18;
    const mrp = prod?.mrp ? Number(prod.mrp) : Number(item.price);
    const unitPrice = Number(item.price);
    
    // Calculate discount per item
    const discountPerUnit = Math.max(0, mrp - unitPrice);
    const totalDiscount = discountPerUnit * item.quantity;
    
    // Tax is inclusive in total.
    // Taxable Value = Total / (1 + (taxRate / 100))
    const totalAmount = Number(item.total);
    const taxableValue = totalAmount / (1 + taxRate / 100);
    const totalTax = totalAmount - taxableValue;

    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (isGst) {
      if (isInterState) {
        igst = totalTax;
      } else {
        cgst = totalTax / 2;
        sgst = totalTax / 2;
      }
    }

    return {
      sNo: idx + 1,
      name: item.productName,
      hsn,
      qty: item.quantity,
      unit: item.unitType || "BOX",
      packSize: item.packSize || "10 Pieces",
      mrp,
      rate: unitPrice,
      discount: totalDiscount,
      taxableValue,
      taxRate,
      cgst,
      sgst,
      igst,
      total: totalAmount,
    };
  });

  const totalDiscount = enrichedItems.reduce((acc, item) => acc + item.discount, 0);
  const totalTaxable = enrichedItems.reduce((acc, item) => acc + item.taxableValue, 0);
  const totalCgst = enrichedItems.reduce((acc, item) => acc + item.cgst, 0);
  const totalSgst = enrichedItems.reduce((acc, item) => acc + item.sgst, 0);
  const totalIgst = enrichedItems.reduce((acc, item) => acc + item.igst, 0);
  const totalTax = totalCgst + totalSgst + totalIgst;

  const orderDate = new Date(order.createdAt);
  const paymentMethod = order.payments?.[0]?.paymentMethod || "Online Payment";
  const paymentId = order.payments?.[0]?.paymentRef || order.paymentId || "N/A";

  const displayPaymentStatus = (status: string) => {
    const s = status.toUpperCase();
    if (s === "PAID" || s === "TEST_PAID" || s === "SUCCESS") return "PAID";
    if (s === "PENDING" || s === "PENDING_PAYMENT") return "PENDING";
    if (s === "REFUNDED") return "REFUNDED";
    return "FAILED";
  };

  const hasDifferentBilling =
    !!order.billingAddress &&
    order.billingAddress.trim().toLowerCase() !== order.address.trim().toLowerCase();

  const formattedGrandTotal = Number(order.totalAmount);
  const amountInWords = numberToWords(formattedGrandTotal);

  return (
    <div className="min-h-screen bg-slate-100 py-8 print:py-0 print:bg-white font-sans text-slate-800 flex flex-col items-center">
      {/* Dynamic print stylesheet */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            body {
              background-color: white !important;
              color: black !important;
            }
            .no-print, header, footer, nav, iframe, button, a[href*="wa.me"], [class*="WhatsApp"], [class*="whatsapp"] {
              display: none !important;
            }
            .print-full-width {
              width: 100% !important;
              max-width: 100% !important;
              padding: 0 !important;
              margin: 0 !important;
              box-shadow: none !important;
              border: none !important;
              background-color: white !important;
            }
            @page {
              size: A4 portrait;
              margin: 12mm;
            }
          }
        `
      }} />

      {/* Action Buttons Container */}
      <div className="w-full max-w-[210mm] flex justify-between items-center px-4 md:px-0 mb-6 no-print">
        <button
          onClick={() => {
            const isAdmin = window.location.pathname.startsWith("/admin");
            window.location.href = isAdmin ? `/admin/orders/${order.id}` : `/orders/${order.id}`;
          }}
          className="flex items-center gap-2 px-4 py-2 border border-slate-300 bg-white text-slate-700 hover:text-[#6D3FD6] rounded-xl text-sm font-bold transition-all hover:border-purple-300 shadow-xs cursor-pointer"
        >
          ← Back to Order
        </button>
        <div className="flex gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-300 text-slate-800 font-extrabold hover:text-[#6D3FD6] rounded-xl text-sm transition-all shadow-xs cursor-pointer"
          >
            🖨️ Print Invoice
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#6D3FD6] hover:bg-[#5B21B6] text-white font-extrabold rounded-xl text-sm transition-all shadow-md cursor-pointer"
          >
            📥 Download PDF
          </button>
        </div>
      </div>

      {/* Main Invoice Card */}
      <div className="w-full max-w-[210mm] bg-white border border-[#292E4D]/20 sm:rounded-3xl shadow-2xl p-6 md:p-10 flex flex-col justify-between print-full-width print:border-none print:shadow-none print:p-0 print:m-0 min-h-[297mm]">
        
        {/* Top Header */}
        <div className="border-b-2 border-[#F5C451] pb-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 md:gap-0 w-full">
            <div>
              <h1 className="text-3xl font-black text-[#080B1A] uppercase tracking-wider font-display flex items-center gap-2">
                <span>{settings.legalName || settings.storeName}</span>
              </h1>
              <p className="text-xs font-semibold text-[#6D3FD6] uppercase tracking-widest mt-1">
                Premium Fireworks • Celebrate Responsibly
              </p>
            </div>
            <div className="text-left md:text-right">
              <h2 className="text-3xl font-black text-[#080B1A] uppercase tracking-widest font-display">
                {isGst ? "TAX INVOICE" : "INVOICE"}
              </h2>
              <div className="mt-2 text-xs space-y-1 text-slate-600">
                <p><span className="font-bold text-[#080B1A]">Invoice No:</span> <span className="font-extrabold text-[#6D3FD6]">{order.invoiceNumber || `SC-2026-${String(order.id).padStart(6, "0")}`}</span></p>
                <p><span className="font-bold text-[#080B1A]">Invoice Date:</span> {orderDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Addresses & GSTINs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Supplier Info */}
          <div className="border-r border-slate-200/60 pr-6 print:border-r-0 print:pr-0">
            <h3 className="text-xs font-black text-[#080B1A] uppercase tracking-wider mb-2 pb-1 border-b border-slate-100">
              FROM (Supplier Details)
            </h3>
            <div className="text-xs text-slate-600 space-y-1">
              <p className="font-bold text-[#080B1A] text-sm">{settings.legalName || settings.storeName}</p>
              <p className="whitespace-pre-line leading-relaxed">{settings.address}</p>
              <p><span className="font-bold text-[#080B1A]">Phone:</span> {settings.phone}</p>
              <p><span className="font-bold text-[#080B1A]">Email:</span> {settings.email}</p>
              {isGst && (
                <p className="mt-1 pt-1 border-t border-dashed border-slate-200">
                  <span className="bg-[#6D3FD6]/10 text-[#6D3FD6] px-1.5 py-0.5 rounded font-bold">GSTIN: {settings.gstin}</span>
                </p>
              )}
            </div>
          </div>

          {/* Customer / Billing Info */}
          <div>
            <h3 className="text-xs font-black text-[#080B1A] uppercase tracking-wider mb-2 pb-1 border-b border-slate-100">
              BILL TO (Customer Billing Address)
            </h3>
            <div className="text-xs text-slate-600 space-y-1">
              <p className="font-bold text-[#080B1A] text-sm">{order.customerName}</p>
              {hasDifferentBilling ? (
                <p className="leading-relaxed">
                  {order.billingAddress}<br />
                  {order.billingCity}, {order.billingState} - {order.billingPincode}
                </p>
              ) : (
                <p className="leading-relaxed">
                  {order.address}<br />
                  {order.landmark && <>{order.landmark}<br /></>}
                  {order.city}, {order.state} - {order.pincode}
                </p>
              )}
              <p><span className="font-bold text-[#080B1A]">Phone:</span> {order.phone}</p>
              {order.email && <p><span className="font-bold text-[#080B1A]">Email:</span> {order.email}</p>}
              {isGst && order.customerGstin && (
                <p className="mt-1 pt-1 border-t border-dashed border-slate-200">
                  <span className="bg-[#6D3FD6]/10 text-[#6D3FD6] px-1.5 py-0.5 rounded font-bold">Customer GSTIN: {order.customerGstin}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Shipping details and Order Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="relative">
            <h3 className="text-xs font-black text-[#080B1A] uppercase tracking-wider mb-2 pb-1 border-b border-slate-100">
              SHIP TO (DELIVERY DESTINATION)
            </h3>
            {hasDifferentBilling ? (
              <div className="text-xs text-slate-600">
                <p className="font-bold text-[#080B1A]">{order.customerName}</p>
                <p className="leading-relaxed">
                  {order.address}{order.landmark ? `, ${order.landmark}` : ""}, {order.city}, {order.district ? `${order.district}, ` : ""}{order.state} - {order.pincode}
                </p>
              </div>
            ) : (
              <p className="text-xs font-semibold text-slate-500 italic">
                Shipping address same as billing address
              </p>
            )}
            <div className="hidden md:block absolute right-0 top-0 bottom-0 w-px bg-slate-100 transform translate-x-4 print:block print:bg-slate-200 print:translate-x-4" />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#080B1A] uppercase tracking-wider mb-2 pb-1 border-b border-slate-100">
              ORDER INFORMATION
            </h3>
            <div className="text-xs text-slate-600 grid grid-cols-2 gap-x-2 w-fit">
              <span className="font-bold text-[#080B1A]">Order ID:</span> <span>#{order.id}</span>
              <span className="font-bold text-[#080B1A]">Order Date:</span> <span>{orderDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
              {isGst && (
                <>
                  <span className="font-bold text-[#080B1A]">Place of Supply:</span> <span>{order.placeOfSupply || `${order.state}`}</span>
                  <span className="font-bold text-[#080B1A]">Reverse Charge:</span> <span>No</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Product Table Container */}
        <div className="flex-1 w-full overflow-x-auto mb-6">
          <table className="w-full text-left text-xs border-collapse border border-slate-200 min-w-[750px] print:min-w-full">
            <thead>
              <tr className="bg-[#5B21B6] text-white">
                <th className="p-2 border border-slate-200 font-black text-center w-[4%]">S.No</th>
                <th className="p-2 border border-slate-200 font-black w-[28%]">Product Description</th>
                {isGst && <th className="p-2 border border-slate-200 font-black text-center w-[8%]">HSN</th>}
                <th className="p-2 border border-slate-200 font-black text-center w-[6%]">Qty</th>
                <th className="p-2 border border-slate-200 font-black text-center w-[8%]">Unit</th>
                <th className="p-2 border border-slate-200 font-black text-right w-[10%]">Rate</th>
                <th className="p-2 border border-slate-200 font-black text-right w-[8%]">Discount</th>
                {isGst && <th className="p-2 border border-slate-200 font-black text-right w-[10%]">Taxable Value</th>}
                {isGst && (
                  <th className="p-2 border border-slate-200 font-black text-right w-[18%]">
                    {isInterState ? "IGST" : "CGST + SGST"}
                  </th>
                )}
                <th className="p-2 border border-slate-200 font-black text-right w-[10%]">Total</th>
              </tr>
            </thead>
            <tbody>
              {enrichedItems.map((item) => (
                <tr key={item.sNo} className="hover:bg-slate-50 transition-colors print:hover:bg-transparent">
                  <td className="p-2 border border-slate-200 text-center text-slate-500">{item.sNo}</td>
                  <td className="p-2 border border-slate-200">
                    <span className="font-bold text-[#080B1A] block">{item.name}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">{item.packSize}</span>
                  </td>
                  {isGst && <td className="p-2 border border-slate-200 text-center text-slate-600">{item.hsn}</td>}
                  <td className="p-2 border border-slate-200 text-center font-bold text-[#080B1A]">{item.qty}</td>
                  <td className="p-2 border border-slate-200 text-center text-slate-500">{item.unit}</td>
                  <td className="p-2 border border-slate-200 text-right text-slate-600">
                    <span className="block text-[10px] line-through text-slate-400">₹{item.mrp.toFixed(2)}</span>
                    <span className="font-medium">₹{item.rate.toFixed(2)}</span>
                  </td>
                  <td className="p-2 border border-slate-200 text-right text-emerald-600 font-medium">
                    {item.discount > 0 ? `-₹${item.discount.toFixed(2)}` : "-"}
                  </td>
                  {isGst && <td className="p-2 border border-slate-200 text-right text-slate-600">₹{item.taxableValue.toFixed(2)}</td>}
                  {isGst && (
                    <td className="p-2 border border-slate-200 text-right text-slate-600 leading-tight">
                      {isInterState ? (
                        <>
                          <span className="block font-medium">₹{item.igst.toFixed(2)}</span>
                          <span className="text-[9px] text-slate-400">({item.taxRate}%)</span>
                        </>
                      ) : (
                        <>
                          <span className="block font-medium">C: ₹{item.cgst.toFixed(2)}</span>
                          <span className="block font-medium">S: ₹{item.sgst.toFixed(2)}</span>
                          <span className="text-[9px] text-slate-400">({item.taxRate / 2}%)</span>
                        </>
                      )}
                    </td>
                  )}
                  <td className="p-2 border border-slate-200 text-right font-black text-[#080B1A]">₹{item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals, Payment Info & Amount in Words */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-slate-200 pb-6 mb-6">
          {/* Left Block: Amount in words */}
          <div className="space-y-4">
            <div className="text-xs">
              <span className="font-black text-[#080B1A] uppercase tracking-wider block mb-1">
                Amount in Words
              </span>
              <p className="font-bold text-[#6D3FD6] bg-[#6D3FD6]/5 px-3 py-2 rounded-lg border border-[#6D3FD6]/10 italic print:bg-white print:border-slate-200 print:text-black">
                {amountInWords}
              </p>
            </div>
          </div>

          {/* Right Block: Totals Summary */}
          <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-5 space-y-3.5 print:bg-white print:border-slate-200">
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal (Inclusive of tax):</span>
                <span className="font-semibold text-[#080B1A]">₹{Number(order.subtotal).toFixed(2)}</span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Total Discount applied:</span>
                  <span>-₹{totalDiscount.toFixed(2)}</span>
                </div>
              )}
              {isGst && (
                <>
                  <div className="flex justify-between pt-1.5 border-t border-slate-200/60">
                    <span>Taxable Value:</span>
                    <span className="font-semibold text-slate-800">₹{totalTaxable.toFixed(2)}</span>
                  </div>
                  {!isInterState ? (
                    <>
                      <div className="flex justify-between">
                        <span>CGST Amount:</span>
                        <span className="font-semibold text-slate-800">₹{totalCgst.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>SGST Amount:</span>
                        <span className="font-semibold text-slate-800">₹{totalSgst.toFixed(2)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between">
                      <span>IGST Amount:</span>
                      <span className="font-semibold text-slate-800">₹{totalIgst.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#6D3FD6] font-semibold text-[10px] print:text-black">
                    <span>Total Tax included:</span>
                    <span>₹{totalTax.toFixed(2)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between pt-1.5 border-t border-slate-200/60">
                <span>{order.orderType === "PICKUP" ? "Pickup Charge:" : "Shipping / Delivery Charges:"}</span>
                <span className="font-semibold text-slate-800">
                  {order.orderType === "PICKUP" ? "FREE" : (Number((order as any).deliveryCharge) || Number(order.shipping)) === 0 ? "FREE" : `₹${(Number((order as any).deliveryCharge) || Number(order.shipping)).toFixed(2)}`}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t-2 border-[#F5C451] flex justify-between items-center">
              <span className="text-sm font-black text-[#080B1A] uppercase tracking-wide">Grand Total:</span>
              <span className="text-xl font-black text-[#080B1A] bg-[#F5C451] px-3 py-1 rounded-lg shadow-sm print:shadow-none">
                ₹{formattedGrandTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer: Terms, Signature & Contacts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          {/* Terms & Conditions */}
          <div className="text-[10px] text-slate-500 leading-relaxed max-w-md">
            <h4 className="text-[10px] font-black text-[#080B1A] uppercase tracking-widest mb-1.5">
              TERMS & CONDITIONS
            </h4>
            <div className="border-l-2 border-[#6D3FD6] pl-3 space-y-1 font-medium whitespace-pre-line print:border-slate-300">
              {settings.invoiceTerms || (
                <>
                  1. Goods once sold are subject to the applicable return/refund policy.
                  {"\n"}2. Fireworks should be used only in accordance with safety instructions and local laws.
                  {"\n"}3. Delivery is subject to serviceability and regional restrictions.
                  {"\n"}4. Invoice values are based on the order confirmed by the seller.
                </>
              )}
            </div>
          </div>

          {/* Signature Box */}
          <div className="text-right flex flex-col items-end">
            <div className="w-48 border-b border-slate-300 min-h-[50px] mb-2 flex items-center justify-center">
              {settings.signatureImage ? (
                <img
                  src={settings.signatureImage}
                  alt="Authorized Signature"
                  className="max-h-[50px] object-contain print:max-h-[50px]"
                />
              ) : (
                <span className="text-[10px] text-slate-300 italic font-serif select-none">
                  Digital Signature Empty
                </span>
              )}
            </div>
            <p className="text-[10px] font-black text-[#080B1A] uppercase tracking-wider">
              For SIVAKASI CRACKERS
            </p>
            <p className="text-[9px] text-[#6D3FD6] uppercase tracking-widest font-extrabold mt-0.5 print:text-black">
              Authorized Signatory
            </p>
          </div>
        </div>

        {/* Footer Branding Info */}
        <div className="mt-10 border-t border-slate-200/50 pt-4 flex flex-col md:flex-row justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider gap-2">
          <span>Thank you for celebrating with Sivakasi Crackers.</span>
          <span className="text-[#6D3FD6] font-extrabold print:text-black">Light Up Your Diwali</span>
          <span className="text-slate-400/80">Computer-generated Invoice</span>
        </div>

      </div>
    </div>
  );
}
