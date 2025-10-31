import React, { useState, useEffect } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { Organization, SubscriptionPlan, User, Partner } from '../types';
import * as api from "../services/backendApiService";
import LoadingSpinner from '../components/common/LoadingSpinner';

interface OrgMetrics {
    activeUsers: number;
    activePartners: number;
}

const ReportsPage: React.FC = () => {
    const t = useTranslations();
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [subscriptions, setSubscriptions] = useState<SubscriptionPlan[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string|null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [orgsData, subsData, usersData, partnersData] = await Promise.all([
                    api.getOrganizations(),
                    api.getAllSubscriptions(),
                    api.getAllUsers(),
                    api.getPartners()
                ]);
                setOrganizations(orgsData);
                setSubscriptions(subsData);
                setUsers(usersData);
                setPartners(partnersData);
            } catch (err) {
                console.error("Error fetching reports data:", err);
                setError((err as Error).message || "Failed to fetch report data.");
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    const getMetricsForOrg = (orgId: string): OrgMetrics => {
        const activeUsers = users.filter(u => u.organizationId === orgId && u.isActive).length;
        const activePartners = partners.filter(p => p.organizationId === orgId && p.isActive).length;
        return { activeUsers, activePartners };
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64"><LoadingSpinner size="lg" /></div>;
    }

    if(error) {
        return <div className="p-4 bg-red-100 text-red-700 rounded-md text-center">{error}</div>;
    }

    return (
        <div className="bg-slate-100 min-h-screen">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-6">{t('reports')}</h1>

            <div className="bg-white shadow-lg rounded-lg p-6">
                <h2 className="text-xl font-semibold text-slate-700 mb-4">{t('techConsumption')}</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('organizationName')}</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('plan')}</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('price')}</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('activeUsers')}</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('activePartners')}</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('textTokensConsumed')}</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('storageUsed')} (GB)</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {organizations.map(org => {
                                const sub = subscriptions.find(s => s.orgId === org.id);
                                const metrics = getMetricsForOrg(org.id);
                                return (
                                    <tr key={org.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{org.name}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600">{sub?.planName || 'N/A'}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600">${sub?.price || 0}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600 text-center">{metrics.activeUsers}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600 text-center">{metrics.activePartners}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600">
                                            {sub ? `${sub.usage.textTokens.current.toLocaleString()} / ${sub.features.textTokens.limit.toLocaleString()}` : 'N/A'}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600">
                                            {sub ? `${sub.usage.storageGB.current} / ${sub.features.storageGB.limit}` : 'N/A'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;
