"use client";

import Link from "next/link";
import { User, Heart, ShoppingCart } from "lucide-react";

import { useUser } from "@/hooks/use-user";
import { useStore } from "@/store";

type Props = {
  showGreeting?: boolean;
  className?: string;
};

const Badge = ({ count }: { count?: number }) => (
  <div className="w-5 h-5 md:w-6 md:h-6 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute -top-2.5 -right-2.5">
    <span className="text-white font-medium text-[10px] md:text-sm leading-none">
      {count ?? 0}
    </span>
  </div>
);

export const HeaderActions = ({
  showGreeting = true,
  className = "",
}: Props) => {
  const { user, isLoading } = useUser();
  const { cart, wishlist } = useStore();

  const isLoggedIn = !isLoading && !!user;
  const accountHref = isLoggedIn ? "/profile" : "/login";
  const firstName = user?.name?.split(" ")[0];

  return (
    <div
      className={`flex items-center gap-4 md:gap-6 lg:gap-8 shrink-0 ${className}`}
    >
      <Link href={accountHref} className="flex items-center gap-2">
        <span className="border-2 w-9 h-9 md:w-[40px] md:h-[40px] flex items-center justify-center rounded-full border-[#010f1c1a]">
          <User size={18} className="text-gray-600" />
        </span>

        {showGreeting && (
          <span className="hidden lg:block">
            <span className="block font-medium text-sm font-Poppins">
              Hello,
            </span>
            <span className="font-semibold text-sm font-Poppins">
              {isLoggedIn ? firstName : "Sign In"}
            </span>
          </span>
        )}
      </Link>

      <div className="flex items-center gap-4 md:gap-5">
        <Link href="/wishlist" aria-label="Wishlist" className="relative">
          <Heart size={20} className="text-gray-600" />
          <Badge count={wishlist?.length} />
        </Link>

        <Link href="/cart" aria-label="Cart" className="relative">
          <ShoppingCart size={20} className="text-gray-600" />
          <Badge count={cart?.length} />
        </Link>
      </div>
    </div>
  );
};
