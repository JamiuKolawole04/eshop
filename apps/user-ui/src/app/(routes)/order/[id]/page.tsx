"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, PackageX } from "lucide-react";

import {
  OrderDetailsResponseType,
  ButtonLoader,
  DeliveryStatus,
} from "@packages/ui";

import axiosInstance from "@/utils/axiosInstance";

const TIMELINE_STEPS: DeliveryStatus[] = [
  "Ordered",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

const OrderTimeline = ({ status }: { status: DeliveryStatus }) => {
  const currentIndex = TIMELINE_STEPS.findIndex((s) => s === status);
  const fillPercent =
    currentIndex <= 0 ? 0 : (currentIndex / (TIMELINE_STEPS.length - 1)) * 100;

  return (
    <div className="relative">
      {/* Labels */}
      <div className="flex justify-between mb-2">
        {TIMELINE_STEPS.map((step, idx) => {
          const isReached = idx <= currentIndex;
          return (
            <span
              key={step}
              className={`text-xs sm:text-sm font-medium ${
                isReached ? "text-green-600" : "text-gray-400"
              }`}
            >
              {step}
            </span>
          );
        })}
      </div>

      {/* Track + dots */}
      <div className="relative h-3 flex items-center">
        <div className="absolute left-2 right-2 h-[3px] bg-gray-200 rounded-full" />
        <div
          className="absolute left-2 h-[3px] bg-blue-500 rounded-full transition-all duration-500 ease-out"
          style={{
            width: fillPercent === 0 ? 0 : `calc(${fillPercent}% - 16px)`,
          }}
        />
        <div className="relative w-full flex justify-between">
          {TIMELINE_STEPS.map((step, idx) => {
            const isReached = idx <= currentIndex;
            return (
              <span
                key={step}
                className={`w-3 h-3 rounded-full z-10 transition-colors duration-300 ${
                  isReached ? "bg-blue-500" : "bg-gray-300"
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

const fetchOrder = async (id: string) => {
  const res = await axiosInstance.get<OrderDetailsResponseType>(
    `/api/orders/${id}`,
  );
  return res.data.order;
};

const Page = () => {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const orderId = params.id;

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => fetchOrder(orderId),
    enabled: !!orderId,
  });

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-24 flex flex-col items-center justify-center gap-3 font-Poppins">
        <ButtonLoader size={28} className="text-blue-600" />
        <p className="text-gray-400 text-xs">Loading order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-24 flex flex-col items-center justify-center gap-3 text-center font-Poppins">
        <PackageX size={32} className="text-gray-300" />
        <p className="text-gray-700 font-medium">Order not found</p>
        <p className="text-gray-400 text-sm">
          It may have been removed or the link is incorrect.
        </p>
        <button
          onClick={() => router.push("/dashboard/orders")}
          className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Back to dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 font-Poppins">
      {/* Back link */}
      <button
        onClick={() => router.push("/profile?active=My+Orders")}
        className="mb-6 text-gray-500 hover:text-gray-900 flex items-center gap-2 text-sm font-medium transition-colors"
      >
        <ArrowLeft size={16} />
        Back to order
      </button>

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Order #{order.id.slice(-6)}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Placed on {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-gray-200 bg-white shadow-sm px-4 py-4 sm:px-6 sm:py-5">
        <p className="text-sm font-medium text-gray-700 mb-4">
          Delivery status
        </p>
        <OrderTimeline status={order.deliveryStatus} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">
            Payment summary
          </h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Payment status</dt>
              <dd className="text-green-600 font-medium">{order.status}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Total paid</dt>
              <dd className="text-gray-900 font-semibold">
                ${order.total.toFixed(2)}
              </dd>
            </div>

            {order.discountAmount > 0 && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Discount applied</dt>
                <dd className="text-green-600">
                  -${order.discountAmount.toFixed(2)}{" "}
                  {order.couponCode &&
                    (order.couponCode.discountType === "percentage"
                      ? `(${order.couponCode.discountValue}% off)`
                      : `($${order.couponCode.discountValue} off)`)}
                </dd>
              </div>
            )}

            {order.couponCode && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Coupon used</dt>
                <dd className="text-blue-600">
                  {order.couponCode.public_name}
                </dd>
              </div>
            )}

            <div className="flex justify-between pt-2 border-t border-gray-100">
              <dt className="text-gray-500">Date</dt>
              <dd className="text-gray-700">
                {new Date(order.createdAt).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </div>

        {order.shippingAddress && (
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4 sm:p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">
              Shipping address
            </h2>
            <div className="text-sm text-gray-700 space-y-0.5">
              <p className="font-medium text-gray-900">
                {order.shippingAddress.name}
              </p>
              <p className="text-gray-500">
                {order.shippingAddress.street}, {order.shippingAddress.city},{" "}
                {order.shippingAddress.zip}
              </p>
              <p className="text-gray-500">{order.shippingAddress.country}</p>
            </div>
          </div>
        )}
      </div>

      {/* Order Items */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900">Order items</h2>
          <span className="text-xs text-gray-500">
            {order.items.length} item{order.items.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="space-y-3">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="border border-gray-100 bg-gray-50 rounded-lg p-3 sm:p-4 flex items-center gap-3 sm:gap-4 hover:border-gray-200 transition-colors"
            >
              <img
                src={item.product?.images?.[0]?.url || "/placeholder.png"}
                alt={item.product?.title || "Product image"}
                className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-md border border-gray-200 flex-shrink-0 bg-white"
              />

              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {item.product?.title || "Unnamed Product"}
                </p>
                <p className="text-sm text-gray-500">Qty {item.quantity}</p>
                {item.selectedOptions &&
                  Object.keys(item.selectedOptions).length > 0 && (
                    <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-x-3">
                      {Object.entries(item.selectedOptions).map(
                        ([key, value]) =>
                          value && (
                            <span key={key}>
                              <span className="font-medium capitalize">
                                {key}:
                              </span>{" "}
                              {String(value)}
                            </span>
                          ),
                      )}
                    </div>
                  )}
              </div>

              <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                ${item.price.toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        <div className="flex justify-between pt-4 mt-4 border-t border-gray-200">
          <span className="text-sm font-medium text-gray-500">Total</span>
          <span className="text-base font-bold text-gray-900">
            ${order.total.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Page;
