"use server";

import { prisma } from "@/lib/prisma";
import {
  comparePassword,
  hashPassword,
  requireAdmin,
  signToken,
  getSession,
  validatePasswordPolicy,
} from "@/lib/auth";
import { verifyIndianPincode, normalizeIndianPhone, isValidEmailFormat, isValidGmailFormat } from "@/lib/pincode";
import { validateTransactionRef, generateInvoiceNumber, isValidCustomerName } from "@/lib/payment-utils";
import { getStoreSettings } from "@/lib/settings";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const OWNER_EMAIL = "abinesh.ece2003@gmail.com";
const OWNER_MOBILE = "9629525907";

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

// ==========================================
// 1. ADMIN AUTHENTICATION & SETUP ACTIONS
// ==========================================

export async function adminLoginAction(formData: FormData) {
  try {
    const rawInput = (formData.get("email") as string || "").trim();
    const input = rawInput.toLowerCase();
    const password = (formData.get("password") as string || "").trim();

    if (!rawInput || !password) {
      return { error: "Please enter your admin email or phone number and password." };
    }

    const phoneResult = normalizeIndianPhone(rawInput);
    const normalizedPhone = phoneResult.valid ? phoneResult.phone : null;

    // Search user by email OR phone where role is ADMIN
    let user = await prisma.user.findFirst({
      where: {
        role: "ADMIN",
        OR: [
          { email: input },
          { phone: rawInput },
          ...(normalizedPhone ? [{ phone: normalizedPhone }] : []),
        ],
      },
    });

    // Fallback: If input is the owner email or owner mobile, look up any ADMIN account
    if (
      !user &&
      (input === OWNER_EMAIL ||
        rawInput === OWNER_MOBILE ||
        (normalizedPhone && (normalizedPhone === OWNER_MOBILE || normalizedPhone === `+91${OWNER_MOBILE}`)))
    ) {
      user = await prisma.user.findFirst({
        where: { role: "ADMIN" },
      });
    }

    if (!user) {
      return { error: "No admin account found for this email/phone. Please click 'Owner Initial Setup' below if setting up for the first time." };
    }

    if (user.status !== "ACTIVE") {
      return { error: "Admin account is currently suspended or disabled." };
    }

    const isValid = comparePassword(password, user.passwordHash);
    if (!isValid) {
      return { error: "Invalid admin email/phone or password." };
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: "ADMIN",
    });

    const cookieStore = await cookies();
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return { success: true, role: "ADMIN" };
  } catch (error: any) {
    console.error("Admin login error details:", error);
    const msg = error?.message || "";
    if (msg.includes("Can't reach database") || msg.includes("Prisma") || msg.includes("timeout")) {
      return { error: "Database connection busy. Please try clicking Login again." };
    }
    return { error: `Authentication issue: ${msg || "Unable to complete login. Please try again."}` };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
  revalidatePath("/");
  revalidatePath("/admin");
  return { success: true };
}

/**
 * Completes Admin Account Initial Setup
 */
export async function completeAdminSetupAction(formData: FormData) {
  try {
    const email = (formData.get("email") as string || "").trim().toLowerCase();
    const password = (formData.get("password") as string || "").trim();
    const confirmPassword = (formData.get("confirmPassword") as string || "").trim();

    if (email !== OWNER_EMAIL) {
      return { error: "Unauthorized. Only the registered owner email address can setup the admin account." };
    }

    if (!password || !confirmPassword) {
      return { error: "Please enter and confirm your password." };
    }

    if (password !== confirmPassword) {
      return { error: "Passwords do not match." };
    }

    // Enforce 12+ character strong password policy
    const policyCheck = validatePasswordPolicy(password);
    if (!policyCheck.valid) {
      return { error: policyCheck.error };
    }

    const passwordHash = hashPassword(password);

    // Upsert admin account in User model
    const existingAdmin = await prisma.user.findFirst({
      where: { email },
    });

    if (existingAdmin) {
      await prisma.user.update({
        where: { id: existingAdmin.id },
        data: {
          name: "Abinesh",
          phone: OWNER_MOBILE,
          passwordHash,
          role: "ADMIN",
          status: "ACTIVE",
        },
      });
    } else {
      await prisma.user.create({
        data: {
          name: "Abinesh",
          email,
          phone: OWNER_MOBILE,
          passwordHash,
          role: "ADMIN",
          status: "ACTIVE",
        },
      });
    }

    return { success: true, message: "Admin account setup completed successfully! You can now log in at /admin/login." };
  } catch (error: any) {
    console.error("Complete admin setup error:", error);
    return { error: "Failed to set up admin account." };
  }
}

// ==========================================
// 2. GUEST CHECKOUT & ORDER ACTION (TRANSACTIONAL)
// ==========================================

