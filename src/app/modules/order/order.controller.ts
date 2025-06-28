import { Request, Response } from "express";
import { OrderService } from "./order.service";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import AppError from "../../errors/AppError";

const createOrder = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    throw new AppError(401, "User not authenticated");
  }

  const order = await OrderService.createOrder(userId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Order created successfully",
    data: order,
  });
});

const getMyOrders = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    throw new AppError(401, "User not authenticated");
  }

  const result = await OrderService.getUserOrders(userId, req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Orders retrieved successfully",
    data: result.orders,
    meta: result.pagination,
  });
});

const getAllOrders = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.getAllOrders(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "All orders retrieved successfully",
    data: result.orders,
    meta: result.pagination,
  });
});

const getOrderById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const order = await OrderService.getOrderById(id);

  if (!order) {
    throw new AppError(404, "Order not found");
  }

  // Check if user owns the order or is admin
  if (
    req.user?.role !== "admin" &&
    order.user.toString() !== req.user?.userId
  ) {
    throw new AppError(403, "Access denied");
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Order retrieved successfully",
    data: order,
  });
});

const getOrderByNumber = catchAsync(async (req: Request, res: Response) => {
  const { orderNumber } = req.params;
  const order = await OrderService.getOrderByNumber(orderNumber);

  if (!order) {
    throw new AppError(404, "Order not found");
  }

  // Check if user owns the order or is admin
  if (
    req.user?.role !== "admin" &&
    order.user.toString() !== req.user?.userId
  ) {
    throw new AppError(403, "Access denied");
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Order retrieved successfully",
    data: order,
  });
});

const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { orderStatus } = req.body;

  const order = await OrderService.updateOrderStatus(id, orderStatus);

  if (!order) {
    throw new AppError(404, "Order not found");
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Order status updated successfully",
    data: order,
  });
});

const updateOrder = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const order = await OrderService.updateOrder(id, req.body);

  if (!order) {
    throw new AppError(404, "Order not found");
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Order updated successfully",
    data: order,
  });
});

// Stripe Payment Controllers
const createPaymentIntent = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.createPaymentIntent(req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment intent created successfully",
    data: result,
  });
});

const confirmPayment = catchAsync(async (req: Request, res: Response) => {
  const { paymentIntentId } = req.params;
  const result = await OrderService.confirmPayment(paymentIntentId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment confirmed successfully",
    data: result,
  });
});

const refundPayment = catchAsync(async (req: Request, res: Response) => {
  const { paymentIntentId } = req.params;
  const { amount } = req.body;

  const result = await OrderService.refundPayment(paymentIntentId, amount);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Refund processed successfully",
    data: result,
  });
});

const getOrderStats = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.role === "admin" ? undefined : req.user?.userId;
  const stats = await OrderService.getOrderStats(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Order statistics retrieved successfully",
    data: stats,
  });
});

// Stripe webhook handler
const handleStripeWebhook = catchAsync(async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: any;

  try {
    const Stripe = require("stripe");
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    throw new AppError(
      400,
      `Webhook signature verification failed: ${err.message}`
    );
  }

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      await OrderService.confirmPayment(paymentIntent.id);
      break;

    case "payment_intent.payment_failed":
      const failedPayment = event.data.object;
      const orderId = failedPayment.metadata.orderId;
      await OrderService.updatePaymentStatus(orderId, "failed");
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.status(200).json({ received: true });
});

export const OrderController = {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  getOrderByNumber,
  updateOrderStatus,
  updateOrder,
  createPaymentIntent,
  confirmPayment,
  refundPayment,
  getOrderStats,
  handleStripeWebhook,
};
