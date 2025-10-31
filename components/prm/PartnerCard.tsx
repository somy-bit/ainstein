
import React from 'react';
import { Partner, UserRole, PartnerCategory } from '../../types';
import Button from '../common/Button';
import { useTranslations } from '../../hooks/useTranslations';
import { ICON_SIZE } from '../../constants';
import { useAuth } from '../../contexts/AuthContext'; 

interface PartnerCardProps {
  partner: Partner;
  onViewDetails: (partnerId: string) => void;
  onEdit?: (partner: Partner) => void; // For Organization role
  onDelete?: (partner: Partner) => void; // For Organization role
  onToggleStatus?: (partner: Partner) => void; // For Organization role
}

const PartnerCard: React.FC<PartnerCardProps> = ({ 
    partner, 
    onViewDetails,
    onEdit,
    onDelete,
    onToggleStatus 
}) => {
  const t = useTranslations();
  const { user } = useAuth(); 

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'platinum': return 'bg-purple-500 text-white';
      case 'gold': return 'bg-yellow-400 text-slate-800';
      case 'silver': return 'bg-slate-400 text-white';
      case 'bronze': return 'bg-orange-400 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  const showIsvDetails = partner.category === PartnerCategory.ISV && 
                         (user?.role === UserRole.PARTNER_MANAGER || user?.role === UserRole.ORGANIZATION);

  const canManagePartner = user?.role === UserRole.ORGANIZATION;

  return (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden transition-all duration-300 flex flex-col h-full hover:shadow-xl hover:-translate-y-1">
      <div className={`p-4 ${getTierColor(partner.tier)}`}>
        <div className="flex justify-between items-start">
            <div>
                <h3 className="text-xl font-bold">{partner.name}</h3>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-block mt-1 ${getTierColor(partner.tier)} border border-white/50`}>
                {partner.tier} {t('tier')}
                </span>
            </div>
            {showIsvDetails && partner.logoUrl && (
                <img src={partner.logoUrl} alt={`${partner.name} logo`} className="h-10 max-w-[100px] object-contain bg-white p-1 rounded-sm" />
            )}
        </div>
         {canManagePartner && (
            <div className={`mt-2 text-xs font-semibold px-2 py-1 rounded-full inline-block ${partner.isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                {partner.isActive ? t('active') : t('blocked')}
            </div>
        )}
      </div>
      <div className="p-5 space-y-3 flex-grow flex flex-col justify-between">
        <div>
            <div className="mb-2">
                <p className="text-xs text-slate-400">{t('partnerCategory')}</p>
                <p className="text-sm font-medium text-slate-600">
                    {partner.category === PartnerCategory.ISV ? t('isvPartner') : t('siPartner')}
                    {partner.category === PartnerCategory.ISV && partner.isvType && ` - ${t(`isvType${partner.isvType}`)}`}
                </p>
            </div>
            <div>
                <p className="text-sm text-slate-500">{t('specialization')}</p>
                <p className="text-md font-medium text-slate-700">{partner.specialization}</p>
            </div>
            <div>
                <p className="text-sm text-slate-500">{t('region')}</p>
                <p className="text-md font-medium text-slate-700">{partner.region}</p>
            </div>
             {(user?.role === UserRole.PARTNER_MANAGER || user?.role === UserRole.ORGANIZATION) && partner.country && (
                <div>
                    <p className="text-sm text-slate-500">{t('country')}</p>
                    <p className="text-md font-medium text-slate-700">{partner.country}</p>
                </div>
            )}

            {showIsvDetails && (
            <>
                {partner.phone && (
                <div>
                    <p className="text-sm text-slate-500">{t('phone')}</p>
                    <p className="text-md font-medium text-slate-700">{partner.phone}</p>
                </div>
                )}
                {partner.website && (
                <div>
                    <p className="text-sm text-slate-500">{t('website')}</p>
                    <a href={partner.website.startsWith('http') ? partner.website : `https://${partner.website}`} target="_blank" rel="noopener noreferrer" className="text-md font-medium text-primary hover:underline">
                        {partner.website}
                    </a>
                </div>
                )}
            </>
            )}
             <div>
                <p className="text-sm text-slate-500">{t('contactEmail')}</p>
                <a href={`mailto:${partner.contactEmail}`} className="text-md font-medium text-primary hover:underline">
                    {partner.contactEmail}
                </a>
            </div>
        </div>
        
        <div className="mt-auto">
            <div className="my-3">
                <p className="text-sm text-slate-500">{t('performance')}</p>
                <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div
                    className="bg-primary h-2.5 rounded-full"
                    style={{ width: `${partner.performanceScore}%` }}
                    ></div>
                </div>
                <p className="text-xs text-slate-600 text-right mt-1">{partner.performanceScore}%</p>
            </div>
            <div className="pt-3 space-y-2">
                <Button 
                    onClick={() => onViewDetails(partner.id)} 
                    variant="primary" 
                    size="sm" 
                    className="w-full"
                    rightIcon={
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={ICON_SIZE}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                    }
                >
                    {t('viewDetails')}
                </Button>
                {canManagePartner && onEdit && onDelete && onToggleStatus && (
                    <div className="grid grid-cols-3 gap-2">
                         <Button onClick={() => onEdit(partner)} variant="secondary" size="sm" title={t('editPartner')}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={ICON_SIZE}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                        </Button>
                        <Button onClick={() => onToggleStatus(partner)} variant={partner.isActive ? "ghost" : "secondary"} size="sm" title={partner.isActive ? t('blockPartner') : t('activatePartner')} className={partner.isActive ? "hover:bg-yellow-100" : "hover:bg-green-100"}>
                            {partner.isActive ? 
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`${ICON_SIZE} text-yellow-600`}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                                : 
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`${ICON_SIZE} text-green-600`}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            }
                        </Button>
                        <Button onClick={() => onDelete(partner)} variant="danger" size="sm" title={t('deletePartner')}>
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={ICON_SIZE}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c1.153 0 2.243.096 3.222.261m3.478-.397L12 4.646M12 4.646l-1.127-1.082A48.349 48.349 0 015.026 2.75M12 4.646L12.008 17" /></svg>
                        </Button>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerCard;