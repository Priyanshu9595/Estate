import { Link } from 'react-router-dom';
import { ShieldCheck, TrendingUp, Users, Building, Building2, PhoneCall, Mail, MapPin, ArrowRight, CheckCircle2, ChevronRight, BarChart3, Home } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 lg:pt-32 lg:pb-32 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-blue-100/40 blur-3xl"></div>
          <div className="absolute top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-50/50 blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="max-w-2xl text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-primary font-semibold text-sm mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                EstateFlow 2.0 is Live
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-[4rem] font-extrabold text-slate-900 mb-6 leading-[1.1] tracking-tight">
                Modern Property <br className="hidden md:block"/> 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-600">Management</span>
              </h1>
              <p className="text-xl text-slate-600 mb-10 leading-relaxed font-medium">
                The ultimate SaaS platform for landlords, managers, and tenants. Streamline rent collection, maintenance requests, and lease tracking all in one powerful dashboard.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/register" className="inline-flex items-center justify-center gap-2 bg-primary text-white hover:bg-blue-700 px-8 py-4 rounded-xl text-lg font-bold shadow-[0_8px_30px_rgb(37,99,235,0.25)] transition-all hover:-translate-y-1">
                  Get Started Now <ArrowRight size={20} />
                </Link>
                <Link to="#features" className="inline-flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 px-8 py-4 rounded-xl text-lg font-bold transition-all hover:-translate-y-1">
                  Explore Features
                </Link>
              </div>
              
              <div className="mt-10 flex items-center justify-center lg:justify-start gap-8 text-sm font-medium text-slate-500">
                <div className="flex items-center gap-2"><CheckCircle2 size={18} className="text-green-500" /> No credit card required</div>
                <div className="flex items-center gap-2"><CheckCircle2 size={18} className="text-green-500" /> 14-day free trial</div>
              </div>
            </div>

            {/* Right Image / Graphic */}
            <div className="relative mx-auto w-full max-w-lg lg:max-w-none lg:mr-0 mt-10 lg:mt-0">
              <div className="relative rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] border border-white/50 aspect-[4/3] lg:aspect-auto lg:h-[600px] bg-slate-100 flex items-center justify-center">
                <img 
                  src="/hero_3d.png" 
                  alt="Modern premium 3D real estate building" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>
              </div>

              {/* Floating Badges */}
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-4 animate-[bounce_4s_infinite]">
                <div className="bg-green-100 p-3 rounded-full text-green-600"><TrendingUp size={24} /></div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Revenue</p>
                  <p className="text-lg font-black text-slate-900">₹1,10,000</p>
                </div>
              </div>

              <div className="absolute top-10 -right-8 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-4 animate-[bounce_5s_infinite_reverse]">
                <div className="bg-blue-100 p-3 rounded-full text-primary"><Home size={24} /></div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Smart Dashboard</p>
                  <p className="text-xs text-slate-500 font-medium">Manage properties instantly</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-primary font-bold tracking-wide uppercase text-sm mb-3">About EstateFlow</h2>
              <h3 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
                Revolutionizing the <br/> way you manage.
              </h3>
              <p className="text-lg text-slate-600 leading-relaxed mb-8">
                Founded with a vision to bring transparency and efficiency to real estate management, EstateFlow bridges the gap between owners and tenants. Whether you own a single PG or a sprawling apartment complex, our technology empowers you with deep insights and gives your tenants the seamless digital experience they deserve.
              </p>
              <Link to="/register" className="inline-flex items-center gap-2 text-primary font-bold hover:text-blue-800 transition-colors text-lg">
                Learn more about our mission <ChevronRight size={20} />
              </Link>
            </div>
            
            <div className="space-y-6">
              {[
                { title: 'Total Transparency', desc: 'Complete visibility into rent cycles, deposit holdings, and maintenance logs for both owners and tenants.', icon: <BarChart3 className="text-primary" size={28} />, bg: 'bg-blue-50' },
                { title: 'Unmatched Efficiency', desc: 'Automate mundane tasks. Let the system handle billing, reminders, and unit availability tracking.', icon: <TrendingUp className="text-emerald-500" size={28} />, bg: 'bg-emerald-50' },
                { title: 'Built on Trust', desc: 'Secure cloud storage for all KYC documents, leases, and transactions, ensuring complete peace of mind.', icon: <ShieldCheck className="text-indigo-500" size={28} />, bg: 'bg-indigo-50' }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-6 p-6 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow group">
                  <div className={`shrink-0 w-16 h-16 rounded-2xl ${item.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h4>
                    <p className="text-slate-600 leading-relaxed text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features / Services Section */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-primary font-bold tracking-wide uppercase text-sm mb-3">Core Features</h2>
            <h3 className="text-4xl font-extrabold text-slate-900 mb-6">Everything you need to scale</h3>
            <p className="text-lg text-slate-600">Powerful tools designed specifically for modern landlords and property managers to save time and increase revenue.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<Building size={32} className="text-blue-600" />}
              bg="bg-blue-50"
              title="Property Tracking"
              desc="Easily manage all your properties, track vacant rooms, and monitor occupancy rates in real-time."
            />
            <FeatureCard 
              icon={<Users size={32} className="text-indigo-600" />}
              bg="bg-indigo-50"
              title="Tenant Management"
              desc="Maintain complete profiles, digital KYC documents, and lease agreements securely in the cloud."
            />
            <FeatureCard 
              icon={<TrendingUp size={32} className="text-emerald-600" />}
              bg="bg-emerald-50"
              title="Automated Billing"
              desc="Never miss a payment. Track rent, advance deposits, and generate automated payment reminders."
            />
            <FeatureCard 
              icon={<ShieldCheck size={32} className="text-purple-600" />}
              bg="bg-purple-50"
              title="Smart Maintenance"
              desc="Tenants can raise issues digitally, and owners can track resolution times and repair costs easily."
            />
          </div>
        </div>
      </section>

      {/* Contact & CTA Section */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Contact Details */}
            <div className="lg:col-span-5">
              <h2 className="text-4xl font-extrabold mb-4 text-slate-900">Get in Touch</h2>
              <p className="text-slate-600 mb-10 text-lg">
                Have questions about our platform or need a custom enterprise solution? Our support team is available 24/7.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-center gap-5 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <div className="bg-blue-50 p-4 rounded-full"><PhoneCall size={24} className="text-primary" /></div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Call Us</p>
                    <p className="text-lg font-bold text-slate-900">+91 98765 43210</p>
                  </div>
                </div>
                <div className="flex items-center gap-5 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <div className="bg-blue-50 p-4 rounded-full"><Mail size={24} className="text-primary" /></div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Email Us</p>
                    <p className="text-lg font-bold text-slate-900">contact@estateflow.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-5 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <div className="bg-blue-50 p-4 rounded-full"><MapPin size={24} className="text-primary" /></div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Headquarters</p>
                    <p className="text-lg font-bold text-slate-900">Tech Park, Hyderabad, India</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Card */}
            <div className="lg:col-span-7">
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-10 md:p-14 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>
                
                <div className="relative z-10 text-center lg:text-left">
                  <h3 className="text-3xl md:text-4xl font-extrabold mb-4 text-white">Join EstateFlow Today</h3>
                  <p className="text-slate-300 mb-8 text-lg max-w-lg mx-auto lg:mx-0">
                    Experience property management like never before. Sign up today and digitize your entire real estate portfolio in minutes.
                  </p>
                  <Link to="/register" className="inline-block w-full sm:w-auto text-center bg-primary hover:bg-blue-500 text-white px-10 py-4 rounded-xl font-bold text-lg transition-colors shadow-lg shadow-blue-900/20">
                    Create your Free Account
                  </Link>
                  <p className="mt-6 text-sm text-slate-400 font-medium">
                    Already have an account? <Link to="/login" className="text-white hover:text-blue-300 underline underline-offset-4">Log in here</Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-white p-1.5 rounded-lg">
              <Building2 size={20} />
            </div>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">EstateFlow</span>
          </div>
          <p className="text-slate-500 text-sm font-medium text-center md:text-left">
            &copy; {new Date().getFullYear()} EstateFlow Technologies. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/privacy-policy" className="text-slate-500 hover:text-primary transition-colors text-sm font-bold">Privacy Policy</Link>
            <Link to="/terms-of-service" className="text-slate-500 hover:text-primary transition-colors text-sm font-bold">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, bg, title, desc }) => (
  <div className="flex flex-col p-8 bg-white rounded-3xl shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 hover:-translate-y-2 transition-all duration-300 group h-full">
    <div className={`${bg} w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300`}>
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-600 leading-relaxed font-medium">{desc}</p>
  </div>
);

export default LandingPage;
