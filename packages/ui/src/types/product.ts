import { FileType } from "./file";
import { ShopType } from "./shop";

export type ProductType = {
  id: string;
  title: string;
  slug: string;
  category: string;
  subCategory: string;
  short_description: string;
  detailed_description: string;
  video_url: string;
  tags: string[];
  brand: string;
  colors: string[];
  sizes: string[];
  starting_date: string | null;
  ending_date: string | null;
  stock: number;
  sale_price: number;
  regular_price: number;
  ratings: number;
  warranty: string;
  custom_specifications: unknown[];
  custom_properties: unknown[];
  isDeleted: boolean;
  cashOnDelivery: "yes" | "no";
  discount_codes: string[];
  status: "Active" | "Pending" | "Draft";
  totalSales: number;
  deletedAt: string | null;
  shopId: string;
  createdAt: string;
  updatedAt: string;
  images: Array<FileType>;
};

export type ProductWithRelationsType = ProductType & {
  shop: ShopType;
};

export type CreateProductResponseType = {
  success: true;
  newProduct: ProductType;
};

export type GetAllProductsResponseType = {
  success: true;
  products: ProductWithRelationsType[];
  top10By: "latest" | "topSales";
  top10Products: ProductType[];
  total: number;
  currentPage: number;
  totalPages: number;
};

export type GetProductBySlugResponseType = {
  success: true;
  product: ProductWithRelationsType;
};

export type GetFilteredProducts = {
  products: ProductWithRelationsType[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
  };
};
