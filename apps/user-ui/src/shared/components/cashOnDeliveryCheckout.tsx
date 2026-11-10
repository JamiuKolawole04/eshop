"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { XCircle } from "lucide-react";
import axios from "axios";

import { ButtonLoader, formatCurrency } from "@packages/ui";
import axiosInstance from "@/utils/axiosInstance";
import { useStore } from "@/store";
import { OrderSummary } from "@/shared/components/checkOutForm";

type CartItem = {
  title: string;
  quantity: number;
  sale_price: number;
};

type Coupon = {
  discountAmount: number;
} | null;

type CashOnDeliveryProps = {
  cartItems: CartItem[];
  coupon: Coupon;
  sessionId: string;
};

type CashOnDeliveryOrderResponse = {
  success: boolean;
  orderIds: string[];
  orderId: string | null;
};

export const CashOnDeliveryCheckout = ({
  cartItems,
  coupon,
  sessionId,
}: CashOnDeliveryProps) => {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const totalToPay =
    cartItems.reduce((sum, item) => sum + item.sale_price * item.quantity, 0) -
    (coupon?.discountAmount ?? 0);

  const handlePlaceOrder = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await axiosInstance.post<CashOnDeliveryOrderResponse>(
        "/api/orders/cash-on-delivery",
        { sessionId },
      );

      const orderId = res.data?.orderId ?? res.data?.orderIds?.[0] ?? null;

      useStore.setState({ cart: [] });

      if (!orderId) {
        setErrorMessage(
          "Your order was placed, but we couldn't open it. You can find it under your orders.",
        );
        setIsLoading(false);
        return;
      }

      router.push(`/order/${orderId}`);
    } catch (err: unknown) {
      const message = axios.isAxiosError<{ message?: string }>(err)
        ? err.response?.data?.message
        : undefined;

      setErrorMessage(
        message ?? "Could not place your order. Please try again.",
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] px-4 my-10 font-Poppins">
      <div className="bg-white w-full max-w-lg p-8 rounded-md shadow space-y-6">
        <div className="text-center mb-2">
          <h2 className="text-3xl font-bold">Cash on Delivery Checkout</h2>
          <p className="text-sm text-gray-600 mt-1">
            Pay the rider when your order arrives.
          </p>
        </div>

        <OrderSummary cartItems={cartItems} coupon={coupon} />

        <div className="flex justify-between items-center text-sm font-semibold text-gray-900 border-t border-gray-200 pt-3">
          <span>Amount to pay on delivery</span>
          <span>{formatCurrency(totalToPay)}</span>
        </div>

        <button
          type="button"
          onClick={handlePlaceOrder}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading && <ButtonLoader className="w-5 h-5" />}
          {isLoading ? "Placing order..." : "Place order — pay on delivery"}
        </button>

        {errorMessage && (
          <div className="flex items-center gap-2 text-red-600 text-sm justify-center">
            <XCircle className="w-5 h-5" />
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
};
