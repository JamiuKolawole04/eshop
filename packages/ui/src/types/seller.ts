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
  accountName?: string;
};

export type PayoutBankType = {
  id: number;
  name: string;
  code: string;
  slug: string;
  currency: string;
  type: string;
};

export type FetchPayoutBanksResponseType = {
  success: boolean;
  banks: PayoutBankType[];
};

export type ResolvePayoutAccountResponseType = {
  success: boolean;
  accountName: string;
  accountNumber: string;
};

export type SellerRevenueData = {
  success: true;
  revenueData: {
    month: string;
    amount: number;
  }[];
};
