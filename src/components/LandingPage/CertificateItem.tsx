import React from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  QrCode, 
  ExternalLink,
  Award,
  Clock,
  Code2,
  Trophy,
  GraduationCap
} from 'lucide-react';
import { SampleCertificate } from './sampleCertificatesData';
import { SignatureSvg, InstituteEmblem, OfficialSeal } from './CertificateVisuals';

interface CertificateItemProps {
  cert: SampleCertificate;
  mode?: 'full' | 'thumbnail';
  onVerifyClick?: (certId: string) => void;
  onClick?: () => void;
  isSelected?: boolean;
}

export const CertificateItem: React.FC<CertificateItemProps> = ({
  cert,
  mode = 'full',
  onVerifyClick,
  onClick,
  isSelected = false
}) => {
  const isPortrait = cert.orientation === 'portrait';

  // -------------------------------------------------------------
  // THUMBNAIL RENDERING
  // -------------------------------------------------------------
  if (mode === 'thumbnail') {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`group flex flex-col items-center text-left focus:outline-hidden transition-all duration-200 cursor-pointer ${
          isSelected ? 'scale-[1.02]' : 'hover:scale-[1.01]'
        }`}
        aria-label={`Select ${cert.title} - ${cert.achievementTitle}`}
      >
        {/* Miniature Certificate Preview Frame */}
        <div
          className={`relative rounded-lg overflow-hidden transition-all duration-300 shadow-sm ${
            isPortrait ? 'w-20 sm:w-24 h-24 sm:h-28' : 'w-32 sm:w-36 h-21 sm:h-24'
          } ${
            isSelected
              ? 'ring-2 ring-teal-500 border-2 border-teal-500 shadow-teal-500/20 shadow-md'
              : 'border border-slate-300/80 hover:border-teal-400 group-hover:shadow-md'
          } ${cert.theme.bgClass}`}
        >
          {/* Miniature Layout */}
          <div className="absolute inset-1 border border-current opacity-40 rounded pointer-events-none" style={{ color: cert.theme.borderColor }} />
          
          <div className="p-1.5 sm:p-2 h-full flex flex-col justify-between text-neutral-800 pointer-events-none select-none">
            {/* Top header row */}
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1 min-w-0">
                <div className="w-3.5 h-3.5 rounded-full flex-shrink-0 flex items-center justify-center text-[6px] font-bold" style={{ backgroundColor: cert.theme.accentColor + '20', color: cert.theme.accentColor }}>
                  {cert.instituteMonogram[0]}
                </div>
                <p className="text-[6.5px] font-bold truncate opacity-80" style={{ color: cert.theme.primaryText }}>
                  {cert.instituteName.split(' ')[0]}
                </p>
              </div>
              <span className="text-[5.5px] uppercase font-bold px-1 rounded-sm opacity-90" style={{ backgroundColor: cert.theme.accentColor + '18', color: cert.theme.accentColor }}>
                {isPortrait ? 'Portrait' : 'Design ' + cert.id}
              </span>
            </div>

            {/* Middle Title & Recipient */}
            <div className="text-center my-auto px-0.5">
              <p className="text-[7.5px] sm:text-[8px] font-extrabold uppercase tracking-tight leading-tight line-clamp-1" style={{ color: cert.theme.primaryText }}>
                {cert.title.replace('Certificate of ', '').replace(' Certificate', '')}
              </p>
              <div className="w-8 h-[1px] mx-auto my-0.5 opacity-60" style={{ backgroundColor: cert.theme.borderColor }} />
              <p className="text-[8px] sm:text-[9.5px] font-serif font-black tracking-tight line-clamp-1" style={{ color: cert.theme.primaryText }}>
                {cert.recipientName}
              </p>
              <p className="text-[6px] truncate opacity-70 mt-0.5" style={{ color: cert.theme.secondaryText }}>
                {cert.achievementTitle}
              </p>
            </div>

            {/* Bottom mini signatures & seal */}
            <div className="flex items-end justify-between pt-1 border-t border-current opacity-60 text-[5px]" style={{ borderColor: cert.theme.borderColor + '40' }}>
              <span className="font-mono">{cert.certNumber.split('-')[2]}</span>
              <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold text-[5px]" style={{ backgroundColor: cert.theme.accentColor, color: '#fff' }}>
                ★
              </div>
            </div>
          </div>

          {/* Active Badge Marker */}
          {isSelected && (
            <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-teal-500 ring-2 ring-white animate-pulse" />
          )}
        </div>

        {/* Thumbnail Caption */}
        <div className="mt-1.5 text-center w-32 sm:w-36 px-0.5">
          <p className={`text-[11px] sm:text-xs font-semibold leading-snug line-clamp-1 ${isSelected ? 'text-teal-400 font-bold' : 'text-slate-300 group-hover:text-white'}`}>
            {cert.title}
          </p>
          <p className="text-[9px] sm:text-[9.5px] text-slate-400 truncate mt-0.5">
            {cert.achievementTitle}
          </p>
        </div>
      </button>
    );
  }

  // -------------------------------------------------------------
  // FULL PREVIEW RENDERING (Balanced Proportions matching Template Strip)
  // -------------------------------------------------------------
  return (
    <div
      className={`relative mx-auto rounded-xl shadow-xl transition-all duration-300 overflow-hidden ${cert.theme.bgClass} ${
        isPortrait
          ? 'w-full max-w-[270px] sm:max-w-[300px] aspect-[1/1.414] text-neutral-900 border-2'
          : 'w-full max-w-[390px] sm:max-w-[430px] md:max-w-[465px] lg:max-w-[490px] aspect-[1.414/1] text-neutral-900 border-2'
      }`}
      style={{
        borderColor: cert.theme.borderColor,
        color: cert.theme.primaryText
      }}
    >
      {/* Dynamic Background Textures / Borders per distinct style */}
      {renderDistinctFrame(cert, isPortrait)}

      {/* Main Certificate Content Box */}
      <div className={`relative z-10 h-full flex flex-col justify-between ${isPortrait ? 'p-3.5 sm:p-4.5' : 'p-3 sm:p-4 md:p-5'}`}>
        
        {/* 1. HEADER SECTION: Monogram / Crest & Academy Name */}
        <div className="text-center space-y-0.5 sm:space-y-1">
          <div className="flex items-center justify-center gap-1.5 sm:gap-2.5">
            <div className="h-[1px] w-5 sm:w-10 opacity-40" style={{ backgroundColor: cert.theme.borderColor }} />
            <InstituteEmblem
              type={cert.theme.sealType}
              monogram={cert.instituteMonogram}
              accent={cert.theme.accentColor}
              primary={cert.theme.primaryText}
              className="w-6 h-6 sm:w-7 sm:h-7"
            />
            <div className="h-[1px] w-5 sm:w-10 opacity-40" style={{ backgroundColor: cert.theme.borderColor }} />
          </div>

          <div className="space-y-0.5">
            <p className="text-[8px] sm:text-[9.5px] font-bold uppercase tracking-[0.2em] font-['Cinzel',serif] line-clamp-1" style={{ color: cert.theme.accentColor }}>
              {cert.instituteName}
            </p>
            <p className="text-[7px] sm:text-[8px] opacity-75 tracking-wider font-sans line-clamp-1" style={{ color: cert.theme.secondaryText }}>
              {cert.instituteSubtitle}
            </p>
          </div>
        </div>

        {/* 2. CERTIFICATE TITLE */}
        <div className="text-center my-auto py-0.5 sm:py-1 space-y-0.5 sm:space-y-1">
          <div className="inline-block relative">
            <h2
              className={`text-base sm:text-xl md:text-[23px] font-extrabold uppercase tracking-wide leading-tight drop-shadow-xs ${cert.theme.fontTitle}`}
              style={{ color: cert.theme.primaryText }}
            >
              {cert.title}
            </h2>
            {/* Under-title decorative accent line */}
            <div className="flex items-center justify-center gap-1 max-w-[200px] sm:max-w-xs mx-auto mt-0.5 sm:mt-1 opacity-80">
              <div className="h-[1px] flex-1" style={{ backgroundColor: cert.theme.borderColor }} />
              <div className="w-1.5 h-1.5 rotate-45" style={{ backgroundColor: cert.theme.accentColor }} />
              <div className="h-[1px] flex-1" style={{ backgroundColor: cert.theme.borderColor }} />
            </div>
          </div>

          <p className="text-[10px] sm:text-[11px] italic font-serif opacity-80" style={{ color: cert.theme.secondaryText }}>
            This official credential is conferred with honors upon
          </p>

          {/* 3. RECIPIENT NAME (Prominent, Sharp, Selectable) */}
          <div className="py-0.2 sm:py-0.5">
            <h3
              className="text-lg sm:text-2xl md:text-3xl font-black tracking-tight font-serif select-text leading-tight"
              style={{ color: cert.theme.primaryText }}
            >
              {cert.recipientName}
            </h3>
          </div>

          {/* 4. STATEMENT & ACHIEVEMENT */}
          <div className="max-w-md sm:max-w-lg mx-auto space-y-0.5 px-1 sm:px-2">
            <p className="text-[9.5px] sm:text-[10.5px] leading-snug line-clamp-2 select-text" style={{ color: cert.theme.secondaryText }}>
              {cert.statement}
            </p>
            <p
              className="text-[11px] sm:text-[13px] md:text-sm font-bold tracking-normal select-text line-clamp-1 mt-0.5"
              style={{ color: cert.theme.primaryText }}
            >
              {cert.achievementTitle}
            </p>
            {cert.courseDuration && (
              <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[8px] sm:text-[9px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 mt-0.5">
                <Clock className="w-2.5 h-2.5 text-emerald-700" />
                {cert.courseDuration}
              </span>
            )}
          </div>
        </div>

        {/* 5. FOOTER: Date/Ref, Official Seal, Tamper-Proof QR, & Signatures */}
        <div
          className="pt-1.5 sm:pt-2 flex items-end justify-between gap-1.5 sm:gap-2 border-t border-current opacity-90"
          style={{ borderColor: cert.theme.borderColor + '35' }}
        >
          {/* Left: Metadata */}
          <div className="text-left min-w-[70px] sm:min-w-[80px] space-y-0.2">
            <p className="text-[7px] sm:text-[7.5px] font-bold uppercase tracking-widest opacity-60" style={{ color: cert.theme.secondaryText }}>
              Issue Date
            </p>
            <p className="text-[10px] sm:text-[11px] font-bold select-text leading-tight" style={{ color: cert.theme.primaryText }}>
              {cert.issueDate}
            </p>
            <p className="text-[7px] sm:text-[7.5px] font-mono select-text opacity-70" style={{ color: cert.theme.secondaryText }}>
              {cert.certNumber}
            </p>
          </div>

          {/* Center-Left: Official Seal */}
          <div className="hidden sm:flex flex-col items-center">
            <div className="scale-80 origin-bottom">
              <OfficialSeal type={cert.theme.sealType} />
            </div>
            <span className="text-[6.5px] font-bold uppercase tracking-wider mt-0.2 opacity-80" style={{ color: cert.theme.accentColor }}>
              Verified Credential
            </span>
          </div>

          {/* Center-Right: Interactive QR Verification Component */}
          <div
            onClick={() => onVerifyClick?.(cert.certNumber)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onVerifyClick?.(cert.certNumber);
              }
            }}
            title="Click to test live QR verification demo"
            className="group/qr flex items-center gap-1 p-0.5 px-1.5 sm:px-2 rounded border bg-white/90 backdrop-blur-xs shadow-2xs hover:border-teal-500 transition-all cursor-pointer select-none"
            style={{ borderColor: cert.theme.borderColor + '60' }}
          >
            <div className="w-6 h-6 sm:w-7 sm:h-7 bg-white border border-slate-300 rounded flex items-center justify-center p-0.5 shadow-2xs group-hover/qr:scale-105 transition-transform">
              <QrCode className="w-full h-full text-slate-900" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-0.5 text-[7px] sm:text-[7.5px] font-bold text-teal-700">
                <CheckCircle2 className="w-2 h-2 text-teal-600" />
                <span>Live QR Verified</span>
              </div>
              <p className="text-[6.5px] sm:text-[7px] font-mono text-slate-500 group-hover/qr:text-teal-600 flex items-center gap-0.5">
                <span>Tamper-Proof</span>
                <ExternalLink className="w-1.5 h-1.5 opacity-60" />
              </p>
            </div>
          </div>

          {/* Right: Realistic Signatories */}
          <div className="flex items-end gap-2.5 text-right">
            {cert.signatories.map((sig, idx) => (
              <div key={idx} className="flex flex-col items-end min-w-[65px] sm:min-w-[80px]">
                <SignatureSvg
                  type={sig.signatureSvgType || 'classic'}
                  name={sig.name}
                  color={cert.theme.primaryText}
                  className="h-5 sm:h-6 w-auto"
                />
                <div className="w-14 sm:w-18 h-[1px] my-0.2 opacity-40" style={{ backgroundColor: cert.theme.primaryText }} />
                <p className="text-[7.5px] sm:text-[8.5px] font-bold leading-tight select-text" style={{ color: cert.theme.primaryText }}>
                  {sig.name}
                </p>
                <p className="text-[6.5px] sm:text-[7.5px] leading-tight select-text opacity-70" style={{ color: cert.theme.secondaryText }}>
                  {sig.role}
                </p>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
};

// -------------------------------------------------------------
// DISTINCT SVG / CSS FRAMES PER CERTIFICATE DESIGN
// -------------------------------------------------------------
function renderDistinctFrame(cert: SampleCertificate, isPortrait: boolean) {
  switch (cert.theme.borderStyle) {
    // Design 1: Classic Ivory, Navy & Gold Double Frame
    case 'double-gold':
      return (
        <div className="absolute inset-1.5 sm:inset-2 border-[1.5px] border-[#B45309]/80 rounded-lg pointer-events-none p-1">
          <div className="w-full h-full border border-[#D97706]/40 rounded-sm relative">
            {/* 4 Corner Ornaments */}
            <div className="absolute top-0.5 left-0.5 text-[#B45309]">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 2H14M2 2V14M2 2L9 9" strokeLinecap="round" />
              </svg>
            </div>
            <div className="absolute top-0.5 right-0.5 text-[#B45309] rotate-90">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 2H14M2 2V14M2 2L9 9" strokeLinecap="round" />
              </svg>
            </div>
            <div className="absolute bottom-0.5 right-0.5 text-[#B45309] rotate-180">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 2H14M2 2V14M2 2L9 9" strokeLinecap="round" />
              </svg>
            </div>
            <div className="absolute bottom-0.5 left-0.5 text-[#B45309] -rotate-90">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 2H14M2 2V14M2 2L9 9" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>
      );

    // Design 2: White and Burgundy Asymmetric Architectural Frame
    case 'asymmetric-burgundy':
      return (
        <>
          {/* Asymmetric left wine bar */}
          <div className="absolute left-0 top-0 bottom-0 w-2.5 sm:w-3 bg-gradient-to-b from-[#881337] via-[#9F1239] to-[#4C0519] pointer-events-none" />
          <div className="absolute left-2.5 sm:left-3 top-0 bottom-0 w-[1px] bg-[#F43F5E]/60 pointer-events-none" />
          <div className="absolute inset-2 sm:inset-2.5 border border-[#881337]/30 rounded pointer-events-none" />
        </>
      );

    // Design 3: Classical Parchment with Victorian Corner Filigree
    case 'portrait-parchment':
    case 'classical-parchment':
      return (
        <div className="absolute inset-1.5 sm:inset-2 border-[1.5px] border-[#A16207]/70 rounded pointer-events-none p-0.5 sm:p-1">
          <div className="w-full h-full border border-[#CA8A04]/40 rounded relative">
            <svg className="absolute top-0.5 left-0.5 w-4 h-4 sm:w-5 sm:h-5 text-[#854D0E]" viewBox="0 0 36 36" fill="none" stroke="currentColor">
              <path d="M3 3C12 3 18 9 18 18M3 3V18M3 3H18M9 9C15 9 18 12 18 18" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <svg className="absolute top-0.5 right-0.5 w-4 h-4 sm:w-5 sm:h-5 text-[#854D0E] rotate-90" viewBox="0 0 36 36" fill="none" stroke="currentColor">
              <path d="M3 3C12 3 18 9 18 18M3 3V18M3 3H18M9 9C15 9 18 12 18 18" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <svg className="absolute bottom-0.5 right-0.5 w-4 h-4 sm:w-5 sm:h-5 text-[#854D0E] rotate-180" viewBox="0 0 36 36" fill="none" stroke="currentColor">
              <path d="M3 3C12 3 18 9 18 18M3 3V18M3 3H18M9 9C15 9 18 12 18 18" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <svg className="absolute bottom-0.5 left-0.5 w-4 h-4 sm:w-5 sm:h-5 text-[#854D0E] -rotate-90" viewBox="0 0 36 36" fill="none" stroke="currentColor">
              <path d="M3 3C12 3 18 9 18 18M3 3V18M3 3H18M9 9C15 9 18 12 18 18" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      );

    // Design 4: Sports Dynamic Chevrons & Racing Stripes
    case 'sports-chevrons':
      return (
        <>
          {/* Top-Right Royal Blue & Orange diagonal cuts */}
          <div className="absolute top-0 right-0 w-24 sm:w-36 h-8 sm:h-12 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-40 h-20 bg-[#1D4ED8] transform rotate-12 translate-x-12 -translate-y-8" />
            <div className="absolute top-0 right-0 w-36 h-3 bg-[#EA580C] transform rotate-12 translate-x-8 -translate-y-2" />
          </div>
          {/* Bottom-Left Chevrons */}
          <div className="absolute bottom-0 left-0 w-24 sm:w-36 h-8 sm:h-12 overflow-hidden pointer-events-none">
            <div className="absolute bottom-0 left-0 w-40 h-20 bg-[#1E3A8A] transform rotate-12 -translate-x-12 translate-y-8" />
            <div className="absolute bottom-0 left-0 w-36 h-3 bg-[#EA580C] transform rotate-12 -translate-x-8 translate-y-2" />
          </div>
          <div className="absolute inset-2 sm:inset-3 border border-[#1D4ED8]/30 rounded pointer-events-none" />
        </>
      );

    // Design 5: Modern Teal Minimalist Double Line
    case 'modern-teal':
      return (
        <div className="absolute inset-2 sm:inset-3 border border-teal-500/40 rounded-xl pointer-events-none p-1 sm:p-1.5">
          <div className="w-full h-full border border-teal-400/20 rounded-lg" />
        </div>
      );

    // Design 6: Structured Corporate Navy & Silver
    case 'corporate-silver':
      return (
        <div className="absolute inset-2 sm:inset-3 border border-slate-400/60 rounded-sm pointer-events-none p-1 sm:p-2 bg-gradient-to-tr from-slate-900/60 to-slate-800/40">
          <div className="w-full h-full border-2 border-slate-300/40 rounded-xs" />
        </div>
      );

    // Design 7: Technical Matrix & Code Grid
    case 'tech-grid':
      return (
        <>
          <div className="absolute inset-2 sm:inset-3 border border-indigo-400/50 rounded pointer-events-none">
            {/* Top Code Status Tag */}
            <div className="absolute top-0 left-4 -translate-y-1/2 px-2 py-0.5 bg-slate-900 text-cyan-400 text-[8px] font-mono font-bold rounded border border-cyan-400">
              SYS::VERIFIED_CREDENTIAL
            </div>
            {/* Cyan bottom cyber edge */}
            <div className="absolute bottom-0 right-4 -translate-y-1/2 px-2 py-0.5 bg-indigo-900 text-indigo-200 text-[8px] font-mono rounded border border-indigo-400">
              BUILD:STABLE_A4
            </div>
          </div>
        </>
      );

    // Design 8: Emerald Academic & Botanical Laurel Frame
    case 'emerald-botanical':
      return (
        <div className="absolute inset-2 sm:inset-3 border-2 border-[#047857]/60 rounded-md pointer-events-none p-1 sm:p-1.5">
          <div className="w-full h-full border border-[#D97706]/40 rounded-xs relative">
            <svg className="absolute top-1 left-1 w-6 h-6 text-[#047857]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 2C8 6 6 12 6 18C10 18 16 16 20 12" strokeWidth="1.2" />
            </svg>
            <svg className="absolute bottom-1 right-1 w-6 h-6 text-[#047857] rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 2C8 6 6 12 6 18C10 18 16 16 20 12" strokeWidth="1.2" />
            </svg>
          </div>
        </div>
      );

    // Design 9: Contemporary Purple Geometric Framing
    case 'purple-geometric':
      return (
        <div className="absolute inset-2 sm:inset-3 border-2 border-[#7E22CE]/50 rounded-lg pointer-events-none p-1 sm:p-1.5">
          <div className="w-full h-full border border-[#9333EA]/30 rounded-sm" />
        </div>
      );

    // Design 10: Charcoal, Gold & Cream Guilloche Frame
    case 'ornate-gold-charcoal':
    default:
      return (
        <div className="absolute inset-2 sm:inset-3 border-2 border-[#18181B] rounded pointer-events-none p-1">
          <div className="w-full h-full border-2 border-[#CA8A04]/70 rounded-xs relative">
            <div className="absolute top-1 left-1 w-2 h-2 bg-[#CA8A04]" />
            <div className="absolute top-1 right-1 w-2 h-2 bg-[#CA8A04]" />
            <div className="absolute bottom-1 right-1 w-2 h-2 bg-[#CA8A04]" />
            <div className="absolute bottom-1 left-1 w-2 h-2 bg-[#CA8A04]" />
          </div>
        </div>
      );
  }
}
