/* eslint-disable @typescript-eslint/no-explicit-any */
export type OrderConfirmationJob = {
  orderId: string;
  userEmail: string;
  userName: string;
  cart: any[];
  totalAmount: number;
  trackingUrl: string;
};
