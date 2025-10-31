import React, { useState, useEffect } from 'react';
import { PlanTemplate } from '../../types';
import * as api from '../../services/backendApiService';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';

interface PlanManagementProps {
  onRefresh?: () => void;
}

const PlanManagement: React.FC<PlanManagementProps> = ({ onRefresh }) => {
  const [plans, setPlans] = useState<PlanTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<PlanTemplate | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    billingCycle: 'Monthly' as 'Monthly' | 'Annual',
    trialDays: 0,
    stripePriceId: '',
    features: {
      partnerManagers: { limit: 1 },
      admins: { limit: 1 },
      partners: { limit: 10 },
      textTokens: { limit: 10000 },
      speechToTextMinutes: { limit: 60 },
      storageGB: { limit: 1 }
    },
    overageCosts: {
      additionalPartner: 10,
      textTokensPer1k: 0.01,
      speechToTextPerMinute: 0.05,
      storagePerGB: 2
    }
  });

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const data = await fetch('http://localhost:3001/api/v1/plan-templates').then(res => res.json());
      setPlans(data);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPlan) {
        await fetch(`http://localhost:3001/api/v1/plan-templates/${editingPlan.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        await fetch('http://localhost:3001/api/v1/plan-templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }
      await fetchPlans();
      setShowForm(false);
      setEditingPlan(null);
      resetForm();
      onRefresh?.();
    } catch (error) {
      console.error('Failed to save plan:', error);
    }
  };

  const handleEdit = (plan: PlanTemplate) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      price: plan.price,
      billingCycle: plan.billingCycle,
      trialDays: plan.trialDays,
      stripePriceId: plan.stripePriceId || '',
      features: plan.features,
      overageCosts: plan.overageCosts
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this plan?')) {
      try {
        await fetch(`http://localhost:3001/api/v1/plan-templates/${id}`, {
          method: 'DELETE',
        });
        await fetchPlans();
        onRefresh?.();
      } catch (error) {
        console.error('Failed to delete plan:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: 0,
      billingCycle: 'Monthly',
      trialDays: 0,
      stripePriceId: '',
      features: {
        partnerManagers: { limit: 1 },
        admins: { limit: 1 },
        partners: { limit: 10 },
        textTokens: { limit: 10000 },
        speechToTextMinutes: { limit: 60 },
        storageGB: { limit: 1 }
      },
      overageCosts: {
        additionalPartner: 10,
        textTokensPer1k: 0.01,
        speechToTextPerMinute: 0.05,
        storagePerGB: 2
      }
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Plan Management</h2>
        <Button
          onClick={() => {
            resetForm();
            setEditingPlan(null);
            setShowForm(true);
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Add New Plan
        </Button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">
            {editingPlan ? 'Edit Plan' : 'Create New Plan'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Plan Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Billing Cycle</label>
                <select
                  value={formData.billingCycle}
                  onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value as 'Monthly' | 'Annual' })}
                  className="w-full p-2 border rounded"
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Annual">Annual</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Trial Days</label>
                <input
                  type="number"
                  value={formData.trialDays}
                  onChange={(e) => setFormData({ ...formData, trialDays: parseInt(e.target.value) })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Stripe Price ID</label>
                <input
                  type="text"
                  value={formData.stripePriceId}
                  onChange={(e) => setFormData({ ...formData, stripePriceId: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="price_xxxxxxxxxxxxx"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Partners Limit</label>
                <input
                  type="number"
                  value={formData.features.partners.limit}
                  onChange={(e) => setFormData({
                    ...formData,
                    features: { ...formData.features, partners: { limit: parseInt(e.target.value) } }
                  })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Admins Limit</label>
                <input
                  type="number"
                  value={formData.features.admins.limit}
                  onChange={(e) => setFormData({
                    ...formData,
                    features: { ...formData.features, admins: { limit: parseInt(e.target.value) } }
                  })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Storage GB</label>
                <input
                  type="number"
                  value={formData.features.storageGB.limit}
                  onChange={(e) => setFormData({
                    ...formData,
                    features: { ...formData.features, storageGB: { limit: parseInt(e.target.value) } }
                  })}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                {editingPlan ? 'Update' : 'Create'} Plan
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingPlan(null);
                  resetForm();
                }}
                className="bg-gray-500 hover:bg-gray-600"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Price</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Cycle</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Trial Days</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Stripe ID</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {plans.map((plan) => (
              <tr key={plan.id}>
                <td className="px-4 py-3 text-sm text-gray-900">{plan.name}</td>
                <td className="px-4 py-3 text-sm text-gray-900">${plan.price}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{plan.billingCycle}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{plan.trialDays}</td>
                <td className="px-4 py-3 text-sm text-gray-900 font-mono text-xs">
                  {plan.stripePriceId || 'Not set'}
                </td>
                <td className="flex flex-row text-sm space-x-2">
                  <div
                    onClick={() => handleEdit(plan)}
                    className="text-blue-600 cursor-pointer hover:text-blue-700 text-xs px-2 py-1"
                  >
                    Edit
                  </div>
                  <div
                    onClick={() => handleDelete(plan.id)}
                    className="text-red-600 cursor-pointer hover:text-red-700 text-xs px-2 py-1"
                  >
                    Delete
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlanManagement;
