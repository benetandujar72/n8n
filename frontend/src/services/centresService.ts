import apiService, { ApiResponse, PaginationParams } from './apiService';

export interface Centre {
  id: string;
  nom: string;
  codi: string;
  emailDomain: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
  _count?: {
    users: number;
    cursos: number;
  };
}

export interface CreateCentreData {
  nom: string;
  codi: string;
  emailDomain: string;
}

export interface UpdateCentreData {
  nom?: string;
  codi?: string;
  emailDomain?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface CentreFilters extends PaginationParams {
  search?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface CentreStatistics {
  usuaris: {
    total: number;
    actius: number;
  };
  cursos: {
    total: number;
    actius: number;
  };
  assignatures: number;
  professors: number;
  alumnes: number;
}

export const centresService = {
  // Obtenir llistat de centres
  getCentres: async (filters?: CentreFilters): Promise<ApiResponse<Centre[]>> => {
    return apiService.get<Centre[]>('/centres', filters);
  },

  // Obtenir centre per ID
  getCentre: async (id: string): Promise<ApiResponse<Centre>> => {
    return apiService.get<Centre>(`/centres/${id}`);
  },

  // Crear nou centre
  createCentre: async (data: CreateCentreData): Promise<ApiResponse<Centre>> => {
    return apiService.post<Centre>('/centres', data);
  },

  // Actualitzar centre
  updateCentre: async (id: string, data: UpdateCentreData): Promise<ApiResponse<Centre>> => {
    return apiService.put<Centre>(`/centres/${id}`, data);
  },

  // Eliminar centre
  deleteCentre: async (id: string): Promise<ApiResponse<void>> => {
    return apiService.delete<void>(`/centres/${id}`);
  },

  // Obtenir estadístiques del centre
  getCentreStatistics: async (id: string): Promise<ApiResponse<{ centre: Centre; estadistiques: CentreStatistics }>> => {
    return apiService.get<{ centre: Centre; estadistiques: CentreStatistics }>(`/centres/${id}/estadistiques`);
  },
};

export default centresService;
