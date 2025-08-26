import axios, { AxiosError, AxiosInstance } from 'axios';
import { AuthResponse, RefreshResponse, User, LoginCredentials, RegisterData, ChangePasswordRequest } from '@/types/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class AuthService {
  private client: AxiosInstance;
  private interceptorId: number | null = null;
  private isRefreshing = false;
  private refreshQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: { 'Content-Type': 'application/json' },
      withCredentials: false,
    });

    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest: any = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.refreshQueue.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return this.client(originalRequest);
              })
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const newToken = await this.performTokenRefresh();
            this.processRefreshQueue(null, newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            this.processRefreshQueue(refreshError as any, '');
            this.clearTokens();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private processRefreshQueue(error: any, token: string) {
    this.refreshQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
    this.refreshQueue = [];
  }

  private clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await this.client.post<AuthResponse>('/auth/login', credentials);
    return data;
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/auth/logout', { refreshToken: localStorage.getItem('refreshToken') });
    } catch (e) {
      // ignore
    }
    this.clearTokens();
  }

  async register(payload: RegisterData): Promise<{ user: User }> {
    const { data } = await this.client.post<{ user: User }>('/auth/register', payload);
    return data;
  }

  async verifyToken(): Promise<User | null> {
    try {
      const { data } = await this.client.get<{ user: User }>('/auth/verify');
      return data.user;
    } catch {
      return null;
    }
  }

  async refreshToken(): Promise<RefreshResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    const { data } = await this.client.post<RefreshResponse>('/auth/refresh', { refreshToken });
    return data;
  }

  private async performTokenRefresh(): Promise<string> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token available');
    const { data } = await this.client.post<RefreshResponse>('/auth/refresh', { refreshToken });
    localStorage.setItem('accessToken', data.accessToken);
    if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
    return data.accessToken;
  }

  setupAuthInterceptor(_onRefresh: () => void | Promise<void>) {
    // The response interceptor already handles token refresh; expose an id for removal if needed
    // Returning -1 to indicate not used
    this.interceptorId = -1;
    return this.interceptorId;
  }

  removeAuthInterceptor(_id: number) {
    // no-op because we added interceptors in constructor
  }

  async changePassword(payload: ChangePasswordRequest) {
    await this.client.post('/auth/change-password', payload);
  }
}

export const authService = new AuthService();
