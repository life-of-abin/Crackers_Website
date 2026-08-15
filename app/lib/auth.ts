import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.AUTH_SECRET || "sivakasi-crackers-super-secret-key-2026";

export interface JWTPayload {
  userId: number;
  email: string;
  name: string;
  role: "CUSTOMER" | "ADMIN";
}

// Common disallowed weak passwords
const DISALLOWED_PASSWORDS = new Set([
  "12345678",
  "123456789",
  "password",
  "password123",
  "qwerty123",
  "admin123",
  "sivakasi123",
  "crackers123",
  "fireworks123",
]);

/**
 * Strict Password Policy Validation:
 * - At least 12 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character
 * - Not a common weak password
 */
export function validatePasswordPolicy(password: string): { valid: boolean; error?: string } {
  if (!password || password.length < 12) {
    return { valid: false, error: "Password must be at least 12 characters long." };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: "Password must contain at least one uppercase letter (A-Z)." };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: "Password must contain at least one lowercase letter (a-z)." };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: "Password must contain at least one number (0-9)." };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, error: "Password must contain at least one special character (e.g. !@#$%^&*)." };
  }
  if (DISALLOWED_PASSWORDS.has(password.toLowerCase().trim())) {
    return { valid: false, error: "This password is too common. Please choose a stronger password." };
  }
  return { valid: true };
}

// PBKDF2-HMAC-SHA512 password hashing with 100,000 iterations
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const iterations = 100000;
  const hash = crypto.pbkdf2Sync(password, salt, iterations, 64, "sha512").toString("hex");
  return `pbkdf2:${iterations}:${salt}:${hash}`;
}

// Password verification with timing-safe comparison
export function comparePassword(password: string, storedHash: string): boolean {
  if (!storedHash) return false;

  // Modern pbkdf2 format: pbkdf2:iterations:salt:hash
  if (storedHash.startsWith("pbkdf2:")) {
    const parts = storedHash.split(":");
    if (parts.length === 4) {
      const iterations = parseInt(parts[1], 10);
      const salt = parts[2];
      const originalHash = parts[3];
      const hash = crypto.pbkdf2Sync(password, salt, iterations, 64, "sha512").toString("hex");
      return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(originalHash));
    }
  }

  // Legacy single-colon format: salt:hash (1000 iterations)
  if (storedHash.includes(":")) {
    const [salt, originalHash] = storedHash.split(":");
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
    if (hash === originalHash) return true;
  }

  return false;
}

export function signToken(payload: JWTPayload): string {
  const data = JSON.stringify({ ...payload, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 });
  const signature = crypto.createHmac("sha256", JWT_SECRET).update(data).digest("hex");
  return Buffer.from(data).toString("base64url") + "." + signature;
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const [encodedData, signature] = token.split(".");
    if (!encodedData || !signature) return null;
    const data = Buffer.from(encodedData, "base64url").toString("utf-8");
    const expectedSig = crypto.createHmac("sha256", JWT_SECRET).update(data).digest("hex");
    
    // Timing-safe signature comparison
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return null;
    }
    
    const payload = JSON.parse(data);
    if (payload.exp && payload.exp < Date.now()) return null;
    return {
      userId: payload.userId,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<JWTPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return null;
    const session = verifyToken(token);
    if (!session) return null;

    // Verify account status and role directly in database
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { status: true, role: true },
    });

    if (!user || user.status !== "ACTIVE") {
      return null;
    }

    return {
      ...session,
      role: user.role as "CUSTOMER" | "ADMIN",
    };
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<JWTPayload> {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized access.");
  }
  return session;
}

export async function requireAdmin(): Promise<JWTPayload> {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/admin/login");
  }
  return session;
}

/**
 * Generates cryptographically secure 6-digit numeric OTP
 */
export function generateNumericOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Generates secure hash for OTP storage
 */
export function hashOTP(otp: string): string {
  return crypto.createHash("sha256").update(otp).digest("hex");
}
