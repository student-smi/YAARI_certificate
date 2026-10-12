import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  Calendar, 
  Share2, 
  Download, 
  Copy, 
  Check, 
  ExternalLink,
  Award,
  Sparkles,
  Sliders,
  RotateCcw
} from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { 
  generateLinkedInAddCertificationUrl, 
  generateLinkedInShareFeedUrl, 
  generateLinkedInPostText,
  parseDateForLinkedIn
} from '../../services/linkedinService';
import { generateCertificatePdfBlob } from '../../services/pdfGenerator';
import { DEFAULT_TEMPLATES } from '../../data/defaultTemplates';
import { LinkedInEditorModal, LinkedInEditableParams } from './LinkedInEditorModal';
import { LinkedInShareModal } from './LinkedInShareModal';

interface VerificationPortalProps {
  initialCertId?: string;
}

export const VerificationPortal: React.FC<VerificationPortalProps> = ({ initialCertId = '' }) => {
  const [certIdInput, setCertIdInput] = useState(initialCertId);
  const [searchedId, setSearchedId] = useState(initialCertId);
  const [searchResult, setSearchResult] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPostText, setCopiedPostText] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // Editable LinkedIn parameters modal state
  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
  const [customLinkedInParams, setCustomLinkedInParams] = useState<LinkedInEditableParams | null>(null);

  // Guided Share to LinkedIn Feed modal state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    if (initialCertId) {
      setCertIdInput(initialCertId);
      performSearch(initialCertId);
    }
  }, [initialCertId]);

  // Reset custom params if a new ID is searched
  useEffect(() => {
    setCustomLinkedInParams(null);
  }, [searchedId]);

  const performSearch = async (idToSearch: string) => {
    if (!idToSearch.trim()) return;
    setIsSearching(true);
    setSearchedId(idToSearch.trim());

    try {
      const result = await StorageService.verifyCertificate(idToSearch.trim());
      setSearchResult(result);
    } catch {
      const fallback = StorageService.findCertificateById(idToSearch.trim());
      setSearchResult(fallback);
    } finally {
      setIsSearching(false);
    }
  };

  const getVerificationUrl = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://certiforge.pages.dev';
    return `${origin}/verify/${searchedId}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getVerificationUrl());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Active LinkedIn parameters (custom edits take precedence)
  const activeLinkedInName = customLinkedInParams?.name || searchResult?.courseName || 'Certified Program';
  const activeLinkedInOrg = customLinkedInParams?.organizationName || searchResult?.organization || 'Issuing Institution';
  const activeLinkedInYear = customLinkedInParams?.issueYear;
  const activeLinkedInMonth = customLinkedInParams?.issueMonth;
  const activeLinkedInCertId = customLinkedInParams?.certId || searchResult?.certificateId || searchedId;
  const activeLinkedInCertUrl = customLinkedInParams?.certUrl || getVerificationUrl();

  const currentPostText = searchResult
    ? generateLinkedInPostText({
        recipientName: searchResult.recipientName || 'Recipient',
        courseName: activeLinkedInName,
        organizationName: activeLinkedInOrg,
        certId: activeLinkedInCertId,
        verifyUrl: activeLinkedInCertUrl
      })
    : '';

  const handleCopyPostTemplate = () => {
    if (!currentPostText) return;
    navigator.clipboard.writeText(currentPostText);
    setCopiedPostText(true);
    setTimeout(() => setCopiedPostText(false), 2500);
  };

  const handleDownloadPdf = async () => {
    if (!searchResult) return;
    setIsDownloadingPdf(true);

    try {
      const template = searchResult.project?.template || DEFAULT_TEMPLATES[0];
      const recipientData: Record<string, string> = {
        name: searchResult.recipientName || 'Recipient',
        'Full Name': searchResult.recipientName || 'Recipient',
        course: activeLinkedInName,
        'Course Name': activeLinkedInName,
        issue_date: searchResult.issueDate || searchResult.date || 'October 15, 2026',
        completion_date: searchResult.completionDate || searchResult.date || 'October 15, 2026',
        organization: activeLinkedInOrg,
        certificate_id: activeLinkedInCertId,
        student_id: searchResult.studentId || '',
        grade: searchResult.grade || '',
        achievement_level: searchResult.achievementLevel || '',
        course_duration: searchResult.duration || '',
        learning_mode: searchResult.learningMode || ''
      };

      const blob = await generateCertificatePdfBlob({
        template,
        recipientData,
        certificateId: activeLinkedInCertId,
        fieldMapping: searchResult.project?.fieldMapping || {}
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const cleanRecName = (searchResult.recipientName || 'certificate').replace(/[^a-zA-Z0-9_-]/g, '_');
      a.download = `${activeLinkedInCertId}_${cleanRecName}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download PDF:', err);
      alert('Could not render certificate PDF. Please try again.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Pre-calculated LinkedIn URLs using active values
  const linkedInAddUrl = searchResult?.found
    ? generateLinkedInAddCertificationUrl({
        name: activeLinkedInName,
        organizationName: activeLinkedInOrg,
        issueDate: searchResult.issueDate || searchResult.date,
        issueYear: activeLinkedInYear,
        issueMonth: activeLinkedInMonth,
        certId: activeLinkedInCertId,
        certUrl: activeLinkedInCertUrl
      })
    : '';

  const linkedInShareFeedUrl = searchResult?.found
    ? generateLinkedInShareFeedUrl(activeLinkedInCertUrl)
    : '';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8 animate-in fade-in duration-200 bg-white text-neutral-900">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 border border-teal-200/80 flex items-center justify-center mx-auto shadow-xs">
          <ShieldCheck className="w-6 h-6 text-teal-600" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
          Official Credential Verification Portal
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
          Verify the authenticity of digital certificates issued by certified institutions via CertiCraft Cryptographic Infrastructure.
        </p>
      </div>

      {/* Search Bar Input */}
      <div className="max-w-xl mx-auto">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            performSearch(certIdInput);
          }}
          className="flex items-center gap-2 p-1.5 bg-white border border-slate-300 rounded-2xl shadow-card focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 transition-all"
        >
          <Search className="w-4 h-4 text-slate-400 ml-3" />
          <input
            type="text"
            value={certIdInput}
            onChange={(e) => setCertIdInput(e.target.value)}
            placeholder="Enter Certificate ID (e.g. CERT-2026-00001)"
            className="flex-1 px-2 py-2 text-xs sm:text-sm text-slate-950 placeholder-slate-400 focus:outline-none uppercase font-mono font-bold"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs rounded-xl shadow-xs shadow-teal-500/25 transition-all cursor-pointer shrink-0 active:scale-[0.98]"
          >
            {isSearching ? 'Verifying...' : 'Verify'}
          </button>
        </form>

        <div className="mt-2 text-center text-xs text-slate-500">
          <span>Try test ID: </span>
          <button 
            type="button"
            onClick={() => {
              setCertIdInput('CERT-2026-00001');
              performSearch('CERT-2026-00001');
            }}
            className="font-mono text-teal-700 hover:text-teal-800 hover:underline font-bold"
          >
            CERT-2026-00001
          </button>
        </div>
      </div>

      {/* Verification Result Card */}
      {searchResult && (
        <div className="max-w-3xl mx-auto animate-in zoom-in-95 duration-150 space-y-6">
          {searchResult.found ? (
            <div className="bg-white rounded-3xl border border-slate-300 shadow-elevated overflow-hidden">
              
              {/* Verified Ribbon Header (Deep Navy Header with Teal Badge) */}
              <div className="bg-slate-950 text-white p-6 sm:p-8 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-teal-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-teal-500/25">
                    <CheckCircle2 className="w-6 h-6 text-white stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold tracking-widest uppercase text-teal-400">
                      CRYPTOGRAPHIC SEAL CONFIRMED
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      VERIFIED AUTHENTIC
                    </h2>
                  </div>
                </div>

                <div className="hidden sm:block text-right">
                  <span className="text-[10px] uppercase text-neutral-400 block font-semibold">Status</span>
                  <span className="text-xs font-bold bg-white text-black px-2.5 py-0.5 rounded-md">
                    Active & Valid
                  </span>
                </div>
              </div>

              {/* Certificate Details Body (80% Pure White) */}
              <div className="p-6 sm:p-8 space-y-6">
                
                <div className="border-b border-neutral-100 pb-5">
                  <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                    Conferred Recipient
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-black text-black mt-1">
                    {searchResult.recipientName}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                  <div>
                    <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                      Course / Program
                    </p>
                    <p className="font-bold text-black text-sm mt-1">
                      {searchResult.courseName}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                      Issuing Organization
                    </p>
                    <p className="font-bold text-black text-sm mt-1 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-black shrink-0" />
                      <span>{searchResult.organization}</span>
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                      Issue Date
                    </p>
                    <p className="font-bold text-black text-sm mt-1 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-neutral-500 shrink-0" />
                      <span>{searchResult.issueDate || searchResult.date}</span>
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                      Completion Date
                    </p>
                    <p className="font-bold text-black text-sm mt-1 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-neutral-500 shrink-0" />
                      <span>{searchResult.completionDate || 'Course Completed'}</span>
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                      Certificate ID
                    </p>
                    <p className="font-mono font-bold text-black text-sm mt-1">
                      {searchResult.certificateId}
                    </p>
                  </div>

                  {searchResult.studentId && (
                    <div>
                      <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                        Student ID / Enrollment
                      </p>
                      <p className="font-mono font-bold text-black text-sm mt-1">
                        {searchResult.studentId}
                      </p>
                    </div>
                  )}

                  {searchResult.grade && (
                    <div>
                      <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                        Grade & Achievement Level
                      </p>
                      <p className="font-bold text-black text-sm mt-1">
                        {searchResult.grade} {searchResult.achievementLevel ? `(${searchResult.achievementLevel})` : ''}
                      </p>
                    </div>
                  )}

                  {searchResult.duration && (
                    <div>
                      <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                        Course Duration & Mode
                      </p>
                      <p className="font-bold text-black text-sm mt-1">
                        {searchResult.duration} {searchResult.learningMode ? `• ${searchResult.learningMode}` : ''}
                      </p>
                    </div>
                  )}
                </div>

                {/* 🎖️ OFFICIAL LINKEDIN "ADD TO PROFILE" & VIRAL SHARING SECTION */}
                <div className="mt-8 p-5 sm:p-6 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-200 pb-3">
                    <div className="flex items-center gap-2">
                      {/* Official LinkedIn In Logo */}
                      <div className="w-7 h-7 rounded-lg bg-[#0A66C2] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.65 1.65 0 0 0-1.66 1.66 1.66 1.66 0 0 0 1.66 1.66 1.66 1.66 0 0 0 1.66-1.66 1.65 1.65 0 0 0-1.66-1.66z"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-black">Official LinkedIn 1-Click Verification</h4>
                        <p className="text-[11px] text-neutral-500">Add directly to your LinkedIn "Licenses & Certifications" in 1 click.</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-[#E8F3FD] text-[#0A66C2] px-2.5 py-1 rounded-md border border-[#B2D5F8] self-start sm:self-auto">
                      Official Partner Protocol
                    </span>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Primary Button: Add to LinkedIn Profile */}
                    <a
                      href={linkedInAddUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0A66C2] hover:bg-[#084e96] text-white font-bold text-xs rounded-xl shadow-xs transition-all hover:scale-[1.02]"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.65 1.65 0 0 0-1.66 1.66 1.66 1.66 0 0 0 1.66 1.66 1.66 1.66 0 0 0 1.66-1.66 1.65 1.65 0 0 0-1.66-1.66z"/>
                      </svg>
                      <span>Add to LinkedIn Profile</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                    </a>

                    {/* Customize Parameters Button */}
                    <button
                      type="button"
                      onClick={() => setIsEditorModalOpen(true)}
                      className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-neutral-100 border border-neutral-300 text-black font-bold text-xs rounded-xl shadow-xs transition-colors"
                      title="Edit certification name, organization, year, month, ID, or URL"
                    >
                      <Sliders className="w-3.5 h-3.5 text-neutral-600" />
                      <span>{customLinkedInParams ? 'Parameters (Customized)' : 'Customize Parameters'}</span>
                    </button>

                    {/* Secondary Button: Share to LinkedIn Feed */}
                    <button
                      type="button"
                      onClick={() => {
                        handleCopyPostTemplate();
                        setIsShareModalOpen(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-neutral-100 border border-neutral-300 text-black font-bold text-xs rounded-xl shadow-xs transition-colors"
                      title="Share your verified certificate on LinkedIn Feed"
                    >
                      <Share2 className="w-3.5 h-3.5 text-black" />
                      <span>Share on Feed</span>
                    </button>

                    {/* Copy Post Copy Template */}
                    <button
                      type="button"
                      onClick={handleCopyPostTemplate}
                      className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-neutral-100 border border-neutral-300 text-neutral-700 hover:text-black font-medium text-xs rounded-xl shadow-xs transition-colors"
                      title="Copy viral post caption with certificate details & hashtags"
                    >
                      {copiedPostText ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">Copied Caption!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-neutral-500" />
                          <span>Copy Post Caption</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Active Custom Overrides Notice */}
                  {customLinkedInParams && (
                    <div className="flex items-center justify-between text-xs px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>
                          Customized LinkedIn URL active: <strong>{activeLinkedInName}</strong> ({activeLinkedInOrg})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCustomLinkedInParams(null)}
                        className="text-amber-800 hover:text-black font-bold flex items-center gap-1 text-[11px] hover:underline shrink-0"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset Defaults</span>
                      </button>
                    </div>
                  )}

                  {/* LinkedIn Profile Preview Card (Simulates how it appears on recipient's profile) */}
                  <div className="p-3.5 rounded-xl bg-white border border-neutral-200 text-xs space-y-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
                      LinkedIn Profile Display Preview:
                    </span>
                    <div className="flex items-start gap-3 pt-1">
                      <div className="w-9 h-9 rounded bg-neutral-100 border border-neutral-300 flex items-center justify-center shrink-0">
                        <Award className="w-5 h-5 text-neutral-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-black text-xs truncate">
                          {activeLinkedInName}
                        </p>
                        <p className="text-[11px] text-neutral-600 truncate">
                          {activeLinkedInOrg}
                        </p>
                        <p className="text-[10px] text-neutral-400">
                          Issued {activeLinkedInMonth ? `${activeLinkedInMonth}/` : ''}{activeLinkedInYear || searchResult.issueDate || searchResult.date} • Credential ID: {activeLinkedInCertId}
                        </p>
                      </div>
                      <a
                        href={activeLinkedInCertUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-md border border-neutral-300 text-[10px] font-bold text-neutral-700 hover:text-black shrink-0 flex items-center gap-1"
                      >
                        <span>Show credential</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Bottom Bar: Download Certified PDF & Copy Verification Link */}
                <div className="pt-4 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium">
                    <ShieldCheck className="w-4 h-4 text-black shrink-0" />
                    <span>Cryptographically verified on the CertiForge public ledger.</span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {/* High-Res PDF Download Button */}
                    <button
                      onClick={handleDownloadPdf}
                      disabled={isDownloadingPdf}
                      className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isDownloadingPdf ? 'Generating PDF...' : 'Download Verified PDF'}</span>
                    </button>

                    {/* Copy Link */}
                    <button
                      onClick={handleCopyLink}
                      className="px-3.5 py-2 rounded-xl border border-neutral-300 hover:bg-neutral-100 text-black text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
                    >
                      {copiedLink ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-black" />
                          <span>Link Copied!</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Share Proof</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-white border border-neutral-300 shadow-card text-center space-y-4">
              <div className="w-10 h-10 rounded-xl bg-neutral-100 text-black border border-neutral-300 flex items-center justify-center mx-auto">
                <AlertCircle className="w-5 h-5 text-neutral-600" />
              </div>
              <h3 className="text-base font-bold text-black">Certificate Not Found</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                We could not find any active credential matching ID <strong>{searchedId}</strong>. Please confirm the identifier from your certificate document or issuer confirmation.
              </p>
            </div>
          )}
        </div>
      )}

      {/* LinkedIn Deep Link Customizer Modal */}
      {searchResult?.found && (
        <LinkedInEditorModal
          isOpen={isEditorModalOpen}
          onClose={() => setIsEditorModalOpen(false)}
          initialParams={{
            name: activeLinkedInName,
            organizationName: activeLinkedInOrg,
            issueDate: searchResult.issueDate || searchResult.date,
            issueYear: activeLinkedInYear,
            issueMonth: activeLinkedInMonth,
            certId: activeLinkedInCertId,
            certUrl: activeLinkedInCertUrl
          }}
          onSave={(updatedParams) => {
            setCustomLinkedInParams(updatedParams);
          }}
        />
      )}

      {/* Guided LinkedIn Share to Feed Modal */}
      {searchResult?.found && (
        <LinkedInShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          postCaption={currentPostText}
          shareUrl={linkedInShareFeedUrl}
        />
      )}

    </div>
  );
};
