import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck, 
  Sparkles, 
  ExternalLink,
  Layers,
  Maximize2,
  ArrowRightLeft
} from 'lucide-react';
import { SAMPLE_CERTIFICATES } from './sampleCertificatesData';
import { CertificateItem } from './CertificateItem';

interface CertificateShowcaseProps {
  onVerifyDemo?: () => void;
  onExploreTemplates?: () => void;
  onStartCreating?: () => void;
}

export const CertificateShowcase: React.FC<CertificateShowcaseProps> = ({
  onVerifyDemo,
  onExploreTemplates
}) => {
  // State: selected certificate index (0-9, defaults to 0: Certificate of Completion)
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [scrollDirection, setScrollDirection] = useState<'l2r' | 'r2l'>('l2r'); // Default Left-to-Right

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

  // Auto-cycle top preview every 4.5s (pauses on hover or when manually paused)
  useEffect(() => {
    if (isPaused || isHovered) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setSelectedIndex((prev) => (prev + 1) % totalCerts);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 200);
    }, 4500);

    return () => clearInterval(interval);
  }, [isPaused, isHovered, totalCerts]);

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
    window.location.hash = `#verify/${certId}`;
    if (onVerifyDemo) {
      onVerifyDemo();
    }
  };

  return (
    <section 
      className="mt-4 sm:mt-6 max-w-4xl lg:max-w-5xl mx-auto px-2 sm:px-4 focus:outline-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label="Certificate designs showcase. Infinite auto-scrolling templates."
    >
      {/* Container with CertiCraft's Signature Deep Navy and Teal Website Branding */}
      <div className="p-3 sm:p-4 md:p-5 rounded-2xl sm:rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        
        {/* Subtle background ambient teal & indigo glow */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* 1. TOP CONTROL BAR */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-1 py-1 border-b border-slate-800/80 pb-2.5">
          
          {/* Showcase Label & Badge */}
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>Sample certificate designs</span>
            </span>
            <button
              type="button"
              onClick={() => setIsPaused((prev) => !prev)}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/90 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-[11px] font-medium text-slate-300 transition-colors cursor-pointer"
              title={isPaused ? "Auto-scroll paused. Click to resume." : "Infinite auto-scroll active. Click to pause."}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isPaused || isHovered ? 'bg-amber-400' : 'bg-teal-400 animate-pulse'}`} />
              <span>{isPaused ? 'Paused (Click to play)' : isHovered ? 'Paused on hover' : 'Infinite auto-scroll active'}</span>
            </button>
          </div>

          {/* Stepper counter & Navigation buttons */}
          <div className="flex items-center gap-1.5 ml-auto">
            {/* 1 of 10 Indicator */}
            <span 
              className="text-xs font-mono font-bold px-2 py-1 rounded-lg bg-slate-800/90 border border-slate-700 text-teal-300 tracking-wider"
              aria-live="polite"
            >
              {selectedIndex + 1} of {totalCerts}
            </span>

            {/* Previous Button */}
            <button
              type="button"
              onClick={handlePrev}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 hover:text-white border border-slate-700/80 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-500"
              aria-label="Previous certificate design"
              title="Previous design (Left Arrow)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Next Button */}
            <button
              type="button"
              onClick={handleNext}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 hover:text-white border border-slate-700/80 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-500"
              aria-label="Next certificate design"
              title="Next design (Right Arrow)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Auto-showcase Progress Line */}
        <div className="h-0.5 w-full bg-slate-800/60 overflow-hidden rounded-full mb-1">
          <div 
            key={selectedIndex}
            className={`h-full bg-gradient-to-r from-teal-500 to-emerald-400 ${
              isPaused || isHovered ? 'w-full opacity-30' : 'animate-showcase-progress'
            }`}
          />
        </div>

        {/* 2. MAIN PREVIEW STAGE (Proportioned for seamless laptop & desktop fit) */}
        <div className="relative my-2 sm:my-2.5 rounded-xl sm:rounded-2xl bg-slate-950 border border-slate-800/80 shadow-inner flex items-center justify-center p-2 sm:p-3 md:p-3.5 min-h-[220px] sm:min-h-[250px] md:min-h-[280px] lg:min-h-[305px] overflow-hidden">
          
          {/* Subtle stage grid pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

          {/* Floating Live Verification Status Tag */}
          <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-20 flex items-center gap-1.5 bg-slate-900/90 border border-teal-500/30 text-teal-300 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10.5px] sm:text-xs font-semibold backdrop-blur-md shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            <ShieldCheck className="w-3 h-3 text-teal-400" />
            <span className="hidden sm:inline">Cryptographic QR Ready</span>
            <span className="sm:hidden">QR Ready</span>
          </div>

          {/* Orientation indicator badge */}
          <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 z-20 hidden sm:flex items-center gap-1.5 bg-slate-900/80 border border-slate-700 text-slate-300 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[10.5px] font-mono">
            <Layers className="w-3 h-3 text-slate-400" />
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

        {/* 3. INFINITE MARQUEE TEMPLATE STRIP (Left-to-Right Continuous Auto-Scroll) */}
        <div className="relative pt-1.5 sm:pt-2">
          
          {/* Header row above infinite marquee */}
          <div className="flex items-center justify-between px-1 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Select Design Template
              </span>
              <span className="text-[11px] text-teal-400 font-mono font-medium">
                (Design {currentCert.id}: {currentCert.title.replace('Certificate of ', '').replace(' Certificate', '')})
              </span>
            </div>
            
            {/* Direction & Status Controls */}
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <button
                type="button"
                onClick={() => setScrollDirection((prev) => prev === 'l2r' ? 'r2l' : 'l2r')}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                title="Toggle scroll direction"
              >
                <ArrowRightLeft className="w-3 h-3 text-teal-400" />
                <span>Scroll: <strong>{scrollDirection === 'l2r' ? 'Left → Right' : 'Right → Left'}</strong></span>
              </button>
              <span className="hidden md:inline text-slate-600">•</span>
              <span className="hidden md:inline text-slate-400">Hover to pause • Click to inspect</span>
            </div>
          </div>

          {/* Infinite Marquee Wrapper with Smooth Gradient Fade Edges */}
          <div 
            className="group relative overflow-hidden rounded-xl py-1"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Left Edge Gradient Blur Fade */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 sm:w-14 bg-gradient-to-r from-slate-900 to-transparent z-10" />

            {/* Right Edge Gradient Blur Fade */}
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-14 bg-gradient-to-l from-slate-900 to-transparent z-10" />

            {/* Seamless Infinite Marquee Track (Set 1 + Set 2 with Equal Padding for 0-Pixel Seam) */}
            <div
              className={`flex items-start w-max cursor-pointer ${
                isPaused || isHovered ? '[animation-play-state:paused]' : ''
              } ${
                scrollDirection === 'l2r' ? 'animate-marquee-l2r' : 'animate-marquee-r2l'
              }`}
              style={{
                willChange: 'transform'
              }}
            >
              {/* Set 1 */}
              <div className="flex items-start gap-3 sm:gap-4 pr-3 sm:pr-4 shrink-0">
                {SAMPLE_CERTIFICATES.map((cert) => {
                  const isSelected = cert.id === currentCert.id;
                  return (
                    <div key={`set1-${cert.id}`} className="shrink-0">
                      <CertificateItem
                        cert={cert}
                        mode="thumbnail"
                        isSelected={isSelected}
                        onClick={() => handleSelectCertificate(cert.id - 1)}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Set 2 (Identical Clone for 100% Seamless Infinite Loop) */}
              <div className="flex items-start gap-3 sm:gap-4 pr-3 sm:pr-4 shrink-0" aria-hidden="true">
                {SAMPLE_CERTIFICATES.map((cert) => {
                  const isSelected = cert.id === currentCert.id;
                  return (
                    <div key={`set2-${cert.id}`} className="shrink-0">
                      <CertificateItem
                        cert={cert}
                        mode="thumbnail"
                        isSelected={isSelected}
                        onClick={() => handleSelectCertificate(cert.id - 1)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

        {/* 4. FOOTER INTERACTIVE ACTIONS BAR */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
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
