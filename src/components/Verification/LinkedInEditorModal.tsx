import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  RotateCcw, 
  Sliders, 
  Sparkles,
  Link as LinkIcon,
  Building2,
  Calendar,
  Award,
  Hash
} from 'lucide-react';
import { generateLinkedInAddCertificationUrl, parseDateForLinkedIn } from '../../services/linkedinService';

export interface LinkedInEditableParams {
  name: string;
  organizationName: string;
  issueYear: string;
  issueMonth: string;
  certId: string;
  certUrl: string;
}

interface LinkedInEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialParams: {
    name: string;
    organizationName: string;
    issueDate?: string;
    issueYear?: string | number;
    issueMonth?: string | number;
    certId: string;
    certUrl: string;
  };
  onSave?: (updatedParams: LinkedInEditableParams) => void;
}

const MONTH_OPTIONS = [
  { value: '1', label: '01 - January' },
  { value: '2', label: '02 - February' },
  { value: '3', label: '03 - March' },
  { value: '4', label: '04 - April' },
  { value: '5', label: '05 - May' },
  { value: '6', label: '06 - June' },
  { value: '7', label: '07 - July' },
  { value: '8', label: '08 - August' },
  { value: '9', label: '09 - September' },
  { value: '10', label: '10 - October' },
  { value: '11', label: '11 - November' },
  { value: '12', label: '12 - December' }
];

