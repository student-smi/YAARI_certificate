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

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [newProjectModalOpen, setNewProjectModalOpen] = useState(false);
  const [billingModalOpen, setBillingModalOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailTargetProject, setEmailTargetProject] = useState<Project | null>(null);

  // Subscribe to Storage updates
  useEffect(() => {
    const unsubscribe = StorageService.subscribe(() => {
      setUser(StorageService.getUser());
      setProjects(StorageService.getProjects());
      setTemplates(StorageService.getTemplates());
      setPricingPlans(StorageService.getPricingPlans());
    });
    return unsubscribe;
  }, []);

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

  const handleOpenDesigner = (templateId?: string) => {
    const tpl = templates.find(t => t.id === templateId) || templates[0];
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
      id: `tpl-${Date.now()}`,
      name: `${tpl.name} (Copy)`,
      isCustom: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    StorageService.saveTemplate(dup);
    setTemplates(StorageService.getTemplates());
    handleOpenDesigner(dup.id);
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
            onOpenDesigner={handleOpenDesigner}
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
            onOpenDesigner={handleOpenDesigner}
            onOpenEmailModal={handleOpenEmailModal}
          />
        )}

        {currentView === 'designer' && (
          <CertificateDesigner
            initialTemplate={activeDesignerTemplate}
            onBack={() => setCurrentView('dashboard')}
            onSaveTemplate={(updated) => {
              setTemplates(StorageService.getTemplates());
            }}
          />
        )}

        {currentView === 'templates' && (
          <TemplateLibrary
            templates={templates}
            onSelectTemplateToCreate={(templateId) => {
              const selectedTpl = templates.find(t => t.id === templateId) || templates[0];
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
            onEditTemplate={(tplId) => handleOpenDesigner(tplId)}
            onDuplicateTemplate={handleDuplicateTemplate}
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
          if (isNew) {
            setOnboardingOpen(true);
          } else {
            setCurrentView('dashboard');
          }
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
        />
      )}

    </div>
  );
}

export default App;
