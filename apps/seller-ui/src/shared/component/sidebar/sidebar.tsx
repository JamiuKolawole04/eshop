"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import {
  Grid2x2,
  LayoutGrid,
  LayoutDashboard,
  ListOrdered,
  SquarePlus,
  PackageSearch,
  CalendarPlus,
  CreditCard,
  BellPlus,
  Mail,
  Settings,
  BellRing,
  TicketPercent,
  LogOutIcon,
} from "lucide-react";
import { FiGrid } from "react-icons/fi";

import { useSeller } from "@/hooks/use-seller";
import { useSidebar } from "@/hooks/use-sidebar";
import { Box } from "../box";
import { Sidebar } from "./sidebar.styles";
import { SidebarItem } from "./sidebar.item";
import { SidebarMenu } from "./sidebar.menu";

export const SidebarWrapper = () => {
  const pathname = usePathname();

  const { activeSidebar, setActiveSidebar } = useSidebar();
  const { seller } = useSeller();

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
      className="sidebar-wrapper"
    >
      <Sidebar.Header>
        <Box>
          <Link href={"/"} className="flex justify-center text-center gap-2">
            <Grid2x2 size={20} />

            <LayoutGrid size={24} />

            <FiGrid size={24} />

            <Box>
              <h3 className="font-medium text-[#ecedee]">
                {seller?.shop?.name}
              </h3>

              <h5 className="font-medium pl-2 text-xs text-[#ecedeecf] whitespace-nowrap overflow-hidden text-ellipsis max-w-[170px]">
                {seller?.shop?.address}
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
                title="Create Product"
                href="/dashboard/create-product"
                isActive={activeSidebar === "/dashboard/create-product"}
                icon={
                  <SquarePlus
                    size={20}
                    color={getIconColor("/dashboard/create-product")}
                  />
                }
              />

              <SidebarItem
                title="All Products"
                href="/dashboard/all-products"
                isActive={activeSidebar === "/dashboard/all-products"}
                icon={
                  <PackageSearch
                    size={20}
                    color={getIconColor("/dashboard/all-products")}
                  />
                }
              />
            </SidebarMenu>

            <SidebarMenu title="Events">
              <SidebarItem
                title="Create Event"
                href="/dashboard/create-event"
                isActive={activeSidebar === "/dashboard/create-event"}
                icon={
                  <CalendarPlus
                    size={20}
                    color={getIconColor("/dashboard/create-event")}
                  />
                }
              />

              <SidebarItem
                title="All Events"
                href="/dashboard/all-events"
                isActive={activeSidebar === "/dashboard/all-events"}
                icon={
                  <BellPlus
                    size={20}
                    color={getIconColor("/dashboard/all-events")}
                  />
                }
              />
            </SidebarMenu>

            <SidebarMenu title="Controllers">
              <SidebarItem
                title="Inbox"
                href="/dashboard/inbox"
                isActive={activeSidebar === "/dashboard/inbox"}
                icon={
                  <Mail size={20} color={getIconColor("/dashboard/inbox")} />
                }
              />

              <SidebarItem
                title="Settings"
                href="/dashboard/settings"
                isActive={activeSidebar === "/dashboard/settings"}
                icon={
                  <Settings
                    size={20}
                    color={getIconColor("/dashboard/settings")}
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

            <SidebarMenu title="Extras">
              <SidebarItem
                title="Discount Codes"
                href="/dashboard/discount-codes"
                isActive={activeSidebar === "/dashboard/discount-codes"}
                icon={
                  <TicketPercent
                    size={20}
                    color={getIconColor("/dashboard/discount-codes")}
                  />
                }
              />

              <SidebarItem
                title="Logout"
                href="/"
                isActive={activeSidebar === "/logout"}
                icon={<LogOutIcon size={20} color={getIconColor("/logouts")} />}
              />
            </SidebarMenu>
          </div>
        </Sidebar.Body>
      </div>
    </Box>
  );
};
