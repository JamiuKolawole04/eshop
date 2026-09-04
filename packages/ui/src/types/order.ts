import { AddressType } from "./address";
import { DiscountCode } from "./discount-code";
import { FileType } from "./file";

type DeliveryStaus =
  | "Ordered"
  | "Packed"
  | "Shipped"
  | "Out for Delivery"
  | "Delivered"
  | "Cancelled";

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
  deliveryStatus: DeliveryStaus;
  createdAt: string;
  updatedAt: string;
  user: OrderUser;
}

export interface SellerOrdersResponseType {
  success: boolean;
  orders: Order[];
}

export interface OrderProduct {
  id: string;
  title: string;
  images: FileType[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  selectedOptions: Record<string, string> | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderWithItems extends Order {
  oderItems: OrderItem[];
}

export interface OrderItemWithProduct extends OrderItem {
  product: OrderProduct;
}

type Coupon = DiscountCode;

export interface OrderDetailsType {
  id: string;
  userId: string;
  shopId: string;
  total: number;
  shippingAddressId: string;
  couponCode: Coupon | null;
  discountAmount: number;
  status: string;
  deliveryStatus: DeliveryStaus;
  createdAt: string;
  updatedAt: string;
  oderItems: OrderItem[];
  items: OrderItemWithProduct[];
  shippingAddress: AddressType;
}

export interface OrderDetailsResponseType {
  success: boolean;
  order: OrderDetailsType;
}

export interface VerifyCouponCodeResponseType {
  valid: boolean;
  discount: number;
  discountAmount: string;
  discountedProductId: string;
  discountType: string;
  message: string;
}

export interface UserOrdersResponseType {
  success: boolean;
  orders: OrderWithItems[];
}
