export type ShopType = {
  id: string;
  name: string;
  bio: string | null;
  category: string;
  avatar: string;
  coverBanner: string | null;
  address: string | null;
  opening_hours: string | null;
  website: string | null;
  socialLinks: unknown[];
  ratings: number;
  isDeleted: boolean | null;
  deletedAt: string | null;
  imageId: string | null;
  sellerId: string | null;
  followers: string[];
  createdAt: string;
  updatedAt: string;
};

export type GetFilteredShopsResponseType = {
  shops: Array<ShopType>;
  pagination: {
    total: number;
    page: number;
    totalPages: number;
  };
};

type TopShopsType = ShopType & { totalSales: number };

export type GetTopShopsResponseType = { shops: Array<TopShopsType> };
