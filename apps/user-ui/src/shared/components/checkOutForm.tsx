import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { Fragment, SubmitEvent, useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { ButtonLoader } from "@packages/ui";

type CartItem = {
  title: string;
  quantity: number;
  sale_price: number;
};

type Coupon = {
  discountAmount: number;
} | null;

type Props = {
  clientSecret?: string;
  cartItems: CartItem[];
  coupon: Coupon;
  sessionId: string;
};

export const CheckoutForm = ({ cartItems, coupon, sessionId }: Props) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"success" | "failed" | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const total = cartItems.reduce(
    (sum, item) => sum + item.sale_price * item.quantity,
    0,
  );

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    if (!stripe || !elements) {
      setIsLoading(false);
      return;
    }

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success?sessionId=${sessionId}`,
      },
    });

    if (result.error) {
      setStatus("failed");
      setErrorMessage(result.error.message || "Something went wrong");
    } else {
      setStatus("success");
    }

    setIsLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] px-4 my-10">
      <form
        className="bg-white w-full max-w-lg p-8 rounded-md shadow space-y-6"
        onSubmit={handleSubmit}
      >
        <h2 className="text-3xl font-bold text-center mb-2">
          Secure Payment Checkout
        </h2>

        {/* Dynamic Order Summary */}
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
            <span>${(total - (coupon?.discountAmount ?? 0)).toFixed(2)}</span>
          </div>
        </div>

        <PaymentElement />

        <button
          type="submit"
          disabled={!stripe || isLoading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading && <ButtonLoader className="w-5 h-5" />}
          {isLoading ? "Processing..." : "Pay Now"}
        </button>

        {errorMessage && (
          <div className="flex items-center gap-2 text-red-600 text-sm justify-center">
            <XCircle className="w-5 h-5" />
            {errorMessage}
          </div>
        )}

        {status === "success" && (
          <div className="flex items-center gap-2 text-green-600 text-sm justify-center">
            <CheckCircle className="w-5 h-5" />
            Payment successful!
          </div>
        )}

        {status === "failed" && (
          <div className="flex items-center gap-2 text-red-600 text-sm justify-center">
            <XCircle className="w-5 h-5" />
            Payment failed. Please try again.
          </div>
        )}
      </form>
    </div>
  );
};
