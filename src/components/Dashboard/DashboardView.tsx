import React from 'react';
import { 
  Plus, 
  Award, 
  CheckCircle2, 
  Mail, 
  ShieldCheck, 
  Eye, 
  Play, 
  FileSpreadsheet, 
  AlertTriangle, 
  Sparkles, 
  Trash2,
  Zap
} from 'lucide-react';
import { Project, UserProfile, Template } from '../../types';

interface DashboardViewProps {
  user: UserProfile;
  projects: Project[];
  templates: Template[];
  onOpenCreateProject: () => void;
  onOpenProjectWizard: (project: Project) => void;
  onOpenDesigner: (templateId?: string) => void;
  onOpenBilling: () => void;
  onDeleteProject: (projectId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  projects,
  templates,
  onOpenCreateProject,
  onOpenProjectWizard,
  onOpenDesigner,
  onOpenBilling,
  onDeleteProject
}) => {
  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Aggregated Stats
  const totalCreated = projects.reduce((acc, p) => acc + (p.recipientsCount || 0), 0);
  const totalGenerated = projects.reduce((acc, p) => acc + (p.generatedCount || 0), 0);
  const totalSent = projects.reduce((acc, p) => acc + (p.emailedCount || 0), 0);
  const totalVerified = projects.reduce((acc, p) => acc + (p.verifiedCount || 0), 0);

  const remainingCerts = Math.max(0, user.usage.certificatesLimit - user.usage.certificatesGenerated);
  const isCreditsExhausted = remainingCerts <= 0;
  const usageCertPercent = Math.round((user.usage.certificatesGenerated / user.usage.certificatesLimit) * 100);
  const isCloseToLimit = usageCertPercent >= 75;

  const getStatusBadge = (status: Project['status']) => {
    switch (status) {
      case 'completed':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-neutral-100 text-black border border-neutral-300"><CheckCircle2 className="w-3 h-3 text-black" /> Completed</span>;
      case 'ready':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-neutral-100 text-neutral-800 border border-neutral-300"><Sparkles className="w-3 h-3 text-black" /> Ready</span>;
      case 'processing':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-neutral-200 text-black border border-neutral-400 animate-pulse"><Play className="w-3 h-3 text-black" /> Processing</span>;
      case 'data_uploaded':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-neutral-100 text-neutral-700 border border-neutral-200"><FileSpreadsheet className="w-3 h-3 text-black" /> Data Ready</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-100 text-neutral-600 border border-neutral-200">Draft</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-150 bg-white text-neutral-900">
      
      {/* 1. Header Greeting & Primary Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
            {getGreeting()}, {user.name.split(' ')[0]}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5 font-medium">
            Welcome to {user.organizationName}. Here is your certificate campaign overview.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onOpenDesigner()}
            className="px-4 py-2 rounded-xl border border-neutral-300 hover:border-black bg-white hover:bg-neutral-50 text-black font-semibold text-xs shadow-xs transition-all"
          >
            <span>Open Studio</span>
          </button>
          
          <button
            onClick={onOpenCreateProject}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs text-white bg-black hover:bg-neutral-800 active:scale-[0.98] shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Certificate</span>
          </button>
        </div>
      </div>

      {/* 2. Usage Warning Banner / Credits Exhausted Alert */}
      {isCreditsExhausted ? (
        <div className="p-5 rounded-2xl bg-red-50 border-2 border-red-300 text-red-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-black text-red-900 uppercase tracking-wide">
                  Certificate Credits Exhausted (0 Credits Remaining)
                </h4>
                <span className="text-[10px] font-extrabold bg-red-200 text-red-900 px-2 py-0.5 rounded-full uppercase">
                  Limit Reached
                </span>
              </div>
              <p className="text-xs text-red-700 mt-0.5 font-medium">
                Aapne is mahine ke sabhi {user.usage.certificatesLimit} certificate credits use kar liye hain ({user.usage.certificatesGenerated}/{user.usage.certificatesLimit}). Naye certificates generate karne ke liye apna plan upgrade karein.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenBilling}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-black transition-all shadow-md shrink-0 cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>Upgrade Plan Now</span>
          </button>
        </div>
      ) : isCloseToLimit ? (
        <div className="p-4 rounded-xl bg-neutral-100 border border-neutral-300 text-black flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-black text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-black">Approaching monthly certificate limit.</p>
              <p className="text-[11px] text-neutral-600">
                You have generated {user.usage.certificatesGenerated} out of {user.usage.certificatesLimit} certificates ({usageCertPercent}%).
              </p>
            </div>
          </div>
          <button
            onClick={onOpenBilling}
            className="px-4 py-1.5 rounded-lg bg-black hover:bg-neutral-800 text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
          >
            Upgrade Plan
          </button>
        </div>
      ) : null}

      {/* 3. Top Metrics Row (Crisp White Cards with 20% Black accents) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-card flex items-center justify-between hover:border-black transition-all">
          <div>
            <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Recipients Queued</p>
            <p className="text-2xl sm:text-3xl font-black text-black mt-1">{totalCreated.toLocaleString()}</p>
            <p className="text-[10px] text-neutral-500 mt-1 font-medium">{projects.length} campaigns</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-neutral-100 text-black flex items-center justify-center border border-neutral-200">
            <Award className="w-5 h-5 text-black" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-card flex items-center justify-between hover:border-black transition-all">
          <div>
            <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Generated</p>
            <p className="text-2xl sm:text-3xl font-black text-black mt-1">{totalGenerated.toLocaleString()}</p>
            <p className="text-[10px] text-neutral-500 mt-1 font-medium">300 DPI vector PDFs</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-neutral-100 text-black flex items-center justify-center border border-neutral-200">
            <CheckCircle2 className="w-5 h-5 text-black" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-card flex items-center justify-between hover:border-black transition-all">
          <div>
            <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Emails Delivered</p>
            <p className="text-2xl sm:text-3xl font-black text-black mt-1">{totalSent.toLocaleString()}</p>
            <p className="text-[10px] text-neutral-500 mt-1 font-medium">PDF inbox attachments</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-neutral-100 text-black flex items-center justify-center border border-neutral-200">
            <Mail className="w-5 h-5 text-black" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-card flex items-center justify-between hover:border-black transition-all">
          <div>
            <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">QR Scans Verified</p>
            <p className="text-2xl sm:text-3xl font-black text-black mt-1">{totalVerified.toLocaleString()}</p>
            <p className="text-[10px] text-neutral-500 mt-1 font-medium">Instant public trust</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-neutral-100 text-black flex items-center justify-center border border-neutral-200">
            <ShieldCheck className="w-5 h-5 text-black" />
          </div>
        </div>

      </div>

      {/* 4. Usage Quota Mini Bar (Sleek Pitch Black Fill) */}
      <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-card flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="w-full md:w-1/3 space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-black">
            <span>Certificates Quota</span>
            <span className="font-mono">{user.usage.certificatesGenerated} / {user.usage.certificatesLimit}</span>
          </div>
          <div className="w-full h-2 rounded-full bg-neutral-100 overflow-hidden border border-neutral-200">
            <div 
              className="h-full rounded-full bg-black transition-all"
              style={{ width: `${Math.min(100, usageCertPercent)}%` }}
            />
          </div>
        </div>

        <div className="w-full md:w-1/3 space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-black">
            <span>Email Credits</span>
            <span className="font-mono">{user.usage.emailCreditsUsed} / {user.usage.emailCreditsLimit}</span>
          </div>
          <div className="w-full h-2 rounded-full bg-neutral-100 overflow-hidden border border-neutral-200">
            <div 
              className="h-full rounded-full bg-black transition-all"
              style={{ width: `${Math.min(100, Math.round((user.usage.emailCreditsUsed / user.usage.emailCreditsLimit) * 100))}%` }}
            />
          </div>
        </div>

        <div className="w-full md:w-1/3 space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-black">
            <span>Storage Used</span>
            <span className="font-mono">{(user.usage.storageUsedMB / 1024).toFixed(1)} GB / {(user.usage.storageLimitMB / 1024).toFixed(0)} GB</span>
          </div>
          <div className="w-full h-2 rounded-full bg-neutral-100 overflow-hidden border border-neutral-200">
            <div 
              className="h-full rounded-full bg-black transition-all"
              style={{ width: `${Math.min(100, Math.round((user.usage.storageUsedMB / user.usage.storageLimitMB) * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* 5. Recent Projects Table (80% Pure White with crisp black typography) */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-card overflow-hidden">
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-black">Recent Projects</h3>
            <p className="text-[11px] text-neutral-500 mt-0.5">Manage certificate campaigns, regenerate batches, and download ZIP files.</p>
          </div>
          <button
            onClick={onOpenCreateProject}
            className="text-xs font-bold text-black hover:underline flex items-center gap-1"
          >
            <span>+ New Campaign</span>
          </button>
        </div>

        {projects.length === 0 ? (
          /* Enhanced Guided Onboarding Card */
          <div className="py-12 px-6 sm:px-12 text-center max-w-2xl mx-auto space-y-6">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-black text-lg text-black">Let's issue your first certificate! 🎓</h4>
              <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto mt-1">
                Follow these 3 quick steps to design, upload recipient data, and generate verifiable certificates with QR codes.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">1</span>
                  <span className="font-bold text-xs text-black">Pick Template</span>
                </div>
                <p className="text-[11px] text-neutral-500">Select Landscape or Portrait A4 layout.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">2</span>
                  <span className="font-bold text-xs text-black">Upload Excel</span>
                </div>
                <p className="text-[11px] text-neutral-500">Drop attendee list with automatic column match.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">3</span>
                  <span className="font-bold text-xs text-black">Download ZIP</span>
                </div>
                <p className="text-[11px] text-neutral-500">Instant PDF & QR code verification links.</p>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={onOpenCreateProject}
                className="w-full sm:w-auto px-6 py-3 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Your First Campaign</span>
              </button>
              <button
                onClick={() => onOpenDesigner()}
                className="w-full sm:w-auto px-5 py-3 bg-white hover:bg-neutral-50 border border-neutral-300 text-neutral-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                <span>Explore Template Studio</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-600">
              <thead className="bg-neutral-50 text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider border-b border-neutral-200">
                <tr>
                  <th className="py-3 px-5">Project Name</th>
                  <th className="py-3 px-4">Template</th>
                  <th className="py-3 px-4">Recipients</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-medium">
                {projects.map((project) => {
                  const tpl = templates.find(t => t.id === project.templateId);

                  return (
                    <tr key={project.id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="py-3.5 px-5">
                        <button
                          onClick={() => onOpenProjectWizard(project)}
                          className="font-bold text-black hover:underline text-left transition-colors flex items-center gap-2"
                        >
                          <span>{project.name}</span>
                        </button>
                        <p className="text-[11px] text-neutral-400 mt-0.5 truncate max-w-xs">{project.description || 'Certificate issuance campaign'}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-[11px] font-semibold text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                          {tpl?.name || 'Custom Template'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-black">
                        {project.recipientsCount} recipients
                      </td>

                      <td className="py-3.5 px-4">
                        {getStatusBadge(project.status)}
                      </td>

                      <td className="py-3.5 px-4 text-[11px] text-neutral-500">
                        {new Date(project.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>

                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onOpenProjectWizard(project)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-black bg-neutral-100 hover:bg-black hover:text-white border border-neutral-200 transition-colors flex items-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View / Generate</span>
                          </button>
                          
                          <button
                            onClick={() => onDeleteProject(project.id)}
                            className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-neutral-100 rounded-lg transition-colors"
                            title="Delete Project"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
