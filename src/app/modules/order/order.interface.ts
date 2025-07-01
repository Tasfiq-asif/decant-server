import { Types } from "mongoose";

export interface TOrderItem {
  product: string | Types.ObjectId;
  productName: string;
  productImage: string;
  decantSize: string;
  price: number;
  quantity: number;
  totalPrice: number;
}

export interface TShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  zipCode: string;
  country: string;
}

export interface TOrder {
  _id?: string;
  orderNumber: string;
  user: string | Types.ObjectId;
  items: TOrderItem[];
  shippingAddress: TShippingAddress;
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  totalAmount: number;
  paymentMethod: "stripe" | "paypal" | "cash_on_delivery";
  paymentStatus: "pending" | "paid" | "failed" | "refunded" | "cancelled";
  paymentIntentId?: string; // Stripe payment intent ID
  orderStatus:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  promoCode?: string;
  notes?: string;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TCreateOrder {
  items: TOrderItem[];
  shippingAddress: TShippingAddress;
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount?: number;
  totalAmount: number;
  paymentMethod: "stripe" | "paypal" | "cash_on_delivery";
  promoCode?: string;
  notes?: string;
}

export interface TUpdateOrder {
  orderStatus?:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  paymentStatus?: "pending" | "paid" | "failed" | "refunded" | "cancelled";
  trackingNumber?: string;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  notes?: string;
}

export interface TOrderQuery {
  user?: string;
  orderStatus?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  startDate?: string;
  endDate?: string;
  orderNumber?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface TStripePaymentIntent {
  amount: number;
  currency: string;
  orderId: string;
  customerEmail: string;
  metadata?: Record<string, string>;
}
