import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  CheckCircle2, 
  FolderPlus, 
  Sparkles, 
  ArrowRight, 
  Layers, 
  Compass, 
  PlusCircle,
  FileCheck2
} from 'lucide-react';
import { Template, TemplateCategory } from '../../types';

interface SaveTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTemplate: Template;
  onConfirmSave: (savedTemplate: Template, mode: 'new' | 'update') => void;
  onNavigateToTemplates?: () => void;
  onNavigateToWizard?: (templateId: string) => void;
}

export const SaveTemplateModal: React.FC<SaveTemplateModalProps> = ({
  isOpen,
  onClose,
  currentTemplate,
  onConfirmSave,
  onNavigateToTemplates,
  onNavigateToWizard
}) => {
  const isExistingCustom = Boolean(currentTemplate.isCustom);
  const [templateName, setTemplateName] = useState(currentTemplate.name);
  const [description, setDescription] = useState(currentTemplate.description || '');
  const [category, setCategory] = useState<TemplateCategory>(
    currentTemplate.category || 'custom'
  );
  const [saveMode, setSaveMode] = useState<'new' | 'update'>(isExistingCustom ? 'update' : 'new');
  
  // Status: 'editing' | 'success'
  const [step, setStep] = useState<'editing' | 'success'>('editing');
  const [savedResult, setSavedResult] = useState<Template | null>(null);

  // Sync state whenever modal opens or currentTemplate changes
  useEffect(() => {
    if (isOpen) {
      const isCustom = Boolean(currentTemplate.isCustom);
      setTemplateName(currentTemplate.name);
      setDescription(currentTemplate.description || '');
      setCategory(currentTemplate.category || 'custom');
      // For existing custom templates, default to update mode so no duplicate is created!
      setSaveMode(isCustom ? 'update' : 'new');
      setStep('editing');
      setSavedResult(null);
    }
  }, [isOpen, currentTemplate]);

  if (!isOpen) return null;

  const categories: { id: TemplateCategory; label: string }[] = [
    { id: 'custom', label: '⭐ My Custom Templates (Personal Collection)' },
    { id: 'corporate', label: 'Corporate & Executive' },
    { id: 'academic', label: 'Academic & Diploma' },
    { id: 'workshop', label: 'Workshop & Bootcamp' },
    { id: 'course', label: 'Online Course & Training' },
    { id: 'appreciation', label: 'Appreciation & Honors' },
    { id: 'achievement', label: 'Achievement & Awards' },
    { id: 'participation', label: 'Participation' },
    { id: 'event', label: 'Conference & Event' }
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName.trim()) return;

    let finalTemplate: Template;

    if (saveMode === 'new' || !isExistingCustom) {
      finalTemplate = {
        ...currentTemplate,
        id: `tpl-custom-${Date.now()}`,
        name: templateName.trim(),
        description: description.trim() || `Custom template based on ${currentTemplate.name}`,
        category,
        isCustom: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } else {
      // Overwrite/update existing custom template preserving its exact ID!
      finalTemplate = {
        ...currentTemplate,
        id: currentTemplate.id,
        name: templateName.trim(),
        description: description.trim(),
        category,
        isCustom: true,
        updatedAt: new Date().toISOString()
      };
    }

    onConfirmSave(finalTemplate, saveMode);
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-neutral-300 overflow-hidden text-neutral-900 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        
        {step === 'editing' ? (
          <form onSubmit={handleSave} className="flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center shadow-sm">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-black">Save Template</h3>
                  <p className="text-xs text-neutral-500">
                    Choose template name, destination, and category.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              
              {/* Template Name Input */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Template Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g. Yaari Leadership Certificate"
                  className="w-full px-4 py-2.5 text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black focus:bg-white font-medium transition-all"
                />
              </div>

              {/* Save Mode Selector (Only if editing an existing custom template) */}
              {isExistingCustom ? (
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                    Save Destination Mode
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSaveMode('update')}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        saveMode === 'update'
                          ? 'border-black bg-neutral-900 text-white shadow-xs'
                          : 'border-neutral-200 bg-white hover:border-neutral-300 text-neutral-800'
                      }`}
                    >
                      <div className="font-bold text-xs flex items-center gap-1.5">
                        <FileCheck2 className="w-3.5 h-3.5" />
                        Update Existing
                      </div>
                      <p className={`text-[10px] mt-1 line-clamp-2 ${saveMode === 'update' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                        Overwrites current template changes.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSaveMode('new')}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        saveMode === 'new'
                          ? 'border-black bg-neutral-900 text-white shadow-xs'
                          : 'border-neutral-200 bg-white hover:border-neutral-300 text-neutral-800'
                      }`}
                    >
                      <div className="font-bold text-xs flex items-center gap-1.5">
                        <PlusCircle className="w-3.5 h-3.5" />
                        Save as New Copy
                      </div>
                      <p className={`text-[10px] mt-1 line-clamp-2 ${saveMode === 'new' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                        Creates a brand-new template in your library.
                      </p>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2.5 text-xs">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-amber-950">Saving as New Custom Template</span>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      This will be saved into your personal <strong>"My Custom Templates"</strong> gallery without modifying the default system template.
                    </p>
                  </div>
                </div>
              )}

              {/* Category / Save Folder Dropdown */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                    Template Category / Save Folder
                  </label>
                  <span className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-bold">
                    ⭐ My Templates
                  </span>
                </div>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TemplateCategory)}
                  className="w-full px-4 py-2.5 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black font-bold text-neutral-900 shadow-xs"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Saved templates will appear directly under <strong>Templates ➔ ⭐ My Templates</strong>.
                </p>
              </div>

              {/* Optional Short Description */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Description <span className="text-neutral-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Official certificate for student leadership program"
                  className="w-full px-4 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black font-medium"
                />
              </div>

              {/* Location Information Callout */}
              <div className="p-3 bg-neutral-100 rounded-2xl border border-neutral-200 text-neutral-600 text-xs flex items-center gap-2.5">
                <Compass className="w-4 h-4 text-black shrink-0" />
                <div className="text-[11px]">
                  <strong>Save Location:</strong> CertiForge Storage ➔ <strong>Templates Gallery</strong> (Filter: <em>"My Templates"</em>)
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-neutral-50 border-t border-neutral-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 hover:text-black hover:bg-neutral-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                <Save className="w-4 h-4" />
                <span>
                  {isExistingCustom 
                    ? (saveMode === 'update' ? 'Update Template' : 'Save as New Copy')
                    : 'Save to My Templates'}
                </span>
              </button>
            </div>
          </form>
        ) : (
          /* SUCCESS STEP */
          <div className="p-8 flex flex-col items-center text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-10 h-10 animate-bounce duration-1000" />
            </div>

            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                SAVED SUCCESSFULLY
              </span>
              <h3 className="text-xl font-black text-black mt-2">
                Template Ready & Saved!
              </h3>
              <p className="text-xs text-neutral-600 mt-1 max-w-sm">
                Your certificate template <strong>"{savedResult?.name}"</strong> has been saved and is now ready for bulk issuing.
              </p>
            </div>

            {/* Saved Location Details Card */}
            <div className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl p-4 text-left space-y-2 text-xs">
              <div className="flex items-center justify-between text-neutral-500 pb-2 border-b border-neutral-200">
                <span>Saved Location</span>
                <span className="font-bold text-black font-mono">Templates ➔ My Custom Templates</span>
              </div>
              <div className="flex items-center justify-between text-neutral-500">
                <span>Category</span>
                <span className="font-semibold text-neutral-800 capitalize">{savedResult?.category}</span>
              </div>
              <div className="flex items-center justify-between text-neutral-500">
                <span>Layout Format</span>
                <span className="font-semibold text-neutral-800 uppercase">{savedResult?.orientation} (300 DPI Vector)</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="w-full space-y-2.5 pt-2">
              {onNavigateToTemplates && (
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    onNavigateToTemplates();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold shadow-md transition-all"
                >
                  <Layers className="w-4 h-4" />
                  <span>View in Templates Gallery</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </button>
              )}

              {onNavigateToWizard && savedResult && (
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    onNavigateToWizard(savedResult.id);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-neutral-300 hover:border-black bg-white hover:bg-neutral-50 text-black text-xs font-bold transition-all"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Create Project with this Template</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleClose}
                className="w-full py-2 text-xs font-semibold text-neutral-500 hover:text-black transition-colors"
              >
                Continue Editing in Studio
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
