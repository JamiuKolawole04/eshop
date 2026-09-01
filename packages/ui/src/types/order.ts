export interface OrderUser {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

export interface Order {
  id: string;
  userId: string;
  shopId: string;
  total: number;
  shippingAddressId: string;
  couponCode: string | null;
  discountAmount: number;
  status: string; // "Paid" | "Pending" | "Failed"
  deliveryStatus: string; // "Ordered" | "Shipped" | "Delivered" | "Cancelled"
  createdAt: string;
  updatedAt: string;
  user: OrderUser;
}

export interface SellerOrdersResponseType {
  success: boolean;
  orders: Order[];
}
