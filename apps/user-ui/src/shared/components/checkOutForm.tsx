import { useElements, useStripe } from "@stripe/react-stripe-js";
import { useState } from "react";

type Props = {
  clientSecret: string;
  cartItems: [];
  coupon: string;
  sessionId: string;
};

export const CheckoutForm = ({
  cartItems,
  clientSecret,
  coupon,
  sessionId,
}: Props) => {
  const stripe = useStripe();
  const element = useElements();

  const [isLoading, useIsLoading] = useState(false);
  const [status, setStatus] = useState<"success" | "failed" | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  return (
    <div className="flex justify-center items-center min-h-[80vh] px-4 my-10">
      <form className="bg-white w-full max-w-lg p-8 rounded-md shadow space-y-6">
        <h2 className="text-3xl font-bold text-center mb-2">
          Secure Payemnt Checkout
        </h2>

        <div className="bg-gray-100 p-4 rounded-md text-sm text-gray-700 space-y-2">
          {cartItems.map((item, index) => (
            <div key={index + 1} className="flex justify-between text-sm pb-1">
              <span>
                {item.quantity} X {item.title}
              </span>

              <span>${(item.quantity * item.sale_price).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </form>
    </div>
  );
};
