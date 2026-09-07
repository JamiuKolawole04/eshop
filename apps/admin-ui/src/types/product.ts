export type ProductForAdmin = {
  id: string;
  title: string;
  slug: string;
  stock: number;
  ratings: number;
  category: string;
  sale_price: number;
  images: Array<{ url: string }>;
  shop: {
    name: string;
  };
  createdAt: string;
  starting_date?: string;
  ending_date?: string;
};

export type ProductsForAdminResponseType = {
  success: true;
  data: Array<ProductForAdmin>;
  meta: {
    totalProducts: number;
    currentPage: number;
    totalPages: number;
  };
};

export type EventsForAdmin = ProductForAdmin;

export type EventsForAdminResponseType = {
  success: true;
  data: Array<EventsForAdmin>;
  meta: {
    totalProducts: number;
    currentPage: number;
    totalPages: number;
  };
};
