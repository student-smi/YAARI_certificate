import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Copy, 
  Edit3, 
  ArrowRight 
} from 'lucide-react';
import { Template } from '../../types';

interface TemplateLibraryProps {
  templates: Template[];
  onSelectTemplateToCreate: (templateId: string) => void;
  onEditTemplate: (templateId: string) => void;
  onDuplicateTemplate: (template: Template) => void;
}

export const TemplateLibrary: React.FC<TemplateLibraryProps> = ({
  templates,
  onSelectTemplateToCreate,
  onEditTemplate,
  onDuplicateTemplate
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', label: 'All Templates' },
    { id: 'corporate', label: 'Corporate' },
    { id: 'academic', label: 'Academic & Diploma' },
    { id: 'workshop', label: 'Bootcamp & Tech' },
    { id: 'appreciation', label: 'Appreciation & Honors' },
    { id: 'course', label: 'Online Course' },
  ];

  const filteredTemplates = templates.filter(t => {
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
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
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-black bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded">
                    {template.category}
                  </span>
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
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
