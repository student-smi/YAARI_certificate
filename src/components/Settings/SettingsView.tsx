import React, { useState } from 'react';
import { 
  Building2, 
  Palette, 
  Users, 
  DollarSign, 
  Trash2, 
  Check 
} from 'lucide-react';
import { UserProfile, PricingPlan } from '../../types';
import { StorageService } from '../../services/storageService';

interface SettingsViewProps {
  user: UserProfile;
  plans: PricingPlan[];
  onUpdateUser: (updated: UserProfile) => void;
  onUpdatePlans: (updated: PricingPlan[]) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  plans,
  onUpdateUser,
  onUpdatePlans
}) => {
  const [activeTab, setActiveTab] = useState<'branding' | 'profile' | 'team' | 'pricing' | 'danger'>('branding');
  const [profileName, setProfileName] = useState(user.name);
  const [profileEmail, setProfileEmail] = useState(user.email);
  const [orgName, setOrgName] = useState(user.organizationName);
  const [brandColor, setBrandColor] = useState(user.branding.primaryColor || '#000000');
  const [customDomain, setCustomDomain] = useState(user.branding.customDomain || 'credentials.institution.edu');
  const [whiteLabelToggle, setWhiteLabelToggle] = useState(user.branding.whiteLabelVerification);

  const [teamMembers, setTeamMembers] = useState([
    { id: '1', name: user.name, email: user.email, role: 'Owner' },
    { id: '2', name: 'Dr. Arthur Sterling', email: 'arthur.s@institution.edu', role: 'Admin' },
    { id: '3', name: 'Eleanor Vance', email: 'eleanor.v@institution.edu', role: 'Editor' }
  ]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'Admin' | 'Editor' | 'Viewer'>('Editor');

  const [editablePlans, setEditablePlans] = useState<PricingPlan[]>(plans);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSaveSettings = () => {
    const updated: UserProfile = {
      ...user,
      name: profileName,
      email: profileEmail,
      organizationName: orgName,
      branding: {
        ...user.branding,
        primaryColor: brandColor,
        customDomain,
        whiteLabelVerification: whiteLabelToggle
      }
    };
    StorageService.saveUser(updated);
    onUpdateUser(updated);

    StorageService.savePricingPlans(editablePlans);
    onUpdatePlans(editablePlans);

    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setTeamMembers([
      ...teamMembers,
      { id: Date.now().toString(), name: inviteEmail.split('@')[0], email: inviteEmail, role: inviteRole }
    ]);
    setInviteEmail('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-150 bg-white text-neutral-900">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
            Organization & System Settings
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Configure branding, team roles, white-label options, and SaaS pricing limits.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          className="flex items-center gap-2 px-5 py-2 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
        >
          {savedNotice ? <Check className="w-3.5 h-3.5 text-white" /> : null}
          <span>{savedNotice ? 'Saved Successfully' : 'Save Changes'}</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Left Nav Tabs (80% White, 20% Black) */}
        <div className="w-full md:w-64 space-y-1 shrink-0">
          {[
            { id: 'branding', label: 'Branding & White-Label', icon: Palette },
            { id: 'profile', label: 'Profile & Organization', icon: Building2 },
            { id: 'team', label: 'Team Members', icon: Users },
            { id: 'pricing', label: 'Admin Pricing Config', icon: DollarSign },
            { id: 'danger', label: 'Danger Zone', icon: Trash2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-left transition-all ${
                  isActive ? 'bg-black text-white shadow-xs' : 'text-neutral-600 hover:bg-neutral-100 hover:text-black'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-neutral-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Content Form */}
        <div className="flex-1 bg-white rounded-2xl border border-neutral-200 shadow-card p-6">
          
          {/* TAB 1: BRANDING & WHITE-LABEL */}
          {activeTab === 'branding' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-extrabold text-sm text-black">Branding & White-Label Customization</h3>
                <p className="text-xs text-neutral-500 mt-0.5">Customize issuer colors and domain appearance across all certificates and verification pages.</p>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-black mb-1">Primary Brand Accent Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={brandColor}
                      onChange={(e) => setBrandColor(e.target.value)}
                      className="w-10 h-10 rounded-lg border border-neutral-300 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={brandColor}
                      onChange={(e) => setBrandColor(e.target.value)}
                      className="w-32 px-3 py-2 text-xs border border-neutral-300 rounded-lg font-mono uppercase font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-black mb-1">Custom Verification Subdomain</label>
                  <div className="flex items-center max-w-md">
                    <input
                      type="text"
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs border border-neutral-300 rounded-lg font-mono font-medium"
                    />
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1">Point your CNAME record to verify.certiforge.io for white-labeled SSL verification.</p>
                </div>

                <div className="pt-2 flex items-center justify-between p-4 bg-neutral-50 border border-neutral-200 rounded-xl">
                  <div>
                    <h4 className="font-bold text-xs text-black">White-Label Verification Badge</h4>
                    <p className="text-[11px] text-neutral-500">Remove CertiForge watermark from the public credential verification view.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={whiteLabelToggle}
                    onChange={(e) => setWhiteLabelToggle(e.target.checked)}
                    className="w-4 h-4 text-black rounded border-neutral-300 focus:ring-black"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PROFILE & ORG */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-extrabold text-sm text-black">Organization Profile</h3>
                <p className="text-xs text-neutral-500 mt-0.5">Manage your personal account credentials and organization profile.</p>
              </div>

              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-black mb-1">Full Name</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-black mb-1">Work Email</label>
                    <input
                      type="email"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-black mb-1">Organization Name</label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TEAM MEMBERS */}
          {activeTab === 'team' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-extrabold text-sm text-black">Team Members & Permissions</h3>
                <p className="text-xs text-neutral-500 mt-0.5">Invite colleagues to collaborate on certificate templates and batch generation.</p>
              </div>

              <form onSubmit={handleAddMember} className="flex flex-col sm:flex-row items-center gap-2 p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <input
                  type="email"
                  placeholder="colleague@institution.edu"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="flex-1 w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg bg-white font-medium"
                />
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full sm:w-32 px-3 py-2 text-xs border border-neutral-300 rounded-lg bg-white font-bold"
                >
                  <option value="Admin">Admin</option>
                  <option value="Editor">Editor</option>
                  <option value="Viewer">Viewer</option>
                </select>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2 bg-black text-white font-bold text-xs rounded-lg shadow-xs hover:bg-neutral-800 transition-colors whitespace-nowrap"
                >
                  Invite Member
                </button>
              </form>

              <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-xl overflow-hidden">
                {teamMembers.map((m) => (
                  <div key={m.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-neutral-50">
                    <div>
                      <p className="font-bold text-black">{m.name}</p>
                      <p className="text-neutral-500 text-[11px] font-medium">{m.email}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full font-bold bg-neutral-100 text-black border border-neutral-300 text-[10px]">
                      {m.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ADMIN PRICING CONFIGURATOR */}
          {activeTab === 'pricing' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-extrabold text-sm text-black">Admin SaaS Pricing Configurator</h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Adjust pricing tiers and monthly limits dynamically without redeploying code.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                {editablePlans.map((plan, idx) => (
                  <div key={plan.id} className="p-4 rounded-xl border border-neutral-200 bg-neutral-50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-black uppercase">{plan.name}</span>
                      <span className="text-xs font-mono font-bold text-neutral-400">ID: {plan.id}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <label className="text-neutral-600 block mb-0.5 font-bold">Monthly Price (₹)</label>
                        <input
                          type="number"
                          value={plan.monthlyPrice}
                          onChange={(e) => {
                            const updated = [...editablePlans];
                            updated[idx].monthlyPrice = Number(e.target.value);
                            setEditablePlans(updated);
                          }}
                          className="w-full px-2 py-1.5 border border-neutral-300 rounded-lg bg-white font-bold"
                        />
                      </div>

                      <div>
                        <label className="text-neutral-600 block mb-0.5 font-bold">Yearly Price (₹/mo)</label>
                        <input
                          type="number"
                          value={plan.yearlyPrice}
                          onChange={(e) => {
                            const updated = [...editablePlans];
                            updated[idx].yearlyPrice = Number(e.target.value);
                            setEditablePlans(updated);
                          }}
                          className="w-full px-2 py-1.5 border border-neutral-300 rounded-lg bg-white font-bold"
                        />
                      </div>

                      <div>
                        <label className="text-neutral-600 block mb-0.5 font-bold">Max Certs / Mo</label>
                        <input
                          type="number"
                          value={plan.limits.maxCertificatesPerMonth}
                          onChange={(e) => {
                            const updated = [...editablePlans];
                            updated[idx].limits.maxCertificatesPerMonth = Number(e.target.value);
                            setEditablePlans(updated);
                          }}
                          className="w-full px-2 py-1.5 border border-neutral-300 rounded-lg bg-white font-bold"
                        />
                      </div>

                      <div>
                        <label className="text-neutral-600 block mb-0.5 font-bold">Email Credits</label>
                        <input
                          type="number"
                          value={plan.limits.maxEmailCredits}
                          onChange={(e) => {
                            const updated = [...editablePlans];
                            updated[idx].limits.maxEmailCredits = Number(e.target.value);
                            setEditablePlans(updated);
                          }}
                          className="w-full px-2 py-1.5 border border-neutral-300 rounded-lg bg-white font-bold"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: DANGER ZONE */}
          {activeTab === 'danger' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-sm text-red-600">Danger Zone</h3>
                <p className="text-xs text-neutral-500 mt-0.5">Destructive actions for organization data and account deletion.</p>
              </div>

              <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50 space-y-3">
                <p className="text-xs text-neutral-700">
                  Deleting your organization will immediately terminate all active generation jobs and revoke public QR verification links.
                </p>
                <button
                  type="button"
                  onClick={() => alert('Account deletion simulated.')}
                  className="px-4 py-2 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Delete Organization Workspace
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
