import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslations } from '../hooks/useTranslations';
import { ReferralProgramConfig, Lead } from '../types';
import * as api from '../services/backendApiService'
import LoadingSpinner from '../components/common/LoadingSpinner';
import CommissionConfigSection from '../components/prm/referral/CommissionConfigSection';
import ReferralReportsSection from '../components/prm/referral/ReferralReportsSection';
import ConfirmationModal from '../components/common/ConfirmationModal';

const ReferralProgramPage: React.FC = () => {
    const t = useTranslations();
    const { user } = useAuth();
    const [config, setConfig] = useState<ReferralProgramConfig | null>(null);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('reports');
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [pendingConfig, setPendingConfig] = useState<Partial<ReferralProgramConfig> | null>(null);

    const fetchData = useCallback(async () => {
        if (!user?.organizationId) return;
        setLoading(true);
        setError(null);
        try {
            const [configData, leadsData] = await Promise.all([
                api.getReferralProgramConfig(user.organizationId),
                api.getLeads()
            ]);
            setConfig(configData);
            setLeads(leadsData.filter(l => l.partnerId && l.status === 'Converted')); // Only show converted leads with partners
        } catch (err) {
            console.error("Error fetching referral program data:", err);
            setError((err as Error).message || "Failed to fetch referral program data.");
        }
        setLoading(false);
    }, [user?.organizationId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSaveConfig = async (newConfig: Partial<ReferralProgramConfig>) => {
        setPendingConfig(newConfig);
        setIsConfirmModalOpen(true);
    };

    const confirmSaveConfig = async () => {
        if (!user?.organizationId || !pendingConfig) return;
        
        setIsConfirmModalOpen(false);
        setLoading(true);

        try {
            await api.updateReferralProgramConfig(user.organizationId, pendingConfig);
            alert(t('ratesUpdatedSuccess'));
            fetchData();
        } catch (error) {
            console.error(error);
            alert(t('errorUpdatingRates'));
        }
        setLoading(false);
        setPendingConfig(null);
    };

    if (loading && !config) {
        return <div className="flex justify-center items-center h-64"><LoadingSpinner size="lg" /></div>;
    }

    if (error) {
        return <div className="p-4 bg-red-100 text-red-700 rounded-md text-center">{error}</div>;
    }
    
    if (!config) {
        return <div className="text-center py-10">{t('error')} loading configuration.</div>;
    }

    return (
        <div className="bg-slate-100 min-h-screen">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-6">{t('referralProgram')}</h1>

            <div className="mb-4 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('reports')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'reports' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    >
                        {t('referralReports')}
                    </button>
                    <button
                        onClick={() => setActiveTab('config')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'config' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    >
                        {t('commissionManagement')}
                    </button>
                </nav>
            </div>

            <div>
                {activeTab === 'config' && (
                    <CommissionConfigSection 
                        config={config} 
                        onSave={handleSaveConfig}
                        isLoading={loading}
                    />
                )}
                {activeTab === 'reports' && (
                    <ReferralReportsSection 
                        leads={leads}
                        isLoading={loading}
                        config={config}
                    />
                )}
            </div>

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={confirmSaveConfig}
                title={t('nonRetroactivityWarningTitle')}
                message={t('nonRetroactivityWarningMessage')}
                confirmText={t('confirm')}
            />
        </div>
    );
};

export default ReferralProgramPage;
