import api from "./api";
import { Transaction } from "@/types/financial";

export interface TransactionsResponse {
  transactions: Transaction[];
  total: number;
}

export interface TransactionFilters {
  account_id?: string;
  transaction_type?: "income" | "expense";
  category?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}

class TransactionsService {
  /**
   * Get transactions with optional filters
   */
  async getTransactions(filters?: TransactionFilters): Promise<Transaction[]> {
    try {
      const response = await api.get<TransactionsResponse>("/api/v1/transactions/", {
        params: filters,
      });
      return response.data.transactions;
    } catch (error: any) {
      console.error("Error getting transactions:", error);
      throw new Error(
        error.response?.data?.detail || "Error al obtener transacciones"
      );
    }
  }

  /**
   * Get a specific transaction by ID
   */
  async getTransaction(transactionId: string): Promise<Transaction> {
    try {
      const response = await api.get<Transaction>(
        `/api/v1/transactions/${transactionId}`
      );
      return response.data;
    } catch (error: any) {
      console.error("Error getting transaction:", error);
      throw new Error(
        error.response?.data?.detail || "Error al obtener transacción"
      );
    }
  }

  /**
   * Get recent transactions (last 10)
   */
  async getRecentTransactions(limit: number = 10): Promise<Transaction[]> {
    return this.getTransactions({ limit });
  }
}

export default new TransactionsService();
