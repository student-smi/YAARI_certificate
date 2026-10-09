import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  Share2, 
  Info,
  CheckCircle2
} from 'lucide-react';

interface LinkedInShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  postCaption: string;
  shareUrl: string;
}

export const LinkedInShareModal: React.FC<LinkedInShareModalProps> = ({
  isOpen,
  onClose,
  postCaption,
  shareUrl
}) => {
  const [copied, setCopied] = useState(true); // default true because we auto-copied on trigger

  if (!isOpen) return null;

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(postCaption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleLaunchLinkedIn = () => {
    navigator.clipboard.writeText(postCaption);
    setCopied(true);
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-elevated border border-neutral-300 overflow-hidden text-neutral-900 animate-in zoom-in-95 duration-150 flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0A66C2] text-white flex items-center justify-center font-bold shadow-xs">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.65 1.65 0 0 0-1.66 1.66 1.66 1.66 0 0 0 1.66-1.66 1.65 1.65 0 0 0-1.66-1.66z"/>
              </svg>
            </div>
            <div>
              <h3 className="font-black text-base text-black flex items-center gap-2">
                <span>Share Certificate on LinkedIn</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700">
                  Ready
                </span>
              </h3>
              <p className="text-xs text-neutral-500">
                Announce your verified credential to your network.
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

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto max-h-[75vh]">
          
          {/* Important explanation why LinkedIn doesn't auto-fill text */}
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-950 space-y-1">
              <p className="font-extrabold">
                Post Caption Copied to Clipboard!
              </p>
              <p className="text-emerald-800 leading-relaxed text-[11px]">
                LinkedIn security policy prevents third-party apps from typing directly into your post box. We have already copied your announcement text — just press <kbd className="px-1.5 py-0.5 bg-white border border-emerald-300 rounded font-mono font-bold text-black">Ctrl + V</kbd> (or Paste) in LinkedIn!
              </p>
            </div>
          </div>

          {/* Caption preview & copy box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-700">
                Announcement Text (ready to paste):
              </label>
              <button
                type="button"
                onClick={handleCopyCaption}
                className="flex items-center gap-1 text-[11px] font-bold text-black hover:underline"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Copy Again</span>
                  </>
                )}
              </button>
            </div>

            <textarea
              readOnly
              rows={6}
              value={postCaption}
              className="w-full p-3 text-xs bg-neutral-50 border border-neutral-300 rounded-xl font-sans text-neutral-800 leading-relaxed focus:outline-none"
            />
          </div>

          {/* 3 Step Instruction Guide */}
          <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-600 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-black">
              <Info className="w-3.5 h-3.5 text-[#0A66C2]" />
              <span>How it works:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 pl-1">
              <li>Click <strong>"Open LinkedIn & Paste (Ctrl+V)"</strong> below.</li>
              <li>When LinkedIn's composer appears, press <kbd className="px-1 bg-white border border-neutral-300 rounded font-mono font-bold">Ctrl + V</kbd>.</li>
              <li>Click <strong>"Post"</strong> to share your verified certificate!</li>
            </ol>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-neutral-200 bg-neutral-50 shrink-0 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold text-neutral-700 hover:text-black bg-white border border-neutral-300 rounded-xl hover:bg-neutral-100 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleLaunchLinkedIn}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 bg-[#0A66C2] hover:bg-[#084e96] text-white font-bold text-xs rounded-xl shadow-xs transition-all hover:scale-[1.02]"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.65 1.65 0 0 0-1.66 1.66 1.66 1.66 0 0 0 1.66 1.66 1.66 1.66 0 0 0 1.66-1.66 1.65 1.65 0 0 0-1.66-1.66z"/>
            </svg>
            <span>Open LinkedIn & Paste (Ctrl+V)</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </button>
        </div>

      </div>
    </div>
  );
};
