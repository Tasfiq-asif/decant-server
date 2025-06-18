import {
  PRODUCT_CATEGORY,
  PRODUCT_STATUS,
  DECANT_SIZE,
  FRAGRANCE_TYPE,
} from "../../constants";

export interface TDecantSize {
  size: string; // e.g., "5ml", "10ml", "15ml"
  price: number;
  stock: number;
  isAvailable?: boolean;
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
  decantSizes: TDecantSize[]; // Multiple volumes with different prices
  images: string[];
  thumbnail?: string;
  status?: string;
  isDeleted?: boolean;
  slug?: string;
  tags?: string[];
  totalStock?: number; // Calculated from all decant sizes
  averageRating?: number;
  totalReviews?: number;
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
  decantSizes: TDecantSize[];
  images: string[];
  thumbnail?: string;
  tags?: string[];
}

export interface TUpdateProduct {
  name?: string;
  brand?: string;
  description?: string;
  category?: string;
  decantSizes?: TDecantSize[];
  images?: string[];
  thumbnail?: string;
  status?: string;
  tags?: string[];
}

export interface TProductQuery {
  searchTerm?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}
