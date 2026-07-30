import { useQuery } from "@tanstack/react-query";

import axiosInstance from "@/utils/axiosInstance";

const fetchUser = async () => {
  const response = await axiosInstance.get("/api/auth/users/profile");
  return response.data.user;
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
    retry: 1,
  });

  return { user, isLoading, isError, refetch };
};