export async function createOrderAction(data: {
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  landmark?: string;
  city: string;
  district?: string;
  state: string;
  pincode: string;
  paymentMethod?: string;
  orderType?: "DELIVERY" | "PICKUP";
  cartItems: { productId: number; quantity: number }[];
}) {
  try {
    const orderType: "DELIVERY" | "PICKUP" = data.orderType === "PICKUP" ? "PICKUP" : "DELIVERY";

    // 1. Mandatory customer fields check
    if (!data.customerName || !data.phone) {
      return { error: "Please provide your name and phone number." };
    }

    if (!isValidCustomerName(data.customerName)) {
      return { error: "Name can contain letters and spaces only." };
    }

    // 2. Email format validation (Strict Gmail requirement)
    if (!data.email || !isValidGmailFormat(data.email)) {
      return { error: "Please enter a valid Gmail address ending with @gmail.com." };
    }

    // 3. Indian Mobile Phone Normalization
    const phoneResult = normalizeIndianPhone(data.phone);
    if (!phoneResult.valid) {
      return { error: "Please enter a valid 10-digit Indian mobile number." };
    }

    // 4. Address & Pincode validation — only required for DELIVERY orders
    let resolvedCity = data.city?.trim() || "";
    let resolvedDistrict = data.district?.trim() || null;
    let resolvedState = data.state?.trim() || "Tamil Nadu";
    let resolvedPincode = data.pincode?.trim() || "000000";
    let resolvedAddress = data.address?.trim() || "";

    if (orderType === "DELIVERY") {
      if (!data.address || !data.city || !data.pincode || !data.state) {
        return { error: "Please complete all mandatory delivery address fields." };
      }

      // India Post PIN Code Verification & State Cross-Validation (Tamil Nadu Only)
      const pinCheck = await verifyIndianPincode(data.pincode, data.state, true);
      if (!pinCheck.valid) {
        return { error: pinCheck.error || "Please enter a valid Tamil Nadu PIN code." };
      }

      resolvedCity = pinCheck.city || data.city.trim();
      resolvedDistrict = pinCheck.district || data.district?.trim() || null;
      resolvedState = pinCheck.state || data.state.trim();
      resolvedPincode = pinCheck.pincode;
      resolvedAddress = data.address.trim();
    } else {
      // PICKUP: use store address placeholder
      const settings = await prisma.settings.findFirst({ where: { id: 1 } });
      resolvedAddress = data.address?.trim() || "Store Pickup";
      resolvedCity = "Sivakasi";
      resolvedDistrict = "Virudhunagar";
      resolvedState = "Tamil Nadu";
      resolvedPincode = "626123";
    }

    if (!data.cartItems || data.cartItems.length === 0) {
      return { error: "Your shopping cart is empty." };
    }

    // 5. Load store settings
    const settings = await prisma.settings.findFirst({ where: { id: 1 } });

    // 6. ATOMIC POSTGRESQL TRANSACTION: Verify Latest Stock, Deduct Stock, Create Order
    const resultOrder = await prisma.$transaction(async (tx) => {
      const productIds = data.cartItems.map((item) => item.productId);
      
      // Query freshest product prices and stock quantities inside transaction
      const dbProducts = await tx.product.findMany({
        where: { id: { in: productIds } },
      });

      const productMap = new Map(dbProducts.map((p) => [p.id, p]));

      let calculatedSubtotal = 0;
      const validatedItems: {
        productId: number;
        productName: string;
        quantity: number;
        unitType: string;
        packSize: string;
        price: number;
        total: number;
      }[] = [];

      for (const cartItem of data.cartItems) {
        if (cartItem.quantity <= 0) {
          throw new Error("Invalid item quantity.");
        }

        const dbProd = productMap.get(cartItem.productId);
        if (!dbProd) {
          throw new Error(`Product with ID ${cartItem.productId} was not found.`);
        }
        if (!dbProd.active) {
          throw new Error(`Product "${dbProd.name}" is currently unavailable.`);
        }

        // CRITICAL CONCURRENT STOCK CHECK
        if (dbProd.stock < cartItem.quantity) {
          const unit = dbProd.unitType || "box";
          throw new Error(
            `Sorry, only ${dbProd.stock} ${unit.toLowerCase()}${dbProd.stock === 1 ? "" : "es"} of "${dbProd.name}" ${dbProd.stock === 1 ? "is" : "are"} currently available. Please update your cart quantity.`
          );
        }

        const unitPrice = Number(dbProd.price);
        const itemTotal = unitPrice * cartItem.quantity;
        calculatedSubtotal += itemTotal;

        validatedItems.push({
          productId: dbProd.id,
          productName: dbProd.name,
          quantity: cartItem.quantity,
          unitType: dbProd.unitType || "BOX",
          packSize: dbProd.packSize || dbProd.quantity || "10 Pieces",
          price: unitPrice,
          total: itemTotal,
        });
      }

      const grandTotal = calculatedSubtotal;
      const selectedPayMethod = data.paymentMethod || "DIRECT_ORDER";

      // Set initial order status based on type
      // DELIVERY: await admin confirmation of delivery charge
      // PICKUP: go straight to PROCESSING
      const initialOrderStatus = orderType === "PICKUP" ? "PROCESSING" : "AWAITING_DELIVERY_CONFIRMATION";

      // Create Order & OrderItems
      const createdOrder = await tx.order.create({
        data: {
          customerName: data.customerName.trim(),
          phone: phoneResult.phone,
          email: data.email ? data.email.toLowerCase().trim() : null,
          address: resolvedAddress,
          landmark: data.landmark ? data.landmark.trim() : null,
          city: resolvedCity,
          district: resolvedDistrict,
          state: resolvedState,
          pincode: resolvedPincode,
          subtotal: calculatedSubtotal,
          discount: 0,
          shipping: 0,
          totalAmount: grandTotal,
          orderType: orderType,
          deliveryCharge: 0,
          deliveryConfirmed: orderType === "PICKUP", // PICKUP: no delivery charge needed
          paymentStatus: "PENDING",
          orderStatus: initialOrderStatus,
          paymentMethod: selectedPayMethod,
          paidAt: null,
          items: {
            create: validatedItems.map((item) => ({
              productId: item.productId,
              productName: item.productName,
              quantity: item.quantity,
              unitType: item.unitType,
              packSize: item.packSize,
              price: item.price,
              total: item.total,
            })),
          },
        },
      });

      // NOTE: Invoice number is NOT generated at order creation.
      // It is only generated when payment/delivery is confirmed.
      // This prevents premature invoice assignment.

      // Deduct stock for each item atomically inside transaction
      // Use Promise.all to batch all updates in parallel — avoids N serial round-trips
      await Promise.all(
        validatedItems.map((item) =>
          tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { decrement: item.quantity },
              purchases: { increment: item.quantity },
            },
          })
        )
      );

      return {
        orderId: createdOrder.id,
        orderType,
        grandTotal,
        subtotal: calculatedSubtotal,
      };
    }, {
      timeout: 15000, // 15s — gives headroom for large carts (default is 5s)
    });

    // Invalidate Next.js Server Caches
    revalidatePath("/admin/orders");
    revalidatePath("/admin/dashboard");
    revalidatePath("/products");

    return {
      success: true,
      orderId: resultOrder.orderId,
      orderType: resultOrder.orderType,
      totalAmount: resultOrder.grandTotal,
      subtotal: resultOrder.subtotal,
    };
  } catch (error: any) {
    console.error("Order creation error:", error);
    return { error: error.message || "Failed to process order. Please try again." };
  }
}

