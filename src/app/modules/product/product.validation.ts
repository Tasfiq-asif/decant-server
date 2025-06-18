import { z } from "zod";
import { PRODUCT_CATEGORY, PRODUCT_STATUS } from "../../constants";

const decantSizeSchema = z.object({
  size: z.enum(["2ml", "5ml", "10ml", "15ml", "20ml", "30ml"], {
    required_error: "Decant size is required",
  }),
  price: z
    .number({
      required_error: "Price is required",
      invalid_type_error: "Price must be a number",
    })
    .min(0, "Price must be positive"),
  stock: z
    .number({
      required_error: "Stock quantity is required",
      invalid_type_error: "Stock must be a number",
    })
    .min(0, "Stock cannot be negative")
    .int("Stock must be a whole number"),
  isAvailable: z.boolean().optional().default(true),
});

const createProductValidationSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: "Product name is required",
      })
      .min(1, "Product name cannot be empty")
      .max(200, "Product name cannot exceed 200 characters")
      .trim(),
    brand: z
      .string({
        required_error: "Brand is required",
      })
      .min(1, "Brand cannot be empty")
      .max(100, "Brand name cannot exceed 100 characters")
      .trim(),
    description: z
      .string({
        required_error: "Description is required",
      })
      .min(1, "Description cannot be empty")
      .max(2000, "Description cannot exceed 2000 characters")
      .trim(),
    category: z.enum(Object.values(PRODUCT_CATEGORY) as [string, ...string[]], {
      required_error: "Category is required",
      invalid_type_error: "Invalid category",
    }),
    decantSizes: z
      .array(decantSizeSchema, {
        required_error: "At least one decant size is required",
      })
      .min(1, "At least one decant size is required"),
    images: z
      .array(z.string().url("Invalid image URL"), {
        required_error: "At least one image is required",
      })
      .min(1, "At least one image is required"),
    thumbnail: z.string().url("Invalid thumbnail URL").optional(),
    tags: z.array(z.string()).optional().default([]),
  }),
});

const updateProductValidationSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, "Product name cannot be empty")
      .max(200, "Product name cannot exceed 200 characters")
      .trim()
      .optional(),
    brand: z
      .string()
      .min(1, "Brand cannot be empty")
      .max(100, "Brand name cannot exceed 100 characters")
      .trim()
      .optional(),
    description: z
      .string()
      .min(1, "Description cannot be empty")
      .max(2000, "Description cannot exceed 2000 characters")
      .trim()
      .optional(),
    category: z
      .enum(Object.values(PRODUCT_CATEGORY) as [string, ...string[]], {
        invalid_type_error: "Invalid category",
      })
      .optional(),
    decantSizes: z
      .array(decantSizeSchema)
      .min(1, "At least one decant size is required")
      .optional(),
    images: z
      .array(z.string().url("Invalid image URL"))
      .min(1, "At least one image is required")
      .optional(),
    thumbnail: z.string().url("Invalid thumbnail URL").optional(),
    status: z
      .enum(Object.values(PRODUCT_STATUS) as [string, ...string[]], {
        invalid_type_error: "Invalid status",
      })
      .optional(),
    tags: z.array(z.string()).optional(),
  }),
});

const getProductsQuery = z.object({
  query: z.object({
    searchTerm: z.string().optional(),
    category: z.string().optional(),
    brand: z.string().optional(),
    minPrice: z.string().transform(Number).optional(),
    maxPrice: z.string().transform(Number).optional(),
    status: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
  }),
});

export const ProductValidation = {
  createProductValidationSchema,
  updateProductValidationSchema,
  getProductsQuery,
};
