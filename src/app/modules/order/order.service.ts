import {
  TOrder,
  TCreateOrder,
  TUpdateOrder,
  TOrderQuery,
  TStripePaymentIntent,
} from "./order.interface";
import { Order } from "./order.model";
import { Product } from "../product/product.model";
import { User } from "../user/user.model";
import Stripe from "stripe";
import AppError from "../../errors/AppError";
import { Types } from "mongoose";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

const createOrder = async (
  userId: string,
  orderData: TCreateOrder
): Promise<TOrder> => {
  // Verify user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(404, "User not found");
  }

  // Verify all products exist and calculate totals
  const productIds = orderData.items.map(
    (item) => new Types.ObjectId(item.product)
  );
  const products = await Product.find({ _id: { $in: productIds } });

  if (products.length !== orderData.items.length) {
    throw new AppError(400, "One or more products not found");
  }

  // Validate item prices and availability
  for (const item of orderData.items) {
    const product = products.find((p) => p._id.toString() === item.product);
    if (!product) {
      throw new AppError(400, `Product ${item.productName} not found`);
    }

    const decantSize = product.decantSizes.find(
      (size) => size.size === item.decantSize
    );
    if (!decantSize) {
      throw new AppError(
        400,
        `Decant size ${item.decantSize} not available for ${product.name}`
      );
    }

    if (!decantSize.isAvailable || decantSize.stock < item.quantity) {
      throw new AppError(
        400,
        `Insufficient stock for ${product.name} (${item.decantSize})`
      );
    }

    // Verify price matches
    if (Math.abs(decantSize.price - item.price) > 0.01) {
      throw new AppError(400, `Price mismatch for ${product.name}`);
    }

    // Verify total price calculation
    const expectedTotal = item.price * item.quantity;
    if (Math.abs(expectedTotal - item.totalPrice) > 0.01) {
      throw new AppError(
        400,
        `Total price calculation error for ${product.name}`
      );
    }
  }

  // Create the order
  const order = new Order({
    user: userId,
    ...orderData,
  });

  const savedOrder = await order.save();

  // Update product stock
  for (const item of orderData.items) {
    await Product.findOneAndUpdate(
      {
        _id: item.product,
        "decantSizes.size": item.decantSize,
      },
      {
        $inc: { "decantSizes.$.stock": -item.quantity },
      }
    );
  }

  return savedOrder.populate("user", "name email");
};

const getOrderById = async (orderId: string): Promise<TOrder | null> => {
  const order = await Order.findById(orderId)
    .populate("user", "name email")
    .populate("items.product", "name brand images");

  return order;
};

const getOrderByNumber = async (
  orderNumber: string
): Promise<TOrder | null> => {
  const order = await Order.findOne({ orderNumber })
    .populate("user", "name email")
    .populate("items.product", "name brand images");

  return order;
};

const getUserOrders = async (userId: string, query: TOrderQuery) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
    orderStatus,
    paymentStatus,
    startDate,
    endDate,
  } = query;

  const filter: any = { user: userId };

  if (orderStatus) filter.orderStatus = orderStatus;
  if (paymentStatus) filter.paymentStatus = paymentStatus;

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const skip = (Number(page) - 1) * Number(limit);
  const sortOptions: any = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate("items.product", "name brand images")
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit)),
    Order.countDocuments(filter),
  ]);

  return {
    orders,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

const getAllOrders = async (query: TOrderQuery) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
    user,
    orderStatus,
    paymentStatus,
    paymentMethod,
    startDate,
    endDate,
    orderNumber,
  } = query;

  const filter: any = {};

  if (user) filter.user = user;
  if (orderStatus) filter.orderStatus = orderStatus;
  if (paymentStatus) filter.paymentStatus = paymentStatus;
  if (paymentMethod) filter.paymentMethod = paymentMethod;
  if (orderNumber) filter.orderNumber = { $regex: orderNumber, $options: "i" };

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const skip = (Number(page) - 1) * Number(limit);
  const sortOptions: any = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate("user", "name email")
      .populate("items.product", "name brand images")
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit)),
    Order.countDocuments(filter),
  ]);

  return {
    orders,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

const updateOrder = async (
  orderId: string,
  updateData: TUpdateOrder
): Promise<TOrder | null> => {
  const order = await Order.findByIdAndUpdate(orderId, updateData, {
    new: true,
    runValidators: true,
  }).populate("user", "name email");

  return order;
};

const updateOrderStatus = async (
  orderId: string,
  status: string
): Promise<TOrder | null> => {
  const order = await Order.findByIdAndUpdate(
    orderId,
    { orderStatus: status },
    { new: true, runValidators: true }
  ).populate("user", "name email");

  return order;
};

const updatePaymentStatus = async (
  orderId: string,
  status: string,
  paymentIntentId?: string
): Promise<TOrder | null> => {
  const updateData: any = { paymentStatus: status };
  if (paymentIntentId) {
    updateData.paymentIntentId = paymentIntentId;
  }

  const order = await Order.findByIdAndUpdate(orderId, updateData, {
    new: true,
    runValidators: true,
  }).populate("user", "name email");

  return order;
};

// Stripe Payment Methods
const createPaymentIntent = async (paymentData: TStripePaymentIntent) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(paymentData.amount * 100), // Convert to cents
      currency: paymentData.currency,
      metadata: {
        orderId: paymentData.orderId,
        customerEmail: paymentData.customerEmail,
        ...paymentData.metadata,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    throw new AppError(500, `Stripe payment intent creation failed: ${error}`);
  }
};

