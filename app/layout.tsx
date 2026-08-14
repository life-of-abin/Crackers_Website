import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sri Sivakasi Crackers | Premium Festive Fireworks E-Commerce",
  description: "Buy genuine Sivakasi fireworks & festival crackers online at factory wholesale prices. Express delivery, 100% safe packaging, and festive discounts.",
  keywords: ["sivakasi crackers", "online fireworks store", "diwali crackers", "sparklers", "rockets", "gift boxes"],
  openGraph: {
    title: "Sri Sivakasi Crackers - Factory Price Fireworks Online",
    description: "Buy genuine Sivakasi crackers online with direct factory discount.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${outfit.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#080B1A] text-[#FFF9EA] font-sans selection:bg-[#6D3FD6] selection:text-white">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
