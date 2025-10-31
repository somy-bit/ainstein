import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslations } from '../hooks/useTranslations';
import { useToast } from '../components/common/Toast';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import MFAModal from '../components/auth/MFAModal';
import ChangePasswordModal from '../components/common/ChangePasswordModal';
import { ValidatedInput } from '../components/common/ValidatedInput';
import { useValidation } from '../hooks/useValidation';
import { validateLogin, type LoginData } from '../utils/validation';
import { APP_NAME } from '../constants';

const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
);

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [recaptchaChecked, setRecaptchaChecked] = useState(false);
 
  const [error, setError] = useState('');
  const { validate, getError, hasError } = useValidation(validateLogin);
  const [recaptchaError, setRecaptchaError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginWithGoogle, mfaRequired, mustChangePassword, verifyMfa, cancelMfa, completePendingLogin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const t = useTranslations();

  useEffect(() => {
    // If the MFA modal is displayed but the user refreshes, we should clear that state.
    // The `checkAuth` in AuthProvider will handle re-logging in if there's a stored session.
    return () => {
      cancelMfa();
    };
  }, [cancelMfa]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate(formData)) {
      return;
    }
    
    setRecaptchaError('');
    if (!recaptchaChecked) {
        setRecaptchaError(t('recaptchaError'));
        return;
    }
    setError('');
    setIsLoading(true);
    try {
     
      const loggedInUser = await login(formData.email, formData.password); // email is used as username
      if (loggedInUser) {
        showToast('Login successful!', 'success');
        if (!loggedInUser.mfaEnabled) {
          navigate('/ai-agent');
        }
       // If MFA is required, the modal will appear automatically. No navigation needed here.
      } else {
          const errorMsg = t('loginFailed');
          setError(errorMsg);
          showToast(errorMsg, 'error');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : t('loginFailed');
      setError(errorMsg);
      showToast(errorMsg, 'error');
    }
    setIsLoading(false);
  };
  
  const handleGoogleSignIn = async () => {
      setError('');
      setIsLoading(true);
      const success = await loginWithGoogle();
      if (!success) {
          const errorMsg = t('loginFailed');
          setError(errorMsg);
          showToast(errorMsg, 'error');
      } else {
          showToast('Google login successful!', 'success');
          navigate('/ai-agent');
      }
      setIsLoading(false);
  }
  
  const handleMfaVerify = async (code: string) => {
      setError('');
      setIsLoading(true);
      const success = await verifyMfa(code);
      if (success) {
          showToast('MFA verification successful!', 'success');
          navigate('/ai-agent');
      } else {
          const errorMsg = t('mfaInvalidCode');
          setError(errorMsg);
          showToast(errorMsg, 'error');
      }
      setIsLoading(false);
  }

  const handleMfaCancel = () => {
      cancelMfa();
      setError(''); // Clear any previous errors
  }

  const handlePasswordChangeSuccess = () => {
    showToast('Password changed successfully!', 'success');
    completePendingLogin();
    navigate('/dashboard');
  };

  if (mustChangePassword) {
      return (
          <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
              <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
                  <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">
                      Password Change Required
                  </h2>
                  <p className="text-slate-600 text-center mb-6">
                      You must change your password before continuing.
                  </p>
                  <ChangePasswordModal
                      isOpen={true}
                      onClose={() => {}} // Prevent closing
                      onSuccess={handlePasswordChangeSuccess}
                  />
              </div>
          </div>
      );
  }

  if (mfaRequired) {
      return (
          <MFAModal 
            isOpen={true} 
            onVerify={handleMfaVerify} 
            onCancel={handleMfaCancel}
            isLoading={isLoading}
            error={error}
          />
      );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
       <div className="flex items-center space-x-4 mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-12 h-12 text-primary`}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-7.5h12c.621 0 1.125-.504 1.125-1.125V11.25c0-.621-.504-1.125-1.125-1.125h-12c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-700">{APP_NAME}</h1>
       </div>
      <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-xl">
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">{t('login')}</h2>
        
        <Button onClick={handleGoogleSignIn} variant="secondary" className="w-full mb-4" leftIcon={
            <svg className="w-5 h-5" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"/>
                <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                <path fill="#1976D2" d="M43.611 20.083H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.012 35.816 44 30.138 44 24c0-1.341-.138-2.65-.389-3.917z"/>
            </svg>
        }>
            {t('signInWithGoogle')}
        </Button>

        <div className="flex items-center my-4">
            <div className="flex-grow border-t border-slate-300"></div>
            <span className="flex-shrink mx-4 text-slate-500 text-sm">{t('or')}</span>
            <div className="flex-grow border-t border-slate-300"></div>
        </div>

        {error && <p className="text-sm text-white bg-red-500/90 rounded-md p-3 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <ValidatedInput
            id="email"
            name="email"
            type="email"
            label={t('email')}
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value.trim() }))}
            error={getError('email')}
            required
            autoComplete="email"
          />

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
              {t('password')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className={`w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  hasError('password') ? 'border-red-500' : 'border-slate-300'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-700"
                aria-label={showPassword ? t('hidePassword') : t('showPassword')}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>
          
           <div className="flex flex-col items-center justify-center mt-4 mb-4">
                <label className={`flex items-center space-x-2 cursor-pointer p-2 border rounded-md ${recaptchaError ? 'border-red-500' : 'border-slate-300'}`} htmlFor="recaptcha">
                    <input
                        id="recaptcha"
                        type="checkbox"
                        checked={recaptchaChecked}
                        onChange={(e) => { setRecaptchaChecked(e.target.checked); setRecaptchaError(''); }}
                        className="h-6 w-6 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-slate-700">{t('recaptchaLabel')}</span>
                </label>
                {recaptchaError && <p className="text-xs text-red-600 mt-1">{recaptchaError}</p>}
            </div>
          
          <div>
            <Button
              type="submit"
              disabled={isLoading || !recaptchaChecked}
              className="w-full"
            >
              {isLoading ? <LoadingSpinner size="sm" color="text-white"/> : t('login')}
            </Button>
          </div>
        </form>
         <div className="text-center mt-6 text-sm">
            <span className="text-slate-600">{t('noAccount')} </span>
            <Link to="/register" className="font-medium text-primary hover:text-primary-dark hover:underline">
                {t('startFreeTrial')}
            </Link>
        </div>
      </div>

      <div className="w-full max-w-sm bg-slate-200 p-4 rounded-lg shadow-md mt-6 border border-slate-300">
          <h3 className="text-center font-semibold text-slate-700 mb-2">{t('demoLoginsTitle')}</h3>
          <ul className="text-xs text-slate-600 space-y-1">
              <li><strong>Admin:</strong> <code className="bg-slate-300 px-1 rounded">admin</code> / <code className="bg-slate-300 px-1 rounded">adminpassword</code></li>
              <li><strong>Org Admin:</strong> <code className="bg-slate-300 px-1 rounded">orgadmin</code> / <code className="bg-slate-300 px-1 rounded">orgpassword</code></li>
              <li><strong>Manager:</strong> <code className="bg-slate-300 px-1 rounded">partnermanager</code> / <code className="bg-slate-300 px-1 rounded">pmpassword</code></li>
              <li><strong>Partner SI:</strong> <code className="bg-slate-300 px-1 rounded">partnersi</code> / <code className="bg-slate-300 px-1 rounded">password</code></li>
              <li><strong>Partner ISV:</strong> <code className="bg-slate-300 px-1 rounded">partnerisv</code> / <code className="bg-slate-300 px-1 rounded">isvpassword</code></li>
          </ul>
          <p className="text-xs text-slate-600 mt-2 text-center"><em>{t('demoLoginsMfaNote')}</em></p>
      </div>
    </div>
  );
};

export default LoginPage;
