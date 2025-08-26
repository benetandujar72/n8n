import { useState, useEffect, createContext, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

import { authService } from '@/services/authService';
import { User, LoginCredentials, RegisterData } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  refreshToken: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthProvider = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  // Verificar token al carregar l'aplicació
  const { data: userData, isLoading: isVerifying } = useQuery({
    queryKey: ['auth', 'verify'],
    queryFn: authService.verifyToken,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minuts
  });

  // Mutacions
  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setUser(data.user);
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      toast.success('Sessió iniciada correctament');
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al iniciar sessió');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      toast.success('Sessió tancada correctament');
      queryClient.clear();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al tancar sessió');
    },
  });

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      toast.success('Usuari registrat correctament');
      // Opcional: iniciar sessió automàticament
      if (data.user) {
        setUser(data.user);
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al registrar usuari');
    },
  });

  const refreshMutation = useMutation({
    mutationFn: authService.refreshToken,
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
    },
    onError: () => {
      // Si falla el refresh, tancar sessió
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      queryClient.clear();
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: authService.changePassword,
    onSuccess: () => {
      toast.success('Contrasenya canviada correctament');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al canviar contrasenya');
    },
  });

  // Efectes
  useEffect(() => {
    if (!isVerifying) {
      if (userData) {
        setUser(userData);
      }
      setIsLoading(false);
    }
  }, [userData, isVerifying]);

  // Interceptor per refresh automàtic
  useEffect(() => {
    const interceptor = authService.setupAuthInterceptor(refreshMutation.mutate);
    return () => {
      authService.removeAuthInterceptor(interceptor);
    };
  }, [refreshMutation.mutate]);

  const login = async (credentials: LoginCredentials) => {
    await loginMutation.mutateAsync(credentials);
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  const register = async (data: RegisterData) => {
    await registerMutation.mutateAsync(data);
  };

  const refreshToken = async () => {
    await refreshMutation.mutateAsync();
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    await changePasswordMutation.mutateAsync({ currentPassword, newPassword });
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    register,
    refreshToken,
    changePassword,
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const authValue = useAuthProvider();

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};
