/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { useStore } from "@/store";
import { useUser } from "@/hooks/use-user";
import { useLocationTracking } from "@/hooks/use-location-tracking";
import { useDeviceTracking } from "@/hooks/use-device-tracking";
import {
  ButtonLoader,
  CreatePaymentSessionResponseType,
  GetUserAddressResponseType,
  VerifyCouponCodeResponseType,
} from "@packages/ui";
import axiosInstance from "@/utils/axiosInstance";

const fetchUserAddress = async () => {
  const response = await axiosInstance.get<GetUserAddressResponseType>(
    `/api/users/shipping-address`,
  );

  return response.data?.addresses;
};

const Page = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useUser();
  const { removeFromCart, cart } = useStore();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();

  const [isLoading, setIsLoading] = useState(false);
  const [discountedProductId, setDiscountedProductId] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [coupon, setCoupon] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [error, setError] = useState("");
  const [storedCouponCode, setStoredCouponCode] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "credit_card" | "cash_on_delivery"
  >("cash_on_delivery");

  const createPaymentSession = async () => {
    if (addresses?.length === 0) {
      toast.error("Please set your delivery address to create an order!");
      return;
    }
    setIsLoading(true);

    try {
      const response =
        await axiosInstance.post<CreatePaymentSessionResponseType>(
          "/api/orders/payment-session",
          {
            cart,
            selectedAddressId,
            coupon: {
              code: storedCouponCode,
              discountAmount,
              discountPercentage,
              discountedProductId,
            },
          },
        );

      const sessionId = response.data?.sessionId;
      router.push(`/checkout?sessionId=${sessionId}`);
    } catch (err) {
      console.error(err);
      toast.error(`Something went wrong. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const decreaseQuantity = (id: string) => {
    useStore.setState((state) => ({
      cart: state.cart.map((item) =>
        item.id === id && (item.quantity as number) > 1
          ? { ...item, quantity: (item.quantity as number) - 1 }
          : item,
      ),
    }));
  };

  const increaseQuantity = (id: string) => {
    useStore.setState((state) => ({
      cart: state.cart.map((item) =>
        item.id === id ? { ...item, quantity: (item.quantity ?? 1) + 1 } : item,
      ),
    }));
  };

  const removeItem = (id: string) => {
    removeFromCart(id, user, location, deviceInfo);
  };

  const subTotal = cart.reduce(
    (total, item) => total + (item.quantity as number) * item.sale_price,
    0,
  );

  const applyCouponCode = async () => {
    setError("");

    if (!coupon.trim()) {
      setError("Coupon code is required");
      return;
    }

    try {
      const response = await axiosInstance.put<VerifyCouponCodeResponseType>(
        `/api/orders/verify-coupon`,
        {
          couponCode: coupon.trim(),
          cart,
        },
      );

      if (response?.data?.valid) {
        setStoredCouponCode(coupon.trim());
        setDiscountAmount(parseFloat(response?.data?.discountAmount));
        setDiscountPercentage(response?.data?.discount);
        setDiscountedProductId(response?.data?.discountedProductId);
        setCoupon("");
      } else {
        setDiscountAmount(0);
        setDiscountPercentage(0);
        setDiscountedProductId("");
        setError(
          response?.data?.message || "Coupon not valid for any items in cart",
        );
      }
    } catch (error: any) {
      setDiscountAmount(0);
      setDiscountPercentage(0);
      setDiscountedProductId("");
      setError(error?.response?.data?.message);
    }
  };

  const { data: addresses } = useQuery({
    queryKey: ["user-shipping-addresses"],
    queryFn: fetchUserAddress,
  });

  useEffect(() => {
    // if (addresses && addresses?.length > 0 && !selectedAddressId) {
    //   const defaultAddress = addresses?.find((address) => address.isDefault);
    //   setSelectedAddressId(defaultAddress?.id ?? addresses[0].id);
    // }
  }, [addresses, selectedAddressId]);

  return (
    <div className="w-full bg-white font-Poppins">
      <div className="md:w-[80%] w-[95%] mx-auto min-h-screen">
        <div className="pb-[50px]">
          <h1 className="md:pt-[50px] font-medium text-[44px] leading-[1] mb-4">
            Shopping Cart
          </h1>

          <Link href="/" className="text-[#55585b] hover:underline">
            Home
          </Link>

          <span className="inline-block p-[1.5px] mx-1 bg-[#a8acb0] rounded-full"></span>

          <span className="text-[#55585b]">Cart</span>
        </div>

        {cart?.length === 0 ? (
          <div className="text-center text-gray-600 text-base">
            Your shopping cart is empty! Start adding products.
          </div>
        ) : (
          <div className="lg:flex items-start gap-10">
            <table className="w-full lg:w-[70%] border-collapse">
              <thead className="bg-[#f1f3f4] rounded">
                <tr>
                  <th className="py-3 text-left pl-6 align-middle">Product</th>
                  <th className="py-3 text-center  align-middle">Price</th>
                  <th className="py-3 text-center  align-middle">Quantity</th>
                  <th className="py-3 text-center  align-middle"></th>
                  <th className="py-3 text-center  align-middle"></th>
                </tr>
              </thead>

              <tbody>
                {cart?.map((item) => (
                  <tr key={item.id} className="border-b border-b-[#0000000e]">
                    <td className="flex items-center gap-4 p-4">
                      <Image
                        src={item.images[0].url}
                        alt={item.title}
                        width={80}
                        height={80}
                        className="rounded"
                      />

                      <div className="flex flex-col">
                        <span className="font-medium">{item.title}</span>

                        {item?.selectedOptions && (
                          <div className="text-sm text-gray-500">
                            {item?.selectedOptions?.color && (
                              <span>
                                Color: {}
                                <span
                                  style={{
                                    backgroundColor:
                                      item?.selectedOptions?.color,
                                    width: "12px",
                                    height: "12px",
                                    borderRadius: "100%",
                                    display: "inline-block",
                                  }}
                                />
                              </span>
                            )}

                            {item?.selectedOptions.size && (
                              <span className="ml-2">
                                size: {item?.selectedOptions?.size}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 text-lg text-center">
                      {item?.id === discountedProductId ? (
                        <div className="flex flex-col items-center">
                          <span className="line-through text-gray-500 text-sm">
                            ${item.sale_price.toFixed(2)}
                          </span>

                          <span className="text-green-600 font-semibold">
                            $
                            {(
                              (item.sale_price * (100 - discountPercentage)) /
                              100
                            ).toFixed(2)}
                          </span>
                          <span className="text-xs text-green-700 bg-white">
                            Discount Applied
                          </span>
                        </div>
                      ) : (
                        <span className="">${item.sale_price.toFixed(2)}</span>
                      )}
                    </td>

                    <td>
                      <div className="flex justify-center items-center border border-gray-200 rounded-[20px] w-[70px] p-[2px]">
                        <button
                          className="text-black cursor-pointer text-xl"
                          onClick={() => decreaseQuantity(item.id)}
                        >
                          -
                        </button>

                        <span className="px-2">{item?.quantity}</span>

                        <button
                          className="text-black cursor-pointer text-xl"
                          onClick={() => increaseQuantity(item?.id)}
                        >
                          +
                        </button>
                      </div>
                    </td>

                    <td className="text-center">
                      <button
                        className="text-[#818487] text-xs cursor-pointer hover:text-[#ff1826] transition duration-200"
                        onClick={() => removeItem(item.id)}
                      >
                        X Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="p-6 shadow-md w-full lg:w-[30%] bg-[#f9f9f9] rounded-lg">
              {discountAmount > 0 && (
                <div className="flex justify-between items-center text-[#010f1c] text-base font-medium pb-2">
                  <span className="">Discount ({discountPercentage}%)</span>
                  <span className="text-green-600">
                    - ${discountAmount.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center text-[#010f1c] text-xl font-[550] pb-3">
                <span className="">Subtotal</span>
                <span className="">
                  ${(subTotal - discountAmount).toFixed(2)}
                </span>
              </div>

              <hr className="my-4 text-slate-200" />

              <div className="mb-4">
                <h4 className="mb-1.5 font-[500] text-sm">Have a Coupon?</h4>

                <div className="flex">
                  <input
                    type="text"
                    value={coupon}
                    onChange={({ target: { value } }) => setCoupon(value)}
                    placeholder="Enter coupon code"
                    className="w-full p-2 border border-gray-200 rounded-l-md focus:outline-none focus:border-blue-500"
                  />

                  <button
                    className="bg-blue-500 cursor-pointer text-white px-4 rounded-r-md hover:bg-blue-500 transition-all text-sm"
                    onClick={() => applyCouponCode()}
                  >
                    Apply
                  </button>
                  {error && (
                    <p className="text-sm pt-2 text-red-500">{error}</p>
                  )}
                </div>
                <hr className="my-4 text-slate-200" />

                <div className="mb-4">
                  <h4 className="mb-1.5 font-medium text-sm">
                    Select Shipping Address
                  </h4>

                  {addresses?.length !== 0 && (
                    <select
                      className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:border-blue-500"
                      value={selectedAddressId}
                      onChange={({ target: { value } }) =>
                        setSelectedAddressId(value)
                      }
                    >
                      {addresses?.map((address) => (
                        <option key={address.id} value={address?.id}>
                          {address?.label} - {address?.city}, {address?.country}
                        </option>
                      ))}
                    </select>
                  )}

                  {addresses?.length === 0 && (
                    <p className="text-sm text-slate-800">
                      Please add an address from profile to create an order!
                    </p>
                  )}
                </div>

                <hr className="my-4 text-slate-200" />

                <div className="mb-4">
                  <h4 className="mb-1.5 font-medium text-sm">
                    Select Payment Method
                  </h4>

                  <select
                    className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:border-blue-500"
                    value={selectedPaymentMethod}
                    onChange={(e) =>
                      setSelectedPaymentMethod(
                        e.target.value as "credit_card" | "cash_on_delivery",
                      )
                    }
                  >
                    <option value="credit_card">Online Payment</option>
                    <option value="cash_on_delivery">Cash on Delivery</option>
                  </select>
                </div>

                <hr className="my-4 text-slate-200" />

                <div className="flex items-center justify-between text-[#010f1c] text-xl font-[550] pb-3">
                  <span className="">Total</span>
                  <span className="">
                    ${(subTotal - discountAmount).toFixed(2)}
                  </span>
                </div>

                {isAuthenticated ? (
                  <button
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 cursor-pointer mt-4 py-3 bg-[#010f1c] text-white hover:bg-[#0989ff] transition-all rounded-lg"
                    onClick={createPaymentSession}
                  >
                    {isLoading && <ButtonLoader />}
                    {isLoading ? "Redirecting..." : "Proceed to checkout"}
                  </button>
                ) : (
                  <button
                    className="w-full flex items-center justify-center gap-2 cursor-pointer mt-4 py-3 bg-[#010f1c] text-white hover:bg-[#0989ff] transition-all rounded-lg"
                    onClick={() =>
                      router.push(
                        `/login?redirect=${encodeURIComponent(window.location.pathname)}`,
                      )
                    }
                  >
                    Log in
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default Page;
