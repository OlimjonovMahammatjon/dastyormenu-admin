import React from 'react';

interface StatusBadgeProps {
  status: 'pending' | 'cooking' | 'ready' | 'delivered' | 'cancelled' | 'active' | 'inactive' | 'paid' | 'failed' | 'regular' | 'vip';
  size?: 'sm' | 'md';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' };
      case 'cooking':
        return { color: 'bg-blue-100 text-blue-800', text: 'Cooking' };
      case 'ready':
        return { color: 'bg-green-100 text-green-800', text: 'Ready' };
      case 'delivered':
        return { color: 'bg-gray-100 text-gray-800', text: 'Delivered' };
      case 'cancelled':
        return { color: 'bg-red-100 text-red-800', text: 'Cancelled' };
      case 'active':
        return { color: 'bg-green-100 text-green-800', text: 'Active' };
      case 'inactive':
        return { color: 'bg-gray-100 text-gray-800', text: 'Inactive' };
      case 'paid':
        return { color: 'bg-green-100 text-green-800', text: 'Paid' };
      case 'failed':
        return { color: 'bg-red-100 text-red-800', text: 'Failed' };
      case 'regular':
        return { color: 'bg-gray-100 text-gray-800', text: 'Regular' };
      case 'vip':
        return { color: 'bg-purple-100 text-purple-800', text: 'VIP' };
      default:
        return { color: 'bg-gray-100 text-gray-800', text: status };
    }
  };

  const config = getStatusConfig(status);
  const sizeClass = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span className={`inline-flex items-center ${sizeClass} font-medium rounded-full ${config.color}`}>
      {config.text}
    </span>
  );
};

export default StatusBadge;