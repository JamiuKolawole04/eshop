"use client";

import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { XCircle } from "lucide-react";
import { Appearance, loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

import axiosInstance from "@/utils/axiosInstance";
import { CheckoutForm, PaystackCheckout } from "@/shared/components/checkOutForm";

const stripePromise = loadStripe(
  String(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY),
);

const CheckoutLoading = () => (
  <div className="flex justify-center items-center min-h-[70vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
  </div>
);

type Provider = "paystack" | "stripe";

const Page = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [clientSecret, setClientSecret] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [coupon, setCoupon] = useState<{
    discountAmount: number;
  } | null>(null);
  const [stripeInfo, setStripeInfo] = useState<{
    totalAmount: number;
    sellerStripeAccountId?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // TEMP: lets us exercise both payment flows side by side. Hide this picker
  // once a provider is decided (add "hidden" to its className).
  const [provider, setProvider] = useState<Provider>("paystack");

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

        const { totalAmount, sellers, cart, coupon } = verifyRes.data.session;

        if (
          !sellers ||
          sellers.length === 0 ||
          totalAmount === undefined ||
          totalAmount === null
        ) {
          throw new Error("Invalid payment session data.");
        }

        setCartItems(cart);
        setCoupon(coupon);
        setStripeInfo({
          totalAmount,
          sellerStripeAccountId: sellers[0].stripeAccountId,
        });
      } catch (err) {
        console.error(err);
        setError("Something went wrong while preparing your payment.");
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  // Stripe intents are created lazily — only when the Stripe branch is picked.
  // The Paystack branch never touches Stripe.
  useEffect(() => {
    if (provider !== "stripe" || clientSecret || !stripeInfo) return;

    const createIntent = async () => {
      try {
        const intentRes = await axiosInstance.post(
          "/api/orders/payment-intent",
          {
            amount: coupon?.discountAmount
              ? stripeInfo.totalAmount - coupon?.discountAmount
              : stripeInfo.totalAmount,
            sellerStripeAccountId: stripeInfo.sellerStripeAccountId,
            sessionId,
          },
        );

        setClientSecret(intentRes.data.clientSecret);
      } catch (err) {
        console.error(err);
        setError("Something went wrong while preparing your payment.");
      }
    };

    createIntent();
  }, [provider, clientSecret, stripeInfo, coupon, sessionId]);

  const appearance: Appearance = { theme: "stripe" };

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
    <div>
      {/* TEMP provider picker — hide with className="hidden" once decided */}
      <div className="flex justify-center gap-2 my-4">
        <button
          type="button"
          onClick={() => setProvider("paystack")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
            provider === "paystack"
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
          }`}
        >
          Paystack
        </button>
        <button
          type="button"
          onClick={() => setProvider("stripe")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
            provider === "stripe"
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
          }`}
        >
          Stripe
        </button>
      </div>

      {provider === "paystack" ? (
        <PaystackCheckout
          cartItems={cartItems}
          coupon={coupon}
          sessionId={sessionId}
        />
      ) : clientSecret ? (
        <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
          <CheckoutForm
            clientSecret={clientSecret}
            cartItems={cartItems}
            coupon={coupon}
            sessionId={sessionId}
          />
        </Elements>
      ) : (
        <CheckoutLoading />
      )}
    </div>
  );
};

const CheckoutPage = () => (
  <Suspense fallback={<CheckoutLoading />}>
    <Page />
  </Suspense>
);

export default CheckoutPage;
