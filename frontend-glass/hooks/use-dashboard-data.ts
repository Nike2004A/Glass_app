import { useState, useEffect, useCallback } from "react";
import dashboardService, { DashboardData } from "@/services/dashboard";
import belvoService from "@/services/belvo";

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const dashboardData = await dashboardService.getDashboardData();
      setData(dashboardData);
    } catch (err: any) {
      console.error("Error loading dashboard data:", err);
      // Don't set error for "no accounts found" - just show empty state
      if (err.message && !err.message.includes("No Belvo link found")) {
        setError(err.message);
      }
      // Set empty data to show empty state
      setData({
        summary: {
          totalBalance: 0,
          monthlyIncome: 0,
          monthlyExpenses: 0,
          pendingAlerts: 0,
          dailyBudget: 0,
          spentToday: 0,
        },
        mainAccount: null,
        recentTransactions: [],
        suspiciousCharges: [],
        automaticPayments: [],
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);

      // Try to sync with Belvo
      try {
        await belvoService.syncAll();
      } catch (syncError: any) {
        console.warn("Belvo sync failed, continuing with local data:", syncError);
        // Don't throw - we'll just use local data
      }

      // Reload data from backend
      await loadData();
    } catch (err: any) {
      console.error("Error refreshing dashboard:", err);
      setError(err.message || "Error al actualizar datos");
    } finally {
      setRefreshing(false);
    }
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    refreshing,
    refresh,
    reload: loadData,
  };
}
