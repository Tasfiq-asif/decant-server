import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ProductService } from "./product.service";
import { HTTP_STATUS } from "../../constants";
import {
  deleteFromCloudinary,
  extractPublicId,
  uploadToCloudinary,
} from "../../utils/fileUpload";

const createProduct = catchAsync(async (req: Request, res: Response) => {
  try {
    console.log(
      "Creating product with data:",
      JSON.stringify(req.body, null, 2)
    );
    const userId = req.user?.userId!;
    console.log("User ID:", userId);

    const result = await ProductService.createProduct(req.body, userId);

    sendResponse(res, {
      statusCode: HTTP_STATUS.CREATED,
      success: true,
      message: "Product created successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error in createProduct controller:", error);
    throw error;
  }
});

const getAllProducts = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.getAllProducts(req.query);

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "Products retrieved successfully",
    data: result.products,
    meta: result.pagination,
  });
});

const getProductById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ProductService.getProductById(id);

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "Product retrieved successfully",
    data: result,
  });
});

const getProductBySlug = catchAsync(async (req: Request, res: Response) => {
  const { slug } = req.params;
  const result = await ProductService.getProductBySlug(slug);

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "Product retrieved successfully",
    data: result,
  });
});

const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId!;
  const result = await ProductService.updateProduct(id, req.body, userId);

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "Product updated successfully",
    data: result,
  });
});

const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await ProductService.deleteProduct(id);

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "Product deleted successfully",
    data: null,
  });
});

const getFeaturedProducts = catchAsync(async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 8;
  const result = await ProductService.getFeaturedProducts(limit);

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "Featured products retrieved successfully",
    data: result,
  });
});

const getProductsByBrand = catchAsync(async (req: Request, res: Response) => {
  const { brand } = req.params;
  const limit = parseInt(req.query.limit as string) || 10;
  const result = await ProductService.getProductsByBrand(brand, limit);

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "Products by brand retrieved successfully",
    data: result,
  });
});

const getRelatedProducts = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { category } = req.query;
  const limit = parseInt(req.query.limit as string) || 6;

  const result = await ProductService.getRelatedProducts(
    id,
    category as string,
    limit
  );

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "Related products retrieved successfully",
    data: result,
  });
});

// File upload controllers
const uploadProductImages = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const uploadedFiles: { images: string[]; thumbnail?: string } = {
    images: [],
  };

  // Process uploaded images
  if (files.images) {
    const imagePromises = files.images.map((file) =>
      uploadToCloudinary(file.buffer, "decantifume/products")
    );
    uploadedFiles.images = await Promise.all(imagePromises);
  }

  // Process uploaded thumbnail
  if (files.thumbnail && files.thumbnail[0]) {
    uploadedFiles.thumbnail = await uploadToCloudinary(
      files.thumbnail[0].buffer,
      "decantifume/products"
    );
  }

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "Images uploaded successfully",
    data: uploadedFiles,
  });
});

const uploadSingleImage = catchAsync(async (req: Request, res: Response) => {
  const file = req.file;

  if (!file) {
    sendResponse(res, {
      statusCode: HTTP_STATUS.BAD_REQUEST,
      success: false,
      message: "No image file provided",
      data: null,
    });
    return;
  }

  // Upload buffer to Cloudinary
  const imageUrl = await uploadToCloudinary(
    file.buffer,
    "decantifume/products"
  );

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "Image uploaded successfully",
    data: {
      url: imageUrl,
    },
  });
});

const deleteProductImage = catchAsync(async (req: Request, res: Response) => {
  const { imageUrl } = req.body;

  if (!imageUrl) {
    sendResponse(res, {
      statusCode: HTTP_STATUS.BAD_REQUEST,
      success: false,
      message: "Image URL is required",
      data: null,
    });
    return;
  }

  // Extract public ID from Cloudinary URL
  const publicId = extractPublicId(imageUrl);

  // Delete from Cloudinary
  await deleteFromCloudinary(publicId);

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "Image deleted successfully",
    data: null,
  });
});

export const ProductController = {
  createProduct,
  getAllProducts,
  getProductById,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getProductsByBrand,
  getRelatedProducts,
  uploadProductImages,
  uploadSingleImage,
  deleteProductImage,
};
