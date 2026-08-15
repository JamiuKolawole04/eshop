export type ShopType = {
  id: string;
  name: string;
  bio: string | null;
  category: string;
  avatar: string | null;
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
  createdAt: string;
  updatedAt: string;
};
