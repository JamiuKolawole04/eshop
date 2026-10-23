"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { ProductType } from "@packages/ui";
import ProductForm from "@/shared/component/create-product";
import axiosInstance from "@/utils/axiosInstance";

const fetchShopProducts = async (): Promise<ProductType[]> => {
  const response = await axiosInstance.get(`/api/products/shop-products`);

  return response.data?.products ?? [];
};

const EditProductPage = () => {
  const { id } = useParams<{ id: string }>();

  const {
    data: products = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["shop-products"],
    queryFn: fetchShopProducts,
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-white" size={30} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-white">
        <p>Unable to load this product.</p>
        <Link
          href="/dashboard/all-products"
          className="mt-3 inline-block text-blue-400 hover:text-blue-300"
        >
          Back to All Products
        </Link>
      </div>
    );
  }

  const product = products.find((item) => item.id === id);

  if (!product) {
    return (
      <div className="p-6 text-white">
        <p>Product or event not found.</p>
        <Link
          href="/dashboard/all-products"
          className="mt-3 inline-block text-blue-400 hover:text-blue-300"
        >
          Back to All Products
        </Link>
      </div>
    );
  }

  const isEvent = Boolean(product.starting_date || product.ending_date);

  return (
    <ProductForm
      key={product.id}
      product={product}
      mode="edit"
      isEvent={isEvent}
    />
  );
};

export default EditProductPage;
