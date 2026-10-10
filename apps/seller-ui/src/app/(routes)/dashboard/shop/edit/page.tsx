"use client";

import { useQuery } from "@tanstack/react-query";

import { useSeller } from "@/hooks/use-seller";
import axiosInstance from "@/utils/axiosInstance";
import { FetchSellerDetailsResponseType, ButtonLoader } from "@packages/ui";
import { EditProfile } from "@/shared/component/shop/editProfile";

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
      <div className="flex items-center justify-center">
        <ButtonLoader className="text-white mt-5" />
      </div>
    );
  if ((!isLoading && isError) || !data?.shop)
    return (
      <p className="font-Poppins text-white text-center">Shop not found.</p>
    );

  return (
    <div className="font-Poppins pt-4">
      <EditProfile shop={data?.shop} sellerId={seller?.id} />
    </div>
  );
};

export default Page;
