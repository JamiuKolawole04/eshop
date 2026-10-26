import { ShopType } from "./shop";

export type FetchSellerDetailsResponseType = {
  success: boolean;
  shop: ShopType;
  followersCount: number;
};

export type CreatePayoutAccountResponseType = {
  success: boolean;
  message?: string;
  paystackSubaccountCode?: string;
};

export type SellerRevenueData = {
  success: true;
  revenueData: {
    month: string;
    amount: number;
  }[];
};
