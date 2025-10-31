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

const PrivacyPolicyPage: React.FC = () => {
    return (
        <LegalPageLayout title="Privacy Policy">
            <p className="text-sm text-slate-600">Effective Date: June 18, 2025</p>
            <p>AInstein Global Inc. ("AInstein", "we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you use our Services.</p>

            <h2>1. Information We Collect</h2>
            <p>We may collect the following types of information:</p>
            <ul>
                <li><strong>Personal Information:</strong> Name, email address, contact details, billing information;</li>
                <li><strong>Usage Data:</strong> IP address, browser type, device information, pages visited;</li>
                <li><strong>Cookies and Tracking Technologies:</strong> Used to enhance user experience and analyze website traffic.</li>
            </ul>

            <h2>2. Use of Information</h2>
            <p>We use your information to:</p>
            <ul>
                <li>Provide, operate, and maintain our Services;</li>
                <li>Process payments and manage subscriptions;</li>
                <li>Communicate with you about updates or promotions;</li>
                <li>Monitor usage and improve our Services;</li>
                <li>Ensure compliance with legal obligations.</li>
            </ul>

            <h2>3. Sharing of Information</h2>
            <p>We do not sell your personal information. We may share your information with:</p>
            <ul>
                <li>Service providers assisting with operations (e.g., payment processors);</li>
                <li>Legal authorities when required by law or to protect our rights;</li>
                <li>Third parties in connection with a business transfer (e.g., merger, acquisition).</li>
            </ul>

            <h2>4. Data Security</h2>
            <p>We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the internet is 100% secure.</p>

            <h2>5. International Transfers</h2>
            <p>Your information may be stored and processed in Canada or other jurisdictions. By using our Services, you consent to the transfer of your information to these locations.</p>

            <h2>6. Your Rights</h2>
            <p>Depending on your location, you may have rights to access, correct, or delete your personal information. Please contact us to exercise these rights.</p>

            <h2>7. Retention</h2>
            <p>We retain your personal information only for as long as necessary to fulfill the purposes outlined in this policy or as required by law.</p>

            <h2>8. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of material changes by posting the updated policy on our website.</p>

            <h2>9. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at: privacy@ainstein.ca</p>
        </LegalPageLayout>
    );
};

export default PrivacyPolicyPage;