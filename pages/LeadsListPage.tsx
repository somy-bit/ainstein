import React, { useEffect, useState } from 'react';
import { Lead, UserRole, ReferralType, ReferralProgramConfig } from '../types';
import * as api from "../services/backendApiService";
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useTranslations } from '../hooks/useTranslations';
import Select from '../components/common/Select';
import Button from '../components/common/Button';
import LeadFormModal from '../components/prm/LeadFormModal';
import EmptyState from '../components/common/EmptyState';
import { ICON_SIZE } from '../constants';

const LeadsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>;

const LeadsListPage: React.FC = () => {
  const t = useTranslations();
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [config, setConfig] = useState<ReferralProgramConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const fetchLeadsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [leadsData, configData] = await Promise.all([
        api.getLeads(),
        user?.organizationId ? api.getReferralProgramConfig(user.organizationId) : Promise.resolve(null)
      ]);
      
      const isPartner = user?.role === UserRole.PARTNER_SI || user?.role === UserRole.PARTNER_ISV;
      if (isPartner && user.partnerId) {
        setLeads(leadsData.filter(lead => lead.partnerId === user.partnerId));
      } else {
        setLeads(leadsData);
      }
      setConfig(configData);
    } catch (err) {
      console.error("Error fetching leads:", err);
      setError((err as Error).message || "Failed to fetch leads.");
    }
    setLoading(false);
  };

  const getCommissionRate = (lead: Lead) => {
    if (lead.commissionRateApplied) {
      return lead.commissionRateApplied;
    }
    
    if (config) {
      return lead.referralType === ReferralType.RESELLER 
        ? config.resellerCommissionRate 
        : config.leadReferralCommissionRate;
    }
    
    return lead.referralType === ReferralType.RESELLER ? 10 : 5;
  };

  const getCommissionAmount = (lead: Lead) => {
    if (lead.commissionAmount) {
      return lead.commissionAmount;
    }
    
    const rate = getCommissionRate(lead);
    return lead.value * (rate / 100);
  };

  useEffect(() => {
    fetchLeadsData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const leadStatuses: string[] = ['All', 'New', 'Qualified', 'Contacted', 'Converted', 'Lost'];
  const statusOptions = leadStatuses.map(s => ({ 
    value: s, 
    label: s === 'All' ? t('allStatuses') : (t(`leadStatus${s.charAt(0).toUpperCase() + s.slice(1)}`) || s) 
  }));

  const filteredLeads = leads.filter(lead => 
    statusFilter === 'All' || lead.status === statusFilter
  );

  const handleCreateNewLead = () => {
    setEditingLead(null);
    setIsModalOpen(true);
  };

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setIsModalOpen(true);
  };

  const handleSaveLead = async (leadData: Omit<Lead, 'id' | 'createdDate'> | Lead) => {
    setFormSubmitting(true);
    try {
      if ('id' in leadData && leadData.id) { 
        await api.updateLead(leadData.id, leadData);
      } else { 
        const newLeadData = leadData as Omit<Lead, 'id'|'createdDate'>;
        await api.addLead(newLeadData);
      }
      setIsModalOpen(false);
      await fetchLeadsData(); 
    } catch (error) {
      console.error("Error saving lead:", error);
      alert(t('error') + ': ' + (error as Error).message);
    }
    setFormSubmitting(false);
  };
  
  const canManageLeads = user?.role === UserRole.PARTNER_MANAGER || user?.role === UserRole.ORGANIZATION;

  if (loading) {
    return <div className="flex justify-center items-center h-64"><LoadingSpinner size="lg" /></div>;
  }
  
  if (error) {
    return <div className="p-4 bg-red-100 text-red-700 rounded-md text-center">{error}</div>;
  }

  return (
    <div className="bg-slate-100 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">{t('leads')}</h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <div className="w-full sm:w-48">
            <Select
              id="status-filter"
              options={statusOptions}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label={t('filterByStatus')}
              className="w-full"
            />
          </div>
          {canManageLeads && (
            <Button 
              onClick={handleCreateNewLead} 
              leftIcon={
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={ICON_SIZE}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              }
              className="w-full sm:w-auto"
            >
              {t('createNewLead')}
            </Button>
          )}
        </div>
      </div>

      {filteredLeads.length > 0 ? (
        <div className="bg-white shadow-lg rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('leadName')}</th>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">{t('partnerName')}</th>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('status')}</th>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden lg:table-cell">{t('createdDate')}</th>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">{t('value')}</th>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden lg:table-cell">{t('commissionRate')}</th>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">{t('commissionAmount')}</th>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredLeads.map((lead, index) => (
                <tr key={lead.id} className="hover:bg-slate-50 transition-colors opacity-0 animate-fadeInUp" style={{ animationDelay: `${index * 30}ms`}}>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    <div>{lead.leadName}</div>
                    <div className="text-xs text-slate-500 md:hidden">{lead.partnerName || 'N/A'}</div>
                    <div className="text-xs text-slate-500 md:hidden mt-1">
                        <span className="font-semibold">{t('value')}:</span> ${lead.value.toLocaleString()}
                        <span className="ml-2">
                            <span className="font-semibold">{t('commissionAmount')}:</span> <span className="text-green-700">{getCommissionAmount(lead).toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</span>
                        </span>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-slate-600 hidden md:table-cell">{lead.partnerName || 'N/A'}</td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      lead.status === 'Converted' ? 'bg-green-100 text-green-800' : 
                      lead.status === 'Lost' ? 'bg-red-100 text-red-800' :
                      lead.status === 'Qualified' ? 'bg-blue-100 text-blue-800' :
                      lead.status === 'Contacted' ? 'bg-sky-100 text-sky-800' : 
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {t(`leadStatus${lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}`) || lead.status}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-slate-600 hidden lg:table-cell">{new Date(lead.createdDate).toLocaleDateString()}</td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-slate-600 hidden md:table-cell">${lead.value.toLocaleString()}</td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-slate-600 hidden lg:table-cell">
                      {getCommissionRate(lead)}%
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-green-700 font-medium hidden md:table-cell">
                      {getCommissionAmount(lead).toLocaleString(undefined, { style: 'currency', currency: 'USD' })}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button 
                        className="text-primary hover:text-primary-dark transition-colors disabled:opacity-50 p-1"
                        title={t('viewDetails')}
                        onClick={() => handleEditLead(lead)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={ICON_SIZE}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>
                    {canManageLeads && (
                       <button 
                            className="text-secondary-dark hover:text-slate-700 transition-colors p-1"
                            title={t('editLead')}
                            onClick={() => handleEditLead(lead)}
                        >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={ICON_SIZE}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                       </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={<LeadsIcon />}
          title={t('noResultsFound')}
          message="There are no leads matching your current filter. Try selecting another status."
          action={canManageLeads && (
            <Button onClick={handleCreateNewLead} leftIcon={
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={ICON_SIZE}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              }
            >
              {t('createNewLead')}
            </Button>
          )}
        />
      )}
      {isModalOpen && canManageLeads && (
        <LeadFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveLead}
          lead={editingLead}
          isLoading={formSubmitting}
        />
      )}
    </div>
  );
};

export default LeadsListPage;
