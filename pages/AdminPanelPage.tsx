import React, { useState, useEffect } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { UserRole, Organization, SubscriptionPlan, StripeConfig, OrganizationCreationData, OrganizationUpdateData } from '../types';
import * as api from "../services/backendApiService";
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import CreateOrganizationModal from '../components/prm/CreateOrganizationModal';
import EditOrganizationModal from '../components/prm/EditOrganizationModal';
import StripeIntegrationSection from '../components/subscription/StripeIntegrationSection';
import PlanManagement from '../components/admin/PlanManagement';
import { ICON_SIZE } from '../constants';

const AdminPanelPage: React.FC = () => {
    const t = useTranslations();
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [subscriptions, setSubscriptions] = useState<SubscriptionPlan[]>([]);
    const [stripeConfig, setStripeConfig] = useState<StripeConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string|null>(null);
    const [activeTab, setActiveTab] = useState('organizations');
    const [isCreateOrgModalOpen, setIsCreateOrgModalOpen] = useState(false);
    const [isEditOrgModalOpen, setIsEditOrgModalOpen] = useState(false);
    const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('🔄 Fetching admin data...');
            const [orgs, subs, stripe] = await Promise.all([
                api.getOrganizations(), 
                api.getAllSubscriptions(),
                api.getPlatformStripeConfig()
            ]);
            console.log('📊 Fetched data:', {
                orgs: orgs.length,
                subs: subs.length
            });
            setOrganizations(orgs);
            setSubscriptions(subs);
            setStripeConfig(stripe as StripeConfig);
        } catch (err) {
            console.error("❌ Error fetching admin data:", err);
            setError((err as Error).message || "Failed to fetch admin data.");
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleToggleOrgStatus = async (org: Organization) => {
        const newStatus = !org.isActive;
        // Optimistic UI update
        setOrganizations(orgs => orgs.map(o => o.id === org.id ? {...o, isActive: newStatus} : o));
        try {
            await api.updateOrganization(org.id, { isActive: newStatus });
        } catch(err) {
            alert("Failed to update status. Reverting change.");
            // Revert on failure
            setOrganizations(orgs => orgs.map(o => o.id === org.id ? {...o, isActive: !newStatus} : o));
        }
    };
    
    const handleSaveOrganization = async (orgData: OrganizationCreationData) => {
        setIsSubmitting(true);
        try {
            await api.addOrganization(orgData);
            alert(t('organizationCreatedSuccessMessage'));
            fetchData();
            setIsCreateOrgModalOpen(false);
        } catch (error) {
            alert(t('errorCreatingOrganization'));
            console.error(error);
        }
        setIsSubmitting(false);
    }

    const handleOpenEditModal = (org: Organization) => {
        setEditingOrg(org);
        setIsEditOrgModalOpen(true);
    };

    const handleDeleteOrganization = async (org: Organization) => {
        if (!confirm(`Are you sure you want to delete "${org.name}"? This will permanently delete the organization, all its users, subscription, and knowledge base files. This action cannot be undone.`)) {
            return;
        }
        
        try {
            await api.deleteOrganization(org.id);
            alert('Organization deleted successfully!');
            fetchData();
        } catch (error) {
            alert('Error deleting organization.');
            console.error(error);
        }
    };

    const handleUpdateOrganization = async (orgId: string, orgData: Partial<Organization>) => {
        setIsSubmitting(true);
        try {
            await api.updateOrganization(orgId, orgData);
            alert('Organization updated successfully!');
            fetchData();
            setIsEditOrgModalOpen(false);
            setEditingOrg(null);
        } catch (error) {
            alert('Error updating organization.');
            console.error(error);
        }
        setIsSubmitting(false);
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64"><LoadingSpinner size="lg" /></div>;
    }

    if(error) {
        return <div className="p-4 bg-red-100 text-red-700 rounded-md text-center">{error}</div>;
    }
    
    const getSubscriptionForOrg = (orgId: string) => {
        return subscriptions.find(sub => sub.orgId === orgId);
    }

    return (
        <div className="bg-slate-100 min-h-screen">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-6">{t('adminPanel')}</h1>

            <div className="mb-4 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('organizations')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'organizations' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    >
                        {t('manageOrganizations')}
                    </button>
                    <button
                        onClick={() => setActiveTab('subscriptions')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'subscriptions' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    >
                        {t('subscriptions')}
                    </button>
                    <button
                        onClick={() => setActiveTab('plans')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'plans' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    >
                        Plan Management
                    </button>
                    <button
                        onClick={() => setActiveTab('integrations')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'integrations' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    >
                        {t('platformIntegrations')}
                    </button>
                </nav>
            </div>

            {activeTab === 'organizations' && (
                <div className="bg-white shadow-lg rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-slate-700">{t('manageOrganizations')}</h2>
                        <Button size="sm" onClick={() => setIsCreateOrgModalOpen(true)}>{t('createOrganization')}</Button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-100">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Organization Name</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {organizations.map(org => (
                                    <tr key={org.id}>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-800">{org.name}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${org.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {org.isActive ? t('active') : t('blocked')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm space-x-2 flex items-center">
                                            <label htmlFor={`toggle-${org.id}`} className="flex items-center cursor-pointer">
                                                <div className="relative">
                                                    <input type="checkbox" id={`toggle-${org.id}`} className="sr-only" checked={org.isActive} onChange={() => handleToggleOrgStatus(org)} />
                                                    <div className="block bg-gray-600 w-10 h-6 rounded-full"></div>
                                                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${org.isActive ? 'transform translate-x-full bg-primary' : ''}`}></div>
                                                </div>
                                            </label>
                                            <Button variant="secondary" size="sm" onClick={() => handleOpenEditModal(org)} leftIcon={
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={ICON_SIZE}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                </svg>
                                            }>
                                                Edit
                                            </Button>
                                            <Button variant="danger" size="sm" onClick={() => handleDeleteOrganization(org)} leftIcon={
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={ICON_SIZE}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                </svg>
                                            }>
                                                Delete
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            {activeTab === 'subscriptions' && (
                 <div className="bg-white shadow-lg rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-slate-700 mb-4">{t('subscriptions')}</h2>
                     <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-100">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Organization</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Plan</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Renewal Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {organizations.map(org => {
                                    const sub = getSubscriptionForOrg(org.id);
                                    return (
                                        <tr key={org.id}>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-800">{org.name}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">{sub?.planName || 'N/A'}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                 <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${sub?.status === 'Active' || sub?.status === 'Trial' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {sub?.status || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">{sub ? new Date(sub.renewalDate).toLocaleDateString() : 'N/A'}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                     </div>
                </div>
            )}

            {activeTab === 'plans' && (
                <PlanManagement onRefresh={fetchData} />
            )}

            {activeTab === 'integrations' && stripeConfig && (
                <StripeIntegrationSection stripeConfig={stripeConfig} onUpdate={fetchData} />
            )}
            
            <CreateOrganizationModal 
                isOpen={isCreateOrgModalOpen}
                onClose={() => setIsCreateOrgModalOpen(false)}
                onSave={handleSaveOrganization}
                isLoading={isSubmitting}
            />

            <EditOrganizationModal
                isOpen={isEditOrgModalOpen}
                onClose={() => { setIsEditOrgModalOpen(false); setEditingOrg(null); }}
                onSave={handleUpdateOrganization}
                isLoading={isSubmitting}
                organization={editingOrg}
            />

        </div>
    );
};

export default AdminPanelPage;
