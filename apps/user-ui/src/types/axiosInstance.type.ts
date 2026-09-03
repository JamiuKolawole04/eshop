import type { AxiosRequestConfig } from "axios";

export type CustomAxiosRequestConfig = AxiosRequestConfig & {
  requireAuth?: boolean;
  _retry?: boolean;
};
