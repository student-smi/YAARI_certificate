import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck, 
  Sparkles, 
  ExternalLink,
  Layers,
  Info,
  Maximize2
} from 'lucide-react';
import { SAMPLE_CERTIFICATES, SampleCertificate } from './sampleCertificatesData';
import { CertificateItem } from './CertificateItem';

interface CertificateShowcaseProps {
  onVerifyDemo?: () => void;
  onExploreTemplates?: () => void;
  onStartCreating?: () => void;
}

export const CertificateShowcase: React.FC<CertificateShowcaseProps> = ({
  onVerifyDemo,
  onExploreTemplates,
  onStartCreating
}) => {
  // State: selected certificate index (0-9, defaults to 0: Certificate of Completion)
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  
  // Refs for thumbnail strip and items
  const thumbnailStripRef = useRef<HTMLDivElement>(null);
  const thumbnailRefs = useRef<(HTMLDivElement | null)[]>([]);

  const currentCert = SAMPLE_CERTIFICATES[selectedIndex] || SAMPLE_CERTIFICATES[0];
  const totalCerts = SAMPLE_CERTIFICATES.length;

  // Handle switching certificates with smooth fade transition
  const handleSelectCertificate = useCallback((index: number) => {
    if (index === selectedIndex) return;
    setIsTransitioning(true);
    setSelectedIndex(index);
    setTimeout(() => {
      setIsTransitioning(false);
    }, 200);
  }, [selectedIndex]);

  const handlePrev = useCallback(() => {
    const nextIdx = (selectedIndex - 1 + totalCerts) % totalCerts;
    handleSelectCertificate(nextIdx);
  }, [selectedIndex, totalCerts, handleSelectCertificate]);

  const handleNext = useCallback(() => {
    const nextIdx = (selectedIndex + 1) % totalCerts;
    handleSelectCertificate(nextIdx);
  }, [selectedIndex, totalCerts, handleSelectCertificate]);

  // Automatically scroll thumbnail strip to keep selected thumbnail in view
  useEffect(() => {
    const activeThumb = thumbnailRefs.current[selectedIndex];
    if (activeThumb && thumbnailStripRef.current) {
      activeThumb.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [selectedIndex]);

  // Keyboard navigation support: Left / Right arrows
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleNext();
    }
  };

  // Live QR Code Verification Click Handler
  const handleVerifyCert = (certId: string) => {
    // Set hash so App.tsx loads VerificationPortal with this certificate ID
    window.location.hash = `#verify/${certId}`;
    if (onVerifyDemo) {
      onVerifyDemo();
    }
  };

  return (
    <section 
      className="mt-6 max-w-4xl mx-auto px-2 sm:px-4 focus:outline-hidden"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label="Certificate designs showcase. Use left and right arrow keys to browse."
    >
      {/* Container with CertiCraft's Signature Deep Navy and Teal Website Branding */}
      <div className="p-2.5 sm:p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        
        {/* Subtle background ambient teal & indigo glow */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* 1. TOP CONTROL BAR */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 px-1 sm:px-2 py-1.5 border-b border-slate-800/80 pb-2.5">
          
          {/* Showcase Label & Badge */}
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-[11px] font-bold">
              <Sparkles className="w-3 h-3 text-teal-400" />
              <span>Sample certificate designs</span>
            </span>
            <span className="hidden md:inline-flex items-center gap-1 text-slate-400 text-[11px]">
              <Info className="w-3 h-3 text-slate-500" />
              <span>Click or use arrows to inspect 10 authentic academy designs</span>
            </span>
          </div>

          {/* Stepper counter & Navigation buttons */}
          <div className="flex items-center gap-2 ml-auto">
            {/* 1 of 10 Indicator */}
            <span 
              className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg bg-slate-800/90 border border-slate-700 text-teal-300 tracking-wider"
              aria-live="polite"
            >
              {selectedIndex + 1} of {totalCerts}
            </span>

            {/* Previous Button */}
            <button
              type="button"
              onClick={handlePrev}
              className="p-1 sm:p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 hover:text-white border border-slate-700/80 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-500"
              aria-label="Previous certificate design"
              title="Previous design (Left Arrow)"
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Next Button */}
            <button
              type="button"
              onClick={handleNext}
              className="p-1 sm:p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 hover:text-white border border-slate-700/80 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-500"
              aria-label="Next certificate design"
              title="Next design (Right Arrow)"
            >
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        {/* 2. MAIN PREVIEW STAGE (Ultra-Compact, perfectly visible on 100% of screens) */}
        <div className="relative my-2.5 sm:my-3 rounded-2xl bg-slate-950 border border-slate-800/80 shadow-inner flex items-center justify-center p-2 sm:p-2.5 md:p-3 min-h-[250px] sm:min-h-[290px] md:min-h-[330px] lg:min-h-[360px] overflow-hidden">
          
          {/* Subtle stage grid pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

          {/* Floating Live Verification Status Tag */}
          <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-20 flex items-center gap-1.5 bg-slate-900/90 border border-teal-500/30 text-teal-300 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold backdrop-blur-md shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            <ShieldCheck className="w-3 h-3 text-teal-400" />
            <span className="hidden sm:inline">Cryptographic QR Ready</span>
            <span className="sm:hidden">QR Ready</span>
          </div>

          {/* Orientation indicator badge */}
          <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 z-20 hidden sm:flex items-center gap-1 bg-slate-900/80 border border-slate-700 text-slate-300 px-2 py-0.5 rounded-md text-[10px] font-mono">
            <Layers className="w-2.5 h-2.5 text-slate-400" />
            <span>Format: {currentCert.orientation === 'portrait' ? 'A4 Portrait' : 'A4 Landscape'}</span>
          </div>

          {/* Rendered Certificate with smooth fade transition */}
          <div
            className={`w-full flex items-center justify-center transition-opacity duration-200 motion-safe:transition-opacity ${
              isTransitioning ? 'opacity-30' : 'opacity-100'
            }`}
          >
            <CertificateItem
              cert={currentCert}
              mode="full"
              onVerifyClick={handleVerifyCert}
            />
          </div>

          {/* Subtle Disclaimer Pill at bottom of preview stage */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[8.5px] sm:text-[9.5px] text-slate-400 bg-slate-950/80 px-2.5 py-0.2 rounded-full border border-slate-800 text-center pointer-events-none">
            Sample certificate designs • Fictional institutes and recipients for demonstration
          </div>
        </div>

        {/* 3. THUMBNAIL SLIDER STRIP (Exactly 10 Thumbnails) */}
        <div className="relative pt-2">
          
          {/* Header row above thumbnails */}
          <div className="flex items-center justify-between px-1 mb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Select Design Template
              </span>
              <span className="text-[11px] text-teal-400 font-mono font-medium">
                ({selectedIndex + 1} of 10 selected)
              </span>
            </div>
            <div className="text-[11px] text-slate-400 hidden sm:block">
              Swipe or scroll horizontally to browse all 10 designs →
            </div>
          </div>

          {/* Scrollable Thumbnail Strip with Touch Swiping and Snap Points */}
          <div
            ref={thumbnailStripRef}
            className="flex items-start gap-3 sm:gap-4 overflow-x-auto pb-4 pt-1 px-1 scroll-smooth snap-x snap-mandatory touch-pan-x [scrollbar-width:thin] [scrollbar-color:#334155_transparent]"
            style={{
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {SAMPLE_CERTIFICATES.map((cert, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={cert.id}
                  ref={(el) => {
                    thumbnailRefs.current[index] = el;
                  }}
                  className="shrink-0 snap-center"
                >
                  <CertificateItem
                    cert={cert}
                    mode="thumbnail"
                    isSelected={isSelected}
                    onClick={() => handleSelectCertificate(index)}
                  />
                </div>
              );
            })}
          </div>

        </div>

        {/* 4. FOOTER INTERACTIVE ACTIONS BAR */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span>High-precision vector typography: <strong>100% sharp PDF & print ready</strong></span>
          </div>

          <div className="flex items-center gap-3">
            {onVerifyDemo && (
              <button
                type="button"
                onClick={() => handleVerifyCert(currentCert.certNumber)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 hover:text-teal-200 border border-teal-500/30 transition-all font-semibold cursor-pointer"
              >
                <span>Test Live QR Verification</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}

            {onExploreTemplates && (
              <button
                type="button"
                onClick={onExploreTemplates}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-600 text-white font-bold transition-all shadow-xs cursor-pointer"
              >
                <span>Customize in Studio</span>
                <Maximize2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

      </div>
    </section>
  );
};