const confirmPayment = async (paymentIntentId: string) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === "succeeded") {
      const orderId = paymentIntent.metadata.orderId;
      await updatePaymentStatus(orderId, "paid", paymentIntentId);
      await updateOrderStatus(orderId, "confirmed");
    }

    return paymentIntent;
  } catch (error) {
    throw new AppError(500, `Payment confirmation failed: ${error}`);
  }
};

const refundPayment = async (paymentIntentId: string, amount?: number) => {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined, // Convert to cents if partial refund
    });

    return refund;
  } catch (error) {
    throw new AppError(500, `Refund failed: ${error}`);
  }
};

const getOrderStats = async (userId?: string) => {
  const matchStage = userId ? { user: new Types.ObjectId(userId) } : {};

  const stats = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: "$totalAmount" },
        averageOrderValue: { $avg: "$totalAmount" },
        pendingOrders: {
          $sum: { $cond: [{ $eq: ["$orderStatus", "pending"] }, 1, 0] },
        },
        confirmedOrders: {
          $sum: { $cond: [{ $eq: ["$orderStatus", "confirmed"] }, 1, 0] },
        },
        processingOrders: {
          $sum: { $cond: [{ $eq: ["$orderStatus", "processing"] }, 1, 0] },
        },
        shippedOrders: {
          $sum: { $cond: [{ $eq: ["$orderStatus", "shipped"] }, 1, 0] },
        },
        deliveredOrders: {
          $sum: { $cond: [{ $eq: ["$orderStatus", "delivered"] }, 1, 0] },
        },
        cancelledOrders: {
          $sum: { $cond: [{ $eq: ["$orderStatus", "cancelled"] }, 1, 0] },
        },
      },
    },
  ]);

  return (
    stats[0] || {
      totalOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      pendingOrders: 0,
      confirmedOrders: 0,
      processingOrders: 0,
      shippedOrders: 0,
      deliveredOrders: 0,
      cancelledOrders: 0,
    }
  );
};

const getTopProducts = async (limit: number = 10) => {
  // Only include confirmed/delivered orders for accurate sales data
  const matchStage = {
    orderStatus: { $in: ["confirmed", "processing", "shipped", "delivered"] },
  };

  const topProducts = await Order.aggregate([
    { $match: matchStage },
    { $unwind: "$items" },
    {
      $group: {
        _id: {
          productId: "$items.product",
          productName: "$items.productName",
          decantSize: "$items.decantSize",
        },
        totalQuantity: { $sum: "$items.quantity" },
        totalRevenue: { $sum: "$items.totalPrice" },
        totalOrders: { $sum: 1 },
        averageOrderQuantity: { $avg: "$items.quantity" },
        pricePerUnit: { $first: "$items.price" },
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "_id.productId",
        foreignField: "_id",
        as: "productInfo",
      },
    },
    {
      $unwind: {
        path: "$productInfo",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: "$_id.productId",
        name: "$_id.productName",
        decantSize: "$_id.decantSize",
        brand: "$productInfo.brand",
        category: "$productInfo.category",
        image: { $arrayElemAt: ["$productInfo.images", 0] },
        totalQuantity: 1,
        totalRevenue: { $round: ["$totalRevenue", 2] },
        totalOrders: 1,
        averageOrderQuantity: { $round: ["$averageOrderQuantity", 2] },
        pricePerUnit: { $round: ["$pricePerUnit", 2] },
      },
    },
    { $sort: { totalQuantity: -1 } },
    { $limit: limit },
  ]);

  return topProducts;
};

export const OrderService = {
  createOrder,
  getOrderById,
  getOrderByNumber,
  getUserOrders,
  getAllOrders,
  updateOrder,
  updateOrderStatus,
  updatePaymentStatus,
  createPaymentIntent,
  confirmPayment,
  refundPayment,
  getOrderStats,
  getTopProducts,
};
