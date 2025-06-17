# Product API Documentation

## Base URL

```
http://localhost:4000/api/products
```

## Authentication

- Admin routes require Bearer token with admin role
- Public routes don't require authentication

## Endpoints

### 1. Get All Products (Public)

```
GET /api/products
```

**Query Parameters:**

- `searchTerm` (string, optional): Search in name, brand, description, tags
- `category` (string, optional): Filter by category
- `brand` (string, optional): Filter by brand
- `gender` (string, optional): men | women | unisex
- `fragranceType` (string, optional): eau_de_parfum | eau_de_toilette | etc.
- `minPrice` (number, optional): Minimum price filter
- `maxPrice` (number, optional): Maximum price filter
- `status` (string, optional): active | inactive | out_of_stock | discontinued
- `sortBy` (string, optional): name | brand | price | createdAt | averageRating
- `sortOrder` (string, optional): asc | desc
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10, max: 50)

**Response:**

```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

### 2. Get Featured Products (Public)

```
GET /api/products/featured?limit=8
```

### 3. Get Products by Brand (Public)

```
GET /api/products/brand/:brand?limit=10
```

### 4. Get Product by ID (Public)

```
GET /api/products/:id
```

### 5. Get Product by Slug (Public)

```
GET /api/products/slug/:slug
```

### 6. Get Related Products (Public)

```
GET /api/products/:id/related?category=mens_fragrance&limit=6
```

### 7. Create Product (Admin Only)

```
POST /api/products
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Aventus",
  "brand": "Creed",
  "description": "A sophisticated blend of fruity and smoky notes...",
  "category": "mens_fragrance",
  "fragranceType": "eau_de_parfum",
  "gender": "men",
  "fragranceNotes": {
    "top": ["Pineapple", "Bergamot", "Black Currant", "Apple"],
    "middle": ["Rose", "Dry Birch", "Moroccan Jasmine", "Patchouli"],
    "base": ["Oak Moss", "Musk", "Ambergris", "Vanilla"]
  },
  "longevity": 9,
  "sillage": 8,
  "projection": 8,
  "images": [
    "https://example.com/aventus-1.jpg",
    "https://example.com/aventus-2.jpg"
  ],
  "thumbnail": "https://example.com/aventus-thumb.jpg",
  "decantSizes": [
    {
      "size": "5ml",
      "price": 25.0,
      "stock": 50,
      "isAvailable": true
    },
    {
      "size": "10ml",
      "price": 45.0,
      "stock": 30,
      "isAvailable": true
    }
  ],
  "tags": ["fruity", "smoky", "masculine", "luxury"],
  "metaTitle": "Creed Aventus Decant - Premium Fragrance Sample",
  "metaDescription": "Experience the legendary Creed Aventus with our premium decant service. Fruity, smoky, and sophisticated."
}
```

### 8. Update Product (Admin Only)

```
PATCH /api/products/:id
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:** (All fields optional)

```json
{
  "name": "Updated Name",
  "status": "active",
  "decantSizes": [...]
}
```

### 9. Delete Product (Admin Only)

```
DELETE /api/products/:id
Authorization: Bearer <admin_token>
```

### 10. Update Product Stock (Admin Only)

```
PATCH /api/products/:id/stock
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "sizeUpdates": [
    {
      "size": "5ml",
      "newStock": 25
    },
    {
      "size": "10ml",
      "newStock": 15
    }
  ]
}
```

## Product Categories

- `mens_fragrance`
- `womens_fragrance`
- `unisex_fragrance`
- `niche_fragrance`
- `designer_fragrance`
- `oriental`
- `fresh`
- `woody`
- `floral`
- `gourmand`

## Fragrance Types

- `eau_de_parfum`
- `eau_de_toilette`
- `eau_de_cologne`
- `parfum`
- `eau_fraiche`

## Product Status

- `active`
- `inactive`
- `out_of_stock`
- `discontinued`

## Available Decant Sizes

- `2ml`
- `5ml`
- `10ml`
- `15ml`
- `20ml`
- `30ml`

## Error Responses

```json
{
  "success": false,
  "message": "Error message",
  "errorSources": [...]
}
```

## Sample Product Response

```json
{
  "success": true,
  "message": "Product retrieved successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "Aventus",
    "brand": "Creed",
    "description": "A sophisticated blend...",
    "category": "mens_fragrance",
    "fragranceType": "eau_de_parfum",
    "gender": "men",
    "fragranceNotes": {
      "top": ["Pineapple", "Bergamot"],
      "middle": ["Rose", "Dry Birch"],
      "base": ["Oak Moss", "Musk"]
    },
    "longevity": 9,
    "sillage": 8,
    "projection": 8,
    "images": ["..."],
    "thumbnail": "...",
    "decantSizes": [
      {
        "size": "5ml",
        "price": 25.0,
        "stock": 50,
        "isAvailable": true
      }
    ],
    "status": "active",
    "isDeleted": false,
    "totalStock": 80,
    "slug": "creed-aventus",
    "tags": ["fruity", "smoky"],
    "averageRating": 4.8,
    "totalReviews": 156,
    "createdAt": "2023-09-06T10:30:00Z",
    "updatedAt": "2023-09-06T10:30:00Z"
  }
}
```
