import React from 'react';

// Elegant SVG Signature Generator
export const SignatureSvg: React.FC<{
  type?: 'classic' | 'flourish' | 'modern' | 'diplomatic';
  name: string;
  color?: string;
  className?: string;
}> = ({ type = 'classic', name, color = '#0F172A', className = 'h-10 sm:h-12 w-auto' }) => {
  if (type === 'flourish') {
    return (
      <svg className={className} viewBox="0 0 240 70" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M15 48C35 48 50 15 65 18C80 21 70 55 90 45C110 35 125 12 145 28C165 44 150 62 175 42C195 25 210 38 230 30"
          stroke={color}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M40 52C75 58 135 60 215 46"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="4 2"
        />
        <path
          d="M60 22C50 40 45 52 35 60C25 68 15 62 25 50C35 38 75 10 95 12"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (type === 'modern') {
    return (
      <svg className={className} viewBox="0 0 240 70" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M20 35L45 15L60 52L85 25L105 48L130 18L150 40C170 20 190 28 220 22"
          stroke={color}
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M35 55C80 50 150 54 225 38"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (type === 'diplomatic') {
    return (
      <svg className={className} viewBox="0 0 240 70" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M25 40C40 20 55 15 70 32C85 49 60 62 90 55C120 48 135 22 155 20C175 18 185 45 215 35"
          stroke={color}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M20 52C60 62 140 64 220 50"
          stroke={color}
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <circle cx="50" cy="22" r="2.5" fill={color} />
      </svg>
    );
  }

  // default 'classic'
  return (
    <svg className={className} viewBox="0 0 240 70" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M20 42C30 20 45 10 55 25C65 40 40 60 70 45C100 30 115 15 130 35C145 55 160 30 185 40C200 46 215 35 230 32"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M45 54C85 58 150 56 220 46"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
};

// Scalable Emblems and Crests
export const InstituteEmblem: React.FC<{
  type: string;
  monogram: string;
  accent: string;
  primary: string;
  className?: string;
}> = ({ type, monogram, accent, primary, className = 'w-10 h-10' }) => {
  switch (type) {
    case 'gold-classic':
      return (
        <div className={`${className} rounded-full border-2 border-[#D97706] bg-gradient-to-br from-[#FEF3C7] via-[#FFFBEB] to-[#FDE68A] flex items-center justify-center p-1 shadow-sm`}>
          <svg viewBox="0 0 36 36" className="w-full h-full text-[#B45309]" fill="none" stroke="currentColor">
            <circle cx="18" cy="18" r="16" strokeWidth="1" strokeDasharray="3 1.5" />
            <path d="M18 5L22 13L31 14L24 21L26 30L18 25L10 30L12 21L5 14L14 13Z" fill="currentColor" fillOpacity="0.15" strokeWidth="1.2" />
            <text x="18" y="22" textAnchor="middle" fill="#78350F" fontSize="8" fontWeight="bold" fontFamily="Cinzel, serif">{monogram}</text>
          </svg>
        </div>
      );
    case 'rosette-burgundy':
      return (
        <div className={`${className} rounded-full bg-gradient-to-br from-[#9F1239] to-[#4C0519] border border-[#F43F5E]/40 flex items-center justify-center p-1 shadow-sm`}>
          <svg viewBox="0 0 36 36" className="w-full h-full text-white" fill="none">
            <circle cx="18" cy="18" r="15" stroke="#FECDD3" strokeWidth="1" strokeDasharray="2 2" />
            <path d="M18 6L21 14H29L22 19L25 27L18 22L11 27L14 19L7 14H15Z" fill="#FDE047" fillOpacity="0.85" />
            <text x="18" y="22" textAnchor="middle" fill="#FFFFFF" fontSize="7.5" fontWeight="900" fontFamily="sans-serif">{monogram}</text>
          </svg>
        </div>
      );
    case 'academic-crest':
      return (
        <div className={`${className} flex items-center justify-center`}>
          <svg viewBox="0 0 44 48" className="w-full h-full" fill="none">
            <path d="M22 2L6 8V22C6 34 22 45 22 45C22 45 38 34 38 22V8L22 2Z" fill="#FEF3C7" stroke="#92400E" strokeWidth="2" />
            <path d="M22 6L10 11V21C10 30 22 39 22 39C22 39 34 30 34 21V11L22 6Z" fill="#FFFBEB" stroke="#D97706" strokeWidth="1" />
            <path d="M15 18C15 15 22 13 22 13C22 13 29 15 29 18C29 23 22 28 22 28C22 28 15 23 15 18Z" fill="#D97706" />
            <text x="22" y="23" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="bold" fontFamily="Cinzel, serif">{monogram}</text>
          </svg>
        </div>
      );
    case 'sports-medal':
      return (
        <div className={`${className} flex items-center justify-center`}>
          <svg viewBox="0 0 40 44" className="w-full h-full" fill="none">
            {/* Ribbons */}
            <path d="M14 2L8 18H16L20 4L14 2Z" fill="#1E3A8A" />
            <path d="M26 2L32 18H24L20 4L26 2Z" fill="#EA580C" />
            {/* Medallion */}
            <circle cx="20" cy="27" r="14" fill="url(#goldGrad)" stroke="#B45309" strokeWidth="1.5" />
            <circle cx="20" cy="27" r="11" stroke="#FDE68A" strokeWidth="1" strokeDasharray="2 1.5" />
            <path d="M20 19L22 24H27L23 27L25 32L20 29L15 32L17 27L13 24H18L20 19Z" fill="#78350F" />
            <defs>
              <linearGradient id="goldGrad" x1="10" y1="15" x2="30" y2="39" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FDE047" />
                <stop offset="0.5" stopColor="#EAB308" />
                <stop offset="1" stopColor="#CA8A04" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      );
    case 'teal-emblem':
      return (
        <div className={`${className} rounded-full bg-gradient-to-br from-teal-50 to-teal-100 border-2 border-teal-600 flex items-center justify-center shadow-xs`}>
          <svg viewBox="0 0 36 36" className="w-full h-full text-teal-700" fill="none">
            <circle cx="18" cy="18" r="14" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="18" cy="18" r="9" stroke="currentColor" strokeWidth="1" strokeDasharray="3 2" />
            <circle cx="18" cy="18" r="4" fill="currentColor" />
            <text x="18" y="32" textAnchor="middle" fill="#044E39" fontSize="6" fontWeight="bold">{monogram}</text>
          </svg>
        </div>
      );
    case 'silver-corporate':
      return (
        <div className={`${className} rounded-lg bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 border-2 border-slate-400 flex items-center justify-center shadow-md`}>
          <svg viewBox="0 0 36 36" className="w-full h-full text-slate-200" fill="none">
            <rect x="5" y="5" width="26" height="26" rx="4" stroke="#94A3B8" strokeWidth="1.5" />
            <path d="M18 7L28 18L18 29L8 18L18 7Z" fill="#38BDF8" fillOpacity="0.25" stroke="#38BDF8" strokeWidth="1.2" />
            <text x="18" y="22" textAnchor="middle" fill="#F8FAFC" fontSize="7" fontWeight="bold" fontFamily="Cinzel, serif">{monogram}</text>
          </svg>
        </div>
      );
    case 'cyber-terminal':
      return (
        <div className={`${className} rounded bg-slate-950 border border-cyan-400 flex items-center justify-center font-mono shadow-sm`}>
          <span className="text-cyan-400 text-[10px] font-bold">&lt;{monogram}/&gt;</span>
        </div>
      );
    case 'emerald-wreath':
      return (
        <div className={`${className} rounded-full bg-emerald-50 border border-emerald-600 flex items-center justify-center`}>
          <svg viewBox="0 0 36 36" className="w-full h-full text-emerald-800" fill="none">
            <circle cx="18" cy="18" r="15" stroke="#047857" strokeWidth="1.2" />
            <path d="M10 24C9 18 12 12 18 10C24 12 27 18 26 24C23 27 13 27 10 24Z" fill="#D1FAE5" stroke="#059669" strokeWidth="1" />
            <text x="18" y="21" textAnchor="middle" fill="#064E3B" fontSize="7.5" fontWeight="bold" fontFamily="Cinzel, serif">{monogram}</text>
          </svg>
        </div>
      );
    case 'purple-polygon':
      return (
        <div className={`${className} flex items-center justify-center`}>
          <svg viewBox="0 0 38 38" className="w-full h-full" fill="none">
            <polygon points="19,3 35,11 35,27 19,35 3,27 3,11" fill="#F3E8FF" stroke="#7E22CE" strokeWidth="1.8" />
            <polygon points="19,8 30,14 30,24 19,30 8,24 8,14" fill="#6B21A8" fillOpacity="0.1" stroke="#9333EA" strokeWidth="1" />
            <text x="19" y="23" textAnchor="middle" fill="#3B0764" fontSize="8" fontWeight="extrabold" fontFamily="Cinzel, serif">{monogram}</text>
          </svg>
        </div>
      );
    case 'gold-embossed':
    default:
      return (
        <div className={`${className} rounded-full bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 border-2 border-amber-500 p-0.5 shadow-md flex items-center justify-center`}>
          <div className="w-full h-full rounded-full border border-amber-100/80 flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100">
            <span className="text-amber-900 font-bold text-[9px] font-['Cinzel'] tracking-tighter">{monogram}</span>
          </div>
        </div>
      );
  }
};

// Official Seal Medallions
export const OfficialSeal: React.FC<{
  type: string;
  className?: string;
}> = ({ type, className = 'w-12 h-12 sm:w-14 sm:h-14' }) => {
  switch (type) {
    case 'rosette-burgundy':
      return (
        <div className={`${className} relative flex flex-col items-center justify-center`}>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#9F1239] via-[#881337] to-[#4C0519] border-2 border-[#FDA4AF] shadow-md flex items-center justify-center text-center p-1">
            <span className="text-[6.5px] font-extrabold uppercase text-rose-100 leading-tight tracking-wider">
              HONOR<br />ROLL
            </span>
          </div>
          {/* Hanging Ribbon Tails */}
          <div className="flex gap-1 -mt-1.5 z-0">
            <div className="w-2 h-4 sm:w-2.5 sm:h-5 bg-[#881337] clip-ribbon transform -rotate-12" />
            <div className="w-2 h-4 sm:w-2.5 sm:h-5 bg-[#9F1239] clip-ribbon transform rotate-12" />
          </div>
        </div>
      );
    case 'sports-medal':
      return (
        <div className={`${className} flex flex-col items-center justify-center`}>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-amber-100 border border-amber-600 flex flex-col items-center justify-center text-center">
              <span className="text-[8px] sm:text-[9px] font-black text-amber-950">1ST</span>
              <span className="text-[5.5px] font-bold text-amber-800 uppercase tracking-tighter">PLACE</span>
            </div>
          </div>
        </div>
      );
    case 'silver-corporate':
      return (
        <div className={`${className} rounded-full bg-gradient-to-br from-slate-200 via-slate-400 to-slate-600 p-1 shadow-md flex items-center justify-center`}>
          <div className="w-full h-full rounded-full bg-slate-900 border border-slate-300 flex flex-col items-center justify-center text-center p-0.5">
            <span className="text-[6.5px] font-bold tracking-widest text-slate-200 uppercase">OFFICIAL</span>
            <span className="text-[5.5px] text-cyan-300 font-mono">SEAL</span>
          </div>
        </div>
      );
    case 'cyber-terminal':
      return (
        <div className={`${className} rounded border border-cyan-400 bg-slate-950/90 p-1 flex flex-col items-center justify-center text-center shadow-xs`}>
          <span className="text-[7px] text-cyan-400 font-mono font-bold leading-tight">SHA-256</span>
          <span className="text-[6px] text-emerald-400 font-mono">VERIFIED</span>
        </div>
      );
    case 'emerald-wreath':
      return (
        <div className={`${className} rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 border-2 border-emerald-600 p-0.5 shadow-sm flex items-center justify-center`}>
          <div className="w-full h-full rounded-full border border-emerald-500/60 flex flex-col items-center justify-center text-center">
            <span className="text-[6.5px] font-extrabold uppercase text-emerald-950 tracking-tighter leading-tight">
              ACADEMIC<br />MERIT
            </span>
          </div>
        </div>
      );
    case 'purple-polygon':
      return (
        <div className={`${className} flex flex-col items-center justify-center`}>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg rotate-45 bg-gradient-to-br from-purple-600 to-purple-900 border border-purple-300 shadow-md flex items-center justify-center">
            <span className="-rotate-45 text-[6px] font-bold text-white uppercase text-center leading-tight">
              VENTURE<br />SEAL
            </span>
          </div>
        </div>
      );
    case 'gold-embossed':
    case 'gold-classic':
    default:
      return (
        <div className={`${className} flex flex-col items-center justify-center`}>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#F59E0B] via-[#D97706] to-[#78350F] p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-[#FEF3C7] to-[#FDE68A] border border-[#B45309] flex flex-col items-center justify-center text-center p-0.5">
              <span className="text-[6.5px] sm:text-[7px] font-extrabold tracking-tighter uppercase text-amber-950 leading-tight">
                OFFICIAL<br />SEAL
              </span>
            </div>
          </div>
        </div>
      );
  }
};
