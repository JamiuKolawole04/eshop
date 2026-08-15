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
  deletedAt: string | null;
  shopId: string;
  createdAt: string;
  updatedAt: string;
  images: {
    id: string;
    file_id: string;
    url: string;
    userId: string | null;
    shopId: string | null;
    productId: string;
    createdAt: string;
    updatedAt: string;
  }[];
};

export type CreateProductResponseType = {
  success: true;
  newProduct: ProductType;
};
