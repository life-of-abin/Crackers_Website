import { Prisma } from "@prisma/client";

/**
 * Filter clause for VALID online orders:
 * Excludes cancelled or failed orders and offline transactions from online statistics.
 */
export const validOnlineOrderWhere: Prisma.OrderWhereInput = {
  orderType: { not: "OFFLINE" },
  orderStatus: { notIn: ["CANCELLED", "FAILED"] },
  paymentStatus: { notIn: ["FAILED", "CANCELLED"] },
};

/**
 * Filter clause for PENDING online orders
 */
export const pendingOnlineOrderWhere: Prisma.OrderWhereInput = {
  ...validOnlineOrderWhere,
  orderStatus: {
    in: [
      "PLACED",
      "AWAITING_DELIVERY_CONFIRMATION",
      "CONFIRMED",
      "PROCESSING",
      "PACKED",
      "SHIPPED",
      "OUT_FOR_DELIVERY",
      "READY_FOR_PICKUP",
    ],
  },
};

/**
 * Filter clause for COMPLETED online orders
 */
export const completedOnlineOrderWhere: Prisma.OrderWhereInput = {
  ...validOnlineOrderWhere,
  orderStatus: {
    in: ["DELIVERED", "COLLECTED"],
  },
};
