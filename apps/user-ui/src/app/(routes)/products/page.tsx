"use client";

import { useQuery } from "@tanstack/react-query";
import { Suspense, useEffect, useRef, useState } from "react";
import { Range } from "react-range";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { X } from "lucide-react";

import axiosInstance from "@/utils/axiosInstance";
import {
  formatCurrency,
  GetFilteredProductsResponseType,
  ProductCategoriesTypes,
  ProductWithRelationsType,
  productColorOptions,
  sizes,
} from "@packages/ui";
import { ProductCard } from "@/shared/components/cards/productCard";

async function fetchProductCategories() {
  const response = await axiosInstance.get<ProductCategoriesTypes>(
    `api/products/categories`,
  );

  return response.data;
}

const MIN = 0;
const MAX = 10000;
const STEP = 10;

// Product grid: 1 col (phones) -> 2 (>=480px) -> 2 (lg, sidebar takes space) -> 3 (xl) -> 4 (2xl)
const GRID_CLASSES =
  "grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5";

const SECTION_TITLE = "text-xl font-medium border-b border-b-slate-300 pb-1";

const CLEAR_SEARCH_CLASSES =
  "inline-flex items-center gap-1.5 text-sm text-[#55585b] bg-white border border-gray-200 px-3 py-1.5 shadow-sm hover:border-blue-600 hover:text-blue-600 transition !rounded";

const ClearSearchButton = ({
  onClick,
  className = "",
}: {
  onClick: () => void;
  className?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`${CLEAR_SEARCH_CLASSES} ${className}`}
  >
    <X className="w-4 h-4" aria-hidden="true" />
    Clear search
  </button>
);

