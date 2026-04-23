import { Organization, UserProfile, Category, Menu, Table, Order, OrderItem } from './types';

// ─── Mock Organization ────────────────────────────────────────────────────────
export const mockOrganization: Organization = {
  id: 'org-1',
  name: 'Dastyor Test Restoran',
  logo_url: null,
  address: 'Toshkent sh., Chilonzor tumani',
  phone: '+998901234567',
  subscription_plan: 'pro',
  subscription_status: 'active',
  subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  trial_ends_at: null,
  monthly_price: 40000000,
};

// ─── Mock Users ───────────────────────────────────────────────────────────────
export const mockUsers: UserProfile[] = [
  {
    id: 'user-1',
    organization_id: 'org-1',
    full_name: 'Admin Adminov',
    role: 'manager',
    username: 'admin',
    email: 'admin@dastyor.uz',
    pin_code: '',
    is_active: true,
  },
  {
    id: 'user-2',
    organization_id: 'org-1',
    full_name: 'Aziz Oshpazov',
    role: 'chef',
    username: 'aziz_chef',
    pin_code: 'chef1234',
    is_active: true,
  },
  {
    id: 'user-3',
    organization_id: 'org-1',
    full_name: 'Jasur Karimov',
    role: 'waiter',
    username: 'jasur_waiter',
    pin_code: 'waiter123',
    is_active: true,
  },
];

// ─── Mock Categories ──────────────────────────────────────────────────────────
export const mockCategories: Category[] = [
  { id: 'cat-1', organization_id: 'org-1', name: 'Birinchi taomlar', icon: '🍲', sort_order: 1, is_active: true },
  { id: 'cat-2', organization_id: 'org-1', name: 'Ikkinchi taomlar', icon: '🍖', sort_order: 2, is_active: true },
  { id: 'cat-3', organization_id: 'org-1', name: 'Salatlar', icon: '🥗', sort_order: 3, is_active: true },
  { id: 'cat-4', organization_id: 'org-1', name: 'Ichimliklar', icon: '🥤', sort_order: 4, is_active: true },
  { id: 'cat-5', organization_id: 'org-1', name: 'Shirinliklar', icon: '🍰', sort_order: 5, is_active: true },
];

// ─── Mock Menus ───────────────────────────────────────────────────────────────
export const mockMenus: Menu[] = [
  { id: 'menu-1', organization_id: 'org-1', category_id: 'cat-1', name: 'Osh', description: 'An\'anaviy o\'zbek oshi', image_url: null, price: 2500000, cook_time_minutes: 30, ingredients: 'Guruch, go\'sht, sabzi, piyoz', is_available: true, sort_order: 1 },
  { id: 'menu-2', organization_id: 'org-1', category_id: 'cat-1', name: 'Lag\'mon', description: 'Qo\'l lag\'moni', image_url: null, price: 2000000, cook_time_minutes: 25, ingredients: 'Xamir, go\'sht, sabzavot', is_available: true, sort_order: 2 },
  { id: 'menu-3', organization_id: 'org-1', category_id: 'cat-1', name: 'Mastava', description: 'Guruch sho\'rvasi', image_url: null, price: 1800000, cook_time_minutes: 35, ingredients: 'Guruch, go\'sht, sabzavot', is_available: true, sort_order: 3 },
  { id: 'menu-4', organization_id: 'org-1', category_id: 'cat-2', name: 'Qo\'zi kabob', description: 'Qo\'y go\'shtidan kabob', image_url: null, price: 3500000, cook_time_minutes: 20, ingredients: 'Qo\'y go\'shti, piyoz', is_available: true, sort_order: 1 },
  { id: 'menu-5', organization_id: 'org-1', category_id: 'cat-2', name: 'Tovuq kabob', description: 'Tovuq go\'shtidan kabob', image_url: null, price: 2500000, cook_time_minutes: 15, ingredients: 'Tovuq go\'shti, piyoz', is_available: true, sort_order: 2 },
  { id: 'menu-6', organization_id: 'org-1', category_id: 'cat-2', name: 'Manti', description: 'Bug\'da pishirilgan', image_url: null, price: 2200000, cook_time_minutes: 30, ingredients: 'Xamir, go\'sht, piyoz', is_available: true, sort_order: 3 },
  { id: 'menu-7', organization_id: 'org-1', category_id: 'cat-3', name: 'Achichiq salat', description: 'Yangi sabzavotlar', image_url: null, price: 1200000, cook_time_minutes: 10, ingredients: 'Pomidor, bodring, piyoz', is_available: true, sort_order: 1 },
  { id: 'menu-8', organization_id: 'org-1', category_id: 'cat-3', name: 'Olivye', description: 'Klassik olivye', image_url: null, price: 1500000, cook_time_minutes: 10, ingredients: 'Kartoshka, tuxum, kolbasa', is_available: true, sort_order: 2 },
  { id: 'menu-9', organization_id: 'org-1', category_id: 'cat-4', name: 'Coca Cola', description: '0.5L', image_url: null, price: 800000, cook_time_minutes: 2, ingredients: null, is_available: true, sort_order: 1 },
  { id: 'menu-10', organization_id: 'org-1', category_id: 'cat-4', name: 'Choy', description: 'Qora yoki ko\'k', image_url: null, price: 500000, cook_time_minutes: 5, ingredients: null, is_available: true, sort_order: 2 },
  { id: 'menu-11', organization_id: 'org-1', category_id: 'cat-5', name: 'Tort', description: 'Shokoladli tort', image_url: null, price: 1800000, cook_time_minutes: 5, ingredients: null, is_available: true, sort_order: 1 },
];

