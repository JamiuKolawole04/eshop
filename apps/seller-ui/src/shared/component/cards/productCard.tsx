"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ProductWithRelationsType, Ratings } from "@packages/ui";

type Props = {
  product: ProductWithRelationsType;
  isEvent?: boolean;
  href?: string;
};

const formatTimeLeft = (endingDate: string) => {
  const diff = new Date(endingDate).getTime() - Date.now();

  if (diff <= 0) return "Expired";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);

  return `${days}d ${hours}h ${minutes}m left with this price`;
};

export const ProductCard = ({ product, isEvent, href }: Props) => {
  const [timeLeft, setTimeLeft] = useState("");

  const link = href ?? `/product/${product?.slug}`;

  useEffect(() => {
    if (!isEvent || !product?.ending_date) return;

    const update = () =>
      setTimeLeft(formatTimeLeft(product.ending_date as string));

    update();
    const interval = setInterval(update, 60000);

    return () => clearInterval(interval);
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

      <Link href={link}>
        <img
          src={product?.images?.[0]?.url}
          alt={product?.title}
          width={300}
          height={300}
          className="w-full aspect-[4/3] sm:aspect-square lg:aspect-[4/3] object-cover mx-auto rounded-t-md"
        />
      </Link>

      <Link href={link}>
        <h3 className="mt-3 text-xs sm:text-sm font-semibold px-2 text-gray-800 line-clamp-2 break-words">
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
      <div className="mt-auto px-2 pt-3">
        <Link
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full rounded-lg bg-slate-900 px-4 py-2.5 text-center text-sm font-semibold text-white
                        transition-all duration-200 hover:bg-blue-600 hover:shadow-md
                        active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          View Product
        </Link>
      </div>
    </div>
  );
};
