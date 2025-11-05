import React, { useState, useEffect, useCallback } from 'react';
import { SubscriptionPlan } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useTranslations } from '../hooks/useTranslations';
import { useApiWithToast } from '../hooks/useApiWithToast';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import CancelSubscriptionModal from '../components/subscription/CancelSubscriptionModal';
import PlanChangeModal from '../components/subscription/PlanChangeModal';

const ProgressBar: React.FC<{ value: number; max: number; colorClass?: string }> = ({ value, max, colorClass = 'bg-primary' }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    return (
        <div className="w-full bg-slate-200 rounded-full h-2.5">
            <div className={`${colorClass} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
        </div>
    );
};

const SubscriptionPage: React.FC = () => {
    const t = useTranslations();
    const { user } = useAuth();
    const api = useApiWithToast();
    const [subscription, setSubscription] = useState<SubscriptionPlan | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showPlanChangeModal, setShowPlanChangeModal] = useState(false);
    const [planChangeLoading, setPlanChangeLoading] = useState(false);

    const fetchData = useCallback(async () => {
        if (!user?.organizationId) {
            setLoading(false);
            setError("No organization context found.");
            return;
        };
        setLoading(true);
        setError(null);
        try {
            const subData = await api.getSubscriptionForOrg(user.organizationId);
            setSubscription(subData);
        } catch (err) {
            console.error("Failed to load subscription data", err);
            setError((err as Error).message || "Failed to load subscription data.");
        } finally {
            setLoading(false);
        }
    }, [user?.organizationId]);

    const handleManageBilling = async () => {
        try {
            const response = await api.createCustomerPortalSession();
            if (response.url) {
                window.location.href = response.url;
            }
        } catch (error) {
            console.error('Error opening billing portal:', error);
        }
    };

    const handleCancelSubscription = async (reason?: string) => {
        try {
            console.log('=== FRONTEND CANCEL HANDLER DEBUG ===');
            console.log('user object:', user);
            console.log('user?.organizationId:', user?.organizationId);
            console.log('typeof user?.organizationId:', typeof user?.organizationId);
            
            if (!user?.organizationId) {
                console.error('❌ No organizationId found in user object');
                throw new Error('Organization ID not available. Please refresh and try again.');
            }
            
            const data = {reason : reason, orgId : user.organizationId};
            console.log('✅ Prepared data:', data);
            
            const result = await api.cancelSubscription(data);
            console.log('✅ Cancel result:', result);
            
            setSubscription(prev => prev ? { ...prev, status: 'Cancelled', cancelledAt: new Date().toISOString(), endsAt: result.endsAt } : null);
        } catch (error) {
            console.error('❌ Cancel error:', error);
            throw error;
        }
    };

    const handlePlanChange = async (newPlanId: string) => {
        if (!user?.organizationId) {
            setError('Organization ID not available');
            return;
        }

        setPlanChangeLoading(true);
        try {
            await api.changePlan({ orgId: user.organizationId, newPlanId });
            setShowPlanChangeModal(false);
            fetchData(); // Refresh subscription data
        } catch (err) {
            console.error('Error changing plan:', err);
            setError((err as Error).message || 'Failed to change plan');
        } finally {
            setPlanChangeLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) {
        return <div className="flex justify-center items-center h-64"><LoadingSpinner size="lg" /></div>;
    }
    
     if (error) {
        return <div className="p-4 bg-red-100 text-red-700 rounded-md text-center">{error}</div>;
    }
    
    if (!subscription) {
        return <div className="p-4 bg-yellow-100 text-yellow-800 rounded-md">{t('noResultsFound')} for subscription.</div>;
    }
    
    const { planName, price, billingCycle, status, renewalDate, features, usage, paymentMethod, overageCosts, remainingTrialDays } = subscription;
    const isTrial = status === 'Trial';
    const daysLeft = remainingTrialDays !== undefined ? remainingTrialDays : Math.ceil((new Date(renewalDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    return (
        <div className="bg-slate-100 min-h-screen space-y-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">{t('subscriptionAndBilling')}</h1>

            {isTrial && daysLeft > 0 && (
                 <div className="bg-primary-light/20 border-l-4 border-primary-light text-primary-dark p-4 rounded-r-lg shadow-md">
                    <p className="font-bold">{t('planNameFreeTrial')}</p>
                    <p className="text-sm mt-1">{t('trialEndsIn', { days: daysLeft })}</p>
                </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Panel: Plan Status & Usage */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white shadow-lg rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-slate-700 mb-4">{t('currentPlanStatus')}</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                            <div>
                                <p className="text-sm text-slate-500">{t('plan')}</p>
                                <p className="text-lg font-bold text-primary">{t(`${planName.replace(' ', '')}`)}</p>
                            </div>
                             <div>
                                <p className="text-sm text-slate-500">{t('price')}</p>
                                <p className="text-lg font-bold text-slate-800">${price} <span className="text-xs font-normal">/{t(billingCycle.toLowerCase() as 'monthly' | 'annual')}</span></p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">{t('nextBillingDate')}</p>
                                <p className="text-lg font-bold text-slate-800">{new Date(renewalDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">{t('subscriptionStatus')}</p>
                                <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
                                    status === 'Active' || status === 'Trial' ? 'bg-green-100 text-green-800' : 
                                    status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {status}
                                </span>
                                {status === 'Cancelled' && subscription.endsAt && (
                                    <p className="text-xs text-slate-500 mt-1">
                                        Ends {new Date(subscription.endsAt).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">{t('includedAdmins')}</p>
                                <p className="text-lg font-bold text-slate-800">{features.admins.limit}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">{t('includedPartnerManagers')}</p>
                                <p className="text-lg font-bold text-slate-800">{features.partnerManagers.limit}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white shadow-lg rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-slate-700 mb-4">{t('usageMetrics')}</h2>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-slate-600">{t('activePartners')}</span>
                                    <span>{usage.partners.current} / {features.partners.limit}</span>
                                </div>
                                <ProgressBar value={usage.partners.current} max={features.partners.limit} />
                            </div>
                             <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-slate-600">{t('textTokensConsumed')}</span>
                                    <span>{usage.textTokens.current.toLocaleString()} / {features.textTokens.limit.toLocaleString()}</span>
                                </div>
                                <ProgressBar value={usage.textTokens.current} max={features.textTokens.limit} colorClass="bg-accent"/>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-slate-600">{t('speechToTextConsumed')}</span>
                                    <span>{usage.speechToTextMinutes.current.toLocaleString()} / {features.speechToTextMinutes.limit.toLocaleString()}</span>
                                </div>
                                <ProgressBar value={usage.speechToTextMinutes.current} max={features.speechToTextMinutes.limit} colorClass="bg-sky-500"/>
                            </div>
                             <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-slate-600">{t('storageUsed')} (GB)</span>
                                    <span>{usage.storageGB.current} / {features.storageGB.limit}</span>
                                </div>
                                <ProgressBar value={usage.storageGB.current} max={features.storageGB.limit} colorClass="bg-purple-500"/>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Actions & Overage */}
                <div className="space-y-6">
                    <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
                        <div className="border-b border-slate-200 pb-6">
                            <h3 className="text-lg font-semibold text-slate-700 mb-3">{t('billingActions')}</h3>
                            {subscription.status === 'Pending Payment' ? (
                                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-r-lg">
                                    <p className="font-bold">{t('paymentDue')}</p>
                                    <p className="text-sm mt-1">Your payment is due. Please complete payment to ensure service continuity.</p>
                                    <Button variant="primary" className="w-full mt-3">{t('payNow')}</Button>
                                </div>
                            ) : !isTrial && (
                                <Button 
                                    variant="secondary" 
                                    className="w-full"
                                    onClick={handleManageBilling}
                                >
                                    {t('manageBilling')}
                                </Button>
                            )}
                        </div>

                         <div>
                            <h3 className="text-lg font-semibold text-slate-700 mb-2">{t('paymentMethod')}</h3>
                             <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-md">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                                    <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm3 0a1 1 0 011-1h1a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
                                </svg>
                                <div>
                                    {paymentMethod.type !== 'Not Set' ? (
                                    <>
                                        {paymentMethod.cardholderName && (
                                            <p className="font-medium text-slate-700">{paymentMethod.cardholderName}</p>
                                        )}
                                        <p className="font-medium text-slate-700">{paymentMethod.type} **** {paymentMethod.last4}</p>
                                        <p className="text-sm text-slate-500">Expires {paymentMethod.expiry}</p>
                                    </>
                                    ) : (
                                        <p className="font-medium text-slate-700">No payment method on file</p>
                                    )}
                                </div>
                             </div>
                        </div>
                         <div className="space-y-3 pt-4 border-t border-slate-200">
                           
                            <Button variant="ghost" className="w-full">{t('billingHistory')}</Button>
                            {subscription.status !== 'Cancelled' && (
                                <>
                                    <Button 
                                        variant="primary" 
                                        className="w-full"
                                        onClick={() => setShowPlanChangeModal(true)}
                                    >
                                        Change Plan
                                    </Button>
                                    <Button 
                                        variant="danger" 
                                        className="w-full"
                                        onClick={() => setShowCancelModal(true)}
                                    >
                                        {t('cancelSubscription')}
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                     {!isTrial && (
                        <div className="bg-white shadow-lg rounded-lg p-6">
                            <h3 className="text-xl font-semibold text-slate-700 mb-4">{t('overageCosts')}</h3>
                            <ul className="text-sm space-y-2 text-slate-600">
                                <li className="flex justify-between"><span>{t('additionalPartnerCost')}:</span> <span className="font-medium text-slate-800">${overageCosts.additionalPartner} / {t('monthly')}</span></li>
                                <li className="flex justify-between"><span>{t('iaTokenOverage')}:</span> <span className="font-medium text-slate-800">${overageCosts.textTokensPer1k}</span></li>
                                <li className="flex justify-between"><span>{t('speechToTextOverage')}:</span> <span className="font-medium text-slate-800">${overageCosts.speechToTextPerMinute}</span></li>
                                <li className="flex justify-between"><span>{t('storageOverage')}:</span> <span className="font-medium text-slate-800">${overageCosts.storagePerGB}</span></li>
                            </ul>
                        </div>
                    )}
                </div>

            </div>

            <CancelSubscriptionModal
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                onConfirm={handleCancelSubscription}
                endsAt={subscription?.renewalDate}
            />

            <PlanChangeModal
                isOpen={showPlanChangeModal}
                onClose={() => setShowPlanChangeModal(false)}
                onConfirm={handlePlanChange}
                currentPlan={subscription?.planName || ''}
                isLoading={planChangeLoading}
            />
        </div>
    );
};

export default SubscriptionPage;
