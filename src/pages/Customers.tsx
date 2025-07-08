import React, { useState } from 'react';
import { Search, Eye, Shield, ShieldOff } from 'lucide-react';
import Header from '../components/Layout/Header';
import StatusBadge from '../components/UI/StatusBadge';
import Button from '../components/UI/Button';
import { useApp } from '../contexts/AppContext';

const Customers: React.FC = () => {
  const { state, dispatch } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);

  const filteredCustomers = state.customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  const selectedCustomerData = state.customers.find(customer => customer.id === selectedCustomer);

  const toggleBlock = (customerId: string, blocked: boolean) => {
    dispatch({
      type: 'UPDATE_CUSTOMER',
      payload: { id: customerId, updates: { blocked } }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="Customers" 
        showSearch={true}
        onSearchChange={setSearchTerm}
      />
      
      <div className="p-4 lg:p-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{state.customers.length}</p>
            <p className="text-sm text-gray-600">Total Customers</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{state.customers.filter(c => c.tier === 'vip').length}</p>
            <p className="text-sm text-gray-600">VIP Customers</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{state.customers.filter(c => !c.blocked).length}</p>
            <p className="text-sm text-gray-600">Active</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{state.customers.filter(c => c.blocked).length}</p>
            <p className="text-sm text-gray-600">Blocked</p>
          </div>
        </div>

        {/* Customer List */}
        <div className="space-y-4">
          {filteredCustomers.map((customer) => (
            <div key={customer.id} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900">{customer.name}</h3>
                    <StatusBadge status={customer.tier} />
                    {customer.blocked && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                        Blocked
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{customer.phone}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{customer.totalOrders} orders</span>
                    <span>Last order: {new Date(customer.lastOrder).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Eye}
                    onClick={() => setSelectedCustomer(customer.id)}
                  >
                    View
                  </Button>
                  <Button
                    variant={customer.blocked ? "outline" : "danger"}
                    size="sm"
                    icon={customer.blocked ? Shield : ShieldOff}
                    onClick={() => toggleBlock(customer.id, !customer.blocked)}
                  >
                    {customer.blocked ? 'Unblock' : 'Block'}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">
              <Search size={48} />
            </div>
            <p className="text-gray-600">No customers found</p>
          </div>
        )}
      </div>

      {/* Customer Profile Modal */}
      {selectedCustomer && selectedCustomerData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Customer Profile</h2>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-xl font-bold text-gray-600">
                      {selectedCustomerData.name.charAt(0)}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{selectedCustomerData.name}</h3>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <StatusBadge status={selectedCustomerData.tier} />
                    {selectedCustomerData.blocked && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                        Blocked
                      </span>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                  <p className="text-gray-600">{selectedCustomerData.phone}</p>
                  {selectedCustomerData.email && (
                    <p className="text-gray-600">{selectedCustomerData.email}</p>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Order Statistics</h4>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{selectedCustomerData.totalOrders}</p>
                      <p className="text-sm text-gray-600">Total Orders</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">{selectedCustomerData.favoriteItems.length}</p>
                      <p className="text-sm text-gray-600">Favorite Items</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Last Order</h4>
                  <p className="text-gray-600">{new Date(selectedCustomerData.lastOrder).toLocaleString()}</p>
                </div>

                {selectedCustomerData.favoriteItems.length > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Favorite Items</h4>
                    <div className="space-y-2">
                      {selectedCustomerData.favoriteItems.map((itemId) => {
                        const item = state.menuItems.find(m => m.id === itemId);
                        return item ? (
                          <div key={itemId} className="flex justify-between items-center">
                            <span className="text-gray-700">{item.name}</span>
                            <span className="text-gray-500">${item.price.toFixed(2)}</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;