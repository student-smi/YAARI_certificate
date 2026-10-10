import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Copy, 
  Edit3, 
  ArrowRight, 
  Sparkles, 
  Trash2, 
  Layout, 
  FileText, 
  Upload, 
  X, 
  CheckCircle2, 
  Image as ImageIcon,
  Award
} from 'lucide-react';
import { Template } from '../../types';

interface TemplateLibraryProps {
  templates: Template[];
  onSelectTemplateToCreate: (templateId: string, orientation?: 'landscape' | 'portrait') => void;
  onEditTemplate: (
    templateId: string,
    orientation?: 'landscape' | 'portrait',
    customBgUrl?: string,
    customName?: string
  ) => void;
  onDuplicateTemplate: (template: Template) => void;
  onDeleteTemplate?: (templateId: string) => void;
}

export const TemplateLibrary: React.FC<TemplateLibraryProps> = ({
  templates,
  onSelectTemplateToCreate,
  onEditTemplate,
  onDuplicateTemplate,
  onDeleteTemplate
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedOrientationFilter, setSelectedOrientationFilter] = useState<'all' | 'landscape' | 'portrait'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Per-card orientation state overrides (key: templateId, value: 'landscape' | 'portrait')
  const [cardOrientations, setCardOrientations] = useState<Record<string, 'landscape' | 'portrait'>>({});

  // Modal 1: Create New Certificate Modal (Choose Landscape / Portrait mode first, then Open Editor)
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newCertOrientation, setNewCertOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [newCertName, setNewCertName] = useState('Certificate of Excellence');
  const [newCertBgUrl, setNewCertBgUrl] = useState('');

  // Modal 2: Edit Existing Template Orientation Modal (Choose Landscape / Portrait mode, then Open Editor)
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [templateToEdit, setTemplateToEdit] = useState<Template | null>(null);
  const [editOrientation, setEditOrientation] = useState<'landscape' | 'portrait'>('landscape');

  const customCount = templates.filter(t => t.isCustom).length;

  const categories = [
    { id: 'all', label: 'All Templates' },
    { id: 'custom', label: `⭐ My Templates (${customCount})` },
    { id: 'corporate', label: 'Corporate' },
    { id: 'academic', label: 'Academic & Diploma' },
    { id: 'workshop', label: 'Bootcamp & Tech' },
    { id: 'appreciation', label: 'Appreciation & Honors' },
    { id: 'course', label: 'Online Course' },
  ];

  const filteredTemplates = templates.filter(t => {
    const matchesCategory = 
      selectedCategory === 'all' 
        ? true 
        : selectedCategory === 'custom' 
          ? Boolean(t.isCustom) 
          : t.category === selectedCategory;
    const currentOrientation = cardOrientations[t.id] || t.orientation;
    const matchesOrientation = 
      selectedOrientationFilter === 'all' 
        ? true 
        : currentOrientation === selectedOrientationFilter;
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesOrientation && matchesSearch;
  });

  // Handlers for New Certificate creation
  const handleOpenCreateModal = () => {
    setNewCertOrientation('landscape');
    setNewCertName('Certificate of Completion');
    setNewCertBgUrl('');
    setCreateModalOpen(true);
  };

  const handleConfirmCreate = () => {
    onEditTemplate('', newCertOrientation, newCertBgUrl || undefined, newCertName);
    setCreateModalOpen(false);
  };

  const handleBgFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      if (url) setNewCertBgUrl(url);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Handlers for Editing Existing Template
  const handleOpenEditModal = (template: Template) => {
    const currentMode = cardOrientations[template.id] || template.orientation;
    setTemplateToEdit(template);
    setEditOrientation(currentMode);
    setEditModalOpen(true);
  };

  const handleConfirmEdit = () => {
    if (!templateToEdit) return;
    onEditTemplate(templateToEdit.id, editOrientation);
    setEditModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-150 bg-white text-neutral-900">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
            Template Gallery
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Choose from our pre-designed templates or build your own from scratch with Landscape and Portrait options.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-black hover:bg-neutral-800 active:scale-[0.98] shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Certificate</span>
        </button>
      </div>

      {/* Category Pills & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-black text-white shadow-xs'
                  : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Orientation Filter */}
          <div className="flex items-center bg-neutral-100 p-0.5 rounded-xl border border-neutral-200 text-xs font-bold shrink-0">
            <button
              onClick={() => setSelectedOrientationFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                selectedOrientationFilter === 'all'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-neutral-600 hover:text-black'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedOrientationFilter('landscape')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                selectedOrientationFilter === 'landscape'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-neutral-600 hover:text-black'
              }`}
              title="Landscape Templates"
            >
              Landscape
            </button>
            <button
              onClick={() => setSelectedOrientationFilter('portrait')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                selectedOrientationFilter === 'portrait'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-neutral-600 hover:text-black'
              }`}
              title="Portrait Templates"
            >
              Portrait
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-xl focus:outline-none focus:border-black font-medium"
            />
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => {
          const orgEl = template.elements.find(e => e.id === 'el-org-name' || e.fieldKey === 'org_name');
          const titleEl = template.elements.find(e => e.id === 'el-title');
          const displayOrg = orgEl?.content || template.category;
          const displayTitle = titleEl?.content || template.name;
          const borderColor = template.backgroundStyle?.borderColor || '#000000';

          const currentOrientation = cardOrientations[template.id] || template.orientation;
          const isPortrait = currentOrientation === 'portrait';

          return (
            <div
              key={template.id}
              className="bg-white rounded-2xl border border-neutral-200 shadow-card hover:border-black transition-all overflow-hidden flex flex-col justify-between group"
            >
              {/* Card Mode Bar: Direct Landscape & Portrait Switcher on each existing template */}
              <div className="px-4 py-2.5 bg-neutral-100/90 border-b border-neutral-200 flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500">
                  Mode:
                </span>
                <div className="flex items-center bg-white p-0.5 rounded-lg border border-neutral-300 shadow-2xs">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCardOrientations(prev => ({ ...prev, [template.id]: 'landscape' }));
                    }}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                      !isPortrait
                        ? 'bg-black text-white shadow-xs'
                        : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
                    }`}
                    title="Switch to Landscape Mode (842x595)"
                  >
                    <Layout className="w-3 h-3" />
                    <span>Landscape</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCardOrientations(prev => ({ ...prev, [template.id]: 'portrait' }));
                    }}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                      isPortrait
                        ? 'bg-black text-white shadow-xs'
                        : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
                    }`}
                    title="Switch to Portrait Mode (595x842)"
                  >
                    <FileText className="w-3 h-3" />
                    <span>Portrait</span>
                  </button>
                </div>
              </div>

              {/* Visual Preview Thumbnail Box */}
              <div className="p-4 bg-neutral-50/80 border-b border-neutral-100 flex items-center justify-center min-h-[240px] h-[240px]">
                <div 
                  className={`rounded-lg border-2 shadow-xs flex flex-col items-center justify-between text-center relative overflow-hidden group-hover:scale-[1.01] transition-all duration-200 ${
                    isPortrait 
                      ? 'aspect-[1/1.414] h-[210px] w-auto mx-auto p-4' 
                      : 'aspect-[1.414/1] h-[160px] w-auto max-w-full mx-auto p-4'
                  }`}
                  style={{ 
                    borderColor: borderColor,
                    backgroundColor: template.backgroundStyle?.color || '#FFFFFF',
                    backgroundImage: template.backgroundStyle?.imageUrl 
                      ? `url(${template.backgroundStyle.imageUrl})` 
                      : template.backgroundStyle?.gradient || undefined,
                    backgroundSize: template.backgroundStyle?.imageFit === 'stretch' 
                      ? '100% 100%' 
                      : template.backgroundStyle?.imageFit === 'contain' 
                        ? 'contain' 
                        : 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }}
                >
                  <div className="w-full flex flex-col items-center pt-1 z-10">
                    <p className="text-[8px] font-bold tracking-widest text-neutral-500 uppercase line-clamp-1 px-1">
                      {displayOrg}
                    </p>
                    <h4 className="font-serif font-bold text-xs sm:text-[13px] text-black mt-0.5 line-clamp-1">
                      {displayTitle}
                    </h4>
                    <div className="w-12 h-0.5 bg-neutral-800 my-1.5" />
                    <p className="text-[8px] text-neutral-500 font-serif italic">
                      Presented to Recipient
                    </p>
                  </div>

                  {isPortrait && (
                    <div className="my-auto py-1 z-10">
                      <p className="text-[11px] font-serif font-bold text-neutral-800 tracking-wide">
                        Recipient Name
                      </p>
                    </div>
                  )}

                  <div className="w-full flex items-center justify-between px-1 pb-1 z-10">
                    <div className="text-[7px] text-neutral-400 font-mono">
                      QR Verified
                    </div>
                    <div className="text-[9px] font-signature text-black font-bold">
                      Signatory
                    </div>
                  </div>
                </div>
              </div>

              {/* Info & Metadata */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-black bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded">
                        {template.category}
                      </span>
                      {template.isCustom && (
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                          MY TEMPLATE
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-bold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                      A4 {currentOrientation}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-black mt-2">{template.name}</h3>
                  <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{template.description}</p>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onSelectTemplateToCreate(template.id, currentOrientation)}
                    className="flex-1 py-2 px-3 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Use Template</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleOpenEditModal(template)}
                    className="p-2 border border-neutral-300 hover:bg-neutral-100 text-black rounded-xl transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
                    title="Edit certificate in Studio (Choose Landscape or Portrait)"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span className="hidden sm:inline">Edit</span>
                  </button>

                  <button
                    onClick={() => onDuplicateTemplate(template)}
                    className="p-2 border border-neutral-300 hover:bg-neutral-100 text-black rounded-xl transition-colors cursor-pointer"
                    title="Duplicate Template"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  {template.isCustom && onDeleteTemplate && (
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete "${template.name}"?`)) {
                          onDeleteTemplate(template.id);
                        }
                      }}
                      className="p-2 border border-red-200 hover:bg-red-50 text-red-600 rounded-xl transition-colors cursor-pointer"
                      title="Delete Custom Template"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredTemplates.length === 0 && (
          <div className="col-span-full py-16 text-center bg-neutral-50 rounded-3xl border border-dashed border-neutral-300">
            <Sparkles className="w-8 h-8 text-neutral-400 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-neutral-800">No templates found</h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
              {selectedCategory === 'custom' 
                ? "You haven't saved any custom templates yet. Edit any default template or create a new one to save here." 
                : "No templates matched your current filter criteria."}
            </p>
            {selectedCategory === 'custom' ? (
              <button
                onClick={handleOpenCreateModal}
                className="mt-4 px-4 py-2 bg-black text-white text-xs font-bold rounded-xl hover:bg-neutral-800 shadow-xs cursor-pointer"
              >
                Create Certificate
              </button>
            ) : (
              <button
                onClick={() => { setSelectedCategory('all'); setSearchQuery(''); setSelectedOrientationFilter('all'); }}
                className="mt-4 px-4 py-2 bg-black text-white text-xs font-bold rounded-xl hover:bg-neutral-800 shadow-xs cursor-pointer"
              >
                View All Templates
              </button>
            )}
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* MODAL 1: CREATE NEW CERTIFICATE (Landscape / Portrait First) */}
      {/* ============================================================ */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-neutral-300 overflow-hidden text-neutral-900 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-6 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center shadow-xs">
                  <Award className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-black">
                    Create Certificate
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Step 1: Choose mode (Landscape or Portrait) → Step 2: Open Certificate Editing
                  </p>
                </div>
              </div>

              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-black hover:bg-neutral-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* 1. Mode Selection: Landscape vs Portrait */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-black mb-2.5">
                  1. Select Certificate Mode / Orientation *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Landscape Card */}
                  <div
                    onClick={() => setNewCertOrientation('landscape')}
                    className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      newCertOrientation === 'landscape'
                        ? 'border-black bg-neutral-50 shadow-md ring-2 ring-black/10'
                        : 'border-neutral-200 bg-white hover:border-neutral-400'
                    }`}
                  >
                    {newCertOrientation === 'landscape' && (
                      <div className="absolute top-3 right-3 text-black">
                        <CheckCircle2 className="w-5 h-5 fill-black text-white" />
                      </div>
                    )}

                    {/* Landscape Visual Diagram */}
                    <div className="w-full aspect-[1.414/1] bg-white border border-neutral-300 rounded-lg p-3 shadow-2xs flex flex-col items-center justify-center relative overflow-hidden mb-3">
                      <div className="w-full h-full border border-amber-600/40 rounded flex flex-col items-center justify-center p-2 text-center bg-amber-50/20">
                        <div className="w-16 h-1 bg-neutral-400 rounded-full mb-1.5" />
                        <div className="w-24 h-2 bg-neutral-800 rounded-full mb-1.5" />
                        <div className="w-20 h-1 bg-amber-700 rounded-full mb-2" />
                        <div className="flex items-center justify-between w-full px-2 mt-auto">
                          <div className="w-5 h-5 border border-dashed border-neutral-400 rounded-xs" />
                          <div className="w-10 h-0.5 bg-neutral-600" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <Layout className="w-4 h-4 text-black" />
                        <h4 className="font-extrabold text-sm text-black">Landscape Mode</h4>
                      </div>
                      <p className="text-[11px] font-bold text-neutral-500 mt-0.5">
                        842 × 595 px (A4 Horizontal)
                      </p>
                      <p className="text-[11px] text-neutral-600 mt-1.5 leading-relaxed">
                        Best for corporate awards, training certifications, completion recognition, and workshop credentials.
                      </p>
                    </div>
                  </div>

                  {/* Portrait Card */}
                  <div
                    onClick={() => setNewCertOrientation('portrait')}
                    className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      newCertOrientation === 'portrait'
                        ? 'border-black bg-neutral-50 shadow-md ring-2 ring-black/10'
                        : 'border-neutral-200 bg-white hover:border-neutral-400'
                    }`}
                  >
                    {newCertOrientation === 'portrait' && (
                      <div className="absolute top-3 right-3 text-black">
                        <CheckCircle2 className="w-5 h-5 fill-black text-white" />
                      </div>
                    )}

                    {/* Portrait Visual Diagram */}
                    <div className="w-full flex items-center justify-center mb-3">
                      <div className="w-[130px] aspect-[1/1.35] bg-white border border-neutral-300 rounded-lg p-2.5 shadow-2xs flex flex-col items-center justify-center relative overflow-hidden">
                        <div className="w-full h-full border border-amber-600/40 rounded flex flex-col items-center justify-center p-2 text-center bg-amber-50/20">
                          <div className="w-12 h-1 bg-neutral-400 rounded-full mb-1.5" />
                          <div className="w-16 h-2 bg-neutral-800 rounded-full mb-1.5" />
                          <div className="w-14 h-1 bg-amber-700 rounded-full mb-2" />
                          <div className="w-16 h-1 bg-neutral-300 rounded-full mb-1" />
                          <div className="flex items-center justify-between w-full px-1 mt-auto">
                            <div className="w-4 h-4 border border-dashed border-neutral-400 rounded-xs" />
                            <div className="w-8 h-0.5 bg-neutral-600" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-black" />
                        <h4 className="font-extrabold text-sm text-black">Portrait Mode</h4>
                      </div>
                      <p className="text-[11px] font-bold text-neutral-500 mt-0.5">
                        595 × 842 px (A4 Vertical)
                      </p>
                      <p className="text-[11px] text-neutral-600 mt-1.5 leading-relaxed">
                        Best for university degrees, formal diplomas, academic honors, licensing certifications, and transcripts.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Certificate Name */}
              <div>
                <label className="block text-xs font-bold text-black mb-1.5">
                  2. Certificate Title / Project Name
                </label>
                <input
                  type="text"
                  value={newCertName}
                  onChange={(e) => setNewCertName(e.target.value)}
                  placeholder="e.g. Certificate of Completion, Honors Diploma"
                  className="w-full px-3.5 py-2 text-xs bg-white border border-neutral-300 rounded-xl focus:outline-none focus:border-black font-semibold"
                />
              </div>

              {/* 3. Optional Institute Background Image Upload */}
              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-black flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-neutral-700" />
                      <span>Custom Institute Background (Optional)</span>
                    </h5>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      Institute nu background ready hoy to ahi upload kari sako cho (PNG / JPG).
                    </p>
                  </div>

                  {newCertBgUrl && (
                    <button
                      type="button"
                      onClick={() => setNewCertBgUrl('')}
                      className="text-[11px] font-bold text-red-600 hover:underline cursor-pointer"
                    >
                      Remove Background
                    </button>
                  )}
                </div>

                {newCertBgUrl ? (
                  <div className="flex items-center gap-4 p-3 bg-white rounded-xl border border-neutral-300">
                    <img 
                      src={newCertBgUrl} 
                      alt="Uploaded background" 
                      className="w-20 h-14 object-cover rounded-lg border border-neutral-200" 
                    />
                    <div className="flex-1">
                      <span className="text-xs font-bold text-black">Institute Background Ready</span>
                      <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                        ✓ Background applied. You can add text, signature & QR directly on it in the editor.
                      </p>
                    </div>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-neutral-300 hover:border-black rounded-xl bg-white hover:bg-neutral-50 transition-colors cursor-pointer text-xs font-bold text-neutral-700">
                    <Upload className="w-4 h-4 text-neutral-500" />
                    <span>Upload Institute Background Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBgFileUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Modal Footer: "Pachi certificate editing option aave" */}
            <div className="p-5 border-t border-neutral-200 bg-neutral-50/50 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-neutral-600 hover:text-black hover:bg-neutral-200/60 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmCreate}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-black hover:bg-neutral-800 active:scale-[0.98] shadow-md transition-all cursor-pointer"
              >
                <span>Continue to Certificate Editing</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: EDIT EXISTING TEMPLATE (Landscape / Portrait First) */}
      {/* ============================================================ */}
      {editModalOpen && templateToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-neutral-300 overflow-hidden text-neutral-900 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-6 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center shadow-xs">
                  <Edit3 className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-black">
                    Edit Certificate: {templateToEdit.name}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Select Landscape or Portrait mode before opening the certificate editor.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setEditModalOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-black hover:bg-neutral-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-black mb-2.5">
                  Choose Orientation Mode
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {/* Landscape Option */}
                  <div
                    onClick={() => setEditOrientation('landscape')}
                    className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center ${
                      editOrientation === 'landscape'
                        ? 'border-black bg-neutral-50 shadow-md ring-2 ring-black/10'
                        : 'border-neutral-200 bg-white hover:border-neutral-400'
                    }`}
                  >
                    {editOrientation === 'landscape' && (
                      <div className="absolute top-2.5 right-2.5 text-black">
                        <CheckCircle2 className="w-4 h-4 fill-black text-white" />
                      </div>
                    )}
                    <Layout className="w-6 h-6 text-black mb-2" />
                    <h4 className="font-extrabold text-xs text-black">Landscape Mode</h4>
                    <span className="text-[10px] font-bold text-neutral-500 mt-0.5">842 × 595 px</span>
                    <span className="text-[10px] text-neutral-600 mt-2">Standard Horizontal A4</span>
                  </div>

                  {/* Portrait Option */}
                  <div
                    onClick={() => setEditOrientation('portrait')}
                    className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center ${
                      editOrientation === 'portrait'
                        ? 'border-black bg-neutral-50 shadow-md ring-2 ring-black/10'
                        : 'border-neutral-200 bg-white hover:border-neutral-400'
                    }`}
                  >
                    {editOrientation === 'portrait' && (
                      <div className="absolute top-2.5 right-2.5 text-black">
                        <CheckCircle2 className="w-4 h-4 fill-black text-white" />
                      </div>
                    )}
                    <FileText className="w-6 h-6 text-black mb-2" />
                    <h4 className="font-extrabold text-xs text-black">Portrait Mode</h4>
                    <span className="text-[10px] font-bold text-neutral-500 mt-0.5">595 × 842 px</span>
                    <span className="text-[10px] text-neutral-600 mt-2">Formal Vertical A4</span>
                  </div>
                </div>
              </div>

              {/* Preview Box */}
              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 flex items-center justify-center min-h-[220px]">
                <div 
                  className={`rounded-lg border-2 p-4 shadow-xs flex flex-col items-center justify-between text-center relative overflow-hidden transition-all duration-200 ${
                    editOrientation === 'portrait' ? 'aspect-[1/1.414] h-[190px] w-auto' : 'aspect-[1.414/1] h-[140px] w-auto'
                  }`}
                  style={{ 
                    borderColor: templateToEdit.backgroundStyle?.borderColor || '#000000',
                    backgroundColor: templateToEdit.backgroundStyle?.color || '#FFFFFF',
                    backgroundImage: templateToEdit.backgroundStyle?.imageUrl 
                      ? `url(${templateToEdit.backgroundStyle.imageUrl})` 
                      : templateToEdit.backgroundStyle?.gradient || undefined,
                    backgroundSize: 'cover'
                  }}
                >
                  <div className="w-full flex flex-col items-center">
                    <span className="text-[8px] font-bold tracking-widest text-neutral-500 uppercase line-clamp-1">
                      {templateToEdit.category}
                    </span>
                    <span className="font-serif font-bold text-[11px] text-black mt-0.5 line-clamp-1">
                      {templateToEdit.name}
                    </span>
                    <div className="w-10 h-0.5 bg-neutral-800 my-1" />
                  </div>
                  <span className="text-[9px] text-neutral-600 font-serif font-semibold italic my-auto">
                    Recipient Name
                  </span>
                  <div className="w-full flex items-center justify-between text-[7px] text-neutral-400 font-mono px-1">
                    <span>QR Code</span>
                    <span className="font-signature font-bold text-black text-[9px]">Signatory</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-neutral-500 text-center font-medium">
                Pachi certificate editing studio ma text, fonts, logos, background and signatures customise kari sako cho.
              </p>
            </div>

            {/* Modal Footer: "Pachi certificate editing option aave" */}
            <div className="p-5 border-t border-neutral-200 bg-neutral-50/50 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-neutral-600 hover:text-black hover:bg-neutral-200/60 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmEdit}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-black hover:bg-neutral-800 active:scale-[0.98] shadow-md transition-all cursor-pointer"
              >
                <span>Open Certificate Editor</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
