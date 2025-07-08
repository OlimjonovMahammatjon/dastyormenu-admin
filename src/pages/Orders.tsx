import React, { useState } from 'react';
import { Eye, Edit, Trash2, Phone, MapPin, Clock } from 'lucide-react';
import Header from '../components/Layout/Header';
import StatusBadge from '../components/UI/StatusBadge';
import Button from '../components/UI/Button';
import { useApp } from '../contexts/AppContext';

const Orders: React.FC = () => {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'cooking' | 'ready' | 'delivered' | 'cancelled'>('all');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  const tabs = [
    { id: 'all', label: 'All', count: state.orders.length },
    { id: 'pending', label: 'Pending', count: state.orders.filter(o => o.status === 'pending').length },
    { id: 'cooking', label: 'Cooking', count: state.orders.filter(o => o.status === 'cooking').length },
    { id: 'ready', label: 'Ready', count: state.orders.filter(o => o.status === 'ready').length },
    { id: 'delivered', label: 'Delivered', count: state.orders.filter(o => o.status === 'delivered').length },
    { id: 'cancelled', label: 'Cancelled', count: state.orders.filter(o => o.status === 'cancelled').length }
  ];

  const filteredOrders = activeTab === 'all' 
    ? state.orders 
    : state.orders.filter(order => order.status === activeTab);

  const handleStatusChange = (orderId: string, newStatus: string) => {
    dispatch({
      type: 'UPDATE_ORDER',
      payload: { id: orderId, updates: { status: newStatus as any } }
    });
  };

  const selectedOrderData = state.orders.find(order => order.id === selectedOrder);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Orders" />
      
      <div className="p-4 lg:p-6">
        {/* Tabs */}
        <div className="bg-white rounded-lg border border-gray-200 p-1 mb-6">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 min-w-0 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="block truncate">{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Grid */}
        <div className="grid gap-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-gray-900">{order.id}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>{new Date(order.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin size={14} />
                      <span className="capitalize">{order.deliveryType}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-gray-900">${order.total.toFixed(2)}</p>
                  <StatusBadge status={order.paymentStatus} />
                </div>
              </div>

              <div className="border-t border-gray-200 pt-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-gray-400" />
                    <span className="font-medium text-gray-900">{order.customerName}</span>
                    <span className="text-gray-600">{order.customerPhone}</span>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 mb-3">
                  {order.items.map((item, index) => (
                    <span key={item.id}>
                      {item.quantity}x {item.name}
                      {index < order.items.length - 1 && ', '}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Eye}
                    onClick={() => setSelectedOrder(order.id)}
                  >
                    View Details
                  </Button>
                  
                  {order.status === 'pending' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleStatusChange(order.id, 'cooking')}
                    >
                      Start Cooking
                    </Button>
                  )}
                  
                  {order.status === 'cooking' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleStatusChange(order.id, 'ready')}
                    >
                      Mark Ready
                    </Button>
                  )}
                  
                  {order.status === 'ready' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleStatusChange(order.id, 'delivered')}
                    >
                      Mark Delivered
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">
              <ShoppingBag size={48} />
            </div>
            <p className="text-gray-600">No orders found</p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && selectedOrderData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{selectedOrderData.id}</span>
                  <StatusBadge status={selectedOrderData.status} />
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-medium text-gray-900 mb-2">Customer Information</h3>
                  <p className="text-gray-600">{selectedOrderData.customerName}</p>
                  <p className="text-gray-600">{selectedOrderData.customerPhone}</p>
                  <p className="text-gray-600 capitalize">{selectedOrderData.deliveryType}</p>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-medium text-gray-900 mb-2">Items</h3>
                  <div className="space-y-2">
                    {selectedOrderData.items.map((item) => (
                      <div key={item.id} className="flex justify-between">
                        <span className="text-gray-600">
                          {item.quantity}x {item.name}
                        </span>
                        <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedOrderData.notes && (
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="font-medium text-gray-900 mb-2">Notes</h3>
                    <p className="text-gray-600">{selectedOrderData.notes}</p>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-gray-900">${selectedOrderData.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-gray-600">Payment Status</span>
                    <StatusBadge status={selectedOrderData.paymentStatus} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;