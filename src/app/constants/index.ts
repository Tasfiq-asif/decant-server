export const USER_ROLE = {
  USER: "user",
  ADMIN: "admin",
} as const;

export const USER_STATUS = {
  ACTIVE: "active",
  BLOCKED: "blocked",
} as const;

export const PRODUCT_CATEGORY = {
  MENS_FRAGRANCE: "mens_fragrance",
  WOMENS_FRAGRANCE: "womens_fragrance",
  UNISEX_FRAGRANCE: "unisex_fragrance",
  NICHE_FRAGRANCE: "niche_fragrance",
  DESIGNER_FRAGRANCE: "designer_fragrance",
  ORIENTAL: "oriental",
  FRESH: "fresh",
  WOODY: "woody",
  FLORAL: "floral",
  GOURMAND: "gourmand",
} as const;

export const PRODUCT_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  OUT_OF_STOCK: "out_of_stock",
  DISCONTINUED: "discontinued",
} as const;

export const DECANT_SIZE = {
  SIZE_2ML: "2ml",
  SIZE_5ML: "5ml",
  SIZE_10ML: "10ml",
  SIZE_15ML: "15ml",
  SIZE_20ML: "20ml",
  SIZE_30ML: "30ml",
} as const;

export const FRAGRANCE_TYPE = {
  EAU_DE_PARFUM: "eau_de_parfum",
  EAU_DE_TOILETTE: "eau_de_toilette",
  EAU_DE_COLOGNE: "eau_de_cologne",
  PARFUM: "parfum",
  EAU_FRAICHE: "eau_fraiche",
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;
