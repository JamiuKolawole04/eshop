"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

import { useAdmin } from "@/hooks/use-admin";
import { useSidebar } from "@/hooks/use-sidebar";
import { Box } from "../box";
import { Sidebar } from "./sidebar.styles";
import { DashbaordLogo } from "@/app/assets/svgs/dashbaord/dashboardLogo";

export const SideBarWrapper = () => {
  const pathName = usePathname();

  const { activeSidebar, setActiveSidebar } = useSidebar();
  const { admin } = useAdmin();

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
            <DashbaordLogo />
            <Box>
              <h3 className="text-xl font-medium text-[#ecedee]">
                {admin?.name}
              </h3>
              <h5 className="font-medium pl-2 text-xs text-[#ecedeecf] whitespace-nowrap overflow-hidden text-ellipsis">
                {admin?.email}
              </h5>
            </Box>
          </Link>
        </Box>
      </Sidebar.Header>
    </Box>
  );
};
