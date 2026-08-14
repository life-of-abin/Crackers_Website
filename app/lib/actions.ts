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
    const email = (formData.get("email") as string || "").trim().toLowerCase();
    const password = (formData.get("password") as string || "").trim();

    if (!email || !password) {
      return { error: "Please enter your admin email address and password." };
    }

    if (!isValidEmailFormat(email)) {
      return { error: "Please enter a valid email address." };
    }

    // Search user by email and enforce ADMIN role
    const user = await prisma.user.findFirst({
      where: {
        email,
        role: "ADMIN",
      },
    });

    if (!user) {
      return { error: "Invalid admin email or password." };
    }

    if (user.status !== "ACTIVE") {
      return { error: "Admin account is currently suspended or disabled." };
    }

    const isValid = comparePassword(password, user.passwordHash);
    if (!isValid) {
      return { error: "Invalid admin email or password." };
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
    console.error("Admin login error:", error);
    return { error: "An unexpected error occurred during admin authentication." };
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
  cartItems: { productId: number; quantity: number }[];
}) {
  try {
    // 1. Mandatory delivery fields check
    if (!data.customerName || !data.phone || !data.address || !data.city || !data.pincode || !data.state) {
      return { error: "Please complete all mandatory delivery address fields." };
    }

    if (data.customerName.trim().length < 2) {
      return { error: "Please enter a valid full name." };
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

    // 4. India Post PIN Code Verification & State Cross-Validation
    const pinCheck = await verifyIndianPincode(data.pincode, data.state);
    if (!pinCheck.valid) {
      return { error: pinCheck.error || "Please enter a valid Indian PIN code." };
    }

    if (!data.cartItems || data.cartItems.length === 0) {
      return { error: "Your shopping cart is empty." };
    }

    // 5. Load store settings for shipping thresholds
    const settings = await prisma.settings.findFirst({ where: { id: 1 } });
    const minOrder = settings ? Number(settings.minOrderAmount) : 500;
    const flatFee = settings ? Number(settings.flatShippingFee) : 100;
    const freeThreshold = settings ? Number(settings.freeShippingThreshold) : 3000;

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

      const totalQuantity = data.cartItems.reduce((acc, item) => acc + item.quantity, 0);
      if (totalQuantity < 2) {
        throw new Error("Minimum purchase quantity is 2 items.");
      }

      const shippingFee = calculatedSubtotal >= freeThreshold ? 0 : flatFee;
      const grandTotal = calculatedSubtotal + shippingFee;

      // Create Order & OrderItems with packSize & unitType
      const createdOrder = await tx.order.create({
        data: {
          customerName: data.customerName.trim(),
          phone: phoneResult.phone,
          email: data.email ? data.email.toLowerCase().trim() : null,
          address: data.address.trim(),
          landmark: data.landmark ? data.landmark.trim() : null,
          city: pinCheck.city || data.city.trim(),
          district: pinCheck.district || data.district?.trim() || null,
          state: pinCheck.state || data.state.trim(),
          pincode: pinCheck.pincode,
          subtotal: calculatedSubtotal,
          discount: 0,
          shipping: shippingFee,
          totalAmount: grandTotal,
          paymentStatus: "PENDING",
          orderStatus: "PLACED",
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

      // Deduct stock for each item atomically inside transaction
      for (const item of validatedItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
            purchases: { increment: item.quantity },
          },
        });
      }

      return {
        orderId: createdOrder.id,
        grandTotal,
        subtotal: calculatedSubtotal,
        shippingFee,
      };
    });

    // Invalidate Next.js Server Caches
    revalidatePath("/admin/orders");
    revalidatePath("/admin/dashboard");
    revalidatePath("/products");

    return {
      success: true,
      orderId: resultOrder.orderId,
      totalAmount: resultOrder.grandTotal,
      subtotal: resultOrder.subtotal,
      shipping: resultOrder.shippingFee,
    };
  } catch (error: any) {
    console.error("Order creation error:", error);
    return { error: error.message || "Failed to process order. Please try again." };
  }
}

export async function confirmPaymentAction(orderId: number, paymentRefStr: string, paymentMethod: string = "DUMMY") {
  try {
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      return { error: "Order not found." };
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "TEST_PAID",
        paymentId: paymentRefStr,
        orderStatus: "CONFIRMED",
      },
    });

    await prisma.payment.create({
      data: {
        orderId,
        paymentRef: paymentRefStr,
        paymentMethod,
        amount: existingOrder.totalAmount,
        status: "SUCCESS",
      },
    });

    revalidatePath(`/orders/${orderId}`);
    revalidatePath("/admin/orders");

    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to confirm payment." };
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
    const image = (formData.get("image") as string) || null;
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
    const image = (formData.get("image") as string) || null;
    const badge = (formData.get("badge") as string) || null;
    const featured = formData.get("featured") === "true";
    const active = formData.get("active") === "true";

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

    if (!name) return { error: "Category name is required." };

    const slug = slugify(name);

    await prisma.category.create({
      data: {
        name,
        slug,
        description,
        icon,
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
    const active = formData.get("active") === "true";

    await prisma.category.update({
      where: { id: categoryId },
      data: {
        name,
        description,
        icon,
        active,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/products");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to update category." };
  }
}

export async function deleteCategoryAction(categoryId: number) {
  try {
    await requireAdmin();

    const productsCount = await prisma.product.count({
      where: { categoryId },
    });

    if (productsCount > 0) {
      return { error: `Cannot delete category because it contains ${productsCount} active products.` };
    }

    await prisma.category.delete({
      where: { id: categoryId },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/products");

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
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updatePaymentStatusAction(orderId: number, paymentStatus: string) {
  try {
    await requireAdmin();
    await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus },
    });
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
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
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;
    const address = formData.get("address") as string;
    const googleMapsUrl = formData.get("googleMapsUrl") as string;
    const whatsappNumber = formData.get("whatsappNumber") as string;
    const minOrderAmount = parseFloat((formData.get("minOrderAmount") as string) || "500");
    const flatShippingFee = parseFloat((formData.get("flatShippingFee") as string) || "100");
    const freeShippingThreshold = parseFloat((formData.get("freeShippingThreshold") as string) || "3000");
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

