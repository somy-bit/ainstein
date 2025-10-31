
import React, { useState, useEffect } from 'react';
import { Partner, PartnerCategory, ISVPartnerType } from '../../types';
import { useTranslations } from '../../hooks/useTranslations';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Select from '../common/Select';
import LoadingSpinner from '../common/LoadingSpinner';
import { PARTNER_CATEGORIES, ISV_PARTNER_TYPES } from '../../constants';
import { useAuth } from '../../contexts/AuthContext';

interface PartnerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (partner: Omit<Partner, 'id' | 'performanceScore'> | Partner) => Promise<void>;
  partner?: Partner | null;
  isLoading: boolean;
}

const PartnerFormModal: React.FC<PartnerFormModalProps> = ({ isOpen, onClose, onSave, partner, isLoading }) => {
  const t = useTranslations();
  const { user, organization } = useAuth();
  
  const initialFormData: Partial<Partner> = {
    name: '',
    tier: 'Bronze',
    specialization: '',
    region: '',
    contactEmail: '',
    category: PartnerCategory.SI,
    country: '',
    isActive: true,
    isvType: undefined,
    phone: '',
    website: '',
    logoUrl: '',
    description: '',
    organizationId: user?.organizationId,
    organizationName: organization?.name,
  };
  
  const [formData, setFormData] = useState<Partial<Partner>>(initialFormData);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});


  useEffect(() => {
    if (isOpen) {
        setErrors({});
        if (partner) {
          setFormData(partner);
        } else {
          setFormData(initialFormData);
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partner, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (errors[name]) {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[name];
            return newErrors;
        });
    }

    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value as PartnerCategory;
    setFormData(prev => ({ ...prev, category: newCategory, isvType: newCategory === PartnerCategory.SI ? undefined : prev.isvType }));
  }

  const validateForm = () => {
      const newErrors: { [key: string]: string } = {};
      if (!formData.name?.trim()) newErrors.name = "Partner name is required.";
      if (!formData.contactEmail?.trim()) newErrors.contactEmail = "Contact email is required.";
      else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) newErrors.contactEmail = "Email address is invalid.";
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    const saveData = partner ? { ...partner, ...formData } : { ...formData, performanceScore: 50 };
    await onSave(saveData as Omit<Partner, 'id' | 'performanceScore'> | Partner);
  };
  
  const inputClasses = (name: keyof Partner | 'contactEmail' | 'name') => `mt-1 p-2 w-full border rounded-md bg-slate-800 text-white border-slate-600 focus:ring-primary focus:border-primary ${errors[name] ? '!border-red-500' : ''}`;
  const selectClasses = "mt-1 w-full bg-slate-800 text-white border-slate-600 focus:ring-primary focus:border-primary";
  const textAreaClasses = "mt-1 p-2 w-full border rounded-md bg-slate-800 text-white border-slate-600 focus:ring-primary focus:border-primary";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={partner ? t('editPartner') : t('createNewPartner')}>
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">{t('partnerName')}</label>
              <input type="text" name="name" value={formData.name || ''} onChange={handleChange} className={inputClasses('name')} required/>
              {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
            </div>
             <div>
              <label className="block text-sm font-medium">{t('contactEmail')}</label>
              <input type="email" name="contactEmail" value={formData.contactEmail || ''} onChange={handleChange} className={inputClasses('contactEmail')} required/>
              {errors.contactEmail && <p className="text-xs text-red-600 mt-1">{errors.contactEmail}</p>}
            </div>
        </div>
        <div>
            <label className="block text-sm font-medium">{t('partnerCategory')}</label>
            <Select 
                name="category"
                options={PARTNER_CATEGORIES.map(c => ({value: c.value, label: t(c.labelKey)}))}
                value={formData.category}
                onChange={handleCategoryChange}
                className={selectClasses}
            />
        </div>
        {formData.category === PartnerCategory.ISV && (
            <div>
              <label className="block text-sm font-medium">{t('isvType')}</label>
              <Select 
                  name="isvType"
                  options={ISV_PARTNER_TYPES.filter(o => o.value !== 'All').map(type => ({value: type.value, label: t(type.labelKey)}))}
                  value={formData.isvType}
                  onChange={handleChange}
                  className={selectClasses}
              />
            </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium">{t('tier')}</label>
                <Select 
                    name="tier"
                    options={['Bronze', 'Silver', 'Gold', 'Platinum'].map(t => ({value: t, label: t}))}
                    value={formData.tier}
                    onChange={handleChange}
                    className={selectClasses}
                />
            </div>
            <div>
                <label className="block text-sm font-medium">{t('specialization')}</label>
                <input type="text" name="specialization" value={formData.specialization || ''} onChange={handleChange} className={inputClasses('specialization')}/>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium">{t('region')}</label>
                <input type="text" name="region" value={formData.region || ''} onChange={handleChange} className={inputClasses('region')}/>
            </div>
            <div>
                <label className="block text-sm font-medium">{t('country')}</label>
                <input type="text" name="country" value={formData.country || ''} onChange={handleChange} className={inputClasses('country')}/>
            </div>
        </div>
         {formData.category === PartnerCategory.ISV && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium">{t('phone')}</label>
                    <input type="tel" name="phone" value={formData.phone || ''} onChange={handleChange} className={inputClasses('phone')}/>
                </div>
                <div>
                    <label className="block text-sm font-medium">{t('website')}</label>
                    <input type="url" name="website" value={formData.website || ''} onChange={handleChange} className={inputClasses('website')}/>
                </div>
            </div>
        )}
        {formData.category === PartnerCategory.ISV && (
            <div>
                <label className="block text-sm font-medium">{t('logoUrl')}</label>
                <input type="url" name="logoUrl" value={formData.logoUrl || ''} onChange={handleChange} className={inputClasses('logoUrl')}/>
            </div>
        )}

        <div>
            <label className="block text-sm font-medium">{t('description')}</label>
            <textarea name="description" value={formData.description || ''} onChange={handleChange} className={textAreaClasses} rows={2}></textarea>
        </div>

        <div className="flex items-center space-x-3">
            <label htmlFor="isActive" className="block text-sm font-medium">{t('partnerStatus')}:</label>
            <input id="isActive" type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="h-4 w-4 rounded"/>
            <span className="text-sm">{formData.isActive ? t('active') : t('blocked')}</span>
        </div>

        <div className="pt-2 flex justify-end space-x-3">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            {t('cancel')}
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? <LoadingSpinner size="sm" color="text-white"/> : t('savePartner')}
            </Button>
        </div>
      </form>
    </Modal>
  );
};

export default PartnerFormModal;