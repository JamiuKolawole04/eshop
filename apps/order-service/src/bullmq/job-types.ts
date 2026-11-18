/* eslint-disable @typescript-eslint/no-explicit-any */
export type OrderConfirmationJob = {
  orderId: string;
  userEmail: string;
  userName: string;
  cart: any[];
  totalAmount: number;
  trackingUrl: string;
  paymentMethod?: "online" | "cash_on_delivery";
  contactPhone?: string | null;
};

export type SellerOrderAlertJob = {
  orderId: string;
  sellerEmail: string;
  sellerName: string;
  shopName: string;
  buyerName: string;
  cart: any[];
  totalAmount: number;
  paymentMethod?: "online" | "cash_on_delivery";
  contactPhone?: string | null;
  orderUrl: string;
};
