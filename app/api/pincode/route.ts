import { NextRequest, NextResponse } from "next/server";
import { verifyIndianPincode } from "@/lib/pincode";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pin = searchParams.get("pin") || searchParams.get("pincode");
  const state = searchParams.get("state") || undefined;
  const tnOnlyParam = searchParams.get("tnOnly");
  
  // Default tnOnly to true for Tamil Nadu store delivery rules unless explicitly false
  const tnOnly = tnOnlyParam === "false" || tnOnlyParam === "0" ? false : true;

  if (!pin) {
    return NextResponse.json(
      { valid: false, error: "Please provide a valid 6-digit pincode parameter." },
      { status: 400 }
    );
  }

  const result = await verifyIndianPincode(pin, state, tnOnly);
  return NextResponse.json(result);
}

