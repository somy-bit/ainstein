
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { SUPPORTED_LANGUAGES, USER_ROLES } from '../constants';
import { Language, LanguageOption, UserRole } from '../types';
import Select from '../components/common/Select';
import { useTranslations } from '../hooks/useTranslations';
import UserManagementSection from './settings/UserManagementSection';
import PartnerUserManagementSection from './settings/PartnerUserManagementSection';
import Button from '../components/common/Button';
import ChangePasswordSection from '../components/settings/ChangePasswordSection';
import UserProfileSection from '../components/settings/UserProfileSection';

const RoleDescriptionManager: React.FC = () => {
    const t = useTranslations();
    const [isEditing, setIsEditing] = useState(false);
    
    // In a real app, these would come from a database. Here we use state.
    const [descriptions, setDescriptions] = useState({
        [UserRole.ORGANIZATION]: 'Manages the entire organization account, including users, partners, billing, and knowledge base content.',
        [UserRole.PARTNER_MANAGER]: 'Oversees partner relationships, manages leads, and has visibility into partner performance dashboards.',
        [UserRole.PARTNER_SI]: 'System Integrator partner user. Can manage their own profile, register leads, and interact with the partner network. Sees ISV partners.',
        [UserRole.PARTNER_ISV]: 'Independent Software Vendor partner user. Can manage their own profile, register leads, and interact with the partner network. Sees SI partners.',
    });
    
    const handleDescriptionChange = (role: UserRole, text: string) => {
        setDescriptions(prev => ({ ...prev, [role]: text }));
    };

    return (
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-3">
                 <div>
                    <h3 className="text-lg font-semibold text-slate-800">{t('roleDescriptions')}</h3>
                    <p className="text-sm text-slate-500 max-w-xl">{t('roleDescriptionInfo')}</p>
                </div>
                <Button onClick={() => setIsEditing(!isEditing)}>
                    {isEditing ? t('saveDescriptions') : t('editDescriptions')}
                </Button>
            </div>
            <div className="space-y-4">
                {Object.keys(descriptions).map(roleKey => {
                    const role = roleKey as UserRole;
                    const roleLabel = USER_ROLES.find(r => r.value === role)?.label || role;
                    return (
                        <div key={role}>
                            <label className="block text-md font-medium text-slate-700">{roleLabel}</label>
                            <textarea
                                value={descriptions[role]}
                                onChange={(e) => handleDescriptionChange(role, e.target.value)}
                                disabled={!isEditing}
                                rows={2}
                                className="mt-1 block w-full shadow-sm sm:text-sm border-slate-600 bg-slate-800 text-white rounded-md p-2 focus:ring-primary focus:border-primary disabled:bg-slate-700 disabled:cursor-not-allowed"
                            />
                        </div>
                    )
                })}
            </div>
        </div>
    );
};


const SettingsPage: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const { user } = useAuth();
  const t = useTranslations();

  const languageOptions: LanguageOption[] = SUPPORTED_LANGUAGES;
  const roleLabel = USER_ROLES.find(r => r.value === user?.role)?.label || user?.role;
  const isOrgOrManager = user?.role === UserRole.ORGANIZATION || user?.role === UserRole.PARTNER_MANAGER;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">{t('settings')}</h1>
      
      <div className="max-w-4xl mx-auto space-y-8">
        <UserProfileSection />
        
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl">
            <h3 className="text-lg font-semibold text-slate-800">{t('displayPreferences')}</h3>
            <p className="text-sm text-slate-500 mb-4">
                Customize your language for the AInstein PRM interface.
            </p>
            <div className="max-w-xs">
                <Select
                    id="settings-language-select"
                    label={t('selectLanguage')}
                    options={languageOptions.map(lang => ({ value: lang.code, label: lang.name }))}
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as Language)}
                    className="text-base"
                />
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800">User Information</h3>
                <p className="text-sm text-slate-600">
                    You are currently logged in as: <span className="font-bold text-primary">{user?.name}</span>
                </p>
                 <p className="text-sm text-slate-600">
                    Your role is: <span className="font-bold text-primary">{roleLabel}</span>
                </p>
                <p className="mt-2 text-xs text-slate-500">
                    User role is determined at login and cannot be changed here.
                </p>
            </div>
        </div>
        
        <ChangePasswordSection />

        {user?.role === UserRole.AINSTEIN_ADMIN && <RoleDescriptionManager />}

        {user?.role === UserRole.ORGANIZATION && user.organizationId && (
          <UserManagementSection organizationId={user.organizationId} />
        )}

        {isOrgOrManager && user.organizationId && (
            <PartnerUserManagementSection organizationId={user.organizationId} />
        )}
      </div>
    </div>
  );
};

export default SettingsPage;