"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";

import { OrderDetailsResponseType } from "@packages/ui";

import axiosInstance from "@/utils/axiosInstance";

const statuses = [
  "Ordered",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

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
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => fetchOrder(orderId),
    enabled: !!orderId,
  });

  const { mutate: updateStatus, isPending: updating } = useMutation({
    mutationFn: async (deliveryStatus: string) => {
      await axiosInstance.put(`/api/orders/${orderId}/status`, {
        deliveryStatus,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
    },
  });

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateStatus(e.target.value);
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <p className="text-white">Loading order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <p className="text-white">Order not found.</p>
      </div>
    );
  }

  const currentIndex = statuses.indexOf(order.deliveryStatus);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Back link */}
      <div className="mb-4">
        <span
          className="text-white flex items-center gap-2 font-semibold cursor-pointer w-fit"
          onClick={() => router.push("/dashboard/orders")}
        >
          <ArrowLeft size={18} />
          Go Back to Dashboard
        </span>
      </div>

      <h1 className="text-xl sm:text-2xl font-bold text-gray-200 mb-4">
        Order #{order.id.slice(-6)}
      </h1>

      {/* Status Selector */}
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium text-gray-300">
          Update Delivery Status:
        </label>
        <select
          value={order.deliveryStatus}
          onChange={handleStatusChange}
          disabled={updating}
          className="border bg-transparent text-gray-200 border-gray-500 rounded-md px-2 py-1 text-sm"
        >
          {statuses.map((status) => {
            const statusIndex = statuses.indexOf(status);
            return (
              <option
                key={status}
                value={status}
                disabled={statusIndex < currentIndex}
                className="bg-gray-900"
              >
                {status}
              </option>
            );
          })}
        </select>
      </div>

      {/* Delivery Progress */}
      <div className="mb-8 overflow-x-auto">
        <div className="min-w-[500px] sm:min-w-0 flex items-start">
          {statuses.map((step, idx) => (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              {/* Dot + label */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  className={`w-3.5 h-3.5 rounded-full border-2 border-gray-900 ${
                    idx <= currentIndex ? "bg-blue-500" : "bg-gray-600"
                  }`}
                />
                <span
                  className={`mt-2 text-[11px] sm:text-xs font-medium whitespace-nowrap ${
                    idx <= currentIndex ? "text-blue-400" : "text-gray-500"
                  }`}
                >
                  {step}
                </span>
              </div>

              {/* Connector to next dot (skip after the last one) */}
              {idx !== statuses.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-1 rounded-full ${
                    idx < currentIndex ? "bg-blue-500" : "bg-gray-700"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Summary Info */}
      <div className="mb-6 space-y-1 text-sm text-gray-200">
        <p>
          <span className="font-semibold">Payment Status:</span>{" "}
          <span className="text-green-500 font-medium">{order.status}</span>
        </p>
        <p>
          <span className="font-semibold">Total Paid:</span>{" "}
          <span className="font-medium">${order.total.toFixed(2)}</span>
        </p>

        {order.discountAmount > 0 && (
          <p>
            <span className="font-semibold">Discount Applied:</span>{" "}
            <span className="text-green-400">
              -${order.discountAmount.toFixed(2)}{" "}
              {order.couponCode &&
                (order.couponCode.discountType === "percentage"
                  ? `(${order.couponCode.discountValue}% off)`
                  : `($${order.couponCode.discountValue} off)`)}
            </span>
          </p>
        )}

        {order.couponCode && (
          <p>
            <span className="font-semibold">Coupon Used:</span>{" "}
            <span className="text-blue-400">
              {order.couponCode.public_name}
            </span>
          </p>
        )}

        <p>
          <span className="font-semibold">Date:</span>{" "}
          {new Date(order.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* Shipping Address */}
      {order.shippingAddress && (
        <div className="mb-8 text-sm text-gray-300">
          <h2 className="text-md font-semibold mb-2 text-gray-200">
            Shipping Address
          </h2>
          <p>{order.shippingAddress.name}</p>
          <p>
            {order.shippingAddress.street}, {order.shippingAddress.city},{" "}
            {order.shippingAddress.zip}
          </p>
          <p>{order.shippingAddress.country}</p>
        </div>
      )}

      {/* Order Items */}
      <div>
        <h2 className="text-lg font-semibold text-gray-200 mb-4">
          Order Items
        </h2>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="border border-gray-700 rounded-md p-3 sm:p-4 flex items-center gap-3 sm:gap-4"
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
                <p className="text-sm text-gray-400">
                  Quantity: {item.quantity}
                </p>
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
                ${item.price.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Page;
