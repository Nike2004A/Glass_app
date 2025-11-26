import * as SecureStore from "expo-secure-store";
import api from "./api";

export interface RegisterData {
  full_name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface UserData {
  id: number;
  full_name: string;
  email: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  last_login: string | null;
}

class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<UserData> {
    try {
      const response = await api.post<UserData>("/api/v1/auth/register", data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error("Error al registrar usuario");
    }
  }

  /**
   * Login user and store tokens
   */
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>("/api/v1/auth/login", data);
      const { access_token, refresh_token, token_type } = response.data;

      // Store tokens securely
      await SecureStore.setItemAsync("access_token", access_token);
      await SecureStore.setItemAsync("refresh_token", refresh_token);

      return response.data;
    } catch (error: any) {
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error("Error al iniciar sesión");
    }
  }

  /**
   * Logout user and clear tokens
   */
  async logout(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync("access_token");
      await SecureStore.deleteItemAsync("refresh_token");
    } catch (error) {
      console.error("Error clearing tokens:", error);
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await SecureStore.getItemAsync("access_token");
      return !!token;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get access token
   */
  async getAccessToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync("access_token");
    } catch (error) {
      return null;
    }
  }

  /**
   * Get refresh token
   */
  async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync("refresh_token");
    } catch (error) {
      return null;
    }
  }

  /**
   * Refresh access token using refresh token
   * Used for biometric login
   */
  async refreshAccessToken(): Promise<AuthResponse> {
    try {
      const refreshToken = await this.getRefreshToken();

      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await api.post<AuthResponse>("/api/v1/auth/refresh", {
        refresh_token: refreshToken,
      });

      const { access_token, refresh_token: new_refresh_token, token_type } = response.data;

      // Store new tokens
      await SecureStore.setItemAsync("access_token", access_token);
      await SecureStore.setItemAsync("refresh_token", new_refresh_token);

      return response.data;
    } catch (error: any) {
      // If refresh fails, clear tokens
      await this.logout();
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error("Error al renovar sesión");
    }
  }

  /**
   * Check if user has a saved session (refresh token exists)
   */
  async hasSavedSession(): Promise<boolean> {
    try {
      const refreshToken = await this.getRefreshToken();
      return !!refreshToken;
    } catch (error) {
      return false;
    }
  }
}

export default new AuthService();
