import { ShopType } from "./shop";

export type FetchSellerDetailsResponseType = {
  success: boolean;
  shop: ShopType;
  followersCount: number;
};

export type SellerRevenueData = {
  success: true;
  revenueData: {
    month: string;
    amount: number;
  }[];
};
