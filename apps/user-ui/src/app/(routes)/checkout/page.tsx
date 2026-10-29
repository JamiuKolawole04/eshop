"use client";

import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { XCircle } from "lucide-react";

import axiosInstance from "@/utils/axiosInstance";
import { PaystackCheckout } from "@/shared/components/checkOutForm";

const CheckoutLoading = () => (
  <div className="flex justify-center items-center min-h-[70vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
  </div>
);

const Page = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [cartItems, setCartItems] = useState([]);
  const [coupon, setCoupon] = useState<{
    discountAmount: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sessionId = searchParams.get("sessionId") as string;

  useEffect(() => {
    const fetchSession = async () => {
      if (!sessionId) {
        setError("Invalid session. Please try again.");
        setLoading(false);
        return;
      }

      try {
        const verifyRes = await axiosInstance.get(
          `/api/orders/verify-payment-session?sessionId=${sessionId}`,
        );

        const { totalAmount, sellers, cart, coupon: sessionCoupon } =
          verifyRes.data.session;

        if (
          !sellers ||
          sellers.length === 0 ||
          totalAmount === undefined ||
          totalAmount === null
        ) {
          throw new Error("Invalid payment session data.");
        }

        setCartItems(cart);
        setCoupon(sessionCoupon);
      } catch (err) {
        console.error(err);
        setError("Something went wrong while preparing your payment.");
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  if (loading) {
    return <CheckoutLoading />;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] px-4">
        <div className="w-full text-center">
          <div className="flex justify-center mb-4">
            <XCircle className="text-red-500 w-10 h-10" />
          </div>
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Payment Failed
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            {error} <br className="hidden sm:block" /> Please go back and try
            checking out again.
          </p>
          <button
            onClick={() => router.push("/cart")}
            className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700"
          >
            Back to Cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <PaystackCheckout
      cartItems={cartItems}
      coupon={coupon}
      sessionId={sessionId}
    />
  );
};

const CheckoutPage = () => (
  <>
    <Page />
  </>
);

export default CheckoutPage;
