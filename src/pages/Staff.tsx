import React, { useState } from 'react';
import { Plus, Edit, Trash2, User, Phone, Clock, CheckCircle, XCircle } from 'lucide-react';
import Header from '../components/Layout/Header';
import Button from '../components/UI/Button';
import StatusBadge from '../components/UI/StatusBadge';
import { useApp } from '../contexts/AppContext';

const Staff: React.FC = () => {
  const { state, dispatch } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    role: 'waiter' as 'chef' | 'delivery' | 'waiter' | 'manager',
    schedule: '',
    permissions: [] as string[]
  });

  const roleOptions = [
    { value: 'chef', label: 'Chef' },
    { value: 'waiter', label: 'Waiter' },
    { value: 'delivery', label: 'Delivery' },
    { value: 'manager', label: 'Manager' }
  ];

  const permissionOptions = [
    { id: 'view_orders', label: 'View Orders' },
    { id: 'edit_menu', label: 'Edit Menu' },
    { id: 'view_reports', label: 'View Reports' },
    { id: 'manage_staff', label: 'Manage Staff' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const staffData = {
      id: editingStaff || Date.now().toString(),
      name: formData.name,
      phone: formData.phone,
      role: formData.role,
      schedule: formData.schedule,
      permissions: formData.permissions,
      status: 'active' as 'active' | 'inactive',
      tasksToday: 0
    };

    if (editingStaff) {
      dispatch({
        type: 'UPDATE_STAFF',
        payload: { id: editingStaff, updates: staffData }
      });
    } else {
      dispatch({
        type: 'ADD_STAFF',
        payload: staffData
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      role: 'waiter',
      schedule: '',
      permissions: []
    });
    setShowAddForm(false);
    setEditingStaff(null);
  };

  const handleEdit = (staff: any) => {
    setFormData({
      name: staff.name,
      phone: staff.phone,
      role: staff.role,
      schedule: staff.schedule,
      permissions: staff.permissions
    });
    setEditingStaff(staff.id);
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this staff member?')) {
      dispatch({ type: 'DELETE_STAFF', payload: id });
    }
  };

  const toggleStatus = (id: string, status: 'active' | 'inactive') => {
    dispatch({
      type: 'UPDATE_STAFF',
      payload: { id, updates: { status } }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Staff Management" />
      
      <div className="p-4 lg:p-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-gray-600">
            {state.staff.length} staff members • {state.staff.filter(s => s.status === 'active').length} active
          </div>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setShowAddForm(true)}
          >
            Add Staff
          </Button>
        </div>

        {/* Staff Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {state.staff.map((staff) => (
            <div key={staff.id} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <User size={20} className="text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{staff.name}</h3>
                    <p className="text-sm text-gray-600 capitalize">{staff.role}</p>
                  </div>
                </div>
                <StatusBadge status={staff.status} />
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone size={14} />
                  <span>{staff.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock size={14} />
                  <span>{staff.schedule}</span>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{staff.tasksToday}</span> tasks today
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1">Permissions:</p>
                <div className="flex flex-wrap gap-1">
                  {staff.permissions.map((permission) => (
                    <span key={permission} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {permission.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={Edit}
                  onClick={() => handleEdit(staff)}
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  icon={staff.status === 'active' ? XCircle : CheckCircle}
                  onClick={() => toggleStatus(staff.id, staff.status === 'active' ? 'inactive' : 'active')}
                >
                  {staff.status === 'active' ? 'Deactivate' : 'Activate'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  icon={Trash2}
                  onClick={() => handleDelete(staff.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>

        {state.staff.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">
              <User size={48} />
            </div>
            <p className="text-gray-600">No staff members found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingStaff ? 'Edit Staff Member' : 'Add Staff Member'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role *
                  </label>
                  <select
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value as any})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {roleOptions.map(role => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Work Schedule *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., 9:00 AM - 5:00 PM"
                    value={formData.schedule}
                    onChange={(e) => setFormData({...formData, schedule: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Permissions
                  </label>
                  <div className="space-y-2">
                    {permissionOptions.map(permission => (
                      <label key={permission.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(permission.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                permissions: [...formData.permissions, permission.id]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                permissions: formData.permissions.filter(p => p !== permission.id)
                              });
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">{permission.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                  >
                    {editingStaff ? 'Update Staff' : 'Add Staff'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    fullWidth
                    onClick={resetForm}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Staff;