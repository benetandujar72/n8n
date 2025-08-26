import apiService, { ApiResponse, PaginationParams } from './apiService';

export interface Curs {
  id: string;
  nom: string;
  codi: string;
  status: 'ACTIVE' | 'INACTIVE';
  centreId: string;
  createdAt: string;
  updatedAt: string;
  centre?: {
    id: string;
    nom: string;
    codi: string;
  };
  _count?: {
    assignatures: number;
    professors: number;
    alumnes: number;
  };
}

export interface CreateCursData {
  nom: string;
  codi: string;
  centreId: string;
}

export interface UpdateCursData {
  nom?: string;
  codi?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface CursFilters extends PaginationParams {
  search?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  centreId?: string;
}

export interface CursStatistics {
  assignatures: {
    total: number;
    actives: number;
  };
  professors: {
    total: number;
    actius: number;
  };
  alumnes: {
    total: number;
    actius: number;
  };
}

export const cursosService = {
  // Obtenir llistat de cursos
  getCursos: async (filters?: CursFilters): Promise<ApiResponse<Curs[]>> => {
    return apiService.get<Curs[]>('/cursos', filters);
  },

  // Obtenir curs per ID
  getCurs: async (id: string): Promise<ApiResponse<Curs>> => {
    return apiService.get<Curs>(`/cursos/${id}`);
  },

  // Crear nou curs
  createCurs: async (data: CreateCursData): Promise<ApiResponse<Curs>> => {
    return apiService.post<Curs>('/cursos', data);
  },

  // Actualitzar curs
  updateCurs: async (id: string, data: UpdateCursData): Promise<ApiResponse<Curs>> => {
    return apiService.put<Curs>(`/cursos/${id}`, data);
  },

  // Eliminar curs
  deleteCurs: async (id: string): Promise<ApiResponse<void>> => {
    return apiService.delete<void>(`/cursos/${id}`);
  },

  // Obtenir estadístiques del curs
  getCursStatistics: async (id: string): Promise<ApiResponse<{ curs: Curs; estadistiques: CursStatistics }>> => {
    return apiService.get<{ curs: Curs; estadistiques: CursStatistics }>(`/cursos/${id}/estadistiques`);
  },
};

export default cursosService;
