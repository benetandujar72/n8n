import { apiClient } from './apiClient';

export interface DashboardStats {
  centres: number;
  cursos: number;
  usuaris: number;
  assignatures: number;
  avaluacions: number;
  integracions: number;
}

export interface RecentActivity {
  id: string;
  action: string;
  table: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  timestamp: string;
}

class DashboardService {
  async getStats(): Promise<DashboardStats> {
    const response = await apiClient.get('/dashboard/stats');
    return response.data;
  }

  async getRecentActivity(): Promise<RecentActivity[]> {
    const response = await apiClient.get('/dashboard/activity');
    return response.data;
  }

  async getChartData(period: string = 'month'): Promise<any> {
    const response = await apiClient.get(`/dashboard/charts?period=${period}`);
    return response.data;
  }
}

export const dashboardService = new DashboardService();
