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
      q: 'How many certificates can I generate in one batch?',
      a: 'You can generate from 1 to 25,000+ certificates in a single batch. CertiForge processes jobs asynchronously with real-time progress updates, ensuring smooth execution without browser freezing.'
    },
    {
      q: 'Can I upload Excel (.xlsx) and CSV files?',
      a: 'Yes! CertiForge supports .xlsx, .xls, and .csv files. Our intelligent column matcher automatically maps headers like "Full Name" to {{name}} and "Issue Date" to {{date}}.'
    },
    {
      q: 'Can I customize the certificate design completely?',
      a: 'Absolutely. Choose from our luxury designer templates or open the Drag & Drop Certificate Studio to customize fonts, colors, seals, borders, signatures, logos, and custom dynamic tags.'
    },
    {
      q: 'How does recipient QR verification work?',
      a: 'Every generated certificate automatically receives a tamper-proof cryptographic QR code. When scanned with any smartphone camera, it opens a verification page confirming the recipient’s credentials, course, and issuance status.'
    },
    {
      q: 'Can I email certificates directly to recipients?',
      a: 'Yes. With one click, you can send personalized emails containing customized subject lines, greeting messages, and the individual certificate PDF attached.'
    },
    {
      q: 'Can I download all certificates together in a ZIP file?',
      a: 'Yes! Once generation completes, you can download an organized ZIP archive containing individual named PDFs (e.g. CERT-001-Aarav.pdf) or a single multi-page combined PDF.'
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
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Top Pill (Crisp white pill with black text and border) */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-100 border border-neutral-300 text-black text-xs font-semibold mb-6 shadow-xs animate-in fade-in slide-in-from-bottom-2 duration-300">
            <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
            <span>Bulk Certificate Infrastructure for Modern Teams</span>
          </div>

          {/* Headline (80% White background, 20% Pitch Black typography) */}
          <h1 className="text-4xl sm:text-6xl font-black text-black tracking-tight max-w-4xl mx-auto leading-[1.12]">
            Create Hundreds of Certificates <br className="hidden sm:inline" />
            <span className="underline decoration-black decoration-wavy decoration-2 underline-offset-8">
              in Minutes
            </span>
          </h1>

          {/* Supporting text */}
          <p className="mt-6 text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            Design once, upload your recipient data, and automatically generate personalized certificates at scale.
          </p>

          {/* CTA Buttons (Black primary button, white secondary button) */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={onStartCreating}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-white bg-black hover:bg-neutral-800 active:scale-[0.98] shadow-sm transition-all text-sm"
            >
              <span>Start Creating</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onExploreTemplates}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-black hover:text-black bg-white hover:bg-neutral-50 border border-neutral-300 shadow-xs transition-all text-sm"
            >
              <Eye className="w-4 h-4 text-neutral-600" />
              <span>See How It Works</span>
            </button>
          </div>

          {/* Micro assurance tags */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-500 font-medium">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-black" /> No credit card required</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-black" /> Free 50 certificates</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-black" /> Instant ZIP download</span>
          </div>

          {/* Certificate Mockup Preview Card (80% White, 20% Black Frame) */}
          <div className="mt-14 max-w-5xl mx-auto">
            <div className="p-3 sm:p-4 rounded-2xl bg-neutral-50 border border-neutral-300/80 shadow-elevated">
              <div className="relative rounded-xl overflow-hidden border border-neutral-800 bg-black p-6 sm:p-10 text-white shadow-inner">
                
                {/* Decorative Mockup Badge */}
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-white/10 border border-white/20 text-white px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md">
                  <ShieldCheck className="w-3.5 h-3.5 text-white" />
                  <span>Real-time QR Verified</span>
                </div>

                {/* Inner Mockup Certificate Canvas (80% Pure White with crisp black borders) */}
                <div className="max-w-3xl mx-auto bg-white text-black p-6 sm:p-10 rounded-lg shadow-2xl border-4 border-black relative">
                  <div className="text-center space-y-3">
                    <p className="text-[10px] sm:text-xs font-extrabold uppercase tracking-[0.25em] text-neutral-500">
                      ACCREDITED INSTITUTE OF EXCELLENCE
                    </p>
                    <h2 className="text-xl sm:text-3xl font-serif font-black text-black tracking-wide">
                      Certificate of Achievement
                    </h2>
                    <p className="text-xs sm:text-sm text-neutral-600 font-serif italic">
                      This is proudly presented to
                    </p>
                    <div className="py-2">
                      <p className="text-2xl sm:text-4xl font-serif font-black text-black tracking-tight">
                        Riya Sharma
                      </p>
                      <div className="w-32 sm:w-48 h-0.5 bg-black mx-auto mt-2" />
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-700 max-w-lg mx-auto leading-relaxed">
                      for demonstrating exceptional mastery and completing the professional curriculum in <strong>Full-Stack Architecture & AI Systems</strong>.
                    </p>
                    
                    <div className="pt-6 flex items-center justify-between border-t border-neutral-200 text-left">
                      <div>
                        <p className="text-[10px] text-neutral-500">Date Conferred</p>
                        <p className="text-xs font-bold text-black">October 15, 2026</p>
                      </div>
                      <div className="text-center">
                        <div className="w-9 h-9 sm:w-11 sm:h-11 border border-black rounded flex items-center justify-center p-1 bg-white">
                          <QrCode className="w-full h-full text-black" />
                        </div>
                        <p className="text-[9px] text-black font-mono font-bold mt-0.5">CERT-2026-0042</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs sm:text-sm font-signature text-black font-bold">Arthur Sterling</p>
                        <p className="text-[10px] text-neutral-500 uppercase tracking-wider">Dean of Academics</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Generation Badge */}
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-neutral-400 px-2 font-medium">
                  <div className="flex items-center gap-2 text-white">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Live batch engine: <strong>1,000 certificates generated in 12s</strong></span>
                  </div>
                  <div className="flex items-center gap-4 text-neutral-300">
                    <span>Format: Vector 300 DPI PDF</span>
                    <span>Output: ZIP Archive</span>
                  </div>
                </div>

              </div>
            </div>
          </div>

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
          <div className="p-8 rounded-2xl bg-white border border-neutral-300 shadow-card hover:border-black transition-all group">
            <div className="w-10 h-10 rounded-xl bg-black text-white font-extrabold text-base flex items-center justify-center mb-6 shadow-xs">
              1
            </div>
            <h4 className="text-base font-bold text-black mb-2">Design</h4>
            <p className="text-neutral-600 text-sm leading-relaxed">
              Pick from our luxury pre-built certificate designs or customize your layout with custom logos, signatures, and dynamic fields like <code className="text-black font-bold font-mono text-xs">{'{{name}}'}</code>.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-8 rounded-2xl bg-white border border-neutral-300 shadow-card hover:border-black transition-all group">
            <div className="w-10 h-10 rounded-xl bg-black text-white font-extrabold text-base flex items-center justify-center mb-6 shadow-xs">
              2
            </div>
            <h4 className="text-base font-bold text-black mb-2">Upload Data</h4>
            <p className="text-neutral-600 text-sm leading-relaxed">
              Drag and drop your Excel (.xlsx) or CSV file. Our smart heuristic column matcher instantly matches your spreadsheet headers with your certificate fields.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-8 rounded-2xl bg-white border border-neutral-300 shadow-card hover:border-black transition-all group">
            <div className="w-10 h-10 rounded-xl bg-black text-white font-extrabold text-base flex items-center justify-center mb-6 shadow-xs">
              3
            </div>
            <h4 className="text-base font-bold text-black mb-2">Generate</h4>
            <p className="text-neutral-600 text-sm leading-relaxed">
              Preview instantly, click Generate, and watch your batch complete in seconds. Download an organized ZIP file, single combined PDF, or send personalized emails.
            </p>
          </div>

        </div>
      </section>

      {/* 4. FEATURES GRID (80% Crisp White with Black Icons) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-wider text-black mb-1">Comprehensive Features</h2>
          <h3 className="text-3xl font-extrabold text-black tracking-tight">Built for Scale and Speed</h3>
          <p className="text-neutral-600 mt-2 text-sm">
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
              title: 'Excel & CSV Import',
              desc: 'Seamless import with automatic validation for missing names, duplicate IDs, and invalid email addresses.'
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
              title: 'Tamper-Proof QR Verification',
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
              <div key={i} className="p-6 rounded-2xl bg-white border border-neutral-200/90 shadow-card hover:border-black transition-all">
                <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-black mb-4 border border-neutral-200">
                  <Icon className="w-5 h-5 text-black" />
                </div>
                <h4 className="font-bold text-black text-base mb-1.5">{feat.title}</h4>
                <p className="text-neutral-600 text-xs leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. USE CASES (20% Black Accent Box with White Content) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-black text-white shadow-elevated border border-neutral-800">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Tailored Solutions</h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Designed for Every Certification Need</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {useCases.map((uc, i) => {
              const Icon = uc.icon;
              return (
                <div key={i} className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 hover:border-neutral-600 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="w-4 h-4 text-white" />
                    <h4 className="font-bold text-white text-sm">{uc.title}</h4>
                  </div>
                  <p className="text-neutral-400 text-xs leading-relaxed">{uc.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. PRICING SECTION (CONFIGURABLE - Crisp White Cards with Black Buttons) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-xs font-bold uppercase tracking-wider text-black mb-1">Transparent Pricing</h2>
          <h3 className="text-3xl font-extrabold text-black tracking-tight">Choose the Plan That Fits Your Scale</h3>
          <p className="text-neutral-600 mt-2 text-sm">
            Launch with Free, Professional, or Institute. Complete annual charge shown upfront. All prices in INR (excl. applicable GST).
          </p>

          {/* Billing Toggle (White/Black segmented switch) */}
          <div className="mt-6 inline-flex items-center p-1 bg-neutral-100 rounded-xl border border-neutral-300">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                billingCycle === 'monthly' ? 'bg-black text-white shadow-xs' : 'text-neutral-600 hover:text-black'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                billingCycle === 'yearly' ? 'bg-black text-white shadow-xs' : 'text-neutral-600 hover:text-black'
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] bg-neutral-300 text-black font-extrabold px-1.5 py-0.2 rounded-full">
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
                    ? 'bg-white border-2 border-black shadow-elevated relative' 
                    : 'bg-white border border-neutral-300 shadow-card'
                }`}
              >
                {isRecommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                    {plan.badgeText || 'Recommended'}
                  </div>
                )}

                <div>
                  <h4 className="text-base font-extrabold text-black">{plan.name}</h4>
                  <p className="text-xs text-neutral-500 mt-1 min-h-[32px]">{plan.tagline}</p>

                  <div className="mt-4 mb-6">
                    {isCustom ? (
                      <div>
                        <span className="text-3xl font-black text-black">Custom</span>
                        <p className="text-[11px] text-neutral-600 font-semibold mt-1">Volume & support agreed in writing</p>
                      </div>
                    ) : (
                      <div>
                        <span className="text-3xl font-black text-black">{plan.currency}{price}</span>
                        <span className="text-xs text-neutral-500 ml-1">/ month</span>
                        {isAnnual && price > 0 && plan.yearlyTotal ? (
                          <p className="text-[11px] text-neutral-700 font-bold mt-1">
                            ₹{plan.yearlyTotal.toLocaleString()} billed yearly
                          </p>
                        ) : price > 0 ? (
                          <p className="text-[11px] text-neutral-500 font-medium mt-1">Billed monthly</p>
                        ) : (
                          <p className="text-[11px] text-neutral-500 font-medium mt-1">Free forever</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-neutral-100 pt-4 space-y-2.5">
                    {plan.features.map((feat, idx) => {
                      const isHeader = feat.startsWith('Everything in');
                      return (
                        <div key={idx} className={`flex items-start gap-2 text-xs ${isHeader ? 'font-bold text-black pt-1' : 'text-neutral-700'}`}>
                          <Check className={`w-4 h-4 shrink-0 mt-0.5 ${isHeader ? 'text-black' : 'text-neutral-500'}`} />
                          <span>{feat}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-8 pt-4">
                  <button
                    onClick={onOpenPricing}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all ${
                      isRecommended
                        ? 'bg-black hover:bg-neutral-800 text-white shadow-sm'
                        : isCustom
                        ? 'bg-black hover:bg-neutral-800 text-white shadow-xs'
                        : 'bg-neutral-100 hover:bg-neutral-200 text-black'
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
        <div className="mt-8 p-5 bg-neutral-50 rounded-2xl border border-neutral-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-bold text-base shrink-0">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-sm text-black">Workshop & Single Event Pack</h4>
                <span className="text-[10px] font-bold bg-neutral-200 text-neutral-800 px-2 py-0.5 rounded-full">
                  One-time • No Subscription
                </span>
              </div>
              <p className="text-xs text-neutral-600 mt-0.5">
                Need certificates for a single conference or workshop? ₹499 for 100 certificates, 100 email sends, branding removal & print-ready PDF export.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenPricing}
            className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-xl shrink-0 transition-all shadow-xs"
          >
            Get Event Pack (₹499)
          </button>
        </div>
      </section>

      {/* 7. FAQ SECTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-black mb-1">Have Questions?</h2>
          <h3 className="text-3xl font-extrabold text-black tracking-tight">Frequently Asked Questions</h3>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx}
                className="bg-white rounded-2xl border border-neutral-200 overflow-hidden transition-all shadow-xs"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between font-bold text-black text-xs hover:text-neutral-700 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronRight className={`w-4 h-4 text-neutral-500 transition-transform ${isOpen ? 'rotate-90 text-black' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-6 pb-4 pt-1 text-neutral-600 text-xs leading-relaxed border-t border-neutral-100">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. BOTTOM CALL TO ACTION (Bold Black Accent 20% / White Text 80%) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-14 rounded-3xl bg-black text-white text-center shadow-elevated border border-neutral-800 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h3 className="text-3xl sm:text-4xl font-black tracking-tight">
              Ready to generate your first batch of certificates?
            </h3>
            <p className="text-neutral-300 text-sm">
              Join thousands of educators, organizations, and summit directors saving dozens of hours every month.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={onStartCreating}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-black bg-white hover:bg-neutral-100 shadow-sm transition-all text-sm"
              >
                Start Creating Free
              </button>
              <button
                onClick={onVerifyDemo}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 transition-all text-sm"
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
