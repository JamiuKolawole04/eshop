import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import axiosInstance from "@/utils/axiosInstance";

const fetchUser = async () => {
  const response = await axiosInstance.get("/api/auth/users/profile");
  return response.data?.user ?? null;
};

export const useUser = () => {
  const {
    data: user,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["user-profile"],
    queryFn: fetchUser,
    staleTime: 1000 * 60 * 5,
    // retry: 1
    retry: (failureCount, error) => {
      if (axios.isAxiosError(error) && error.response?.status === 401)
        return false;
      return failureCount < 1;
    },
  });

  return { user, isLoading, isError, isAuthenticated: !!user, refetch };
};
