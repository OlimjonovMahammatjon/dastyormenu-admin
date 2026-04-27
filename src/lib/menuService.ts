// ─── Menu Service ─────────────────────────────────────────────────────────────

import { apiClient, ApiResponse } from './api';
import { PaginatedResponse } from './apiTypes';
import { Menu } from './types';

export interface CreateMenuRequest {
  organization: string;
  category: string;
  name: string;
  description?: string;
  image_url?: File | string;
  price: number; // tiyin
  cook_time_minutes: number;
  ingredients?: string;
  is_available?: boolean;
  sort_order?: number;
}

export interface UpdateMenuRequest {
  category?: string;
  name?: string;
  description?: string;
  image_url?: File | string;
  price?: number; // tiyin
  cook_time_minutes?: number;
  ingredients?: string;
  is_available?: boolean;
  sort_order?: number;
}

class MenuService {
  /**
   * Get all menus (handles paginated response)
   */
  async getMenus(): Promise<ApiResponse<Menu[]>> {
    const response = await apiClient.get<PaginatedResponse<Menu>>('/api/menu/');
    
    if (response.success && response.data) {
      // Extract results from paginated response
      return {
        success: true,
        data: response.data.results,
      };
    }
    
    return response as ApiResponse<Menu[]>;
  }

  /**
   * Create new menu item
   */
  async createMenu(data: CreateMenuRequest): Promise<ApiResponse<Menu>> {
    const formData = new FormData();
    
    formData.append('organization', data.organization);
    formData.append('category', data.category);
    formData.append('name', data.name);
    formData.append('price', data.price.toString());
    formData.append('cook_time_minutes', data.cook_time_minutes.toString());
    
    if (data.description) formData.append('description', data.description);
    if (data.ingredients) formData.append('ingredients', data.ingredients);
    if (data.is_available !== undefined) formData.append('is_available', data.is_available.toString());
    if (data.sort_order !== undefined) formData.append('sort_order', data.sort_order.toString());
    
    // Handle image upload
    if (data.image_url instanceof File) {
      formData.append('image_url', data.image_url);
    } else if (typeof data.image_url === 'string' && data.image_url) {
      formData.append('image_url', data.image_url);
    }

    console.log('🔵 Creating menu with FormData:', {
      organization: data.organization,
      category: data.category,
      name: data.name,
      price: data.price,
      cook_time_minutes: data.cook_time_minutes,
      has_image: !!data.image_url,
    });

    return apiClient.post('/api/menu/', formData);
  }

  /**
   * Update menu item
   */
  async updateMenu(id: string, data: UpdateMenuRequest): Promise<ApiResponse<Menu>> {
    const formData = new FormData();
    
    if (data.category) formData.append('category', data.category);
    if (data.name) formData.append('name', data.name);
    if (data.description !== undefined) formData.append('description', data.description);
    if (data.price !== undefined) formData.append('price', data.price.toString());
    if (data.cook_time_minutes !== undefined) formData.append('cook_time_minutes', data.cook_time_minutes.toString());
    if (data.ingredients !== undefined) formData.append('ingredients', data.ingredients);
    if (data.is_available !== undefined) formData.append('is_available', data.is_available.toString());
    if (data.sort_order !== undefined) formData.append('sort_order', data.sort_order.toString());
    
    // Handle image upload
    if (data.image_url instanceof File) {
      formData.append('image_url', data.image_url);
    } else if (typeof data.image_url === 'string' && data.image_url) {
      formData.append('image_url', data.image_url);
    }

    return apiClient.patch(`/api/menu/${id}/`, formData);
  }

  /**
   * Delete menu item
   */
  async deleteMenu(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/api/menu/${id}/`);
  }

  /**
   * Toggle menu availability
   */
  async toggleAvailability(id: string, isAvailable: boolean): Promise<ApiResponse<Menu>> {
    const formData = new FormData();
    formData.append('is_available', (!isAvailable).toString());

    return apiClient.patch(`/api/menu/${id}/`, formData);
  }
}

export const menuService = new MenuService();
