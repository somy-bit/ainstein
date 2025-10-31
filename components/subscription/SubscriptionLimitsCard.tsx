import React from 'react';
import { SubscriptionPlan } from '../../types';
import { useTranslations } from '../../hooks/useTranslations';

interface SubscriptionLimitsCardProps {
  subscription: SubscriptionPlan;
}

const ProgressBar: React.FC<{ current: number; limit: number; label: string }> = ({ current, limit, label }) => {
  const percentage = limit > 0 ? Math.min((current / limit) * 100, 100) : 0;
  const isNearLimit = percentage > 80;
  const isAtLimit = percentage >= 100;
  
  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-600">{label}</span>
        <span className={`font-medium ${isAtLimit ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-slate-800'}`}>
          {current.toLocaleString()} / {limit.toLocaleString()}
        </span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${
            isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-yellow-500' : 'bg-green-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {isAtLimit && (
        <p className="text-xs text-red-600 mt-1">Limit reached! Upgrade to continue.</p>
      )}
      {isNearLimit && !isAtLimit && (
        <p className="text-xs text-yellow-600 mt-1">Approaching limit. Consider upgrading.</p>
      )}
    </div>
  );
};

const SubscriptionLimitsCard: React.FC<SubscriptionLimitsCardProps> = ({ subscription }) => {
  const t = useTranslations();
  const { features, usage, planName, status, remainingTrialDays } = subscription;

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-800">Usage & Limits</h3>
        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
          status === 'Trial' ? 'bg-blue-100 text-blue-800' :
          status === 'Active' ? 'bg-green-100 text-green-800' :
          status === 'Expired' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {planName} - {status}
        </span>
      </div>

      {status === 'Trial' && remainingTrialDays !== undefined && (
        <div className={`mb-4 p-3 rounded-lg ${
          remainingTrialDays <= 3 ? 'bg-red-50 border border-red-200' :
          remainingTrialDays <= 7 ? 'bg-yellow-50 border border-yellow-200' :
          'bg-blue-50 border border-blue-200'
        }`}>
          <p className={`text-sm font-medium ${
            remainingTrialDays <= 3 ? 'text-red-800' :
            remainingTrialDays <= 7 ? 'text-yellow-800' :
            'text-blue-800'
          }`}>
            {remainingTrialDays > 0 
              ? `Trial expires in ${remainingTrialDays} day${remainingTrialDays !== 1 ? 's' : ''}`
              : 'Trial expired'
            }
          </p>
        </div>
      )}

      <div className="space-y-4">
        <ProgressBar 
          current={usage.partners?.current || 0}
          limit={features.partners?.limit || 0}
          label="Partners"
        />
        
        <ProgressBar 
          current={usage.textTokens?.current || 0}
          limit={features.textTokens?.limit || 0}
          label="AI Text Tokens"
        />
        
        <ProgressBar 
          current={usage.speechToTextMinutes?.current || 0}
          limit={features.speechToTextMinutes?.limit || 0}
          label="Speech-to-Text Minutes"
        />
        
        <ProgressBar 
          current={usage.storageGB?.current || 0}
          limit={features.storageGB?.limit || 0}
          label="Storage (GB)"
        />
      </div>

      {(status === 'Expired' || remainingTrialDays === 0) && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800 font-medium">
            Your subscription has expired. Upgrade now to continue using all features.
          </p>
        </div>
      )}
    </div>
  );
};

export default SubscriptionLimitsCard;
