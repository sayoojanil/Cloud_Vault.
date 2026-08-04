import React from 'react';
import { 
  Lock, 
  Shield, 
  Key, 
  Mail, 
  HelpCircle, 
  ChevronRight,
  CheckCircle,
  ShieldCheck,
  FileText,
  Users,
  Database,
  Clock,
  Apple,
  Smartphone,
  Store,
  Globe,
  Award,
  Eye,
  Fingerprint,
  Building,
  Landmark,
  IdCard,
  FileCheck,
  Star
} from 'lucide-react';

// Logo Component
const Logo = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const sizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10"
  };
  
  return (
    <div className="flex items-center gap-2">
     
      <img src="/cloudvault_logo.png" alt="CloudVault Logo" className="w-48 h-auto object-contain" />
    </div>
  );
};

// Stat Card Component
const StatCard = ({ number, label }: { number: string; label: string }) => (
  <div className="p-4 rounded-xl bg-gray-800/50 text-center border border-gray-700">
    <div className="stat-number text-2xl md:text-3xl font-bold text-blue-400">{number}</div>
    <div className="text-sm text-gray-300 mt-1">{label}</div>
  </div>
);

// Certification Badge Component
const CertBadge = ({ icon: Icon, title, subtitle, color }: any) => (
  <div className="bg-gray-800/50 rounded-xl p-4 text-center border border-gray-700">
    <Icon className={`w-8 h-8 mx-auto mb-2 ${color}`} />
    <div className="font-bold text-sm text-gray-200">CERTIFIED</div>
    <div className="text-xs font-mono font-medium text-gray-300">{title}</div>
    <div className="text-xs text-gray-400 mt-0.5">COMPANY</div>
  </div>
);

// Navigation Item
const NavItem = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a href={href} className="text-sm font-medium text-gray-300 hover:text-blue-400 transition-colors">
    {children}
  </a>
);

