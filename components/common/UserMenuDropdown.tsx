
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslations } from '../../hooks/useTranslations';
import ConfirmationModal from './ConfirmationModal';
import { ICON_SIZE } from '../../constants';

const UserMenuDropdown: React.FC = () => {
    const { user, logout } = useAuth();
    const t = useTranslations();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const toggleDropdown = () => setIsOpen(!isOpen);

    const handleLogout = () => {
        setIsLogoutModalOpen(false);
        logout();
        navigate('/login');
    };

    const handleNavigate = (path: string) => {
        setIsOpen(false);
        navigate(path);
    };
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!user) return null;

    const userInitials = (user.name?.charAt(0) || '') + (user.lastNamePaternal?.charAt(0) || '');

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className="flex items-center space-x-2 p-1 rounded-full text-slate-300 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-primary-light"
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary-dark text-white font-bold text-sm">
                    {userInitials || user.name.charAt(0)}
                </div>
                <span className="text-sm font-medium hidden sm:inline">{user.name}</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
            </button>
            {isOpen && (
                <div 
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none py-1 transform opacity-0 scale-95 animate-dropdownEnter" 
                    role="menu" 
                    aria-orientation="vertical" 
                    aria-labelledby="user-menu-button"
                >
                    <button
                        onClick={() => handleNavigate('/prm/settings')}
                        className="w-full text-left flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                        role="menuitem"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`${ICON_SIZE} mr-2`}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.096.573.397 1.076.784 1.464l.992.992c.37.37.86.594 1.376.594h1.032c.518 0 .984.224 1.296.578.313.354.417.82.285 1.25l-.213 1.28c-.096.573-.397 1.076-.784 1.464l-.992.992c-.37.37-.86.594-1.376.594h-1.032c-.518 0-.984-.224-1.296-.578a1.51 1.51 0 01-.285-1.25l.213-1.28c.096-.573.397-1.076.784-1.464l.992.992c.37-.37.86-.594 1.376.594h1.032c.518 0 .984.224 1.296.578.313.354.417.82.285 1.25l-.213-1.281c-.096-.573-.397-1.076-.784-1.464l-.992-.992c-.37-.37-.86-.594-1.376-.594h-1.032c-.518 0-.984-.224-1.296-.578a1.51 1.51 0 01-.285-1.25l.213-1.281A1.51 1.51 0 0113.5 3.94m-4.094 0c-.09.542-.56.94-1.11.94H5.703c-.55 0-1.02-.398-1.11-.94L4.38 2.659c-.096-.573-.397-1.076-.784-1.464L2.604.203c-.37-.37-.86-.594-1.376-.594H.196c-.518 0-.984.224-1.296.578C-1.413 1.132-1.517 1.598-1.385 2.03l.213 1.28c.096.573.397 1.076.784 1.464l.992.992c.37.37.86.594 1.376.594h1.032c.518 0 .984.224 1.296.578.313.354.417.82.285 1.25l-.213 1.28c-.096.573-.397 1.076-.784 1.464l-.992.992c-.37.37-.86.594-1.376.594H.196c-.518 0-.984-.224-1.296-.578a1.51 1.51 0 01-.285-1.25l.213-1.28A1.51 1.51 0 010 10.06m9.594-6.12c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.096.573.397 1.076.784 1.464l.992.992c.37.37.86.594 1.376.594h1.032c.518 0 .984.224 1.296.578.313.354.417.82.285 1.25l-.213 1.28c-.096.573-.397 1.076-.784 1.464l-.992.992c-.37.37-.86.594-1.376.594h-1.032c-.518 0-.984-.224-1.296-.578a1.51 1.51 0 01-.285-1.25l.213-1.28c.096-.573.397-1.076.784-1.464l.992.992c.37-.37.86-.594 1.376.594h1.032c.518 0 .984.224 1.296.578.313.354.417.82.285 1.25l-.213-1.281c-.096-.573-.397-1.076-.784-1.464l-.992-.992c-.37-.37-.86-.594-1.376-.594h-1.032c-.518 0-.984-.224-1.296-.578a1.51 1.51 0 01-.285-1.25l.213-1.281A1.51 1.51 0 0113.5 3.94M4.5 12a7.5 7.5 0 1115 0 7.5 7.5 0 01-15 0z" /></svg>
                        {t('settings')}
                    </button>
                    <button
                        onClick={() => { setIsOpen(false); setIsLogoutModalOpen(true); }}
                        className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        role="menuitem"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`${ICON_SIZE} mr-2`}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
                        {t('logout')}
                    </button>
                </div>
            )}

            <ConfirmationModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={handleLogout}
                title={t('confirmLogoutTitle')}
                message={t('confirmLogoutMessage')}
                confirmText={t('logout')}
                confirmButtonVariant="danger"
            />
        </div>
    );
};

export default UserMenuDropdown;
