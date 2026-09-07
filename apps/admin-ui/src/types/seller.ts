export type Seller = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  shop: {
    name: string;
    avatar: string;
    address: string;
  };
};

export type SellersResponseType = {
  success: true;
  data: Array<Seller>;
  meta: {
    totalSellers: number;
    currentPage: number;
    totalPages: number;
  };
};
