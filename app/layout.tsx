import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";

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
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
