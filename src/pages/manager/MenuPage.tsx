import React, { useState, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Switch from '@radix-ui/react-switch';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Pencil, Trash2, Upload, X, ImageIcon } from 'lucide-react';
import { useMenu } from '../../hooks/useMenu';
import { useToast } from '../../lib/toast';
import { Menu, Category, formatPrice, toTiyin, getImageUrl } from '../../lib/types';
import { useAuthStore } from '../../store/authStore';
import { GridSkeleton } from '../../components/UI/LoadingSkeleton';
import Button from '../../components/UI/Button';
import { categoryService } from '../../lib/categoryService';
import { menuService } from '../../lib/menuService';

// ─── Form schema ──────────────────────────────────────────────────────────────
const menuSchema = z.object({
  name: z.string()
    .min(1, "Taom nomini kiriting")
    .min(2, "Taom nomi kamida 2 ta belgidan iborat bo'lishi kerak")
    .max(100, "Taom nomi 100 ta belgidan oshmasligi kerak"),
  category_id: z.string().min(1, "Kategoriyani tanlang"),
  price_som: z.number({ invalid_type_error: "Narxni kiriting" })
    .min(100, "Narx kamida 100 so'm bo'lishi kerak")
    .max(10000000, "Narx 10,000,000 so'mdan oshmasligi kerak"),
  description: z.string().max(500, "Tavsif 500 ta belgidan oshmasligi kerak").optional(),
  ingredients: z.string().max(500, "Tarkib 500 ta belgidan oshmasligi kerak").optional(),
  cook_time_minutes: z.number()
    .min(1, "Pishirish vaqti kamida 1 daqiqa bo'lishi kerak")
    .max(300, "Pishirish vaqti 300 daqiqadan oshmasligi kerak")
    .default(15),
  is_available: z.boolean().default(true),
  sort_order: z.number().optional(),
});

type MenuFormData = z.infer<typeof menuSchema>;

