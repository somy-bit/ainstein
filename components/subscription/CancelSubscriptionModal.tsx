import React, { useState } from 'react';
import Button from '../common/Button';

interface CancelSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => Promise<void>;
  endsAt?: string;
}

const CancelSubscriptionModal: React.FC<CancelSubscriptionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  endsAt
}) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(reason || undefined);
      onClose();
    } catch (error) {
      console.error('Cancellation failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Cancel Subscription</h3>
        
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800">
            Your subscription will remain active until {endsAt ? new Date(endsAt).toLocaleDateString() : 'the end of your billing period'}.
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Reason for cancellation (optional)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-md"
            rows={3}
            placeholder="Help us improve by sharing why you're cancelling..."
          />
        </div>

        <div className="flex space-x-3">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1"
          >
            Keep Subscription
          </Button>
          <Button
            variant="danger"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? 'Cancelling...' : 'Cancel Subscription'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CancelSubscriptionModal;
