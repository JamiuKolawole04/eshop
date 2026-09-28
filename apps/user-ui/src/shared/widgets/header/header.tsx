"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import Image from "next/image";

import HeaderBottom from "./headerBottom";
import { HeaderActions } from "./headerActions";
import useLayout from "@/hooks/use-layout";

const Header = () => {
  const { layout } = useLayout();

  return (
    <header className="w-full bg-white">
      <div className="w-[92%] md:w-[80%] m-auto py-3 md:py-5 flex flex-wrap md:flex-nowrap items-center justify-between gap-x-4 gap-y-3">
        <Link href="/" className="shrink-0">
          <Image
            src={
              layout?.logo ||
              "https://ik.imagekit.io/jnven3dnh3/eshop-products/E-shop-logo.png"
            }
            alt="logo"
            width={180}
            height={180}
            priority
            className="object-cover h-auto w-[110px] sm:w-[140px] md:w-[150px] lg:w-[180px]"
          />
        </Link>

        <div className="order-last md:order-none w-full md:w-auto md:flex-1 md:max-w-[600px] relative">
          <input
            type="text"
            placeholder="Search for products..."
            className="w-full px-3 md:px-4 pr-14 font-Poppins font-medium text-base border-2 md:border-[2.5px] border-[#3489ff] outline-none h-[44px] md:h-[55px]"
          />
          <button
            type="button"
            aria-label="Search"
            className="w-[48px] md:w-[60px] h-[44px] md:h-[55px] cursor-pointer flex items-center justify-center bg-[#3489ff] absolute top-0 right-0"
          >
            <Search color="#fff" className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        <HeaderActions />
      </div>

      <div className="border-b border-b-[#99999938]">
        <HeaderBottom />
      </div>
    </header>
  );
};

export default Header;
