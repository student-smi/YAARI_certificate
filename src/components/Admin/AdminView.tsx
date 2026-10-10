import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  DollarSign, 
  Award, 
  Search, 
  Trash2, 
  ArrowRight, 
  Sparkles, 
  ExternalLink, 
  Check, 
  Building2, 
  Database, 
  HardDrive, 
  CreditCard,
  RefreshCw,
  Eye,
  KeyRound,
  UserCheck
} from 'lucide-react';
import { UserProfile, PricingPlan, Project } from '../../types';
import { StorageService } from '../../services/storageService';

interface AdminViewProps {
  currentUser: UserProfile;
  pricingPlans: PricingPlan[];
  onUpdatePlans: (plans: PricingPlan[]) => void;
  onSwitchAccount: (userId: string) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  currentUser,
  pricingPlans,
  onUpdatePlans,
  onSwitchAccount
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'pricing' | 'audit' | 'database'>('users');
  const [usersList, setUsersList] = useState<UserProfile[]>(StorageService.getAllUsers());
  const [searchQuery, setSearchQuery] = useState('');
  const [editablePlans, setEditablePlans] = useState<PricingPlan[]>(pricingPlans);
  const [savedNotice, setSavedNotice] = useState(false);

  const allProjects = StorageService.getAllProjectsAcrossPlatform();
  const totalCertificates = allProjects.reduce((sum, p) => sum + (p.generatedCount || 0), 0);
  const totalRecipients = allProjects.reduce((sum, p) => sum + (p.recipientsCount || 0), 0);

  const filteredUsers = usersList.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.organizationName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpdateUserPlan = (userId: string, newPlan: UserProfile['plan']) => {
    const updated = StorageService.updateUserByAdmin(userId, { plan: newPlan });
    if (updated) {
      setUsersList(StorageService.getAllUsers());
    }
  };

  const handleUpdateUserRole = (userId: string, newRole: UserProfile['role']) => {
    const updated = StorageService.updateUserByAdmin(userId, { role: newRole });
    if (updated) {
      setUsersList(StorageService.getAllUsers());
    }
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (userId === currentUser.id) {
      alert("You cannot delete your own admin account while logged in!");
      return;
    }
    if (confirm(`Are you sure you want to delete user "${userName}" and all their isolated data?`)) {
      StorageService.deleteUserByAdmin(userId);
      setUsersList(StorageService.getAllUsers());
    }
  };

  const handleSavePricingPlans = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.savePricingPlans(editablePlans);
    onUpdatePlans(editablePlans);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handlePlanLimitChange = (planId: string, field: string, value: number) => {
    setEditablePlans(editablePlans.map(plan => {
      if (plan.id === planId) {
        return {
          ...plan,
          limits: {
            ...plan.limits,
            [field]: value
          }
        };
      }
      return plan;
    }));
  };

