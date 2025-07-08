import { Order, MenuItem, Staff, Customer, Notification } from '../contexts/AppContext';

export const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    customerName: 'John Doe',
    customerPhone: '+1234567890',
    items: [
      { id: '1', name: 'Burger Deluxe', quantity: 2, price: 15.99 },
      { id: '2', name: 'Fries', quantity: 1, price: 4.99 }
    ],
    status: 'pending',
    total: 36.97,
    timestamp: new Date().toISOString(),
    deliveryType: 'delivery',
    paymentStatus: 'paid',
    notes: 'No onions please'
  },
  {
    id: 'ORD-002',
    customerName: 'Jane Smith',
    customerPhone: '+1987654321',
    items: [
      { id: '3', name: 'Caesar Salad', quantity: 1, price: 12.99 },
      { id: '4', name: 'Iced Tea', quantity: 2, price: 3.99 }
    ],
    status: 'cooking',
    total: 20.97,
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    deliveryType: 'pickup',
    paymentStatus: 'paid'
  },
  {
    id: 'ORD-003',
    customerName: 'Mike Johnson',
    customerPhone: '+1122334455',
    items: [
      { id: '5', name: 'Pizza Margherita', quantity: 1, price: 18.99 },
      { id: '6', name: 'Garlic Bread', quantity: 1, price: 5.99 }
    ],
    status: 'ready',
    total: 24.98,
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    deliveryType: 'pickup',
    paymentStatus: 'paid'
  },
  {
    id: 'ORD-004',
    customerName: 'Sarah Wilson',
    customerPhone: '+1555666777',
    items: [
      { id: '7', name: 'Chicken Tacos', quantity: 3, price: 8.99 },
      { id: '8', name: 'Guacamole', quantity: 1, price: 4.99 }
    ],
    status: 'delivered',
    total: 31.96,
    timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    deliveryType: 'delivery',
    paymentStatus: 'paid'
  }
];

export const mockMenuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Burger Deluxe',
    price: 15.99,
    category: 'Main Course',
    description: 'Juicy beef patty with lettuce, tomato, cheese, and special sauce',
    allergens: ['gluten', 'dairy'],
    available: true,
    preparationTime: 15
  },
  {
    id: '2',
    name: 'Fries',
    price: 4.99,
    category: 'Starters',
    description: 'Crispy golden French fries with sea salt',
    allergens: [],
    available: true,
    preparationTime: 8
  },
  {
    id: '3',
    name: 'Caesar Salad',
    price: 12.99,
    category: 'Starters',
    description: 'Fresh romaine lettuce with Caesar dressing and croutons',
    allergens: ['gluten', 'dairy'],
    available: true,
    preparationTime: 10
  },
  {
    id: '4',
    name: 'Iced Tea',
    price: 3.99,
    category: 'Beverages',
    description: 'Refreshing iced tea with lemon',
    allergens: [],
    available: true,
    preparationTime: 2
  },
  {
    id: '5',
    name: 'Pizza Margherita',
    price: 18.99,
    category: 'Main Course',
    description: 'Classic pizza with tomato sauce, mozzarella, and fresh basil',
    allergens: ['gluten', 'dairy'],
    available: true,
    preparationTime: 20
  },
  {
    id: '6',
    name: 'Garlic Bread',
    price: 5.99,
    category: 'Starters',
    description: 'Toasted bread with garlic butter and herbs',
    allergens: ['gluten', 'dairy'],
    available: true,
    preparationTime: 5
  },
  {
    id: '7',
    name: 'Chicken Tacos',
    price: 8.99,
    category: 'Main Course',
    description: 'Soft tacos with grilled chicken, lettuce, and salsa',
    allergens: ['gluten'],
    available: true,
    preparationTime: 12
  },
  {
    id: '8',
    name: 'Guacamole',
    price: 4.99,
    category: 'Starters',
    description: 'Fresh avocado dip with lime and cilantro',
    allergens: [],
    available: true,
    preparationTime: 5
  },
  {
    id: '9',
    name: 'Chocolate Cake',
    price: 6.99,
    category: 'Desserts',
    description: 'Rich chocolate cake with chocolate frosting',
    allergens: ['gluten', 'dairy', 'eggs'],
    available: true,
    preparationTime: 3
  },
  {
    id: '10',
    name: 'Coffee',
    price: 2.99,
    category: 'Beverages',
    description: 'Freshly brewed coffee',
    allergens: [],
    available: true,
    preparationTime: 3
  }
];

export const mockStaff: Staff[] = [
  {
    id: '1',
    name: 'Chef Marco',
    phone: '+1234567890',
    role: 'chef',
    status: 'active',
    schedule: '8:00 AM - 4:00 PM',
    permissions: ['view_orders', 'edit_menu'],
    tasksToday: 5
  },
  {
    id: '2',
    name: 'Maria Rodriguez',
    phone: '+1987654321',
    role: 'waiter',
    status: 'active',
    schedule: '2:00 PM - 10:00 PM',
    permissions: ['view_orders'],
    tasksToday: 8
  },
  {
    id: '3',
    name: 'David Park',
    phone: '+1122334455',
    role: 'delivery',
    status: 'active',
    schedule: '10:00 AM - 6:00 PM',
    permissions: ['view_orders'],
    tasksToday: 12
  },
  {
    id: '4',
    name: 'Lisa Chen',
    phone: '+1555666777',
    role: 'manager',
    status: 'active',
    schedule: '9:00 AM - 5:00 PM',
    permissions: ['view_orders', 'edit_menu', 'view_reports', 'manage_staff'],
    tasksToday: 3
  }
];

export const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'John Doe',
    phone: '+1234567890',
    email: 'john@example.com',
    totalOrders: 15,
    lastOrder: new Date().toISOString(),
    tier: 'vip',
    blocked: false,
    favoriteItems: ['1', '2']
  },
  {
    id: '2',
    name: 'Jane Smith',
    phone: '+1987654321',
    email: 'jane@example.com',
    totalOrders: 8,
    lastOrder: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    tier: 'regular',
    blocked: false,
    favoriteItems: ['3', '4']
  },
  {
    id: '3',
    name: 'Mike Johnson',
    phone: '+1122334455',
    totalOrders: 23,
    lastOrder: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    tier: 'vip',
    blocked: false,
    favoriteItems: ['5', '6']
  }
];

export const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'order',
    message: 'New order #ORD-001 received',
    timestamp: new Date().toISOString(),
    read: false,
    actionable: true
  },
  {
    id: '2',
    type: 'payment',
    message: 'Payment confirmed for order #ORD-002',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    read: false,
    actionable: false
  },
  {
    id: '3',
    type: 'kitchen',
    message: 'Order #ORD-003 is ready for pickup',
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    read: true,
    actionable: true
  }
];

export const mockChartData = [
  { time: '08:00', orders: 5 },
  { time: '09:00', orders: 8 },
  { time: '10:00', orders: 12 },
  { time: '11:00', orders: 15 },
  { time: '12:00', orders: 25 },
  { time: '13:00', orders: 22 },
  { time: '14:00', orders: 18 },
  { time: '15:00', orders: 14 },
  { time: '16:00', orders: 16 },
  { time: '17:00', orders: 20 },
  { time: '18:00', orders: 28 },
  { time: '19:00', orders: 24 },
  { time: '20:00', orders: 19 },
  { time: '21:00', orders: 12 },
  { time: '22:00', orders: 8 }
];