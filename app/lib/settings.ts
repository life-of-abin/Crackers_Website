import { prisma } from "@/lib/prisma";

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

export const DEFAULT_SETTINGS: StoreSettings = {
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

export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const settings = await prisma.settings.findFirst({
      where: { id: 1 },
    });

    if (!settings) {
      return DEFAULT_SETTINGS;
    }

    return {
      id: settings.id,
      storeName: settings.storeName,
      phone: settings.phone,
      email: settings.email,
      address: settings.address,
      googleMapsUrl: settings.googleMapsUrl,
      whatsappNumber: settings.whatsappNumber,
      minOrderAmount: Number(settings.minOrderAmount),
      flatShippingFee: Number(settings.flatShippingFee),
      freeShippingThreshold: Number(settings.freeShippingThreshold),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}
