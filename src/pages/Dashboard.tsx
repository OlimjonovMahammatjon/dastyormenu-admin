import React, { useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  ShoppingBag, 
  Users, 
  DollarSign, 
  Clock, 
  Plus, 
  UserPlus,
  ClipboardList,
  TrendingUp
} from 'lucide-react';
import Header from '../components/Layout/Header';
import StatCard from '../components/UI/StatCard';
import StatusBadge from '../components/UI/StatusBadge';
import Button from '../components/UI/Button';
import { useApp } from '../contexts/AppContext';
import { mockOrders, mockMenuItems, mockStaff, mockCustomers, mockNotifications, mockChartData } from '../data/mockData';

const Dashboard: React.FC = () => {
  const { state, dispatch } = useApp();

  useEffect(() => {
    // Initialize mock data
    dispatch({ type: 'SET_ORDERS', payload: mockOrders });
    dispatch({ type: 'SET_MENU_ITEMS', payload: mockMenuItems });
    dispatch({ type: 'SET_STAFF', payload: mockStaff });
    dispatch({ type: 'SET_CUSTOMERS', payload: mockCustomers });
    dispatch({ type: 'SET_NOTIFICATIONS', payload: mockNotifications });
  }, [dispatch]);

  // Calculate stats
  const todayOrders = state.orders.filter(order => {
    const orderDate = new Date(order.timestamp);
    const today = new Date();
    return orderDate.toDateString() === today.toDateString();
  });

  const activeStaff = state.staff.filter(member => member.status === 'active');
  const pendingOrders = state.orders.filter(order => order.status === 'pending');
  const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
  const recentOrders = state.orders.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Dashboard" />
      
      <div className="p-4 lg:p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Today's Orders"
            value={todayOrders.length}
            icon={ShoppingBag}
            trend={{ value: '12%', isPositive: true }}
            color="blue"
          />
          <StatCard
            title="Active Staff"
            value={activeStaff.length}
            icon={Users}
            color="green"
          />
          <StatCard
            title="Today's Revenue"
            value={`$${todayRevenue.toFixed(2)}`}
            icon={DollarSign}
            trend={{ value: '8%', isPositive: true }}
            color="green"
          />
          <StatCard
            title="Pending Orders"
            value={pendingOrders.length}
            icon={Clock}
            color="yellow"
          />
        </div>

        {/* Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Orders Today</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <TrendingUp size={16} />
              <span>Last 24 hours</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="orders" 
                  stroke="#2563eb" 
                  strokeWidth={2}
                  dot={{ fill: '#2563eb' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders & Quick Actions */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Orders</h2>
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">{order.id}</span>
                      <StatusBadge status={order.status} />
                    </div>
                    <p className="text-sm text-gray-600">{order.customerName}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">${order.total.toFixed(2)}</p>
                    <p className="text-sm text-gray-500 capitalize">{order.deliveryType}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Button
                variant="primary"
                size="lg"
                icon={Plus}
                fullWidth
                onClick={() => {
                  // Navigate to add menu item
                }}
              >
                Add Menu Item
              </Button>
              <Button
                variant="outline"
                size="lg"
                icon={ClipboardList}
                fullWidth
                onClick={() => {
                  // Navigate to assign task
                }}
              >
                Assign Task
              </Button>
              <Button
                variant="outline"
                size="lg"
                icon={UserPlus}
                fullWidth
                onClick={() => {
                  // Navigate to add staff
                }}
              >
                Add Staff Member
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;