// ==========================================
// 2b. ADMIN: CONFIRM DELIVERY CHARGE
// ==========================================

export async function confirmDeliveryChargeAction(orderId: number, deliveryCharge: number) {
  try {
    await requireAdmin();

    if (!orderId || isNaN(orderId)) {
      return { error: "Invalid order ID." };
    }

    if (isNaN(deliveryCharge) || deliveryCharge < 0) {
      return { error: "Delivery charge must be a valid non-negative number." };
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      return { error: "Order not found." };
    }

    if (existingOrder.orderType !== "DELIVERY") {
      return { error: "Delivery charge can only be set for DELIVERY orders." };
    }

    const newTotal = Number(existingOrder.subtotal) - Number(existingOrder.discount) + deliveryCharge;

    await prisma.order.update({
      where: { id: orderId },
      data: {
        deliveryCharge: deliveryCharge,
        deliveryConfirmed: true,
        totalAmount: newTotal,
        orderStatus: existingOrder.orderStatus === "AWAITING_DELIVERY_CONFIRMATION" ? "PROCESSING" : existingOrder.orderStatus,
      },
    });

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath(`/order-confirmation/${orderId}`);

    return { success: true, newTotal, deliveryCharge };
  } catch (error: any) {
    console.error("confirmDeliveryChargeAction error:", error);
    return { error: error.message || "Failed to confirm delivery charge." };
  }
}

export async function confirmPaymentAction(orderId: number, paymentRefStr: string, paymentMethod: string = "DUMMY") {
  return verifyAndConfirmPaymentAction(orderId, paymentRefStr, paymentMethod);
}

export async function verifyAndConfirmPaymentAction(
  orderId: number,
  transactionRef: string,
  paymentMethod: string = "UPI_QR"
) {
  try {
    if (!orderId || isNaN(orderId)) {
      return { error: "Invalid order ID." };
    }

    // 1. Server-side transaction reference validation
    const refCheck = validateTransactionRef(transactionRef);
    if (!refCheck.valid) {
      return { error: refCheck.error || "Invalid transaction reference." };
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payments: true },
    });

    if (!existingOrder) {
      return { error: "Order not found." };
    }

    // Check if already paid
    if (existingOrder.paymentStatus === "PAID" || existingOrder.paymentStatus === "TEST_PAID") {
      return {
        success: true,
        orderId: existingOrder.id,
        invoiceNumber: existingOrder.invoiceNumber || generateInvoiceNumber(existingOrder.id, existingOrder.createdAt),
      };
    }

    // DELIVERY orders must have delivery charge confirmed before invoice can be generated
    if (existingOrder.orderType === "DELIVERY" && !existingOrder.deliveryConfirmed) {
      return { error: "Delivery charge must be confirmed before payment can be processed for this order." };
    }

    // Generate unique invoice number if not already assigned (locked once generated)
    const invoiceNumber = existingOrder.invoiceNumber || generateInvoiceNumber(existingOrder.id, existingOrder.createdAt);
    const now = new Date();

    // Update order status atomically
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "PAID",
        paymentMethod: paymentMethod,
        paymentId: transactionRef.trim(),
        orderStatus: "CONFIRMED",
        invoiceNumber: invoiceNumber,
        invoiceGeneratedAt: existingOrder.invoiceGeneratedAt ?? now,
        paidAt: now,
      },
    });

    // Record payment attempt transaction
    await prisma.payment.create({
      data: {
        orderId: existingOrder.id,
        paymentRef: transactionRef.trim(),
        paymentMethod: paymentMethod,
        amount: existingOrder.totalAmount,
        status: "SUCCESS",
      },
    });

    revalidatePath(`/order-confirmation/${orderId}`);
    revalidatePath(`/orders/${orderId}`);
    revalidatePath("/admin/orders");
    revalidatePath("/admin/dashboard");

    return {
      success: true,
      orderId: existingOrder.id,
      invoiceNumber: invoiceNumber,
    };
  } catch (error: any) {
    console.error("verifyAndConfirmPaymentAction error:", error);
    return { error: error.message || "Server-side payment verification failed. Please try again." };
  }
}