// ─── Mock Tables ──────────────────────────────────────────────────────────────
export const mockTables: Table[] = Array.from({ length: 10 }, (_, i) => ({
  id: `table-${i + 1}`,
  organization_id: 'org-1',
  table_number: i + 1,
  qr_code_id: `qr-${i + 1}`,
  assigned_waiter_id: i % 2 === 0 ? 'user-3' : null,
  is_active: true,
}));

// ─── Mock Orders ──────────────────────────────────────────────────────────────
export const mockOrders: Order[] = [
  {
    id: 'order-1',
    organization_id: 'org-1',
    table_id: 'table-1',
    waiter_id: 'user-3',
    status: 'pending',
    total_amount: 4500000,
    tip_amount: 0,
    tip_percentage: 0,
    customer_note: 'Achchiq bo\'lmasin',
    created_at: new Date().toISOString(),
    completed_at: null,
  },
  {
    id: 'order-2',
    organization_id: 'org-1',
    table_id: 'table-3',
    waiter_id: 'user-3',
    status: 'cooking',
    total_amount: 3500000,
    tip_amount: 0,
    tip_percentage: 0,
    customer_note: null,
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    completed_at: null,
  },
  {
    id: 'order-3',
    organization_id: 'org-1',
    table_id: 'table-5',
    waiter_id: 'user-3',
    status: 'ready',
    total_amount: 2700000,
    tip_amount: 0,
    tip_percentage: 0,
    customer_note: null,
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    completed_at: null,
  },
];

export const mockOrderItems: OrderItem[] = [
  { id: 'item-1', order_id: 'order-1', menu_id: 'menu-1', menu_name: 'Osh', menu_price: 2500000, quantity: 1, modifications: null, item_status: 'pending' },
  { id: 'item-2', order_id: 'order-1', menu_id: 'menu-9', menu_name: 'Coca Cola', menu_price: 800000, quantity: 2, modifications: null, item_status: 'pending' },
  { id: 'item-3', order_id: 'order-2', menu_id: 'menu-4', menu_name: 'Qo\'zi kabob', menu_price: 3500000, quantity: 1, modifications: null, item_status: 'cooking' },
  { id: 'item-4', order_id: 'order-3', menu_id: 'menu-2', menu_name: 'Lag\'mon', menu_price: 2000000, quantity: 1, modifications: null, item_status: 'ready' },
  { id: 'item-5', order_id: 'order-3', menu_id: 'menu-10', menu_name: 'Choy', menu_price: 500000, quantity: 1, modifications: null, item_status: 'ready' },
];

// ─── Mock Credentials ─────────────────────────────────────────────────────────
export const mockCredentials = {
  email: 'admin@dastyor.uz',
  password: 'admin123',
};
