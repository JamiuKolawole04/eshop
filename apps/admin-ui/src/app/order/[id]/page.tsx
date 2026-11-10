"use client";

import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Banknote, PackageX } from "lucide-react";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

import {
  OrderDetailsResponseType,
  OrderDetailsType,
  DeliveryProgress,
  ButtonLoader,
  formatCurrency,
  formatPhoneForDisplay,
} from "@packages/ui";

import axiosInstance from "@/utils/axiosInstance";

type AdminOrderDetails = OrderDetailsType & {
  paymentMethod?: "online" | "cash_on_delivery" | null;
  paidAt?: string | null;
};

type CollectCashResponseType = {
  success: boolean;
  order: AdminOrderDetails;
};

const fetchOrder = async (id: string) => {
  const res = await axiosInstance.get<OrderDetailsResponseType>(
    `/api/orders/${id}`,
  );
  return res.data.order as AdminOrderDetails;
};

const collectCash = async (id: string) => {
  const res = await axiosInstance.patch<CollectCashResponseType>(
    `/api/orders/admin/${id}/collect-cash`,
  );
  return res.data;
};

const Page = () => {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const orderId = params.id;
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => fetchOrder(orderId),
    enabled: !!orderId,
  });

  const { mutate: markCashCollected, isPending: isCollecting } = useMutation<
    CollectCashResponseType,
    AxiosError<{ message: string }>
  >({
    mutationFn: () => collectCash(orderId),
    onSuccess: () => {
      toast.success("Cash payment recorded");
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message || "Failed to mark cash as collected",
      );
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-24 flex flex-col items-center justify-center gap-3 font-poppins">
        <ButtonLoader size={28} className="text-blue-500" />
        <p className="text-gray-400 text-xs">Loading order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-24 flex flex-col items-center justify-center gap-3 text-center font-poppins">
        <PackageX size={32} className="text-gray-600" />
        <p className="text-gray-300 font-medium">Order not found</p>
        <p className="text-gray-500 text-sm">
          It may have been removed or the link is incorrect.
        </p>
        <button
          onClick={() => router.push("/dashboard/orders")}
          className="mt-2 text-sm text-blue-400 hover:text-blue-300 font-medium"
        >
          Back to dashboard
        </button>
      </div>
    );
  }

  const isPaid = order.status === "Paid";
  const isCashOnDelivery = order.paymentMethod === "cash_on_delivery";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 font-poppins">
      {/* Back link */}
      <button
        onClick={() => router.push("/dashboard/orders")}
        className="mb-6 text-gray-400 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors"
      >
        <ArrowLeft size={16} />
        Back to dashboard
      </button>

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-100">
            Order #{order.id.slice(-6)}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Placed on {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Status Selector */}
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-gray-800 bg-gray-900/40 px-4 py-3">
        <label className="text-sm font-medium text-gray-300 shrink-0">
          Delivery status
        </label>
      </div>

      {/* Delivery Progress */}
      <DeliveryProgress status={order.deliveryStatus} />

      {/* Summary + Shipping */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6 mt-6">
        <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-gray-200 mb-3">
            Payment summary
          </h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Payment method</dt>
              <dd className="text-gray-200 font-medium">
                {isCashOnDelivery ? "Cash on Delivery" : "Online payment"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Payment status</dt>
              <dd
                className={
                  isPaid
                    ? "text-green-400 font-medium"
                    : "text-yellow-400 font-medium"
                }
              >
                {isPaid ? "Paid" : order.status || "Pending"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">
                {isPaid ? "Total paid" : "Amount due"}
              </dt>
              <dd className="text-gray-200 font-semibold">
                {formatCurrency(order.total)}
              </dd>
            </div>

            {order.discountAmount > 0 && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Discount applied</dt>
                <dd className="text-green-400">
                  -{formatCurrency(order.discountAmount)}{" "}
                  {order.couponCode &&
                    (order.couponCode.discountType === "percentage"
                      ? `(${order.couponCode.discountValue}% off)`
                      : `(${formatCurrency(order.couponCode.discountValue, {
                          decimals: false,
                        })} off)`)}
                </dd>
              </div>
            )}

            {order.couponCode && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Coupon used</dt>
                <dd className="text-blue-400">
                  {order.couponCode.public_name}
                </dd>
              </div>
            )}

            <div className="flex justify-between pt-2 border-t border-gray-800">
              <dt className="text-gray-500">Date</dt>
              <dd className="text-gray-300">
                {new Date(order.createdAt).toLocaleDateString()}
              </dd>
            </div>
          </dl>

          {isCashOnDelivery && !isPaid && (
            <button
              onClick={() => markCashCollected()}
              disabled={isCollecting}
              className="mt-4 w-full flex items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isCollecting ? (
                <ButtonLoader size={16} className="text-white" />
              ) : (
                <Banknote size={16} />
              )}
              {isCollecting ? "Marking..." : "Mark cash collected"}
            </button>
          )}
        </div>

        {order.shippingAddress && (
          <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4 sm:p-5">
            <h2 className="text-sm font-semibold text-gray-200 mb-3">
              Shipping address
            </h2>
            <div className="text-sm text-gray-300 space-y-0.5">
              <p className="font-medium text-gray-200">
                {order.shippingAddress.name}
              </p>
              {(order.contactPhone || order.shippingAddress.phone) && (
                <a
                  href={`tel:${order.contactPhone || order.shippingAddress.phone}`}
                  className="inline-block text-gray-300"
                >
                  📞{" "}
                  {formatPhoneForDisplay(
                    order.contactPhone || order.shippingAddress.phone,
                  )}
                </a>
              )}
              <p className="text-gray-400">
                {order.shippingAddress.street}, {order.shippingAddress.city},{" "}
                {order.shippingAddress.zip}
              </p>
              <p className="text-gray-400">{order.shippingAddress.country}</p>
            </div>
          </div>
        )}
      </div>

      {/* Order Items */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-200">Order items</h2>
          <span className="text-xs text-gray-500">
            {order.items.length} item{order.items.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="space-y-3">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="border border-gray-800 bg-gray-900/60 rounded-lg p-3 sm:p-4 flex items-center gap-3 sm:gap-4 hover:border-gray-700 transition-colors"
            >
              <img
                src={item.product?.images?.[0]?.url || "/placeholder.png"}
                alt={item.product?.title || "Product image"}
                className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-md border border-gray-700 flex-shrink-0"
              />

              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-200 truncate">
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

              <p className="text-sm font-semibold text-gray-200 whitespace-nowrap">
                {formatCurrency(item.price)}
              </p>
            </div>
          ))}
        </div>

        <div className="flex justify-between pt-4 mt-4 border-t border-gray-800">
          <span className="text-sm font-medium text-gray-400">Total</span>
          <span className="text-base font-bold text-gray-100">
            {formatCurrency(order.total)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Page;
