# File Upload Setup with Cloudinary & Multer

## Overview

This setup integrates Cloudinary for cloud storage and Multer for handling multipart/form-data file uploads in your decant perfume backend.

## Prerequisites

1. Create a Cloudinary account at [cloudinary.com](https://cloudinary.com)
2. Get your Cloud Name, API Key, and API Secret from the Cloudinary dashboard

## Environment Variables

Add these to your `.env` file:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Features Implemented

### 1. Automatic Image Optimization

- **Format**: Converts all images to WebP for better compression
- **Size**: Limits images to 1200x1200px maximum
- **Quality**: Auto-optimized for web delivery
- **Folder**: Organizes images in `decantifume/products/` folder

### 2. File Upload Endpoints

#### Upload Multiple Images

```
POST /api/products/upload/images
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

Form fields:
- images: Array of image files (max 8)
- thumbnail: Single thumbnail image (optional)
```

#### Upload Single Image

```
POST /api/products/upload/single
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

Form fields:
- image: Single image file
```

#### Delete Image

```
DELETE /api/products/upload/delete
Authorization: Bearer <admin_token>
Content-Type: application/json

Body:
{
  "imageUrl": "https://res.cloudinary.com/..."
}
```

### 3. File Validation

- **File Types**: Only images (jpg, jpeg, png, webp)
- **File Size**: Maximum 5MB per file
- **File Count**: Maximum 10 files per upload

### 4. Error Handling

- Invalid file types are rejected
- File size limits are enforced
- Cloudinary upload errors are handled gracefully

## Usage Examples

### Frontend Upload Example (JavaScript)

```javascript
// Upload multiple images
const formData = new FormData();
formData.append("images", file1);
formData.append("images", file2);
formData.append("thumbnail", thumbnailFile);

const response = await fetch("/api/products/upload/images", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${adminToken}`,
  },
  body: formData,
});

const result = await response.json();
console.log("Uploaded URLs:", result.data);
```

### Create Product with Images

```javascript
// 1. First upload images
const uploadResponse = await fetch("/api/products/upload/images", {
  method: "POST",
  headers: { Authorization: `Bearer ${adminToken}` },
  body: formData,
});
const { data: uploadedFiles } = await uploadResponse.json();

// 2. Then create product with image URLs
const productData = {
  name: "Aventus",
  brand: "Creed",
  // ... other product data
  images: uploadedFiles.images,
  thumbnail: uploadedFiles.thumbnail,
};

const productResponse = await fetch("/api/products", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${adminToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(productData),
});
```

### cURL Examples

#### Upload Images

```bash
curl -X POST \
  http://localhost:4000/api/products/upload/images \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg" \
  -F "thumbnail=@/path/to/thumbnail.jpg"
```

#### Upload Single Image

```bash
curl -X POST \
  http://localhost:4000/api/products/upload/single \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "image=@/path/to/image.jpg"
```

#### Delete Image

```bash
curl -X DELETE \
  http://localhost:4000/api/products/upload/delete \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"imageUrl": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/decantifume/products/sample.webp"}'
```

## Response Examples

### Successful Upload Response

```json
{
  "success": true,
  "message": "Images uploaded successfully",
  "data": {
    "images": [
      "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/decantifume/products/image1.webp",
      "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/decantifume/products/image2.webp"
    ],
    "thumbnail": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/decantifume/products/thumb.webp"
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Only image files are allowed!",
  "errorSources": [...]
}
```

## Security Features

- **Admin Only**: All upload endpoints require admin authentication
- **File Type Validation**: Only image files are accepted
- **File Size Limits**: 5MB maximum per file
- **Rate Limiting**: Inherits from your existing rate limiting setup

## Cloudinary Features Used

- **Auto-optimization**: Images are automatically optimized for web
- **Transformations**: Resize, crop, and format conversion
- **CDN Delivery**: Fast global content delivery
- **Secure URLs**: HTTPS delivery by default
- **Folder Organization**: Images stored in organized folders

## Cleanup on Product Deletion

When a product is deleted, the system automatically:

1. Extracts public IDs from Cloudinary URLs
2. Deletes associated images from Cloudinary
3. Soft deletes the product from the database

## Testing the Upload

1. Start your server: `npm run dev`
2. Get an admin token by logging in
3. Use Postman or cURL to test the upload endpoints
4. Check your Cloudinary dashboard to see uploaded images

## Troubleshooting

- **401 Unauthorized**: Check your admin token
- **400 Bad Request**: Verify file types and sizes
- **500 Server Error**: Check Cloudinary credentials in .env file
- **Images not uploading**: Verify Cloudinary configuration

## Next Steps

- Implement image resizing for different product views
- Add image compression settings
- Implement bulk image operations
- Add image metadata extraction
