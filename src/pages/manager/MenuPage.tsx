import React, { useState, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Switch from '@radix-ui/react-switch';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Pencil, Trash2, Upload, X, ImageIcon } from 'lucide-react';
import { useMenu } from '../../hooks/useMenu';
import { useToast } from '../../lib/toast';
import { Menu, Category, formatPrice, toTiyin } from '../../lib/types';
import { useAuthStore } from '../../store/authStore';
import { GridSkeleton } from '../../components/UI/LoadingSkeleton';
import Button from '../../components/UI/Button';
import { categoryService } from '../../lib/categoryService';
import { menuService } from '../../lib/menuService';

// ─── Form schema ──────────────────────────────────────────────────────────────
const menuSchema = z.object({
  name: z.string().min(1, "Taom nomini kiriting"),
  category_id: z.string().min(1, "Kategoriyani tanlang"),
  price_som: z.number({ invalid_type_error: "Narxni kiriting" }).min(1, "Narx 0 dan katta bo'lishi kerak"),
  description: z.string().optional(),
  ingredients: z.string().optional(),
  cook_time_minutes: z.number().min(1, "Pishirish vaqtini kiriting").default(15),
  is_available: z.boolean().default(true),
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
    if (!name.trim()) {
      toastError('Kategoriya nomini kiriting');
      return;
    }
    
    if (!orgId) {
      toastError('Organization ID topilmadi');
      return;
    }

    setSaving(true);
    console.log('🔵 Creating category:', { organization: orgId, name, icon });
    
    try {
      const response = await categoryService.createCategory({
        organization: orgId,
        name: name.trim(),
        icon: icon || '🍽️',
        sort_order: categories.length + 1,
        is_active: true,
      });

      if (response.success) {
        console.log('✅ Category created:', response.data);
        success('Kategoriya muvaffaqiyatli qo\'shildi');
        setName('');
        setIcon('🍽️');
        onRefetch();
      } else {
        console.error('❌ Category creation failed:', response.error);
        toastError(response.error?.message || 'Kategoriya qo\'shilmadi');
      }
    } catch (error) {
      console.error('❌ Category creation error:', error);
      toastError('Xatolik yuz berdi');
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm('Kategoriyani o\'chirib tashlashni xohlaysizmi?')) return;
    
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
              className="w-14 bg-[#0F0F0F] border border-[#2A2A2A] rounded-input px-2 py-2 text-center text-lg focus:outline-none focus:border-[#F59E0B]/50" 
            />
            <input 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="Kategoriya nomi" 
              className="flex-1 bg-[#0F0F0F] border border-[#2A2A2A] rounded-input px-3 py-2 text-sm text-[#FAFAFA] placeholder-[#A1A1AA]/50 focus:outline-none focus:border-[#F59E0B]/50" 
              onKeyDown={e => e.key === 'Enter' && addCategory()}
            />
            <Button onClick={addCategory} loading={saving} size="sm" icon={Plus}>Qo&apos;shish</Button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center justify-between py-2 px-3 bg-[#0F0F0F] rounded-btn">
                <span className="text-sm text-[#FAFAFA]">{cat.icon} {cat.name}</span>
                <button onClick={() => deleteCategory(cat.id)} className="text-[#A1A1AA] hover:text-red-400 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
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
    } : { cook_time_minutes: 15, is_available: true },
  });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadImage(file);
    if (url) {
      setImageUrl(url);
      setImageFile(file); // Store the actual file for upload
    } else {
      toastError('Rasm yuklanmadi');
    }
    setUploading(false);
  };

  const onSubmit = async (data: MenuFormData) => {
    if (!orgId) {
      toastError('Organization ID topilmadi');
      return;
    }

    console.log('🔵 Submitting menu:', data);
    
    try {
      if (editItem) {
        // Update existing menu
        const response = await menuService.updateMenu(editItem.id, {
          category: data.category_id,
          name: data.name,
          description: data.description || '',
          price: Math.round(data.price_som * 100), // Convert to tiyin
          cook_time_minutes: data.cook_time_minutes,
          ingredients: data.ingredients || '',
          is_available: data.is_available,
          image_url: imageFile || imageUrl || undefined,
        });

        if (response.success) {
          console.log('✅ Menu updated:', response.data);
          success('Taom yangilandi');
          reset();
          setImageUrl(null);
          setImageFile(null);
          onRefetch();
          onClose();
        } else {
          console.error('❌ Menu update failed:', response.error);
          toastError(response.error?.message || 'Taom yangilanmadi');
        }
      } else {
        // Create new menu
        const response = await menuService.createMenu({
          organization: orgId,
          category: data.category_id,
          name: data.name,
          description: data.description || '',
          price: Math.round(data.price_som * 100), // Convert to tiyin
          cook_time_minutes: data.cook_time_minutes,
          ingredients: data.ingredients || '',
          is_available: data.is_available,
          sort_order: 0,
          image_url: imageFile || undefined,
        });

        if (response.success) {
          console.log('✅ Menu created:', response.data);
          success('Taom qo\'shildi');
          reset();
          setImageUrl(null);
          setImageFile(null);
          onRefetch();
          onClose();
        } else {
          console.error('❌ Menu creation failed:', response.error);
          toastError(response.error?.message || 'Taom qo\'shilmadi');
        }
      }
    } catch (error) {
      console.error('❌ Menu submission error:', error);
      toastError('Xatolik yuz berdi');
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
            <div
              onClick={() => fileRef.current?.click()}
              className="relative h-40 bg-[#0F0F0F] border-2 border-dashed border-[#2A2A2A] rounded-card overflow-hidden cursor-pointer hover:border-[#F59E0B]/50 transition-colors flex items-center justify-center"
            >
              {imageUrl ? (
                <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  {uploading ? (
                    <div className="w-6 h-6 border-2 border-[#F59E0B] border-t-transparent rounded-full animate-spin mx-auto" />
                  ) : (
                    <>
                      <ImageIcon size={28} className="text-[#A1A1AA] mx-auto mb-2" />
                      <p className="text-xs text-[#A1A1AA]">Rasm yuklash uchun bosing</p>
                    </>
                  )}
                </div>
              )}
              {imageUrl && (
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); setImageUrl(null); }}
                  className="absolute top-2 right-2 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-white"
                >
                  <X size={12} />
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />

            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">Taom nomi *</label>
              <input 
                {...register('name')} 
                placeholder="Masalan: Osh, Lag'mon, Manti"
                className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-input px-3 py-2 text-sm text-[#FAFAFA] placeholder-[#A1A1AA]/40 focus:outline-none focus:border-[#F59E0B]/50" 
              />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </div>

            {/* Category + Price */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">Kategoriya *</label>
                <select {...register('category_id')} className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-input px-3 py-2 text-sm text-[#FAFAFA] focus:outline-none focus:border-[#F59E0B]/50">
                  <option value="">Kategoriyani tanlang</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
                {errors.category_id && <p className="text-red-400 text-xs mt-1">{errors.category_id.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">Narx (so'm) *</label>
                <input 
                  {...register('price_som', { valueAsNumber: true })} 
                  type="number" 
                  min="0" 
                  step="1000"
                  placeholder="25000"
                  className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-input px-3 py-2 text-sm text-[#FAFAFA] placeholder-[#A1A1AA]/40 focus:outline-none focus:border-[#F59E0B]/50" 
                />
                {errors.price_som && <p className="text-red-400 text-xs mt-1">{errors.price_som.message}</p>}
              </div>
            </div>

            {/* Cook time + Available */}
            <div className="grid grid-cols-2 gap-3 items-end">
              <div>
                <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">Pishish vaqti (min) *</label>
                <input {...register('cook_time_minutes', { valueAsNumber: true })} type="number" min="1" className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-input px-3 py-2 text-sm text-[#FAFAFA] focus:outline-none focus:border-[#F59E0B]/50" />
              </div>
              <div className="flex items-center justify-between bg-[#0F0F0F] border border-[#2A2A2A] rounded-input px-3 py-2">
                <span className="text-sm text-[#A1A1AA]">Mavjud</span>
                <Controller
                  control={control}
                  name="is_available"
                  render={({ field }) => (
                    <Switch.Root
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="w-9 h-5 bg-[#2A2A2A] rounded-full relative data-[state=checked]:bg-[#F59E0B] transition-colors"
                    >
                      <Switch.Thumb className="block w-4 h-4 bg-white rounded-full shadow translate-x-0.5 transition-transform data-[state=checked]:translate-x-4" />
                    </Switch.Root>
                  )}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">Tavsif</label>
              <textarea 
                {...register('description')} 
                rows={2} 
                placeholder="Taom haqida qisqacha ma'lumot"
                className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-input px-3 py-2 text-sm text-[#FAFAFA] placeholder-[#A1A1AA]/40 focus:outline-none focus:border-[#F59E0B]/50 resize-none" 
              />
            </div>

            {/* Ingredients */}
            <div>
              <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">Tarkibi</label>
              <textarea 
                {...register('ingredients')} 
                rows={2} 
                placeholder="Go'sht, sabzavot, ziravorlar..."
                className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-input px-3 py-2 text-sm text-[#FAFAFA] placeholder-[#A1A1AA]/40 focus:outline-none focus:border-[#F59E0B]/50 resize-none" 
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Dialog.Close asChild>
                <Button variant="outline" fullWidth type="button">Bekor qilish</Button>
              </Dialog.Close>
              <Button type="submit" fullWidth loading={isSubmitting}>
                {editItem ? 'O\'zgarishlarni saqlash' : 'Taom qo\'shish'}
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

  const handleDelete = async (id: string) => {
    if (!confirm('Taomni butunlay o\'chirib tashlashni xohlaysizmi?')) return;
    const err = await deleteMenu(id);
    if (err) toastError(err);
    else success('Taom muvaffaqiyatli o\'chirildi');
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
                  <img src={menu.image_url} alt={menu.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={32} className="text-[#2A2A2A]" />
                  </div>
                )}
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
                  >
                    <Pencil size={12} /> Tahrir
                  </button>
                  <button
                    onClick={() => handleDelete(menu.id)}
                    className="p-1.5 text-[#A1A1AA] hover:text-red-400 bg-[#2A2A2A] hover:bg-red-500/10 rounded-btn transition-colors"
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
