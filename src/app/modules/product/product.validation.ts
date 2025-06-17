import { z } from "zod";
import {
  PRODUCT_CATEGORY,
  PRODUCT_STATUS,
  FRAGRANCE_TYPE,
} from "../../constants";

const fragranceNotesSchema = z.object({
  top: z
    .array(z.string().min(1, "Top note cannot be empty"))
    .min(1, "At least one top note is required"),
  middle: z
    .array(z.string().min(1, "Middle note cannot be empty"))
    .min(1, "At least one middle note is required"),
  base: z
    .array(z.string().min(1, "Base note cannot be empty"))
    .min(1, "At least one base note is required"),
});

const decantSizeSchema = z.object({
  size: z.enum(["2ml", "5ml", "10ml", "15ml", "20ml", "30ml"], {
    errorMap: () => ({ message: "Invalid decant size" }),
  }),
  price: z.number().min(0, "Price must be positive"),
  stock: z.number().min(0, "Stock cannot be negative"),
  isAvailable: z.boolean().optional(),
});

const createProductSchema = z.object({
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
      .min(10, "Description must be at least 10 characters")
      .max(2000, "Description cannot exceed 2000 characters")
      .trim(),

    category: z.enum(Object.values(PRODUCT_CATEGORY) as [string, ...string[]], {
      errorMap: () => ({ message: "Invalid product category" }),
    }),

    fragranceType: z.enum(
      Object.values(FRAGRANCE_TYPE) as [string, ...string[]],
      {
        errorMap: () => ({ message: "Invalid fragrance type" }),
      }
    ),

    gender: z.enum(["men", "women", "unisex"], {
      errorMap: () => ({ message: "Gender must be men, women, or unisex" }),
    }),

    fragranceNotes: fragranceNotesSchema,

    longevity: z
      .number({
        required_error: "Longevity rating is required",
      })
      .min(1, "Longevity must be at least 1")
      .max(10, "Longevity cannot exceed 10"),

    sillage: z
      .number({
        required_error: "Sillage rating is required",
      })
      .min(1, "Sillage must be at least 1")
      .max(10, "Sillage cannot exceed 10"),

    projection: z
      .number({
        required_error: "Projection rating is required",
      })
      .min(1, "Projection must be at least 1")
      .max(10, "Projection cannot exceed 10"),

    images: z
      .array(z.string().url("Invalid image URL"))
      .min(1, "At least one image is required"),

    thumbnail: z
      .string({
        required_error: "Thumbnail is required",
      })
      .url("Invalid thumbnail URL"),

    decantSizes: z
      .array(decantSizeSchema)
      .min(1, "At least one decant size is required"),

    tags: z.array(z.string()).optional(),

    metaTitle: z
      .string()
      .max(60, "Meta title cannot exceed 60 characters")
      .optional(),

    metaDescription: z
      .string()
      .max(160, "Meta description cannot exceed 160 characters")
      .optional(),
  }),
});

const updateProductSchema = z.object({
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
      .min(10, "Description must be at least 10 characters")
      .max(2000, "Description cannot exceed 2000 characters")
      .trim()
      .optional(),

    category: z
      .enum(Object.values(PRODUCT_CATEGORY) as [string, ...string[]])
      .optional(),

    fragranceType: z
      .enum(Object.values(FRAGRANCE_TYPE) as [string, ...string[]])
      .optional(),

    gender: z.enum(["men", "women", "unisex"]).optional(),

    fragranceNotes: fragranceNotesSchema.optional(),

    longevity: z
      .number()
      .min(1, "Longevity must be at least 1")
      .max(10, "Longevity cannot exceed 10")
      .optional(),

    sillage: z
      .number()
      .min(1, "Sillage must be at least 1")
      .max(10, "Sillage cannot exceed 10")
      .optional(),

    projection: z
      .number()
      .min(1, "Projection must be at least 1")
      .max(10, "Projection cannot exceed 10")
      .optional(),

    images: z
      .array(z.string().url("Invalid image URL"))
      .min(1, "At least one image is required")
      .optional(),

    thumbnail: z.string().url("Invalid thumbnail URL").optional(),

    decantSizes: z
      .array(decantSizeSchema)
      .min(1, "At least one decant size is required")
      .optional(),

    status: z
      .enum(Object.values(PRODUCT_STATUS) as [string, ...string[]])
      .optional(),

    tags: z.array(z.string()).optional(),

    metaTitle: z
      .string()
      .max(60, "Meta title cannot exceed 60 characters")
      .optional(),

    metaDescription: z
      .string()
      .max(160, "Meta description cannot exceed 160 characters")
      .optional(),
  }),
});

const getProductsQuerySchema = z.object({
  query: z.object({
    searchTerm: z.string().optional(),
    category: z
      .enum(Object.values(PRODUCT_CATEGORY) as [string, ...string[]])
      .optional(),
    brand: z.string().optional(),
    gender: z.enum(["men", "women", "unisex"]).optional(),
    fragranceType: z
      .enum(Object.values(FRAGRANCE_TYPE) as [string, ...string[]])
      .optional(),
    minPrice: z
      .string()
      .transform(Number)
      .refine((val) => val >= 0, "Min price must be positive")
      .optional(),
    maxPrice: z
      .string()
      .transform(Number)
      .refine((val) => val >= 0, "Max price must be positive")
      .optional(),
    status: z
      .enum(Object.values(PRODUCT_STATUS) as [string, ...string[]])
      .optional(),
    sortBy: z
      .enum(["name", "brand", "price", "createdAt", "averageRating"])
      .optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
    page: z
      .string()
      .transform(Number)
      .refine((val) => val > 0, "Page must be positive")
      .optional(),
    limit: z
      .string()
      .transform(Number)
      .refine((val) => val > 0 && val <= 50, "Limit must be between 1 and 50")
      .optional(),
  }),
});

export const ProductValidation = {
  createProduct: createProductSchema,
  updateProduct: updateProductSchema,
  getProductsQuery: getProductsQuerySchema,
};
