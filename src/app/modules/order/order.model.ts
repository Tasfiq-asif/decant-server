import { Schema, model } from "mongoose";
import { TOrder, TOrderItem, TShippingAddress } from "./order.interface";

const orderItemSchema = new Schema<TOrderItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product reference is required"],
    },
    productName: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    productImage: {
      type: String,
      required: [true, "Product image is required"],
    },
    decantSize: {
      type: String,
      required: [true, "Decant size is required"],
      enum: ["2ml", "5ml", "10ml", "15ml", "20ml", "30ml"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be positive"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
    },
    totalPrice: {
      type: Number,
      required: [true, "Total price is required"],
      min: [0, "Total price must be positive"],
    },
  },
  { _id: false }
);

const shippingAddressSchema = new Schema<TShippingAddress>(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    street: {
      type: String,
      required: [true, "Street address is required"],
      trim: true,
      maxlength: [200, "Street address cannot exceed 200 characters"],
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
      maxlength: [100, "City cannot exceed 100 characters"],
    },
    zipCode: {
      type: String,
      required: [true, "ZIP code is required"],
      trim: true,
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
    },
  },
  { _id: false }
);

const orderSchema = new Schema<TOrder>(
  {
    orderNumber: {
      type: String,
      unique: true,
      trim: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },
    items: {
      type: [orderItemSchema],
      required: [true, "Order items are required"],
      validate: {
        validator: function (items: TOrderItem[]) {
          return items.length > 0;
        },
        message: "At least one item is required",
      },
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: [true, "Shipping address is required"],
    },
    subtotal: {
      type: Number,
      required: [true, "Subtotal is required"],
      min: [0, "Subtotal must be positive"],
    },
    shippingCost: {
      type: Number,
      required: [true, "Shipping cost is required"],
      min: [0, "Shipping cost cannot be negative"],
    },
    tax: {
      type: Number,
      required: [true, "Tax is required"],
      min: [0, "Tax cannot be negative"],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, "Discount cannot be negative"],
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount must be positive"],
    },
    paymentMethod: {
      type: String,
      required: [true, "Payment method is required"],
      enum: ["stripe", "paypal", "cash_on_delivery"],
    },
    paymentStatus: {
      type: String,
      required: [true, "Payment status is required"],
      enum: ["pending", "paid", "failed", "refunded", "cancelled"],
      default: "pending",
    },
    paymentIntentId: {
      type: String,
      sparse: true,
    },
    orderStatus: {
      type: String,
      required: [true, "Order status is required"],
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
    promoCode: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
    trackingNumber: {
      type: String,
      trim: true,
    },
    estimatedDelivery: {
      type: Date,
    },
    actualDelivery: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Generate order number before saving
orderSchema.pre("save", async function (next) {
  if (this.isNew) {
    const timestamp = Date.now().toString();
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.orderNumber = `ORD-${timestamp}-${randomStr}`;
  }
  next();
});

// Calculate totals validation
orderSchema.pre("save", function (next) {
  const calculatedSubtotal = this.items.reduce(
    (sum, item) => sum + item.totalPrice,
    0
  );

  if (Math.abs(this.subtotal - calculatedSubtotal) > 0.01) {
    next(new Error("Subtotal does not match item totals"));
    return;
  }

  const calculatedTotal =
    this.subtotal + this.shippingCost + this.tax - this.discount;
  if (Math.abs(this.totalAmount - calculatedTotal) > 0.01) {
    next(new Error("Total amount calculation is incorrect"));
    return;
  }

  next();
});

// Indexes for performance
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ orderStatus: 1, paymentStatus: 1 });
orderSchema.index({ paymentIntentId: 1 });
orderSchema.index({ createdAt: -1 });

export const Order = model<TOrder>("Order", orderSchema);
