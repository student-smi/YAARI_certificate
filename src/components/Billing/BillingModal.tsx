import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  CreditCard, 
  CheckCircle2, 
  Lock,
  Mail,
  Zap,
  PhoneCall,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { PricingPlan, UserProfile } from '../../types';
import { StorageService } from '../../services/storageService';
import { WORKSHOP_EVENT_PACK } from '../../data/defaultTemplates';

interface BillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  plans: PricingPlan[];
  onUpgradeSuccess: (newPlan: 'free' | 'starter' | 'pro' | 'business') => void;
}

export const BillingModal: React.FC<BillingModalProps> = ({
  isOpen,
  onClose,
  user,
  plans,
  onUpgradeSuccess
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [selectedPlanId, setSelectedPlanId] = useState<string>(user.plan);
  const [isEventPackSelected, setIsEventPackSelected] = useState(false);
  
  // Checkout flow states
  const [checkoutStep, setCheckoutStep] = useState<'plans' | 'razorpay' | 'success' | 'contact_sales'>('plans');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('user@okaxis');
  const [orderId, setOrderId] = useState('');
  const [paymentId, setPaymentId] = useState('pay_rzp_nmgz9b2');
  
  // Enterprise contact form
  const [salesName, setSalesName] = useState(user.name || '');
  const [salesEmail, setSalesEmail] = useState(user.email || '');
  const [salesVolume, setSalesVolume] = useState('10,000+ certificates/mo');
  const [salesSent, setSalesSent] = useState(false);

  // Reset to plans view when opened
  useEffect(() => {
    if (isOpen) {
      setCheckoutStep('plans');
      setIsEventPackSelected(false);
      setSalesSent(false);
    }
  }, [isOpen]);

  // Show payment success screen for 1.2 seconds, then transition back to plans view
  useEffect(() => {
    if (checkoutStep === 'success') {
      const timer = setTimeout(() => {
        setCheckoutStep('plans');
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [checkoutStep]);

  if (!isOpen) return null;

  const handleSelectPlan = (planId: string) => {
    const target = plans.find(p => p.id === planId);
    if (target?.isCustomQuote || planId === 'business') {
      setCheckoutStep('contact_sales');
      return;
    }

    if (planId === user.plan) return;
    setIsEventPackSelected(false);
    setSelectedPlanId(planId);
    setOrderId(`order_rzp_${Math.random().toString(36).substring(2, 10).toUpperCase()}`);
    setCheckoutStep('razorpay');
  };

  const handleSelectEventPack = () => {
    setIsEventPackSelected(true);
    setSelectedPlanId('starter');
    setOrderId(`order_rzp_${Math.random().toString(36).substring(2, 10).toUpperCase()}`);
    setCheckoutStep('razorpay');
  };

  // Calculate full charge amount
  const selectedPlan = plans.find(p => p.id === selectedPlanId);
  const isYearly = billingCycle === 'yearly';

  const checkoutTotal = isEventPackSelected
    ? WORKSHOP_EVENT_PACK.price
    : isYearly
    ? (selectedPlan?.yearlyTotal || (selectedPlan?.yearlyPrice ? selectedPlan.yearlyPrice * 12 : 0))
    : (selectedPlan?.monthlyPrice || 0);

  const monthlyEquivalent = isYearly ? selectedPlan?.yearlyPrice : selectedPlan?.monthlyPrice;

  const handleSimulateRazorpayPay = () => {
    setIsProcessingPayment(true);
    const newPayId = `pay_rzp_${Math.random().toString(36).substring(2, 9)}`;
    setPaymentId(newPayId);

    setTimeout(() => {
      setIsProcessingPayment(false);
      setCheckoutStep('success');

      if (isEventPackSelected) {
        // Add 100 certificates & 100 email credits to current user
        const updatedUser = {
          ...user,
          usage: {
            ...user.usage,
            certificatesLimit: user.usage.certificatesLimit + 100,
            emailCreditsLimit: user.usage.emailCreditsLimit + 100
          }
        };
        StorageService.saveUser(updatedUser);
      } else if (selectedPlan) {
        const updatedUser = {
          ...user,
          plan: selectedPlanId as any,
          usage: {
            ...user.usage,
            certificatesLimit: selectedPlan.limits.maxCertificatesPerMonth,
            emailCreditsLimit: selectedPlan.limits.maxEmailCredits,
            storageLimitMB: selectedPlan.limits.storageGB * 1024
          }
        };
        StorageService.saveUser(updatedUser);
        onUpgradeSuccess(selectedPlanId as any);
      }
    }, 1200);
  };

  const handleSendSalesInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    setSalesSent(true);
    setTimeout(() => {
      setCheckoutStep('plans');
      setSalesSent(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-elevated border border-neutral-300 overflow-hidden text-neutral-900 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-neutral-200 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-black bg-neutral-100 border border-neutral-300 px-2 py-0.5 rounded">
                SUBSCRIPTIONS & LICENSES
              </span>
              <span className="text-neutral-300">•</span>
              <span className="text-xs text-neutral-500 font-medium">Razorpay 256-Bit SSL Secure</span>
            </div>
            <h3 className="text-xl font-black text-black mt-1">Plans, Quotas & Transparent Billing</h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-black hover:bg-neutral-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {checkoutStep === 'plans' && (
            <div className="space-y-6">
              
              {/* Active Plan & Limits Overview */}
              <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Current Plan</span>
                    <span className="px-2.5 py-0.5 rounded text-xs font-black uppercase text-black bg-neutral-200 border border-neutral-300">
                      {user.plan === 'starter' ? 'Professional' : user.plan === 'pro' ? 'Institute' : user.plan === 'business' ? 'Enterprise' : 'Free'}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-black mt-1">
                    {user.usage.certificatesGenerated} of {user.usage.certificatesLimit.toLocaleString()} certificates used this month
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right text-xs text-neutral-500 hidden sm:block">
                    <p>Next renewal: November 1, 2026</p>
                    <p className="font-bold text-black">All prices in INR • Excl. GST</p>
                  </div>
                </div>
              </div>

              {/* Billing Cycle Switcher */}
              <div className="text-center">
                <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-300">
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
                    <span>Annual Billing (Save 20%)</span>
                    <span className="text-[10px] bg-teal-500 text-white font-extrabold px-1.5 py-0.2 rounded-full">
                      -20%
                    </span>
                  </button>
                </div>
              </div>

              {/* Plan Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {plans.map((plan) => {
                  const price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
                  const isCurrent = user.plan === plan.id;
                  const isRecommended = plan.isPopular || plan.badgeText === 'Recommended';
                  const isCustom = plan.isCustomQuote || plan.id === 'business';

                  return (
                    <div
                      key={plan.id}
                      className={`rounded-2xl p-5 border flex flex-col justify-between transition-all ${
                        isCurrent
                          ? 'border-2 border-slate-950 bg-slate-50/50'
                          : isRecommended
                          ? 'border-2 border-teal-500 bg-white shadow-card relative ring-2 ring-teal-500/10'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      {isRecommended && !isCurrent && (
                        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-teal-500 text-white text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                          Recommended
                        </div>
                      )}

                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="font-extrabold text-sm text-slate-950">{plan.name}</h4>
                          {isCurrent && (
                            <span className="text-[10px] font-bold text-teal-900 uppercase bg-teal-100 border border-teal-200 px-2 py-0.5 rounded">
                              Current
                            </span>
                          )}
                        </div>

                        <div className="my-3">
                          {isCustom ? (
                            <div>
                              <span className="text-xl font-black text-slate-950">Contact sales</span>
                              <span className="text-[11px] text-slate-500 block">Custom volume & SLA</span>
                            </div>
                          ) : (
                            <div>
                              <span className="text-2xl font-black text-slate-950">{plan.currency}{price}</span>
                              <span className="text-xs text-slate-500 ml-0.5">/mo</span>
                              {billingCycle === 'yearly' && price > 0 && plan.yearlyTotal && (
                                <p className="text-[10px] text-teal-800 font-bold mt-0.5">
                                  ₹{plan.yearlyTotal.toLocaleString()} billed yearly
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="space-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-700">
                          <div className="font-bold text-slate-950">
                            {plan.limits.maxCertificatesPerMonth.toLocaleString()} certs / mo
                          </div>
                          <div>{plan.limits.maxEmailCredits.toLocaleString()} email sends / mo</div>
                          <div>{plan.limits.teamSeats} {plan.limits.teamSeats > 1 ? 'team members' : 'team seat'}</div>
                          <div>{plan.limits.hasWhiteLabel ? 'Verification branding removal' : 'CertiCraft branding'}</div>
                          <div>Print-ready vector PDF</div>
                        </div>
                      </div>

                      <div className="mt-5 pt-3">
                        <button
                          disabled={isCurrent}
                          onClick={() => handleSelectPlan(plan.id)}
                          className={`w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isCurrent
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                              : isRecommended
                              ? 'bg-teal-500 hover:bg-teal-600 active:scale-[0.98] text-white shadow-md shadow-teal-500/25'
                              : isCustom
                              ? 'bg-slate-950 hover:bg-slate-900 text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-950'
                          }`}
                        >
                          {isCurrent 
                            ? 'Current Plan' 
                            : isCustom 
                            ? 'Contact sales' 
                            : plan.id === 'free' 
                            ? 'Start free' 
                            : `Choose ${plan.name}`}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Occasional Customer Option: Workshop & Event Pack */}
              <div className="p-4 bg-teal-50/50 rounded-2xl border border-teal-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-500 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs shadow-teal-500/25">
                    ⚡
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-xs text-slate-950">Prepaid Workshop & Event Pack</h4>
                      <span className="text-[10px] font-bold bg-teal-100 text-teal-900 px-2 py-0.5 rounded-full border border-teal-200">
                        ₹499 one-time
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Need credits for a single event? Get 100 certificates + 100 email sends without any recurring subscription.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleSelectEventPack}
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shrink-0 transition-all shadow-xs cursor-pointer"
                >
                  Buy Pack (₹499)
                </button>
              </div>

            </div>
          )}

          {/* RAZORPAY CHECKOUT MODAL VIEW */}
          {checkoutStep === 'razorpay' && (
            <div className="max-w-md mx-auto space-y-5 py-2 animate-in zoom-in-95 duration-150">
              
              {/* Razorpay Brand Bar */}
              <div className="p-4 rounded-2xl bg-black text-white flex items-center justify-between shadow-md border border-neutral-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center font-bold text-white text-xs border border-neutral-700">
                    Rz
                  </div>
                  <div>
                    <span className="font-bold text-sm tracking-wide">Razorpay Checkout</span>
                    <span className="text-[10px] text-neutral-400 block font-mono">{orderId}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-neutral-400 block font-semibold">Total Payable</span>
                  <span className="text-lg font-black text-white">
                    ₹{checkoutTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Plan & Billing Breakdown (Transparent Yearly Display) */}
              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between font-bold text-black">
                  <span>Item</span>
                  <span>{isEventPackSelected ? 'Workshop & Event Pack (100 Certs)' : `${selectedPlan?.name} Subscription`}</span>
                </div>
                
                {!isEventPackSelected && (
                  <>
                    <div className="flex justify-between text-neutral-600">
                      <span>Billing Period</span>
                      <span className="font-semibold text-black">{isYearly ? 'Annual (12 Months)' : 'Monthly'}</span>
                    </div>
                    {isYearly && (
                      <div className="flex justify-between text-neutral-600">
                        <span>Monthly Equivalent</span>
                        <span>₹{monthlyEquivalent}/mo</span>
                      </div>
                    )}
                  </>
                )}

                <div className="border-t border-neutral-200 pt-2 flex justify-between font-extrabold text-black text-sm">
                  <span>Total Amount Due</span>
                  <span>₹{checkoutTotal.toLocaleString()}</span>
                </div>
                <p className="text-[10px] text-neutral-500">
                  {isYearly ? 'Billed annually upfront. Excl. applicable GST.' : 'Billed monthly. Cancel anytime.'}
                </p>
              </div>

              {/* Payment Methods */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-black">Choose Payment Method</label>
                
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                      paymentMethod === 'upi' ? 'border-black bg-black text-white' : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    UPI / QR
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                      paymentMethod === 'card' ? 'border-black bg-black text-white' : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('netbanking')}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                      paymentMethod === 'netbanking' ? 'border-black bg-black text-white' : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    NetBanking
                  </button>
                </div>

                {paymentMethod === 'upi' && (
                  <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1.5">
                    <label className="block text-[11px] font-bold text-neutral-700">Virtual Payment Address (VPA)</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:border-black font-mono font-bold"
                    />
                    <p className="text-[10px] text-neutral-500">Google Pay, PhonePe, Paytm, and BHIM UPI.</p>
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2 text-xs">
                    <input
                      type="text"
                      placeholder="Card Number"
                      defaultValue="4111 2222 3333 4444"
                      className="w-full px-3 py-1.5 text-xs border border-neutral-300 rounded-lg font-mono font-bold"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" placeholder="MM/YY" defaultValue="12/28" className="px-3 py-1.5 border border-neutral-300 rounded-lg font-bold" />
                      <input type="text" placeholder="CVV" defaultValue="789" className="px-3 py-1.5 border border-neutral-300 rounded-lg font-bold" />
                    </div>
                  </div>
                )}
              </div>

              {/* Security info */}
              <div className="flex items-center gap-2 text-xs text-neutral-500 justify-center">
                <Lock className="w-3.5 h-3.5 text-black" />
                <span>256-Bit SSL Encrypted Razorpay Sandbox Checkout</span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCheckoutStep('plans')}
                  className="w-1/3 py-2.5 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-700 hover:bg-neutral-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={handleSimulateRazorpayPay}
                  className="w-2/3 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2"
                >
                  {isProcessingPayment ? 'Processing...' : `Pay ₹${checkoutTotal.toLocaleString()} & Activate`}
                </button>
              </div>

            </div>
          )}

          {/* CONTACT SALES VIEW (ENTERPRISE) */}
          {checkoutStep === 'contact_sales' && (
            <div className="max-w-md mx-auto py-2 space-y-5 animate-in zoom-in-95 duration-150">
              <div>
                <h4 className="text-lg font-black text-black">Enterprise Custom Quote</h4>
                <p className="text-xs text-neutral-600 mt-1">
                  High-volume examination boards, custom domain setups, and dedicated SLA contracts are quoted individually.
                </p>
              </div>

              {salesSent ? (
                <div className="p-6 bg-neutral-50 border border-neutral-200 rounded-2xl text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-black mx-auto" />
                  <h5 className="font-bold text-sm text-black">Request Submitted!</h5>
                  <p className="text-xs text-neutral-600">
                    Our solutions team will connect with your institution within 1 business day.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSendSalesInquiry} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={salesName}
                      onChange={(e) => setSalesName(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Work / Institute Email</label>
                    <input
                      type="email"
                      required
                      value={salesEmail}
                      onChange={(e) => setSalesEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Estimated Monthly Volume</label>
                    <select
                      value={salesVolume}
                      onChange={(e) => setSalesVolume(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg font-medium bg-white"
                    >
                      <option>10,000 to 25,000 certificates/mo</option>
                      <option>25,000 to 100,000 certificates/mo</option>
                      <option>100,000+ certificates/mo (Board Exam scale)</option>
                    </select>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setCheckoutStep('plans')}
                      className="w-1/3 py-2.5 border border-neutral-300 rounded-xl font-bold text-neutral-700 hover:bg-neutral-50"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="w-2/3 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl font-bold shadow-xs flex items-center justify-center gap-2"
                    >
                      <span>Submit Inquiry</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* PAYMENT SUCCESS VIEW */}
          {checkoutStep === 'success' && (
            <div className="max-w-md mx-auto py-8 text-center space-y-5 animate-in zoom-in-95 duration-150">
              <div className="w-14 h-14 rounded-full bg-neutral-100 text-black border border-neutral-300 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7 text-black" />
              </div>

              <div>
                <h4 className="text-xl font-black text-black">Payment Verified Successfully!</h4>
                <p className="text-xs text-neutral-500 mt-1">
                  {isEventPackSelected 
                    ? '100 Certificate & 100 Email credits added to your workspace.' 
                    : `Your workspace subscription has been upgraded to ${selectedPlan?.name}.`}
                </p>
              </div>

              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl text-left text-xs space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Payment ID:</span>
                  <span className="font-bold text-black">{paymentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Status:</span>
                  <span className="font-bold text-black">Captured (200 OK)</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCheckoutStep('plans')}
                className="w-full py-2.5 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Back to Dashboard
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default BillingModal;

