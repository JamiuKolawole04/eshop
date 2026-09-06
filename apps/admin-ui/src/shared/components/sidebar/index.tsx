"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  BellPlus,
  BellRing,
  CreditCard,
  FileClock,
  LayoutDashboard,
  ListOrdered,
  LogOutIcon,
  PackageSearch,
  PencilRuler,
  Settings,
  Store,
  Users,
} from "lucide-react";

import { useAdmin } from "@/hooks/use-admin";
import { useSidebar } from "@/hooks/use-sidebar";
import { Box } from "../box";
import { Sidebar } from "./sidebar.styles";
import { DashbaordLogo } from "@/app/assets/svgs/dashbaord/dashboardLogo";
import { SidebarItem } from "./sidebar.item";
import { SidebarMenu } from "./sidebar.menu";
import { useEffect } from "react";

export const SideBarWrapper = () => {
  const pathname = usePathname();

  const { activeSidebar, setActiveSidebar } = useSidebar();
  const { admin } = useAdmin();

  useEffect(() => {
    setActiveSidebar(pathname);
  }, [pathname]);

  const getIconColor = (route: string) =>
    activeSidebar === route ? "#0085ff" : "#969696";

  return (
    <Box
      css={{
        height: "100vh",
        zIndex: 202,
        position: "sticky",
        padding: "8px",
        top: "0",
        overflowY: "scroll",
        scrollbarWidth: "none",
      }}
      className="sidebar-wrapper font-poppins"
    >
      <Sidebar.Header>
        <Box className="font-poppins">
          <Link href={"/"} className="flex justify-center text-center gap-2">
            <DashbaordLogo className="w-6 h-6" />
            <Box>
              <h3 className="text-base font-medium text-[#ecedee]">
                {admin?.name}
              </h3>
              <h5 className="font-medium pl-2 text-xs text-[#ecedeecf] whitespace-nowrap overflow-hidden text-ellipsis">
                {admin?.email}
              </h5>
            </Box>
          </Link>
        </Box>
      </Sidebar.Header>

      <div className="block my-3 h-full">
        <Sidebar.Body className="body sidebar">
          <SidebarItem
            title="Dashboard"
            href="/dashboard"
            isActive={activeSidebar === "/dashboard"}
            icon={
              <LayoutDashboard size={20} color={getIconColor("/dashboard")} />
            }
          />

          <div className="mt-2 block">
            <SidebarMenu title="Main Menu">
              <SidebarItem
                title="Orders"
                href="/dashboard/orders"
                isActive={activeSidebar === "/dashboard/orders"}
                icon={
                  <ListOrdered
                    size={20}
                    color={getIconColor("/dashboard/orders")}
                  />
                }
              />

              <SidebarItem
                title="Payments"
                href="/dashboard/payments"
                isActive={activeSidebar === "/dashboard/payments"}
                icon={
                  <CreditCard
                    size={20}
                    color={getIconColor("/dashboard/payments")}
                  />
                }
              />

              <SidebarItem
                title="Products"
                href="/dashboard/products"
                isActive={activeSidebar === "/dashboard/products"}
                icon={
                  <PackageSearch
                    size={20}
                    color={getIconColor("/dashboard/products")}
                  />
                }
              />

              <SidebarItem
                title="Events"
                href="/dashboard/events"
                isActive={activeSidebar === "/dashboard/events"}
                icon={
                  <BellPlus
                    size={20}
                    color={getIconColor("/dashboard/events")}
                  />
                }
              />

              <SidebarItem
                title="Users"
                href="/dashboard/users"
                isActive={activeSidebar === "/dashboard/users"}
                icon={
                  <Users size={20} color={getIconColor("/dashboard/users")} />
                }
              />

              <SidebarItem
                title="Sellers"
                href="/dashboard/sellers"
                isActive={activeSidebar === "/dashboard/sellers"}
                icon={
                  <Store size={20} color={getIconColor("/dashboard/sellers")} />
                }
              />
            </SidebarMenu>

            <SidebarMenu title="Controllers">
              <SidebarItem
                title="Loggers"
                href="/dashboard/loggers"
                isActive={activeSidebar === "/dashboard/loggers"}
                icon={
                  <FileClock
                    size={20}
                    color={getIconColor("/dashboard/loggers")}
                  />
                }
              />

              <SidebarItem
                title="Management"
                href="/dashboard/management"
                isActive={activeSidebar === "/dashboard/management"}
                icon={
                  <Settings
                    size={20}
                    color={getIconColor("/dashboard/management")}
                  />
                }
              />

              <SidebarItem
                title="Notifications"
                href="/dashboard/notifications"
                isActive={activeSidebar === "/dashboard/notifications"}
                icon={
                  <BellRing
                    size={20}
                    color={getIconColor("/dashboard/notifications")}
                  />
                }
              />
            </SidebarMenu>

            <SidebarMenu title="Customization">
              <SidebarItem
                title="All customization"
                href="/dashboard/customization"
                isActive={activeSidebar === "/dashboard/customization"}
                icon={
                  <PencilRuler
                    size={20}
                    color={getIconColor("/dashboard/customization")}
                  />
                }
              />
            </SidebarMenu>

            <SidebarMenu title="Extras">
              <SidebarItem
                title="Logout"
                href="/"
                isActive={activeSidebar === "/logout"}
                icon={<LogOutIcon size={20} color={getIconColor("/logout")} />}
              />
            </SidebarMenu>
          </div>
        </Sidebar.Body>
      </div>
    </Box>
  );
};
