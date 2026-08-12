import { NextRequest, NextResponse } from "next/server";
import { verifyIndianPincode } from "@/lib/pincode";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pin = searchParams.get("pin") || searchParams.get("pincode");
  const state = searchParams.get("state") || undefined;

  if (!pin) {
    return NextResponse.json(
      { valid: false, error: "Please provide a valid pincode parameter." },
      { status: 400 }
    );
  }

  const result = await verifyIndianPincode(pin, state);
  return NextResponse.json(result);
}
