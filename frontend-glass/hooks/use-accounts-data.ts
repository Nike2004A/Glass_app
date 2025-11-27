import { useState, useEffect, useCallback } from "react";
import accountsService from "@/services/accounts";
import belvoService from "@/services/belvo";
import { BankAccount } from "@/types/financial";

export function useAccountsData() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadAccounts = useCallback(async () => {
    try {
      setError(null);
      const accountsData = await accountsService.getAccounts();

      // Handle case when no accounts exist (backend might return undefined or null)
      if (!accountsData || !Array.isArray(accountsData)) {
        setAccounts([]);
        return;
      }

      // Transform backend data to match BankAccount type
      const formattedAccounts: BankAccount[] = accountsData.map((acc: any) => ({
        id: acc.id.toString(),
        name: acc.account_name || "Cuenta",
        bank: acc.institution_name || "Banco",
        type: acc.account_type || "checking",
        balance: acc.current_balance || 0,
        currency: acc.currency || "MXN",
        lastSync: acc.last_synced_at ? new Date(acc.last_synced_at) : new Date(),
        accountNumber: acc.account_number || "****",
        status: acc.is_active ? "active" : "inactive",
      }));

      setAccounts(formattedAccounts);
    } catch (err: any) {
      console.error("Error loading accounts:", err);
      // Don't set error for "no accounts found" - just show empty state
      if (err.message && !err.message.includes("No Belvo link found")) {
        setError(err.message);
      }
      setAccounts([]);
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
        await belvoService.syncAccounts();
      } catch (syncError: any) {
        console.warn("Belvo sync failed, continuing with local data:", syncError);
      }

      // Reload accounts from backend
      await loadAccounts();
    } catch (err: any) {
      console.error("Error refreshing accounts:", err);
      setError(err.message || "Error al actualizar cuentas");
    } finally {
      setRefreshing(false);
    }
  }, [loadAccounts]);

  const setPrimaryAccount = useCallback(async (accountId: string) => {
    try {
      await accountsService.setPrimaryAccount(accountId);
      await loadAccounts();
      return true;
    } catch (err: any) {
      console.error("Error setting primary account:", err);
      throw err;
    }
  }, [loadAccounts]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  return {
    accounts,
    loading,
    error,
    refreshing,
    refresh,
    setPrimaryAccount,
    reload: loadAccounts,
  };
}
