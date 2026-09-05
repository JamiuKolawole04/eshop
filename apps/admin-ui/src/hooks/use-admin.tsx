"use client";

import { useQuery } from "@tanstack/react-query";

import axiosInstance from "@/utils/axiosInstance";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const fetchAdmin = async () => {
  const response = await axiosInstance.get("/api/users/profile");
  return response.data?.user ?? null;
};

export const useAdmin = () => {
  const {
    data: admin,
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["admin-profile"],
    queryFn: fetchAdmin,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const history = useRouter();

  useEffect(() => {
    if (!isPending && !admin) {
      history.replace("/");
    }
  }, [admin, isPending]);

  return {
    admin,
    isLoading: isPending,
    isError,
    isAuthenticated: !!admin,
    refetch,
  };
};
