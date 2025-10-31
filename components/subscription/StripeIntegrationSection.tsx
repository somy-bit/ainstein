
import React, { useState } from 'react';
import { StripeConfig } from '../../types';
import { useTranslations } from '../../hooks/useTranslations';
// FIX: Replaced deprecated import from mockPrmDataService with api.
import * as api from "../../services/backendApiService";
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import ConfirmationModal from '../common/ConfirmationModal';

interface StripeIntegrationSectionProps {
    stripeConfig: StripeConfig;
    onUpdate: () => void;
}

const StripeIntegrationSection: React.FC<StripeIntegrationSectionProps> = ({ stripeConfig, onUpdate }) => {
    const t = useTranslations();
    const [isLoading, setIsLoading] = useState(false);
    const [keys, setKeys] = useState({
        publishableKey: '',
        secretKey: '',
        webhookSecret: ''
    });
    const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);

    const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setKeys(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // In a real app, these keys would be sent to a secure backend endpoint.
            // Here, we just simulate the connection status change.
            if (keys.publishableKey && keys.secretKey && keys.webhookSecret) {
                // FIX: Updated function call to match apiService signature, passing a config object.
                await api.updatePlatformStripeConfig({ isConnected: true, publishableKeySet: true });
                alert(t('configurationSaved'));
                onUpdate(); // Re-fetch data on parent component
            } else {
                alert("Please fill all API key fields.");
            }
        } catch (error) {
            console.error(error);
            alert(t('errorSavingConfiguration'));
        }
        setIsLoading(false);
    };
    
    const handleDisconnect = async () => {
        setIsLoading(true);
        try {
            // FIX: Updated function call to match apiService signature, passing a config object.
            await api.updatePlatformStripeConfig({ isConnected: false, publishableKeySet: false });
            onUpdate();
            setIsDisconnectModalOpen(false);
        } catch (error) {
            console.error(error);
             alert(t('errorSavingConfiguration'));
        }
        setIsLoading(false);
    };

    return (
        <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-xl font-semibold text-slate-700 mb-2">{t('adminStripeIntegration')}</h2>
            
            {!stripeConfig.isConnected ? (
                // FORM VIEW
                <form onSubmit={handleSave}>
                    <p className="text-sm text-slate-500 mb-4">{t('adminStripeDescription')}</p>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="publishableKey" className="block text-sm font-medium text-slate-600">{t('publishableApiKey')}</label>
                            <input type="password" id="publishableKey" name="publishableKey" value={keys.publishableKey} onChange={handleKeyChange} className="mt-1 p-2 w-full border border-slate-300 rounded-md shadow-sm" placeholder={t('pasteYourKey')} required />
                        </div>
                         <div>
                            <label htmlFor="secretKey" className="block text-sm font-medium text-slate-600">{t('secretApiKey')}</label>
                            <input type="password" id="secretKey" name="secretKey" value={keys.secretKey} onChange={handleKeyChange} className="mt-1 p-2 w-full border border-slate-300 rounded-md shadow-sm" placeholder={t('pasteYourKey')} required />
                        </div>
                        <div>
                            <label htmlFor="webhookSecret" className="block text-sm font-medium text-slate-600">{t('webhookSigningSecret')}</label>
                            <input type="password" id="webhookSecret" name="webhookSecret" value={keys.webhookSecret} onChange={handleKeyChange} className="mt-1 p-2 w-full border border-slate-300 rounded-md shadow-sm" placeholder={t('pasteYourKey')} required />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? <LoadingSpinner size="sm" /> : t('saveConfiguration')}
                        </Button>
                    </div>
                </form>
            ) : (
                // CONNECTED VIEW
                <div>
                     <p className="text-sm text-slate-500 mb-4">{t('adminStripeDescription')}</p>
                     <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <div className="flex items-center space-x-3">
                             <div className="flex-shrink-0 bg-green-100 p-2 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-md font-semibold text-green-800">{t('stripeConnected')}</h3>
                                <p className="text-sm text-slate-600 font-mono tracking-wider">{stripeConfig.publishableKeySet ? "pk_live_••••••••••••••••••••••••" : "No key set"}</p>
                                <p className="text-xs text-slate-400 mt-1">{t('apiKeysStoredSecurely')}</p>
                            </div>
                        </div>
                     </div>
                      <div className="mt-6 flex justify-end">
                        <Button variant="danger" onClick={() => setIsDisconnectModalOpen(true)} disabled={isLoading}>
                            {isLoading ? <LoadingSpinner size="sm" /> : t('disconnectStripe')}
                        </Button>
                    </div>
                </div>
            )}
            
            <ConfirmationModal 
                isOpen={isDisconnectModalOpen}
                onClose={() => setIsDisconnectModalOpen(false)}
                onConfirm={handleDisconnect}
                title={t('confirmDisconnectStripeTitle')}
                message={t('confirmDisconnectStripeMessage')}
                confirmButtonVariant="danger"
                isLoading={isLoading}
            />
        </div>
    );
};

export default StripeIntegrationSection;