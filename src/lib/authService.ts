// ─── Auth Service ─────────────────────────────────────────────────────────────

import { apiClient, ApiResponse } from './api';
import { LoginResponse, RefreshTokenResponse, MeResponse } from './apiTypes';
import { UserProfile, Organization } from './types';

export interface LoginRequest {
  login: string;
  password: string;
}

class AuthService {
  /**
   * Login with username/email and password
   */
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    
    if (response.success && response.data) {
      // Save token to localStorage
      localStorage.setItem('dastyor_token', response.data.token);
      
      // Save user and organization data
      localStorage.setItem('dastyor_auth', JSON.stringify({
        user: response.data.user,
        organization: response.data.organization,
      }));
    }
    
    return response;
  }

  /**
   * Logout and clear all auth data
   */
  async logout(): Promise<void> {
    try {
      // Call logout endpoint (optional, for server-side cleanup)
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Ignore errors on logout
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage
      this.clearAuthData();
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<ApiResponse<RefreshTokenResponse>> {
    const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh');
    
    if (response.success && response.data) {
      localStorage.setItem('dastyor_token', response.data.token);
    }
    
    return response;
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<ApiResponse<MeResponse>> {
    return apiClient.get('/auth/me');
  }

  /**
   * Verify if user is authenticated
   */
  async verifyAuth(): Promise<boolean> {
    const token = this.getToken();
    if (!token) return false;

    const response = await this.getCurrentUser();
    
    if (response.success && response.data) {
      // Update stored user data
      localStorage.setItem('dastyor_auth', JSON.stringify({
        user: response.data.user,
        organization: response.data.organization,
      }));
      return true;
    }
    
    // Token is invalid, clear auth data
    this.clearAuthData();
    return false;
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    return localStorage.getItem('dastyor_token');
  }

  /**
   * Get stored user and organization data
   */
  getStoredAuth(): { user: UserProfile; organization: Organization } | null {
    try {
      const stored = localStorage.getItem('dastyor_auth');
      if (!stored) return null;
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }

  /**
   * Clear all auth data from storage
   */
  clearAuthData(): void {
    localStorage.removeItem('dastyor_token');
    localStorage.removeItem('dastyor_auth');
  }

  /**
   * Check if user is authenticated (has token)
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();
