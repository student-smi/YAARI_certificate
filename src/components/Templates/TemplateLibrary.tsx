import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Copy, 
  Edit3, 
  ArrowRight,
  Sparkles,
  Trash2
} from 'lucide-react';
import { Template } from '../../types';

interface TemplateLibraryProps {
  templates: Template[];
  onSelectTemplateToCreate: (templateId: string) => void;
  onEditTemplate: (templateId: string) => void;
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
  const [searchQuery, setSearchQuery] = useState('');

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
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-150 bg-white text-neutral-900">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
            Template Gallery
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Choose from our pre-designed templates or build your own from scratch.
          </p>
        </div>

        <button
          onClick={() => onEditTemplate('')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs text-white bg-black hover:bg-neutral-800 active:scale-[0.98] shadow-xs transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create Blank Template</span>
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

        <div className="relative w-full md:w-72">
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

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="bg-white rounded-2xl border border-neutral-200 shadow-card hover:border-black transition-all overflow-hidden flex flex-col justify-between group"
          >
            {/* Visual Preview Thumbnail Box */}
            <div className="p-4 bg-neutral-50 border-b border-neutral-100 flex items-center justify-center">
              <div className="w-full aspect-[1.414/1] rounded-lg border border-neutral-300 bg-white p-6 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden group-hover:scale-[1.01] transition-transform duration-200">
                <p className="text-[9px] font-bold tracking-widest text-neutral-400 uppercase">
                  {template.category}
                </p>
                <h4 className="font-serif font-bold text-sm text-black mt-1 line-clamp-1">
                  {template.name}
                </h4>
                <div className="w-20 h-0.5 bg-black my-2" />
                <p className="text-[10px] text-neutral-500 font-serif italic">
                  Presented to Recipient
                </p>
                <div className="absolute bottom-3 left-3 text-[8px] text-neutral-400 font-mono">
                  QR Verified ID
                </div>
                <div className="absolute bottom-3 right-3 text-[9px] font-signature text-black font-bold">
                  Authorized Signatory
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
                  <span className="text-[11px] text-neutral-400 font-medium">
                    A4 {template.orientation}
                  </span>
                </div>

                <h3 className="font-bold text-base text-black mt-2">{template.name}</h3>
                <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{template.description}</p>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectTemplateToCreate(template.id)}
                  className="flex-1 py-2 px-3 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Use Template</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => onEditTemplate(template.id)}
                  className="p-2 border border-neutral-300 hover:bg-neutral-100 text-black rounded-xl transition-colors"
                  title="Edit in Studio"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onDuplicateTemplate(template)}
                  className="p-2 border border-neutral-300 hover:bg-neutral-100 text-black rounded-xl transition-colors"
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
                    className="p-2 border border-red-200 hover:bg-red-50 text-red-600 rounded-xl transition-colors"
                    title="Delete Custom Template"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

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
                onClick={() => onEditTemplate('')}
                className="mt-4 px-4 py-2 bg-black text-white text-xs font-bold rounded-xl hover:bg-neutral-800 shadow-xs"
              >
                Create Blank Template
              </button>
            ) : (
              <button
                onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
                className="mt-4 px-4 py-2 bg-black text-white text-xs font-bold rounded-xl hover:bg-neutral-800 shadow-xs"
              >
                View All Templates
              </button>
            )}
          </div>
        )}
      </div>

    </div>
  );
};
