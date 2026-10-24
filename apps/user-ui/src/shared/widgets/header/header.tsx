"use client";

import Link from "next/link";
import Image from "next/image";

import HeaderBottom from "./headerBottom";
import { HeaderActions } from "./headerActions";
import { SearchBox } from "@/shared/components/search/searchBox";
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

        <SearchBox />

        <HeaderActions />
      </div>

      <div className="border-b border-b-[#99999938]">
        <HeaderBottom />
      </div>
    </header>
  );
};

export default Header;
