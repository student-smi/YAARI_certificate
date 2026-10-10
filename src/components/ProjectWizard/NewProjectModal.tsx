import React, { useState } from 'react';
import { X, Award, ArrowRight, AlertTriangle, Zap } from 'lucide-react';
import { Project, Template, UserProfile } from '../../types';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: Template[];
  organizationName: string;
  user?: UserProfile;
  onOpenBilling?: () => void;
  onCreateProject: (project: Project) => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  templates,
  organizationName,
  user,
  onOpenBilling,
  onCreateProject
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Training & Workshops');
  const [prefix, setPrefix] = useState('CERT-2026-');
  const [selectedTemplateId, setSelectedTemplateId] = useState(templates[0]?.id || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: name.trim(),
      category,
      status: 'draft',
      templateId: selectedTemplateId || templates[0]?.id || 'tpl-tech-bootcamp',
      recipientsCount: 0,
      generatedCount: 0,
      emailedCount: 0,
      verifiedCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      fieldMapping: {
        name: 'Full Name',
        course: 'Course Name',
        date: 'Completion Date',
        email: 'Email Address'
      },
      recipients: [],
      prefix: prefix.trim() || 'CERT-2026-',
      organizationName
    };

    onCreateProject(newProject);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-elevated border border-neutral-300 overflow-hidden text-neutral-900">
        
        {/* Header */}
        <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-black">New Certificate Campaign</h3>
              <p className="text-xs text-neutral-500">Initialize a campaign to generate personalized certificates.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-black hover:bg-neutral-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {user?.usage && user.usage.certificatesGenerated >= user.usage.certificatesLimit && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-950 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <div>
                  <span className="font-extrabold text-red-900 block">Certificate Credits Khatam</span>
                  <span className="text-[11px] text-red-700">0 Credits Left in your {user.plan} plan.</span>
                </div>
              </div>
              {onOpenBilling && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenBilling();
                  }}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer shrink-0 flex items-center gap-1"
                >
                  <Zap className="w-3 h-3 fill-white" />
                  <span>Upgrade</span>
                </button>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-black mb-1">Campaign Project Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Python Masterclass — Fall 2026"
              className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:border-black font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-black mb-1">Domain Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg bg-white font-medium"
              >
                <option value="Training & Workshops">Training & Workshops</option>
                <option value="Academic & University">Academic & University</option>
                <option value="Corporate Honors">Corporate Honors</option>
                <option value="Conferences & Summits">Conferences & Summits</option>
                <option value="Online Courses">Online Courses</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-black mb-1">Certificate ID Prefix</label>
              <input
                type="text"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                placeholder="CERT-2026-"
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-black mb-1.5">Starting Template</label>
            <div className="grid grid-cols-2 gap-2">
              {templates.slice(0, 4).map((tpl) => (
                <button
                  type="button"
                  key={tpl.id}
                  onClick={() => setSelectedTemplateId(tpl.id)}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                    selectedTemplateId === tpl.id
                      ? 'border-2 border-black bg-neutral-50 font-bold text-black'
                      : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                  }`}
                >
                  <p className="truncate">{tpl.name}</p>
                  <span className="text-[10px] text-neutral-400 capitalize">{tpl.category}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-neutral-300 text-black font-semibold text-xs rounded-xl hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
            >
              <span>Create & Launch Wizard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
