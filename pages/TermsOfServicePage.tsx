import React from 'react';
import { Link } from 'react-router-dom';

const LegalPageLayout: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white min-h-screen">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
            <Link to="/login" className="text-primary hover:underline text-sm mb-4 inline-block">&larr; Back to AInstein</Link>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{title}</h1>
            <div className="prose max-w-none prose-headings:text-black prose-p:text-black prose-li:text-black prose-strong:text-black">
                {children}
            </div>
        </div>
    </div>
);

const TermsOfServicePage: React.FC = () => {
    return (
        <LegalPageLayout title="Terms of Service">
            <p className="text-sm text-slate-600">Effective Date: June 18, 2025</p>
            <p>Welcome to AInstein Global Inc. ("AInstein", "we", "us", or "our"). These Terms of Service ("Terms") govern your use of our website, applications, software, and services (collectively, the "Services"). By accessing or using our Services, you agree to be bound by these Terms.</p>

            <h2>1. Eligibility</h2>
            <p>You must be at least 18 years old and capable of entering into legally binding agreements to use our Services. By using our Services, you represent and warrant that you meet these eligibility requirements.</p>

            <h2>2. Use of Services</h2>
            <p>You agree to use the Services only for lawful purposes and in accordance with these Terms. You must not:</p>
            <ul>
                <li>Violate any applicable laws or regulations;</li>
                <li>Infringe upon or violate our intellectual property rights or those of others;</li>
                <li>Attempt to gain unauthorized access to any part of the Services or systems;</li>
                <li>Use the Services to distribute malware or other harmful software.</li>
            </ul>

            <h2>3. User Accounts</h2>
            <p>To access certain features, you may need to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</p>

            <h2>4. Intellectual Property</h2>
            <p>All content, features, and functionality on the Services, including but not limited to text, graphics, logos, and software, are the exclusive property of AInstein or its licensors, and are protected by Canadian and international copyright, trademark, and other laws.</p>

            <h2>5. Subscription and Payment</h2>
            <p>Some features may require payment. By subscribing, you agree to pay all applicable fees. All fees are non-refundable unless otherwise stated. We may change our pricing at any time with notice.</p>

            <h2>6. Third-Party Services</h2>
            <p>Our Services may integrate with third-party platforms. We are not responsible for third-party content or services and disclaim all liability related thereto.</p>

            <h2>7. Termination</h2>
            <p>We may suspend or terminate your access to the Services at any time, with or without cause or notice. You may terminate your account at any time by contacting us.</p>

            <h2>8. Disclaimers</h2>
            <p>Our Services are provided "as is" and "as available" without warranties of any kind. We do not guarantee that the Services will be uninterrupted or error-free.</p>

            <h2>9. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, AInstein shall not be liable for any indirect, incidental, special, or consequential damages, or for any loss of profits or revenues.</p>

            <h2>10. Governing Law</h2>
            <p>These Terms are governed by the laws of the Province of British Columbia and the laws of Canada applicable therein, without regard to conflict of law principles.</p>

            <h2>11. Changes to Terms</h2>
            <p>We may update these Terms at any time. We will notify you of any material changes by posting the new Terms on our website. Your continued use of the Services constitutes acceptance of the updated Terms.</p>

            <h2>12. Contact Us</h2>
            <p>If you have any questions about these Terms, please contact us at: support@ainstein.ca</p>
        </LegalPageLayout>
    );
};

export default TermsOfServicePage;