// Main Footer Component (Enhanced from original)
export function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Logo size="md" />
            <p className="mt-4 text-sm text-gray-400 max-w-sm">
              Document Wallet to Empower Citizens. Part of Digital India's vision for paperless governance, 
              providing secure access to authentic digital documents.
            </p>
            <div className="mt-6 flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-900 px-3 py-1.5 rounded-full">
                <Lock className="w-3.5 h-3.5 text-green-500" />
                <span>End-to-end encrypted</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-900 px-3 py-1.5 rounded-full">
                <Shield className="w-3.5 h-3.5 text-blue-500" />
                <span>SOC 2 Compliant</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-900 px-3 py-1.5 rounded-full">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>ISO 27001:2022</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-200 text-sm mb-4">Explore</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">FAQ</a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Statistics</a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Resources</a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Circulars</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-200 text-sm mb-4">Legal & Support</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Terms & Condition Of Use</a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Credits</a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Partners</a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">MeriPehchaan</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-5">
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
            <span className="font-medium text-gray-300">Powered by</span>
            <div className="flex items-center gap-1">
              <Landmark className="w-4 h-4 text-orange-500" />
              <span className="font-semibold text-blue-400">Digital India</span>
              <span className="italic text-xs text-gray-400">Power To Empower</span>
            </div>
            <span className="hidden md:inline text-gray-700">|</span>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              <span className="text-gray-400">National e-Governance Division (NeGD)</span>
              <span className="text-gray-400">Ministry of Electronics & IT (MeitY)</span>
            </div>
          </div>
          <div className="flex gap-3">
             <a onClick={() => alert('Google play feature coming soon')}className="bg-gray-800 cursor-pointer text-white text-xs px-4 py-2 rounded-lg flex items-center gap-1 shadow-sm hover:bg-gray-700 transition">
              <Smartphone className="w-3.5 h-3.5" />
              Google Play
            </a>
            <a onClick={() => alert('App Store feature coming soon')}
            className="bg-gray-800 text-white text-xs px-4 py-2 cursor-pointer rounded-lg flex items-center gap-1 shadow-sm hover:bg-gray-700 transition">
              <Apple className="w-3.5 h-3.5" />
              App Store
            </a>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 gap-2">
          <div className="flex flex-wrap gap-4">
            <span>Last Updated: May 26, 2026</span>
            <span className="hidden sm:inline">•</span>
            <span>Copyright © 2026, Website maintained by National e-Governance Division (NeGD)</span>
          </div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-300 transition-colors">DigiLocker Policy</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Contact</a>
            <a href="#" className="hover:text-gray-300 transition-colors flex items-center gap-1">
              <HelpCircle className="w-3 h-3" />
              Help/Feedback
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Complete Landing Page Component
export default function DigiLockerLanding() {
  return (
    <div className="min-h-screen bg-black text-white font-sans antialiased">
      {/* Header / Navigation */}
      <header className="border-b border-gray-800 bg-black/95 sticky top-0 z-30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-600 rounded-lg p-1.5">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-2xl tracking-tight text-white">DigiLocker</span>
              <span className="hidden md:inline-block text-xs text-gray-400 ml-1 font-medium">
                Document Wallet to Empower Citizens
              </span>
            </div>

            <nav className="hidden md:flex space-x-6 text-sm font-medium">
              <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">Home</a>
              <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">About Us</a>
              <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">FAQ</a>
              <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">Statistics</a>
              <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">Resources</a>
              <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">Circulars</a>
            </nav>

            <div className="flex items-center gap-3">
              <a href="#" className="text-sm font-medium text-gray-300 hover:text-blue-400 transition-colors flex items-center gap-1">
                <HelpCircle className="w-4 h-4" />
                Need Help/Feedback
              </a>
              <a href="#" className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-blue-700 transition">
                Explore DigiLocker
              </a>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden pb-3 flex flex-wrap gap-3 text-xs text-gray-400 border-t border-gray-800 pt-3">
            <a href="#" className="hover:text-blue-400">Home</a>
            <a href="#" className="hover:text-blue-400">About Us</a>
            <a href="#" className="hover:text-blue-400">FAQ</a>
            <a href="#" className="hover:text-blue-400">Statistics</a>
            <a href="#" className="hover:text-blue-400">Resources</a>
            <a href="#" className="hover:text-blue-400">Circulars</a>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-1 bg-blue-900/30 text-blue-400 rounded-full px-3 py-1 text-xs font-semibold mb-4 border border-blue-800">
                  <CheckCircle className="w-3 h-3" />
                  <span>Digital India Initiative</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
                  Document Wallet to <span className="text-blue-400">Empower Citizens</span>
                </h1>
                <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto lg:mx-0">
                  DigiLocker aims at 'Digital Empowerment' by providing access to authentic digital documents 
                  to the citizen's digital document wallet.
                </p>
                <div className="mt-8 flex flex-wrap gap-4 justify-center lg:justify-start">
                  <a href="#" className="bg-gray-800 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:bg-gray-700 transition flex items-center gap-2 border border-gray-700">
                    <Store className="w-5 h-5" />
                    GET IT ON Google Play
                  </a>
                  <a href="#" className="bg-gray-800 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:bg-gray-700 transition flex items-center gap-2 border border-gray-700">
                    <Apple className="w-5 h-5" />
                    App Store
                  </a>
                </div>
              </div>

              {/* Certification Cards */}
              <div className="flex-1 bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-800">
                <div className="grid grid-cols-2 gap-4">
                  <CertBadge icon={ShieldCheck} title="ISO 27001:2022" color="text-green-500" />
                  <CertBadge icon={Lock} title="ISO 27034" color="text-blue-500" />
                  <CertBadge icon={Fingerprint} title="ISO 27701" color="text-emerald-500" />
                  <CertBadge icon={FileCheck} title="Circulars" color="text-indigo-500" />
                </div>
                <div className="mt-4 text-center text-xs text-gray-500 flex justify-center gap-3">
                  <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-500" /> MeitY Approved</span>
                  <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> Digital India</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="bg-black border-b border-gray-800 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              <StatCard number="2.5+ Cr" label="Registered Users" />
              <StatCard number="560+ Cr" label="Issued Documents" />
              <StatCard number="2,300+" label="Partner Institutions" />
              <StatCard number="99.9%" label="Uptime" />
            </div>
          </div>
        </div>

        {/* Features & Circulars Section */}
        <div className="py-12 bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-10 items-start">
              <div>
                <h2 className="text-3xl font-bold text-white">Your Digital Document Wallet</h2>
                <p className="mt-3 text-gray-300">
                  Access your driving license, vehicle registration, academic certificates, and more — anytime, anywhere. 
                  Legally valid under the IT Act, DigiLocker reduces physical document hassles.
                </p>
                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-300">Secure cloud storage with end-to-end encryption</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-300">Directly issued by government issuers</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-300">Digital signature & authenticity verification</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-300">Share documents via URI or QR code</span>
                  </div>
                </div>
                <a href="#" className="mt-6 inline-flex items-center gap-2 text-blue-400 font-medium hover:text-blue-300 transition-colors">
                  Learn more <ChevronRight className="w-4 h-4" />
                </a>
              </div>

              {/* Circulars Card */}
              <div className="bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-800">
                <h3 className="font-semibold text-xl flex items-center gap-2 text-white">
                  <FileText className="w-5 h-5 text-blue-400" />
                  Recent Circulars
                </h3>
                <ul className="mt-4 space-y-3">
                  <li className="border-b border-gray-800 pb-2">
                    <a href="#" className="text-sm text-gray-300 hover:text-blue-400 transition-colors flex justify-between">
                      Integration with UMANG platform
                      <span className="text-xs text-gray-500">May 25, 2026</span>
                    </a>
                  </li>
                  <li className="border-b border-gray-800 pb-2">
                    <a href="#" className="text-sm text-gray-300 hover:text-blue-400 transition-colors flex justify-between">
                      New issuers: State Transport dept.
                      <span className="text-xs text-gray-500">May 20, 2026</span>
                    </a>
                  </li>
                  <li className="border-b border-gray-800 pb-2">
                    <a href="#" className="text-sm text-gray-300 hover:text-blue-400 transition-colors flex justify-between">
                      DigiLocker for MSME certificates
                      <span className="text-xs text-gray-500">May 15, 2026</span>
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-gray-300 hover:text-blue-400 transition-colors flex justify-between">
                      Advisory on data privacy features
                      <span className="text-xs text-gray-500">May 10, 2026</span>
                    </a>
                  </li>
                </ul>
                <a href="#" className="mt-4 text-sm text-blue-400 inline-flex items-center gap-1 hover:text-blue-300 transition-colors">
                  View all circulars <ChevronRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Partners & MeriPehchaan Section */}
        <div className="py-10 border-b border-gray-800 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-between items-center gap-6 text-sm">
              <div className="flex flex-wrap gap-6">
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Terms & Condition Of Use</a>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Credits</a>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Partners</a>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">MeriPehchaan</a>
              </div>
              <div className="flex items-center gap-2 bg-gray-900 px-4 py-2 rounded-full border border-gray-800">
                <IdCard className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-medium text-gray-300">Your verifiable digital identity</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}