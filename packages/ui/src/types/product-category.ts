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
