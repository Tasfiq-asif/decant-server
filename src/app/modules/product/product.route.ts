import { Router } from "express";
import { ProductController } from "./product.controller";
import { ProductValidation } from "./product.validation";
import validateRequest from "../../../middlewares/validateRequest";
import auth from "../../../middlewares/auth";
import { USER_ROLE } from "../../constants";

const router = Router();

// Public routes (no authentication required)
router.get(
  "/",
  validateRequest(ProductValidation.getProductsQuery),
  ProductController.getAllProducts
);

router.get("/featured", ProductController.getFeaturedProducts);

router.get("/brand/:brand", ProductController.getProductsByBrand);

router.get("/:id/related", ProductController.getRelatedProducts);

router.get("/slug/:slug", ProductController.getProductBySlug);

router.get("/:id", ProductController.getProductById);

// Admin only routes
router.post(
  "/",
  auth(USER_ROLE.ADMIN),
  validateRequest(ProductValidation.createProduct),
  ProductController.createProduct
);

router.patch(
  "/:id",
  auth(USER_ROLE.ADMIN),
  validateRequest(ProductValidation.updateProduct),
  ProductController.updateProduct
);

router.delete("/:id", auth(USER_ROLE.ADMIN), ProductController.deleteProduct);

router.patch(
  "/:id/stock",
  auth(USER_ROLE.ADMIN),
  ProductController.updateProductStock
);

export const ProductRoutes = router;
