import {
  PRODUCT_CATEGORY,
  PRODUCT_STATUS,
  DECANT_SIZE,
  FRAGRANCE_TYPE,
} from "../../constants";

export interface TDecantSize {
  size: string;
  price: number;
  stock: number;
  isAvailable: boolean;
}

export interface TFragranceNotes {
  top: string[];
  middle: string[];
  base: string[];
}

export interface TProduct {
  _id?: string;
  name: string;
  brand: string;
  description: string;
  category: string;
  fragranceType: string;
  gender: "men" | "women" | "unisex";

  // Fragrance details
  fragranceNotes: TFragranceNotes;
  longevity: number; // 1-10 scale
  sillage: number; // 1-10 scale
  projection: number; // 1-10 scale

  // Product images
  images: string[];
  thumbnail: string;

  // Decant sizes and pricing
  decantSizes: TDecantSize[];

  // Product status and inventory
  status: string;
  isDeleted: boolean;
  totalStock: number;

  // SEO and metadata
  slug: string;
  tags: string[];
  metaTitle?: string;
  metaDescription?: string;

  // Ratings and reviews
  averageRating?: number;
  totalReviews?: number;

  // Admin fields
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TCreateProduct {
  name: string;
  brand: string;
  description: string;
  category: string;
  fragranceType: string;
  gender: "men" | "women" | "unisex";
  fragranceNotes: TFragranceNotes;
  longevity: number;
  sillage: number;
  projection: number;
  images: string[];
  thumbnail: string;
  decantSizes: TDecantSize[];
  tags: string[];
  metaTitle?: string;
  metaDescription?: string;
}

export interface TUpdateProduct {
  name?: string;
  brand?: string;
  description?: string;
  category?: string;
  fragranceType?: string;
  gender?: "men" | "women" | "unisex";
  fragranceNotes?: TFragranceNotes;
  longevity?: number;
  sillage?: number;
  projection?: number;
  images?: string[];
  thumbnail?: string;
  decantSizes?: TDecantSize[];
  status?: string;
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
}

export interface TProductQuery {
  searchTerm?: string;
  category?: string;
  brand?: string;
  gender?: string;
  fragranceType?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}
