import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TermsOfService = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <Link to="/" className="inline-flex items-center text-primary font-medium hover:underline mb-8">
        <ArrowLeft size={16} className="mr-2" /> Back to Home
      </Link>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 md:p-12">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-6">Terms of Service</h1>
        <p className="text-sm text-slate-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-6 text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using the EstateFlow platform, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, then you may not access the service.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">2. Description of Service</h2>
            <p>EstateFlow provides a property management software designed for landlords, property managers, and tenants to manage properties, track rent, request maintenance, and handle leases online.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">3. User Responsibilities</h2>
            <p>You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password. You agree not to disclose your password to any third party.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">4. Intellectual Property</h2>
            <p>The Service and its original content, features, and functionality are and will remain the exclusive property of EstateFlow and its licensors. The Service is protected by copyright, trademark, and other laws.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">5. Termination</h2>
            <p>We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
