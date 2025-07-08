import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  ShoppingBag, 
  Menu, 
  Users, 
  Grid3X3,
  Bell,
  Settings,
  User2
} from 'lucide-react';

const Navigation: React.FC = () => {
  const location = useLocation();
  
  const mainNavItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/orders', icon: ShoppingBag, label: 'Orders' },
    { path: '/menu', icon: Menu, label: 'Menu' },
    { path: '/staff', icon: Users, label: 'Staff' },
    { path: '/more', icon: Grid3X3, label: 'More' }
  ];

  const moreNavItems = [
    { path: '/customers', icon: User2, label: 'Customers' },
    { path: '/notifications', icon: Bell, label: 'Notifications' },
    { path: '/settings', icon: Settings, label: 'Settings' }
  ];

  const isMorePage = location.pathname.includes('/customers') || 
                   location.pathname.includes('/notifications') || 
                   location.pathname.includes('/settings');

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex justify-around items-center py-2">
          {mainNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex flex-col items-center justify-center p-2 min-w-0 flex-1
                ${isActive || (item.path === '/more' && isMorePage) ? 'text-blue-600' : 'text-gray-500'}
              `}
            >
              <item.icon size={20} />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <nav className="hidden lg:block fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-40">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="text-xl font-bold text-gray-800">Dastyor</span>
          </div>
          
          <div className="space-y-2">
            {mainNavItems.slice(0, 4).map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                  ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}
                `}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
            
            <div className="pt-4 mt-4 border-t border-gray-200">
              <div className="text-xs font-medium text-gray-500 mb-2 px-3">MORE</div>
              {moreNavItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                    ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}
                  `}
                >
                  <item.icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navigation;