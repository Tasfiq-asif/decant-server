import { v2 as cloudinary } from "cloudinary";
import { env } from "./envConfig";

// Configure Cloudinary
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

// Validate configuration
if (
  !env.CLOUDINARY_CLOUD_NAME ||
  !env.CLOUDINARY_API_KEY ||
  !env.CLOUDINARY_API_SECRET
) {
  console.warn(
    "Warning: Cloudinary configuration is incomplete. Please check your environment variables."
  );
}

export default cloudinary;
