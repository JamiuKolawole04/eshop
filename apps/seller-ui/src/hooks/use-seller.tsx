import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import axiosInstance from "@/utils/axiosInstance";
import { useAuthStore } from "@/store/auth";
import { isProtected } from "@/utils/protected";

const fetchSeller = async (isLoggedIn: boolean) => {
  const config = isLoggedIn ? isProtected : {};

  const response = await axiosInstance.get("/api/auth/sellers/profile", config);
  return response.data.seller;
};

export const useSeller = () => {
  const { isLoggedIn, setIsLoggedIn } = useAuthStore();

  const {
    data: seller,
    isPending,
    isError,
    isSuccess,
  } = useQuery({
    queryKey: ["seller-profile"],
    queryFn: () => fetchSeller(isLoggedIn),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  useEffect(() => {
    if (isSuccess) {
      setIsLoggedIn(true);
    }
  }, [isSuccess, seller]);

  useEffect(() => {
    if (isError) {
      setIsLoggedIn(false);
    }
  }, [isError]);

  return { seller, isLoading: isPending, isError, isAuthenticated: !!seller };
};
