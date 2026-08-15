"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { Hero } from "@/shared/components/hero";
import { SectionTitle } from "@/shared/components/sectionTitle";
import axiosInstance from "@/utils/axiosInstance";
import { GetAllProductsResponseType } from "@packages/ui";
import { ProductCard } from "@/shared/components/cards/productCard";

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

export default function Page() {
  const queryClient = useQueryClient();

  const {
    data: products,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["products"],
    queryFn: fetchAllProducts,
    staleTime: 1000 * 60 * 5,
  });

  const { data: latestProducts } = useQuery({
    queryKey: ["latest-products"],
    queryFn: fetchAllProducts,
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
      </div>
    </div>
  );
}
