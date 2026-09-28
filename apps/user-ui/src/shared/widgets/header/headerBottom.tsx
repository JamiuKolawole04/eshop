"use client";

import { AlignLeft, ChevronDown } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

import { navItems } from "@/configs/constants";
import { HeaderActions } from "./headerActions";

const HeaderBottom = () => {
  const [show, setShow] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsSticky(window.scrollY > 100);

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
            type="button"
            aria-expanded={show}
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
            <div className="absolute left-0 top-full w-[260px] max-w-full h-[400px] bg-[#f5f5f5] shadow-md z-10" />
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
