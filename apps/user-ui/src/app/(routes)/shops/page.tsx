"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import axiosInstance from "@/utils/axiosInstance";
import { shopCategories } from "@packages/ui";

import {
  GetEventOffersResponseType,
  ProductCategoriesTypes,
  ProductWithRelationsType,
} from "@packages/ui";
import { ProductCard } from "@/shared/components/cards/productCard";

const Page = () => {
  const router = useRouter();
  const [isShopLoading, setIsShopLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [page, setPage] = useState<number>(1);
  const [shops, setShops] = useState<ProductWithRelationsType[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [tempPriceRange, setTempPriceRange] = useState([0, 1199]);

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

      const response = await axiosInstance.get<GetEventOffersResponseType>(
        `/api/products/events/offers?${query.toString()}`,
      );

      setShops(response.data.products);
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
      <div className="w-[90%] lg:w-[80%] m-auto">
        <div className="pb-[50px]">
          <h1 className="md:pt-10 font-medium text-[40px] leading-1 mb-3.5">
            All Shops
          </h1>

          <Link href="/" className="text-[#55585b] hover:underline">
            Home
          </Link>

          <span className="inline-block p-[1.5px] mx-1 bg-[#a8acb0] rounded-full"></span>
          <span className="text-[#55585b]">All shops</span>
        </div>

        <div className="w-full flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-[270px] !rounded bg-white p-4 space-y-6 shadow-md">
            <h3 className="text-xl font-medium border-b border-b-slate-300 pb-1">
              Categories
            </h3>
            <ul className="space-y-2 !mt-3">
              {shopCategories?.map((category) => (
                <li
                  key={category.label}
                  className="flex items-center justify-between"
                >
                  <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.label)}
                      onChange={() => toggleCategory(category.label)}
                      className="accent-blue-600"
                    />
                    {category.label}
                  </label>
                </li>
              ))}
            </ul>
            <h3 className="text-xl font-medium border-b border-b-slate-300 pb-1 mt-6">
              Filter by Color
            </h3>
            <ul className="space-y-2 !mt-3">
              {colors.map((color) => (
                <li
                  key={color.name}
                  className="flex items-center justify-between"
                >
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={selectedColors.includes(color.name)}
                      onChange={() => toggleColor(color.name)}
                      className="accent-blue-600"
                    />
                    <span
                      className="w-[16px] h-[16px] rounded-full border border-gray-200"
                      style={{ backgroundColor: color.code }}
                    ></span>
                    {color.name}
                  </label>
                </li>
              ))}
            </ul>

            <h3 className="text-xl font-medium border-b border-b-slate-300 pb-1 mt-6">
              Filter by Size
            </h3>

            <ul className="space-y-2 !mt-3">
              {sizes.map((size) => (
                <li key={size} className="flex items-center justify-between">
                  <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedSizes.includes(size)}
                      onChange={() => toggleSize(size)}
                      className="accent-blue-600"
                    />
                    <span className="font-medium">{size}</span>
                  </label>
                </li>
              ))}
            </ul>
          </aside>

          <div className="flex-1 px-2 lg:px-3">
            {isProductLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-5">
                {Array.from({ length: 10 }).map((_, index) => (
                  <div
                    key={index + 1}
                    className="h-[250px] bg-gray-300 animate-pulse rounded-xl"
                  ></div>
                ))}
              </div>
            ) : (
              <div>
                {products.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-5">
                    {products?.map((product) => (
                      <ProductCard key={product.id} product={product} isEvent />
                    ))}
                  </div>
                ) : (
                  <p>No products found</p>
                )}

                {totalPages > 1 && (
                  <div className="flex justify-center mt-8 gap-2">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setPage(i + 1)}
                        className={`px-3 py-1 !rounded border border-gray-200 text-sm ${page === i + 1 ? "bg-blue-600 text-white" : "bg-white text-black"}`}
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
