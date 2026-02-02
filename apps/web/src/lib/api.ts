import axios, { AxiosError, AxiosInstance } from 'axios';
import { CreateRecipeRequest } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && originalRequest) {
          try {
            const newToken = await this.refreshToken();
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.client(originalRequest);
            }
          } catch {
            this.clearTokens();
            window.location.href = '/auth/login';
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }

  private async refreshToken(): Promise<string | null> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return null;

    const response = await this.client.post('/auth/refresh', { refreshToken });
    const { accessToken } = response.data;
    localStorage.setItem('accessToken', accessToken);
    return accessToken;
  }

  private clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  // Auth
  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', { email, password });
    const { accessToken, refreshToken } = response.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    return response.data;
  }

  async register(data: { email: string; password: string; name: string }) {
    return this.client.post('/auth/register', data);
  }

  async logout() {
    this.clearTokens();
  }

  async getMe() {
    return this.client.get('/auth/me');
  }

  // Recipes
  async getRecipes(params?: { page?: number; limit?: number; category?: string }) {
    return this.client.get('/recipes', { params });
  }

  async getRecipe(id: string) {
    return this.client.get(`/recipes/${id}`);
  }

  async createRecipe(data: Partial<CreateRecipeRequest>) {
    return this.client.post('/recipes', data);
  }

  async updateRecipe(id: string, data: Partial<CreateRecipeRequest>) {
    return this.client.patch(`/recipes/${id}`, data);
  }

  async deleteRecipe(id: string) {
    return this.client.delete(`/recipes/${id}`);
  }

  async likeRecipe(id: string) {
    return this.client.post(`/recipes/${id}/like`);
  }

  async unlikeRecipe(id: string) {
    return this.client.delete(`/recipes/${id}/like`);
  }

  // Upload
  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.client.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
}

export const api = new ApiClient();
