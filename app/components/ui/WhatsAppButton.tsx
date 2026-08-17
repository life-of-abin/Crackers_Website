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
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      title="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 flex items-center justify-center w-[66px] h-[66px] sm:w-[78px] sm:h-[78px] rounded-full shadow-2xl hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none focus:ring-4 focus:ring-emerald-400/50 group bg-white/10 backdrop-blur-xs p-1 border border-white/30"
    >
      <img
        src="/Whatsapp Chatbot.png"
        alt="WhatsApp Chatbot"
        className="w-full h-full object-contain rounded-full drop-shadow-xl transition-transform duration-300 group-hover:rotate-6"
      />
    </a>
  );
}
