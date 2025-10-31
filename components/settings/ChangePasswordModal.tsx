
import React, { useState } from 'react';
import { useTranslations } from '../../hooks/useTranslations';
import { getErrorMessage } from '../../types';
import Modal from '../common/Modal';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (currentPassword: string, newPassword: string) => Promise<void>;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose, onSave }) => {
    const t = useTranslations();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const resetForm = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        setErrors({});
        setIsLoading(false);
    };
    
    const handleClose = () => {
        resetForm();
        onClose();
    };

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (newPassword.length < 8) {
            newErrors.newPassword = t('passwordTooShort');
        }
        if (newPassword !== confirmNewPassword) {
            newErrors.confirmNewPassword = t('passwordsDoNotMatch');
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        if (!validate()) {
            return;
        }

        setIsLoading(true);
        try {
            await onSave(currentPassword, newPassword);
            handleClose();
        } catch (error) {
            const errorMessage = getErrorMessage(error);
            if (errorMessage.includes('current password') || errorMessage.includes('incorrect')) {
                setErrors({ currentPassword: t('currentPasswordIncorrect') });
            } else {
                setErrors({ currentPassword: errorMessage });
            }
            setIsLoading(false);
        }
    };

    const inputClasses = (fieldName: string) => 
        `mt-1 p-2 w-full border rounded-md ${errors[fieldName] ? 'border-red-500' : 'border-slate-300'} focus:ring-primary focus:border-primary`;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={t('changePassword')}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium">{t('currentPassword')}</label>
                    <div className="relative">
                        <input
                            type={showCurrentPassword ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className={inputClasses('currentPassword')}
                            required
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                            {showCurrentPassword ? '🙈' : '👁️'}
                        </button>
                    </div>
                    {errors.currentPassword && <p className="text-xs text-red-600 mt-1">{errors.currentPassword}</p>}
                </div>
                 <div>
                    <label className="block text-sm font-medium">{t('newPassword')}</label>
                    <div className="relative">
                        <input
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className={inputClasses('newPassword')}
                            required
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                            {showNewPassword ? '🙈' : '👁️'}
                        </button>
                    </div>
                     {errors.newPassword && <p className="text-xs text-red-600 mt-1">{errors.newPassword}</p>}
                </div>
                 <div>
                    <label className="block text-sm font-medium">{t('confirmNewPassword')}</label>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            className={inputClasses('confirmNewPassword')}
                            required
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? '🙈' : '👁️'}
                        </button>
                    </div>
                     {errors.confirmNewPassword && <p className="text-xs text-red-600 mt-1">{errors.confirmNewPassword}</p>}
                </div>

                <div className="pt-2 flex justify-end space-x-3">
                    <Button type="button" variant="secondary" onClick={handleClose} disabled={isLoading}>
                        {t('cancel')}
                    </Button>
                    <Button type="submit" variant="primary" disabled={isLoading}>
                        {isLoading ? <LoadingSpinner size="sm" color="text-white"/> : t('saveChanges')}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default ChangePasswordModal;