import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import { useApp } from '../../contexts/AppContext';

const Layout: React.FC = () => {
  const { state } = useApp();

  if (!state.currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="lg:ml-64 pb-16 lg:pb-0">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;