import { useQuery } from "@tanstack/react-query";

import axiosInstance from "@/utils/axiosInstance";

const fetchSeller = async () => {
  const response = await axiosInstance.get("/api/auth/sellers/profile");
  return response.data.seller;
};

export const useSeller = () => {
  const {
    data: seller,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["seller-profile"],
    queryFn: fetchSeller,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  return { seller, isLoading, isError, refetch };
};
