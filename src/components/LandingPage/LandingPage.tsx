import React, { useState } from 'react';
import { 
  Award, 
  ArrowRight, 
  CheckCircle2, 
  FileSpreadsheet, 
  Download, 
  Mail, 
  ShieldCheck, 
  Zap, 
  Layers, 
  ChevronRight, 
  Sparkles,
  Building2,
  GraduationCap,
  Briefcase,
  Users,
  Eye,
  Check,
  QrCode
} from 'lucide-react';
import { PricingPlan } from '../../types';
import { downloadSampleExcel } from '../../services/excelParser';
import { CertificateShowcase } from './CertificateShowcase';

interface LandingPageProps {
  pricingPlans: PricingPlan[];
  onStartCreating: () => void;
  onExploreTemplates: () => void;
  onVerifyDemo: () => void;
  onOpenPricing: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  pricingPlans,
  onStartCreating,
  onExploreTemplates,
  onVerifyDemo,
  onOpenPricing
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does CertiCraft work as a bulk certificate generator with Excel?',
      a: 'CertiCraft makes bulk certificate generation effortless. Simply upload your Excel (.xlsx, .xls) or CSV attendee list, our system auto-maps columns like Name and Date, and generates hundreds of certificates with 1 click.'
    },
    {
      q: 'How does this certificate maker with QR code verification protect against fraud?',
      a: 'Every generated certificate automatically receives a unique tamper-proof cryptographic QR code. When scanned with any smartphone camera, it opens an official verification page confirming recipient identity and validity status.'
    },
    {
      q: 'Is CertiCraft a free certificate maker in India?',
      a: 'Yes! CertiCraft offers a 100% Free Starter Plan in India with 25 certificates per month, Excel/CSV upload, and high-resolution PDF/ZIP downloads with zero credit card required.'
    },
    {
      q: 'How do I get started with CertiCraft?',
      a: 'You can access CertiCraft directly at https://certicraft.upmark.in. Log in with Google SSO or email to start creating certificates.'
    },
    {
      q: 'Can I customize the certificate design completely?',
      a: 'Absolutely. Choose from our luxury landscape & portrait templates or use the Studio Designer to customize fonts, colors, seals, borders, signatures, logos, and custom dynamic tags.'
    },
    {
      q: 'Can I email certificates directly to recipients or download as ZIP?',
      a: 'Yes! You can dispatch individual certificates directly to candidate emails or download an organized ZIP archive of high-res print-ready PDFs.'
    }
  ];

  const useCases = [
    { icon: GraduationCap, title: 'Universities & Colleges', desc: 'Degrees, diplomas, dean honors, and symposium certificates.' },
    { icon: Briefcase, title: 'Corporate Training', desc: 'Employee onboarding, leadership bootcamps, and compliance awards.' },
    { icon: Zap, title: 'Coding Bootcamps', desc: 'Technical mastery certifications with live QR verification.' },
    { icon: Users, title: 'Conferences & Summits', desc: 'Participation and keynote speaker certificates for thousands of attendees.' },
    { icon: Award, title: 'Online Courses & LMS', desc: 'Automated milestone certificates integrated via REST API.' },
    { icon: Building2, title: 'Schools & Institutes', desc: 'Sports day, academic merit, and extracurricular recognition.' }
  ];

  return (
    <div className="space-y-24 pb-20 bg-white text-neutral-900">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 md:pt-20 overflow-hidden bg-white">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-tr from-teal-500/12 via-navy-900/5 to-transparent blur-3xl pointer-events-none rounded-full" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          {/* Top Pill (Crisp mint pill with brand teal pulse dot) */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-teal-950 text-xs font-bold mb-6 shadow-xs animate-in fade-in slide-in-from-bottom-2 duration-300">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            <span>CertiCraft — Bulk Certificate Infrastructure & QR Verification</span>
          </div>

          {/* Headline (Deep Navy with signature Teal gradient) */}
          <h1 className="text-4xl sm:text-6xl font-black text-slate-950 tracking-tight max-w-4xl mx-auto leading-[1.12]">
            Create Hundreds of Certificates <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-950 via-teal-700 to-teal-500">
              in Minutes with CertiCraft
            </span>
          </h1>

          {/* Supporting text */}
          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            CertiCraft is the high-performance bulk certificate platform. Design once, upload your Excel recipient data, and automatically issue verifiable certificates at scale.
          </p>

          {/* CTA Buttons (Brand Teal primary button, white secondary button) */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={onStartCreating}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white bg-teal-500 hover:bg-teal-600 active:scale-[0.98] shadow-md shadow-teal-500/25 transition-all text-sm cursor-pointer"
            >
              <span>Start Creating Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onExploreTemplates}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-slate-800 hover:text-slate-950 bg-white hover:bg-slate-50 border border-slate-300 shadow-xs transition-all text-sm cursor-pointer"
            >
              <Eye className="w-4 h-4 text-slate-500" />
              <span>See How It Works</span>
            </button>
          </div>

          {/* Micro assurance tags */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600 font-medium">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-teal-600" /> Free Certificate Maker India (25 free certs/mo)</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-teal-600" /> Bulk Excel Import (.xlsx/.csv)</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-teal-600" /> Live QR Code Verification</span>
          </div>

          {/* Certificate Showcase with 10 Distinct Sample Designs and Slider */}
          <CertificateShowcase
            onVerifyDemo={onVerifyDemo}
            onExploreTemplates={onExploreTemplates}
            onStartCreating={onStartCreating}
          />

        </div>
      </section>

      {/* 2. SOCIAL PROOF (Crisp white with monochrome logos) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-6">
          TRUSTED BY OVER 1,400+ LEADING INSTITUTES, UNIVERSITIES & TECH WORKSHOPS
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 text-neutral-800 font-bold text-sm">
          <div className="flex items-center gap-2"><Building2 className="w-5 h-5 text-black" /> Apex Institute of Technology</div>
          <div className="flex items-center gap-2"><GraduationCap className="w-5 h-5 text-black" /> Horizon University</div>
          <div className="flex items-center gap-2"><Zap className="w-5 h-5 text-black" /> DevGuild Code School</div>
          <div className="flex items-center gap-2"><Award className="w-5 h-5 text-black" /> Global HR Leadership</div>
          <div className="flex items-center gap-2"><Users className="w-5 h-5 text-black" /> SummitX Conference</div>
        </div>
      </section>

      {/* 3. HOW IT WORKS (3 SIMPLE STEPS - White Cards with 20% Black Accents) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-wider text-black mb-1">Simplicity First</h2>
          <h3 className="text-3xl font-extrabold text-black tracking-tight">How It Works in 3 Simple Steps</h3>
          <p className="text-neutral-600 mt-2 text-sm">
            Everything designed for speed. No technical setup or design skills required.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Step 1 */}
          <div className="p-8 rounded-2xl bg-white border border-slate-200/90 shadow-card hover:border-teal-500 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-slate-950 text-teal-400 font-extrabold text-base flex items-center justify-center mb-6 shadow-xs ring-1 ring-slate-800">
              1
            </div>
            <h4 className="text-base font-bold text-slate-950 mb-2">Design</h4>
            <p className="text-slate-600 text-sm leading-relaxed">
              Pick from our luxury pre-built certificate designs or customize your layout with custom logos, signatures, and dynamic fields like <code className="text-teal-700 font-bold font-mono text-xs bg-teal-50 px-1 py-0.5 rounded">{'{{name}}'}</code>.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-8 rounded-2xl bg-white border border-slate-200/90 shadow-card hover:border-teal-500 transition-all group flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-slate-950 text-teal-400 font-extrabold text-base flex items-center justify-center mb-6 shadow-xs ring-1 ring-slate-800">
                2
              </div>
              <h4 className="text-base font-bold text-slate-950 mb-2">Upload Data</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Drag and drop your Excel (.xlsx) or CSV file. Our smart heuristic column matcher instantly matches your spreadsheet headers with your certificate fields.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={downloadSampleExcel}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800 hover:underline cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Sample Excel (.xlsx)</span>
              </button>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-8 rounded-2xl bg-white border border-slate-200/90 shadow-card hover:border-teal-500 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-slate-950 text-teal-400 font-extrabold text-base flex items-center justify-center mb-6 shadow-xs ring-1 ring-slate-800">
              3
            </div>
            <h4 className="text-base font-bold text-slate-950 mb-2">Generate</h4>
            <p className="text-slate-600 text-sm leading-relaxed">
              Preview instantly, click Generate, and watch your batch complete in seconds. Download an organized ZIP file, single combined PDF, or send personalized emails.
            </p>
          </div>

        </div>
      </section>

      {/* 4. FEATURES GRID (Crisp White with Brand Mint Teal Icons) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-wider text-teal-700 mb-1">Comprehensive Features</h2>
          <h3 className="text-3xl font-extrabold text-slate-950 tracking-tight">Built for Scale and Speed</h3>
          <p className="text-slate-600 mt-2 text-sm">
            Everything your team needs to manage certification programs seamlessly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Layers,
              title: 'Drag & Drop Studio',
              desc: 'Visual editor with Simple Mode for beginners and Advanced Mode for precise positioning, typography, and layering.'
            },
            {
              icon: FileSpreadsheet,
              title: 'Bulk Certificate Generator with Excel',
              desc: 'Seamless import with automatic column mapping for names, courses, and dates from .xlsx, .xls, and .csv spreadsheets.'
            },
            {
              icon: Zap,
              title: 'Asynchronous Bulk Engine',
              desc: 'Generate thousands of high-definition certificates without blocking your browser or suffering timeouts.'
            },
            {
              icon: Download,
              title: 'Print-Ready PDF & ZIP',
              desc: '300 DPI vector-accurate PDF outputs packaged into clean, named filenames within a compressed ZIP archive.'
            },
            {
              icon: ShieldCheck,
              title: 'Certificate Maker with QR Code Verification',
              desc: 'Every certificate comes with a scannable QR badge linking to a public, official verification page.'
            },
            {
              icon: Mail,
              title: 'Automated Email Delivery',
              desc: 'Deliver individualized certificates directly into recipient inboxes with personalized templates and delivery logs.'
            }
          ].map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div key={i} className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-card hover:border-teal-500/80 hover:shadow-elevated transition-all">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4 border border-teal-200/80">
                  <Icon className="w-5 h-5 text-teal-600" />
                </div>
                <h4 className="font-bold text-slate-950 text-base mb-1.5">{feat.title}</h4>
                <p className="text-slate-600 text-xs leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. USE CASES (Deep Navy Accent Box with Teal Accents) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-950 text-white shadow-elevated border border-slate-800">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-400 mb-2">Tailored Solutions</h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Designed for Every Certification Need</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {useCases.map((uc, i) => {
              const Icon = uc.icon;
              return (
                <div key={i} className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-teal-500/50 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="w-4 h-4 text-teal-400" />
                    <h4 className="font-bold text-white text-sm">{uc.title}</h4>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">{uc.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. PRICING SECTION (CONFIGURABLE - Crisp White Cards with Teal/Navy Buttons) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-xs font-bold uppercase tracking-wider text-teal-700 mb-1">Transparent Pricing</h2>
          <h3 className="text-3xl font-extrabold text-slate-950 tracking-tight">Choose the Plan That Fits Your Scale</h3>
          <p className="text-slate-600 mt-2 text-sm">
            Launch with Free, Professional, or Institute. Complete annual charge shown upfront. All prices in INR (excl. applicable GST).
          </p>

          {/* Billing Toggle (Navy/White segmented switch with Teal -20% badge) */}
          <div className="mt-6 inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-300">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                billingCycle === 'monthly' ? 'bg-slate-950 text-white shadow-xs' : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                billingCycle === 'yearly' ? 'bg-slate-950 text-white shadow-xs' : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] bg-teal-500 text-white font-extrabold px-1.5 py-0.2 rounded-full">
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pricingPlans.map((plan) => {
            const isAnnual = billingCycle === 'yearly';
            const price = isAnnual ? plan.yearlyPrice : plan.monthlyPrice;
            const isRecommended = plan.isPopular || plan.badgeText === 'Recommended';
            const isCustom = plan.isCustomQuote || plan.id === 'business';

            return (
              <div 
                key={plan.id}
                className={`rounded-2xl p-6 transition-all flex flex-col justify-between ${
                  isRecommended 
                    ? 'bg-white border-2 border-teal-500 shadow-elevated relative ring-2 ring-teal-500/10' 
                    : 'bg-white border border-slate-200/90 shadow-card hover:border-slate-300'
                }`}
              >
                {isRecommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-500 text-white text-[10px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                    {plan.badgeText || 'Recommended'}
                  </div>
                )}

                <div>
                  <h4 className="text-base font-extrabold text-slate-950">{plan.name}</h4>
                  <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{plan.tagline}</p>

                  <div className="mt-4 mb-6">
                    {isCustom ? (
                      <div>
                        <span className="text-3xl font-black text-slate-950">Custom</span>
                        <p className="text-[11px] text-slate-600 font-semibold mt-1">Volume & support agreed in writing</p>
                      </div>
                    ) : (
                      <div>
                        <span className="text-3xl font-black text-slate-950">{plan.currency}{price}</span>
                        <span className="text-xs text-slate-500 ml-1">/ month</span>
                        {isAnnual && price > 0 && plan.yearlyTotal ? (
                          <p className="text-[11px] text-teal-800 font-bold mt-1">
                            ₹{plan.yearlyTotal.toLocaleString()} billed yearly
                          </p>
                        ) : price > 0 ? (
                          <p className="text-[11px] text-slate-500 font-medium mt-1">Billed monthly</p>
                        ) : (
                          <p className="text-[11px] text-slate-500 font-medium mt-1">Free forever</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-slate-100 pt-4 space-y-2.5">
                    {plan.features.map((feat, idx) => {
                      const isHeader = feat.startsWith('Everything in');
                      return (
                        <div key={idx} className={`flex items-start gap-2 text-xs ${isHeader ? 'font-bold text-slate-950 pt-1' : 'text-slate-700'}`}>
                          <Check className={`w-4 h-4 shrink-0 mt-0.5 ${isHeader ? 'text-teal-600 font-bold' : 'text-teal-500'}`} />
                          <span>{feat}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-8 pt-4">
                  <button
                    onClick={onOpenPricing}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      isRecommended
                        ? 'bg-teal-500 hover:bg-teal-600 text-white shadow-md shadow-teal-500/25 active:scale-[0.98]'
                        : isCustom
                        ? 'bg-slate-950 hover:bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                    }`}
                  >
                    {plan.buttonText || (plan.id === 'free' ? 'Start free' : isCustom ? 'Contact sales' : `Choose ${plan.name}`)}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Occasional Customer Option: Workshop & Event Pack */}
        <div className="mt-8 p-5 bg-teal-50/50 rounded-2xl border border-teal-200/80 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-xs shadow-teal-500/25">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-sm text-slate-950">Workshop & Single Event Pack</h4>
                <span className="text-[10px] font-bold bg-teal-100 text-teal-900 px-2 py-0.5 rounded-full border border-teal-200">
                  One-time • No Subscription
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Need certificates for a single conference or workshop? ₹499 for 100 certificates, 100 email sends, branding removal & print-ready PDF export.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenPricing}
            className="px-5 py-2.5 bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shrink-0 transition-all shadow-xs cursor-pointer"
          >
            Get Event Pack (₹499)
          </button>
        </div>
      </section>

      {/* 7. FAQ SECTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-teal-700 mb-1">Have Questions?</h2>
          <h3 className="text-3xl font-extrabold text-slate-950 tracking-tight">Frequently Asked Questions</h3>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all shadow-xs"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between font-bold text-slate-900 text-xs hover:text-teal-700 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-90 text-teal-600' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-6 pb-4 pt-1 text-slate-600 text-xs leading-relaxed border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. BOTTOM CALL TO ACTION (Deep Navy 950 with Brand Teal Glow) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-14 rounded-3xl bg-slate-950 text-white text-center shadow-elevated border border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h3 className="text-3xl sm:text-4xl font-black tracking-tight">
              Ready to generate your first batch of certificates?
            </h3>
            <p className="text-slate-300 text-sm">
              Join thousands of educators, organizations, and summit directors saving dozens of hours every month.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={onStartCreating}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white bg-teal-500 hover:bg-teal-600 shadow-lg shadow-teal-500/30 transition-all text-sm cursor-pointer active:scale-[0.98]"
              >
                Start Creating Free
              </button>
              <button
                onClick={onVerifyDemo}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-all text-sm cursor-pointer"
              >
                Try Public QR Verification
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
