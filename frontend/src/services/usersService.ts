import apiService, { ApiResponse, PaginationParams } from './apiService';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'SUPERADMIN' | 'ADMIN_CENTRE' | 'ADMIN_CURS';
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED';
  emailVerified: boolean;
  lastLogin?: string;
  centreId?: string;
  cursId?: string;
  createdAt: string;
  updatedAt: string;
  centre?: {
    id: string;
    nom: string;
    codi: string;
  };
  curs?: {
    id: string;
    nom: string;
    codi: string;
  };
}

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'SUPERADMIN' | 'ADMIN_CENTRE' | 'ADMIN_CURS';
  centreId?: string;
  cursId?: string;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  role?: 'SUPERADMIN' | 'ADMIN_CENTRE' | 'ADMIN_CURS';
  status?: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED';
  centreId?: string;
  cursId?: string;
}

export interface UserFilters extends PaginationParams {
  search?: string;
  role?: 'SUPERADMIN' | 'ADMIN_CENTRE' | 'ADMIN_CURS';
  status?: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED';
  centreId?: string;
}

export const usersService = {
  // Obtenir llistat d'usuaris
  getUsers: async (filters?: UserFilters): Promise<ApiResponse<User[]>> => {
    return apiService.get<User[]>('/users', filters);
  },

  // Obtenir usuari per ID
  getUser: async (id: string): Promise<ApiResponse<User>> => {
    return apiService.get<User>(`/users/${id}`);
  },

  // Crear nou usuari
  createUser: async (data: CreateUserData): Promise<ApiResponse<User>> => {
    return apiService.post<User>('/users', data);
  },

  // Actualitzar usuari
  updateUser: async (id: string, data: UpdateUserData): Promise<ApiResponse<User>> => {
    return apiService.put<User>(`/users/${id}`, data);
  },

  // Eliminar usuari
  deleteUser: async (id: string): Promise<ApiResponse<void>> => {
    return apiService.delete<void>(`/users/${id}`);
  },
};

export default usersService;
