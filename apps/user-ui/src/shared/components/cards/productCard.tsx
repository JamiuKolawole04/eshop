import Link from "next/link";
import { useEffect, useState } from "react";
import { Eye, Heart, ShoppingBag } from "lucide-react";

import { ProductWithRelationsType, Ratings } from "@packages/ui";
import { ProductDetailsCard } from "./productDetailsCard";
import { useStore } from "@/store";
import { useUser } from "@/hooks/use-user";
import { useLocationTracking } from "@/hooks/use-location-tracking";
import { useDeviceTracking } from "@/hooks/use-device-tracking";

type Props = {
  product: ProductWithRelationsType;
  isEvent?: boolean;
};

export const ProductCard = ({ product, isEvent }: Props) => {
  const { user } = useUser();
  const { addToWishlist, addToCart, removeFromWishlist, wishlist, cart } =
    useStore();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();

  const [timeLeft, setTimeLeft] = useState("");
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const isWishListed = wishlist.some((item) => item.id === product.id);
  const isInCart = cart.some((item) => item.id === product.id);

  useEffect(() => {
    if (isEvent && product?.ending_date) {
      const interval = setInterval(() => {
        const endTime = new Date(product.ending_date as string).getTime();
        const now = Date.now();
        const diff = endTime - now;

        if (diff <= 0) {
          setTimeLeft("Expired");
          clearInterval(interval);
          return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);

        setTimeLeft(`${days}d ${hours}h ${minutes}m left with this price`);
      }, 60000);

      return () => clearInterval(interval);
    }

    return;
  }, [isEvent, product?.ending_date]);

  return (
    <div className="w-full min-h-[300px] sm:min-h-[350px] h-full bg-white rounded-lg relative font-Poppins pb-3 overflow-hidden">
      {isEvent && (
        <div className="absolute top-2 left-2 z-10 bg-red-600 text-white text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-sm shadow-md">
          OFFER
        </div>
      )}

      {product?.stock <= 5 && (
        <div className="absolute top-2 right-2 z-10 bg-yellow-400 text-slate-700 text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-sm shadow-md">
          LIMITED STOCK
        </div>
      )}

      <Link href={`/product/${product?.slug}`}>
        <img
          src={product?.images?.[0].url}
          alt={product?.title}
          width={300}
          height={300}
          className="w-full aspect-[4/3] sm:aspect-square lg:aspect-[4/3] object-cover mx-auto rounded-t-md"
        />
      </Link>

      <Link
        href={`/shop/${product?.shop?.id}`}
        className="block truncate text-blue-500 text-xs sm:text-sm font-medium my-2 px-2"
      >
        {product?.shop?.name}
      </Link>

      <Link href={`/product/${product?.slug}`}>
        <h3 className="text-xs sm:text-sm font-semibold px-2 text-gray-800 line-clamp-2 break-words">
          {product?.title}
        </h3>
      </Link>

      <div className="mt-2 px-2">
        <Ratings rating={product?.ratings} />
      </div>

      <div className="mt-3 flex flex-wrap justify-between items-center gap-x-2 gap-y-1 px-2">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="text-base sm:text-lg font-bold text-gray-900">
            ${product?.sale_price}
          </span>
          <span className="text-xs sm:text-sm line-through text-gray-400">
            ${product?.regular_price}
          </span>
        </div>

        <span className="text-green-500 text-xs sm:text-sm font-medium">
          {product?.totalSales} sold
        </span>
      </div>

      {isEvent && timeLeft && (
        <div className="mt-2 px-2">
          <span className="inline-block text-[11px] sm:text-xs bg-orange-100 text-orange-600 break-words">
            {timeLeft}
          </span>
        </div>
      )}

      <div className="absolute z-10 flex flex-col gap-2 sm:gap-3 right-2 sm:right-3 top-9 sm:top-10">
        <div className="bg-white rounded-full p-1 sm:p-1.5 shadow-md">
          <Heart
            className="cursor-pointer hover:scale-110 transition w-4 h-4 sm:w-5 sm:h-5"
            size={20}
            onClick={() =>
              isWishListed
                ? removeFromWishlist(product.id, user, location, deviceInfo)
                : addToWishlist(
                    { ...product, quantity: 1 },
                    user,
                    location,
                    deviceInfo,
                  )
            }
            fill={isWishListed ? "red" : "transparent"}
            stroke={isWishListed ? "red" : "#4b5563"}
          />
        </div>

        <div className="bg-white rounded-full p-1 sm:p-1.5 shadow-md">
          <Eye
            className="cursor-pointer text-[#4b5563] hover:scale-110 transition w-4 h-4 sm:w-5 sm:h-5"
            size={20}
            onClick={() => setIsOpen(!isOpen)}
          />
        </div>

        <div className="bg-white rounded-full p-1 sm:p-1.5 shadow-md">
          <ShoppingBag
            className="cursor-pointer text-[#4b5563] hover:scale-110 transition w-4 h-4 sm:w-5 sm:h-5"
            size={20}
            onClick={() =>
              !isInCart &&
              addToCart({ ...product, quantity: 1 }, user, location, deviceInfo)
            }
          />
        </div>
      </div>

      {isOpen && <ProductDetailsCard data={product} setIsOpen={setIsOpen} />}
    </div>
  );
};
