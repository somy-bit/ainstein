
import React, { useEffect, Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet, useNavigate, Link } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { StripeProvider } from './contexts/StripeContext';
import { ToastProvider } from './components/common/Toast';
import Navbar from './components/Navbar';
import { useTranslations } from './hooks/useTranslations';
import mermaid from 'mermaid';
import LoadingSpinner from './components/common/LoadingSpinner';

// Lazy load heavy components for code splitting
const PartnerNavigatorAI = lazy(() => import('./components/PartnerNavigatorAI'));
const PRMPortal = lazy(() => import('./components/PRMPortal'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const TermsOfServicePage = lazy(() => import('./pages/TermsOfServicePage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));



const Footer: React.FC = () => {
    const t = useTranslations();
    return (
        <footer className="bg-slate-800 text-slate-400 text-sm mt-auto p-4">
            <div className="container mx-auto text-center">
                <p>© {new Date().getFullYear()} AInstein Global Inc. All rights reserved.</p>
                <div className="mt-2">
                    <Link to="/terms" className="hover:text-white transition-colors mx-2">{t('termsOfService')}</Link>
                    <span className="text-slate-500">|</span>
                    <Link to="/privacy" className="hover:text-white transition-colors mx-2">{t('privacyPolicy')}</Link>
                </div>
            </div>
        </footer>
    );
};

const ProtectedRoute: React.FC = () => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <MainLayout /> : <Navigate to="/login" replace />;
};

const MainLayout: React.FC = () => {
    const [navbarHeight, setNavbarHeight] = React.useState(80);
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(window.innerWidth >= 768);
    const navigate = useNavigate();

    useEffect(() => {
        mermaid.initialize({ startOnLoad: false, theme: 'neutral' });
    }, []);

    useEffect(() => {
        const navbarElement = document.querySelector('nav');
        if (navbarElement) {
            const height = navbarElement.offsetHeight;
            setNavbarHeight(height);
            document.documentElement.style.setProperty('--navbar-height', `${height}px`);
        }
        
        const handleResize = () => {
             setIsSidebarOpen(window.innerWidth >= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleViewChange = (view: 'ai_agent' | 'prm_portal') => {
        if (view === 'ai_agent') {
            navigate('/ai-agent');
        } else {
            navigate('/prm'); // Default to PRM root, which will navigate to the correct dashboard
        }
        if (window.innerWidth < 768) {
            setIsSidebarOpen(false);
        }
    };

    const toggleSidebar = React.useCallback(() => {
        setIsSidebarOpen(prev => !prev);
    }, []);

    const closeSidebar = React.useCallback(() => {
        setIsSidebarOpen(false);
    }, []);

    return (
        <>
            <Navbar
                onViewChange={handleViewChange}
                onToggleSidebar={toggleSidebar}
                isSidebarEffectivelyOpen={isSidebarOpen}
            />
            <div className="flex-grow h-[calc(100vh-var(--navbar-height,80px))]">
                <Suspense fallback={<div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}>
                    <Routes>
                        <Route path="/ai-agent" element={<PartnerNavigatorAI />} />
                        <Route
                            path="/prm/*"
                            element={<PRMPortal isSidebarOpen={isSidebarOpen} onCloseSidebar={closeSidebar} />}
                        />
                        <Route path="*" element={<Navigate to="/ai-agent" replace />} />
                    </Routes>
                </Suspense>
            </div>
        </>
    );
};


const AppContent: React.FC = () => {
    const { isLoading } = useAuth();

    if (isLoading) {
        return <div className="h-screen w-screen flex items-center justify-center bg-slate-100"><LoadingSpinner size="lg" /></div>;
    }

    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-grow">
                <Suspense fallback={<div className="flex justify-center items-center h-64"><LoadingSpinner /></div>}>
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/terms" element={<TermsOfServicePage />} />
                        <Route path="/privacy" element={<PrivacyPolicyPage />} />
                        <Route path="/*" element={<ProtectedRoute />} />
                    </Routes>
                </Suspense>
            </main>
            <Footer />
        </div>
    );
}


const App: React.FC = () => {
    return (
        <HashRouter>
            <LanguageProvider>
                <AuthProvider>
                    <StripeProvider>
                        <ToastProvider>
                            <AppContent />
                        </ToastProvider>
                    </StripeProvider>
                </AuthProvider>
            </LanguageProvider>
        </HashRouter>
    );
};

export default App;