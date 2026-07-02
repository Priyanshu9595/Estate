import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <Link to="/" className="inline-flex items-center text-primary font-medium hover:underline mb-8">
        <ArrowLeft size={16} className="mr-2" /> Back to Home
      </Link>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 md:p-12">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-6">Privacy Policy</h1>
        <p className="text-sm text-slate-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-6 text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">1. Information We Collect</h2>
            <p>At EstateFlow, we collect information you provide directly to us when you create an account, update your profile, use our services, or communicate with us. This may include your name, email address, phone number, payment information, and property details.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">2. How We Use Your Information</h2>
            <p>We use the information we collect to operate, maintain, and improve our services. This includes processing transactions, sending administrative messages, managing tenant/landlord communications, and providing customer support.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">3. Data Security</h2>
            <p>We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction. All sensitive data (such as KYC documents and payment info) is encrypted in transit and at rest.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">4. Information Sharing</h2>
            <p>We do not share your personal information with third parties except as necessary to provide our services (e.g., payment processors), to comply with the law, or to protect our rights.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">5. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at privacy@estateflow.com.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
