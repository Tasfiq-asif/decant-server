import multer from "multer";
import cloudinary from "../../configs/cloudinary";
import AppError from "../errors/AppError";
import { HTTP_STATUS } from "../constants";

// Configure multer to use memory storage
const storage = multer.memoryStorage();

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10, // Maximum 10 files
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(
        new AppError(HTTP_STATUS.BAD_REQUEST, "Only image files are allowed!")
      );
    }
  },
});

// Upload single image
export const uploadSingle = upload.single("image");

// Upload multiple images (max 10)
export const uploadMultiple = upload.array("images", 10);

// Upload fields (for different image types)
export const uploadFields = upload.fields([
  { name: "images", maxCount: 8 },
  { name: "thumbnail", maxCount: 1 },
]);

// Utility function to upload buffer to Cloudinary
export const uploadToCloudinary = async (
  buffer: Buffer,
  folder: string = "decantifume/products"
): Promise<string> => {
  try {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: folder,
            allowed_formats: ["jpg", "jpeg", "png", "webp"],
            transformation: [
              {
                width: 1200,
                height: 1200,
                crop: "limit",
                quality: "auto:good",
                format: "webp",
              },
            ],
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result!.secure_url);
            }
          }
        )
        .end(buffer);
    });
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw new AppError(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "Failed to upload image to cloud storage"
    );
  }
};

// Utility function to delete image from Cloudinary
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
    throw new AppError(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "Failed to delete image from cloud storage"
    );
  }
};

// Utility function to extract public ID from Cloudinary URL
export const extractPublicId = (url: string): string => {
  const parts = url.split("/");
  const filename = parts[parts.length - 1];
  return filename.split(".")[0];
};

// Utility function to upload base64 image to Cloudinary
export const uploadBase64ToCloudinary = async (
  base64String: string,
  folder: string = "decantifume/products"
): Promise<string> => {
  try {
    const result = await cloudinary.uploader.upload(base64String, {
      folder: folder,
      transformation: [
        {
          width: 1200,
          height: 1200,
          crop: "limit",
          quality: "auto:good",
          format: "webp",
        },
      ],
    });
    return result.secure_url;
  } catch (error) {
    console.error("Error uploading base64 to Cloudinary:", error);
    throw new AppError(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "Failed to upload image to cloud storage"
    );
  }
};
