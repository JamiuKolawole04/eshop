import { CustomAxiosRequestConfig } from "@/types/axiosInstance.type";

export const isProtected: CustomAxiosRequestConfig = {
  requireAuth: true,
};
