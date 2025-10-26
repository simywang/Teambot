import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface LOI {
  id: string;
  teams_message_id?: string;
  teams_conversation_id: string;
  customer: string;
  product: string;
  sku?: string;
  ratio: number;
  incoterm: string;
  period: string;
  quantity_mt: number;
  quantity_unit?: string;
  currency?: string;
  sales_or_purchase?: 'sales' | 'purchase';
  ship_to_location?: string;
  gross_ratio?: number;
  status: 'draft' | 'confirmed' | 'modified';
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ModificationHistory {
  id: number;
  loi_id: string;
  modified_by: string;
  modified_source: 'teams' | 'web';
  changes: any;
  modified_at: string;
}

class APIService {
  private api = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  constructor() {
    // Add request interceptor to include user name
    this.api.interceptors.request.use((config) => {
      const userName = localStorage.getItem('userName') || 'Web User';
      config.headers['X-User-Name'] = userName;
      return config;
    });
  }

  // LOI methods
  async getAllLOIs(conversationId?: string): Promise<LOI[]> {
    const params = conversationId ? { conversationId } : {};
    const response = await this.api.get('/lois', { params });
    return response.data.data;
  }

  async getLOIById(id: string): Promise<LOI> {
    const response = await this.api.get(`/lois/${id}`);
    return response.data.data;
  }

  async createLOI(loiData: Omit<LOI, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'status'>): Promise<LOI> {
    const response = await this.api.post('/lois', loiData);
    return response.data.data;
  }

  async updateLOI(id: string, updates: Partial<LOI>): Promise<LOI> {
    const response = await this.api.put(`/lois/${id}`, updates);
    return response.data.data;
  }

  async deleteLOI(id: string): Promise<void> {
    await this.api.delete(`/lois/${id}`);
  }

  async getModificationHistory(id: string): Promise<ModificationHistory[]> {
    const response = await this.api.get(`/lois/${id}/history`);
    return response.data.data;
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await this.api.get('/health');
    return response.data;
  }
}

export default new APIService();

