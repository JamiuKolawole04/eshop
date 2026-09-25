"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { BreadCrumbs } from "@/shared/components/breadcrumbs";
import axiosInstance from "@/utils/axiosInstance";
import { AdminNotificationsResponseType } from "@/types/notifications";

const fetchNotifications = async () => {
  const response = await axiosInstance.get<AdminNotificationsResponseType>(
    `/api/admin/notifications`,
  );

  return response.data;
};

const Notifications = () => {
  const { data, isLoading } = useQuery<AdminNotificationsResponseType>({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
  });

  const markAsNotificationAsRead = async (notificationId: string) => {
    await axiosInstance.patch(`/api/admin/notifications/${notificationId}`);
  };

  return (
    <div className="w-full min-h-screen p-8">
      <h2 className="text-2xl text-white font-semibold mb-2">Notifications</h2>
      <BreadCrumbs title="Notifications" />

      {!isLoading && data?.notifications?.length === 0 && (
        <p className="text-center pt-24 text-white text-sm font-Poppins">
          No Notifications available yet!
        </p>
      )}

      {!isLoading && (data?.notifications?.length ?? 0) > 0 && (
        <div className="md:w-[80%] my-6 rounded-lg divide-y divide-gray-800 bg-black/40 backdrop-blur-lg shadow-sm">
          {data?.notifications?.map((d) => (
            <Link
              key={d.id}
              href={d.redirectLink as string}
              className={`block px-5 py-4 transition ${
                d.status !== "unread"
                  ? "hover:bg-gray-800/40"
                  : "bg-gray-800/50 hover:bg-gray-800/70"
              }`}
              onClick={() => markAsNotificationAsRead(d.id)}
            >
              <div className="flex items-start gap-3">
                <div className="flex flex-col">
                  <span className="text-white font-medium">{d.title}</span>
                  <span className="text-gray-300 text-sm">{d.message}</span>
                  <span className="text-gray-500 text-xs mt-1">
                    {new Date(d.createdAt).toLocaleString("en-UK", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
