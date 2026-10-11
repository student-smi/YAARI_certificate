import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  CreditCard, 
  CheckCircle2, 
  Lock 
} from 'lucide-react';
import { PricingPlan, UserProfile } from '../../types';
import { StorageService } from '../../services/storageService';

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
  
  // Checkout flow states
  const [checkoutStep, setCheckoutStep] = useState<'plans' | 'razorpay' | 'success'>('plans');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('user@okaxis');
  const [orderId, setOrderId] = useState('');
  const [paymentId, setPaymentId] = useState('pay_rzp_nmgz9b2');

  // Reset to plans view when opened
  useEffect(() => {
    if (isOpen) {
      setCheckoutStep('plans');
    }
  }, [isOpen]);

  // Show payment success screen for exactly 1 second, then transition back to plans view
  useEffect(() => {
    if (checkoutStep === 'success') {
      const timer = setTimeout(() => {
        setCheckoutStep('plans');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [checkoutStep]);

  if (!isOpen) return null;

  const handleSelectPlan = (planId: string) => {
    if (planId === user.plan) return;
    setSelectedPlanId(planId);
    setOrderId(`order_rzp_${Math.random().toString(36).substring(2, 10).toUpperCase()}`);
    setCheckoutStep('razorpay');
  };

  const handleSimulateRazorpayPay = () => {
    setIsProcessingPayment(true);
    const newPayId = `pay_rzp_${Math.random().toString(36).substring(2, 9)}`;
    setPaymentId(newPayId);

    setTimeout(() => {
      setIsProcessingPayment(false);
      setCheckoutStep('success');

      // Update user plan in persistent storage
      const targetPlan = plans.find(p => p.id === selectedPlanId);
      if (targetPlan) {
        const updatedUser = {
          ...user,
          plan: selectedPlanId as any,
          usage: {
            ...user.usage,
            certificatesLimit: targetPlan.limits.maxCertificatesPerMonth,
            emailCreditsLimit: targetPlan.limits.maxEmailCredits,
            storageLimitMB: targetPlan.limits.storageGB * 1024
          }
        };
        StorageService.saveUser(updatedUser);
        onUpgradeSuccess(selectedPlanId as any);
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-elevated border border-neutral-300 overflow-hidden text-neutral-900 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-neutral-200 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-black bg-neutral-100 border border-neutral-300 px-2 py-0.5 rounded">
                SUBSCRIPTIONS
              </span>
              <span className="text-neutral-300">•</span>
              <span className="text-xs text-neutral-500 font-medium">Razorpay 256-Bit SSL Secure</span>
            </div>
            <h3 className="text-xl font-black text-black mt-1">Plans, Quotas & Billing</h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-black hover:bg-neutral-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-8 flex-1">
          
          {checkoutStep === 'plans' && (
            <div className="space-y-6">
              
              {/* Active Plan & Limits Overview */}
              <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Current Plan</span>
                    <span className="px-2 py-0.5 rounded text-xs font-black uppercase text-black bg-neutral-200 border border-neutral-300">
                      {user.plan}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-black mt-1">
                    {user.usage.certificatesGenerated} of {user.usage.certificatesLimit} certificates used this month
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right text-xs text-neutral-500 hidden sm:block">
                    <p>Next renewal: November 1, 2026</p>
                    <p className="font-bold text-black">Auto-renewal active</p>
                  </div>
                </div>
              </div>

              {/* Billing Cycle Switcher */}
              <div className="text-center">
                <div className="inline-flex items-center p-1 bg-neutral-100 rounded-xl border border-neutral-300">
                  <button
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      billingCycle === 'monthly' ? 'bg-black text-white shadow-xs' : 'text-neutral-600 hover:text-black'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingCycle('yearly')}
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                      billingCycle === 'yearly' ? 'bg-black text-white shadow-xs' : 'text-neutral-600 hover:text-black'
                    }`}
                  >
                    <span>Annual (Save 20%)</span>
                  </button>
                </div>
              </div>

              {/* Plan Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {plans.map((plan) => {
                  const price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
                  const isCurrent = user.plan === plan.id;
                  const isPopular = plan.isPopular;

                  return (
                    <div
                      key={plan.id}
                      className={`rounded-2xl p-5 border flex flex-col justify-between transition-all ${
                        isCurrent
                          ? 'border-2 border-black bg-neutral-50/50'
                          : isPopular
                          ? 'border-2 border-black bg-white shadow-card'
                          : 'border-neutral-200 bg-white hover:border-neutral-400'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm text-black">{plan.name}</h4>
                          {isCurrent && (
                            <span className="text-[10px] font-bold text-black uppercase bg-neutral-200 px-2 py-0.5 rounded">
                              Current
                            </span>
                          )}
                        </div>

                        <div className="my-4">
                          <span className="text-2xl font-black text-black">{plan.currency}{price}</span>
                          <span className="text-xs text-neutral-500 ml-0.5">/mo</span>
                        </div>

                        <div className="space-y-2 border-t border-neutral-100 pt-3 text-xs text-neutral-600">
                          <div className="font-bold text-black">
                            {plan.limits.maxCertificatesPerMonth.toLocaleString()} certs / mo
                          </div>
                          <div>{plan.limits.maxProjects === 9999 ? 'Unlimited' : plan.limits.maxProjects} projects</div>
                          <div>{plan.limits.maxEmailCredits.toLocaleString()} email credits</div>
                          <div>{plan.limits.storageGB} GB storage</div>
                        </div>
                      </div>

                      <div className="mt-6 pt-3">
                        <button
                          disabled={isCurrent}
                          onClick={() => handleSelectPlan(plan.id)}
                          className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
                            isCurrent
                              ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed border border-neutral-200'
                              : 'bg-black hover:bg-neutral-800 text-white shadow-xs'
                          }`}
                        >
                          {isCurrent ? 'Current Plan' : 'Select Plan'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* RAZORPAY CHECKOUT MODAL VIEW */}
          {checkoutStep === 'razorpay' && (
            <div className="max-w-md mx-auto space-y-6 py-4 animate-in zoom-in-95 duration-150">
              
              {/* Razorpay Brand Bar (20% Black) */}
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
                  <span className="text-[10px] text-neutral-400 block font-semibold">Amount</span>
                  <span className="text-base font-black text-white">
                    ₹{billingCycle === 'yearly' ? plans.find(p => p.id === selectedPlanId)?.yearlyPrice : plans.find(p => p.id === selectedPlanId)?.monthlyPrice}
                  </span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-black">Choose Payment Method</label>
                
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-3 rounded-xl border text-center text-xs font-bold transition-all ${
                      paymentMethod === 'upi' ? 'border-black bg-black text-white' : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    UPI / QR
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-xl border text-center text-xs font-bold transition-all ${
                      paymentMethod === 'card' ? 'border-black bg-black text-white' : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('netbanking')}
                    className={`p-3 rounded-xl border text-center text-xs font-bold transition-all ${
                      paymentMethod === 'netbanking' ? 'border-black bg-black text-white' : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    NetBanking
                  </button>
                </div>

                {paymentMethod === 'upi' && (
                  <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2">
                    <label className="block text-[11px] font-bold text-neutral-700">Virtual Payment Address (VPA)</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:border-black font-mono font-bold"
                    />
                    <p className="text-[10px] text-neutral-500">Accepts Google Pay, PhonePe, Paytm, and BHIM.</p>
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2 text-xs">
                    <input
                      type="text"
                      placeholder="Card Number"
                      defaultValue="4111 2222 3333 4444"
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg font-mono font-bold"
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
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={handleSimulateRazorpayPay}
                  className="w-2/3 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2"
                >
                  {isProcessingPayment ? 'Verifying with Bank...' : 'Pay & Upgrade Instantly'}
                </button>
              </div>

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
                  Your subscription has been upgraded to <strong className="uppercase text-black">{selectedPlanId}</strong>.
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
