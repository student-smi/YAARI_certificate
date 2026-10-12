import React, { useState, useEffect } from 'react';
import { X, Award, Mail, Lock, User, ArrowRight, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { UserProfile } from '../../types';
import { StorageService } from '../../services/storageService';

const GOOGLE_CLIENT_ID = '533193672540-5vlrih0dfvljvkeaa72qf6rfq1hn8pa4.apps.googleusercontent.com';

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

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setAuthError('');
      setResetSent(false);
    }
  }, [isOpen, initialMode]);

  // Initialize Google Identity Services
  useEffect(() => {
    if (!isOpen) return;

    const setupGoogle = () => {
      const google = (window as any).google;
      if (google?.accounts?.id) {
        try {
          google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: async (response: any) => {
              if (response?.credential) {
                try {
                  setIsLoading(true);
                  const base64Url = response.credential.split('.')[1];
                  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                  const jsonPayload = decodeURIComponent(
                    atob(base64)
                      .split('')
                      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                      .join('')
                  );
                  const payload = JSON.parse(jsonPayload);
                  const existingAll = StorageService.getAllUsers();
                  const isNew = !existingAll.some(u => u.email.toLowerCase() === payload.email.toLowerCase());

                  const profile = await StorageService.loginWithGoogle({
                    email: payload.email,
                    name: payload.name || payload.given_name || payload.email.split('@')[0],
                    avatar: payload.picture,
                    googleId: payload.sub
                  });

                  onSuccess(profile, isNew);
                  onClose();
                } catch (err: any) {
                  setAuthError(err?.message || 'Failed to authenticate with Google.');
                } finally {
                  setIsLoading(false);
                }
              }
            },
            auto_select: false,
            cancel_on_tap_outside: true
          });
        } catch (e) {
          console.warn('Google accounts.id.initialize warning:', e);
        }
      }
    };

    setupGoogle();
    const timer = setInterval(() => {
      if ((window as any).google?.accounts?.id) {
        setupGoogle();
        clearInterval(timer);
      }
    }, 400);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    setAuthError('');

    const google = (window as any).google;

    // Method 1: Token client popup
    if (google?.accounts?.oauth2) {
      try {
        const client = google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'email profile openid',
          callback: async (tokenResponse: any) => {
            if (tokenResponse?.error) {
              setIsLoading(false);
              setAuthError(tokenResponse.error_description || 'Google sign-in was cancelled or encountered an error.');
              return;
            }

            if (tokenResponse?.access_token) {
              try {
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });
                const info = await res.json();
                if (info?.email) {
                  const existingAll = StorageService.getAllUsers();
                  const isNew = !existingAll.some(u => u.email.toLowerCase() === info.email.toLowerCase());

                  const profile = await StorageService.loginWithGoogle({
                    email: info.email,
                    name: info.name || info.given_name || info.email.split('@')[0],
                    avatar: info.picture,
                    googleId: info.sub
                  });

                  onSuccess(profile, isNew);
                  onClose();
                  return;
                }
              } catch (e) {
                console.warn('Google userinfo fetch failed:', e);
              }
            }
            setIsLoading(false);
          }
        });
        client.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (err) {
        console.warn('Google oauth2 initTokenClient error:', err);
      }
    }

    // Method 2: One Tap prompt
    if (google?.accounts?.id) {
      try {
        google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            setIsLoading(false);
            setAuthError('Google prompt is unavailable. Ensure your origin is whitelisted in Google Console or use email login.');
          }
        });
        return;
      } catch (err) {
        console.warn('Google prompt failed:', err);
      }
    }

    setIsLoading(false);
    setAuthError('Google services are loading. Please try again or sign in with your email below.');
  };

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
          <div className="space-y-1">
            <img 
              src="/logo.png" 
              alt="CertiCraft" 
              className="h-8 w-auto object-contain" 
            />
            <span className="text-[11px] text-neutral-500 block">
              {mode === 'login' ? 'Welcome back to your workspace' : mode === 'signup' ? 'Create your free account' : 'Reset your password'}
            </span>
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
            <div className="space-y-4">

              {/* GOOGLE SSO BUTTON */}
              {mode !== 'forgot' && (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 bg-white hover:bg-neutral-50 text-neutral-800 font-bold border border-neutral-300 rounded-xl text-xs shadow-xs transition-all flex items-center justify-center gap-3 hover:border-black cursor-pointer disabled:opacity-50"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>{mode === 'signup' ? 'Sign up with Google' : 'Continue with Google'}</span>
                  </button>

                  <div className="relative flex items-center justify-center my-3">
                    <div className="border-t border-neutral-200 w-full" />
                    <span className="bg-white px-3 text-[10px] uppercase font-bold text-neutral-400 absolute">
                      or with email
                    </span>
                  </div>
                </div>
              )}

              {/* Standard Email / Password Form */}
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
                  className="w-full mt-2 py-2.5 px-4 bg-teal-500 hover:bg-teal-600 active:scale-[0.98] disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-xs shadow-teal-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
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
            </div>
          )}

          {/* Switch mode */}
          <div className="mt-4 pt-3 border-t border-neutral-100 text-center text-xs text-neutral-500">
            {mode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="font-bold text-teal-700 hover:underline cursor-pointer"
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
                  className="font-bold text-teal-700 hover:underline cursor-pointer"
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

export default AuthModal;
