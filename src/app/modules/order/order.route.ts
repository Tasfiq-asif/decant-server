import { Router } from "express";
import { OrderController } from "./order.controller";

import {
  createOrderValidation,
  updateOrderValidation,
  createPaymentIntentValidation,
  orderQueryValidation,
} from "./order.validation";
import validateRequest from "@/middlewares/validateRequest";
import auth from "@/middlewares/auth";

const router = Router();

// Public routes
router.post("/webhook/stripe", OrderController.handleStripeWebhook);

// Protected routes (require authentication)
router.post(
  "/",
  auth("user", "admin"),
  validateRequest(createOrderValidation),
  OrderController.createOrder
);

router.get(
  "/my-orders",
  auth("user", "admin"),
  validateRequest(orderQueryValidation),
  OrderController.getMyOrders
);

router.get("/stats", auth("user", "admin"), OrderController.getOrderStats);

router.get("/top-products", auth("admin"), OrderController.getTopProducts);

router.get(
  "/order-number/:orderNumber",
  auth("user", "admin"),
  OrderController.getOrderByNumber
);

router.get("/:id", auth("user", "admin"), OrderController.getOrderById);

// Payment routes
router.post(
  "/payment/create-intent",
  auth("user", "admin"),
  validateRequest(createPaymentIntentValidation),
  OrderController.createPaymentIntent
);

router.post(
  "/payment/confirm/:paymentIntentId",
  auth("user", "admin"),
  OrderController.confirmPayment
);

// Admin only routes
router.get(
  "/",
  auth("admin"),
  validateRequest(orderQueryValidation),
  OrderController.getAllOrders
);

router.patch("/:id/status", auth("admin"), OrderController.updateOrderStatus);

router.patch(
  "/:id",
  auth("admin"),
  validateRequest(updateOrderValidation),
  OrderController.updateOrder
);

router.post(
  "/payment/refund/:paymentIntentId",
  auth("admin"),
  OrderController.refundPayment
);

export const OrderRoutes = router;
