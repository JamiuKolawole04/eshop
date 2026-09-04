import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import axiosInstance from "@/utils/axiosInstance";
import { useAuthStore } from "@/store/auth";
import { isProtected } from "@/utils/protected";

const fetchUser = async (isLoggedIn: boolean) => {
  const config = isLoggedIn ? isProtected : {};
  const response = await axiosInstance.get("/api/users/profile", config);
  return response.data?.user ?? null;
};

export const useUser = () => {
  const { isLoggedIn, setIsLoggedIn } = useAuthStore();

  const {
    data: user,
    isPending,
    isError,
    refetch,
    isSuccess,
  } = useQuery({
    queryKey: ["user-profile"],
    queryFn: () => fetchUser(isLoggedIn),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  useEffect(() => {
    if (isSuccess) {
      setIsLoggedIn(true);
    }
  }, [isSuccess, user]);

  useEffect(() => {
    if (isError) {
      setIsLoggedIn(false);
    }
  }, [isError]);

  return {
    user,
    isLoading: isPending,
    isError,
    isAuthenticated: !!user,
    refetch,
  };
};
