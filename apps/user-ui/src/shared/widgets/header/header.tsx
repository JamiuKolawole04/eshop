import Link from "next/link";
import { Search, User, Heart, ShoppingCart } from "lucide-react";

import HeaderBottom from "./headerBottom";

const Header = () => {
  return (
    <header className="w-full bg-white">
      <div className="w-[80%] py-5 m-auto flex items-center justify-between">
        <div>
          <Link href="/">
            <span className="text-2xl font-semibold font-Poppins">Eshop</span>
          </Link>
        </div>

        <div className="w-[50%] relative">
          <input
            type="text"
            placeholder="Search for products..."
            className="w-full px-4 font-Poppins font-medium border-[2.5px] border-[#3489ff] outline-none h-[55px]"
          />

          <div className="w-[60px] cursor-pointer flex items-center justify-center h-[55px] bg-[#3489ff] absolute top-0 right-0">
            <Search color="#fff" />
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="border-2 w-[40px] h-[40px] flex items-center justify-center rounded-full border-[#010f1c1a]"
            >
              <User size={18} className="text-gray-600" />
            </Link>

            <Link href="/login">
              <span className="block font-medium text-sm font-Poppins">
                Hello,
              </span>
              <span className="font-semibold text-sm font-Poppins">
                Sign In
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-5">
            <Link href="/wishlist" className="relative">
              <Heart size={20} className="text-gray-600" />

              <div className="w-6 h-6 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px]">
                <span className="text-white font-medium text-sm">0</span>
              </div>
            </Link>

            <Link href="/cart" className="relative">
              <ShoppingCart size={20} className="text-gray-600" />

              <div className="w-6 h-6 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px]">
                <span className="text-white font-medium text-sm">0</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="border-b border-b-[#99999938]">
        <HeaderBottom />
      </div>
    </header>
  );
};

export default Header;