export async function handlePaymentFailureAction(orderId: number, status: "FAILED" | "CANCELLED" = "FAILED") {
  try {
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) return { error: "Order not found." };

    if (existingOrder.paymentStatus !== "PAID" && existingOrder.paymentStatus !== "TEST_PAID") {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: status,
        },
      });

      await prisma.payment.create({
        data: {
          orderId,
          amount: existingOrder.totalAmount,
          status: status,
        },
      });
    }

    revalidatePath(`/checkout`);
    revalidatePath(`/admin/orders`);
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to update payment status." };
  }
}

// ==========================================
// 3. ADMIN PRODUCT ACTIONS
// ==========================================

export async function createProductAction(formData: FormData) {
  try {
    await requireAdmin();

    const name = formData.get("name") as string;
    const categoryId = parseInt(formData.get("categoryId") as string);
    const price = parseFloat(formData.get("price") as string);
    const mrp = parseFloat(formData.get("mrp") as string);
    const quantity = (formData.get("quantity") as string) || "10 Pieces";
    const unitType = (formData.get("unitType") as string) || "BOX";
    const packSize = (formData.get("packSize") as string) || quantity || "10 Pieces";
    const stock = parseInt((formData.get("stock") as string) || "100");
    const description = (formData.get("description") as string) || null;
    const rawImage = (formData.get("image") as string)?.trim();
    const image = rawImage ? rawImage : "/placeholder.png";
    const badge = (formData.get("badge") as string) || null;
    const featured = formData.get("featured") === "true";
    const active = formData.get("active") !== "false";

    if (!name || !categoryId || isNaN(price) || isNaN(mrp)) {
      return { error: "Name, Category, Price, and MRP are required." };
    }

    let slug = slugify(name);
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const discountPercentage = Math.round(((mrp - price) / mrp) * 100);
    const discountText = discountPercentage > 0 ? `${discountPercentage}% OFF` : null;

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        categoryId,
        price,
        mrp,
        discount: discountText,
        quantity: packSize,
        unitType,
        packSize,
        stock: Math.max(0, stock),
        description,
        image,
        badge,
        featured,
        active,
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/");

    return { success: true, productId: product.id };
  } catch (error: any) {
    return { error: error.message || "Failed to create product." };
  }
}

