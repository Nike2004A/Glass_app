import api from "./api";

export interface BelvoInstitution {
  id: string;
  name: string;
  type: string;
  website: string;
  country: string;
  logo: string;
}

export interface BelvoLinkData {
  institution: string;
  username: string;
  password: string;
  token?: string;
}

export interface BelvoLink {
  link_id: string;
  institution: string;
  status: string;
  created_at: string;
  last_accessed_at?: string;
}

export interface BelvoSyncResult {
  success: boolean;
  message: string;
  accounts_synced?: number;
  transactions_synced?: number;
  errors?: string[];
}

class BelvoService {
  /**
   * Get list of available banking institutions
   */
  async getInstitutions(countryCode: string = "MX"): Promise<BelvoInstitution[]> {
    try {
      const response = await api.get<{ institutions: BelvoInstitution[] }>(
        `/api/v1/belvo/institutions`,
        {
          params: { country_code: countryCode },
        }
      );
      return response.data.institutions;
    } catch (error: any) {
      console.error("Error getting institutions:", error);
      throw new Error(
        error.response?.data?.detail || "Error al obtener instituciones bancarias"
      );
    }
  }

  /**
   * Create a new Belvo link to connect to a bank
   */
  async createLink(linkData: BelvoLinkData): Promise<BelvoLink> {
    try {
      const response = await api.post<BelvoLink>("/api/v1/belvo/link", linkData);
      return response.data;
    } catch (error: any) {
      console.error("Error creating link:", error);
      throw new Error(
        error.response?.data?.detail || "Error al conectar con el banco"
      );
    }
  }

  /**
   * Get current user's Belvo link
   */
  async getLink(): Promise<BelvoLink> {
    try {
      const response = await api.get<BelvoLink>("/api/v1/belvo/link");
      return response.data;
    } catch (error: any) {
      console.error("Error getting link:", error);
      throw new Error(
        error.response?.data?.detail || "Error al obtener enlace bancario"
      );
    }
  }

  /**
   * Delete current user's Belvo link
   */
  async deleteLink(): Promise<void> {
    try {
      await api.delete("/api/v1/belvo/link");
    } catch (error: any) {
      console.error("Error deleting link:", error);
      throw new Error(
        error.response?.data?.detail || "Error al eliminar enlace bancario"
      );
    }
  }

  /**
   * Sync bank accounts from Belvo
   */
  async syncAccounts(): Promise<BelvoSyncResult> {
    try {
      const response = await api.post<BelvoSyncResult>(
        "/api/v1/belvo/sync/accounts"
      );
      return response.data;
    } catch (error: any) {
      console.error("Error syncing accounts:", error);
      throw new Error(
        error.response?.data?.detail || "Error al sincronizar cuentas"
      );
    }
  }

  /**
   * Sync transactions from Belvo
   */
  async syncTransactions(dateFrom?: string, dateTo?: string): Promise<BelvoSyncResult> {
    try {
      const response = await api.post<BelvoSyncResult>(
        "/api/v1/belvo/sync/transactions",
        {
          link_id: "",
          date_from: dateFrom,
          date_to: dateTo,
        }
      );
      return response.data;
    } catch (error: any) {
      console.error("Error syncing transactions:", error);
      throw new Error(
        error.response?.data?.detail || "Error al sincronizar transacciones"
      );
    }
  }

  /**
   * Sync all data (accounts and transactions) from Belvo
   */
  async syncAll(): Promise<any> {
    try {
      const response = await api.post("/api/v1/belvo/sync/all");
      return response.data;
    } catch (error: any) {
      console.error("Error syncing all data:", error);
      throw new Error(
        error.response?.data?.detail || "Error al sincronizar datos"
      );
    }
  }
}

export default new BelvoService();
