import React, { useState } from 'react';
import { useTranslations } from '../../hooks/useTranslations';
import { useApiWithToast } from '../../hooks/useApiWithToast';
import Button from '../common/Button';
import ChangePasswordModal from './ChangePasswordModal';

const ChangePasswordSection: React.FC = () => {
    const t = useTranslations();
    const api = useApiWithToast();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handlePasswordChange = async (currentPassword: string, newPassword: string) => {
        console.log('🔐 Attempting to change password...');
        console.log('Token exists:', !!localStorage.getItem('authToken'));
        
        try {
            await api.changePassword(currentPassword, newPassword);
            console.log('✅ Password changed successfully');
            setIsModalOpen(false);
        } catch (error) {
            console.error('❌ Password change failed:', error);
            // Error is already handled by useApiWithToast
            throw error;
        }
    };

    return (
        <>
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl">
                <h3 className="text-lg font-semibold text-slate-800">{t('security')}</h3>
                <p className="text-sm text-slate-500 mb-4">
                    {t('changePasswordInfo')}
                </p>
                <Button onClick={() => setIsModalOpen(true)}>
                    {t('changePassword')}
                </Button>
            </div>
            {isModalOpen && (
                <ChangePasswordModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handlePasswordChange}
                />
            )}
        </>
    );
};

export default ChangePasswordSection;
