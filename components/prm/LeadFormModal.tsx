import React, { useState, useEffect } from 'react';
import { Lead, Partner, UserRole, ReferralType, ReferralProgramConfig } from '../../types';
import { useTranslations } from '../../hooks/useTranslations';
import { useAuth } from '../../contexts/AuthContext';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Select from '../common/Select';
import LoadingSpinner from '../common/LoadingSpinner';
import * as api from "../../services/backendApiService";


interface LeadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (lead: Omit<Lead, 'id' | 'createdDate'> | Lead) => Promise<void>;
  lead?: Lead | null; // For editing
  isLoading: boolean;
}

const LeadFormModal: React.FC<LeadFormModalProps> = ({ isOpen, onClose, onSave, lead, isLoading }) => {
  const t = useTranslations();
  const { user } = useAuth();
  const [formData, setFormData] = useState<Partial<Lead>>({
    leadName: '',
    partnerId: '',
    partnerName: '',
    status: 'New',
    value: 0,
    referralType: ReferralType.LEAD_REFERRAL, // Default
  });
  const [partners, setPartners] = useState<Partner[]>([]);
  const [partnersLoading, setPartnersLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [potentialRate, setPotentialRate] = useState<number | null>(null);

  const canManageLeads = user?.role === UserRole.PARTNER_MANAGER || user?.role === UserRole.ORGANIZATION;

  useEffect(() => {
    if (isOpen) {
      setErrors({});
      if (canManageLeads) {
        setPartnersLoading(true);
        api.getPartners().then(data => {
          setPartners(data);
          setPartnersLoading(false);
          if (lead) { // Editing existing lead
              setFormData({
                  ...lead,
                  partnerId: lead.partnerId || '', // Ensure partnerId is not undefined
                  referralType: lead.referralType || ReferralType.LEAD_REFERRAL,
              });
          } else { // New lead by PM/Org
               setFormData({ leadName: '', partnerId: '', partnerName: '', status: 'New', value: 0, referralType: ReferralType.LEAD_REFERRAL });
          }
        }).catch(err => {
          console.error("Failed to load partners for lead form", err);
          setPartnersLoading(false);
        });
      } else { // Partner creating/editing a lead
          if (lead) { // Editing existing lead
              setFormData(lead);
          } else { // New lead by Partner
               setFormData({ leadName: '', partnerId: user?.partnerId, partnerName: '', status: 'New', value: 0 });
          }
      }
    }
  }, [isOpen, lead, user, canManageLeads]);

  useEffect(() => {
    const calculatePotentialRate = async () => {
        if (!canManageLeads || !formData.partnerId || !formData.referralType) {
            setPotentialRate(null);
            return;
        }

        const selectedPartner = partners.find(p => p.id === formData.partnerId);
        if (selectedPartner?.organizationId) {
            try {
                const config = await api.getReferralProgramConfig(selectedPartner.organizationId);
                if (config) {
                    const rate = formData.referralType === ReferralType.RESELLER
                        ? config.resellerCommissionRate
                        : config.leadReferralCommissionRate;
                    setPotentialRate(rate);
                } else {
                    setPotentialRate(null);
                }
            } catch(error) {
                 console.error("Could not fetch referral config for partner:", error);
                 setPotentialRate(null);
            }
        } else {
            setPotentialRate(null);
        }
    };

    calculatePotentialRate();
  }, [formData.partnerId, formData.referralType, partners, canManageLeads]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "partnerId") {
        const selectedPartner = partners.find(p => p.id === value);
        setFormData(prev => ({ ...prev, partnerId: value, partnerName: selectedPartner?.name || '' }));
    } else {
        setFormData(prev => ({ ...prev, [name]: name === 'value' ? parseFloat(value) || 0 : value }));
    }
    // Clear error for the field being changed
    if (errors[name]) {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[name];
            return newErrors;
        });
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.leadName?.trim()) {
      newErrors.leadName = "Lead Name is required.";
    }
    if (canManageLeads && !formData.partnerId) {
      newErrors.partnerId = "A partner must be selected.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    
    const saveData: Omit<Lead, 'id' | 'createdDate'> | Lead = lead 
    ? { ...lead, ...formData } // For editing, merge with existing lead data
    : { // For new lead
        leadName: formData.leadName!,
        partnerId: formData.partnerId,
        partnerName: formData.partnerName,
        status: formData.status!,
        value: formData.value!,
        referralType: formData.referralType!,
      };
    await onSave(saveData);
  };
  
  const leadStatuses: Lead['status'][] = ['New', 'Qualified', 'Contacted', 'Converted', 'Lost'];
  const statusOptions = leadStatuses.map(s => ({ value: s, label: t(`leadStatus${s.charAt(0).toUpperCase() + s.slice(1)}`) || s }));


  return (
    <Modal isOpen={isOpen} onClose={onClose} title={lead ? t('editLead') : t('createNewLead')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="leadName" className="block text-sm font-medium text-slate-700">{t('leadName')}</label>
          <input
            type="text"
            name="leadName"
            id="leadName"
            value={formData.leadName || ''}
            onChange={handleChange}
            className={`mt-1 block w-full shadow-sm sm:text-sm border rounded-md p-2 ${errors.leadName ? 'border-red-500' : 'border-slate-300'}`}
            required
          />
          {errors.leadName && <p className="text-xs text-red-600 mt-1">{errors.leadName}</p>}
        </div>
        
        {canManageLeads && (
          <div>
            <label htmlFor="partnerId" className="block text-sm font-medium text-slate-700">{t('partnerName')}</label>
            {partnersLoading ? <LoadingSpinner size="sm"/> : 
            <Select
              id="partnerId"
              name="partnerId"
              options={[{value: '', label: `--- ${t('select')} ${t('partnerName')} ---`}, ...partners.map(p => ({ value: p.id, label: p.name }))]}
              value={formData.partnerId || ''}
              onChange={handleChange}
              className={`mt-1 ${errors.partnerId ? 'border-red-500' : ''}`}
            />
            }
            {errors.partnerId && <p className="text-xs text-red-600 mt-1">{errors.partnerId}</p>}
          </div>
        )}

        {canManageLeads && (
          <div>
            <label htmlFor="referralType" className="block text-sm font-medium text-slate-700">{t('referralType')}</label>
            <Select
              id="referralType"
              name="referralType"
              options={[
                  { value: ReferralType.LEAD_REFERRAL, label: t('referralTypeLeadReferral') },
                  { value: ReferralType.RESELLER, label: t('referralTypeReseller') }
              ]}
              value={formData.referralType || ReferralType.LEAD_REFERRAL}
              onChange={handleChange}
              className="mt-1"
            />
          </div>
        )}

        {canManageLeads && (
          <div>
              <label htmlFor="commissionRateApplied" className="block text-sm font-medium text-slate-700">{t('commissionRate')}</label>
              <input
                  type="number"
                  id="commissionRateApplied"
                  value={formData.commissionRateApplied || ''}
                  onChange={(e) => setFormData({ ...formData, commissionRateApplied: parseFloat(e.target.value) || 0 })}
                  className="mt-1 block w-full shadow-sm sm:text-sm border-slate-300 rounded-md p-2"
                  placeholder={potentialRate ? `Default: ${potentialRate}% (leave empty to use default)` : "Enter commission rate"}
                  step="0.01"
                  min="0"
                  max="100"
              />
              {potentialRate !== null && (
                <p className="text-xs text-slate-500 mt-1">
                  Default rate: {potentialRate}% (leave empty to use default, or enter custom rate to override)
                </p>
              )}
          </div>
        )}

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-slate-700">{t('status')}</label>
          <Select
            id="status"
            name="status"
            options={statusOptions}
            value={formData.status || 'New'}
            onChange={handleChange}
            className="mt-1"
            required
          />
        </div>

        <div>
          <label htmlFor="value" className="block text-sm font-medium text-slate-700">{t('estimatedValue')}</label>
          <input
            type="number"
            name="value"
            id="value"
            value={formData.value || 0}
            onChange={handleChange}
            className="mt-1 block w-full shadow-sm sm:text-sm border border-slate-300 rounded-md p-2"
          />
        </div>

        <div className="pt-2 flex justify-end space-x-3">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            {t('cancel')}
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? <LoadingSpinner size="sm" color="text-white"/> : (lead ? t('saveLead') : t('submitLead'))}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default LeadFormModal;
