"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Grid2x2, LayoutGrid } from "lucide-react";
import { FiGrid } from "react-icons/fi";

import { useSeller } from "@/hooks/use-seller";
import { useSidebar } from "@/hooks/use-sidebar";
import { Box } from "../box";
import { Sidebar } from "./sidebar.styles";

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
              <h3 className="text-xl font-medium text-[#ecedee]">
                {seller?.shop?.name}
              </h3>
            </Box>
          </Link>
        </Box>
      </Sidebar.Header>
    </Box>
  );
};
