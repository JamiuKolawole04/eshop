export const ProductCategories = {
  categories: ["Electronics", "Fashion", "Home & Kitchen", "Sports & Fitness"],
  subCategories: {
    Electronics: ["Mobiles", "Laptops", "Accessories", "Gaming"],
    Fashion: ["Men", "Women", "Kids", "Footwear"],
    "Home & Kitchen": ["Furniture", "Appliances", "Decor"],
    "Sports & Fitness": ["Gym Equipment", "Outdoor Sports", "Wearables"],
  },
} as const;

export type ProductCategory = (typeof ProductCategories.categories)[number];

export type SubCategoriesMap = typeof ProductCategories.subCategories;

export type SubCategory<C extends ProductCategory> =
  SubCategoriesMap[C][number];

export type AnySubCategory = SubCategoriesMap[ProductCategory][number];

export type ProductCategoriesTypes = typeof ProductCategories;

export type WorkspaceType = {
  _id: string;
  name: string;
  description?: string;
  owner: string;
  inviteCode: string;
};

export type CreateWorkspaceResponseType = {
  message: string;
  workspace: WorkspaceType;
};

export type DiscountType = "percentage" | "fixed";

export type DiscountCode = {
  id: string;
  public_name: string;
  discountType: DiscountType;
  discountValue: number;
  discountCode: string;
  sellerId: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
};

export type CreateDiscountCodeResponseType = {
  success: boolean;
  discount_code: DiscountCode;
};

export type AllDiscountCodeResponseType = {
  success: boolean;
  discount_codes: Array<DiscountCode>;
};

export type DeleteDiscountCodeResponseType = {
  message: string;
};
