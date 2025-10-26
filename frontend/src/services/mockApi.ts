// Mock API service for demo mode
import { LOI, ModificationHistory } from './api';
import { mockLOIs, mockModificationHistory } from './mockData';

let localLOIs = [...mockLOIs];
let idCounter = 6;

// Simulate network delay
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

class MockAPIService {
  async getAllLOIs(conversationId?: string): Promise<LOI[]> {
    await delay();
    if (conversationId) {
      return localLOIs.filter(loi => loi.teams_conversation_id === conversationId);
    }
    return [...localLOIs];
  }

  async getLOIById(id: string): Promise<LOI> {
    await delay();
    const loi = localLOIs.find(l => l.id === id);
    if (!loi) {
      throw new Error('LOI not found');
    }
    return { ...loi };
  }

  async createLOI(loiData: Omit<LOI, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'status'>): Promise<LOI> {
    await delay();
    const userName = localStorage.getItem('userName') || 'Demo User';
    const newLOI: LOI = {
      id: String(idCounter++),
      ...loiData,
      status: 'draft',
      created_by: userName,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    localLOIs = [newLOI, ...localLOIs];
    return { ...newLOI };
  }

  async updateLOI(id: string, updates: Partial<LOI>): Promise<LOI> {
    await delay();
    const index = localLOIs.findIndex(l => l.id === id);
    if (index === -1) {
      throw new Error('LOI not found');
    }
    
    localLOIs[index] = {
      ...localLOIs[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    
    return { ...localLOIs[index] };
  }

  async deleteLOI(id: string): Promise<void> {
    await delay();
    localLOIs = localLOIs.filter(l => l.id !== id);
  }

  async getModificationHistory(id: string): Promise<ModificationHistory[]> {
    await delay();
    return mockModificationHistory.filter(h => h.loi_id === id);
  }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    await delay(100);
    return {
      status: 'ok (demo mode)',
      timestamp: new Date().toISOString(),
    };
  }
}

export default new MockAPIService();