const PageSkeleton = () => (
  <div className="w-full bg-[#f5f5f5] pb-10 font-Poppins">
    <div className="w-[92%] sm:w-[90%] lg:w-[85%] xl:w-[80%] m-auto">
      <div className="pt-6 pb-6 md:pt-10 md:pb-[50px] space-y-3">
        <div className="h-9 md:h-12 w-52 md:w-72 bg-gray-300 animate-pulse rounded" />
        <div className="h-4 w-40 bg-gray-200 animate-pulse rounded" />
      </div>

      <div className="w-full flex flex-col lg:flex-row lg:items-start gap-5 lg:gap-8">
        <div className="hidden lg:block w-[270px] shrink-0 h-[460px] bg-white shadow-md !rounded animate-pulse" />

        <div className="flex-1 min-w-0 lg:px-3">
          <div className={GRID_CLASSES}>
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index + 1}
                className="h-[250px] bg-gray-300 animate-pulse rounded-xl"
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ProductsContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const q = (searchParams.get("q") ?? "").trim();

  const [isProductLoading, setIsProductLoading] = useState(true);
  const [priceRange, setPriceRange] = useState([MIN, MAX]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [page, setPage] = useState<number>(1);
  const [products, setProducts] = useState<ProductWithRelationsType[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [tempPriceRange, setTempPriceRange] = useState([MIN, MAX]);
  const [error, setError] = useState<string | null>(null);

  const [showFilters, setShowFilters] = useState(false);
  const lastQRef = useRef(q);

  const updateURL = () => {
    const params = new URLSearchParams();

    params.set("priceRange", priceRange.join(","));
    if (selectedCategories.length > 0) {
      params.set("categories", selectedCategories.join(","));
    }

    if (selectedColors.length > 0) {
      params.set("colors", selectedColors.join(","));
    }

    if (selectedSizes.length > 0) {
      params.set("sizes", selectedSizes.join(","));
    }

    params.set("page", page.toString());

    const query = decodeURIComponent(params.toString());

    router.replace(
      q ? `products?${query}&q=${encodeURIComponent(q)}` : `products?${query}`,
    );
  };

  const fetchFilteredProducts = async () => {
    setIsProductLoading(true);
    setError(null);

    try {
      const query = new URLSearchParams();
      query.set("priceRange", priceRange.join(","));

      if (selectedCategories.length > 0) {
        query.set("categories", selectedCategories.join(","));
      }

      if (selectedColors.length > 0) {
        query.set("colors", selectedColors.join(","));
      }

      if (selectedSizes.length > 0) {
        query.set("sizes", selectedSizes.join(","));
      }

      if (q) {
        query.set("q", q);
      }

      query.set("page", page.toString());
      query.set("limit", "12");

      const response = await axiosInstance.get<GetFilteredProductsResponseType>(
        `/api/products/filtered-products?${query.toString()}`,
      );

      setProducts(response.data.products);
      setTotalPages(response.data.pagination.totalPages);
    } catch (err) {
      console.log(new Error("Error fetching filtered products"), err);
      setError("Couldn't load products right now. Please try again.");
    } finally {
      setIsProductLoading(false);
    }
  };

  useEffect(() => {
    const termChanged = lastQRef.current !== q;
    lastQRef.current = q;

    if (termChanged && page !== 1) {
      setPage(1);
      return;
    }

    updateURL();
    fetchFilteredProducts();
  }, [priceRange, selectedCategories, selectedColors, selectedSizes, page, q]);

  const clearSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    const search = decodeURIComponent(params.toString());
    router.replace(search ? `products?${search}` : "products");
  };

  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchProductCategories,
    staleTime: 1000 * 60 * 30,
  });

  const toggleCategory = (label: string) => {
    setSelectedCategories((prev) =>
      prev.includes(label)
        ? prev.filter((cat) => cat !== label)
        : [...prev, label],
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color],
    );
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size],
    );
  };

  return (
    <div className="w-full bg-[#f5f5f5] pb-10 font-Poppins">
      <div className="w-[92%] sm:w-[90%] lg:w-[85%] xl:w-[80%] m-auto">
        {/* Page heading + breadcrumb */}
        <div className="pt-6 pb-6 md:pt-10 md:pb-[50px]">
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 mb-3">
            <div>
              <h1 className="font-medium text-3xl sm:text-4xl md:text-[40px] leading-tight">
                {q ? "Search results" : "All Product"}
              </h1>

              {q && (
                <p className="text-[#55585b] text-base sm:text-lg mt-1 break-words">
                  “{q}”
                </p>
              )}
            </div>

            {q && (
              <ClearSearchButton
                onClick={clearSearch}
                className="mt-1 shrink-0"
              />
            )}
          </div>

          <Link href="/" className="text-[#55585b] hover:underline">
            Home
          </Link>

          <span className="inline-block p-[1.5px] mx-1 bg-[#a8acb0] rounded-full"></span>
          <span className="text-[#55585b]">
            {q ? "Search" : "All products"}
          </span>
        </div>

        {/* lg:items-start is required so the sticky sidebar doesn't stretch to full height */}
        <div className="w-full flex flex-col lg:flex-row lg:items-start gap-5 lg:gap-8">
          {/* Filter toggle (hidden on lg+) */}
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

          {/* Sidebar: collapsible below lg, normal static sidebar on lg+ */}
          <aside
            className={`${showFilters ? "block" : "hidden"} lg:block w-full lg:w-[270px] lg:shrink-0 lg:self-start !rounded bg-white p-4 shadow-md`}
          >
            <div className="space-y-6">
              {/* Price */}
              <h3 className="text-xl font-medium">Price Filter</h3>
              <div className="mx-2">
                <Range
                  step={STEP}
                  min={MIN}
                  max={MAX}
                  values={tempPriceRange}
                  onChange={(values) => setTempPriceRange(values)}
                  renderTrack={({ props, children }) => {
                    const [min, max] = tempPriceRange;
                    const percentageLeft = ((min - MIN) / (MAX - MIN)) * 100;
                    const percentageRight = ((max - MIN) / (MAX - MIN)) * 100;

                    return (
                      <div
                        {...props}
                        className="h-[6px] bg-blue-200 rounded relative"
                        style={{ ...props.style }}
                      >
                        <div
                          className="absolute h-full bg-blue-600 rounded"
                          style={{
                            left: `${percentageLeft}%`,
                            width: `${percentageRight - percentageLeft}%`,
                          }}
                        />
                        {children}
                      </div>
                    );
                  }}
                  renderThumb={({ props }) => {
                    const { key, ...rest } = props;
                    return (
                      <div
                        key={key}
                        {...rest}
                        className="w-5 h-5 lg:w-[16px] lg:h-[16px] bg-blue-600 rounded-full shadow"
                      />
                    );
                  }}
                />
              </div>
              <div className="flex flex-wrap justify-between items-center gap-2 mt-2">
                <div className="text-sm text-gray-600">
                  {formatCurrency(tempPriceRange[0], { decimals: false })} -{" "}
                  {formatCurrency(tempPriceRange[1], { decimals: false })}
                </div>

                <button
                  onClick={() => {
                    setPriceRange(tempPriceRange);
                    setPage(1);
                  }}
                  className="text-sm px-4 py-1.5 bg-gray-200 hover:bg-blue-600 hover:text-white transition !rounded"
                >
                  Apply
                </button>
              </div>

              {/* Categories */}
              <h3 className={SECTION_TITLE}>Categories</h3>
              <ul className="grid grid-cols-2 lg:grid-cols-1 gap-x-4 gap-y-2 !mt-3">
                {isLoading ? (
                  <p>Loading...</p>
                ) : (
                  data?.categories?.map((category) => (
                    <li
                      key={category}
                      className="flex items-center justify-between"
                    >
                      <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category)}
                          onChange={() => toggleCategory(category)}
                          className="accent-blue-600"
                        />
                        {category}
                      </label>
                    </li>
                  ))
                )}
              </ul>

              {/* Colors */}
              <h3 className={`${SECTION_TITLE} mt-6`}>Filter by Color</h3>
              <ul className="grid grid-cols-2 lg:grid-cols-1 gap-x-4 gap-y-2 !mt-3">
                {productColorOptions.map((color) => (
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

              {/* Sizes */}
              <h3 className={`${SECTION_TITLE} mt-6`}>Filter by Size</h3>
              <ul className="grid grid-cols-3 lg:grid-cols-1 gap-x-4 gap-y-2 !mt-3">
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
            </div>
          </aside>

          {/* Products */}
          <div className="flex-1 min-w-0 lg:px-3">
            {isProductLoading ? (
              <div className={GRID_CLASSES}>
                {Array.from({ length: 10 }).map((_, index) => (
                  <div
                    key={index + 1}
                    className="h-[250px] bg-gray-300 animate-pulse rounded-xl"
                  ></div>
                ))}
              </div>
            ) : error ? (
              <p className="font-Roboto text-red-600">{error}</p>
            ) : (
              <div>
                {products.length > 0 ? (
                  <div className={GRID_CLASSES}>
                    {products?.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : q ? (
                  <div>
                    <p className="font-Roboto">No products found for “{q}”</p>
                    <ClearSearchButton onClick={clearSearch} className="mt-3" />
                  </div>
                ) : (
                  <p className="font-Roboto">No products found</p>
                )}

                {totalPages > 1 && (
                  <div className="flex flex-wrap justify-center mt-8 gap-2">
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

const Page = () => (
  <Suspense fallback={<PageSkeleton />}>
    <ProductsContent />
  </Suspense>
);

export default Page;
