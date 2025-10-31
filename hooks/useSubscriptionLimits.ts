import { useState, useEffect } from 'react';
import { SubscriptionPlan } from '../types';
import { getSubscriptionForOrg } from '../services/backendApiService';

interface LimitStatus {
  canAddPartnerManagers: boolean;
  canAddAdmins: boolean;
  canAddPartners: boolean;
  partnerManagersUsed: number;
  partnerManagersLimit: number;
  adminsUsed: number;
  adminsLimit: number;
  partnersUsed: number;
  partnersLimit: number;
  subscription: SubscriptionPlan | null;
  loading: boolean;
  error: string | null;
}

export const useSubscriptionLimits = (organizationId: string): LimitStatus => {
  const [limitStatus, setLimitStatus] = useState<LimitStatus>({
    canAddPartnerManagers: true,
    canAddAdmins: true,
    canAddPartners: true,
    partnerManagersUsed: 0,
    partnerManagersLimit: 0,
    adminsUsed: 0,
    adminsLimit: 0,
    partnersUsed: 0,
    partnersLimit: 0,
    subscription: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const checkLimits = async () => {
      if (!organizationId) return;

      try {
        setLimitStatus(prev => ({ ...prev, loading: true, error: null }));
        
        const subscription = await getSubscriptionForOrg(organizationId);
        
        if (!subscription) {
          setLimitStatus(prev => ({ 
            ...prev, 
            loading: false, 
            error: 'No subscription found' 
          }));
          return;
        }

        // Get current usage from subscription
        const partnerManagersUsed = subscription.usage?.partnerManagers?.current || 0;
        const adminsUsed = subscription.usage?.admins?.current || 0;
        const partnersUsed = subscription.usage?.partners?.current || 0;

        // Get limits from subscription features
        const partnerManagersLimit = subscription.features?.partnerManagers?.limit || 0;
        const adminsLimit = subscription.features?.admins?.limit || 0;
        const partnersLimit = subscription.features?.partners?.limit || 0;

        setLimitStatus({
          canAddPartnerManagers: partnerManagersUsed < partnerManagersLimit,
          canAddAdmins: adminsUsed < adminsLimit,
          canAddPartners: partnersUsed < partnersLimit,
          partnerManagersUsed,
          partnerManagersLimit,
          adminsUsed,
          adminsLimit,
          partnersUsed,
          partnersLimit,
          subscription,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error('Error checking subscription limits:', error);
        setLimitStatus(prev => ({ 
          ...prev, 
          loading: false, 
          error: 'Failed to check subscription limits' 
        }));
      }
    };

    checkLimits();
  }, [organizationId]);

  return limitStatus;
};
