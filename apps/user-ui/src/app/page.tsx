"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { Hero } from "@/shared/components/hero";
import { SectionTitle } from "@/shared/components/sectionTitle";
import axiosInstance from "@/utils/axiosInstance";
import {
  GetAllProductsResponseType,
  GetEventOffersResponseType,
  GetTopShopsResponseType,
} from "@packages/ui";
import { ProductCard } from "@/shared/components/cards/productCard";
import { ShopCard } from "@/shared/components/cards/ShopCard";

const fetchAllProducts = async () => {
  const response = await axiosInstance.get<GetAllProductsResponseType>(
    `/api/products?page=1&limit=10`,
  );

  return response.data?.products;
};

const fetchAllLatestProducts = async () => {
  const response = await axiosInstance.get<GetAllProductsResponseType>(
    `/api/products?page=1&limit=10&type=latest`,
  );

  return response.data?.products;
};

const fetchTopShops = async () => {
  const response = await axiosInstance.get<GetTopShopsResponseType>(
    `/api/products/shops/top?page=1&limit=10&type=latest`,
  );

  return response.data?.shops;
};

const fetchTopOffers = async () => {
  const response = await axiosInstance.get<GetEventOffersResponseType>(
    `/api/products/events/all?page=1&limit=10`,
  );

  return response.data.events;
};

export default function Page() {
  const {
    data: products,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["products"],
    queryFn: fetchAllProducts,
    staleTime: 1000 * 60 * 5,
  });

  const { data: latestProducts, isLoading: isLatestProductLoading } = useQuery({
    queryKey: ["latest-products"],
    queryFn: fetchAllLatestProducts,
    staleTime: 1000 * 60 * 5,
  });

  const { data: topShops, isLoading: isTopShopsLoading } = useQuery({
    queryKey: ["top-shops"],
    queryFn: fetchTopShops,
    staleTime: 1000 * 60 * 5,
  });

  const { data: topOffers, isLoading: isTopOffersLoading } = useQuery({
    queryKey: ["offers"],
    queryFn: fetchTopOffers,
    staleTime: 1000 * 60 * 5,
  });

  return (
    <div className="bg-[#f5f5f5]">
      <Hero />

      <div className="md:w-[80%] w-90% my-10 m-auto">
        <div className="mb-8">
          <SectionTitle title="Suggested Products" />
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <div
                key={index + 1}
                className="h-[250px] bg-gray-300 animate-pulse rounded-xl"
              />
            ))}
          </div>
        )}

        {!isLoading && !isError && (
          <div className="m-auto grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
            {products?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {products?.length === 0 && (
          <p className="text-center font-Roboto">No products available yet</p>
        )}

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <div
                key={index + 1}
                className="h-[250px] bg-gray-300 animate-pulse rounded-xl"
              />
            ))}
          </div>
        )}

        <div className="my-8 block">
          <SectionTitle title="Latest Products" />
        </div>

        {!isLatestProductLoading && (
          <div className="m-auto grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
            {latestProducts?.map((latestProduct) => (
              <ProductCard key={latestProduct.id} product={latestProduct} />
            ))}
          </div>
        )}

        {latestProducts?.length === 0 && (
          <p className="text-center font-Roboto">No products available yet</p>
        )}

        <div className="my-8 block">
          <SectionTitle title="Top Shops" />
        </div>

        {!isTopShopsLoading && (
          <div className="m-auto grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
            {topShops?.map((topShops) => (
              <ShopCard key={topShops.id} shop={topShops} />
            ))}
          </div>
        )}

        {topShops?.length === 0 && (
          <p className="text-center font-Roboto">No shops available yet</p>
        )}

        <div className="my-8 block">
          <SectionTitle title="Top Offers" />
        </div>

        {!isTopOffersLoading && !isError && (
          <div className="m-auto grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
            {topOffers?.map((productOffers) => (
              <ProductCard
                key={productOffers.id}
                product={productOffers}
                isEvent
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
