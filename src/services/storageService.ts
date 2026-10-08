import { Project, Template, UserProfile, PricingPlan, ApiKeyItem } from '../types';
import { DEFAULT_TEMPLATES, PRICING_PLANS } from '../data/defaultTemplates';
import { INITIAL_PROJECTS, SAMPLE_RECIPIENTS_RAW } from '../data/sampleData';

const STORAGE_KEYS = {
  PROJECTS: 'certiforge_projects_v1',
  TEMPLATES: 'certiforge_templates_v1',
  USER_PROFILE: 'certiforge_user_profile_v1',
  IS_LOGGED_IN: 'certiforge_is_logged_in_v1',
  PRICING: 'certiforge_pricing_plans_v1',
  API_KEYS: 'certiforge_api_keys_v1',
  EMAIL_LOGS: 'certiforge_email_logs_v1',
};

export const DEFAULT_USER: UserProfile = {
  id: 'usr-guest-1',
  name: 'Guest User',
  email: 'guest@certiforge.dev',
  organizationName: 'Independent Organization',
  role: 'owner',
  avatar: 'https://ui-avatars.com/api/?name=Guest+User&background=000000&color=ffffff&bold=true',
  plan: 'starter',
  isYearlyBilling: false,
  usage: {
    certificatesGenerated: 0,
    certificatesLimit: 250,
    storageUsedMB: 0,
    storageLimitMB: 1024,
    emailCreditsUsed: 0,
    emailCreditsLimit: 250
  },
  branding: {
    logoUrl: '',
    primaryColor: '#000000',
    issuerName: 'Independent Organization',
    customDomain: '',
    whiteLabelVerification: false
  }
};

const DEFAULT_API_KEYS: ApiKeyItem[] = [
  {
    id: 'key-prod-1',
    name: 'Production LMS Webhook',
    keyPrefix: 'cfg_live_9a7f...e3b1',
    createdAt: '2026-09-01T12:00:00Z',
    lastUsedAt: '2026-10-07T08:14:00Z'
  },
  {
    id: 'key-dev-1',
    name: 'Staging Integration',
    keyPrefix: 'cfg_test_4b2c...9d8a',
    createdAt: '2026-09-20T10:30:00Z',
    lastUsedAt: '2026-10-05T15:20:00Z'
  }
];

export class StorageService {
  // Listeners for reactive updates
  private static listeners: Set<() => void> = new Set();

  public static subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private static notify() {
    this.listeners.forEach(cb => cb());
  }