  const handlePriceChange = (planId: string, isYearly: boolean, value: number) => {
    setEditablePlans(editablePlans.map(plan => {
      if (plan.id === planId) {
        return {
          ...plan,
          [isYearly ? 'yearlyPrice' : 'monthlyPrice']: value
        };
      }
      return plan;
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-150 bg-white text-neutral-900">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-950 bg-amber-200 border border-amber-300 px-2 py-0.5 rounded flex items-center gap-1 shadow-xs">
              <ShieldCheck className="w-3 h-3 text-amber-900" />
              SUPER ADMIN CONSOLE
            </span>
            <span className="text-xs text-neutral-400 font-mono">Tenant ID: global-root</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
            Platform Administration & Governance
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Manage multi-tenant organizations, isolate customer data, configure SaaS pricing, and audit certificates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-xs font-bold text-black block">{currentUser.name}</span>
            <span className="text-[10px] text-neutral-500 block font-mono">{currentUser.email}</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center font-bold text-sm">
            👑
          </div>
        </div>
      </div>

      {/* Global Platform KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-5">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold mb-2">
            <span>Total Organizations</span>
            <Building2 className="w-4 h-4 text-black" />
          </div>
          <div className="text-2xl font-black text-black">{usersList.length}</div>
          <p className="text-[10px] text-emerald-600 font-bold mt-1">100% Isolated Workspaces</p>
        </div>

        <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-5">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold mb-2">
            <span>Certificates Issued</span>
            <Award className="w-4 h-4 text-black" />
          </div>
          <div className="text-2xl font-black text-black">{totalCertificates.toLocaleString()}</div>
          <p className="text-[10px] text-neutral-500 mt-1">Across {allProjects.length} campaigns</p>
        </div>

        <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-5">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold mb-2">
            <span>Total Recipients</span>
            <Users className="w-4 h-4 text-black" />
          </div>
          <div className="text-2xl font-black text-black">{totalRecipients.toLocaleString()}</div>
          <p className="text-[10px] text-neutral-500 mt-1">Spreadsheet data pipelines</p>
        </div>

        <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-5">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold mb-2">
            <span>Active Paid Plans</span>
            <CreditCard className="w-4 h-4 text-black" />
          </div>
          <div className="text-2xl font-black text-black">
            {usersList.filter(u => u.plan !== 'free').length} / {usersList.length}
          </div>
          <p className="text-[10px] text-emerald-600 font-bold mt-1">Razorpay Sandbox Active</p>
        </div>
      </div>

      {/* Admin Module Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'users'
              ? 'bg-black text-white shadow-xs'
              : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User & Tenant Governance ({usersList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('pricing')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'pricing'
              ? 'bg-black text-white shadow-xs'
              : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Global SaaS Pricing Configurator</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'audit'
              ? 'bg-black text-white shadow-xs'
              : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Platform Certificate Audit Log ({allProjects.length} Projects)</span>
        </button>

        <button
          onClick={() => setActiveTab('database')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'database'
              ? 'bg-black text-white shadow-xs'
              : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Cloudflare D1 & Architecture</span>
        </button>
      </div>

      {/* TAB 1: USER & TENANT MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users by name, email, or organization..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-xl focus:outline-none focus:border-black font-medium"
              />
            </div>
            <p className="text-xs text-neutral-500">
              Showing <strong>{filteredUsers.length}</strong> registered tenant accounts.
            </p>
          </div>

          <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase font-black tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">User / Organization</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Current Plan</th>
                    <th className="py-3 px-4">Isolated Projects</th>
                    <th className="py-3 px-4">Storage Usage</th>
                    <th className="py-3 px-4 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {filteredUsers.map((u) => {
                    const userProjects = StorageService.getProjects(u.id);
                    const userCerts = userProjects.reduce((acc, p) => acc + (p.generatedCount || 0), 0);
                    const isSelf = u.id === currentUser.id;

                    return (
                      <tr key={u.id} className="hover:bg-neutral-50/70 transition-colors">
                        
                        {/* User Identity */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full border border-neutral-200 shrink-0" />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-black">{u.name}</span>
                                {isSelf && (
                                  <span className="text-[9px] font-black uppercase tracking-wider text-black bg-neutral-200 px-1.5 py-0.2 rounded">
                                    YOU
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-neutral-500 font-mono block">{u.email}</span>
                              <span className="text-[10px] text-neutral-400 block font-medium">{u.organizationName}</span>
                            </div>
                          </div>
                        </td>

                        {/* Role Selector */}
                        <td className="py-3.5 px-4">
                          <select
                            value={u.role}
                            disabled={isSelf}
                            onChange={(e) => handleUpdateUserRole(u.id, e.target.value as any)}
                            className={`px-2 py-1 rounded-lg border text-xs font-bold uppercase tracking-wider ${
                              u.role === 'admin'
                                ? 'bg-amber-100 border-amber-300 text-amber-950 font-black'
                                : 'bg-neutral-100 border-neutral-300 text-neutral-800'
                            }`}
                          >
                            <option value="owner">Owner</option>
                            <option value="admin">Admin</option>
                            <option value="editor">Editor</option>
                            <option value="viewer">Viewer</option>
                          </select>
                        </td>

                        {/* Plan Selector */}
                        <td className="py-3.5 px-4">
                          <select
                            value={u.plan}
                            onChange={(e) => handleUpdateUserPlan(u.id, e.target.value as any)}
                            className="px-2 py-1 rounded-lg border border-neutral-300 bg-white font-bold text-xs uppercase text-neutral-900"
                          >
                            <option value="free">Free Tier</option>
                            <option value="starter">Starter Pro</option>
                            <option value="pro">Pro Scale</option>
                            <option value="business">Enterprise Ultra</option>
                          </select>
                        </td>

                        {/* Isolated Projects & Certs */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-black">{userProjects.length} Campaigns</div>
                          <div className="text-[11px] text-neutral-500 font-mono">{userCerts} certificates issued</div>
                        </td>

                        {/* Quota Usage */}
                        <td className="py-3.5 px-4">
                          <div className="w-28">
                            <div className="flex items-center justify-between text-[10px] text-neutral-500 font-mono mb-1">
                              <span>{u.usage.certificatesGenerated} / {u.usage.certificatesLimit}</span>
                            </div>
                            <div className="h-1.5 w-full bg-neutral-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-black rounded-full" 
                                style={{ width: `${Math.min(100, (u.usage.certificatesGenerated / Math.max(1, u.usage.certificatesLimit)) * 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => onSwitchAccount(u.id)}
                              className="px-2.5 py-1 rounded-lg border border-neutral-300 hover:border-black bg-white hover:bg-neutral-100 text-black text-[11px] font-bold flex items-center gap-1 transition-all"
                              title="Impersonate / Switch view to this user"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Switch To</span>
                            </button>

                            {!isSelf && (
                              <button
                                onClick={() => handleDeleteUser(u.id, u.name)}
                                className="p-1 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 transition-colors"
                                title="Delete User and Scoped Data"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GLOBAL SAAS PRICING CONFIGURATOR */}
      {activeTab === 'pricing' && (
        <form onSubmit={handleSavePricingPlans} className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-black">Live SaaS Tier Matrix Configurator</h2>
              <p className="text-xs text-neutral-500">
                Changes here dynamically take effect across the entire platform, Billing Modal, and Landing page.
              </p>
            </div>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold text-xs shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>{savedNotice ? 'Saved!' : 'Save Pricing Matrix'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {editablePlans.map((plan) => (
              <div 
                key={plan.id}
                className="bg-white rounded-2xl border border-neutral-300 p-5 space-y-4 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm uppercase tracking-wide text-black">{plan.name}</span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-neutral-100 text-neutral-700">
                      ID: {plan.id}
                    </span>
                  </div>

                  {/* Pricing Inputs */}
                  <div className="mt-4 space-y-3 pt-3 border-t border-neutral-200">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                        Monthly Fee (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={plan.monthlyPrice}
                        onChange={(e) => handlePriceChange(plan.id, false, Number(e.target.value))}
                        className="w-full px-3 py-1.5 text-xs font-bold border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                        Yearly Fee / Mo (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={plan.yearlyPrice}
                        onChange={(e) => handlePriceChange(plan.id, true, Number(e.target.value))}
                        className="w-full px-3 py-1.5 text-xs font-bold border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                      />
                    </div>
                  </div>

                  {/* Limits */}
                  <div className="mt-4 space-y-3 pt-3 border-t border-neutral-200">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                        Max Certs / Month
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={plan.limits.maxCertificatesPerMonth}
                        onChange={(e) => handlePlanLimitChange(plan.id, 'maxCertificatesPerMonth', Number(e.target.value))}
                        className="w-full px-3 py-1.5 text-xs font-mono font-bold border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                        Storage Limit (GB)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={plan.limits.storageGB}
                        onChange={(e) => handlePlanLimitChange(plan.id, 'storageGB', Number(e.target.value))}
                        className="w-full px-3 py-1.5 text-xs font-mono font-bold border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                        Email Credits
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={plan.limits.maxEmailCredits}
                        onChange={(e) => handlePlanLimitChange(plan.id, 'maxEmailCredits', Number(e.target.value))}
                        className="w-full px-3 py-1.5 text-xs font-mono font-bold border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-neutral-500 italic">
                  Features: {plan.features.length} listed
                </div>
              </div>
            ))}
          </div>
        </form>
      )}

      {/* TAB 3: PLATFORM CERTIFICATE AUDIT LOG */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-black">All Platform Projects & Campaigns</h2>
            <span className="text-xs text-neutral-500">
              Aggregated across all {usersList.length} isolated tenants
            </span>
          </div>

          <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase font-black tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Campaign Name</th>
                  <th className="py-3 px-4">Issuing Organization</th>
                  <th className="py-3 px-4">Tenant User ID</th>
                  <th className="py-3 px-4">Generated</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Date Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {allProjects.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-50">
                    <td className="py-3.5 px-4 font-bold text-black">{p.name}</td>
                    <td className="py-3.5 px-4 text-neutral-600 font-medium">{p.organizationName}</td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-neutral-500">{p.userId || 'usr-corp-1'}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-black">{p.generatedCount} certs</td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-neutral-500 font-mono text-[11px]">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: DATABASE & ARCHITECTURE */}
      {activeTab === 'database' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-black font-bold text-sm">
              <Database className="w-4 h-4" />
              <span>Cloudflare D1 Database Binding</span>
            </div>
            <div className="text-xs space-y-2 text-neutral-600 font-mono bg-white p-4 rounded-xl border border-neutral-200">
              <div><strong>Database Name:</strong> certiforge-db</div>
              <div><strong>Database ID:</strong> 1c138ec4-52d0-43a9-a402-25baaf34efc4</div>
              <div><strong>Binding:</strong> env.DB</div>
              <div><strong>Tables:</strong> users, projects, certificates, api_keys</div>
            </div>
            <p className="text-xs text-neutral-500">
              Data isolation is enforced both in-memory via tenant-keyed storage and via parameterized queries on Cloudflare D1.
            </p>
          </div>

          <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-black font-bold text-sm">
              <HardDrive className="w-4 h-4" />
              <span>Multi-Tenant Isolation Safeguards</span>
            </div>
            <ul className="text-xs space-y-2 text-neutral-700 list-disc list-inside">
              <li>Every project write is scoped to <code>certiforge_projects_[userId]</code>.</li>
              <li>Custom templates are scoped to <code>certiforge_custom_templates_[userId]</code>.</li>
              <li>API keys and email delivery logs are isolated per tenant ID.</li>
              <li>No user can view, edit, or delete another organization's campaigns.</li>
            </ul>
          </div>
        </div>
      )}

    </div>
  );
};