export const LinkedInEditorModal: React.FC<LinkedInEditorModalProps> = ({
  isOpen,
  onClose,
  initialParams,
  onSave
}) => {
  // Parse defaults
  const parsedDate = parseDateForLinkedIn(initialParams.issueDate);
  const defaultYear = (initialParams.issueYear || parsedDate.year || new Date().getFullYear()).toString();
  const defaultMonth = (initialParams.issueMonth || parsedDate.month || (new Date().getMonth() + 1)).toString();

  const [formData, setFormData] = useState<LinkedInEditableParams>({
    name: initialParams.name || '',
    organizationName: initialParams.organizationName || '',
    issueYear: defaultYear,
    issueMonth: defaultMonth,
    certId: initialParams.certId || '',
    certUrl: initialParams.certUrl || ''
  });

  const [copiedUrl, setCopiedUrl] = useState(false);

  if (!isOpen) return null;

  // Real-time live generated LinkedIn Deep Link
  const liveLinkedInUrl = generateLinkedInAddCertificationUrl({
    name: formData.name,
    organizationName: formData.organizationName,
    issueYear: formData.issueYear,
    issueMonth: formData.issueMonth,
    certId: formData.certId,
    certUrl: formData.certUrl
  });

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(liveLinkedInUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleReset = () => {
    setFormData({
      name: initialParams.name || '',
      organizationName: initialParams.organizationName || '',
      issueYear: defaultYear,
      issueMonth: defaultMonth,
      certId: initialParams.certId || '',
      certUrl: initialParams.certUrl || ''
    });
  };

  const handleSaveAndLaunch = () => {
    if (onSave) {
      onSave(formData);
    }
    window.open(liveLinkedInUrl, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-elevated border border-neutral-300 overflow-hidden text-neutral-900 animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-neutral-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0A66C2] text-white flex items-center justify-center font-bold shadow-xs">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.65 1.65 0 0 0-1.66 1.66 1.66 1.66 0 0 0 1.66 1.66 1.66 1.66 0 0 0 1.66-1.66 1.65 1.65 0 0 0-1.66-1.66z"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base text-black">Customize LinkedIn Certification Link</h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-neutral-100 border border-neutral-300 text-neutral-700">
                  Live Editor
                </span>
              </div>
              <p className="text-xs text-neutral-500">
                Modify any certification parameter before opening or sharing LinkedIn's Add to Profile link.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* 1. Certification / Course Name */}
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-black flex items-center gap-1.5 mb-1.5">
                <Award className="w-3.5 h-3.5 text-neutral-500" />
                <span>Certification / Course Name (name)</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. AI ML Development"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black font-semibold text-black transition-colors"
              />
              <span className="text-[10px] text-neutral-400 mt-1 block">
                This appears as the main title on the student's LinkedIn profile.
              </span>
            </div>

            {/* 2. Issuing Organization */}
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-black flex items-center gap-1.5 mb-1.5">
                <Building2 className="w-3.5 h-3.5 text-neutral-500" />
                <span>Issuing Organization Name (organizationName)</span>
              </label>
              <input
                type="text"
                value={formData.organizationName}
                onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                placeholder="e.g. Global Leadership Institute"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black font-semibold text-black transition-colors"
              />
              <span className="text-[10px] text-neutral-400 mt-1 block">
                The institution or company conferring this credential.
              </span>
            </div>

            {/* 3. Issue Year */}
            <div>
              <label className="text-xs font-bold text-black flex items-center gap-1.5 mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                <span>Issue Year (issueYear)</span>
              </label>
              <input
                type="number"
                min="1990"
                max="2050"
                value={formData.issueYear}
                onChange={(e) => setFormData({ ...formData, issueYear: e.target.value })}
                placeholder="e.g. 2026"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black font-semibold text-black transition-colors"
              />
            </div>

            {/* 4. Issue Month */}
            <div>
              <label className="text-xs font-bold text-black flex items-center gap-1.5 mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                <span>Issue Month (issueMonth)</span>
              </label>
              <select
                value={formData.issueMonth}
                onChange={(e) => setFormData({ ...formData, issueMonth: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black font-semibold text-black transition-colors cursor-pointer"
              >
                {MONTH_OPTIONS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 5. Credential ID */}
            <div>
              <label className="text-xs font-bold text-black flex items-center gap-1.5 mb-1.5">
                <Hash className="w-3.5 h-3.5 text-neutral-500" />
                <span>Credential ID (certId)</span>
              </label>
              <input
                type="text"
                value={formData.certId}
                onChange={(e) => setFormData({ ...formData, certId: e.target.value })}
                placeholder="e.g. CERT-2026-00001"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black font-mono font-bold text-black transition-colors"
              />
            </div>

            {/* 6. Credential URL */}
            <div>
              <label className="text-xs font-bold text-black flex items-center gap-1.5 mb-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-neutral-500" />
                <span>Verification Link (certUrl)</span>
              </label>
              <input
                type="text"
                value={formData.certUrl}
                onChange={(e) => setFormData({ ...formData, certUrl: e.target.value })}
                placeholder="e.g. https://certiforge.pages.dev/#verify/CERT-2026-00001"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-black font-mono font-semibold text-black transition-colors"
              />
            </div>

          </div>

          {/* Live Generated URL Box */}
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-300 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase text-neutral-700 tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-neutral-600" />
                <span>Live Generated LinkedIn Deep Link:</span>
              </span>
              <button
                type="button"
                onClick={handleCopyUrl}
                className="flex items-center gap-1 text-[11px] font-bold text-black hover:underline"
              >
                {copiedUrl ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy URL</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-neutral-200 font-mono text-[11px] text-neutral-700 break-all select-all leading-relaxed">
              {liveLinkedInUrl}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-neutral-200 bg-neutral-50 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-neutral-600 hover:text-black hover:bg-neutral-200/60 rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 text-xs font-bold text-neutral-700 hover:text-black bg-white border border-neutral-300 rounded-xl hover:bg-neutral-100 transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSaveAndLaunch}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0A66C2] hover:bg-[#084e96] text-white font-bold text-xs rounded-xl shadow-xs transition-all hover:scale-[1.02]"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.65 1.65 0 0 0-1.66 1.66 1.66 1.66 0 0 0 1.66 1.66 1.66 1.66 0 0 0 1.66-1.66 1.65 1.65 0 0 0-1.66-1.66z"/>
              </svg>
              <span>Add to LinkedIn (1-Click)</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
