import React from 'react';
import { useSubscriptionStatus } from '../../hooks/useSubscriptionStatus';
import LoadingSpinner from '../common/LoadingSpinner';
import Button from '../common/Button';

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({ children }) => {
  const { hasAccess, loading, reason, subscription } = useSubscriptionStatus();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          Subscription Required
        </h3>
        <p className="text-red-600 mb-4">
          {reason || 'Your subscription has expired or is inactive.'}
        </p>
        {subscription?.status === 'Cancelled' && subscription?.endsAt && (
          <p className="text-sm text-red-500 mb-4">
            Access ended on {new Date(subscription.endsAt).toLocaleDateString()}
          </p>
        )}
        <Button variant="primary">
          Renew Subscription
        </Button>
      </div>
    );
  }

  return <>{children}</>;
};

export default SubscriptionGuard;
