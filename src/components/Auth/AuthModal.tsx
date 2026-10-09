import React, { useState } from 'react';
import { X, Award, Mail, Lock, User, ArrowRight, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { UserProfile } from '../../types';
import { StorageService } from '../../services/storageService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode: 'login' | 'signup';
  onSuccess: (user: UserProfile, isNewUser: boolean) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode,
  onSuccess
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [password, setPassword] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'forgot') {
      setResetSent(true);
      return;
    }

    setIsLoading(true);
    setAuthError('');

    try {
      if (mode === 'signup') {
        const user = await StorageService.signupUser(email, password, name, orgName);
        onSuccess(user, true);
      } else {
        const user = await StorageService.loginUser(email, password, name, orgName);
        onSuccess(user, false);
      }
      onClose();
    } catch (err: any) {
      setAuthError(err?.message || 'Authentication error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-white rounded-3xl shadow-elevated border border-neutral-300 overflow-hidden text-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center text-white">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-base text-black">CertiForge</span>
              <span className="text-[11px] text-neutral-500 block">
                {mode === 'login' ? 'Welcome back to your workspace' : mode === 'signup' ? 'Create your free account' : 'Reset your password'}
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {resetSent ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 bg-neutral-100 text-black border border-neutral-300 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6 text-black" />
              </div>
              <h4 className="font-bold text-base text-black">Check your inbox</h4>
              <p className="text-xs text-neutral-600">
                We've sent a password reset link to <strong>{email}</strong>.
              </p>
              <button
                type="button"
                onClick={() => {
                  setResetSent(false);
                  setMode('login');
                }}
                className="text-xs font-bold text-black hover:underline pt-2"
              >
                Back to Sign in
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-black mb-1">Your Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Dr. Arthur Sterling"
                        className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:border-black font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-black mb-1">Organization / Institute Name</label>
                    <input
                      type="text"
                      required
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      placeholder="e.g. Apex Institute or TechCorp"
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:border-black font-medium"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold text-black mb-1">Work Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@organization.com"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:border-black font-medium"
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-black">Password</label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => setMode('forgot')}
                        className="text-xs text-neutral-500 hover:text-black hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:border-black font-medium"
                    />
                  </div>
                </div>
              )}

              {authError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-2.5 px-4 bg-black hover:bg-neutral-800 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-xs transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {mode === 'login' ? 'Sign in to Workspace' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Admin Demo Credentials Card */}
          <div className="mt-4 p-3 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-black flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Admin Demo Credentials</span>
              </span>
              <span className="text-[11px] text-neutral-500 font-mono block mt-0.5">
                admin@certiforge.com • admin123
              </span>
            </div>
            <button
              type="button"
              disabled={isLoading}
              onClick={async () => {
                setIsLoading(true);
                try {
                  const demoUser = await StorageService.loginUser(
                    'admin@certiforge.com', 
                    'admin123', 
                    'Tejas Gogavale', 
                    'CertiForge Global'
                  );
                  onSuccess(demoUser, false);
                  onClose();
                } catch (e: any) {
                  setAuthError(e?.message || 'Demo login failed');
                } finally {
                  setIsLoading(false);
                }
              }}
              className="px-3 py-1.5 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0"
            >
              1-Click Login
            </button>
          </div>

          {/* Switch mode */}
          <div className="mt-4 pt-3 border-t border-neutral-100 text-center text-xs text-neutral-500">
            {mode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="font-bold text-black hover:underline"
                >
                  Sign up free
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-bold text-black hover:underline"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
