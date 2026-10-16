"use client";

import { useEffect, useRef, useState } from "react";
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

// The five real tabs of this page, in the same order as the desktop sidebar.
// "Inbox" (navigates to /inbox) and "Logout" (an action) are handled separately.
const profileTabs = [
  { label: "Profile", Icon: User },
  { label: "My Orders", Icon: ShoppingBag },
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

const Page = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { isLoading, user } = useUser();
  const { setIsLoggedIn } = useAuthStore();

  const queryTab = searchParams.get("active") || "Profile";
  const [activeTab, setActiveTab] = useState(queryTab);

  const tabsStripRef = useRef<HTMLElement | null>(null);
  const activeTabRef = useRef<HTMLButtonElement | null>(null);

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

  // Mobile only: keep the selected tab in view inside the scrollable strip.
  useEffect(() => {
    const strip = tabsStripRef.current;
    const active = activeTabRef.current;

    if (!strip || !active) return;

    const stripRect = strip.getBoundingClientRect();

    // The mobile strip is hidden on desktop, where it reports zero width.
    if (!stripRect.width) return;

    const activeRect = active.getBoundingClientRect();

    strip.scrollLeft +=
      activeRect.left - stripRect.left - (stripRect.width - activeRect.width) / 2;
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
            {/* Mobile: compact switcher - a scrollable strip of the five tabs,
                with Inbox and Logout split out below it. */}
            <div className="md:hidden">
              <nav
                ref={tabsStripRef}
                className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {profileTabs.map(({ label, Icon }) => (
                  <button
                    key={label}
                    ref={activeTab === label ? activeTabRef : null}
                    onClick={() => setActiveTab(label)}
                    className={`shrink-0 flex items-center gap-2 whitespace-nowrap px-3 py-2 rounded-md text-sm font-medium transition ${navItemTone(
                      activeTab === label,
                    )}`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </nav>

              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
                <button
                  onClick={() => router.push("/inbox")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition ${navItemTone(
                    activeTab === "Inbox",
                  )}`}
                >
                  <Inbox className="w-4 h-4" />
                  Inbox
                </button>

                <button
                  onClick={() => logOutHandler()}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition ${navItemTone(
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
              <div className="space-y-4 text-sm text-gray-700">
                {!isNotificationsLoading &&
                  data?.notifications?.length === 0 && (
                    <p className="">No Notifications available yet!</p>
                  )}

                {!isNotificationsLoading &&
                  (data?.notifications?.length ?? 0) > 0 && (
                    <div className="md:w-[80%] my-6 rounded-lg divide-y divide-gray-800 bg-black/40 backdrop-blur-lg shadow-sm">
                      {data?.notifications?.map((d) => (
                        <Link
                          key={d.id}
                          href={d.redirectLink}
                          className={`block px-5 py-4 transition ${
                            d.status !== "unread"
                              ? "hover:bg-gray-800/40"
                              : "bg-gray-800/50 hover:bg-gray-800/70"
                          }`}
                          onClick={() => markAsNotificationAsRead(d.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex flex-col">
                              <span className="text-white font-medium">
                                {d.title}
                              </span>
                              <span className="text-gray-300 text-sm">
                                {d.message}
                              </span>
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
