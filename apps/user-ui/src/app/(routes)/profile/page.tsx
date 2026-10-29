"use client";

import { Suspense, useEffect, useState } from "react";
import {
  BadgeCheck,
  Bell,
  CheckCircle,
  Clock,
  Gift,
  Inbox,
  Loader2,
  Lock,
  LogOut,
  LucideIcon,
  MapPin,
  Pencil,
  PhoneCall,
  Receipt,
  Settings,
  ShoppingBag,
  Truck,
  User,
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";

import { useUser } from "@/hooks/use-user";
import { StatCard } from "@/shared/components/cards/statCard";
import axiosInstance from "@/utils/axiosInstance";
import { QuickActionCard } from "@/shared/components/cards/quickActionCard";
import { ShippingAddress } from "@/shared/components/shippingAddress";
import { ChangePassword } from "@/shared/components/changePassword";
import { OrdersTable } from "@/shared/components/tables/ordersTable";
import {
  NotificationsResponseType,
  UserOrdersResponseType,
} from "@packages/ui";
import { useAuthStore } from "@/store/auth";

const fetchUserOrders = async () => {
  const res =
    await axiosInstance.get<UserOrdersResponseType>(`/api/orders/user`);
  return res.data.orders;
};

const fetchNotifications = async () => {
  const response = await axiosInstance.get<NotificationsResponseType>(
    `/api/users/notifications`,
  );

  return response.data;
};

// Mobile navigation tiles, in the same order as the desktop sidebar.
// Items with `href` navigate to another page; the rest switch the active tab.
// Logout is an action, so it is rendered separately below the grid.
const mobileNavItems: { label: string; Icon: LucideIcon; href?: string }[] = [
  { label: "Profile", Icon: User },
  { label: "My Orders", Icon: ShoppingBag },
  { label: "Inbox", Icon: Inbox, href: "/inbox" },
  { label: "Notifications", Icon: Bell },
  { label: "Shipping Address", Icon: MapPin },
  { label: "Change Password", Icon: Lock },
];

const navItemTone = (active?: boolean, danger?: boolean) =>
  active
    ? "bg-blue-100 text-blue-600"
    : danger
      ? "text-red-500 hover:bg-red-50"
      : "text-gray-700 hover:bg-gray-100";

const ProfileContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { isLoading, user } = useUser();
  const { setIsLoggedIn } = useAuthStore();

  const queryTab = searchParams.get("active") || "Profile";
  const [activeTab, setActiveTab] = useState(queryTab);

  const { data: orders = [] } = useQuery({
    queryKey: ["user-orders"],
    queryFn: fetchUserOrders,
  });

  const totalOrders = orders.length;
  const processingOrders = orders.filter(
    (order) =>
      order.deliveryStatus !== "Delivered" &&
      order.deliveryStatus !== "Cancelled",
  ).length;
  const completedOrders = orders.filter(
    (order) => order.deliveryStatus === "Delivered",
  ).length;

  const logOutHandler = async () => {
    queryClient.removeQueries({ queryKey: ["user-profile"] });
    setIsLoggedIn(false);

    router.push("/login");

    axiosInstance.post("/api/auth/users/logout").catch((err) => {
      console.error("Logout request failed:", err);
    });
  };

  useEffect(() => {
    if (activeTab !== queryTab) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("active", activeTab);
      router.replace(`profile?${newParams.toString()}`);
    }
  }, [activeTab]);

  const { data, isLoading: isNotificationsLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
  });

  const markAsNotificationAsRead = async (notificationId: string) => {
    await axiosInstance.patch(`/api/sellers/notifications/${notificationId}`);
  };

  return (
    <div className="bg-gray-50 p-6 pb-14 font-Poppins">
      <div className="md:max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome back,{" "}
            <span className="text-blue-600">
              {isLoading ? (
                <Loader2 className="inline animate-spin w-5 h-5" />
              ) : (
                `${user?.name || "User"}`
              )}
            </span>{" "}
            👋
          </h1>
        </div>

        <div className="grid grid-cols-1 min-[360px]:grid-cols-2 md:grid-cols-3 gap-6">
          <StatCard title="Total Orders" count={totalOrders} Icon={Clock} />
          <StatCard
            title="Processing Orders"
            count={processingOrders}
            Icon={Truck}
          />
          <StatCard
            title="Completed Orders"
            count={completedOrders}
            Icon={CheckCircle}
          />
        </div>

        <div className="mt-10 flex flex-col md:flex-row gap-6">
          <div className="bg-white p-4 rounded-md shadow-sm border border-gray-100 w-full md:w-1/5">
            <div className="md:hidden">
              <nav
                aria-label="Account sections"
                className="grid grid-cols-3 gap-2"
              >
                {mobileNavItems.map(({ label, Icon, href }) => {
                  const active = activeTab === label;

                  return (
                    <button
                      key={label}
                      type="button"
                      aria-current={active ? "page" : undefined}
                      onClick={() =>
                        href ? router.push(href) : setActiveTab(label)
                      }
                      className={`flex min-h-[72px] flex-col items-center justify-center gap-1.5 rounded-lg px-1.5 py-3 text-center text-xs font-medium leading-tight transition ${navItemTone(
                        active,
                      )} ${active ? "ring-1 ring-blue-200" : "bg-gray-50"}`}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="mt-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => logOutHandler()}
                  className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium transition ${navItemTone(
                    false,
                    true,
                  )}`}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>

            <nav className="hidden md:block space-y-2">
              <NavItem
                label="Profile"
                Icon={User}
                active={activeTab === "Profile"}
                onClick={() => setActiveTab("Profile")}
              />

              <NavItem
                label="My Orders"
                Icon={ShoppingBag}
                active={activeTab === "My Orders"}
                onClick={() => setActiveTab("My Orders")}
              />

              <NavItem
                label="Inbox"
                Icon={Inbox}
                active={activeTab === "Inbox"}
                onClick={() => router.push("/inbox")}
              />

              <NavItem
                label="Notifications"
                Icon={Bell}
                active={activeTab === "Notifications"}
                onClick={() => setActiveTab("Notifications")}
              />

              <NavItem
                label="Shipping Address"
                Icon={MapPin}
                active={activeTab === "Shipping Address"}
                onClick={() => setActiveTab("Shipping Address")}
              />

              <NavItem
                label="Change Password"
                Icon={Lock}
                active={activeTab === "Change Password"}
                onClick={() => setActiveTab("Change Password")}
              />

              <NavItem
                label="Logout"
                Icon={LogOut}
                danger
                onClick={() => logOutHandler()}
              />
            </nav>
          </div>

          <div className="bg-white p-6 rounded-md shadow-md border border-gray-100 w-full md:w-[55%]">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {activeTab}
            </h2>

            {activeTab === "Profile" && !isLoading && user ? (
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center gap-3">
                  <Image
                    src={user?.avatar?.url}
                    alt=""
                    width={60}
                    height={60}
                    className="w-14 h-14 rounded-full border border-gray-200"
                  />

                  <button className="flex items-center gap-1 text-blue-500 text-xs font-medium">
                    <Pencil className="w-4 h-4" /> Change Photo
                  </button>
                </div>

                <p>
                  <span className="font-semibold">Name:</span> {user?.name}
                </p>

                <p>
                  <span className="font-semibold">Email:</span> {user?.email}
                </p>

                <p>
                  <span className="font-semibold">Joined:</span>{" "}
                  {new Date(user?.createdAt).toLocaleDateString()}
                </p>

                <p>
                  <span className="font-semibold">Earned Points:</span>{" "}
                  {user?.points || 0}
                </p>
              </div>
            ) : activeTab === "Shipping Address" ? (
              <ShippingAddress />
            ) : activeTab === "My Orders" ? (
              <OrdersTable />
            ) : activeTab === "Change Password" ? (
              <ChangePassword />
            ) : activeTab === "Notifications" ? (
              <div className="space-y-4">
                {isNotificationsLoading && (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="h-20 animate-pulse rounded-xl bg-gray-100"
                      />
                    ))}
                  </div>
                )}

                {!isNotificationsLoading &&
                  data?.notifications?.length === 0 && (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-16 text-center">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                        <Bell size={22} />
                      </div>
                      <p className="font-medium text-gray-800">
                        No notifications yet
                      </p>
                      <p className="text-sm text-gray-500">
                        We'll let you know when something happens.
                      </p>
                    </div>
                  )}

                {!isNotificationsLoading &&
                  (data?.notifications?.length ?? 0) > 0 && (
                    <ul className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white">
                      {data?.notifications?.map((d) => {
                        const isUnread = d.status === "unread";

                        return (
                          <li key={d.id}>
                            <Link
                              href={d.redirectLink}
                              onClick={() => markAsNotificationAsRead(d.id)}
                              className={`flex items-start gap-4 px-5 py-4 transition-colors ${
                                isUnread
                                  ? "bg-blue-50/60 hover:bg-blue-50"
                                  : "bg-white hover:bg-gray-50"
                              }`}
                            >
                              <div
                                className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                                  isUnread
                                    ? "bg-blue-100 text-blue-600"
                                    : "bg-gray-100 text-gray-500"
                                }`}
                              >
                                <Bell size={18} />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-3">
                                  <p
                                    className={`text-sm ${
                                      isUnread
                                        ? "font-semibold text-gray-900"
                                        : "font-medium text-gray-700"
                                    }`}
                                  >
                                    {d.title}
                                  </p>
                                  {isUnread && (
                                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                                  )}
                                </div>

                                <p className="mt-0.5 text-sm text-gray-600 line-clamp-2">
                                  {d.message}
                                </p>

                                <p className="mt-1.5 text-xs text-gray-400">
                                  {new Date(d.createdAt).toLocaleString(
                                    "en-GB",
                                    {
                                      dateStyle: "medium",
                                      timeStyle: "short",
                                    },
                                  )}
                                </p>
                              </div>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
              </div>
            ) : (
              ""
            )}
          </div>

          <div className="w-full md:w-1/4 grid grid-cols-2 gap-4 md:block md:space-y-4 [&>*:last-child]:col-span-2">
            <QuickActionCard
              Icon={Gift}
              title="Referral Program"
              description="Invite friends and earn rewards."
            />

            <QuickActionCard
              Icon={BadgeCheck}
              title="Your Badges"
              description="View your earned achievements."
            />

            <QuickActionCard
              Icon={Settings}
              title="Account Settings"
              description="Manage preferences and security."
            />

            <QuickActionCard
              Icon={Receipt}
              title="Billing History"
              description="Check your recent payments."
            />

            <QuickActionCard
              Icon={PhoneCall}
              title="Support Center"
              description="Need help? Contact support."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const Page = () => (
  <Suspense fallback={null}>
    <ProfileContent />
  </Suspense>
);

export default Page;

type NavItemProps = {
  label: string;
  Icon: LucideIcon;
  active?: boolean;
  danger?: boolean;
  onClick: () => void;
};

const NavItem = ({ label, Icon, active, danger, onClick }: NavItemProps) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition ${navItemTone(
      active,
      danger,
    )}`}
  >
    <Icon className="w-4 h-4" />
    {label}
  </button>
);
