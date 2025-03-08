import axios from "axios";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import useAuthTokens from "./useAuthTokens";

function useApiRequests() {
  const { getTokens, setTokens, clearTokens } = useAuthTokens();

  const navigate = useNavigate();

  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: import.meta.env.VITE_SERVER_URL,
      headers: { "Content-Type": "application/json" },
    });

    instance.interceptors.request.use((config) => {
      const { accessToken } = getTokens();
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    });

    instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 403 && !originalRequest._retry) {
          originalRequest._retry = true;
          const { refreshToken } = getTokens();
          if (!refreshToken) {
            clearTokens();
            navigate("/login");
            return Promise.reject(error);
          }

          try {
            console.log("Attempting to refresh token...");
            const { data } = await instance.post("/api/refresh-token", {
              refreshToken,
            });
            setTokens(data.accessToken, data.refreshToken);

            originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
            return instance(originalRequest);
          } catch (refreshError) {
            console.error("Refresh token failed:", refreshError);
            clearTokens();
            navigate("/login");
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    return instance;
  }, [getTokens, clearTokens, navigate, setTokens]);

  return api;
}

export default useApiRequests;
