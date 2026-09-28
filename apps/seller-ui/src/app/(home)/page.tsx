"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { useSeller } from "@/hooks/use-seller";
import axiosInstance from "@/utils/axiosInstance";
import { FetchSellerDetailsResponseType } from "@packages/ui";
import SellerProfile from "@/shared/component/profile";

async function fetchSellerDetails(id: string) {
  const response = await axiosInstance.get<FetchSellerDetailsResponseType>(
    `/api/sellers/${id}`,
  );

  return response.data;
}

const Page = () => {
  const { seller } = useSeller();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["shop-details", seller?.id],
    queryFn: () => fetchSellerDetails(seller?.shop?.id),
    enabled: !!seller?.id,
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading)
    return (
      <p className="font-Poppins text-white text-center">Loading shop...</p>
    );
  if ((!isLoading && isError) || !data?.shop)
    return (
      <p className="font-Poppins text-white text-center">Shop not found.</p>
    );

  return (
    <div className="font-Poppins pt-4">
      <div className="pl-2">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
      </div>
      <SellerProfile shop={data?.shop} followersCount={data?.followersCount} />
    </div>
  );
};

export default Page;
