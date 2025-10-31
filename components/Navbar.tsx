
import React from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { SUPPORTED_LANGUAGES, ICON_SIZE } from '../constants';
import { Language, MainView, LanguageOption } from '../types';
import Select from './common/Select';
import Button from './common/Button';
import UserMenuDropdown from './common/UserMenuDropdown';

interface NavbarProps {
  onViewChange: (view: MainView) => void;
  onToggleSidebar?: () => void;
  isSidebarEffectivelyOpen?: boolean;
}

const PrmPortalIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={ICON_SIZE}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
  </svg>
);

const AiAgentChatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={ICON_SIZE}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
  </svg>
);

const Navbar: React.FC<NavbarProps> = ({ onViewChange, onToggleSidebar, isSidebarEffectivelyOpen }) => {
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();

  const languageOptions: LanguageOption[] = SUPPORTED_LANGUAGES;
  const currentView: MainView = location.pathname.startsWith('/prm') ? 'prm_portal' : 'ai_agent';

  return (
    <nav className="bg-slate-800 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex flex-wrap justify-between items-center">
        <div className="flex items-center space-x-2 sm:space-x-4">
          {currentView === 'prm_portal' && onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-700 md:hidden"
              aria-label="Toggle sidebar"
            >
              {isSidebarEffectivelyOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          )}
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-7 h-7 sm:w-8 sm:h-8 text-primary-light`}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-7.5h12c.621 0 1.125-.504 1.125-1.125V11.25c0-.621-.504-1.125-1.125-1.125h-12c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
            <span className="text-lg sm:text-xl font-bold">{t('appName')}</span>
          </div>
        </div>

        <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-2 sm:mt-0 sm:space-x-3">
          <Button
            onClick={() => onViewChange(currentView === 'ai_agent' ? 'prm_portal' : 'ai_agent')}
            size="sm"
            leftIcon={currentView === 'ai_agent' ? <PrmPortalIcon /> : <AiAgentChatIcon />}
            className="bg-accent hover:bg-emerald-600 text-white focus:ring-accent w-full sm:w-auto"
          >
            {currentView === 'ai_agent' ? t('toggleToPrm') : t('toggleToAiAgent')}
          </Button>

          <div className="w-full sm:w-32">
            <Select
              id="language-select"
              options={languageOptions.map(lang => ({ value: lang.code, label: lang.name }))}
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              aria-label={t('selectLanguage')}
              className="bg-slate-700 border-slate-600 focus:ring-primary-light focus:border-primary-light text-sm w-full"
            />
          </div>
          <UserMenuDropdown />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