export async function updateProductAction(productId: number, formData: FormData) {
  try {
    await requireAdmin();

    const name = formData.get("name") as string;
    const categoryId = parseInt(formData.get("categoryId") as string);
    const price = parseFloat(formData.get("price") as string);
    const mrp = parseFloat(formData.get("mrp") as string);
    const quantity = formData.get("quantity") as string;
    const unitType = (formData.get("unitType") as string) || "BOX";
    const packSize = (formData.get("packSize") as string) || quantity || "10 Pieces";
    const stock = parseInt(formData.get("stock") as string);
    const description = (formData.get("description") as string) || null;
    const rawImage = (formData.get("image") as string)?.trim();
    const image = rawImage ? rawImage : "/placeholder.png";
    const badge = (formData.get("badge") as string) || null;
    const featured = formData.get("featured") === "true";
    const active = formData.has("active") ? formData.get("active") === "true" : true;

    const discountPercentage = Math.round(((mrp - price) / mrp) * 100);
    const discountText = discountPercentage > 0 ? `${discountPercentage}% OFF` : null;

    await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        categoryId,
        price,
        mrp,
        discount: discountText,
        quantity: packSize,
        unitType,
        packSize,
        stock: Math.max(0, stock),
        description,
        image,
        badge,
        featured,
        active,
      },
    });

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${productId}`);
    revalidatePath("/products");

    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to update product." };
  }
}

export async function deleteProductAction(productId: number) {
  try {
    await requireAdmin();

    await prisma.product.delete({
      where: { id: productId },
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");

    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Unable to delete product. It may be linked to existing orders." };
  }
}

export async function toggleProductActiveAction(productId: number, active: boolean) {
  try {
    await requireAdmin();
    await prisma.product.update({
      where: { id: productId },
      data: { active },
    });
    revalidatePath("/admin/products");
    revalidatePath("/products");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateStockAction(productId: number, stock: number) {
  try {
    await requireAdmin();
    await prisma.product.update({
      where: { id: productId },
      data: { stock: Math.max(0, stock) },
    });
    revalidatePath("/admin/products");
    revalidatePath("/products");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

// ==========================================
// 4. ADMIN CATEGORY ACTIONS
// ==========================================

export async function createCategoryAction(formData: FormData) {
  try {
    await requireAdmin();

    const name = formData.get("name") as string;
    const description = (formData.get("description") as string) || null;
    const icon = (formData.get("icon") as string) || null;
    const image = (formData.get("image") as string) || null;
    const sortOrder = parseInt((formData.get("sortOrder") as string) || "0");

    if (!name) return { error: "Category name is required." };

    let slug = slugify(name);
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    await prisma.category.create({
      data: {
        name,
        slug,
        description,
        icon,
        image,
        sortOrder: isNaN(sortOrder) ? 0 : sortOrder,
        active: true,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/products");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to create category." };
  }
}

export async function updateCategoryAction(categoryId: number, formData: FormData) {
  try {
    await requireAdmin();

    const name = formData.get("name") as string;
    const description = (formData.get("description") as string) || null;
    const icon = (formData.get("icon") as string) || null;
    const image = (formData.get("image") as string) || null;
    const sortOrder = parseInt((formData.get("sortOrder") as string) || "0");
    const active = formData.get("active") === "true";

    await prisma.category.update({
      where: { id: categoryId },
      data: {
        name,
        description,
        icon,
        image,
        sortOrder: isNaN(sortOrder) ? 0 : sortOrder,
        active,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/products");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to update category." };
  }
}

export async function deleteCategoryAction(categoryId: number) {
  try {
    await requireAdmin();

    // Safely unassign products from this category before deletion so products are NEVER deleted
    await prisma.product.updateMany({
      where: { categoryId },
      data: { categoryId: null },
    });

    await prisma.category.delete({
      where: { id: categoryId },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/products");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to delete category." };
  }
}

// ==========================================
// 5. ADMIN ORDER ACTIONS
// ==========================================

export async function updateOrderStatusAction(orderId: number, orderStatus: string) {
  try {
    await requireAdmin();
    await prisma.order.update({
      where: { id: orderId },
      data: { orderStatus },
    });
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath(`/order-confirmation/${orderId}`);
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updatePaymentStatusAction(orderId: number, paymentStatus: string) {
  try {
    await requireAdmin();

    const existingOrder = await prisma.order.findUnique({ where: { id: orderId } });
    if (!existingOrder) return { error: "Order not found." };

    if (paymentStatus === "PAID") {
      const settings = await getStoreSettings();
      const minOrder = settings.minOrderAmount || 500;

      const orderItems = await prisma.orderItem.findMany({ where: { orderId } });
      const rawConfirmedItems = await prisma.$queryRaw<any[]>`
        SELECT id, "isConfirmed" FROM "OrderItem" WHERE "orderId" = ${orderId}
      `;
      const rawMap = new Map(rawConfirmedItems.map((r) => [Number(r.id), r.isConfirmed !== false]));

      const confirmedSubtotal = orderItems
        .filter((item) => rawMap.get(item.id) !== false)
        .reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

      if (confirmedSubtotal < minOrder) {
        return {
          error: `Cannot mark order as PAID because confirmed order value (₹${confirmedSubtotal.toLocaleString("en-IN")}) is below the minimum required order amount of ₹${minOrder.toLocaleString("en-IN")}.`,
        };
      }
    }

    // When marking as PAID, generate and lock invoice number if not set
    let invoiceNumber = existingOrder.invoiceNumber;
    let invoiceGeneratedAt = existingOrder.invoiceGeneratedAt;
    if (paymentStatus === "PAID" && !invoiceNumber) {
      invoiceNumber = generateInvoiceNumber(orderId, existingOrder.createdAt);
      invoiceGeneratedAt = new Date();
    }

    // When marking paymentStatus as FAILED, also update orderStatus to FAILED automatically!
    const updatedOrderStatus = paymentStatus === "FAILED" ? "FAILED" : existingOrder.orderStatus;

    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus,
        orderStatus: updatedOrderStatus,
        ...(invoiceNumber ? { invoiceNumber } : {}),
        ...(invoiceGeneratedAt ? { invoiceGeneratedAt } : {}),
        ...(paymentStatus === "PAID" ? { paidAt: existingOrder.paidAt ?? new Date() } : {}),
      },
    });
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath(`/order-confirmation/${orderId}`);
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

// ==========================================
// 6. ADMIN SETTINGS ACTIONS
// ==========================================

export async function updateSettingsAction(formData: FormData) {
  try {
    await requireAdmin();

    const storeName = formData.get("storeName") as string;
    
    const rawPhone = (formData.get("phone") as string || "").trim();
    const phoneRes = normalizeIndianPhone(rawPhone);
    const phone = phoneRes.valid ? phoneRes.phone : rawPhone.startsWith("+91") ? rawPhone : `+91${rawPhone.replace(/[^0-9]/g, "")}`;

    const rawWhatsapp = (formData.get("whatsappNumber") as string || "").trim();
    const whatsappRes = normalizeIndianPhone(rawWhatsapp);
    const whatsappNumber = whatsappRes.valid ? whatsappRes.phone : rawWhatsapp.startsWith("+91") ? rawWhatsapp : `+91${rawWhatsapp.replace(/[^0-9]/g, "")}`;

    const email = formData.get("email") as string;
    const address = formData.get("address") as string;
    const googleMapsUrl = formData.get("googleMapsUrl") as string;
    const minOrderAmount = parseFloat((formData.get("minOrderAmount") as string) || "300");
    const flatShippingFeeStr = (formData.get("flatShippingFee") as string) || "0";
    const flatShippingFee = parseFloat(flatShippingFeeStr) || 0;
    const freeShippingThreshold = parseFloat((formData.get("freeShippingThreshold") as string) || "0");

    const legalName = (formData.get("legalName") as string) || null;
    const gstin = (formData.get("gstin") as string) || null;
    const invoiceTerms = (formData.get("invoiceTerms") as string) || null;
    const isGstRegistered = formData.get("isGstRegistered") === "true";

    await prisma.settings.upsert({
      where: { id: 1 },
      update: {
        storeName,
        phone,
        email,
        address,
        googleMapsUrl,
        whatsappNumber,
        minOrderAmount,
        flatShippingFee,
        freeShippingThreshold,
        legalName,
        gstin,
        invoiceTerms,
        isGstRegistered,
      },
      create: {
        id: 1,
        storeName,
        phone,
        email,
        address,
        googleMapsUrl,
        whatsappNumber,
        minOrderAmount,
        flatShippingFee,
        freeShippingThreshold,
        legalName,
        gstin,
        invoiceTerms,
        isGstRegistered,
      },
    });

    revalidatePath("/admin/settings");
    revalidatePath("/");
    revalidatePath("/cart");
    revalidatePath("/checkout");
    revalidatePath("/shipping");
    revalidatePath("/api/settings");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to update store settings." };
  }
}

// ==========================================
// 7. ADMIN PAYMENT ACCOUNT & AUDIT ACTIONS
// ==========================================

export async function getPaymentAccountsAction() {
  try {
    let accounts = await prisma.paymentAccount.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Pre-seed official UPI ID if empty
    if (accounts.length === 0) {
      const defaultUpi = await prisma.paymentAccount.create({
        data: {
          type: "UPI",
          displayName: "Official Store UPI",
          upiId: "abinesh.ece2003@okhdfcbank",
          isActive: true,
        },
      });
      accounts = [defaultUpi];
    }

    return { success: true, accounts };
  } catch (error: any) {
    return { error: error.message || "Failed to fetch payment accounts." };
  }
}

export async function savePaymentAccountAction(data: {
  id?: number;
  type: string;
  displayName: string;
  upiId?: string;
  qrImage?: string;
  bankName?: string;
  accountHolder?: string;
  accountNumber?: string;
  ifsc?: string;
  branch?: string;
  isActive?: boolean;
}) {
  try {
    const admin = await requireAdmin();

    if (data.id) {
      await prisma.paymentAccount.update({
        where: { id: data.id },
        data: {
          type: data.type,
          displayName: data.displayName,
          upiId: data.upiId || null,
          qrImage: data.qrImage || null,
          bankName: data.bankName || null,
          accountHolder: data.accountHolder || null,
          accountNumber: data.accountNumber || null,
          ifsc: data.ifsc || null,
          branch: data.branch || null,
          isActive: data.isActive !== undefined ? data.isActive : true,
        },
      });
    } else {
      await prisma.paymentAccount.create({
        data: {
          type: data.type,
          displayName: data.displayName,
          upiId: data.upiId || null,
          qrImage: data.qrImage || null,
          bankName: data.bankName || null,
          accountHolder: data.accountHolder || null,
          accountNumber: data.accountNumber || null,
          ifsc: data.ifsc || null,
          branch: data.branch || null,
          isActive: data.isActive !== undefined ? data.isActive : true,
        },
      });
    }

    // Audit Log
    await prisma.adminAuditLog.create({
      data: {
        adminEmail: admin.email,
        action: data.id ? "UPDATE_PAYMENT_ACCOUNT" : "CREATE_PAYMENT_ACCOUNT",
        details: `Saved payment account: ${data.displayName} (${data.type})`,
      },
    });

    revalidatePath("/admin/payments");
    revalidatePath("/checkout");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to save payment account." };
  }
}

export async function togglePaymentAccountAction(id: number, isActive: boolean) {
  try {
    const admin = await requireAdmin();
    await prisma.paymentAccount.update({
      where: { id },
      data: { isActive },
    });

    await prisma.adminAuditLog.create({
      data: {
        adminEmail: admin.email,
        action: "TOGGLE_PAYMENT_ACCOUNT",
        details: `Toggled payment account #${id} to ${isActive ? "ACTIVE" : "DISABLED"}`,
      },
    });

    revalidatePath("/admin/payments");
    revalidatePath("/checkout");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deletePaymentAccountAction(id: number) {
  try {
    const admin = await requireAdmin();
    await prisma.paymentAccount.delete({
      where: { id },
    });

    await prisma.adminAuditLog.create({
      data: {
        adminEmail: admin.email,
        action: "DELETE_PAYMENT_ACCOUNT",
        details: `Deleted payment account #${id}`,
      },
    });

    revalidatePath("/admin/payments");
    revalidatePath("/checkout");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export interface OfflineCartItemInput {
  productId: number;
  quantity: number;
}

export async function createOfflineBillAction(input: {
  customerName?: string;
  phone?: string;
  paymentMethod: string;
  discountAmount?: number;
  items: OfflineCartItemInput[];
}) {
  try {
    const admin = await requireAdmin();

    if (!input.items || input.items.length === 0) {
      return { error: "Please add at least one product to the bill." };
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch & validate products & stock
      const productIds = input.items.map((i) => i.productId);
      const dbProducts = await tx.product.findMany({
        where: { id: { in: productIds } },
      });

      const productMap = new Map(dbProducts.map((p) => [p.id, p]));

      let subtotal = 0;
      const orderItemsToCreate = [];

      for (const item of input.items) {
        const prod = productMap.get(item.productId);
        if (!prod) {
          throw new Error(`Product #${item.productId} not found.`);
        }
        if (prod.stock < item.quantity) {
          throw new Error(`Insufficient stock for "${prod.name}". Available: ${prod.stock}, Requested: ${item.quantity}`);
        }

        const itemPrice = Number(prod.price);
        const itemTotal = itemPrice * item.quantity;
        subtotal += itemTotal;

        orderItemsToCreate.push({
          productId: prod.id,
          productName: prod.name,
          quantity: item.quantity,
          unitType: prod.unitType || "BOX",
          packSize: prod.packSize || prod.quantity || "10 Pieces",
          price: itemPrice,
          total: itemTotal,
        });

        // Atomic stock decrement & purchases increment
        await tx.product.update({
          where: { id: prod.id },
          data: {
            stock: { decrement: item.quantity },
            purchases: { increment: item.quantity },
          },
        });
      }

      const discount = Math.max(0, input.discountAmount || 0);
      const totalAmount = Math.max(0, subtotal - discount);

      // 2. Generate sequential offline bill number (OFF-2026-0001)
      const year = new Date().getFullYear();
      const offlineCount = await tx.order.count({
        where: { orderType: "OFFLINE" },
      });
      const nextSeq = (offlineCount + 1).toString().padStart(4, "0");
      const offlineBillNumber = `OFF-${year}-${nextSeq}`;

      // 3. Create Order record
      const order = await tx.order.create({
        data: {
          customerName: input.customerName?.trim() || "Walk-in Customer",
          phone: input.phone?.trim() || "N/A",
          address: "In-Store Purchase (Sivakasi Shop)",
          city: "Sivakasi",
          state: "Tamil Nadu",
          pincode: "626123",
          subtotal,
          discount,
          shipping: 0,
          totalAmount,
          orderType: "OFFLINE",
          invoiceNumber: offlineBillNumber,
          paymentStatus: "PAID",
          paymentMethod: input.paymentMethod || "Cash",
          orderStatus: "COLLECTED",
          paidAt: new Date(),
          items: {
            create: orderItemsToCreate,
          },
        },
        include: {
          items: true,
        },
      });

      // Audit Log
      await tx.adminAuditLog.create({
        data: {
          adminEmail: admin.email,
          action: "CREATE_OFFLINE_BILL",
          details: `Created Offline Store Bill ${offlineBillNumber} for ₹${totalAmount}`,
        },
      });
      return order;
    });

    revalidatePath("/", "layout");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/products");
    revalidatePath("/admin/orders");
    revalidatePath("/products");

    return {
      success: true,
      orderId: result.id,
      offlineBillNumber: result.invoiceNumber,
      totalAmount: Number(result.totalAmount),
    };
  } catch (error: any) {
    return { error: error.message || "Failed to create offline bill." };
  }
}

export async function toggleOrderItemConfirmationAction(
  orderItemId: number,
  isConfirmed: boolean
) {
  try {
    const admin = await requireAdmin();

    const result = await prisma.$transaction(
      async (tx) => {
        const item = await tx.orderItem.findUnique({
          where: { id: orderItemId },
          include: { product: true, order: true },
        });

        if (!item) {
          throw new Error("Order item not found.");
        }

        const isPaid =
          item.order.paymentStatus === "PAID" ||
          item.order.paymentStatus === "TEST_PAID" ||
          item.order.paymentStatus === "SUCCESS";

        if (isPaid) {
          throw new Error("Cannot modify items or quantities because this order is already marked as PAID.");
        }

        if (item.isConfirmed === isConfirmed) {
          return { orderId: item.orderId, noop: true };
        }

        const product = item.product;

        if (!isConfirmed) {
          // UNCHECKING: Removing item from order -> release stock
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { increment: item.quantity },
              purchases: { decrement: Math.min(product.purchases, item.quantity) },
            },
          });

          try {
            await tx.orderItem.update({
              where: { id: orderItemId },
              data: {
                isConfirmed: false,
                removedAt: new Date(),
              },
            });
          } catch (e) {
            await tx.$executeRaw`UPDATE "OrderItem" SET "isConfirmed" = false, "removedAt" = NOW() WHERE id = ${orderItemId}`;
          }
        } else {
          // RE-CHECKING: Restoring item to order -> check stock and re-reserve
          if (product.stock < item.quantity) {
            const unit = product.unitType || "box";
            throw new Error(
              `Unable to restore "${product.name}" because only ${product.stock} ${unit.toLowerCase()}${product.stock === 1 ? "" : "es"} ${product.stock === 1 ? "is" : "are"} currently available, but ${item.quantity} required.`
            );
          }

          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { decrement: item.quantity },
              purchases: { increment: item.quantity },
            },
          });

          try {
            await tx.orderItem.update({
              where: { id: orderItemId },
              data: {
                isConfirmed: true,
                removedAt: null,
              },
            });
          } catch (e) {
            await tx.$executeRaw`UPDATE "OrderItem" SET "isConfirmed" = true, "removedAt" = NULL WHERE id = ${orderItemId}`;
          }
        }

        // Recalculate Order Subtotal & Total Amount from confirmed items
        const allItems = await tx.orderItem.findMany({
          where: { orderId: item.orderId },
        });

        const remainingConfirmed = allItems.filter((i) =>
          i.id === orderItemId ? isConfirmed : i.isConfirmed !== false
        );

        const confirmedSubtotal = remainingConfirmed.reduce(
          (acc, i) => acc + Number(i.price) * i.quantity,
          0
        );

        const deliveryCharge = Number(item.order.deliveryCharge || 0);
        const newTotalAmount = confirmedSubtotal + (remainingConfirmed.length > 0 ? deliveryCharge : 0);

        // Auto update orderStatus to FAILED if all items removed
        let newOrderStatus = item.order.orderStatus;
        if (remainingConfirmed.length === 0) {
          newOrderStatus = "FAILED";
        } else if ((item.order.orderStatus === "FAILED" || item.order.orderStatus === "CANCELLED") && remainingConfirmed.length > 0) {
          newOrderStatus = "PENDING";
        }

        await tx.order.update({
          where: { id: item.orderId },
          data: {
            subtotal: confirmedSubtotal,
            totalAmount: newTotalAmount,
            orderStatus: newOrderStatus,
          },
        });

        await tx.adminAuditLog.create({
          data: {
            adminEmail: admin.email,
            action: isConfirmed ? "RESTORE_ORDER_ITEM" : "REMOVE_ORDER_ITEM",
            details: `${isConfirmed ? "Restored" : "Removed"} item "${item.productName}" (Qty: ${item.quantity}) in Order #${item.orderId}.${remainingConfirmed.length === 0 ? " Order auto-cancelled (0 confirmed items)." : ""}`,
          },
        });

        return { orderId: item.orderId, confirmedSubtotal, newTotalAmount, newOrderStatus };
      },
      { timeout: 25000, maxWait: 10000 }
    );

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${result.orderId}`);
    revalidatePath(`/order-confirmation/${result.orderId}`);
    revalidatePath(`/orders/${result.orderId}`);
    revalidatePath(`/orders/${result.orderId}/invoice`);

    return { success: true, ...result };
  } catch (error: any) {
    return { error: error.message || "Failed to update item confirmation status." };
  }
}

export async function updateOrderItemQuantityAction(
  orderItemId: number,
  newQuantity: number
) {
  try {
    const admin = await requireAdmin();

    if (isNaN(newQuantity) || newQuantity < 1) {
      throw new Error("Quantity must be at least 1.");
    }

    const result = await prisma.$transaction(
      async (tx) => {
        const item = await tx.orderItem.findUnique({
          where: { id: orderItemId },
          include: { product: true, order: true },
        });

        if (!item) {
          throw new Error("Order item not found.");
        }

        const isPaid =
          item.order.paymentStatus === "PAID" ||
          item.order.paymentStatus === "TEST_PAID" ||
          item.order.paymentStatus === "SUCCESS";

        if (isPaid) {
          throw new Error("Cannot modify items or quantities because this order is already marked as PAID.");
        }

        const oldQuantity = item.quantity;
        if (oldQuantity === newQuantity) {
          return { orderId: item.orderId, noop: true };
        }

        const product = item.product;
        const diff = newQuantity - oldQuantity; // positive = increase, negative = decrease

        if (diff > 0) {
          // Increasing quantity -> check stock availability
          if (product.stock < diff) {
            const unit = product.unitType || "box";
            throw new Error(
              `Cannot increase quantity of "${product.name}" to ${newQuantity}. Only ${product.stock} additional ${unit.toLowerCase()}${product.stock === 1 ? "" : "es"} available in inventory stock.`
            );
          }

          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { decrement: diff },
              purchases: { increment: diff },
            },
          });
        } else if (diff < 0) {
          // Decreasing quantity -> release stock back
          const releaseQty = Math.abs(diff);
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { increment: releaseQty },
              purchases: { decrement: Math.min(product.purchases, releaseQty) },
            },
          });
        }

        const newTotal = Number(item.price) * newQuantity;

        await tx.orderItem.update({
          where: { id: orderItemId },
          data: {
            quantity: newQuantity,
            total: newTotal,
          },
        });

        // Recalculate Order Subtotal & Total Amount from all confirmed items
        const allItems = await tx.orderItem.findMany({
          where: { orderId: item.orderId },
        });

        const confirmedSubtotal = allItems
          .filter((i) => i.isConfirmed !== false)
          .reduce((acc, i) => {
            const qty = i.id === orderItemId ? newQuantity : i.quantity;
            return acc + Number(i.price) * qty;
          }, 0);

        const deliveryCharge = Number(item.order.deliveryCharge || 0);
        const newTotalAmount = confirmedSubtotal + deliveryCharge;

        await tx.order.update({
          where: { id: item.orderId },
          data: {
            subtotal: confirmedSubtotal,
            totalAmount: newTotalAmount,
          },
        });

        await tx.adminAuditLog.create({
          data: {
            adminEmail: admin.email,
            action: "UPDATE_ORDER_ITEM_QUANTITY",
            details: `Updated item "${item.productName}" quantity from ${oldQuantity} to ${newQuantity} in Order #${item.orderId}`,
          },
        });

        return {
          orderId: item.orderId,
          newQuantity,
          newItemTotal: newTotal,
          confirmedSubtotal,
          newTotalAmount,
        };
      },
      { timeout: 25000, maxWait: 10000 }
    );

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${result.orderId}`);
    revalidatePath(`/order-confirmation/${result.orderId}`);
    revalidatePath(`/orders/${result.orderId}`);
    revalidatePath(`/orders/${result.orderId}/invoice`);

    return { success: true, ...result };
  } catch (error: any) {
    return { error: error.message || "Failed to update item quantity." };
  }
}
