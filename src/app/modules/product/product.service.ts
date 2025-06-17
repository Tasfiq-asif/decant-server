import { Product } from "./product.model";
import {
  TProduct,
  TCreateProduct,
  TUpdateProduct,
  TProductQuery,
} from "./product.interface";
import AppError from "../../errors/AppError";
import { HTTP_STATUS } from "../../constants";

const createProduct = async (
  payload: TCreateProduct,
  createdBy: string
): Promise<TProduct> => {
  try {
    // Check if product with same name and brand already exists
    const existingProduct = await Product.findOne({
      name: payload.name,
      brand: payload.brand,
      isDeleted: false,
    });

    if (existingProduct) {
      throw new AppError(
        HTTP_STATUS.CONFLICT,
        "Product with this name and brand already exists"
      );
    }

    const productData = {
      ...payload,
      createdBy,
    };

    const result = await Product.create(productData);
    return result;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "Failed to create product"
    );
  }
};

const getAllProducts = async (query: TProductQuery) => {
  try {
    const {
      searchTerm,
      category,
      brand,
      gender,
      fragranceType,
      minPrice,
      maxPrice,
      status = "active",
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 10,
    } = query;

    // Build the filter object
    const filter: any = { isDeleted: false };

    if (status) {
      filter.status = status;
    }

    if (category) {
      filter.category = category;
    }

    if (brand) {
      filter.brand = { $regex: brand, $options: "i" };
    }

    if (gender) {
      filter.gender = gender;
    }

    if (fragranceType) {
      filter.fragranceType = fragranceType;
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter["decantSizes.price"] = {};
      if (minPrice !== undefined) {
        filter["decantSizes.price"].$gte = minPrice;
      }
      if (maxPrice !== undefined) {
        filter["decantSizes.price"].$lte = maxPrice;
      }
    }

    // Search term - using text index
    if (searchTerm) {
      filter.$text = { $search: searchTerm };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sort: any = {};
    if (sortBy === "price") {
      sort["decantSizes.price"] = sortOrder === "asc" ? 1 : -1;
    } else {
      sort[sortBy] = sortOrder === "asc" ? 1 : -1;
    }

    // Execute query
    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    const total = await Product.countDocuments(filter);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw new AppError(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "Failed to fetch products"
    );
  }
};

const getProductById = async (id: string): Promise<TProduct> => {
  try {
    const result = await Product.findOne({ _id: id, isDeleted: false })
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    if (!result) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, "Product not found");
    }

    return result;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "Failed to fetch product"
    );
  }
};

const getProductBySlug = async (slug: string): Promise<TProduct> => {
  try {
    const result = await Product.findOne({ slug, isDeleted: false })
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    if (!result) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, "Product not found");
    }

    return result;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "Failed to fetch product"
    );
  }
};

const updateProduct = async (
  id: string,
  payload: TUpdateProduct,
  updatedBy: string
): Promise<TProduct> => {
  try {
    const product = await Product.findOne({ _id: id, isDeleted: false });

    if (!product) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, "Product not found");
    }

    // Check if updating name/brand would create a duplicate
    if (payload.name || payload.brand) {
      const nameToCheck = payload.name || product.name;
      const brandToCheck = payload.brand || product.brand;

      const existingProduct = await Product.findOne({
        name: nameToCheck,
        brand: brandToCheck,
        _id: { $ne: id },
        isDeleted: false,
      });

      if (existingProduct) {
        throw new AppError(
          HTTP_STATUS.CONFLICT,
          "Product with this name and brand already exists"
        );
      }
    }

    const updateData = {
      ...payload,
      updatedBy,
    };

    const result = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    if (!result) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, "Product not found");
    }

    return result;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "Failed to update product"
    );
  }
};

const deleteProduct = async (id: string): Promise<void> => {
  try {
    const result = await Product.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );

    if (!result) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, "Product not found");
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "Failed to delete product"
    );
  }
};

const updateProductStock = async (
  id: string,
  sizeUpdates: { size: string; newStock: number }[]
): Promise<TProduct> => {
  try {
    const product = await Product.findOne({ _id: id, isDeleted: false });

    if (!product) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, "Product not found");
    }

    // Update stock for specific sizes
    sizeUpdates.forEach((update) => {
      const sizeIndex = product.decantSizes.findIndex(
        (size) => size.size === update.size
      );

      if (sizeIndex !== -1) {
        product.decantSizes[sizeIndex].stock = update.newStock;
        product.decantSizes[sizeIndex].isAvailable = update.newStock > 0;
      }
    });

    const result = await product.save();
    return result;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "Failed to update product stock"
    );
  }
};

const getFeaturedProducts = async (limit: number = 8): Promise<TProduct[]> => {
  try {
    const result = await Product.find({
      isDeleted: false,
      status: "active",
      totalStock: { $gt: 0 },
    })
      .sort({ averageRating: -1, totalReviews: -1 })
      .limit(limit)
      .populate("createdBy", "name email");

    return result;
  } catch (error) {
    throw new AppError(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "Failed to fetch featured products"
    );
  }
};

const getProductsByBrand = async (
  brand: string,
  limit: number = 10
): Promise<TProduct[]> => {
  try {
    const result = await Product.find({
      brand: { $regex: brand, $options: "i" },
      isDeleted: false,
      status: "active",
    })
      .sort({ createdAt: -1 })
      .limit(limit);

    return result;
  } catch (error) {
    throw new AppError(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "Failed to fetch products by brand"
    );
  }
};

const getRelatedProducts = async (
  productId: string,
  category: string,
  limit: number = 6
): Promise<TProduct[]> => {
  try {
    const result = await Product.find({
      _id: { $ne: productId },
      category,
      isDeleted: false,
      status: "active",
    })
      .sort({ averageRating: -1 })
      .limit(limit);

    return result;
  } catch (error) {
    throw new AppError(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "Failed to fetch related products"
    );
  }
};

export const ProductService = {
  createProduct,
  getAllProducts,
  getProductById,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  updateProductStock,
  getFeaturedProducts,
  getProductsByBrand,
  getRelatedProducts,
};
