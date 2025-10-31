import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import { useTranslations } from '../../hooks/useTranslations';
import { getPlanTemplates } from '../../services/backendApiService';

interface PlanTemplate {
  id: string;
  name: string;
  price: number;
  billingCycle: 'Monthly' | 'Annual';
  features: {
    partners: { limit: number };
    textTokens: { limit: number };
    speechToTextMinutes: { limit: number };
    storageGB: { limit: number };
  };
}

interface PlanChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (planId: string) => void;
  currentPlan: string;
  isLoading: boolean;
}

const PlanChangeModal: React.FC<PlanChangeModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentPlan,
  isLoading
}) => {
  const t = useTranslations();
  const [plans, setPlans] = useState<PlanTemplate[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPlans();
    }
  }, [isOpen]);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const planData = await getPlanTemplates();
      setPlans(planData.filter((plan: PlanTemplate) => plan.name !== currentPlan));
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (selectedPlan) {
      onConfirm(selectedPlan);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Change Subscription Plan">
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          Select a new plan. Your current plan will remain active until the end of your billing period, 
          then automatically switch to the new plan.
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <strong>Current Plan:</strong> {currentPlan}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="space-y-3">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedPlan === plan.id
                    ? 'border-primary bg-primary/5'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">{plan.name}</h3>
                    <p className="text-sm text-slate-600">
                      ${plan.price}/{plan.billingCycle.toLowerCase()}
                    </p>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <div>Partners: {plan.features.partners.limit}</div>
                    <div>Storage: {plan.features.storageGB.limit}GB</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={!selectedPlan || isLoading}
          >
            {isLoading ? <LoadingSpinner size="sm" color="text-white" /> : 'Schedule Change'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PlanChangeModal;
