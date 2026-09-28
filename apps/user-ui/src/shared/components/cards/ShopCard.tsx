import { ArrowUpRight, MapPin, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { ShopType } from "@packages/ui";

type Props = {
  shop: ShopType;
};

export const ShopCard = ({ shop }: Props) => {
  return (
    <Link
      href={`/shop/${shop?.id}`}
      className="group flex flex-col w-full rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden transition hover:shadow-md"
    >
      {/* Cover */}
      <div className="relative w-full h-[80px] sm:h-[110px] lg:h-[120px] bg-gray-100">
        {shop?.coverBanner && (
          <Image
            src={shop.coverBanner}
            alt={`${shop?.name ?? "Shop"} cover`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover"
          />
        )}
      </div>

      {/* Avatar */}
      <div className="relative flex justify-center -mt-6 sm:-mt-8">
        <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full border-[3px] sm:border-4 border-white overflow-hidden shadow bg-white">
          {shop?.avatar && (
            <Image
              src={shop.avatar}
              alt={shop?.name ?? "Shop avatar"}
              fill
              sizes="64px"
              className="object-cover"
            />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 px-2.5 sm:px-4 pb-3 sm:pb-4 pt-2 text-center">
        <h3 className="text-sm sm:text-base font-semibold text-gray-800 truncate">
          {shop?.name}
        </h3>

        <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
          {shop?.followers?.length ?? 0} Followers
        </p>

        <div className="flex items-center justify-center text-[11px] sm:text-xs text-gray-500 mt-2 gap-x-2 gap-y-1 flex-wrap">
          {shop?.address && (
            <span className="flex items-center gap-1 min-w-0 max-w-full sm:max-w-[140px]">
              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">{shop.address}</span>
            </span>
          )}

          <span className="flex items-center gap-1 shrink-0">
            <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400 fill-yellow-400" />
            {shop?.ratings ?? "N/A"}
          </span>
        </div>

        {shop?.category && (
          <div className="mt-2 sm:mt-3 flex justify-center">
            <span className="bg-blue-50 capitalize text-blue-600 px-2 py-0.5 rounded-full font-medium text-[11px] sm:text-xs truncate max-w-full">
              {shop.category}
            </span>
          </div>
        )}

        <span className="mt-auto pt-3 sm:pt-4 inline-flex items-center justify-center text-xs sm:text-sm text-blue-600 font-medium group-hover:underline group-hover:text-blue-700 transition">
          Visit Shop
          <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1" />
        </span>
      </div>
    </Link>
  );
};
