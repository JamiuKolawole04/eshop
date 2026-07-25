import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URI,
  withCredentials: true,
});

let isRefreshing = false;
let refreshSubscribers: (() => void)[] = [];

const handleLogout = () => {
  if (window.location.pathname === "login") {
    window.location.href = "/login";
  }
};

// handle adding a new access token to queued requests.
const subscribeTokenRefresh = (callback: () => void) => {
  refreshSubscribers.push(callback);
};

// Execute queued requets after refresh
const onRefreshSuccess = () => {
  refreshSubscribers.forEach((callback) => callback());

  refreshSubscribers = [];
};

axiosInstance.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error),
);
