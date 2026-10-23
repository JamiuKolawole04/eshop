"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import { DashbaordLogo } from "@/assets/svgs/dashbaord/dashboardLogo";
import { useSeller } from "@/hooks/use-seller";
import { SidebarWrapper } from "./sidebar";

type Props = {
  children: React.ReactNode;
};

export const DashboardShell = ({ children }: Props) => {
  const pathname = usePathname();
  const { seller } = useSeller();

  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const rawShopName = seller?.shop?.name;
  const shopName =
    typeof rawShopName === "string" && rawShopName.trim().length > 0
      ? rawShopName.trim()
      : "Seller Dashboard";

  const closeMenu = useCallback((restoreFocus = false) => {
    setOpen(false);

    if (restoreFocus) {
      menuButtonRef.current?.focus();
    }
  }, []);

  // Close the drawer whenever the seller navigates somewhere else.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close the drawer as soon as the permanent sidebar appears.
  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 1024px)");

    const handleChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setOpen(false);
      }
    };

    desktopQuery.addEventListener("change", handleChange);

    return () => desktopQuery.removeEventListener("change", handleChange);
  }, []);

  // Escape closes the drawer and returns focus to the trigger.
  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, closeMenu]);

  // Keep the page behind the drawer still while it is open.
  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <div className="flex min-h-dvh w-full flex-col bg-black">
      <header className="fixed inset-x-0 top-0 z-30 h-14 border-b border-slate-800 bg-black lg:hidden">
        <div className="flex h-full items-center gap-2 px-3">
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="dashboard-sidebar"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-800 text-slate-300 transition hover:bg-slate-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0085ff]"
          >
            <Menu size={20} />
          </button>

          <div className="flex min-w-0 items-center gap-2">
            <DashbaordLogo className="h-5 w-5 shrink-0" />

            <p className="min-w-0 truncate font-Poppins text-sm font-medium text-[#ecedee]">
              {shopName}
            </p>
          </div>
        </div>
      </header>

      {/* Reserves the space taken by the fixed top bar below lg. */}
      <div className="h-14 shrink-0 lg:hidden" aria-hidden="true" />

      <div className="flex w-full flex-1">
        <aside className="hidden w-[280px] shrink-0 border-r border-r-slate-800 lg:block">
          <div className="sticky top-0 h-dvh">
            <SidebarWrapper />
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="w-full overflow-auto">{children}</div>
        </main>
      </div>

      <div
        onClick={() => closeMenu()}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/60 transition-opacity duration-200 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        id="dashboard-sidebar"
        aria-label="Dashboard navigation"
        aria-hidden={!open}
        inert={!open}
        className={`fixed inset-y-0 left-0 z-50 h-dvh w-[280px] max-w-[85vw] overflow-y-auto border-r border-slate-800 bg-black shadow-2xl shadow-black/50 transition-transform duration-200 ease-out lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          type="button"
          onClick={() => closeMenu(true)}
          aria-label="Close menu"
          className="absolute right-2 top-2 z-[300] flex h-8 w-8 items-center justify-center rounded-full border border-slate-700/80 bg-slate-900/90 text-slate-300 backdrop-blur transition hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0085ff]"
        >
          <X size={16} />
        </button>

        <SidebarWrapper />
      </aside>
    </div>
  );
};

export default DashboardShell;
