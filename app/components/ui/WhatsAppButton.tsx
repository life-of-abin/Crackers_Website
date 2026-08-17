"use client";

import React from "react";
import { usePathname } from "next/navigation";

export const WHATSAPP_NUMBER = "919629525907";
export const DEFAULT_WHATSAPP_MESSAGE = "Hi, I would like to know more about your crackers.";

interface WhatsAppButtonProps {
  number?: string;
  message?: string;
}

export default function WhatsAppButton({
  number = WHATSAPP_NUMBER,
  message = DEFAULT_WHATSAPP_MESSAGE,
}: WhatsAppButtonProps) {
  const pathname = usePathname();

  // Hide floating button on all admin routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  // Clean phone number (strip spaces, +, -, etc.)
  const cleanNumber = number.replace(/\D/g, "");
  const formattedNumber = cleanNumber.length === 10 ? `91${cleanNumber}` : cleanNumber;

  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodedMessage}`;

  return (
    <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 pointer-events-auto select-none translate-z-0">
      {/* Continuous glowing pulse aura ring */}
      <span className="absolute inset-0 rounded-full bg-[#25D366]/40 animate-ping pointer-events-none" />

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        title="Chat with us on WhatsApp"
        className="relative flex items-center justify-center w-[66px] h-[66px] sm:w-[78px] sm:h-[78px] rounded-full ring-4 ring-[#25D366] shadow-[0_0_25px_rgba(37,211,102,0.7)] hover:shadow-[0_0_35px_rgba(37,211,102,0.9)] transition-all duration-300 hover:scale-110 active:scale-95 group bg-white/10 backdrop-blur-xs p-1 border border-white/40"
      >
        <img
          src="/Whatsapp Chatbot.png"
          alt="WhatsApp Chatbot"
          className="w-full h-full object-contain rounded-full drop-shadow-xl transition-transform duration-300 group-hover:rotate-6"
        />
      </a>
    </div>
  );
}
