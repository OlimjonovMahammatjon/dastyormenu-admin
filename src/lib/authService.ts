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
    const response = await apiClient.post<any>('/api/auth/login/', credentials);
    
    if (response.success && response.data) {
      console.log('📦 Raw backend response:', response.data);
      
      // Handle nested user structure from backend
      const userData = response.data.user?.user || response.data.user;
      const organizationData = response.data.user?.organization || response.data.organization;
      
      console.log('👤 User data:', userData);
      console.log('🏢 Organization data:', organizationData);
      
      // Transform to expected format
      const transformedData: LoginResponse = {
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        user: {
          id: userData.id || response.data.user?.id,
          username: userData.username,
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          role: response.data.user?.role || 'manager',
          is_active: response.data.user?.is_active ?? true,
          created_at: response.data.user?.created_at,
          updated_at: response.data.user?.updated_at,
          full_name: response.data.user?.full_name || `${userData.first_name} ${userData.last_name}`,
        },
        organization: {
          id: typeof organizationData === 'string' ? organizationData : organizationData?.id,
          full_name: response.data.user?.full_name || `${userData.first_name} ${userData.last_name}`,
          role: response.data.user?.role || 'manager',
          is_active: response.data.user?.is_active ?? true,
          created_at: response.data.user?.created_at,
          updated_at: response.data.user?.updated_at,
        }
      };
      
      console.log('✅ Transformed data:', transformedData);
      
      // Save tokens to sessionStorage
      sessionStorage.setItem('dastyor_token', transformedData.access_token);
      sessionStorage.setItem('dastyor_refresh_token', transformedData.refresh_token);
      
      // Save user and organization data
      sessionStorage.setItem('dastyor_auth', JSON.stringify({
        user: transformedData.user,
        organization: transformedData.organization,
      }));
      
      console.log('💾 Data saved to sessionStorage');
      
      return {
        success: true,
        data: transformedData
      };
    }
    
    return response;
  }

  /**
   * Logout and clear all auth data
   */
  async logout(): Promise<void> {
    try {
      // Call logout endpoint (optional, for server-side cleanup)
      await apiClient.post('/api/auth/logout/');
    } catch (error) {
      // Ignore errors on logout
      console.error('Logout error:', error);
    } finally {
      // Always clear session storage
      this.clearAuthData();
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<ApiResponse<RefreshTokenResponse>> {
    const response = await apiClient.post<RefreshTokenResponse>('/api/auth/refresh/');
    
    if (response.success && response.data) {
      sessionStorage.setItem('dastyor_token', response.data.access_token);
    }
    
    return response;
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<ApiResponse<MeResponse>> {
    return apiClient.get('/api/auth/me/');
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
      sessionStorage.setItem('dastyor_auth', JSON.stringify({
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
    return sessionStorage.getItem('dastyor_token');
  }

  /**
   * Get stored user and organization data
   */
  getStoredAuth(): { user: UserProfile; organization: Organization } | null {
    try {
      const stored = sessionStorage.getItem('dastyor_auth');
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
    sessionStorage.removeItem('dastyor_token');
    sessionStorage.removeItem('dastyor_refresh_token');
    sessionStorage.removeItem('dastyor_auth');
    sessionStorage.removeItem('dastyor_saved_login');
  }

  /**
   * Check if user is authenticated (has token)
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();
