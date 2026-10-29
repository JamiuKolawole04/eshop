import { Fragment, useState } from "react";
import { XCircle } from "lucide-react";
import axios from "axios";

import { ButtonLoader } from "@packages/ui";
import axiosInstance from "@/utils/axiosInstance";

type CartItem = {
  title: string;
  quantity: number;
  sale_price: number;
};

type Coupon = {
  discountAmount: number;
} | null;

type PaystackProps = {
  cartItems: CartItem[];
  coupon: Coupon;
  sessionId: string;
};

const OrderSummary = ({
  cartItems,
  coupon,
}: {
  cartItems: CartItem[];
  coupon: Coupon;
}) => (
  <div className="bg-gray-100 p-4 rounded-md text-sm text-gray-700 space-y-2 max-h-48 overflow-y-auto">
    {cartItems.map((item, index) => (
      <div key={index + 1} className="flex justify-between text-sm pb-1">
        <span>
          {item.quantity} x {item.title}
        </span>
        <span>${(item.quantity * item.sale_price).toFixed(2)}</span>
      </div>
    ))}

    <div className="flex justify-between font-semibold pt-2 border-t border-t-gray-200">
      {!!coupon?.discountAmount && (
        <Fragment>
          <span>Discount</span>
          <span className="text-green-600">
            ${coupon?.discountAmount?.toFixed(2)}
          </span>
        </Fragment>
      )}
    </div>

    <div className="flex justify-between font-semibold mt-2">
      <span>Total</span>
      <span>
        $
        {(
          cartItems.reduce(
            (sum, item) => sum + item.sale_price * item.quantity,
            0,
          ) - (coupon?.discountAmount ?? 0)
        ).toFixed(2)}
      </span>
    </div>
  </div>
);

export const PaystackCheckout = ({
  cartItems,
  coupon,
  sessionId,
}: PaystackProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePay = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await axiosInstance.post("/api/orders/paystack-payment", {
        sessionId,
        callbackUrl: `${window.location.origin}/payment-success`,
      });

      window.location.assign(res.data.authorizationUrl);
    } catch (err: unknown) {
      const message = axios.isAxiosError<{ message?: string }>(err)
        ? err.response?.data?.message
        : undefined;

      setErrorMessage(message ?? "Could not start payment. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] px-4 my-10">
      <div className="bg-white w-full max-w-lg p-8 rounded-md shadow space-y-6">
        <h2 className="text-3xl font-bold text-center mb-2">
          Secure Payment Checkout
        </h2>

        <OrderSummary cartItems={cartItems} coupon={coupon} />

        <button
          type="button"
          onClick={handlePay}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading && <ButtonLoader className="w-5 h-5" />}
          {isLoading ? "Redirecting..." : "Pay with Paystack"}
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
