import { Project, Template, UserProfile, PricingPlan, ApiKeyItem } from '../types';
import { DEFAULT_TEMPLATES, PRICING_PLANS } from '../data/defaultTemplates';
import { INITIAL_PROJECTS } from '../data/sampleData';

const STORAGE_KEYS = {
  USER_PROFILE: 'certiforge_user_profile_v1',
  IS_LOGGED_IN: 'certiforge_is_logged_in_v1',
  PRICING: 'certiforge_pricing_plans_v1',
  ACCOUNTS: 'certiforge_all_accounts_v1',
  DEFAULT_TEMPLATES: 'certiforge_system_templates_v1',
};

export const isAdminEmail = (email: string): boolean => {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return (
    clean === 'tejasgogavale5@gmail.com' ||
    clean === 'admin@certiforge.io' ||
    clean === 'admin@certiforge.com' ||
    clean.startsWith('admin@') ||
    clean.includes('admin')
  );
};

export const ADMIN_TEJAS: UserProfile = {
  id: 'usr-1791604641396',
  name: 'Tejas Gogavale',
  email: 'tejasgogavale5@gmail.com',
  organizationName: 'CertiForge Global Platform',
  role: 'admin',
  avatar: 'https://ui-avatars.com/api/?name=Tejas+Gogavale&background=000000&color=ffffff&bold=true',
  plan: 'business',
  isYearlyBilling: true,
  usage: {
    certificatesGenerated: 1420,
    certificatesLimit: 25000,
    storageUsedMB: 580,
    storageLimitMB: 102400,
    emailCreditsUsed: 1200,
    emailCreditsLimit: 25000
  },
  branding: {
    logoUrl: '',
    primaryColor: '#000000',
    issuerName: 'CertiForge Platform',
    customDomain: 'certiforge.pages.dev',
    whiteLabelVerification: true
  }
};

// Built-in Demo Accounts for Seamless Multi-User Testing
export const DEMO_ADMIN: UserProfile = {
  id: 'usr-admin-1',
  name: 'Platform Administrator',
  email: 'admin@certiforge.io',
  organizationName: 'CertiForge Global Platform',
  role: 'admin',
  avatar: 'https://ui-avatars.com/api/?name=Super+Admin&background=000000&color=ffffff&bold=true',
  plan: 'business',
  isYearlyBilling: true,
  usage: {
    certificatesGenerated: 1420,
    certificatesLimit: 25000,
    storageUsedMB: 580,
    storageLimitMB: 102400,
    emailCreditsUsed: 1200,
    emailCreditsLimit: 25000
  },
  branding: {
    logoUrl: '',
    primaryColor: '#000000',
    issuerName: 'CertiForge Global Authority',
    customDomain: 'certiforge.io',
    whiteLabelVerification: true
  }
};

export const DEMO_USER_1: UserProfile = {
  id: 'usr-corp-1',
  name: 'Dr. Arthur Sterling',
  email: 'arthur.s@institute.edu',
  organizationName: 'Global Leadership Institute',
  role: 'owner',
  avatar: 'https://ui-avatars.com/api/?name=Arthur+Sterling&background=1E293B&color=ffffff&bold=true',
  plan: 'pro',
  isYearlyBilling: false,
  usage: {
    certificatesGenerated: 42,
    certificatesLimit: 3000,
    storageUsedMB: 17,
    storageLimitMB: 15360,
    emailCreditsUsed: 42,
    emailCreditsLimit: 3000
  },
  branding: {
    logoUrl: '',
    primaryColor: '#1E293B',
    issuerName: 'Global Leadership Institute',
    customDomain: 'credentials.leadership.edu',
    whiteLabelVerification: false
  }
};

