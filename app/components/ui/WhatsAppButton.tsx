"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { formatWhatsAppNumber } from "@/lib/pincode";

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

  // Hide floating button on all admin routes and invoice routes
  if (pathname?.startsWith("/admin") || pathname?.includes("/invoice")) {
    return null;
  }

  const formattedNumber = formatWhatsAppNumber(number);
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodedMessage}`;

  return (
    <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 pointer-events-auto select-none translate-z-0 print:hidden no-print">
      {/* Continuous glowing pulse aura ring in live WhatsApp green */}
      <span className="absolute inset-0 rounded-full bg-[#25D366]/40 animate-ping pointer-events-none" />

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        title="Chat with us on WhatsApp"
        className="relative flex items-center justify-center w-[64px] h-[64px] sm:w-[74px] sm:h-[74px] rounded-full bg-white ring-4 ring-[#25D366] shadow-[0_0_25px_rgba(37,211,102,0.6)] hover:shadow-[0_0_35px_rgba(37,211,102,0.9)] transition-all duration-300 hover:scale-110 active:scale-95 group p-3.5 border border-emerald-100"
      >
        {/* Smooth official live WhatsApp green outline icon */}
        <svg
          className="w-full h-full text-[#25D366] fill-current transition-transform duration-300 group-hover:rotate-6"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M19.05 4.91A9.816 9.816 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01zm-7.01 15.24c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.32a8.198 8.198 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24zm4.52-6.18c-.25-.12-1.47-.72-1.69-.8-.23-.09-.39-.12-.56.12-.17.25-.64.8-.78.97-.15.17-.29.19-.54.07-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.15-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.53.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.12-.22-.19-.47-.31z" />
        </svg>
      </a>
    </div>
  );
}



