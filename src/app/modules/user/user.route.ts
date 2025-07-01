import { Router } from "express";
import { UserControllers } from "./user.controller";
import { UserValidation } from "./user.validation";
import auth from "../../../middlewares/auth";
import validateRequest from "../../../middlewares/validateRequest";
import { USER_ROLE } from "../../constants";

const router = Router();

// Admin only routes
router.post(
  "/",
  auth(USER_ROLE.ADMIN),
  validateRequest(UserValidation.createUserValidationSchema),
  UserControllers.createUser
);

router.get("/", auth(USER_ROLE.ADMIN), UserControllers.getAllUsers);

router.get("/stats", auth(USER_ROLE.ADMIN), UserControllers.getUserStats);

router.patch(
  "/:id/role",
  auth(USER_ROLE.ADMIN),
  validateRequest(UserValidation.updateUserRoleValidationSchema),
  UserControllers.updateUserRole
);

router.delete(
  "/:id",
  auth(USER_ROLE.ADMIN),
  validateRequest(UserValidation.deleteUserValidationSchema),
  UserControllers.deleteUser
);

// User dashboard route (must come before /:id to avoid conflicts)
router.get(
  "/dashboard",
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  UserControllers.getUserDashboard
);

// Wishlist routes (must come before /:id to avoid conflicts)
router.post(
  "/wishlist",
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  validateRequest(UserValidation.addToWishlistValidationSchema),
  UserControllers.addToWishlist
);

router.get(
  "/wishlist",
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  UserControllers.getUserWishlist
);

router.delete(
  "/wishlist/:productId",
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  validateRequest(UserValidation.removeFromWishlistValidationSchema),
  UserControllers.removeFromWishlist
);

// User and Admin routes
router.get(
  "/:id",
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  validateRequest(UserValidation.getUserByIdValidationSchema),
  UserControllers.getSingleUser
);

router.patch(
  "/:id",
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  validateRequest(UserValidation.updateUserValidationSchema),
  UserControllers.updateUser
);

export const UserRoutes = router;
