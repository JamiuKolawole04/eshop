"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import axiosInstance from "@/utils/axiosInstance";
import {
  GetFilteredShopsResponseType,
  shopCategories,
  ShopType,
} from "@packages/ui";
import { ShopCard } from "@/shared/components/cards/ShopCard";
import { countries } from "@/utils/countries";

const Page = () => {
  const router = useRouter();
  const [isShopLoading, setIsShopLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [page, setPage] = useState<number>(1);
  const [shops, setShops] = useState<ShopType[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const updateURL = () => {
    const params = new URLSearchParams();

    if (selectedCategories.length > 0) {
      params.set("categories", selectedCategories.join(","));
    }

    if (selectedCountries.length > 0) {
      params.set("categories", selectedCountries.join(","));
    }

    params.set("page", page.toString());
    router.replace(`shops?${decodeURIComponent(params.toString())}`);
  };

  const fetchFilteredShops = async () => {
    setIsShopLoading(true);

    try {
      const query = new URLSearchParams();

      if (selectedCategories.length > 0) {
        query.set("categories", selectedCategories.join(","));
      }

      if (selectedCountries.length > 0) {
        query.set("categories", selectedCountries.join(","));
      }

      query.set("page", page.toString());
      query.set("limit", "12");

      const response = await axiosInstance.get<GetFilteredShopsResponseType>(
        `/api/products/shops/filtered?${query.toString()}`,
      );

      setShops(response.data.shops);
      setTotalPages(response.data.pagination.totalPages);
    } catch (err) {
      console.log(new Error("Error fetching filtered products"), err);
    } finally {
      setIsShopLoading(false);
    }
  };

  useEffect(() => {
    updateURL();
    fetchFilteredShops();
  }, [selectedCategories, page]);

  const toggleCategory = (label: string) => {
    setSelectedCategories((prev) =>
      prev.includes(label)
        ? prev.filter((cat) => cat !== label)
        : [...prev, label],
    );
  };

  const toggleCountry = (label: string) => {
    setSelectedCountries((prev) =>
      prev.includes(label)
        ? prev.filter((country) => country !== label)
        : [...prev, label],
    );
  };
  return (
    <div className="w-full bg-[#f5f5f5] pb-10 font-Poppins">
      <div className="w-[92%] sm:w-[90%] lg:w-[85%] xl:w-[80%] m-auto">
        <div className="pt-6 pb-6 md:pt-10 md:pb-[50px]">
          <h1 className="font-medium text-3xl sm:text-4xl md:text-[40px] leading-tight mb-3">
            All Shops
          </h1>

          <Link href="/" className="text-[#55585b] hover:underline">
            Home
          </Link>

          <span className="inline-block p-[1.5px] mx-1 bg-[#a8acb0] rounded-full"></span>
          <span className="text-[#55585b]">All shops</span>
        </div>

        <div className="w-full flex flex-col lg:flex-row lg:items-start gap-5 lg:gap-8">
          <button
            type="button"
            onClick={() => setShowFilters((prev) => !prev)}
            aria-expanded={showFilters}
            className="lg:hidden w-full flex items-center justify-between bg-white shadow-md !rounded px-4 py-3 text-base font-medium"
          >
            <span>Filters</span>
            <span className="text-sm text-gray-500">
              {showFilters ? "Hide" : "Show"}
            </span>
          </button>

          <aside
            className={`${showFilters ? "block" : "hidden"} lg:block w-full lg:w-[270px] lg:shrink-0 lg:self-start !rounded bg-white p-4 shadow-md`}
          >
            <div className="space-y-6">
              <h3 className="text-xl font-medium border-b border-b-slate-300 pb-1">
                Categories
              </h3>
              <ul className="grid grid-cols-2 lg:grid-cols-1 gap-x-4 gap-y-2 !mt-3">
                {shopCategories?.map((category) => (
                  <li
                    key={category.label}
                    className="flex items-center justify-between"
                  >
                    <label className="flex items-center gap-3 w-full min-h-[44px] lg:min-h-0 text-sm text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.value)}
                        onChange={() => toggleCategory(category.value)}
                        className="accent-blue-600 shrink-0"
                      />
                      {category.value}
                    </label>
                  </li>
                ))}
              </ul>

              <h3 className="text-xl font-medium border-b border-b-slate-300 pb-1">
                Countries
              </h3>
              <ul className="grid grid-cols-2 lg:grid-cols-1 gap-x-4 gap-y-2 !mt-3">
                {countries?.map((country) => (
                  <li
                    key={country}
                    className="flex items-center justify-between"
                  >
                    <label className="flex items-center gap-3 w-full min-h-[44px] lg:min-h-0 text-sm text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCountries.includes(country)}
                        onChange={() => toggleCountry(country)}
                        className="accent-blue-600 shrink-0"
                      />
                      {country}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <div className="flex-1 min-w-0 lg:px-3">
            {isShopLoading ? (
              <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-4 sm:gap-5">
                {Array.from({ length: 10 }).map((_, index) => (
                  <div
                    key={index + 1}
                    className="h-[250px] bg-gray-300 animate-pulse rounded-xl"
                  ></div>
                ))}
              </div>
            ) : (
              <div>
                {shops.length > 0 ? (
                  <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-4 sm:gap-5">
                    {shops?.map((shop) => (
                      <ShopCard key={shop.id} shop={shop} />
                    ))}
                  </div>
                ) : (
                  <p>No shop found</p>
                )}

                {totalPages > 1 && (
                  <div className="flex flex-wrap justify-center mt-8 gap-2">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setPage(i + 1)}
                        aria-label={`Go to page ${i + 1}`}
                        aria-current={page === i + 1 ? "page" : undefined}
                        className={`inline-flex items-center justify-center min-w-[44px] min-h-[44px] lg:min-w-0 lg:min-h-0 px-3 py-1 !rounded border border-gray-200 text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${page === i + 1 ? "bg-blue-600 text-white" : "bg-white text-black"}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
