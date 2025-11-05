import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslations } from '../hooks/useTranslations';
import { useToast } from '../components/common/Toast';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StripeMockForm from '../components/auth/StripeMockForm';
import { registerTrial } from '../services/backendApiService';
import * as api from '../services/backendApiService';
import { APP_NAME } from '../constants';
import { PlanTemplate, TransformedPlan, TransformedPlansData, StripePaymentIntent, StripePaymentMethod } from '../types';

interface Plan {
    id: string;
    name: string;
    price: number;
    currency: string;
    interval: string;
    trialDays: number;
    features: string[];
}

interface PlansResponse {
    plans: {
        basic: Plan;
        premium: Plan;
    };
}

const RegisterPage: React.FC = () => {
    const [step, setStep] = useState(0); // Start with plan selection
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [plans, setPlans] = useState<PlansResponse | null>(null);
    const [selectedPlan, setSelectedPlan] = useState<string>('basic');
    const [paymentMethodData, setPaymentMethodData] = useState<StripePaymentIntent | StripePaymentMethod | null>(null);
    const [formData, setFormData] = useState({
        // User data
        companyId: '',
        name: '',
        lastNamePaternal: '',
        lastNameMaternal: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        country: '',
        // Consent
        termsAccepted: false,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();
    const t = useTranslations();
    const { showToast } = useToast();

    // Helper function to get selected plan with proper typing
    const getSelectedPlan = (): TransformedPlan | undefined => {
        if (!plans?.plans) return undefined;
        return (Object.values(plans.plans) as TransformedPlan[]).find(p => p.id === selectedPlan);
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const data = await fetch('http://localhost:3001/api/v1/plan-templates').then(res => res.json());
            // Transform the array into the expected format
            const transformedPlans: TransformedPlansData = {
                plans: data.reduce((acc: Record<string, TransformedPlan>, plan: PlanTemplate) => {
                    const key = plan.name.toLowerCase().replace(' plan', '').replace(' ', '');
                    acc[key] = {
                        id: plan.id,
                        name: plan.name,
                        price: plan.price,
                        currency: 'USD',
                        interval: plan.billingCycle.toLowerCase(),
                        trialDays: plan.trialDays,
                        features: [
                            `${plan.features.partnerManagers.limit} Partner Manager${plan.features.partnerManagers.limit > 1 ? 's' : ''}`,
                            `${plan.features.admins.limit} Admin User${plan.features.admins.limit > 1 ? 's' : ''}`,
                            `Up to ${plan.features.partners.limit} Partners`,
                            `${plan.features.textTokens.limit.toLocaleString()} AI Text Tokens`,
                            `${plan.features.speechToTextMinutes.limit} Minutes Speech-to-Text`,
                            `${plan.features.storageGB.limit}GB Storage`
                        ],
                        limits: {
                            partnerManagers: plan.features.partnerManagers.limit,
                            admins: plan.features.admins.limit,
                            partners: plan.features.partners.limit,
                            textTokens: plan.features.textTokens.limit,
                            speechToTextMinutes: plan.features.speechToTextMinutes.limit,
                            storageGB: plan.features.storageGB.limit
                        }
                    };
                    return acc;
                }, {})
            };
            setPlans(transformedPlans);
            
            // Set the first plan ID as default selected
            const firstPlanKey = Object.keys(transformedPlans.plans)[0];
            if (firstPlanKey) {
                const firstPlan = transformedPlans.plans[firstPlanKey];
                setSelectedPlan(firstPlan.id); // Use plan ID instead of key
            }
        } catch (error) {
            console.error('Failed to fetch plans:', error);
            showToast('Failed to load subscription plans', 'error');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (error) setError('');
    };

    const handlePlanSelect = () => {
        setStep(1);
    };

    const handleStep1Submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.termsAccepted) {
            setError("You must accept the terms and privacy policy.");
            return;
        }
        if (formData.password.length < 8) {
            setError(t('passwordRequirements'));
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        setStep(2); // Go to payment method step
    };

    const handlePaymentMethodSuccess = (paymentResult: StripePaymentIntent | StripePaymentMethod) => {
        console.log('Payment method result:', paymentResult);
        
        // Extract payment method ID and details from different response types
        let paymentMethodId = null;
        let cardholderName = '';
        let last4 = '';
        
        if (paymentResult.id && paymentResult.id.startsWith('pm_')) {
            // Real Stripe payment method
            const paymentMethod = paymentResult as StripePaymentMethod;
            paymentMethodId = paymentMethod.id;
            cardholderName = paymentMethod.billing_details?.name || '';
            last4 = paymentMethod.card?.last4 || '';
        } else {
            // From payment intent or mock
            const paymentIntent = paymentResult as StripePaymentIntent;
            paymentMethodId = paymentIntent.payment_method || '';
            cardholderName = paymentIntent.cardholderName || '';
            last4 = paymentIntent.last4 || '';
        }
        
        if (paymentMethodId) {
            setPaymentMethodData({
                id: paymentMethodId,
                cardholderName,
                last4
            });
            setStep(3); // Go to final confirmation
        } else {
            setError('Failed to save payment method');
        }
    };

    const handleFinalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!paymentMethodData?.id) {
            setError('Payment method is required to start your trial');
            return;
        }

        setIsLoading(true);
        setError('');

        const userData = {
            companyId: formData.companyId,
            username: formData.email,
            name: formData.name,
            lastNamePaternal: formData.lastNamePaternal,
            lastNameMaternal: formData.lastNameMaternal,
            email: formData.email,
            phone: formData.phone,
            country: formData.country,
            password: formData.password,
        };
        
        console.log('Registration attempt:', { userData, selectedPlan, paymentMethodData });
        
        const requestBody = {
            userData,
            selectedPlan,
            paymentMethodId: paymentMethodData.id,
            paymentMethodData
        };
        
        console.log('Sending request body:', JSON.stringify(requestBody, null, 2));
        
        try {
            // Call the updated API with plan selection and payment method
            const response = await fetch('http://localhost:3001/api/v1/auth/register-trial', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            const result = await response.json();
            
            console.log('Response status:', response.status);
            console.log('Response result:', result);
            
            if (response.ok) {
                console.log('Registration successful:', result);
                showToast('Registration successful! Logging you in...', 'success');
                
                // After successful registration, log the user in
                console.log('Attempting login after registration...');
                const loggedInUser = await login(formData.email, formData.password);
                if (loggedInUser) {
                    console.log('Login successful, navigating to PRM');
                    showToast('Welcome! Redirecting to your dashboard...', 'success');
                    navigate('/prm');
                } else {
                    console.log('Login failed after successful registration');
                    showToast('Registration successful, but auto-login failed. Please login manually.', 'error');
                    navigate('/login');
                }
            } else {
                console.error('Registration failed:', {
                    status: response.status,
                    statusText: response.statusText,
                    result: result
                });
                
                // Show detailed validation errors in toast
                if (result.details && Array.isArray(result.details)) {
                    result.details.forEach(detail => {
                        showToast(`${detail.field}: ${detail.message}`, 'error');
                    });
                } else if (result.message) {
                    showToast(result.message, 'error');
                } else {
                    showToast(result.error || 'Registration failed', 'error');
                }
                
                throw new Error(result.error || 'Registration failed');
            }
        } catch (err) {
            console.error('Registration error details:', err);
            
            let errorMessage = "An unexpected error occurred during registration.";
            if (err instanceof Error) {
                errorMessage = err.message;
            } else if (typeof err === 'string') {
                errorMessage = err;
            }
            
            showToast(errorMessage, 'error');
            setStep(1);
            setIsLoading(false);
        }
    };

    const renderTermsAndPrivacy = () => {
        const translation = t('acceptTerms');
        const parts = translation.split(/(\{terms\}|\{privacy\})/g);

        return (
            <>
                {parts.map((part, index) => {
                    if (part === '{terms}') {
                        return (
                            <Link key={`link-terms-${index}`} to="/terms" target="_blank" className="font-medium text-primary hover:underline">
                                {t('termsOfService')}
                            </Link>
                        );
                    }
                    if (part === '{privacy}') {
                        return (
                            <Link key={`link-privacy-${index}`} to="/privacy" target="_blank" className="font-medium text-primary hover:underline">
                                {t('privacyPolicy')}
                            </Link>
                        );
                    }
                    return <React.Fragment key={`text-${index}`}>{part}</React.Fragment>;
                })}
            </>
        );
    };

    const renderPlanSelection = () => {
        if (!plans) {
            return <div className="text-center">Loading plans...</div>;
        }

        return (
            <div className="space-y-6">
                <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Choose Your Plan</h3>
                    <p className="text-sm text-slate-600">Start with a 30-day free trial, then continue with your selected plan</p>
                </div>
                
                <div className="space-y-4">
                    {Object.entries(plans.plans as Record<string, Plan>).map(([key, plan]) => (
                        <div
                            key={key}
                            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                                selectedPlan === plan.id
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setSelectedPlan(plan.id)}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center">
                                    <input
                                        type="radio"
                                        name="plan"
                                        value={plan.id}
                                        checked={selectedPlan === plan.id}
                                        onChange={() => setSelectedPlan(plan.id)}
                                        className="w-4 h-4 mr-3"
                                    />
                                    <h4 className="text-lg font-semibold">{plan.name}</h4>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-bold">${plan.price}</span>
                                    <span className="text-gray-600">/{plan.interval}</span>
                                </div>
                            </div>
                            
                            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm mb-3 inline-block">
                                {plan.trialDays > 0 ? `${plan.trialDays} Days Free Trial` : 'No Trial - Immediate Billing'}
                            </div>
                            
                            <ul className="space-y-1 text-sm">
                                {plan.features.map((feature, index) => (
                                    <li key={index} className="flex items-center">
                                        <span className="text-green-500 mr-2">✓</span>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <Button onClick={handlePlanSelect} className="w-full">
                    Continue with {getSelectedPlan()?.name || 'Selected Plan'}
                </Button>
            </div>
        );
    };

    const renderStep1 = () => (
        <form onSubmit={handleStep1Submit} className="space-y-4">
            <fieldset className="border p-4 rounded-md">
                <legend className="text-md font-semibold px-2">{t('contactInfo')}</legend>
                <div className="space-y-3 p-2">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Company ID</label>
                        <input type="text" name="companyId" value={formData.companyId} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" placeholder="Enter your company ID" required />
                        <p className="text-xs text-slate-500 mt-1">Contact your administrator to get your company ID</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">{t('firstName')}</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">{t('lastNamePaternal')}</label>
                            <input type="text" name="lastNamePaternal" value={formData.lastNamePaternal} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" required />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Maternal Last Name</label>
                        <input type="text" name="lastNameMaternal" value={formData.lastNameMaternal} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">{t('email')}</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Phone</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Country</label>
                        <input type="text" name="country" value={formData.country} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">{t('password')}</label>
                        <div className="relative">
                            <input 
                                type={showPassword ? "text" : "password"} 
                                name="password" 
                                value={formData.password} 
                                onChange={handleChange} 
                                className="mt-1 p-2 w-full border rounded-md pr-10" 
                                required 
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464m1.414 1.414L8.464 8.464m5.656 5.656l1.415 1.415m-1.415-1.415l1.415 1.415M14.828 14.828L16.243 16.243" />
                                    </svg>
                                ) : (
                                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{t('passwordRequirements')}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Confirm Password</label>
                        <div className="relative">
                            <input 
                                type={showConfirmPassword ? "text" : "password"} 
                                name="confirmPassword" 
                                value={formData.confirmPassword} 
                                onChange={handleChange} 
                                className="mt-1 p-2 w-full border rounded-md pr-10" 
                                required 
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? (
                                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464m1.414 1.414L8.464 8.464m5.656 5.656l1.415 1.415m-1.415-1.415l1.415 1.415M14.828 14.828L16.243 16.243" />
                                    </svg>
                                ) : (
                                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Re-enter your password to confirm</p>
                    </div>
                </div>
            </fieldset>
            
            <div className="pt-2">
                 <div className="flex items-start">
                    <input id="termsAccepted" name="termsAccepted" type="checkbox" checked={formData.termsAccepted} onChange={handleChange} className="h-5 w-5 rounded mt-0.5" />
                    <label htmlFor="termsAccepted" className="ml-3 text-sm text-slate-600">
                        {renderTermsAndPrivacy()}
                    </label>
                </div>
            </div>

            <div className="flex items-center space-x-4">
                <Button type="button" variant="secondary" onClick={() => setStep(0)} className="flex-1">
                    Back to Plans
                </Button>
                <Button type="submit" className="flex-1">
                    Continue to Payment
                </Button>
            </div>
        </form>
    );

    const renderStep2 = () => (
        <div className="space-y-4">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <h4 className="font-bold text-blue-800">
                    {getSelectedPlan()?.trialDays && getSelectedPlan()!.trialDays > 0 ? 'Secure Your Free Trial' : 'Complete Your Subscription'}
                </h4>
                <p className="text-sm text-blue-700">
                    {getSelectedPlan()?.trialDays && getSelectedPlan()!.trialDays > 0 
                        ? `Add your payment method to start your ${getSelectedPlan()?.trialDays}-day free trial of ${getSelectedPlan()?.name || 'Selected Plan'}. You won't be charged until your trial ends.`
                        : `Add your payment method to start your ${getSelectedPlan()?.name || 'Selected Plan'} subscription. You will be charged $${getSelectedPlan()?.price || 0} immediately.`
                    }
                </p>
            </div>
            
            <StripeMockForm 
                amount={0} // $0 for trial
                onSubmit={() => {}}
                onPaymentSuccess={handlePaymentMethodSuccess}
                onPaymentError={(error) => {
                    console.error('Payment method error:', error);
                    setError(error);
                }}
            />
            
            <div className="flex items-center space-x-4">
                <Button type="button" variant="secondary" onClick={() => setStep(1)} className="flex-1">
                    Back
                </Button>
                {paymentMethodData && (
                    <Button type="button" onClick={() => setStep(3)} className="flex-1">
                        Continue to Confirmation
                    </Button>
                )}
            </div>
        </div>
    );

    const renderStep3 = () => (
        <form onSubmit={handleFinalSubmit} className="space-y-4">
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                <h4 className="font-bold text-green-800">Ready to Start!</h4>
                <p className="text-sm text-green-700">
                    ✓ Plan: {getSelectedPlan()?.name || 'Selected Plan'}<br/>
                    ✓ Payment method secured<br/>
                    {getSelectedPlan()?.trialDays && getSelectedPlan()!.trialDays > 0 
                        ? `✓ ${getSelectedPlan()?.trialDays}-day free trial starts now<br/>✓ Then $${getSelectedPlan()?.price || 0}/month`
                        : `✓ Subscription starts immediately<br/>✓ Charged $${getSelectedPlan()?.price || 0}/${getSelectedPlan()?.interval || 'month'} now`
                    }
                </p>
            </div>
            
            <div className="flex items-center space-x-4">
                <Button type="button" variant="secondary" onClick={() => setStep(2)} className="flex-1">
                    Back
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                    {isLoading ? <LoadingSpinner size="sm" /> : 
                        getSelectedPlan()?.trialDays && getSelectedPlan()!.trialDays > 0 
                            ? 'Start Free Trial' 
                            : 'Subscribe Now'
                    }
                </Button>
            </div>
        </form>
    );

    const getStepTitle = () => {
        switch (step) {
            case 0: return 'Choose Your Plan';
            case 1: return 'Account Information';
            case 2: return 'Payment Method';
            case 3: return 'Confirm Registration';
            default: return 'Registration';
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
            <Link to="/login" className="flex items-center space-x-4 mb-8">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-12 h-12 text-primary`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-7.5h12c.621 0 1.125-.504 1.125-1.125V11.25c0-.621-.504-1.125-1.125-1.125h-12c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-700">{APP_NAME}</h1>
            </Link>
            <div className="w-full max-w-2xl bg-white p-6 sm:p-8 rounded-xl shadow-xl">
                 <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">{getStepTitle()}</h2>
                    {step > 0 && (
                        <p className="text-sm text-slate-500">
                            Selected: {getSelectedPlan()?.name || 'Selected Plan'} - {getSelectedPlan()?.trialDays && getSelectedPlan()!.trialDays > 0 ? `${getSelectedPlan()?.trialDays} Day Free Trial` : 'Immediate Billing'}
                        </p>
                    )}
                 </div>
                 
                 {/* Stepper */}
                 {step > 0 && (
                     <div className="flex items-center justify-center mb-6">
                        <div className={`flex items-center ${step >= 1 ? 'text-primary' : 'text-slate-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'bg-primary border-primary text-white' : 'border-slate-400'}`}>1</div>
                            <span className="ml-2 font-semibold text-sm">Details</span>
                        </div>
                        <div className={`flex-1 h-0.5 mx-4 ${step > 1 ? 'bg-primary' : 'bg-slate-300'}`}></div>
                         <div className={`flex items-center ${step >= 2 ? 'text-primary' : 'text-slate-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'bg-primary border-primary text-white' : 'border-slate-400'}`}>2</div>
                            <span className="ml-2 font-semibold text-sm">Payment</span>
                        </div>
                        <div className={`flex-1 h-0.5 mx-4 ${step > 2 ? 'bg-primary' : 'bg-slate-300'}`}></div>
                         <div className={`flex items-center ${step >= 3 ? 'text-primary' : 'text-slate-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 3 ? 'bg-primary border-primary text-white' : 'border-slate-400'}`}>3</div>
                            <span className="ml-2 font-semibold text-sm">Confirm</span>
                        </div>
                     </div>
                 )}

                {error && <p className="text-sm text-white bg-red-500/90 rounded-md p-3 text-center mb-4">{error}</p>}

                {step === 0 && renderPlanSelection()}
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}

                <div className="text-center mt-6 text-sm">
                    <span className="text-slate-600">Already have an account? </span>
                    <Link to="/login" className="font-medium text-primary hover:text-primary-dark">
                        {t('login')}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
