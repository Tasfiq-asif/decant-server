import { Schema, model } from "mongoose";
import { TProduct, TDecantSize } from "./product.interface";
import { PRODUCT_CATEGORY, PRODUCT_STATUS } from "../../constants";

const decantSizeSchema = new Schema<TDecantSize>(
  {
    size: {
      type: String,
      required: [true, "Decant size is required"],
      enum: ["2ml", "5ml", "10ml", "15ml", "20ml", "30ml"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be positive"],
    },
    stock: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock cannot be negative"],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

const productSchema = new Schema<TProduct>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [200, "Product name cannot exceed 200 characters"],
    },
    brand: {
      type: String,
      required: [true, "Brand is required"],
      trim: true,
      maxlength: [100, "Brand name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: Object.values(PRODUCT_CATEGORY),
    },
    decantSizes: {
      type: [decantSizeSchema],
      required: [true, "At least one decant size is required"],
      validate: {
        validator: function (sizes: TDecantSize[]) {
          return sizes.length > 0;
        },
        message: "At least one decant size is required",
      },
    },
    images: {
      type: [String],
      required: [true, "At least one image is required"],
      validate: {
        validator: function (images: string[]) {
          return images.length > 0;
        },
        message: "At least one image is required",
      },
    },
    thumbnail: {
      type: String,
    },
    status: {
      type: String,
      enum: Object.values(PRODUCT_STATUS),
      default: PRODUCT_STATUS.ACTIVE,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    totalStock: {
      type: Number,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    averageRating: {
      type: Number,
      min: [0, "Rating cannot be negative"],
      max: [5, "Rating cannot exceed 5"],
      default: 0,
    },
    totalReviews: {
      type: Number,
      min: [0, "Review count cannot be negative"],
      default: 0,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create slug from name and brand before saving
productSchema.pre("save", function (next) {
  if (this.isModified("name") || this.isModified("brand") || this.isNew) {
    const slugBase = `${this.brand}-${this.name}`
      .toLowerCase()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with dashes
      .replace(/-+/g, "-") // Replace multiple dashes with single dash
      .trim();

    this.slug = slugBase;
  }
  next();
});

// Calculate total stock from decant sizes
productSchema.pre("save", function (next) {
  if (this.isModified("decantSizes")) {
    this.totalStock = this.decantSizes.reduce(
      (total, size) => total + size.stock,
      0
    );
  }
  next();
});

// Index for search optimization
productSchema.index({
  name: "text",
  brand: "text",
  description: "text",
  tags: "text",
});
productSchema.index({ category: 1, status: 1 });
productSchema.index({ brand: 1, status: 1 });
productSchema.index({ slug: 1 });
productSchema.index({ createdAt: -1 });

export const Product = model<TProduct>("Product", productSchema);
