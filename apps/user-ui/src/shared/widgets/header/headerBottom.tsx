"use client";

import { useQuery } from "@tanstack/react-query";
import { AlignLeft, ArrowRight, ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";

import { navItems } from "@/configs/constants";
import axiosInstance from "@/utils/axiosInstance";
import { ProductCategoriesTypes } from "@packages/ui";
import { HeaderActions } from "./headerActions";

async function fetchProductCategories() {
  const response = await axiosInstance.get<ProductCategoriesTypes>(
    `api/products/categories`,
  );

  return response.data;
}

const DepartmentSkeletons = () => (
  <div aria-hidden="true" className="divide-y divide-slate-100">
    {Array.from({ length: 4 }).map((_, index) => (
      <div key={index + 1} className="px-4 py-3">
        <div className="h-3 w-24 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
        <div className="mt-2 h-2.5 w-[85%] animate-pulse rounded bg-slate-100 motion-reduce:animate-none" />
      </div>
    ))}
  </div>
);

const HeaderBottom = () => {
  const [show, setShow] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsSticky(window.scrollY > 100);

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchProductCategories,
    staleTime: 1000 * 60 * 30,
  });

  useEffect(() => {
    if (!show) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;

      if (
        panelRef.current?.contains(target) ||
        buttonRef.current?.contains(target)
      ) {
        return;
      }

      setShow(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShow(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("click", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [show]);

  const categories = data?.categories ?? [];
  const hasCategories = !isError && categories.length > 0;

  return (
    <div className="h-[50px] w-full">
      <div
        className={`w-full transition-shadow duration-300 bg-white ${
          isSticky ? "fixed top-0 left-0 z-[100] shadow-lg" : "relative"
        }`}
      >
        <div className="w-[92%] md:w-[80%] relative m-auto h-[50px] flex items-center justify-between gap-3 md:gap-4">
          {/* All Departments */}
          <button
            ref={buttonRef}
            type="button"
            aria-expanded={show}
            aria-controls="departments-panel"
            onClick={() => setShow((prev) => !prev)}
            className="shrink-0 h-[50px] w-auto md:w-[260px] flex items-center justify-between gap-2 px-3 md:px-5 bg-[#3489ff] cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <AlignLeft color="white" className="w-5 h-5 md:w-6 md:h-6" />
              <span className="text-white font-medium text-sm md:text-base whitespace-nowrap">
                <span className="hidden sm:inline">All </span>Departments
              </span>
            </span>
            <ChevronDown
              color="white"
              className={`w-4 h-4 md:w-5 md:h-5 transition-transform ${
                show ? "rotate-180" : ""
              }`}
            />
          </button>

          {show && (
            <div
              ref={panelRef}
              id="departments-panel"
              role="group"
              aria-label="Departments"
              className="absolute left-0 top-full z-10 flex max-h-[400px] w-[260px] max-w-full flex-col overflow-hidden rounded-b-lg border border-t-0 border-slate-200 bg-white font-Poppins shadow-[0_22px_45px_-18px_rgba(15,23,42,0.35)]"
            >
              <div
                aria-busy={isLoading}
                className="min-h-0 flex-1 overflow-y-auto overscroll-contain divide-y divide-slate-100"
              >
                {isLoading ? (
                  <DepartmentSkeletons />
                ) : !hasCategories ? (
                  <p className="px-4 py-5 text-[13px] leading-relaxed text-slate-500">
                    Departments unavailable
                  </p>
                ) : (
                  categories.map((category) => {
                    const subCategories = data?.subCategories?.[category] ?? [];

                    return (
                      <Link
                        key={category}
                        href={`/products?categories=${encodeURIComponent(category)}`}
                        onClick={() => setShow(false)}
                        className="group flex items-start gap-2 border-l-2 border-l-transparent px-4 py-3 transition-colors duration-150 hover:border-l-[#3489ff] hover:bg-[#3489ff]/[0.06] focus-visible:border-l-[#3489ff] focus-visible:bg-[#3489ff]/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3489ff] motion-reduce:transition-none"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block text-[13px] font-medium leading-snug text-slate-800 transition-colors duration-150 group-hover:text-[#1f6fe0] group-focus-visible:text-[#1f6fe0] motion-reduce:transition-none">
                            {category}
                          </span>
                          {subCategories.length > 0 && (
                            <span className="mt-1 line-clamp-2 text-[11px] leading-snug text-slate-500">
                              {subCategories.join(" · ")}
                            </span>
                          )}
                        </span>
                        <ChevronRight
                          aria-hidden="true"
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#3489ff] opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
                        />
                      </Link>
                    );
                  })
                )}
              </div>

              <Link
                href="/products"
                onClick={() => setShow(false)}
                className="group flex shrink-0 items-center justify-between gap-2 border-t border-slate-200 bg-slate-50/80 px-4 py-2.5 text-[12px] font-medium text-[#3489ff] transition-colors duration-150 hover:bg-[#3489ff]/[0.08] hover:text-[#1f6fe0] focus-visible:bg-[#3489ff]/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3489ff] motion-reduce:transition-none"
              >
                View all products
                <ArrowRight
                  aria-hidden="true"
                  className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transition-none"
                />
              </Link>
            </div>
          )}

          <nav
            className={`flex-1 min-w-0 items-center overflow-x-auto md:justify-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
              isSticky ? "hidden md:flex" : "flex"
            }`}
          >
            {navItems.map((item, index) => (
              <Link
                key={index + 1}
                href={item.href}
                className="px-3 md:px-5 font-medium font-Poppins text-sm whitespace-nowrap"
              >
                {item.title}
              </Link>
            ))}
          </nav>

          {isSticky && <HeaderActions className="ml-auto" />}
        </div>
      </div>
    </div>
  );
};

export default HeaderBottom;
