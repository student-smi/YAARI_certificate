import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './components/LandingPage/LandingPage';
import { DashboardView } from './components/Dashboard/DashboardView';
import { ProjectWizard } from './components/ProjectWizard/ProjectWizard';
import { NewProjectModal } from './components/ProjectWizard/NewProjectModal';
import { CertificateDesigner } from './components/Designer/CertificateDesigner';
import { TemplateLibrary } from './components/Templates/TemplateLibrary';
import { VerificationPortal } from './components/Verification/VerificationPortal';
import { EmailCampaignModal } from './components/EmailDelivery/EmailCampaignModal';
import { BillingModal } from './components/Billing/BillingModal';
import { AnalyticsView } from './components/Analytics/AnalyticsView';
import { SettingsView } from './components/Settings/SettingsView';
import { ApiPlayground } from './components/Api/ApiPlayground';
import { AuthModal } from './components/Auth/AuthModal';
import { OnboardingModal } from './components/Auth/OnboardingModal';
import { AdminView } from './components/Admin/AdminView';

import { StorageService } from './services/storageService';
import { Project, Template, UserProfile, PricingPlan } from './types';

export function App() {
  // Navigation View State: 'landing' | 'dashboard' | 'wizard' | 'designer' | 'templates' | 'verify' | 'analytics' | 'api' | 'settings'
  const [currentView, setCurrentView] = useState<string>('landing');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => StorageService.isLoggedIn());

  // State loaded from StorageService
  const [user, setUser] = useState<UserProfile>(StorageService.getUser());
  const [projects, setProjects] = useState<Project[]>(StorageService.getProjects());
  const [templates, setTemplates] = useState<Template[]>(StorageService.getTemplates());
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>(StorageService.getPricingPlans());

  // Active Contexts
  const [activeProject, setActiveProject] = useState<Project | null>(projects[0] || null);
  const [activeDesignerTemplate, setActiveDesignerTemplate] = useState<Template>(templates[0]);
  const [verifyInitialId, setVerifyInitialId] = useState<string>('CERT-2026-00001');
  const [designerSourceView, setDesignerSourceView] = useState<'templates' | 'dashboard' | 'wizard'>('templates');

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [newProjectModalOpen, setNewProjectModalOpen] = useState(false);
  const [billingModalOpen, setBillingModalOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailTargetProject, setEmailTargetProject] = useState<Project | null>(null);

  // Subscribe to Storage updates with isolated data
  useEffect(() => {
    const unsubscribe = StorageService.subscribe(() => {
      const currentUser = StorageService.getUser();
      setUser(currentUser);
      setProjects(StorageService.getProjects(currentUser.id));
      setTemplates(StorageService.getTemplates(currentUser.id));
      setPricingPlans(StorageService.getPricingPlans());
    });
    return unsubscribe;
  }, []);

  const handleSwitchAccount = (targetUserId: string) => {
    const switched = StorageService.switchUser(targetUserId);
    setUser(switched);
    const switchedProjects = StorageService.getProjects(switched.id);
    const switchedTemplates = StorageService.getTemplates(switched.id);
    setProjects(switchedProjects);
    setTemplates(switchedTemplates);
    setActiveProject(switchedProjects[0] || null);
    if (switched.role === 'admin') {
      setCurrentView('admin');
    } else {
      setCurrentView('dashboard');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle URL hash changes (e.g. #verify/CERT-2026-00001)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#verify')) {
        const parts = hash.split('/');
        if (parts[1]) {
          setVerifyInitialId(parts[1]);
        }
        setCurrentView('verify');
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Handlers
  const handleOpenProjectWizard = (project: Project) => {
    setActiveProject(project);
    setCurrentView('wizard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenDesigner = (
    templateId?: string,
    orientation?: 'landscape' | 'portrait',
    customBgUrl?: string,
    customName?: string,
    sourceView: 'templates' | 'dashboard' | 'wizard' = 'templates'
  ) => {
    setDesignerSourceView(sourceView);
    let tpl: Template;
    if (templateId === 'blank' || templateId === 'new' || (!templateId && templateId !== undefined && templateId === '')) {
      const isPortrait = orientation === 'portrait';
      tpl = {
        id: `tpl-custom-${Date.now()}`,
        name: customName?.trim() || (isPortrait ? 'Portrait Certificate' : 'Landscape Certificate'),
        description: 'Custom certificate design.',
        category: 'custom',
        orientation: isPortrait ? 'portrait' : 'landscape',
        width: isPortrait ? 595 : 842,
        height: isPortrait ? 842 : 595,
        backgroundStyle: {
          type: customBgUrl ? 'image' : 'color',
          color: '#FFFFFF',
          imageUrl: customBgUrl || undefined,
          imageFit: 'cover',
          imageOpacity: 1,
          borderStyle: customBgUrl ? 'none' : 'gold_double',
          borderColor: '#B45309'
        },
        elements: [
          {
            id: 'el-org-name',
            type: 'text',
            x: 50,
            y: isPortrait ? 12 : 14,
            width: 80,
            height: 6,
            zIndex: 1,
            content: user.organizationName || 'INSTITUTION OR ORGANIZATION NAME',
            fontSettings: { family: 'Plus Jakarta Sans', size: 14, weight: '700', color: '#64748B', align: 'center', letterSpacing: 4, lineHeight: 1.2 }
          },
          {
            id: 'el-title',
            type: 'text',
            x: 50,
            y: isPortrait ? 20 : 23,
            width: 90,
            height: 8,
            zIndex: 2,
            content: 'CERTIFICATE OF COMPLETION',
            fontSettings: { family: 'Cinzel', size: 30, weight: '700', color: '#0F172A', align: 'center', letterSpacing: 3, lineHeight: 1.1 }
          },
          {
            id: 'el-subtitle',
            type: 'text',
            x: 50,
            y: isPortrait ? 30 : 33,
            width: 80,
            height: 5,
            zIndex: 2,
            content: 'PROUDLY PRESENTED TO',
            fontSettings: { family: 'Plus Jakarta Sans', size: 11, weight: '600', color: '#64748B', align: 'center', letterSpacing: 2, lineHeight: 1.2 }
          },
          {
            id: 'el-recipient-name',
            type: 'dynamic_field',
            fieldKey: 'name',
            x: 50,
            y: isPortrait ? 42 : 44,
            width: 80,
            height: 9,
            zIndex: 3,
            content: '{{name}}',
            fontSettings: { family: 'Cinzel', size: 36, weight: '700', color: '#B45309', align: 'center', letterSpacing: 1, lineHeight: 1.1 }
          },
          {
            id: 'el-statement',
            type: 'text',
            x: 50,
            y: isPortrait ? 52 : 54,
            width: 85,
            height: 6,
            zIndex: 3,
            content: 'For successfully completing all requirements of the professional curriculum.',
            fontSettings: { family: 'Plus Jakarta Sans', size: 12, weight: '400', color: '#475569', align: 'center', letterSpacing: 0.5, lineHeight: 1.4 }
          },
          {
            id: 'el-course-name',
            type: 'dynamic_field',
            fieldKey: 'course',
            x: 50,
            y: isPortrait ? 60 : 62,
            width: 85,
            height: 7,
            zIndex: 4,
            content: '{{course}}',
            fontSettings: { family: 'Plus Jakarta Sans', size: 20, weight: '700', color: '#0F172A', align: 'center', letterSpacing: 1, lineHeight: 1.2 }
          },
          {
            id: 'el-qr',
            type: 'qr',
            fieldKey: 'qr',
            x: isPortrait ? 22 : 18,
            y: isPortrait ? 82 : 80,
            width: isPortrait ? 14 : 12,
            height: isPortrait ? 14 : 12,
            zIndex: 5,
            content: '{{verification_url}}'
          },
          {
            id: 'el-cert-id',
            type: 'certificate_id',
            fieldKey: 'certificate_id',
            x: isPortrait ? 22 : 18,
            y: isPortrait ? 91 : 89,
            width: 25,
            height: 4,
            zIndex: 5,
            content: 'ID: {{certificate_id}}',
            fontSettings: { family: 'Plus Jakarta Sans', size: 9, weight: '600', color: '#64748B', align: 'center', letterSpacing: 1, lineHeight: 1 }
          },
          {
            id: 'el-sig-1',
            type: 'signature',
            x: isPortrait ? 78 : 80,
            y: isPortrait ? 81 : 78,
            width: 26,
            height: 8,
            zIndex: 6,
            content: 'Authorized Signatory',
            fontSettings: { family: 'Great Vibes', size: 28, weight: '400', color: '#0F172A', align: 'center', letterSpacing: 1, lineHeight: 1 }
          },
          {
            id: 'el-sig-title',
            type: 'text',
            x: isPortrait ? 78 : 80,
            y: isPortrait ? 89 : 86,
            width: 26,
            height: 4,
            zIndex: 6,
            content: 'DIRECTOR OF ACADEMICS',
            fontSettings: { family: 'Plus Jakarta Sans', size: 9, weight: '700', color: '#64748B', align: 'center', letterSpacing: 1.2, lineHeight: 1 }
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isCustom: true
      };
      StorageService.saveTemplate(tpl);
      setTemplates(StorageService.getTemplates());
    } else {
      const freshTemplates = StorageService.getTemplates();
      const found = freshTemplates.find(t => t.id === templateId) || freshTemplates[0];
      const targetOrientation = orientation || found.orientation;
      const isTargetPortrait = targetOrientation === 'portrait';

      if (found.isCustom) {
        if (targetOrientation !== found.orientation) {
          tpl = {
            ...found,
            orientation: targetOrientation,
            width: isTargetPortrait ? 595 : 842,
            height: isTargetPortrait ? 842 : 595,
            updatedAt: new Date().toISOString()
          };
          StorageService.saveTemplate(tpl);
          setTemplates(StorageService.getTemplates());
        } else {
          tpl = found;
        }
      } else {
        // User is editing a built-in default template:
        // Clone into user's ⭐ My Templates so default template remains intact
        tpl = {
          ...found,
          id: `tpl-custom-${Date.now()}`,
          name: `${found.name} (Custom)`,
          description: found.description || 'Custom certificate design',
          isCustom: true,
          category: 'custom',
          orientation: targetOrientation,
          width: isTargetPortrait ? 595 : 842,
          height: isTargetPortrait ? 842 : 595,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        StorageService.saveTemplate(tpl);
        setTemplates(StorageService.getTemplates());
      }
    }
    setActiveDesignerTemplate(tpl);
    setCurrentView('designer');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreateProject = (newProject: Project) => {
    StorageService.saveProject(newProject);
    setProjects(StorageService.getProjects());
    setActiveProject(newProject);
    setCurrentView('wizard');
  };

  const handleDeleteProject = (projectId: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      StorageService.deleteProject(projectId);
      setProjects(StorageService.getProjects());
    }
  };

  const handleDuplicateTemplate = (tpl: Template) => {
    const dup: Template = {
      ...tpl,
      id: `tpl-custom-${Date.now()}`,
      name: `${tpl.name} (Copy)`,
      isCustom: true,
      category: 'custom',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    StorageService.saveTemplate(dup);
    setTemplates(StorageService.getTemplates());
  };

  const handleOpenEmailModal = (proj: Project) => {
    setEmailTargetProject(proj);
    setEmailModalOpen(true);
  };

  const handleEmailSentSuccess = (sentCount: number) => {
    if (emailTargetProject) {
      const updated = {
        ...emailTargetProject,
        emailedCount: (emailTargetProject.emailedCount || 0) + sentCount
      };
      StorageService.saveProject(updated);
      setProjects(StorageService.getProjects());
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900 selection:bg-black selection:text-white">
      
      {/* Global SaaS Navigation Bar */}
      <Navbar
        currentView={currentView}
        setCurrentView={(v) => {
          setCurrentView(v);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        user={user}
        onOpenCreateProject={() => setNewProjectModalOpen(true)}
        onOpenBilling={() => setBillingModalOpen(true)}
        onOpenLogin={() => {
          setAuthMode('login');
          setAuthModalOpen(true);
        }}
        onOpenSignup={() => {
          setAuthMode('signup');
          setAuthModalOpen(true);
        }}
        isLoggedIn={isLoggedIn}
        onLogout={() => {
          StorageService.logout();
          setIsLoggedIn(false);
          setUser(StorageService.getUser());
          setCurrentView('landing');
        }}
        onSwitchAccount={handleSwitchAccount}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            pricingPlans={pricingPlans}
            onStartCreating={() => {
              if (isLoggedIn) {
                setCurrentView('dashboard');
              } else {
                setAuthMode('signup');
                setAuthModalOpen(true);
              }
            }}
            onExploreTemplates={() => setCurrentView('templates')}
            onVerifyDemo={() => {
              setVerifyInitialId('CERT-2026-00001');
              setCurrentView('verify');
            }}
            onOpenPricing={() => setBillingModalOpen(true)}
          />
        )}

        {currentView === 'dashboard' && (
          <DashboardView
            user={user}
            projects={projects}
            templates={templates}
            onOpenCreateProject={() => setNewProjectModalOpen(true)}
            onOpenProjectWizard={handleOpenProjectWizard}
            onOpenDesigner={(tplId) => handleOpenDesigner(tplId, undefined, undefined, undefined, 'dashboard')}
            onOpenBilling={() => setBillingModalOpen(true)}
            onDeleteProject={handleDeleteProject}
          />
        )}

        {currentView === 'wizard' && activeProject && (
          <ProjectWizard
            project={activeProject}
            templates={templates}
            onBack={() => setCurrentView('dashboard')}
            onUpdateProject={(updated) => {
              setActiveProject(updated);
              setProjects(StorageService.getProjects());
            }}
            onOpenDesigner={(tplId) => handleOpenDesigner(tplId, undefined, undefined, undefined, 'wizard')}
            onOpenEmailModal={handleOpenEmailModal}
            onOpenBilling={() => setBillingModalOpen(true)}
          />
        )}

        {currentView === 'designer' && (
          <CertificateDesigner
            key={activeDesignerTemplate.id}
            initialTemplate={activeDesignerTemplate}
            user={user}
            onOpenBilling={() => setBillingModalOpen(true)}
            onBack={() => {
              const fresh = StorageService.getTemplates();
              setTemplates(fresh);
              setCurrentView(designerSourceView);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSaveTemplate={(updated) => {
              StorageService.saveTemplate(updated);
              setTemplates(StorageService.getTemplates());
              setActiveDesignerTemplate(updated);
            }}
            onNavigateToTemplates={() => {
              const fresh = StorageService.getTemplates();
              setTemplates(fresh);
              setCurrentView('templates');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateToWizard={(templateId) => {
              const allTpls = StorageService.getTemplates();
              const selectedTpl = allTpls.find(t => t.id === templateId) || activeDesignerTemplate;
              const newProj: Project = {
                id: `proj-${Date.now()}`,
                name: `${selectedTpl.name} Campaign`,
                category: selectedTpl.category,
                status: 'draft',
                templateId: selectedTpl.id,
                recipientsCount: 0,
                generatedCount: 0,
                emailedCount: 0,
                verifiedCount: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                prefix: 'CERT-2026-',
                organizationName: user.organizationName,
                fieldMapping: { name: 'Full Name', course: 'Course Name', date: 'Completion Date' },
                recipients: []
              };
              handleCreateProject(newProj);
            }}
          />
        )}

        {currentView === 'templates' && (
          <TemplateLibrary
            templates={templates}
            onSelectTemplateToCreate={(templateId, orientation) => {
              const selectedTpl = templates.find(t => t.id === templateId) || templates[0];
              const isTargetPortrait = orientation === 'portrait';
              const targetTpl = orientation && selectedTpl.orientation !== orientation ? {
                ...selectedTpl,
                orientation,
                width: isTargetPortrait ? 595 : 842,
                height: isTargetPortrait ? 842 : 595
              } : selectedTpl;
              const newProj: Project = {
                id: `proj-${Date.now()}`,
                name: `${targetTpl.name} Campaign`,
                category: targetTpl.category,
                status: 'draft',
                templateId: targetTpl.id,
                recipientsCount: 0,
                generatedCount: 0,
                emailedCount: 0,
                verifiedCount: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                prefix: 'CERT-2026-',
                organizationName: user.organizationName,
                fieldMapping: { name: 'Full Name', course: 'Course Name', date: 'Completion Date' },
                recipients: []
              };
              handleCreateProject(newProj);
            }}
            onEditTemplate={(tplId, orientation, customBgUrl, customName) => 
              handleOpenDesigner(tplId, orientation, customBgUrl, customName, 'templates')
            }
            onDuplicateTemplate={handleDuplicateTemplate}
            onDeleteTemplate={(tplId) => {
              StorageService.deleteTemplate(tplId);
              setTemplates(StorageService.getTemplates());
            }}
          />
        )}

        {currentView === 'verify' && (
          <VerificationPortal initialCertId={verifyInitialId} />
        )}

        {currentView === 'analytics' && (
          <AnalyticsView projects={projects} user={user} />
        )}

        {currentView === 'api' && (
          <ApiPlayground />
        )}

        {currentView === 'settings' && (
          <SettingsView
            user={user}
            plans={pricingPlans}
            onUpdateUser={(updated) => setUser(updated)}
            onUpdatePlans={(updated) => setPricingPlans(updated)}
            onOpenBilling={() => setBillingModalOpen(true)}
          />
        )}

        {currentView === 'admin' && (
          <AdminView
            currentUser={user}
            pricingPlans={pricingPlans}
            onUpdatePlans={(updated) => setPricingPlans(updated)}
            onSwitchAccount={handleSwitchAccount}
          />
        )}
      </main>

      {/* Global SaaS Footer (hidden in designer for maximum canvas real estate) */}
      {currentView !== 'designer' && (
        <Footer onNavigate={(v) => {
          setCurrentView(v);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }} />
      )}

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
        onSuccess={(profile, isNew) => {
          setIsLoggedIn(true);
          setUser(profile);
          StorageService.saveUser(profile);
          StorageService.setLoggedIn(true);
          const userProjects = StorageService.getProjects(profile.id);
          const userTemplates = StorageService.getTemplates(profile.id);
          setProjects(userProjects);
          setTemplates(userTemplates);
          setActiveProject(userProjects[0] || null);

          if (profile.role === 'admin') {
            setCurrentView('admin');
          } else if (isNew) {
            setOnboardingOpen(true);
          } else {
            setCurrentView('dashboard');
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      <OnboardingModal
        isOpen={onboardingOpen}
        userName={user.name}
        onComplete={(domain, initialAction) => {
          setOnboardingOpen(false);
          if (initialAction === 'create') {
            setNewProjectModalOpen(true);
          } else if (initialAction === 'templates') {
            setCurrentView('templates');
          } else {
            setCurrentView('dashboard');
          }
        }}
      />

      <NewProjectModal
        isOpen={newProjectModalOpen}
        onClose={() => setNewProjectModalOpen(false)}
        templates={templates}
        organizationName={user.organizationName}
        onCreateProject={handleCreateProject}
        user={user}
        onOpenBilling={() => setBillingModalOpen(true)}
      />

      <BillingModal
        isOpen={billingModalOpen}
        onClose={() => setBillingModalOpen(false)}
        user={user}
        plans={pricingPlans}
        onUpgradeSuccess={(newPlan) => {
          setUser(StorageService.getUser());
        }}
      />

      {emailModalOpen && emailTargetProject && (
        <EmailCampaignModal
          isOpen={emailModalOpen}
          onClose={() => setEmailModalOpen(false)}
          project={emailTargetProject}
          onSuccess={handleEmailSentSuccess}
          onOpenBilling={() => {
            setEmailModalOpen(false);
            setBillingModalOpen(true);
          }}
        />
      )}

    </div>
  );
}

export default App;
