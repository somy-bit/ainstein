import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslations } from '../hooks/useTranslations';
import { UserRole, SubscriptionPlan } from '../types';
import { getSubscriptionForOrg } from '../services/backendApiService';
import DashboardPage from '../pages/DashboardPage';
import PartnersListPage from '../pages/PartnersListPage';
import PartnerProfilePage from '../pages/PartnerProfilePage';
import LeadsListPage from '../pages/LeadsListPage';
import MarketingCalendarPage from '../pages/MarketingCalendarPage';
import PRMKnowledgeBasePage from '../pages/PRMKnowledgeBasePage';
import SettingsPage from '../pages/SettingsPage';
import AdminPanelPage from '../pages/AdminPanelPage';
import PartnerNetworkPage from '../pages/PartnerNetworkPage';
import SubscriptionPage from '../pages/SubscriptionPage';
import ReportsPage from '../pages/ReportsPage';
import ReferralProgramPage from '../pages/ReferralProgramPage';
import { ICON_SIZE } from '../constants';

interface SidebarLinkProps {
  to: string;
  label: string;
  icon: React.ReactNode;
  onClick?: () => void; // For closing sidebar on mobile after navigation
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, label, icon, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/prm' && location.pathname.startsWith(`${to}`));
  
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-primary-light hover:text-white transition-colors duration-200 ease-in-out group
                  ${isActive ? 'bg-primary text-white shadow-md' : 'text-slate-100 hover:bg-slate-600'}`}
    >
      <span className={`group-hover:text-white ${isActive ? 'text-white': 'text-slate-300'}`}>{icon}</span>
      <span className="font-medium">{label}</span>
    </Link>
  );
};

interface PRMPortalProps {
  isSidebarOpen: boolean;
  onCloseSidebar: () => void;
}

const PRMPortal: React.FC<PRMPortalProps> = ({ isSidebarOpen, onCloseSidebar }) => {
  const { user, subscription } = useAuth();
  const t = useTranslations();

  const isPartnerRole = user?.role === UserRole.PARTNER_SI || user?.role === UserRole.PARTNER_ISV;

  const navItems = [
    { path: "/prm/dashboard", label: t('dashboard'), roles: [UserRole.PARTNER_MANAGER, UserRole.ORGANIZATION], icon: <DashboardIcon/> },
    { path: "/prm/partners", label: t('partners'), roles: [UserRole.PARTNER_SI, UserRole.PARTNER_ISV, UserRole.PARTNER_MANAGER, UserRole.ORGANIZATION, UserRole.AINSTEIN_ADMIN], icon: <PartnersIcon/> },
    { path: "/prm/network", label: t('partnerNetwork'), roles: [UserRole.PARTNER_SI, UserRole.PARTNER_ISV, UserRole.PARTNER_MANAGER, UserRole.ORGANIZATION], icon: <PartnerNetworkIcon/> },
    { path: "/prm/leads", label: t('leads'), roles: [UserRole.PARTNER_SI, UserRole.PARTNER_ISV, UserRole.PARTNER_MANAGER, UserRole.ORGANIZATION], icon: <LeadsIcon/> },
    { path: "/prm/marketing-calendar", label: t('marketingCalendar'), roles: [UserRole.PARTNER_SI, UserRole.PARTNER_ISV, UserRole.PARTNER_MANAGER, UserRole.ORGANIZATION], icon: <CalendarIcon/> },
    { path: "/prm/knowledge-base", label: t('knowledgeBase'), roles: [UserRole.ORGANIZATION, UserRole.PARTNER_SI, UserRole.PARTNER_ISV], icon: <KnowledgeIcon/> },
    { path: "/prm/referral-program", label: t('referralProgram'), roles: [UserRole.ORGANIZATION], icon: <ReferralProgramIcon /> },
    { path: "/prm/subscription", label: t('subscriptionAndBilling'), roles: [UserRole.ORGANIZATION], icon: <SubscriptionIcon />},
    { path: "/prm/reports", label: t('reports'), roles: [UserRole.AINSTEIN_ADMIN], icon: <ReportsIcon /> },
    { path: "/prm/settings", label: t('settings'), roles: [UserRole.PARTNER_SI, UserRole.PARTNER_ISV, UserRole.PARTNER_MANAGER, UserRole.ORGANIZATION, UserRole.AINSTEIN_ADMIN], icon: <SettingsIcon/> },
    { path: "/prm/admin", label: t('adminPanel'), roles: [UserRole.AINSTEIN_ADMIN], icon: <AdminIcon /> },
  ];

  const availableNavItems = navItems.filter(item => user && item.roles.includes(user.role));
  
  let defaultPath = "/prm/dashboard";
  if (isPartnerRole) {
      defaultPath = "/prm/network";
  } else if (user?.role === UserRole.AINSTEIN_ADMIN) {
      defaultPath = "/prm/admin";
  }

  const handleLinkClick = () => {
    if (window.innerWidth < 768) { // md breakpoint
        onCloseSidebar();
    }
  };
  
  const isTrial = subscription?.status === 'Trial';
  const daysLeft = (isTrial && subscription?.renewalDate) ? Math.ceil((new Date(subscription.renewalDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div className="flex h-full">
      {/* Backdrop for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={onCloseSidebar}
          aria-hidden="true"
        ></div>
      )}

      <aside 
        className={`bg-slate-700 text-white p-5 space-y-3 shadow-lg overflow-y-auto 
                   fixed inset-y-0 left-0 top-[var(--navbar-height,80px)] h-[calc(100vh-var(--navbar-height,80px))] bottom-0
                   w-64 transform transition-transform duration-300 ease-in-out z-40 
                   ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                   md:relative md:translate-x-0 md:h-full md:z-auto`}
      >
        <nav>
          <ul>
            {isPartnerRole && user?.partnerId && (
                <li>
                    <SidebarLink to={`/prm/partners/${user.partnerId}`} label={t('myPartnerProfile')} icon={<ProfileIcon/>} onClick={handleLinkClick} />
                </li>
            )}
            {availableNavItems.map(item => (
              <li key={item.path}>
                <SidebarLink to={item.path} label={item.label} icon={item.icon} onClick={handleLinkClick} />
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto bg-slate-100 p-0 md:p-0">
        {isTrial && daysLeft > 0 && (
            <div className="bg-primary text-white text-center p-2 text-sm sticky top-0 z-20 shadow">
                {t('trialBannerMessage', { days: daysLeft })}
                <Link to="/prm/subscription" className="font-bold underline ml-2 hover:text-primary-light transition-colors">
                    {t('manageSubscription')}
                </Link>
            </div>
        )}
        <div className="p-4 sm:p-6">
            <Routes>
                {(user?.role === UserRole.PARTNER_MANAGER || user?.role === UserRole.ORGANIZATION) && <Route path="/dashboard" element={<DashboardPage />} />}
                <Route path="/partners" element={<PartnersListPage />} />
                <Route path="/partners/:partnerId" element={<PartnerProfilePage />} />
                <Route path="/network" element={<PartnerNetworkPage />} />
                <Route path="/leads" element={<LeadsListPage />} />
                <Route path="/marketing-calendar" element={<MarketingCalendarPage />} />
                {user?.role === UserRole.ORGANIZATION && <Route path="/referral-program" element={<ReferralProgramPage />} />}
                {user?.role === UserRole.ORGANIZATION && <Route path="/subscription" element={<SubscriptionPage />} />}
                {(user?.role === UserRole.ORGANIZATION || isPartnerRole) && <Route path="/knowledge-base" element={<PRMKnowledgeBasePage />} />}
                {user?.role === UserRole.AINSTEIN_ADMIN && <Route path="/reports" element={<ReportsPage />} />}
                <Route path="/settings" element={<SettingsPage />} />
                {user?.role === UserRole.AINSTEIN_ADMIN && <Route path="/admin" element={<AdminPanelPage />} />}
                <Route path="*" element={<Navigate to={defaultPath} replace />} />
            </Routes>
        </div>
      </main>
    </div>
  );
};

// Icons
const DashboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={ICON_SIZE}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h12A2.25 2.25 0 0020.25 14.25V3m-16.5 0h16.5M3.75 3c0-1.125.75-2.25 2.25-2.25h12c1.5 0 2.25 1.125 2.25 2.25M3.75 7.5h16.5M6 16.5v.75A2.25 2.25 0 013.75 19.5h-.75A2.25 2.25 0 01.75 17.25v-1.5A2.25 2.25 0 013 13.5h.75c.621 0 1.125.504 1.125 1.125v1.875c0 .621-.504 1.125-1.125 1.125S4.5 17.25 4.5 16.5z" /></svg>;
const PartnersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={ICON_SIZE}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 9.75V7.5A2.25 2.25 0 015.25 5.25h13.5A2.25 2.25 0 0121 7.5v2.25z" /></svg>;
const LeadsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={ICON_SIZE}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>; 
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={ICON_SIZE}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>;
const KnowledgeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={ICON_SIZE}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={ICON_SIZE}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.096.573.397 1.076.784 1.464l.992.992c.37.37.86.594 1.376.594h1.032c.518 0 .984.224 1.296.578.313.354.417.82.285 1.25l-.213 1.28c-.096.573-.397 1.076-.784 1.464l-.992.992c-.37.37-.86.594-1.376.594h-1.032c-.518 0-.984-.224-1.296-.578a1.51 1.51 0 01-.285-1.25l.213-1.28c.096-.573.397-1.076.784-1.464l.992.992c.37-.37.86-.594 1.376.594h1.032c.518 0 .984.224 1.296.578.313.354.417.82.285 1.25l-.213-1.281c-.096-.573-.397-1.076-.784-1.464l-.992-.992c-.37-.37-.86-.594-1.376-.594h-1.032c-.518 0-.984-.224-1.296-.578a1.51 1.51 0 01-.285-1.25l.213-1.281A1.51 1.51 0 0113.5 3.94m-4.094 0c-.09.542-.56.94-1.11.94H5.703c-.55 0-1.02-.398-1.11-.94L4.38 2.659c-.096-.573-.397-1.076-.784-1.464L2.604.203c-.37-.37-.86-.594-1.376-.594H.196c-.518 0-.984.224-1.296.578C-1.413 1.132-1.517 1.598-1.385 2.03l.213 1.28c.096.573.397 1.076.784 1.464l.992.992c.37.37.86.594 1.376.594h1.032c.518 0 .984.224 1.296.578.313.354.417.82.285 1.25l-.213 1.28c-.096.573-.397 1.076-.784 1.464l-.992.992c-.37.37-.86.594-1.376.594H.196c-.518 0-.984-.224-1.296-.578a1.51 1.51 0 01-.285-1.25l.213-1.28A1.51 1.51 0 010 10.06m9.594-6.12c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.096.573.397 1.076.784 1.464l.992.992c.37.37.86.594 1.376.594h1.032c.518 0 .984.224 1.296.578.313.354.417.82.285 1.25l-.213 1.28c-.096.573-.397 1.076-.784 1.464l-.992.992c-.37.37-.86.594-1.376.594h-1.032c-.518 0-.984-.224-1.296-.578a1.51 1.51 0 01-.285-1.25l.213-1.28c.096-.573.397-1.076.784-1.464l.992.992c.37-.37.86-.594 1.376.594h1.032c.518 0 .984.224 1.296.578.313.354.417.82.285 1.25l-.213-1.281c-.096-.573-.397-1.076-.784-1.464l-.992-.992c-.37-.37-.86-.594-1.376-.594h-1.032c-.518 0-.984-.224-1.296-.578a1.51 1.51 0 01-.285-1.25l.213-1.281A1.51 1.51 0 0113.5 3.94M4.5 12a7.5 7.5 0 1115 0 7.5 7.5 0 01-15 0z" /></svg>;
const PartnerNetworkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={ICON_SIZE}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197" /></svg>;
const AdminIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={ICON_SIZE}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0h9.75" /></svg>;
const SubscriptionIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={ICON_SIZE}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" /></svg>;
const ProfileIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={ICON_SIZE}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>;
const ReportsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={ICON_SIZE}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 100 15 7.5 7.5 0 000-15z" /><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 10.5v.001" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5H21m-4.5 6H21m-8.998-1.914l3.12-3.12m0 0l3.12 3.12m-3.12-3.12L15.373 6" /></svg>;
const ReferralProgramIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={ICON_SIZE}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;


export default PRMPortal;