// ─── Category Modal ───────────────────────────────────────────────────────────
const CategoryModal: React.FC<{
  open: boolean;
  onClose: () => void;
  categories: Category[];
  orgId: string;
  onRefetch: () => void;
}> = ({ open, onClose, categories, orgId, onRefetch }) => {
  const { success, error: toastError } = useToast();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🍽️');
  const [saving, setSaving] = useState(false);

  const addCategory = async () => {
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      toastError('Kategoriya nomini kiriting');
      return;
    }

    if (trimmedName.length < 2) {
      toastError('Kategoriya nomi kamida 2 ta belgidan iborat bo\'lishi kerak');
      return;
    }

    if (trimmedName.length > 50) {
      toastError('Kategoriya nomi 50 ta belgidan oshmasligi kerak');
      return;
    }
    
    if (!orgId) {
      toastError('Organization ID topilmadi');
      return;
    }

    // Check if category already exists
    const exists = categories.some(c => c.name.toLowerCase() === trimmedName.toLowerCase());
    if (exists) {
      toastError('Bu nomli kategoriya allaqachon mavjud');
      return;
    }

    setSaving(true);
    console.log('🔵 Creating category:', { organization: orgId, name: trimmedName, icon });
    
    try {
      const response = await categoryService.createCategory({
        organization: orgId,
        name: trimmedName,
        icon: icon || '🍽️',
        sort_order: categories.length + 1,
        is_active: true,
      });

      if (response.success) {
        console.log('✅ Category created successfully:', response.data);
        success('Kategoriya muvaffaqiyatli qo\'shildi');
        setName('');
        setIcon('🍽️');
        onRefetch();
      } else {
        console.error('❌ Category creation failed:', response.error);
        toastError(response.error?.message || 'Kategoriya qo\'shilmadi. Iltimos, qayta urinib ko\'ring');
      }
    } catch (error) {
      console.error('❌ Category creation error:', error);
      toastError('Xatolik yuz berdi. Iltimos, qayta urinib ko\'ring');
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (id: string, name: string) => {
    if (!confirm(`"${name}" kategoriyasini o'chirib tashlashni xohlaysizmi?\n\nDiqqat: Bu kategoriyaga tegishli barcha taomlar ham o'chiriladi!`)) return;
    
    console.log('🔵 Deleting category:', id);
    
    try {
      const response = await categoryService.deleteCategory(id);
      
      if (response.success) {
        console.log('✅ Category deleted');
        success('Kategoriya o\'chirildi');
        onRefetch();
      } else {
        console.error('❌ Category deletion failed:', response.error);
        toastError(response.error?.message || 'Kategoriya o\'chirilmadi');
      }
    } catch (error) {
      console.error('❌ Category deletion error:', error);
      toastError('Xatolik yuz berdi');
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={v => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#1A1A1A] border border-[#2A2A2A] rounded-card p-6 z-50">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-base font-semibold text-[#FAFAFA]">Kategoriyalar</Dialog.Title>
            <Dialog.Close className="text-[#A1A1AA] hover:text-[#FAFAFA]"><X size={18} /></Dialog.Close>
          </div>

          <div className="flex gap-2 mb-4">
            <input 
              value={icon} 
              onChange={e => setIcon(e.target.value)} 
              placeholder="🍽️"
              maxLength={2}
              className="w-16 bg-[#0F0F0F] border border-[#2A2A2A] rounded-input px-2 py-2.5 text-center text-xl focus:outline-none focus:border-[#F59E0B]/50 transition-colors" 
              title="Emoji tanlang"
            />
            <input 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="Kategoriya nomi" 
              maxLength={50}
              className="flex-1 bg-[#0F0F0F] border border-[#2A2A2A] rounded-input px-3 py-2.5 text-sm text-[#FAFAFA] placeholder-[#A1A1AA]/50 focus:outline-none focus:border-[#F59E0B]/50 transition-colors" 
              onKeyDown={e => e.key === 'Enter' && !saving && addCategory()}
              disabled={saving}
            />
            <Button 
              onClick={addCategory} 
              loading={saving} 
              size="sm" 
              icon={Plus}
              disabled={saving || !name.trim()}
            >
              Qo&apos;shish
            </Button>
          </div>

          <p className="text-xs text-[#A1A1AA] mb-3">
            💡 Kategoriya nomi 2-50 belgi orasida bo'lishi kerak
          </p>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {categories.length === 0 ? (
              <div className="text-center py-8 text-[#A1A1AA]">
                <p className="text-sm">Kategoriyalar topilmadi</p>
              </div>
            ) : (
              categories.map(cat => (
                <div key={cat.id} className="flex items-center justify-between py-2 px-3 bg-[#0F0F0F] rounded-btn hover:bg-[#1A1A1A] transition-colors">
                  <span className="text-sm text-[#FAFAFA]">{cat.icon} {cat.name}</span>
                  <button 
                    onClick={() => deleteCategory(cat.id, cat.name)} 
                    className="text-[#A1A1AA] hover:text-red-400 transition-colors p-1"
                    title="Kategoriyani o'chirish"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

// ─── Menu Form Modal ──────────────────────────────────────────────────────────
const MenuFormModal: React.FC<{
  open: boolean;
  onClose: () => void;
  editItem?: Menu | null;
  categories: Category[];
  orgId: string;
  onRefetch: () => void;
  uploadImage: (file: File) => Promise<string | null>;
}> = ({ open, onClose, editItem, categories, orgId, onRefetch, uploadImage }) => {
  const { success, error: toastError } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(editItem?.image_url ?? null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<MenuFormData>({
    resolver: zodResolver(menuSchema),
    defaultValues: editItem ? {
      name: editItem.name,
      category_id: editItem.category_id,
      price_som: editItem.price / 100,
      description: editItem.description ?? '',
      ingredients: editItem.ingredients ?? '',
      cook_time_minutes: editItem.cook_time_minutes,
      is_available: editItem.is_available,
      sort_order: editItem.sort_order ?? 0,
    } : { 
      cook_time_minutes: 15, 
      is_available: true,
      sort_order: 0,
    },
  });

  // Reset form when editItem changes or modal opens
  React.useEffect(() => {
    if (open) {
      if (editItem) {
        const imageUrlToUse = getImageUrl(editItem.image_url);
        setImageUrl(imageUrlToUse);
        setImageFile(null);
        reset({
          name: editItem.name,
          category_id: editItem.category_id,
          price_som: editItem.price / 100,
          description: editItem.description ?? '',
          ingredients: editItem.ingredients ?? '',
          cook_time_minutes: editItem.cook_time_minutes,
          is_available: editItem.is_available,
          sort_order: editItem.sort_order ?? 0,
        });
      } else {
        setImageUrl(null);
        setImageFile(null);
        reset({ 
          name: '',
          category_id: '',
          price_som: undefined as any,
          description: '',
          ingredients: '',
          cook_time_minutes: 15, 
          is_available: true,
          sort_order: 0,
        });
      }
    }
  }, [editItem, open, reset]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toastError('Faqat JPG, PNG, GIF yoki WebP formatdagi rasmlar qabul qilinadi');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toastError('Rasm hajmi 5MB dan oshmasligi kerak');
      return;
    }

    console.log('📸 Image selected:', {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024).toFixed(2)} KB`,
    });

    setUploading(true);
    try {
      const url = await uploadImage(file);
      if (url) {
        setImageUrl(url);
        setImageFile(file);
        console.log('✅ Image preview ready:', url);
      } else {
        toastError('Rasm yuklanmadi');
      }
    } catch (error) {
      console.error('❌ Image upload error:', error);
      toastError('Rasm yuklashda xatolik');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: MenuFormData) => {
    if (!orgId) {
      toastError('Organization ID topilmadi');
      return;
    }

    // Validate image for new menu
    if (!editItem && !imageFile) {
      toastError('Iltimos, taom rasmini yuklang');
      return;
    }

    console.log('🔵 Submitting menu:', { 
      ...data, 
      editMode: !!editItem,
      hasImage: !!imageFile,
    });
    
    try {
      if (editItem) {
        // Update existing menu
        console.log('📝 Updating menu:', editItem.id);
        const response = await menuService.updateMenu(editItem.id, {
          category: data.category_id,
          name: data.name.trim(),
          description: data.description?.trim() || '',
          price: Math.round(data.price_som * 100), // Convert to tiyin
          cook_time_minutes: data.cook_time_minutes,
          ingredients: data.ingredients?.trim() || '',
          is_available: data.is_available,
          sort_order: data.sort_order,
          image: imageFile || undefined,
        });

        if (response.success) {
          console.log('✅ Menu updated successfully:', response.data);
          success('Taom muvaffaqiyatli yangilandi');
          reset();
          setImageUrl(null);
          setImageFile(null);
          onRefetch();
          onClose();
        } else {
          console.error('❌ Menu update failed:', response.error);
          toastError(response.error?.message || 'Taom yangilanmadi. Iltimos, qayta urinib ko\'ring');
        }
      } else {
        // Create new menu
        console.log('➕ Creating new menu with image file');
        const response = await menuService.createMenu({
          category: data.category_id,
          name: data.name.trim(),
          description: data.description?.trim() || '',
          price: Math.round(data.price_som * 100), // Convert to tiyin
          cook_time_minutes: data.cook_time_minutes,
          ingredients: data.ingredients?.trim() || '',
          is_available: data.is_available,
          sort_order: data.sort_order ?? 0,
          image: imageFile!, // Send actual file
        });

        if (response.success) {
          console.log('✅ Menu created successfully:', response.data);
          success('Taom muvaffaqiyatli qo\'shildi');
          reset();
          setImageUrl(null);
          setImageFile(null);
          onRefetch();
          onClose();
        } else {
          console.error('❌ Menu creation failed:', response.error);
          toastError(response.error?.message || 'Taom qo\'shilmadi. Iltimos, qayta urinib ko\'ring');
        }
      }
    } catch (error) {
      console.error('❌ Menu submission error:', error);
      toastError('Xatolik yuz berdi. Iltimos, qayta urinib ko\'ring');
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={v => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-[#1A1A1A] border border-[#2A2A2A] rounded-card p-6 z-50 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-5">
            <Dialog.Title className="text-base font-semibold text-[#FAFAFA]">
              {editItem ? 'Taomni tahrirlash' : 'Yangi taom qo\'shish'}
            </Dialog.Title>
            <Dialog.Close className="text-[#A1A1AA] hover:text-[#FAFAFA]"><X size={18} /></Dialog.Close>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Image upload */}
            <div>
              <label className="block text-xs font-medium text-[#A1A1AA] mb-2">
                Taom rasmi {!editItem && <span className="text-red-400">*</span>}
              </label>
              <div
                onClick={() => fileRef.current?.click()}
                className="relative h-48 bg-[#0F0F0F] border-2 border-dashed border-[#2A2A2A] rounded-card overflow-hidden cursor-pointer hover:border-[#F59E0B]/50 transition-colors flex items-center justify-center group"
              >
                {imageUrl ? (
                  <>
                    <img 
                      src={imageUrl} 
                      alt="preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('❌ Image preview error:', imageUrl);
                        // Fallback to placeholder
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-center">
                        <Upload size={32} className="text-white mx-auto mb-2" />
                        <p className="text-xs text-white font-medium">Rasmni o'zgartirish</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6">
                    {uploading ? (
                      <>
                        <div className="w-8 h-8 border-2 border-[#F59E0B] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-xs text-[#A1A1AA]">Rasm yuklanmoqda...</p>
                      </>
                    ) : (
                      <>
                        <ImageIcon size={40} className="text-[#A1A1AA] mx-auto mb-3" />
                        <p className="text-sm font-medium text-[#FAFAFA] mb-1">Rasm yuklash</p>
                        <p className="text-xs text-[#A1A1AA] mb-2">JPG, PNG, GIF yoki WebP</p>
                        <p className="text-xs text-[#A1A1AA]/70">Maksimal hajm: 5MB</p>
                      </>
                    )}
                  </div>
                )}
                {imageUrl && (
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); setImageUrl(null); setImageFile(null); }}
                    className="absolute top-3 right-3 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors z-10 shadow-lg"
                    title="Rasmni o'chirish"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <input 
                ref={fileRef} 
                type="file" 
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp" 
                className="hidden" 
                onChange={handleImageChange} 
              />
              {!editItem && !imageFile && (
                <p className="text-xs text-[#A1A1AA] mt-1.5">
                  💡 Taom rasmini yuklash majburiy
                </p>
              )}
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                Taom nomi <span className="text-red-400">*</span>
              </label>
              <input 
                {...register('name')} 
                placeholder="Masalan: Osh, Lag'mon, Manti"
                className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-input px-3 py-2.5 text-sm text-[#FAFAFA] placeholder-[#A1A1AA]/40 focus:outline-none focus:border-[#F59E0B]/50 transition-colors" 
                maxLength={100}
              />
              {errors.name && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">⚠️ {errors.name.message}</p>}
            </div>

            {/* Category + Price */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                  Kategoriya <span className="text-red-400">*</span>
                </label>
                <select 
                  {...register('category_id')} 
                  className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-input px-3 py-2.5 text-sm text-[#FAFAFA] focus:outline-none focus:border-[#F59E0B]/50 transition-colors"
                >
                  <option value="">Tanlang</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
                {errors.category_id && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">⚠️ {errors.category_id.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                  Narx (so'm) <span className="text-red-400">*</span>
                </label>
                <input 
                  {...register('price_som', { valueAsNumber: true })} 
                  type="number" 
                  min="100" 
                  step="1000"
                  placeholder="25000"
                  className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-input px-3 py-2.5 text-sm text-[#FAFAFA] placeholder-[#A1A1AA]/40 focus:outline-none focus:border-[#F59E0B]/50 transition-colors" 
                />
                {errors.price_som && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">⚠️ {errors.price_som.message}</p>}
              </div>
            </div>

            {/* Cook time + Available */}
            <div className="grid grid-cols-2 gap-3 items-end">
              <div>
                <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                  Pishirish vaqti (daqiqa) <span className="text-red-400">*</span>
                </label>
                <input 
                  {...register('cook_time_minutes', { valueAsNumber: true })} 
                  type="number" 
                  min="1" 
                  max="300"
                  placeholder="15"
                  className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-input px-3 py-2.5 text-sm text-[#FAFAFA] placeholder-[#A1A1AA]/40 focus:outline-none focus:border-[#F59E0B]/50 transition-colors" 
                />
                {errors.cook_time_minutes && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">⚠️ {errors.cook_time_minutes.message}</p>}
              </div>
              <div className="flex items-center justify-between bg-[#0F0F0F] border border-[#2A2A2A] rounded-input px-3 py-2.5">
                <span className="text-sm text-[#FAFAFA] font-medium">Mavjud</span>
                <Controller
                  control={control}
                  name="is_available"
                  render={({ field }) => (
                    <Switch.Root
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="w-10 h-5 bg-[#2A2A2A] rounded-full relative data-[state=checked]:bg-[#F59E0B] transition-colors"
                    >
                      <Switch.Thumb className="block w-4 h-4 bg-white rounded-full shadow translate-x-0.5 transition-transform data-[state=checked]:translate-x-5" />
                    </Switch.Root>
                  )}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                Tavsif
                <span className="text-[#A1A1AA]/60 ml-1">(ixtiyoriy)</span>
              </label>
              <textarea 
                {...register('description')} 
                rows={3} 
                placeholder="Taom haqida qisqacha ma'lumot..."
                maxLength={500}
                className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-input px-3 py-2.5 text-sm text-[#FAFAFA] placeholder-[#A1A1AA]/40 focus:outline-none focus:border-[#F59E0B]/50 resize-none transition-colors" 
              />
              {errors.description && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">⚠️ {errors.description.message}</p>}
            </div>

            {/* Ingredients */}
            <div>
              <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                Tarkibi
                <span className="text-[#A1A1AA]/60 ml-1">(ixtiyoriy)</span>
              </label>
              <textarea 
                {...register('ingredients')} 
                rows={3} 
                placeholder="Go'sht, sabzavot, ziravorlar..."
                maxLength={500}
                className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-input px-3 py-2.5 text-sm text-[#FAFAFA] placeholder-[#A1A1AA]/40 focus:outline-none focus:border-[#F59E0B]/50 resize-none transition-colors" 
              />
              {errors.ingredients && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">⚠️ {errors.ingredients.message}</p>}
            </div>

            <div className="flex gap-3 pt-3 border-t border-[#2A2A2A]">
              <Dialog.Close asChild>
                <Button 
                  variant="outline" 
                  fullWidth 
                  type="button"
                  disabled={isSubmitting}
                >
                  Bekor qilish
                </Button>
              </Dialog.Close>
              <Button 
                type="submit" 
                fullWidth 
                loading={isSubmitting}
                disabled={isSubmitting || uploading}
              >
                {editItem ? (
                  <>
                    {isSubmitting ? 'Saqlanmoqda...' : 'O\'zgarishlarni saqlash'}
                  </>
                ) : (
                  <>
                    {isSubmitting ? 'Qo\'shilmoqda...' : 'Taom qo\'shish'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const MenuPage: React.FC = () => {
  const { organization } = useAuthStore();
  const orgId = organization?.id ?? '';
  const { success, error: toastError } = useToast();
  const { menus, categories, loading, refetch, toggleAvailability, deleteMenu, uploadImage } = useMenu();

  const [activeCat, setActiveCat] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Menu | null>(null);
  const [showCatModal, setShowCatModal] = useState(false);

  const filtered = activeCat === 'all' ? menus : menus.filter(m => m.category_id === activeCat);
  const stopListCount = menus.filter(m => !m.is_available).length;

  const handleToggle = async (id: string, current: boolean) => {
    const err = await toggleAvailability(id, current);
    if (err) toastError(err);
    else success(current ? "Taom stop-listga qo'shildi" : "Taom yana mavjud qilindi");
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" taomini butunlay o'chirib tashlashni xohlaysizmi?\n\nBu amalni qaytarib bo'lmaydi!`)) return;
    
    console.log('🔵 Deleting menu:', id);
    const err = await deleteMenu(id);
    if (err) {
      console.error('❌ Menu deletion failed:', err);
      toastError(err);
    } else {
      console.log('✅ Menu deleted successfully');
      success('Taom muvaffaqiyatli o\'chirildi');
    }
  };

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Button icon={Plus} onClick={() => { setEditItem(null); setShowForm(true); }}>
            Yangi taom qo&apos;shish
          </Button>
          <Button variant="outline" onClick={() => setShowCatModal(true)}>
            Kategoriyalarni boshqarish
          </Button>
        </div>
        {stopListCount > 0 && (
          <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-full font-medium">
            Stop-list: {stopListCount} ta taom
          </span>
        )}
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveCat('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-btn whitespace-nowrap transition-all ${activeCat === 'all' ? 'bg-[#F59E0B] text-black' : 'bg-[#1A1A1A] border border-[#2A2A2A] text-[#A1A1AA] hover:text-[#FAFAFA]'}`}
        >
          Barchasi ({menus.length})
        </button>
        {categories.map(cat => {
          const count = menus.filter(m => m.category_id === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCat(cat.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-btn whitespace-nowrap transition-all ${activeCat === cat.id ? 'bg-[#F59E0B] text-black' : 'bg-[#1A1A1A] border border-[#2A2A2A] text-[#A1A1AA] hover:text-[#FAFAFA]'}`}
            >
              {cat.icon} {cat.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {loading ? (
        <GridSkeleton count={8} />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-[#A1A1AA]">
          <p className="text-4xl mb-3">🍽️</p>
          <p className="text-sm">Taomlar topilmadi</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(menu => (
            <div key={menu.id} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-card overflow-hidden hover:border-[#F59E0B]/30 transition-colors">
              {/* Image */}
              <div className="relative h-40 bg-[#0F0F0F]">
                {menu.image_url ? (
                  <img 
                    src={getImageUrl(menu.image_url) || ''} 
                    alt={menu.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('❌ Image load error:', menu.image_url);
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement?.querySelector('.fallback-icon')?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                {!menu.image_url && (
                  <div className="w-full h-full flex items-center justify-center fallback-icon">
                    <ImageIcon size={32} className="text-[#2A2A2A]" />
                  </div>
                )}
                <div className="w-full h-full flex items-center justify-center fallback-icon hidden">
                  <ImageIcon size={32} className="text-[#2A2A2A]" />
                </div>
                {!menu.is_available && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">STOP</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="text-sm font-medium text-[#FAFAFA] truncate mb-1">{menu.name}</p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-[#A1A1AA]">⏱ {menu.cook_time_minutes} min</span>
                  <span className="text-sm font-semibold text-[#F59E0B]">{formatPrice(menu.price)}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setEditItem(menu); setShowForm(true); }}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs bg-[#2A2A2A] hover:bg-[#3A3A3A] text-[#FAFAFA] rounded-btn transition-colors"
                    title="Taomni tahrirlash"
                  >
                    <Pencil size={12} /> Tahrir
                  </button>
                  <button
                    onClick={() => handleDelete(menu.id, menu.name)}
                    className="p-1.5 text-[#A1A1AA] hover:text-red-400 bg-[#2A2A2A] hover:bg-red-500/10 rounded-btn transition-colors"
                    title="Taomni o'chirish"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Toggle */}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#2A2A2A]">
                  <span className="text-xs text-[#A1A1AA]">{menu.is_available ? 'Mavjud' : 'Stop-list'}</span>
                  <Switch.Root
                    checked={menu.is_available}
                    onCheckedChange={() => handleToggle(menu.id, menu.is_available)}
                    className="w-8 h-4 bg-[#2A2A2A] rounded-full relative data-[state=checked]:bg-[#F59E0B] transition-colors"
                  >
                    <Switch.Thumb className="block w-3 h-3 bg-white rounded-full shadow translate-x-0.5 transition-transform data-[state=checked]:translate-x-4" />
                  </Switch.Root>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <MenuFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        editItem={editItem}
        categories={categories}
        orgId={orgId}
        onRefetch={refetch}
        uploadImage={uploadImage}
      />
      <CategoryModal
        open={showCatModal}
        onClose={() => setShowCatModal(false)}
        categories={categories}
        orgId={orgId}
        onRefetch={refetch}
      />
    </div>
  );
};

export default MenuPage;
