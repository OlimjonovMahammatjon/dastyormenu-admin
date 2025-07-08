import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Types
export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  status: 'pending' | 'cooking' | 'ready' | 'delivered' | 'cancelled';
  total: number;
  timestamp: string;
  deliveryType: 'pickup' | 'delivery';
  paymentStatus: 'pending' | 'paid' | 'failed';
  notes?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  allergens: string[];
  available: boolean;
  preparationTime: number;
  image?: string;
}

export interface Staff {
  id: string;
  name: string;
  phone: string;
  role: 'chef' | 'delivery' | 'waiter' | 'manager';
  status: 'active' | 'inactive';
  schedule: string;
  permissions: string[];
  avatar?: string;
  tasksToday: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  totalOrders: number;
  lastOrder: string;
  tier: 'regular' | 'vip';
  blocked: boolean;
  favoriteItems: string[];
}

export interface Notification {
  id: string;
  type: 'order' | 'payment' | 'kitchen' | 'staff';
  message: string;
  timestamp: string;
  read: boolean;
  actionable?: boolean;
}

export interface AppState {
  orders: Order[];
  menuItems: MenuItem[];
  staff: Staff[];
  customers: Customer[];
  notifications: Notification[];
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  settings: {
    businessName: string;
    currency: string;
    taxRate: number;
    operatingHours: {
      open: string;
      close: string;
    };
    notifications: {
      push: boolean;
      email: boolean;
      sms: boolean;
    };
  };
}

type AppAction = 
  | { type: 'SET_ORDERS'; payload: Order[] }
  | { type: 'ADD_ORDER'; payload: Order }
  | { type: 'UPDATE_ORDER'; payload: { id: string; updates: Partial<Order> } }
  | { type: 'DELETE_ORDER'; payload: string }
  | { type: 'SET_MENU_ITEMS'; payload: MenuItem[] }
  | { type: 'ADD_MENU_ITEM'; payload: MenuItem }
  | { type: 'UPDATE_MENU_ITEM'; payload: { id: string; updates: Partial<MenuItem> } }
  | { type: 'DELETE_MENU_ITEM'; payload: string }
  | { type: 'SET_STAFF'; payload: Staff[] }
  | { type: 'ADD_STAFF'; payload: Staff }
  | { type: 'UPDATE_STAFF'; payload: { id: string; updates: Partial<Staff> } }
  | { type: 'DELETE_STAFF'; payload: string }
  | { type: 'SET_CUSTOMERS'; payload: Customer[] }
  | { type: 'ADD_CUSTOMER'; payload: Customer }
  | { type: 'UPDATE_CUSTOMER'; payload: { id: string; updates: Partial<Customer> } }
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'SET_CURRENT_USER'; payload: AppState['currentUser'] }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppState['settings']> };

const initialState: AppState = {
  orders: [],
  menuItems: [],
  staff: [],
  customers: [],
  notifications: [],
  currentUser: null,
  settings: {
    businessName: 'Dastyor Restaurant',
    currency: 'USD',
    taxRate: 0.1,
    operatingHours: {
      open: '08:00',
      close: '22:00'
    },
    notifications: {
      push: true,
      email: true,
      sms: false
    }
  }
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_ORDERS':
      return { ...state, orders: action.payload };
    case 'ADD_ORDER':
      return { ...state, orders: [action.payload, ...state.orders] };
    case 'UPDATE_ORDER':
      return {
        ...state,
        orders: state.orders.map(order =>
          order.id === action.payload.id
            ? { ...order, ...action.payload.updates }
            : order
        )
      };
    case 'DELETE_ORDER':
      return {
        ...state,
        orders: state.orders.filter(order => order.id !== action.payload)
      };
    case 'SET_MENU_ITEMS':
      return { ...state, menuItems: action.payload };
    case 'ADD_MENU_ITEM':
      return { ...state, menuItems: [action.payload, ...state.menuItems] };
    case 'UPDATE_MENU_ITEM':
      return {
        ...state,
        menuItems: state.menuItems.map(item =>
          item.id === action.payload.id
            ? { ...item, ...action.payload.updates }
            : item
        )
      };
    case 'DELETE_MENU_ITEM':
      return {
        ...state,
        menuItems: state.menuItems.filter(item => item.id !== action.payload)
      };
    case 'SET_STAFF':
      return { ...state, staff: action.payload };
    case 'ADD_STAFF':
      return { ...state, staff: [action.payload, ...state.staff] };
    case 'UPDATE_STAFF':
      return {
        ...state,
        staff: state.staff.map(member =>
          member.id === action.payload.id
            ? { ...member, ...action.payload.updates }
            : member
        )
      };
    case 'DELETE_STAFF':
      return {
        ...state,
        staff: state.staff.filter(member => member.id !== action.payload)
      };
    case 'SET_CUSTOMERS':
      return { ...state, customers: action.payload };
    case 'ADD_CUSTOMER':
      return { ...state, customers: [action.payload, ...state.customers] };
    case 'UPDATE_CUSTOMER':
      return {
        ...state,
        customers: state.customers.map(customer =>
          customer.id === action.payload.id
            ? { ...customer, ...action.payload.updates }
            : customer
        )
      };
    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.payload, ...state.notifications] };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload
            ? { ...notification, read: true }
            : notification
        )
      };
    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};