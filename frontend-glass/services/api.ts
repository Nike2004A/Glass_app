import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import { Alert } from "react-native";

// Change this to your Render backend URL when deployed
const API_URL = "https://glass-app-j39g.onrender.com";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let isLoggingOut = false;

// Request interceptor to add token to requests
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync("access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error getting token:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;
    const status = error?.response?.status;

    // If 401 and we haven't retried yet, try to refresh token
    if (status === 401 && !originalRequest._retry && !isLoggingOut) {
      originalRequest._retry = true;

      try {
        const refreshToken = await SecureStore.getItemAsync("refresh_token");

        if (refreshToken) {
          // Try to refresh the token
          const response = await axios.post(`${API_URL}/api/v1/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const { access_token, refresh_token: newRefreshToken } = response.data;

          // Save new tokens
          await SecureStore.setItemAsync("access_token", access_token);
          await SecureStore.setItemAsync("refresh_token", newRefreshToken);

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        // If refresh fails, logout
        if (!isLoggingOut) {
          isLoggingOut = true;
          console.warn("⛔ Token refresh failed, logging out...");

          try {
            await SecureStore.deleteItemAsync("access_token");
            await SecureStore.deleteItemAsync("refresh_token");
            Alert.alert("Sesión expirada", "Por favor, inicia sesión nuevamente.");
            router.replace("/login");
          } finally {
            setTimeout(() => {
              isLoggingOut = false;
            }, 2000);
          }
        }
      }
    }

    // If 401/422 and no refresh token available, logout
    if ((status === 401 || status === 422) && !isLoggingOut) {
      isLoggingOut = true;
      console.warn("⛔ Token inválido, cerrando sesión...");

      try {
        await SecureStore.deleteItemAsync("access_token");
        await SecureStore.deleteItemAsync("refresh_token");
        Alert.alert("Sesión expirada", "Por favor, inicia sesión nuevamente.");
        router.replace("/login");
      } finally {
        setTimeout(() => {
          isLoggingOut = false;
        }, 2000);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