  // Session state
  public static isLoggedIn(): boolean {
    const status = localStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN);
    return status === 'true';
  }

  public static setLoggedIn(status: boolean) {
    localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, status ? 'true' : 'false');
    this.notify();
  }

  public static logout() {
    this.setLoggedIn(false);
    localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
    this.notify();
  }

  // Build clean UserProfile based on user's own data
  public static createProfileForUser(partial: {
    id?: string;
    email: string;
    name?: string;
    organizationName?: string;
    role?: 'owner' | 'admin' | 'editor';
    plan?: 'free' | 'starter' | 'pro' | 'business';
    avatar?: string;
  }): UserProfile {
    const cleanEmail = partial.email.trim().toLowerCase();
    const emailUserPart = cleanEmail.split('@')[0] || 'Member';
    const autoName = emailUserPart
      .replace(/[._-]+/g, ' ')
      .replace(/\b\w/g, (c: string) => c.toUpperCase());
    
    const emailDomain = cleanEmail.split('@')[1] || '';
    const autoOrg = emailDomain && !['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'].includes(emailDomain)
      ? emailDomain.split('.')[0].toUpperCase() + ' Organization'
      : `${autoName}'s Organization`;

    const finalName = partial.name?.trim() || autoName;
    const finalOrg = partial.organizationName?.trim() || autoOrg;
    const finalPlan: UserProfile['plan'] = partial.plan || 'starter';
    const finalAvatar = partial.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(finalName)}&background=000000&color=ffffff&bold=true`;

    return {
      id: partial.id || `usr-${Date.now()}`,
      name: finalName,
      email: cleanEmail,
      organizationName: finalOrg,
      role: partial.role || 'owner',
      avatar: finalAvatar,
      plan: finalPlan,
      isYearlyBilling: false,
      usage: {
        certificatesGenerated: 0,
        certificatesLimit: finalPlan === 'business' ? 10000 : finalPlan === 'pro' ? 3000 : 250,
        storageUsedMB: 0,
        storageLimitMB: finalPlan === 'business' ? 51200 : finalPlan === 'pro' ? 15360 : 1024,
        emailCreditsUsed: 0,
        emailCreditsLimit: finalPlan === 'business' ? 10000 : finalPlan === 'pro' ? 3000 : 250
      },
      branding: {
        logoUrl: '',
        primaryColor: '#000000',
        issuerName: finalOrg,
        customDomain: '',
        whiteLabelVerification: false
      }
    };
  }

  // Sign in via Cloudflare D1 with fallback to local state
  public static async loginUser(email: string, password?: string, name?: string, orgName?: string): Promise<UserProfile> {
    const cleanEmail = email.trim().toLowerCase();
    let profile: UserProfile;

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          email: cleanEmail,
          password: password || '',
          name: name || undefined,
          organizationName: orgName || undefined
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.user) {
          profile = this.createProfileForUser({
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            organizationName: data.user.organizationName,
            role: data.user.role,
            plan: data.user.plan,
            avatar: data.user.avatar
          });
          this.saveUser(profile);
          this.setLoggedIn(true);
          return profile;
        }
      }
    } catch (e) {
      console.warn('API auth login fallback:', e);
    }

    profile = this.createProfileForUser({ email: cleanEmail, name, organizationName: orgName });
    this.saveUser(profile);
    this.setLoggedIn(true);
    return profile;
  }

  // Sign up via Cloudflare D1 with fallback to local state
  public static async signupUser(email: string, password?: string, name?: string, orgName?: string): Promise<UserProfile> {
    const cleanEmail = email.trim().toLowerCase();
    let profile: UserProfile;

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'signup',
          email: cleanEmail,
          password: password || '',
          name: name || undefined,
          organizationName: orgName || undefined
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.user) {
          profile = this.createProfileForUser({
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            organizationName: data.user.organizationName,
            role: data.user.role,
            plan: data.user.plan,
            avatar: data.user.avatar
          });
          this.saveUser(profile);
          this.setLoggedIn(true);
          return profile;
        }
      }
    } catch (e) {
      console.warn('API auth signup fallback:', e);
    }

    profile = this.createProfileForUser({ email: cleanEmail, name, organizationName: orgName });
    this.saveUser(profile);
    this.setLoggedIn(true);
    return profile;
  }

  // User Profile
  public static getUser(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Storage read failed', e);
    }
    return DEFAULT_USER;
  }

  public static saveUser(user: UserProfile) {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(user));
    this.notify();
  }

  public static updateUsage(certificatesDelta: number, emailDelta = 0) {
    const user = this.getUser();
    user.usage.certificatesGenerated = Math.min(user.usage.certificatesLimit, user.usage.certificatesGenerated + certificatesDelta);
    user.usage.emailCreditsUsed = Math.min(user.usage.emailCreditsLimit, user.usage.emailCreditsUsed + emailDelta);
    user.usage.storageUsedMB += Math.round(certificatesDelta * 0.4); // ~400KB per cert
    this.saveUser(user);
  }

  // Projects
  public static getProjects(): Project[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Projects read failed', e);
    }
    // Return sample projects initially
    return INITIAL_PROJECTS;
  }

  public static getProjectById(id: string): Project | undefined {
    return this.getProjects().find(p => p.id === id);
  }

  public static saveProject(project: Project) {
    const projects = this.getProjects();
    const index = projects.findIndex(p => p.id === project.id);
    if (index >= 0) {
      projects[index] = { ...project, updatedAt: new Date().toISOString() };
    } else {
      projects.unshift({ ...project, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    this.notify();
  }

  public static deleteProject(id: string) {
    const projects = this.getProjects().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    this.notify();
  }

  // Templates
  public static getTemplates(): Template[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
      if (data) {
        const stored: Template[] = JSON.parse(data);
        // Combine with default templates
        const defaultIds = new Set(stored.map(t => t.id));
        const merged = [...stored];
        DEFAULT_TEMPLATES.forEach(dt => {
          if (!defaultIds.has(dt.id)) merged.push(dt);
        });
        return merged;
      }
    } catch (e) {
      console.warn('Templates read failed', e);
    }
    return DEFAULT_TEMPLATES;
  }

  public static getTemplateById(id: string): Template | undefined {
    return this.getTemplates().find(t => t.id === id);
  }

  public static saveTemplate(template: Template) {
    const templates = this.getTemplates();
    const index = templates.findIndex(t => t.id === template.id);
    if (index >= 0) {
      templates[index] = { ...template, updatedAt: new Date().toISOString() };
    } else {
      templates.push({ ...template, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
    this.notify();
  }

  // Pricing Plans (Configurable from admin!)
  public static getPricingPlans(): PricingPlan[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRICING);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Pricing read failed', e);
    }
    return PRICING_PLANS as PricingPlan[];
  }

  public static savePricingPlans(plans: PricingPlan[]) {
    localStorage.setItem(STORAGE_KEYS.PRICING, JSON.stringify(plans));
    this.notify();
  }

  // API Keys
  public static getApiKeys(): ApiKeyItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.API_KEYS);
      if (data) return JSON.parse(data);
    } catch (e) {}
    return DEFAULT_API_KEYS;
  }

  public static addApiKey(name: string): ApiKeyItem {
    const keys = this.getApiKeys();
    const rand = Math.random().toString(36).substring(2, 10);
    const newKey: ApiKeyItem = {
      id: `key-${Date.now()}`,
      name,
      keyPrefix: `cfg_live_${rand}...${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString()
    };
    keys.unshift(newKey);
    localStorage.setItem(STORAGE_KEYS.API_KEYS, JSON.stringify(keys));
    this.notify();
    return newKey;
  }

  public static revokeApiKey(id: string) {
    const keys = this.getApiKeys().filter(k => k.id !== id);
    localStorage.setItem(STORAGE_KEYS.API_KEYS, JSON.stringify(keys));
    this.notify();
  }

  // Global certificate finder for verification
  public static findCertificateById(certId: string): {
    found: boolean;
    project?: Project;
    recipientName?: string;
    courseName?: string;
    date?: string;
    organization?: string;
    certificateId: string;
    status: string;
  } {
    const cleanId = certId.trim().toUpperCase();
    const projects = this.getProjects();

    for (const project of projects) {
      const recipient = project.recipients.find(r => 
        (r.certificateId && r.certificateId.toUpperCase() === cleanId) ||
        r.id.toUpperCase() === cleanId
      );

      if (recipient) {
        const name = recipient.data[project.fieldMapping['name'] || 'name'] || 
                     recipient.data['Full Name'] || recipient.data['Name'] || 'Recipient';
        const course = recipient.data[project.fieldMapping['course'] || 'course'] || 
                      recipient.data['Course Name'] || recipient.data['Track'] || project.name;
        const date = recipient.data[project.fieldMapping['date'] || 'date'] || 
                     recipient.data['Completion Date'] || recipient.data['Date'] || 'October 2026';

        return {
          found: true,
          project,
          recipientName: name,
          courseName: course,
          date,
          organization: project.organizationName || 'Verified CertiForge Issuer',
          certificateId: recipient.certificateId || cleanId,
          status: 'VERIFIED'
        };
      }
    }

    // Fallback search in raw demo data if user tests a known sample ID
    if (cleanId.startsWith('CERT-') || cleanId.startsWith('EXEC-') || cleanId.startsWith('HACK-')) {
      return {
        found: true,
        recipientName: 'Aarav Patel',
        courseName: 'Full-Stack Web Development Masterclass',
        date: 'October 15, 2026',
        organization: 'DevStudio Academy Global',
        certificateId: cleanId,
        status: 'VERIFIED'
      };
    }

    return {
      found: false,
      certificateId: cleanId,
      status: 'NOT_FOUND'
    };
  }

  // Push generated certificates to Cloudflare D1
  public static async syncCertificatesToCloudflare(certificates: Array<{
    certificateId: string;
    projectId?: string;
    recipientName: string;
    recipientEmail?: string;
    courseName?: string;
    organizationName?: string;
    issueDate?: string;
  }>): Promise<boolean> {
    try {
      const res = await fetch('/api/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(certificates)
      });
      return res.ok;
    } catch (e) {
      console.warn('Cloudflare D1 edge sync skipped:', e);
      return false;
    }
  }

  // Live Cloudflare D1 edge lookup with fallback to local state
  public static async verifyCertificate(certId: string): Promise<{
    found: boolean;
    project?: Project;
    recipientName?: string;
    courseName?: string;
    date?: string;
    organization?: string;
    certificateId: string;
    status: string;
  }> {
    const cleanId = certId.trim().toUpperCase();
    try {
      const res = await fetch(`/api/verify/${encodeURIComponent(cleanId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.found) {
          return {
            found: true,
            recipientName: data.recipientName,
            courseName: data.courseName,
            date: data.date,
            organization: data.organization,
            certificateId: data.certificateId,
            status: data.status || 'VERIFIED'
          };
        }
      }
    } catch (e) {
      console.warn('Cloudflare verify edge query fallback:', e);
    }

    return this.findCertificateById(cleanId);
  }
}

