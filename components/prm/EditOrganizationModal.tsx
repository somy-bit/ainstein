
import React, { useState, useEffect } from 'react';
import { Organization } from '../../types';
import { useTranslations } from '../../hooks/useTranslations';
import Modal from '../common/Modal';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';

interface EditOrganizationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (orgId: string, orgData: Partial<Organization>) => Promise<void>;
    isLoading: boolean;
    organization: Organization | null;
}

const EditOrganizationModal: React.FC<EditOrganizationModalProps> = ({ isOpen, onClose, onSave, isLoading, organization }) => {
    const t = useTranslations();
    const [formData, setFormData] = useState<Partial<Organization>>({});

    useEffect(() => {
        if (organization) {
            setFormData(organization);
        }
    }, [organization]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({...prev, [e.target.name]: e.target.value }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (organization) {
            onSave(organization.id, formData);
        }
    };

    const inputClasses = "mt-1 p-2 w-full border rounded-md bg-slate-800 text-white border-slate-600 focus:ring-primary focus:border-primary";

    if (!organization) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('editPartner')}>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
                <fieldset className="border p-4 rounded-md">
                    <legend className="text-lg font-semibold px-2">{t('organizationName')}</legend>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium">{t('companyName')}<span className="text-red-500 ml-1">*</span></label>
                            <input type="text" name="name" value={formData.name || ''} onChange={handleChange} className={inputClasses} required/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">{t('companyId')}<span className="text-red-500 ml-1">*</span></label>
                            <input type="text" name="companyId" value={formData.companyId || ''} onChange={handleChange} className={inputClasses} required/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">{t('address')}<span className="text-red-500 ml-1">*</span></label>
                            <input type="text" name="address" value={formData.address || ''} onChange={handleChange} className={inputClasses} required/>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium">{t('city')}<span className="text-red-500 ml-1">*</span></label>
                                <input type="text" name="city" value={formData.city || ''} onChange={handleChange} className={inputClasses} required/>
                            </div>
                             <div>
                                <label className="block text-sm font-medium">{t('province')}<span className="text-red-500 ml-1">*</span></label>
                                <input type="text" name="province" value={formData.province || ''} onChange={handleChange} className={inputClasses} required/>
                            </div>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium">{t('postalCode')}<span className="text-red-500 ml-1">*</span></label>
                                <input type="text" name="postalCode" value={formData.postalCode || ''} onChange={handleChange} className={inputClasses} required/>
                            </div>
                             <div>
                                <label className="block text-sm font-medium">{t('country')}<span className="text-red-500 ml-1">*</span></label>
                                <input type="text" name="country" value={formData.country || ''} onChange={handleChange} className={inputClasses} required/>
                            </div>
                         </div>
                    </div>
                </fieldset>

                 <div className="pt-2 flex justify-end space-x-3">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
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

export default EditOrganizationModal;
