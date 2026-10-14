import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import axiosInstance from "@/utils/axiosInstance";
import { useAuthStore } from "@/store/auth";
import { isProtected } from "@/utils/protected";

const fetchUser = async () => {
  const response = await axiosInstance.get("/api/users/profile", isProtected);
  return response.data?.user ?? null;
};

export const useUser = () => {
  const { setIsLoggedIn, isLoggedIn } = useAuthStore();

  useEffect(() => {
    const has = document.cookie
      .split("; ")
      .some((c) => c.startsWith("has_session="));
    setIsLoggedIn(has);
  }, []);

  const {
    data: user,
    isPending,
    isError,
    refetch,
    isSuccess,
  } = useQuery({
    queryKey: ["user-profile"],
    queryFn: fetchUser,
    enabled: isLoggedIn,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  useEffect(() => {
    if (isSuccess) {
      setIsLoggedIn(true);
    }
  }, [isSuccess, user]);

  return {
    user,
    isLoading: isPending,
    isError,
    isAuthenticated: !!user,
    refetch,
  };
};