export const DEMO_USER_2: UserProfile = {
  id: 'usr-dev-2',
  name: 'Aarav Patel',
  email: 'aarav@devstudio.com',
  organizationName: 'DevStudio Academy',
  role: 'owner',
  avatar: 'https://ui-avatars.com/api/?name=Aarav+Patel&background=4F46E5&color=ffffff&bold=true',
  plan: 'starter',
  isYearlyBilling: false,
  usage: {
    certificatesGenerated: 8,
    certificatesLimit: 500,
    storageUsedMB: 3,
    storageLimitMB: 1024,
    emailCreditsUsed: 8,
    emailCreditsLimit: 500
  },
  branding: {
    logoUrl: '',
    primaryColor: '#4F46E5',
    issuerName: 'DevStudio Academy',
    customDomain: 'verify.devstudio.com',
    whiteLabelVerification: false
  }
};

export const DEFAULT_USER: UserProfile = DEMO_USER_1;

export class StorageService {
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

  // Accounts registry for Multi-Tenant Management
  public static getAllUsers(): UserProfile[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Normalize and make sure admin emails always have admin role
          return parsed.map((u: UserProfile) => {
            if (isAdminEmail(u.email)) {
              return { ...u, role: 'admin', plan: 'business' };
            }
            return u;
          });
        }
      }
    } catch (e) {
      console.warn('Accounts read failed', e);
    }

    const initialAccounts = [ADMIN_TEJAS, DEMO_ADMIN, DEMO_USER_1, DEMO_USER_2];
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(initialAccounts));
    return initialAccounts;
  }

  public static saveAccounts(accounts: UserProfile[]) {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
    this.notify();
  }

  // Fast Account Switcher for testing and role verification
  public static switchUser(userId: string): UserProfile {
    const all = this.getAllUsers();
    const target = all.find(u => u.id === userId) || all[0];
    this.saveUser(target);
    this.setLoggedIn(true);
    return target;
  }

  // Admin User Management
  public static updateUserByAdmin(userId: string, partial: Partial<UserProfile>): UserProfile | null {
    const all = this.getAllUsers();
    const index = all.findIndex(u => u.id === userId);
    if (index >= 0) {
      all[index] = { ...all[index], ...partial };
      this.saveAccounts(all);
      // If updating currently logged in user, refresh session
      if (this.getUser().id === userId) {
        this.saveUser(all[index]);
      }
      return all[index];
    }
    return null;
  }

  public static deleteUserByAdmin(userId: string): boolean {
    const all = this.getAllUsers().filter(u => u.id !== userId);
    this.saveAccounts(all);
    // Clean up their isolated data
    localStorage.removeItem(`certiforge_projects_${userId}`);
    localStorage.removeItem(`certiforge_custom_templates_${userId}`);
    localStorage.removeItem(`certiforge_api_keys_${userId}`);
    this.notify();
    return true;
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
    const isAdmin = isAdminEmail(cleanEmail) || partial.role === 'admin';
    const emailUserPart = cleanEmail.split('@')[0] || 'Member';
    const autoName = cleanEmail === 'tejasgogavale5@gmail.com'
      ? 'Tejas Gogavale'
      : isAdmin
      ? 'Platform Administrator'
      : emailUserPart
          .replace(/[._-]+/g, ' ')
          .replace(/\b\w/g, (c: string) => c.toUpperCase());
    
    const emailDomain = cleanEmail.split('@')[1] || '';
    const autoOrg = isAdmin
      ? 'CertiForge Global Platform'
      : emailDomain && !['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'].includes(emailDomain)
      ? emailDomain.split('.')[0].toUpperCase() + ' Organization'
      : `${autoName}'s Workspace`;

    const finalName = partial.name?.trim() || autoName;
    const finalOrg = partial.organizationName?.trim() || autoOrg;
    const finalRole: UserProfile['role'] = isAdmin ? 'admin' : (partial.role || 'owner');
    const finalPlan: UserProfile['plan'] = partial.plan || (isAdmin ? 'business' : 'starter');
    const finalAvatar = partial.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(finalName)}&background=000000&color=ffffff&bold=true`;

    return {
      id: partial.id || `usr-${Date.now()}`,
      name: finalName,
      email: cleanEmail,
      organizationName: finalOrg,
      role: finalRole,
      avatar: finalAvatar,
      plan: finalPlan,
      isYearlyBilling: finalPlan === 'business',
      usage: {
        certificatesGenerated: 0,
        certificatesLimit: finalPlan === 'business' ? 25000 : finalPlan === 'pro' ? 3000 : 250,
        storageUsedMB: 0,
        storageLimitMB: finalPlan === 'business' ? 102400 : finalPlan === 'pro' ? 15360 : 1024,
        emailCreditsUsed: 0,
        emailCreditsLimit: finalPlan === 'business' ? 25000 : finalPlan === 'pro' ? 3000 : 250
      },
      branding: {
        logoUrl: '',
        primaryColor: '#000000',
        issuerName: finalOrg,
        customDomain: '',
        whiteLabelVerification: isAdmin
      }
    };
  }

  // Sign in with Account Registry tracking & isolated workspace
  public static async loginUser(email: string, password?: string, name?: string, orgName?: string): Promise<UserProfile> {
    const cleanEmail = email.trim().toLowerCase();
    
    // First, verify with backend API if available
    let serverUser: any = null;
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'login', 
          email: cleanEmail, 
          password: password || '', 
          name, 
          organizationName: orgName 
        })
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || `Login failed (${res.status})`);
      }

      if (data?.success && data?.user) {
        serverUser = data.user;
      }
    } catch (err: any) {
      // If error is from server (e.g. incorrect password or user not found), bubble it up
      if (err.message && !err.message.includes('Failed to fetch') && !err.message.includes('NetworkError') && !err.message.includes('404')) {
        throw err;
      }
      console.warn('Backend auth sync warning:', err);
    }

    const all = this.getAllUsers();
    const existing = all.find(u => u.email.toLowerCase() === cleanEmail);

    let profile: UserProfile;

    if (serverUser) {
      profile = this.createProfileForUser({
        id: serverUser.id,
        email: serverUser.email,
        name: serverUser.name,
        organizationName: serverUser.organizationName,
        role: serverUser.role,
        plan: serverUser.plan,
        avatar: serverUser.avatar
      });

      if (existing) {
        const idx = all.findIndex(u => u.id === existing.id || u.email.toLowerCase() === cleanEmail);
        if (idx >= 0) all[idx] = profile;
      } else {
        all.push(profile);
      }
      this.saveAccounts(all);
    } else if (existing) {
      profile = existing;
    } else {
      profile = this.createProfileForUser({ email: cleanEmail, name, organizationName: orgName });
      all.push(profile);
      this.saveAccounts(all);
    }

    this.saveUser(profile);
    this.setLoggedIn(true);
    return profile;
  }

  // Sign up with Account Registry tracking
  public static async signupUser(email: string, password?: string, name?: string, orgName?: string): Promise<UserProfile> {
    const cleanEmail = email.trim().toLowerCase();
    
    let serverUser: any = null;
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'signup', 
          email: cleanEmail, 
          password: password || '', 
          name, 
          organizationName: orgName 
        })
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || `Signup failed (${res.status})`);
      }

      if (data?.success && data?.user) {
        serverUser = data.user;
      }
    } catch (err: any) {
      if (err.message && !err.message.includes('Failed to fetch') && !err.message.includes('NetworkError') && !err.message.includes('404')) {
        throw err;
      }
      console.warn('Backend auth signup warning:', err);
    }

    const all = this.getAllUsers();
    const existing = all.find(u => u.email.toLowerCase() === cleanEmail);

    let profile: UserProfile;

    if (serverUser) {
      profile = this.createProfileForUser({
        id: serverUser.id,
        email: serverUser.email,
        name: serverUser.name,
        organizationName: serverUser.organizationName,
        role: serverUser.role,
        plan: serverUser.plan,
        avatar: serverUser.avatar
      });

      if (existing) {
        const idx = all.findIndex(u => u.id === existing.id || u.email.toLowerCase() === cleanEmail);
        if (idx >= 0) all[idx] = profile;
      } else {
        all.push(profile);
      }
      this.saveAccounts(all);
    } else if (existing) {
      profile = existing;
    } else {
      profile = this.createProfileForUser({ email: cleanEmail, name, organizationName: orgName });
      all.push(profile);
      this.saveAccounts(all);
    }

    this.saveUser(profile);
    this.setLoggedIn(true);
    return profile;
  }

  // Current Active User Session
  public static getUser(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      if (data) {
        const u: UserProfile = JSON.parse(data);
        if (isAdminEmail(u.email)) {
          return { ...u, role: 'admin', plan: 'business' };
        }
        return u;
      }
    } catch (e) {
      console.warn('Storage read failed', e);
    }
    return DEMO_USER_1;
  }

  public static saveUser(user: UserProfile) {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(user));
    // Also sync to accounts list
    const all = this.getAllUsers();
    const index = all.findIndex(u => u.id === user.id);
    if (index >= 0) {
      all[index] = user;
    } else {
      all.push(user);
    }
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(all));
    this.notify();
  }

  public static updateUsage(certificatesDelta: number, emailDelta = 0) {
    const user = this.getUser();
    user.usage.certificatesGenerated = Math.min(user.usage.certificatesLimit, user.usage.certificatesGenerated + certificatesDelta);
    user.usage.emailCreditsUsed = Math.min(user.usage.emailCreditsLimit, user.usage.emailCreditsUsed + emailDelta);
    user.usage.storageUsedMB += Math.round(certificatesDelta * 0.4);
    this.saveUser(user);
  }

  // ==========================================
  // MULTI-TENANT ISOLATED PROJECTS PIPELINE
  // ==========================================

  public static getProjects(userId?: string): Project[] {
    const targetUserId = userId || this.getUser().id;
    const scopedKey = `certiforge_projects_${targetUserId}`;

    try {
      const data = localStorage.getItem(scopedKey);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Projects read failed', e);
    }

    // Seed distinct demo projects for known demo accounts
    if (targetUserId === 'usr-corp-1' || targetUserId === 'usr-admin-1') {
      const seeded = INITIAL_PROJECTS.map(p => ({ ...p, userId: targetUserId }));
      localStorage.setItem(scopedKey, JSON.stringify(seeded));
      return seeded;
    }

    if (targetUserId === 'usr-dev-2') {
      const devProjects: Project[] = [
        {
          id: 'proj-dev-bootcamp-2026',
          userId: 'usr-dev-2',
          name: 'Full-Stack Web Dev Bootcamp 2026',
          category: 'workshop',
          status: 'completed',
          templateId: 'tpl-tech-bootcamp',
          recipientsCount: 24,
          generatedCount: 24,
          emailedCount: 24,
          verifiedCount: 19,
          createdAt: '2026-03-01T10:00:00Z',
          updatedAt: '2026-03-02T12:00:00Z',
          prefix: 'DEV-2026-',
          organizationName: 'DevStudio Academy',
          fieldMapping: { name: 'Full Name', course: 'Course Name', date: 'Graduation Date' },
          recipients: [
            {
              id: 'rec-dev-1',
              certificateId: 'DEV-2026-0001',
              status: 'generated',
              data: {
                'Full Name': 'Smit Panchal',
                'Course Name': 'Full-Stack Web Dev Bootcamp 2026',
                'Graduation Date': 'October 15, 2026',
                'Email': 'smit@devstudio.com'
              }
            }
          ]
        }
      ];
      localStorage.setItem(scopedKey, JSON.stringify(devProjects));
      return devProjects;
    }

    // Completely blank / fresh workspace for new accounts - NO data leakage!
    return [];
  }

  public static getProjectById(id: string, userId?: string): Project | undefined {
    return this.getProjects(userId).find(p => p.id === id);
  }

  public static saveProject(project: Project, userId?: string) {
    const targetUserId = userId || project.userId || this.getUser().id;
    const scopedKey = `certiforge_projects_${targetUserId}`;
    const projects = this.getProjects(targetUserId);

    const projectWithOwner: Project = {
      ...project,
      userId: targetUserId
    };

    const index = projects.findIndex(p => p.id === project.id);
    if (index >= 0) {
      projects[index] = { ...projectWithOwner, updatedAt: new Date().toISOString() };
    } else {
      projects.unshift({ ...projectWithOwner, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }

    localStorage.setItem(scopedKey, JSON.stringify(projects));
    this.notify();
  }

  public static deleteProject(id: string, userId?: string) {
    const targetUserId = userId || this.getUser().id;
    const scopedKey = `certiforge_projects_${targetUserId}`;
    const projects = this.getProjects(targetUserId).filter(p => p.id !== id);
    localStorage.setItem(scopedKey, JSON.stringify(projects));
    this.notify();
  }

  // Platform-wide projects (Only for Admin audit and public verification)
  public static getAllProjectsAcrossPlatform(): Project[] {
    const allUsers = this.getAllUsers();
    const allProjects: Project[] = [];
    const seenIds = new Set<string>();

    allUsers.forEach(u => {
      const userProjects = this.getProjects(u.id);
      userProjects.forEach(p => {
        if (!seenIds.has(p.id)) {
          seenIds.add(p.id);
          allProjects.push(p);
        }
      });
    });

    return allProjects;
  }

  // ==========================================
  // MULTI-TENANT ISOLATED TEMPLATES PIPELINE
  // ==========================================

  public static getTemplates(userId?: string): Template[] {
    const targetUserId = userId || this.getUser().id;
    const customKey = `certiforge_custom_templates_${targetUserId}`;
    let customTemplates: Template[] = [];

    try {
      const data = localStorage.getItem(customKey);
      if (data) customTemplates = JSON.parse(data);
    } catch (e) {
      console.warn('Custom templates read failed', e);
    }

    // Always merge built-in templates with the user's isolated custom templates
    return [...DEFAULT_TEMPLATES, ...customTemplates];
  }

  public static getTemplateById(id: string, userId?: string): Template | undefined {
    return this.getTemplates(userId).find(t => t.id === id);
  }

  public static saveTemplate(template: Template, userId?: string) {
    const targetUserId = userId || template.userId || this.getUser().id;
    const customKey = `certiforge_custom_templates_${targetUserId}`;
    let customTemplates: Template[] = [];

    try {
      const data = localStorage.getItem(customKey);
      if (data) customTemplates = JSON.parse(data);
    } catch (e) {}

    const templateWithOwner: Template = {
      ...template,
      userId: targetUserId,
      isCustom: true
    };

    const index = customTemplates.findIndex(t => t.id === template.id);
    if (index >= 0) {
      customTemplates[index] = { ...templateWithOwner, updatedAt: new Date().toISOString() };
    } else {
      customTemplates.unshift({ ...templateWithOwner, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }

    localStorage.setItem(customKey, JSON.stringify(customTemplates));
    this.notify();
  }

  public static deleteTemplate(id: string, userId?: string) {
    const targetUserId = userId || this.getUser().id;
    const customKey = `certiforge_custom_templates_${targetUserId}`;
    let customTemplates: Template[] = [];

    try {
      const data = localStorage.getItem(customKey);
      if (data) customTemplates = JSON.parse(data);
    } catch (e) {}

    customTemplates = customTemplates.filter(t => t.id !== id);
    localStorage.setItem(customKey, JSON.stringify(customTemplates));
    this.notify();
  }

  // Pricing Plans (Configurable from Admin!)
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

  // API Keys (Scoped per user)
  public static getApiKeys(userId?: string): ApiKeyItem[] {
    const targetUserId = userId || this.getUser().id;
    const key = `certiforge_api_keys_${targetUserId}`;
    try {
      const data = localStorage.getItem(key);
      if (data) return JSON.parse(data);
    } catch (e) {}

    if (targetUserId === 'usr-admin-1') {
      return [
        {
          id: 'key-admin-global',
          name: 'Master Platform Webhook',
          keyPrefix: 'cfg_admin_8a9b...f3c2',
          createdAt: '2026-01-01T00:00:00Z',
          lastUsedAt: '2026-10-10T10:00:00Z'
        }
      ];
    }
    return [];
  }

  public static addApiKey(name: string, userId?: string): ApiKeyItem {
    const targetUserId = userId || this.getUser().id;
    const key = `certiforge_api_keys_${targetUserId}`;
    const keys = this.getApiKeys(targetUserId);
    const rand = Math.random().toString(36).substring(2, 10);
    const newKey: ApiKeyItem = {
      id: `key-${Date.now()}`,
      name,
      keyPrefix: `cfg_live_${rand}...${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString()
    };
    keys.unshift(newKey);
    localStorage.setItem(key, JSON.stringify(keys));
    this.notify();
    return newKey;
  }

  public static revokeApiKey(id: string, userId?: string) {
    const targetUserId = userId || this.getUser().id;
    const key = `certiforge_api_keys_${targetUserId}`;
    const keys = this.getApiKeys(targetUserId).filter(k => k.id !== id);
    localStorage.setItem(key, JSON.stringify(keys));
    this.notify();
  }

  // Public certificate lookup across all organizations
  public static findCertificateById(certId: string): {
    found: boolean;
    project?: Project;
    recipientName?: string;
    courseName?: string;
    date?: string;
    issueDate?: string;
    completionDate?: string;
    studentId?: string;
    duration?: string;
    grade?: string;
    achievementLevel?: string;
    batch?: string;
    learningMode?: string;
    organization?: string;
    certificateId: string;
    status: string;
  } {
    const cleanId = certId.trim().toUpperCase();
    const projects = this.getAllProjectsAcrossPlatform();

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
        const issueDate = recipient.data[project.fieldMapping['issue_date'] || 'issue_date'] ||
                          recipient.data['Issue Date'] || recipient.data['date'] || 'October 15, 2026';
        const completionDate = recipient.data[project.fieldMapping['completion_date'] || 'completion_date'] ||
                               recipient.data['Completion Date'] || recipient.data['date'] || 'September 30, 2026';
        const studentId = recipient.data[project.fieldMapping['student_id'] || 'student_id'] ||
                          recipient.data['Student ID'] || recipient.data['Roll No'] || '';
        const duration = recipient.data[project.fieldMapping['course_duration'] || 'course_duration'] ||
                         recipient.data['Course Duration'] || recipient.data['Duration'] || '';
        const grade = recipient.data[project.fieldMapping['grade'] || 'grade'] ||
                      recipient.data['Grade'] || recipient.data['Score'] || '';
        const achievementLevel = recipient.data[project.fieldMapping['achievement_level'] || 'achievement_level'] ||
                                 recipient.data['Achievement Level'] || '';
        const batch = recipient.data[project.fieldMapping['batch'] || 'batch'] ||
                      recipient.data['Batch'] || '';
        const learningMode = recipient.data[project.fieldMapping['learning_mode'] || 'learning_mode'] ||
                             recipient.data['Mode of Learning'] || '';

        return {
          found: true,
          project,
          recipientName: name,
          courseName: course,
          date: issueDate,
          issueDate,
          completionDate,
          studentId,
          duration,
          grade,
          achievementLevel,
          batch,
          learningMode,
          organization: project.organizationName || 'Verified CertiForge Issuer',
          certificateId: recipient.certificateId || cleanId,
          status: 'VERIFIED'
        };
      }
    }

    // Default verified sample lookups
    if (cleanId.startsWith('CERT-') || cleanId.startsWith('EXEC-') || cleanId.startsWith('HACK-') || cleanId.startsWith('CF-') || cleanId.startsWith('DEV-')) {
      return {
        found: true,
        recipientName: cleanId.includes('DEV') ? 'Smit Panchal' : 'Ananya Sharma',
        courseName: cleanId.includes('DEV') ? 'Full-Stack Web Dev Bootcamp 2026' : 'Digital Marketing Masterclass',
        date: 'October 15, 2026',
        issueDate: 'October 15, 2026',
        completionDate: 'September 30, 2026',
        studentId: 'STU-2026-8941',
        duration: '12 Weeks (120 Hours)',
        grade: 'A+ (96%)',
        achievementLevel: 'Distinction',
        batch: 'Cohort 2026-B',
        learningMode: 'Online Interactive',
        organization: cleanId.includes('DEV') ? 'DevStudio Academy' : 'Global Leadership Institute',
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
      return false;
    }
  }

  // Edge Cloudflare D1 verification with fallback
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
    } catch (e) {}

    return this.findCertificateById(cleanId);
  }
}
