import { useQuery } from "@tanstack/react-query";

import axiosInstance from "@/utils/axiosInstance";
import { isPublic } from "@/utils/protected";

const fetchLayout = async () => {
  const response = await axiosInstance.get("/api/users/layouts", isPublic);
  return response.data.layout;
};

const useLayout = () => {
  const {
    data: layout,
    isPending: isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["layout"],
    queryFn: fetchLayout,
    staleTime: 1000 * 60 * 60,
    retry: 1,
  });

  return {
    layout,
    isLoading,
    isError,
    refetch,
  };
};

export default useLayout;
