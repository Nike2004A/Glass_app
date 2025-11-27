import api from "./api";
import { BankAccount, Transaction, SuspiciousCharge } from "@/types/financial";

export interface DashboardSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  pendingAlerts: number;
  dailyBudget: number;
  spentToday: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  mainAccount: BankAccount | null;
  recentTransactions: Transaction[];
  suspiciousCharges: SuspiciousCharge[];
  automaticPayments: any[];
}

class DashboardService {
  /**
   * Get complete dashboard data
   */
  async getDashboardData(): Promise<DashboardData> {
    try {
      // Get accounts
      let accounts = [];
      try {
        const accountsResponse = await api.get("/api/v1/accounts/");
        accounts = accountsResponse.data.accounts || [];
      } catch (error: any) {
        console.warn("No accounts found:", error);
        accounts = [];
      }

      // Find primary account or use the first one
      const mainAccount = accounts.find((acc: any) => acc.is_primary) || accounts[0] || null;

      // Get recent transactions
      let recentTransactions = [];
      try {
        const transactionsResponse = await api.get("/api/v1/transactions/", {
          params: { limit: 10 },
        });
        recentTransactions = transactionsResponse.data.transactions || [];
      } catch (error: any) {
        console.warn("No transactions found:", error);
        recentTransactions = [];
      }

      // Get suspicious charges
      let suspiciousCharges = [];
      try {
        const suspiciousResponse = await api.get("/api/v1/suspicious-charges/");
        suspiciousCharges = suspiciousResponse.data.charges || [];
      } catch (error: any) {
        console.warn("No suspicious charges found:", error);
        suspiciousCharges = [];
      }

      // Calculate summary
      const totalBalance = accounts.reduce(
        (sum: number, acc: any) => sum + (acc.current_balance || 0),
        0
      );

      // Calculate monthly income and expenses
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthlyTransactions = recentTransactions.filter((t: any) => {
        const transactionDate = new Date(t.transaction_date);
        return transactionDate >= firstDayOfMonth;
      });

      const monthlyIncome = monthlyTransactions
        .filter((t: any) => t.transaction_type === "income")
        .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

      const monthlyExpenses = monthlyTransactions
        .filter((t: any) => t.transaction_type === "expense")
        .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

      // Calculate today's spending
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTransactions = recentTransactions.filter((t: any) => {
        const transactionDate = new Date(t.transaction_date);
        transactionDate.setHours(0, 0, 0, 0);
        return transactionDate.getTime() === today.getTime() && t.transaction_type === "expense";
      });

      const spentToday = todayTransactions.reduce(
        (sum: number, t: any) => sum + (t.amount || 0),
        0
      );

      // Calculate daily budget (simplified: remaining monthly budget / days left in month)
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const daysLeft = daysInMonth - now.getDate() + 1;
      const remainingBudget = monthlyIncome - monthlyExpenses;
      const dailyBudget = daysLeft > 0 ? remainingBudget / daysLeft : 0;

      // Count pending alerts
      const pendingAlerts = suspiciousCharges.filter(
        (charge: any) => charge.status === "pending"
      ).length;

      // Format transactions
      const formattedTransactions = recentTransactions.map((t: any) => ({
        id: t.id.toString(),
        accountId: t.bank_account_id?.toString() || "",
        date: new Date(t.transaction_date),
        description: t.description || "Transacción",
        amount: t.amount || 0,
        category: t.category || "other",
        merchant: t.merchant_name || t.description || "Comercio",
        type: t.transaction_type || "expense",
        status: t.status || "completed",
      }));

      // Format suspicious charges
      const formattedSuspiciousCharges = suspiciousCharges.map((charge: any) => ({
        id: charge.id.toString(),
        transactionId: charge.transaction_id?.toString() || "",
        type: charge.charge_type || "phantom",
        amount: charge.amount || 0,
        merchant: charge.merchant_name || "Desconocido",
        date: new Date(charge.detected_at),
        reason: charge.reason || "Cargo sospechoso detectado",
        confidence: charge.confidence_score || 0,
        status: charge.status || "pending",
        accountId: charge.bank_account_id?.toString() || "",
      }));

      // Format main account
      const formattedMainAccount = mainAccount ? {
        id: mainAccount.id.toString(),
        name: mainAccount.account_name || "Cuenta Principal",
        bank: mainAccount.institution_name || "Banco",
        type: mainAccount.account_type || "checking",
        balance: mainAccount.current_balance || 0,
        currency: mainAccount.currency || "MXN",
        lastSync: mainAccount.last_synced_at ? new Date(mainAccount.last_synced_at) : new Date(),
        accountNumber: mainAccount.account_number || "****",
        status: mainAccount.is_active ? "active" : "inactive",
      } : null;

      return {
        summary: {
          totalBalance,
          monthlyIncome,
          monthlyExpenses,
          pendingAlerts,
          dailyBudget: Math.max(dailyBudget, 0),
          spentToday,
        },
        mainAccount: formattedMainAccount,
        recentTransactions: formattedTransactions,
        suspiciousCharges: formattedSuspiciousCharges,
        automaticPayments: [], // TODO: Implement when automation is ready
      };
    } catch (error: any) {
      console.error("Error getting dashboard data:", error);
      throw new Error(
        error.response?.data?.detail || "Error al obtener datos del dashboard"
      );
    }
  }
}

export default new DashboardService();
