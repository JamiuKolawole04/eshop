import { ShopType } from "./shop";

export type FetchSellerDetailsResponseType = {
  success: boolean;
  shop: ShopType;
  followersCount: number;
};
