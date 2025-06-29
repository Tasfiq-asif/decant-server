import { Product } from "./product.model";
import {
  TProduct,
  TCreateProduct,
  TUpdateProduct,
  TProductQuery,
} from "./product.interface";
import AppError from "../../errors/AppError";
import { HTTP_STATUS } from "../../constants";
import { deleteFromCloudinary, extractPublicId } from "../../utils/fileUpload";

const createProduct = async (
  payload: TCreateProduct,
  createdBy: string
): Promise<TProduct> => {
  try {
    console.log(
      "Service: Creating product with payload:",
      JSON.stringify(payload, null, 2)
    );
    console.log("Service: Created by user:", createdBy);

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
      thumbnail: payload.thumbnail || payload.images[0], // Use first image as thumbnail if not provided
      createdBy,
    };

    console.log(
      "Service: Final product data:",
      JSON.stringify(productData, null, 2)
    );

    const result = await Product.create(productData);
    console.log("Service: Product created successfully:", result._id);
    return result;
  } catch (error) {
    console.error("Service: Error creating product:", error);
    if (error instanceof AppError) {
      throw error;
    }
    // Log the actual error details
    if (error instanceof Error) {
      console.error("Service: Error message:", error.message);
      console.error("Service: Error stack:", error.stack);
    }
    throw new AppError(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      `Failed to create product: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

const createProductWithImages = async (
  payload: TCreateProduct,
  files: { images?: Express.Multer.File[]; thumbnail?: Express.Multer.File[] },
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

    // Process uploaded images
    const images: string[] = [];
    let thumbnail = "";

    if (files.images) {
      images.push(...files.images.map((file) => file.path));
    }

    if (files.thumbnail && files.thumbnail[0]) {
      thumbnail = files.thumbnail[0].path;
    }

    const productData = {
      ...payload,
      images: images.length > 0 ? images : payload.images,
      thumbnail: thumbnail || payload.thumbnail,
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
      "Failed to create product with images"
    );
  }
};

const getAllProducts = async (query: TProductQuery) => {
  try {
    const {
      searchTerm,
      category,
      brand,
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

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) {
        filter.price.$gte = minPrice;
      }
      if (maxPrice !== undefined) {
        filter.price.$lte = maxPrice;
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
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // OPTIMIZED: Improved query with field projection for better performance
    // Only select fields needed for frontend display
    const projection =
      "name brand description category decantSizes images thumbnail status totalStock slug tags averageRating totalReviews createdAt updatedAt";

    // Execute optimized query
    const products = await Product.find(filter)
      .select(projection) // Use select() method for field projection
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(); // Use lean() for better performance - returns plain objects

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
    const existingProduct = await Product.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!existingProduct) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, "Product not found");
    }

    // Check for duplicate name and brand (excluding current product)
    if (payload.name || payload.brand) {
      const duplicateProduct = await Product.findOne({
        name: payload.name || existingProduct.name,
        brand: payload.brand || existingProduct.brand,
        _id: { $ne: id },
        isDeleted: false,
      });

      if (duplicateProduct) {
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

    return result!;
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
    const existingProduct = await Product.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!existingProduct) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, "Product not found");
    }

    // Delete images from Cloudinary
    if (existingProduct.images && existingProduct.images.length > 0) {
      const deletePromises = existingProduct.images.map((imageUrl) => {
        const publicId = extractPublicId(imageUrl);
        return deleteFromCloudinary(publicId);
      });

      await Promise.all(deletePromises);
    }

    // Soft delete
    await Product.findByIdAndUpdate(id, { isDeleted: true });
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

const getFeaturedProducts = async (limit: number = 8): Promise<TProduct[]> => {
  try {
    // OPTIMIZED: Use lean() and field projection for better performance
    const projection =
      "name brand description category decantSizes images thumbnail status totalStock slug tags averageRating totalReviews createdAt updatedAt";

    const result = await Product.find({
      status: "active",
      isDeleted: false,
    })
      .select(projection)
      .sort({ averageRating: -1, createdAt: -1 })
      .limit(limit)
      .lean(); // Remove population and use lean() for better performance

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
    // OPTIMIZED: Use lean() and field projection for better performance
    const projection =
      "name brand description category decantSizes images thumbnail status totalStock slug tags averageRating totalReviews createdAt updatedAt";

    const result = await Product.find({
      brand: { $regex: brand, $options: "i" },
      status: "active",
      isDeleted: false,
    })
      .select(projection)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean(); // Remove population and use lean() for better performance

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
    // OPTIMIZED: Use lean() and field projection for better performance
    const projection =
      "name brand description category decantSizes images thumbnail status totalStock slug tags averageRating totalReviews createdAt updatedAt";

    const result = await Product.find({
      _id: { $ne: productId },
      category,
      status: "active",
      isDeleted: false,
    })
      .select(projection)
      .sort({ averageRating: -1, createdAt: -1 })
      .limit(limit)
      .lean(); // Remove population and use lean() for better performance

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
  getFeaturedProducts,
  getProductsByBrand,
  getRelatedProducts,
};
