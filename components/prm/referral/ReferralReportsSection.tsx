import React, { useState, useMemo, useEffect } from 'react';
import { Lead, ReferralType, Partner, ReferralProgramConfig } from '../../../types';
import { useTranslations } from '../../../hooks/useTranslations';
import Button from '../../common/Button';
import LoadingSpinner from '../../common/LoadingSpinner';
import Select from '../../common/Select';
import EmptyState from '../../common/EmptyState';
import { getPartners } from '../../../services/backendApiService';

interface ReferralReportsSectionProps {
    leads: Lead[];
    isLoading: boolean;
    config: ReferralProgramConfig | null;
}

const ReportsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" /></svg>;

const ReferralReportsSection: React.FC<ReferralReportsSectionProps> = ({ leads, isLoading, config }) => {
    const t = useTranslations();
    const [partners, setPartners] = useState<Partner[]>([]);
    const [partnerFilter, setPartnerFilter] = useState('All');
    const [referralTypeFilter, setReferralTypeFilter] = useState('All');

    useEffect(() => {
        getPartners().then(setPartners).catch(err => console.error("Failed to fetch partners for report filter:", err));
    }, []);

    const filteredLeads = useMemo(() => {
        return leads.filter(lead => {
            const partnerMatch = partnerFilter === 'All' || lead.partnerId === partnerFilter;
            const typeMatch = referralTypeFilter === 'All' || lead.referralType === referralTypeFilter;
            return partnerMatch && typeMatch;
        });
    }, [leads, partnerFilter, referralTypeFilter]);

    const partnerOptions = useMemo(() => {
        const uniquePartnerIds = Array.from(new Set(leads.map(l => l.partnerId)));
        const relevantPartners = partners.filter(p => uniquePartnerIds.includes(p.id));
        return [{ value: 'All', label: t('allPartners') }, ...relevantPartners.map(p => ({ value: p.id, label: p.name }))];
    }, [leads, partners, t]);
    
    const referralTypeOptions = [
        { value: 'All', label: t('allReferralTypes') },
        { value: ReferralType.RESELLER, label: t('referralTypeReseller') },
        { value: ReferralType.LEAD_REFERRAL, label: t('referralTypeLeadReferral') },
    ];
    
    const getCommissionRate = (lead: Lead) => {
        // If commissionRateApplied is set, use it
        if (lead.commissionRateApplied) {
            return lead.commissionRateApplied;
        }
        
        // Otherwise, use config defaults
        if (config) {
            return lead.referralType === ReferralType.RESELLER 
                ? config.resellerCommissionRate 
                : config.leadReferralCommissionRate;
        }
        
        // Fallback defaults if no config
        return lead.referralType === ReferralType.RESELLER ? 10 : 5;
    };

    const getCommissionAmount = (lead: Lead) => {
        // If commissionAmount is explicitly set, use it
        if (lead.commissionAmount) {
            return lead.commissionAmount;
        }
        
        // Otherwise, calculate it: value * (commissionRate / 100)
        const rate = getCommissionRate(lead);
        return lead.value * (rate / 100);
    };

    const getCommissionStatus = (lead: Lead) => {
        // If commissionStatus is explicitly set, use it
        if (lead.commissionStatus) {
            return lead.commissionStatus;
        }
        
        // Otherwise, derive status from lead status
        switch (lead.status) {
            case 'Converted':
                return 'Earned';
            case 'Lost':
                return 'Cancelled';
            default:
                return 'PendingClientPayment';
        }
    };

    const getCommissionStatusStyles = (status?: string) => {
        switch (status) {
            case 'Paid': return 'bg-green-100 text-green-800';
            case 'Earned': return 'bg-blue-100 text-blue-800';
            case 'PendingClientPayment': return 'bg-yellow-100 text-yellow-800';
            case 'Cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };
       

    const exportToCsv = () => {
        let csvContent = "data:text/csv;charset=utf-8,";
        const headers = [
            t('referralId'), t('referringPartner'), t('referralType'), t('referredClient'),
            t('netSaleValue'), t('commissionRate'), t('commissionAmount'), t('commissionStatus'), t('dealClosureDate')
        ].join(',');
        csvContent += headers + "\r\n";

        filteredLeads.forEach(lead => {
            const row = [
                lead.id,
                lead.partnerName,
                lead.referralType,
                lead.leadName,
                lead.value,
                getCommissionRate(lead),
                getCommissionAmount(lead),
                getCommissionStatus(lead),
                new Date(lead.createdDate).toLocaleDateString()
            ].join(',');
            csvContent += row + "\r\n";
        });
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "referral_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="bg-white shadow-lg rounded-lg p-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                <h2 className="text-xl font-semibold text-slate-700">{t('referralReports')}</h2>
                 <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                     <Select options={partnerOptions} value={partnerFilter} onChange={e => setPartnerFilter(e.target.value)} />
                     <Select options={referralTypeOptions} value={referralTypeFilter} onChange={e => setReferralTypeFilter(e.target.value)} />
                     <Button variant="secondary" onClick={exportToCsv}>{t('exportToCsv')}</Button>
                 </div>
            </div>

            {isLoading ? <LoadingSpinner /> : filteredLeads.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">{t('referralId')}</th>
                                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('referredClient')}</th>
                                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden lg:table-cell">{t('referringPartner')}</th>
                                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">{t('referralType')}</th>
                                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">{t('netSaleValue')}</th>
                                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden xl:table-cell">{t('commissionRate')}</th>
                                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('commissionAmount')}</th>
                                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('commissionStatus')}</th>
                                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden lg:table-cell">{t('dealClosureDate')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {filteredLeads.map(lead => (
                                <tr key={lead.id}>
                                    <td className="px-3 py-4 whitespace-nowrap text-xs text-slate-500 hidden sm:table-cell">{lead.id}</td>
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-slate-900">{lead.leadName}</div>
                                        <div className="text-xs text-slate-500 lg:hidden">{lead.partnerName}</div>
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm text-slate-600 hidden lg:table-cell">{lead.partnerName}</td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm text-slate-600 hidden md:table-cell">{t(`referralType${lead.referralType}`)}</td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm text-slate-600 hidden sm:table-cell">{lead.value.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm text-slate-600 hidden xl:table-cell">{getCommissionRate(lead)}%</td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm text-slate-600">
                                        <div className="font-semibold text-green-700">{getCommissionAmount(lead).toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</div>
                                        <div className="text-xs text-slate-500 xl:hidden">{getCommissionRate(lead)}% {t('commissionRate')}</div>
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getCommissionStatusStyles(getCommissionStatus(lead))}`}>
                                            {t(`commissionStatus${getCommissionStatus(lead)}`)}
                                        </span>
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm text-slate-500 hidden lg:table-cell">{new Date(lead.createdDate).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <EmptyState 
                    icon={<ReportsIcon />}
                    title="No Commission Reports"
                    message="There are no converted leads with commissions to display yet. Once referred leads are converted to customers, their commission details will appear here."
                />
            )}
        </div>
    );
};

export default ReferralReportsSection;
