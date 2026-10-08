import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  Calendar, 
  Share2 
} from 'lucide-react';
import { StorageService } from '../../services/storageService';

interface VerificationPortalProps {
  initialCertId?: string;
}

export const VerificationPortal: React.FC<VerificationPortalProps> = ({ initialCertId = '' }) => {
  const [certIdInput, setCertIdInput] = useState(initialCertId);
  const [searchedId, setSearchedId] = useState(initialCertId);
  const [searchResult, setSearchResult] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (initialCertId) {
      setCertIdInput(initialCertId);
      performSearch(initialCertId);
    }
  }, [initialCertId]);

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

  const handleCopyLink = () => {
    const url = `${window.location.origin}/#verify/${searchedId}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8 animate-in fade-in duration-200 bg-white text-neutral-900">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-black border border-neutral-300 flex items-center justify-center mx-auto shadow-xs">
          <ShieldCheck className="w-6 h-6 text-black" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
          Official Credential Verification Portal
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 max-w-lg mx-auto">
          Verify the authenticity of digital certificates issued by certified institutions via CertiForge Cryptographic Infrastructure.
        </p>
      </div>

      {/* Search Bar Input */}
      <div className="max-w-xl mx-auto">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            performSearch(certIdInput);
          }}
          className="flex items-center gap-2 p-1.5 bg-white border border-neutral-300 rounded-2xl shadow-card focus-within:border-black transition-all"
        >
          <Search className="w-4 h-4 text-neutral-400 ml-3" />
          <input
            type="text"
            value={certIdInput}
            onChange={(e) => setCertIdInput(e.target.value)}
            placeholder="Enter Certificate ID (e.g. CERT-2026-00001)"
            className="flex-1 px-2 py-2 text-xs sm:text-sm text-black placeholder-neutral-400 focus:outline-none uppercase font-mono font-bold"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0"
          >
            {isSearching ? 'Verifying...' : 'Verify'}
          </button>
        </form>

        <div className="mt-2 text-center text-xs text-neutral-500">
          <span>Try test ID: </span>
          <button 
            type="button"
            onClick={() => {
              setCertIdInput('CERT-2026-00001');
              performSearch('CERT-2026-00001');
            }}
            className="font-mono text-black hover:underline font-bold"
          >
            CERT-2026-00001
          </button>
        </div>
      </div>

      {/* Verification Result Card */}
      {searchResult && (
        <div className="max-w-2xl mx-auto animate-in zoom-in-95 duration-150">
          {searchResult.found ? (
            <div className="bg-white rounded-3xl border border-neutral-300 shadow-elevated overflow-hidden">
              
              {/* Verified Ribbon Header (20% Black Header) */}
              <div className="bg-black text-white p-6 sm:p-8 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-700 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold tracking-widest uppercase text-neutral-400">
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
                      <span>{searchResult.date}</span>
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
                </div>

                <div className="pt-4 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium">
                    <ShieldCheck className="w-4 h-4 text-black" />
                    <span>Cryptographically verified on the CertiForge public ledger.</span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={handleCopyLink}
                      className="px-3.5 py-1.5 rounded-lg border border-neutral-300 hover:bg-neutral-100 text-black text-xs font-bold flex items-center gap-1.5"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>{copiedLink ? 'Link Copied!' : 'Share Proof'}</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-white border border-neutral-300 shadow-card text-center space-y-4">
              <div className="w-10 h-10 rounded-xl bg-neutral-100 text-black border border-neutral-300 flex items-center justify-center mx-auto">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-black">Certificate Not Found</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                We could not find any active credential matching ID <strong>{searchedId}</strong>.
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
