import { useState, useEffect, useCallback } from 'react';
import { Menu, Category } from '../lib/types';
import { useAuthStore } from '../store/authStore';
import { mockMenus, mockCategories } from '../lib/mockData';

let localMenus = [...mockMenus];
let localCategories = [...mockCategories];

export function useMenu() {
  const { organization } = useAuthStore();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!organization) return;
    setLoading(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const menusWithCategory = localMenus.map(menu => ({
        ...menu,
        category: localCategories.find(c => c.id === menu.category_id),
      }));

      setMenus(menusWithCategory);
      setCategories(localCategories);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  }, [organization]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const toggleAvailability = async (menuId: string, current: boolean): Promise<string | null> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const index = localMenus.findIndex(m => m.id === menuId);
    if (index !== -1) {
      localMenus[index] = { ...localMenus[index], is_available: !current };
      setMenus(prev => prev.map(m => m.id === menuId ? { ...m, is_available: !current } : m));
    }
    return null;
  };

  const deleteMenu = async (menuId: string): Promise<string | null> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    localMenus = localMenus.filter(m => m.id !== menuId);
    setMenus(prev => prev.filter(m => m.id !== menuId));
    return null;
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    // Mock image URL
    return `https://via.placeholder.com/400x300?text=${encodeURIComponent(file.name)}`;
  };

  return { menus, categories, loading, error, refetch: fetchAll, toggleAvailability, deleteMenu, uploadImage };
}
