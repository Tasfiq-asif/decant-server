import { z } from "zod";

const orderItemValidation = z.object({
  product: z.string().min(1, "Product ID is required"),
  productName: z.string().min(1, "Product name is required"),
  productImage: z.string().url("Valid product image URL is required"),
  decantSize: z.enum(["2ml", "5ml", "10ml", "15ml", "20ml", "30ml"]),
  price: z.number().positive("Price must be positive"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  totalPrice: z.number().positive("Total price must be positive"),
});

const shippingAddressValidation = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone number is required"),
  street: z.string().min(1, "Street address is required").max(200),
  city: z.string().min(1, "City is required").max(100),
  zipCode: z.string().min(1, "ZIP code is required"),
  country: z.string().min(1, "Country is required"),
});

export const createOrderValidation = z.object({
  body: z.object({
    items: z.array(orderItemValidation).min(1, "At least one item is required"),
    shippingAddress: shippingAddressValidation,
    subtotal: z.number().positive("Subtotal must be positive"),
    shippingCost: z.number().min(0, "Shipping cost cannot be negative"),
    tax: z.number().min(0, "Tax cannot be negative"),
    discount: z.number().min(0, "Discount cannot be negative").optional(),
    totalAmount: z.number().positive("Total amount must be positive"),
    paymentMethod: z.enum(["stripe", "paypal", "cash_on_delivery"]),
    promoCode: z.string().optional(),
    notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
  }),
});

export const updateOrderValidation = z.object({
  body: z.object({
    orderStatus: z
      .enum([
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ])
      .optional(),
    paymentStatus: z
      .enum(["pending", "paid", "failed", "refunded", "cancelled"])
      .optional(),
    trackingNumber: z.string().optional(),
    estimatedDelivery: z.string().datetime().optional(),
    actualDelivery: z.string().datetime().optional(),
    notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
  }),
});

export const createPaymentIntentValidation = z.object({
  body: z.object({
    amount: z.number().positive("Amount must be positive"),
    currency: z.string().default("usd"),
    orderId: z.string().min(1, "Order ID is required"),
    customerEmail: z.string().email("Valid email is required"),
    metadata: z.record(z.string()).optional(),
  }),
});

export const orderQueryValidation = z.object({
  query: z.object({
    user: z.string().optional(),
    orderStatus: z
      .enum([
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ])
      .optional(),
    paymentStatus: z
      .enum(["pending", "paid", "failed", "refunded", "cancelled"])
      .optional(),
    paymentMethod: z.enum(["stripe", "paypal", "cash_on_delivery"]).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    orderNumber: z.string().optional(),
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  }),
});
