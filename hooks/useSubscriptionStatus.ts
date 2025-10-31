import { useState, useEffect } from 'react';
import { getSubscriptionStatus } from '../services/backendApiService';
import { SubscriptionPlan, getErrorMessage } from '../types';

interface SubscriptionStatus {
  hasAccess: boolean;
  reason?: string;
  subscription?: SubscriptionPlan;
  loading: boolean;
  error?: string;
}

export const useSubscriptionStatus = () => {
  const [status, setStatus] = useState<SubscriptionStatus>({
    hasAccess: true,
    loading: true
  });

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const result = await getSubscriptionStatus();
        setStatus({
          hasAccess: result.access.hasAccess,
          reason: result.access.reason,
          subscription: result.subscription,
          loading: false
        });
      } catch (error) {
        setStatus({
          hasAccess: false,
          error: getErrorMessage(error),
          loading: false
        });
      }
    };

    checkStatus();
  }, []);

  return status;
};
