
import React, { useState, useEffect } from 'react';
import { ReferralProgramConfig } from '../../../types';
import { useTranslations } from '../../../hooks/useTranslations';
import Button from '../../common/Button';
import LoadingSpinner from '../../common/LoadingSpinner';

interface CommissionConfigSectionProps {
    config: ReferralProgramConfig;
    onSave: (newConfig: Partial<ReferralProgramConfig>) => void;
    isLoading: boolean;
}

const CommissionConfigSection: React.FC<CommissionConfigSectionProps> = ({ config, onSave, isLoading }) => {
    const t = useTranslations();
    const [rates, setRates] = useState({
        resellerCommissionRate: config.resellerCommissionRate,
        leadReferralCommissionRate: config.leadReferralCommissionRate,
    });

    useEffect(() => {
        setRates({
            resellerCommissionRate: config.resellerCommissionRate,
            leadReferralCommissionRate: config.leadReferralCommissionRate,
        });
    }, [config]);

    const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setRates(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(rates);
    };

    const inputClasses = "mt-1 p-2 w-full border rounded-md bg-white border-slate-300 focus:ring-primary focus:border-primary shadow-sm";

    return (
        <div className="bg-white shadow-lg rounded-lg p-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold text-slate-700 mb-2">{t('commissionConfiguration')}</h2>
            <p className="text-sm text-slate-500 mb-6">{t('commissionConfigurationDescription')}</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="resellerCommissionRate" className="block text-sm font-medium text-slate-600">
                        {t('resellerCommissionRate')} (%)
                    </label>
                    <input
                        type="number"
                        id="resellerCommissionRate"
                        name="resellerCommissionRate"
                        value={rates.resellerCommissionRate}
                        onChange={handleRateChange}
                        className={inputClasses}
                        step="0.01"
                        min="0"
                        max="100"
                    />
                </div>
                <div>
                    <label htmlFor="leadReferralCommissionRate" className="block text-sm font-medium text-slate-600">
                        {t('leadReferralCommissionRate')} (%)
                    </label>
                    <input
                        type="number"
                        id="leadReferralCommissionRate"
                        name="leadReferralCommissionRate"
                        value={rates.leadReferralCommissionRate}
                        onChange={handleRateChange}
                        className={inputClasses}
                        step="0.01"
                        min="0"
                        max="100"
                    />
                </div>
                 <div className="pt-2 flex justify-end">
                    <Button type="submit" variant="primary" disabled={isLoading}>
                        {isLoading ? <LoadingSpinner size="sm" color="text-white"/> : t('saveCommissionRates')}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default CommissionConfigSection;
