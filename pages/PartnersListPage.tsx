import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Partner, UserRole, PartnerCategory, ISVPartnerType, ISVTypeOption, CountryOption, PartnerCategoryFilterOption, Organization, PartnerUpdateData, getErrorMessage } from '../types';
import { useApiWithToast } from '../hooks/useApiWithToast';
import { useAuth } from '../contexts/AuthContext';
import PartnerCard from '../components/prm/PartnerCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useTranslations } from '../hooks/useTranslations';
import Select from '../components/common/Select';
import Button from '../components/common/Button';
import ConfirmationModal from '../components/common/ConfirmationModal';
import PartnerFormModal from '../components/prm/PartnerFormModal';
import EmptyState from '../components/common/EmptyState';
import { ISV_PARTNER_TYPES, PARTNER_CATEGORY_FILTER_OPTIONS, ICON_SIZE } from '../constants';
import { useSubscriptionLimits } from '../hooks/useSubscriptionLimits';

interface SelectOption {
  value: string;
  label: string;
}

const PartnersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 9.75V7.5A2.25 2.25 0 015.25 5.25h13.5A2.25 2.25 0 0121 7.5v2.25z" /></svg>;


const PartnersListPage: React.FC = () => {
  const t = useTranslations();
  const { user } = useAuth();
  const api = useApiWithToast();
  const navigate = useNavigate();
  const [allPartners, setAllPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const limitStatus = useSubscriptionLimits(user?.organizationId || '');
  
  // Filters
  const [organizationFilter, setOrganizationFilter] = useState<string>('All');
  const [partnerCategoryFilter, setPartnerCategoryFilter] = useState<PartnerCategory | 'All'>('All');
  const [isvTypeFilter, setIsvTypeFilter] = useState<ISVPartnerType | 'All'>('All');
  const [countryFilter, setCountryFilter] = useState<string>('All');
  const [specializationFilter, setSpecializationFilter] = useState<string>('All'); 

  // Filter options
  const [organizationOptions, setOrganizationOptions] = useState<SelectOption[]>([]);
  const [countryOptions, setCountryOptions] = useState<CountryOption[]>([]);
  const [specializationOptions, setSpecializationOptions] = useState<SelectOption[]>([]); 
  
  // Modals and CRUD state
  const [isPartnerFormModalOpen, setIsPartnerFormModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => Promise<void>) | null>(null);
  const [confirmModalContent, setConfirmModalContent] = useState({ title: '', message: '', confirmText: t('confirm')});
  const [crudLoading, setCrudLoading] = useState(false);

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedPartners = await api.getPartners();
      setAllPartners(fetchedPartners);
      
      if(user?.role === UserRole.AINSTEIN_ADMIN) {
        const fetchedOrgs = await api.getOrganizations();
        setOrganizationOptions([{ value: 'All', label: t('allOrganizations') }, ...fetchedOrgs.map(o => ({ value: o.id, label: o.name }))]);
      }

    } catch (err) {
      console.error("Error fetching partners:", err);
      setError((err as Error).message || "Failed to fetch partners.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInitialData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); 

  // Effect to update dynamic filter options based on organization selection
  useEffect(() => {
    let relevantPartners = allPartners;
    if (user?.role === UserRole.AINSTEIN_ADMIN && organizationFilter !== 'All') {
        relevantPartners = allPartners.filter(p => p.organizationId === organizationFilter);
    } else if(user?.role === UserRole.ORGANIZATION || user?.role === UserRole.PARTNER_MANAGER) {
        relevantPartners = allPartners.filter(p => p.organizationId === user.organizationId);
    }

    const uniqueCountries = Array.from(new Set(relevantPartners.map(p => p.country).filter((country): country is string => Boolean(country)))) as string[];
    const sortedCountries = uniqueCountries.sort((a,b) => String(a).localeCompare(String(b)));
    setCountryOptions([{ value: 'All', label: t('allCountries') }, ...sortedCountries.map(c => ({ value: c, label: c }))]);
    
    const uniqueSpecializations = Array.from(new Set(relevantPartners.map(p => p.specialization).filter((spec): spec is string => Boolean(spec)))) as string[];
    const sortedSpecializations = uniqueSpecializations.sort((a,b) => String(a).localeCompare(String(b)));
    setSpecializationOptions([{ value: 'All', label: t('allSpecializations') }, ...sortedSpecializations.map(s => ({ value: s, label: s }))]);
    
    // Reset dependent filters when master filter changes
    setCountryFilter('All');
    setSpecializationFilter('All');
    setPartnerCategoryFilter('All');
    setIsvTypeFilter('All');

  }, [organizationFilter, allPartners, user, t]);


  const handleViewDetails = (partnerId: string) => {
    navigate(`/prm/partners/${partnerId}`);
  };
  
  const isvTypeOptions: ISVTypeOption[] = ISV_PARTNER_TYPES;
  const partnerCategoryOptions: PartnerCategoryFilterOption[] = PARTNER_CATEGORY_FILTER_OPTIONS;

  const filteredPartners = useMemo(() => {
    console.log('Debug - allPartners:', allPartners.length);
    console.log('Debug - user:', user);
    console.log('Debug - user role:', user?.role);
    console.log('Debug - UserRole enum:', UserRole);
    console.log('Debug - filters:', { organizationFilter, partnerCategoryFilter, isvTypeFilter, countryFilter, specializationFilter, searchTerm });
    
    let partnersToFilter = allPartners;

    // Role-based pre-filtering - only apply if user exists and has specific roles
    if (user?.role === UserRole.PARTNER_SI) {
        partnersToFilter = allPartners.filter(p => p.category === PartnerCategory.ISV);
        console.log('Debug - PARTNER_SI filtering applied');
    } else if (user?.role === UserRole.PARTNER_ISV) {
        partnersToFilter = allPartners.filter(p => p.category === PartnerCategory.SI);
        console.log('Debug - PARTNER_ISV filtering applied');
    } else if (user?.role === UserRole.ORGANIZATION || user?.role === UserRole.PARTNER_MANAGER) {
        partnersToFilter = allPartners.filter(p => p.organizationId === user.organizationId);
        console.log('Debug - ORGANIZATION/PARTNER_MANAGER filtering applied, orgId:', user.organizationId);
    }
    // For AINSTEIN_ADMIN or undefined user, show all partners

    console.log('Debug - after role filtering:', partnersToFilter.length);

    // Admin's organization filter
    if (user?.role === UserRole.AINSTEIN_ADMIN && organizationFilter !== 'All') {
        partnersToFilter = partnersToFilter.filter(p => p.organizationId === organizationFilter);
    }

    const result = partnersToFilter.filter(partner => {
      const matchesSearchTerm =
        partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        partner.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (partner.region && partner.region.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCountry = countryFilter === 'All' || partner.country === countryFilter;
      const matchesSpecialization = specializationFilter === 'All' || partner.specialization === specializationFilter;
      const matchesIsvType = isvTypeFilter === 'All' || (partner.category === PartnerCategory.ISV && partner.isvType === isvTypeFilter);
      const matchesPartnerCategory = partnerCategoryFilter === 'All' || partner.category === partnerCategoryFilter;
      
      console.log('Debug partner:', partner.name, {
        matchesSearchTerm,
        matchesCountry,
        matchesSpecialization, 
        matchesIsvType,
        matchesPartnerCategory,
        category: partner.category,
        isvType: partner.isvType
      });
      
      return matchesSearchTerm && matchesIsvType && matchesPartnerCategory && matchesCountry && matchesSpecialization;
    });
    
    console.log('Debug - final filtered result:', result.length);
    return result;
  }, [allPartners, searchTerm, user, organizationFilter, isvTypeFilter, countryFilter, partnerCategoryFilter, specializationFilter]);

  const canManagePartners = user?.role === UserRole.ORGANIZATION || user?.role === UserRole.AINSTEIN_ADMIN;
  const secondaryFiltersDisabled = user?.role === UserRole.AINSTEIN_ADMIN && organizationFilter === 'All';

  const handleCreateNewPartner = () => {
    setEditingPartner(null);
    setIsPartnerFormModalOpen(true);
  };

  const handleEditPartner = (partner: Partner) => {
    setEditingPartner(partner);
    setIsPartnerFormModalOpen(true);
  };

  const handleSavePartner = async (partnerData: Omit<Partner, 'id' | 'performanceScore'> | Partner) => {
    setCrudLoading(true);
    try {
      if ('id' in partnerData && partnerData.id) { 
        await api.updatePartner(partnerData.id, partnerData);
      } else { 
        await api.addPartner(partnerData as Omit<Partner, 'id'>);
      }
      setIsPartnerFormModalOpen(false);
      await fetchInitialData(); 
    } catch (error) {
      console.error(t('errorSavingPartner'), error);
      // Error toast is already shown by the API hook
    }
    setCrudLoading(false);
  };

  const handleDeletePartner = (partner: Partner) => {
    setConfirmModalContent({
        title: t('confirmDeletePartnerTitle'),
        message: `${t('confirmDeletePartnerMessage')} (${partner.name})`,
        confirmText: t('deletePartner')
    });
    setConfirmAction(() => async () => {
        setCrudLoading(true);
        try {
            await api.deletePartner(partner.id);
            setIsConfirmModalOpen(false);
            await fetchInitialData();
        } catch (error) {
            console.error(t('errorDeletingPartner'), error);
            // Error toast is already shown by the API hook
        }
        setCrudLoading(false);
    });
    setIsConfirmModalOpen(true);
  };
  
  const handleTogglePartnerStatus = (partner: Partner) => {
    const newStatus = !partner.isActive;
    setConfirmModalContent({
        title: newStatus ? t('activatePartner') : t('blockPartner'),
        message: `${newStatus ? t('confirmActivatePartnerMessage') : t('confirmBlockPartnerMessage')} (${partner.name})`,
        confirmText: newStatus ? t('activatePartner') : t('blockPartner')
    });
    setConfirmAction(() => async () => {
        setCrudLoading(true);
        try {
            await api.updatePartner(partner.id, { isActive: newStatus });
            setIsConfirmModalOpen(false);
            await fetchInitialData();
            alert(newStatus ? t('partnerActivatedSuccess') : t('partnerBlockedSuccess'));
        } catch(error) {
            console.error(t('errorUpdatingPartnerStatus'), error);
            alert(t('errorUpdatingPartnerStatus') + ': ' + (error as Error).message);
        }
        setCrudLoading(false);
    });
    setIsConfirmModalOpen(true);
  };


  if (loading) {
    return <div className="flex justify-center items-center h-64"><LoadingSpinner size="lg" /></div>;
  }
  
  if (error) {
    return <div className="p-4 bg-red-100 text-red-700 rounded-md text-center">{error}</div>;
  }

  return (
    <div className="bg-slate-100 min-h-screen">
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">{t('partners')}</h1>
            <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                <input
                type="text"
                placeholder={t('searchPartners')}
                className="px-4 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent w-full sm:w-auto"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
                {canManagePartners && (
                    <div className="flex flex-col items-end gap-2">
                        <Button 
                            onClick={handleCreateNewPartner} 
                            disabled={!limitStatus.canAddPartners || limitStatus.loading}
                            leftIcon={
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={ICON_SIZE}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                            } 
                            className="w-full sm:w-auto"
                        >
                            {t('createNewPartner')}
                        </Button>
                        {!limitStatus.loading && (
                            <p className="text-xs text-slate-600">
                                {limitStatus.partnersUsed}/{limitStatus.partnersLimit} partners used
                            </p>
                        )}
                        {!limitStatus.canAddPartners && !limitStatus.loading && (
                            <p className="text-xs text-red-600 text-right">
                                Partner limit reached ({limitStatus.partnersLimit}). 
                                {limitStatus.subscription?.planName === 'Free Trial' ? ' Upgrade to add more.' : ' Contact support to increase limit.'}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-white rounded-lg shadow-md">
            {user?.role === UserRole.AINSTEIN_ADMIN && (
                 <div>
                    <Select
                        id="organization-filter"
                        label={t('filterByOrganization')}
                        options={organizationOptions}
                        value={organizationFilter}
                        onChange={(e) => setOrganizationFilter(e.target.value)}
                    />
                </div>
            )}
            <div>
                <Select
                    id="partner-category-filter"
                    label={t('filterByPartnerCategory')}
                    options={partnerCategoryOptions.map(opt => ({value: opt.value, label: t(opt.labelKey)}))}
                    value={partnerCategoryFilter}
                    onChange={(e) => setPartnerCategoryFilter(e.target.value as PartnerCategory | 'All')}
                    disabled={secondaryFiltersDisabled}
                />
            </div>
             <div>
                <Select
                    id="isv-type-filter"
                    label={t('filterByIsvType')}
                    options={isvTypeOptions.map(opt => ({value: opt.value, label: t(opt.labelKey)}))}
                    value={isvTypeFilter}
                    onChange={(e) => setIsvTypeFilter(e.target.value as ISVPartnerType | 'All')}
                    disabled={secondaryFiltersDisabled}
                />
            </div>
            <div>
                 <Select
                    id="country-filter"
                    label={t('filterByCountry')}
                    options={countryOptions}
                    value={countryFilter}
                    onChange={(e) => setCountryFilter(e.target.value)}
                    disabled={secondaryFiltersDisabled}
                />
            </div>
             <div>
                <Select
                    id="specialization-filter"
                    label={t('filterBySpecialization')}
                    options={specializationOptions}
                    value={specializationFilter}
                    onChange={(e) => setSpecializationFilter(e.target.value)}
                    disabled={secondaryFiltersDisabled}
                />
            </div>
        </div>
      </div>


      {filteredPartners.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPartners.map((partner, index) => (
             <div key={partner.id} className="opacity-0 animate-fadeInUp" style={{ animationDelay: `${index * 50}ms` }}>
                <PartnerCard 
                    partner={partner} 
                    onViewDetails={handleViewDetails} 
                    onEdit={canManagePartners ? handleEditPartner : undefined}
                    onDelete={canManagePartners ? handleDeletePartner : undefined}
                    onToggleStatus={canManagePartners ? handleTogglePartnerStatus : undefined}
                />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState 
            icon={<PartnersIcon />}
            title={t('noResultsFound')}
            message="Try adjusting your search or filter criteria to find what you're looking for."
            action={canManagePartners && limitStatus.canAddPartners && (
                <Button 
                    onClick={handleCreateNewPartner} 
                    disabled={limitStatus.loading}
                    leftIcon={
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={ICON_SIZE}>
                           <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                       </svg>
                   }
                >
                   {t('createNewPartner')}
               </Button>
            )}
        />
      )}

      {isPartnerFormModalOpen && canManagePartners && (
        <PartnerFormModal
            isOpen={isPartnerFormModalOpen}
            onClose={() => setIsPartnerFormModalOpen(false)}
            onSave={handleSavePartner}
            partner={editingPartner}
            isLoading={crudLoading}
        />
      )}

      {isConfirmModalOpen && confirmAction && canManagePartners && (
        <ConfirmationModal
            isOpen={isConfirmModalOpen}
            onClose={() => setIsConfirmModalOpen(false)}
            onConfirm={confirmAction}
            title={confirmModalContent.title}
            message={confirmModalContent.message}
            confirmText={confirmModalContent.confirmText}
            isLoading={crudLoading}
            confirmButtonVariant={confirmModalContent.confirmText.toLowerCase().includes("delete") || confirmModalContent.confirmText.toLowerCase().includes("block") ? "danger" : "primary"}
        />
      )}
    </div>
  );
};

export default PartnersListPage;
