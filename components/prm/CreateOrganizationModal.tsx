
import React, { useState, useEffect } from 'react';
import { useTranslations } from '../../hooks/useTranslations';
import Modal from '../common/Modal';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import Select from '../common/Select';
import { countries, states, cities } from '../../services/locationData';
import { OrganizationCreationData, AdminCreationData } from '../../types';

interface CreateOrganizationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (orgData: OrganizationCreationData, adminData: AdminCreationData) => Promise<void>;
    isLoading: boolean;
}

const CreateOrganizationModal: React.FC<CreateOrganizationModalProps> = ({ isOpen, onClose, onSave, isLoading }) => {
    const t = useTranslations();
    const [orgData, setOrgData] = useState({
        name: '',
        companyId: '',
        address: '',
        city: '',
        province: '',
        postalCode: '',
        country: 'US' // Default value
    });
    const [adminData, setAdminData] = useState({
        name: '', // first name
        lastNamePaternal: '',
        email: ''
    });

    const [availableStates, setAvailableStates] = useState(states[orgData.country] || []);
    const [availableCities, setAvailableCities] = useState<string[]>([]);
    
    useEffect(() => {
        if(isOpen) {
            // Reset form on open
            const defaultCountry = 'US';
            const defaultStates = states[defaultCountry] || [];
            setOrgData({
                name: '', companyId: '', address: '', city: '',
                province: '', postalCode: '', country: defaultCountry
            });
            setAdminData({ name: '', lastNamePaternal: '', email: '' });
            setAvailableStates(defaultStates);
            setAvailableCities([]);
        }
    }, [isOpen]);

    useEffect(() => {
        const newStates = states[orgData.country] || [];
        setAvailableStates(newStates);
        setOrgData(prev => ({ ...prev, province: '', city: '' }));
    }, [orgData.country]);

    useEffect(() => {
        const newCities = orgData.province ? (cities[orgData.province] || []) : [];
        setAvailableCities(newCities);
        setOrgData(prev => ({ ...prev, city: '' }));
    }, [orgData.province]);

    const handleOrgChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setOrgData(prev => ({...prev, [e.target.name]: e.target.value }));
    };

    const handleAdminChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAdminData(prev => ({...prev, [e.target.name]: e.target.value }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const fullCountryName = countries.find(c => c.code === orgData.country)?.name;
        onSave({...orgData, country: fullCountryName}, adminData);
    };

    const inputClasses = "mt-1 p-2 w-full border rounded-md bg-slate-800 text-white border-slate-600 focus:ring-primary focus:border-primary";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('createOrganization')}>
            <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto p-1">
                {/* Organization Details */}
                <fieldset className="border p-4 rounded-md">
                    <legend className="text-lg font-semibold px-2">{t('organizationName')}</legend>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium">{t('companyName')}<span className="text-red-500 ml-1">*</span></label>
                            <input type="text" name="name" value={orgData.name} onChange={handleOrgChange} className={inputClasses} required/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">{t('companyId')}<span className="text-red-500 ml-1">*</span></label>
                            <input type="text" name="companyId" value={orgData.companyId} onChange={handleOrgChange} className={inputClasses} required/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">{t('address')}<span className="text-red-500 ml-1">*</span></label>
                            <input type="text" name="address" value={orgData.address} onChange={handleOrgChange} className={inputClasses} required/>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium">{t('country')}<span className="text-red-500 ml-1">*</span></label>
                                <Select name="country" value={orgData.country} onChange={handleOrgChange} options={countries.map(c => ({value: c.code, label: c.name}))} className={inputClasses} required/>
                            </div>
                             <div>
                                <label className="block text-sm font-medium">{t('province')}<span className="text-red-500 ml-1">*</span></label>
                                <Select name="province" value={orgData.province} onChange={handleOrgChange} options={[{value: '', label: t('select')}, ...availableStates.map(s => ({value: s.code, label: s.name}))]} className={inputClasses} required disabled={availableStates.length === 0} />
                            </div>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium">{t('city')}<span className="text-red-500 ml-1">*</span></label>
                                <Select name="city" value={orgData.city} onChange={handleOrgChange} options={[{value: '', label: t('select')}, ...availableCities.map(c => ({value: c, label: c}))]} className={inputClasses} required disabled={availableCities.length === 0} />
                            </div>
                             <div>
                                <label className="block text-sm font-medium">{t('postalCode')}<span className="text-red-500 ml-1">*</span></label>
                                <input type="text" name="postalCode" value={orgData.postalCode} onChange={handleOrgChange} className={inputClasses} required/>
                            </div>
                         </div>
                    </div>
                </fieldset>

                {/* Admin Details */}
                <fieldset className="border p-4 rounded-md">
                    <legend className="text-lg font-semibold px-2">{t('masterAdminDetails')}</legend>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div>
                                <label className="block text-sm font-medium">{t('firstName')}<span className="text-red-500 ml-1">*</span></label>
                                <input type="text" name="name" value={adminData.name} onChange={handleAdminChange} className={inputClasses} required/>
                           </div>
                           <div>
                                <label className="block text-sm font-medium">{t('lastNamePaternal')}<span className="text-red-500 ml-1">*</span></label>
                                <input type="text" name="lastNamePaternal" value={adminData.lastNamePaternal} onChange={handleAdminChange} className={inputClasses} required/>
                           </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">{t('email')}<span className="text-red-500 ml-1">*</span></label>
                            <input type="email" name="email" value={adminData.email} onChange={handleAdminChange} className={inputClasses} required/>
                        </div>
                    </div>
                </fieldset>

                 <div className="pt-2 flex justify-end space-x-3">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
                        {t('cancel')}
                    </Button>
                    <Button type="submit" variant="primary" disabled={isLoading}>
                        {isLoading ? <LoadingSpinner size="sm" color="text-white"/> : t('createOrganization')}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default CreateOrganizationModal;
