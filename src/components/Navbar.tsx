import React, { useState } from 'react';
import { 
  Award, 
  Layers, 
  LayoutTemplate, 
  BarChart3, 
  Settings, 
  CreditCard, 
  ShieldCheck, 
  Plus, 
  Menu, 
  X,
  ChevronDown,
  Sparkles,
  Code2,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { UserProfile } from '../types';
import { StorageService } from '../services/storageService';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  user: UserProfile;
  onOpenCreateProject: () => void;
  onOpenBilling: () => void;
  onOpenLogin: () => void;
  onOpenSignup: () => void;
  isLoggedIn: boolean;
  onLogout: () => void;
  onSwitchAccount: (userId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  user,
  onOpenCreateProject,
  onOpenBilling,
  onOpenLogin,
  onOpenSignup,
  isLoggedIn,
  onLogout,
  onSwitchAccount
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Layers, authRequired: true },
    { id: 'templates', label: 'Templates', icon: LayoutTemplate, authRequired: false },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, authRequired: true },
    { id: 'verify', label: 'Verify Credential', icon: ShieldCheck, authRequired: false },
    { id: 'api', label: 'API & Dev', icon: Code2, authRequired: true },
    { id: 'settings', label: 'Settings', icon: Settings, authRequired: true },
    ...(user.role === 'admin' ? [{ id: 'admin', label: '👑 Admin Console', icon: ShieldCheck, authRequired: true }] : []),
  ];

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-black/[0.08] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-8">
            <button 
              onClick={() => setCurrentView(isLoggedIn ? 'dashboard' : 'landing')}
              className="flex items-center gap-2.5 group text-left focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                <Award className="w-4 h-4 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-black group-hover:text-neutral-700 transition-colors">
                  CertiForge
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-800 bg-neutral-100 border border-neutral-200 rounded">
                  PRO
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                if (item.authRequired && !isLoggedIn) return null;
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentView(item.id);
                    }}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold tracking-tight transition-all ${
                      isActive 
                        ? 'text-black bg-neutral-100 shadow-xs' 
                        : 'text-neutral-600 hover:text-black hover:bg-neutral-50'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-neutral-400'}`} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                {/* Usage meter badge with Upgrade option when credits run out */}
                {user.usage.certificatesGenerated >= user.usage.certificatesLimit ? (
                  <button
                    onClick={onOpenBilling}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 rounded-full border border-red-300 transition-all shadow-xs animate-pulse cursor-pointer"
                    title="Credits Khatam! Click to Upgrade Plan"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                    <span>0 Credits Left</span>
                    <span className="bg-red-600 text-white font-extrabold uppercase text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                      <Zap className="w-3 h-3 fill-white" />
                      <span>Upgrade Plan</span>
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={onOpenBilling}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-50 hover:bg-neutral-100 rounded-full border border-neutral-200 transition-colors cursor-pointer"
                    title="Click to view billing and usage limits"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-black" />
                    <span>
                      <span className="font-bold text-black">{user.usage.certificatesGenerated}</span> / {user.usage.certificatesLimit} Certs
                    </span>
                    <span className="text-black font-bold uppercase text-[10px] bg-neutral-200 px-1.5 py-0.2 rounded">
                      {user.plan}
                    </span>
                  </button>
                )}

                {/* Primary CTA: + Create Certificate Project */}
                <button
                  onClick={onOpenCreateProject}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-black hover:bg-neutral-800 active:scale-[0.98] rounded-xl shadow-xs transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Project</span>
                </button>

                {/* User Profile dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1 rounded-full hover:bg-neutral-100 transition-colors focus:outline-none"
                  >
                    <img
                      src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=000000&color=ffffff&bold=true`}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border border-neutral-200 ring-1 ring-black/10"
                    />
                    <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
                  </button>

                  {userDropdownOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-elevated border border-neutral-200 py-2 z-50 text-neutral-800 animate-in fade-in zoom-in-95 duration-100"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-neutral-100">
                        <p className="text-xs font-bold text-black truncate">{user.name}</p>
                        <p className="text-[11px] text-neutral-500 truncate">{user.email}</p>
                        <p className="text-[10px] font-semibold text-neutral-700 uppercase mt-0.5">{user.organizationName}</p>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => setCurrentView('dashboard')}
                          className="w-full text-left px-4 py-2 text-xs hover:bg-neutral-50 flex items-center gap-2 font-medium"
                        >
                          <Layers className="w-3.5 h-3.5 text-neutral-400" />
                          Dashboard
                        </button>
                        {user.role === 'admin' && (
                          <button
                            onClick={() => setCurrentView('admin')}
                            className="w-full text-left px-4 py-2 text-xs bg-amber-50 hover:bg-amber-100/70 text-amber-950 flex items-center gap-2 font-bold"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                            Admin Console
                          </button>
                        )}
                        <button
                          onClick={onOpenBilling}
                          className="w-full text-left px-4 py-2 text-xs hover:bg-neutral-50 flex items-center gap-2 font-medium"
                        >
                          <CreditCard className="w-3.5 h-3.5 text-neutral-400" />
                          Plan & Billing
                        </button>
                        <button
                          onClick={() => setCurrentView('settings')}
                          className="w-full text-left px-4 py-2 text-xs hover:bg-neutral-50 flex items-center gap-2 font-medium"
                        >
                          <Settings className="w-3.5 h-3.5 text-neutral-400" />
                          Organization Settings
                        </button>
                      </div>

                      {/* Multi-Tenant Switcher (Admin Only) */}
                      {user.role === 'admin' && (
                        <div className="border-t border-neutral-100 py-2 px-3 bg-neutral-50">
                          <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500 block mb-1.5">
                            Switch Tenant (Admin Only)
                          </span>
                          <div className="space-y-1">
                            {StorageService.getAllUsers().map((acc) => (
                              <button
                                key={acc.id}
                                type="button"
                                onClick={() => onSwitchAccount(acc.id)}
                                className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                                  acc.id === user.id ? 'bg-black text-white shadow-xs' : 'hover:bg-neutral-200 text-neutral-800'
                                }`}
                              >
                                <div className="truncate max-w-[120px]">
                                  <span className="block truncate font-bold">{acc.name}</span>
                                  <span className="text-[9px] opacity-75 font-mono truncate block">{acc.organizationName}</span>
                                </div>
                                <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                  acc.id === user.id ? 'bg-neutral-800 text-white' : 'bg-neutral-200 text-black'
                                }`}>
                                  {acc.role === 'admin' ? '👑 ADMIN' : acc.role}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="border-t border-neutral-100 pt-1">
                        <button
                          onClick={onLogout}
                          className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={onOpenLogin}
                  className="px-4 py-2 text-xs font-semibold text-neutral-700 hover:text-black hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  Log in
                </button>
                <button
                  onClick={onOpenSignup}
                  className="px-4 py-2 text-xs font-bold text-white bg-black hover:bg-neutral-800 rounded-xl shadow-xs transition-all"
                >
                  Get Started Free
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="md:hidden flex items-center gap-2">
            {isLoggedIn && (
              <button
                onClick={onOpenCreateProject}
                className="p-2 text-white bg-black rounded-lg"
                title="Create Project"
              >
                <Plus className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-neutral-700 hover:text-black rounded-lg hover:bg-neutral-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-white px-4 pt-2 pb-6 space-y-2">
          {navItems.map((item) => {
            if (item.authRequired && !isLoggedIn) return null;
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold ${
                  isActive ? 'text-black bg-neutral-100' : 'text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <Icon className="w-4 h-4 text-neutral-500" />
                {item.label}
              </button>
            );
          })}

          <div className="border-t border-neutral-200 pt-3">
            {isLoggedIn ? (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    onOpenBilling();
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg ${
                    user.usage.certificatesGenerated >= user.usage.certificatesLimit
                      ? 'bg-red-50 text-red-700 font-bold border border-red-200'
                      : 'text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  <span>Plan: <strong className="uppercase">{user.plan}</strong></span>
                  {user.usage.certificatesGenerated >= user.usage.certificatesLimit ? (
                    <span className="text-[11px] font-black text-red-600 flex items-center gap-1">
                      <Zap className="w-3 h-3 fill-red-600" /> 0 Credits (Upgrade)
                    </span>
                  ) : (
                    <span className="text-[11px] text-neutral-500">{user.usage.certificatesGenerated}/{user.usage.certificatesLimit} Certs</span>
                  )}
                </button>
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg font-medium"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => {
                    onOpenLogin();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 text-center text-xs font-semibold text-neutral-700 border border-neutral-200 rounded-lg"
                >
                  Log in
                </button>
                <button
                  onClick={() => {
                    onOpenSignup();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 text-center text-xs font-bold text-white bg-black rounded-lg"
                >
                  Get Started Free
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
