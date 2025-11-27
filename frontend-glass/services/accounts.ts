import api from "./api";
import { BankAccount } from "@/types/financial";

export interface AccountsResponse {
  accounts: BankAccount[];
  total: number;
}

class AccountsService {
  /**
   * Get all bank accounts for the current user
   */
  async getAccounts(): Promise<BankAccount[]> {
    try {
      const response = await api.get<AccountsResponse>("/api/v1/accounts/");
      return response.data.accounts || [];
    } catch (error: any) {
      console.error("Error getting accounts:", error);
      // If it's a 404 or "No Belvo link found", return empty array instead of throwing
      if (error.response?.status === 404 ||
          error.response?.data?.detail?.includes("No Belvo link found")) {
        return [];
      }
      throw new Error(
        error.response?.data?.detail || "Error al obtener cuentas"
      );
    }
  }

  /**
   * Get a specific bank account by ID
   */
  async getAccount(accountId: string): Promise<BankAccount> {
    try {
      const response = await api.get<BankAccount>(`/api/v1/accounts/${accountId}`);
      return response.data;
    } catch (error: any) {
      console.error("Error getting account:", error);
      throw new Error(
        error.response?.data?.detail || "Error al obtener cuenta"
      );
    }
  }

  /**
   * Set an account as primary
   */
  async setPrimaryAccount(accountId: string): Promise<BankAccount> {
    try {
      const response = await api.patch<BankAccount>(
        `/api/v1/accounts/${accountId}/primary`
      );
      return response.data;
    } catch (error: any) {
      console.error("Error setting primary account:", error);
      throw new Error(
        error.response?.data?.detail || "Error al establecer cuenta principal"
      );
    }
  }
}

export default new AccountsService();
