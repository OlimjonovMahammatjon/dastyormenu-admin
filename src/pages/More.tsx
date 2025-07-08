import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User2, Bell, Settings, ChevronRight } from 'lucide-react';
import Header from '../components/Layout/Header';

const More: React.FC = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      icon: User2,
      title: 'Customers',
      description: 'Manage customer profiles and orders',
      path: '/customers'
    },
    {
      icon: Bell,
      title: 'Notifications',
      description: 'View and manage notifications',
      path: '/notifications'
    },
    {
      icon: Settings,
      title: 'Settings',
      description: 'Configure app preferences',
      path: '/settings'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="More" />
      
      <div className="p-4 lg:p-6">
        <div className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="w-full bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <item.icon size={20} className="text-blue-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default More;