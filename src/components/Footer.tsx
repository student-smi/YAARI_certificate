import React from 'react';
import { Award, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  return (
    <footer className="bg-white text-neutral-600 border-t border-neutral-200 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12">
          
          {/* Brand Bio */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <img 
                src="/logo.png" 
                alt="CertiCraft - Create. Issue. Verify." 
                className="h-8 w-auto object-contain" 
              />
            </div>
            <p className="text-neutral-500 max-w-sm text-xs leading-relaxed font-medium">
              The high-performance bulk certificate generation and verification platform. Empowering schools, universities, bootcamps, and corporate leaders to automate credential issuance at scale.
            </p>
            <div className="flex items-center gap-4 text-[11px] text-neutral-500 pt-2 font-medium">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-black" />
                ISO 27001 & SOC-2 Ready
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                Cryptographic QR Seals
              </span>
            </div>
          </div>

          {/* Links Column 1: Product */}
          <div>
            <h4 className="text-[11px] font-extrabold text-black uppercase tracking-wider mb-4">Product</h4>
            <ul className="space-y-2.5 font-medium">
              <li><button onClick={() => onNavigate('templates')} className="hover:text-black transition-colors">Template Gallery</button></li>
              <li><button onClick={() => onNavigate('dashboard')} className="hover:text-black transition-colors">Bulk Generation Engine</button></li>
              <li><button onClick={() => onNavigate('verify')} className="hover:text-black transition-colors">Public QR Verification</button></li>
              <li><button onClick={() => onNavigate('api')} className="hover:text-black transition-colors">Developer REST API</button></li>
              <li><button onClick={() => onNavigate('settings')} className="hover:text-black transition-colors">White-Label Branding</button></li>
            </ul>
          </div>

          {/* Links Column 2: Solutions */}
          <div>
            <h4 className="text-[11px] font-extrabold text-black uppercase tracking-wider mb-4">Use Cases</h4>
            <ul className="space-y-2.5 font-medium">
              <li><span className="hover:text-black transition-colors cursor-pointer">Universities & Colleges</span></li>
              <li><span className="hover:text-black transition-colors cursor-pointer">Coding Bootcamps</span></li>
              <li><span className="hover:text-black transition-colors cursor-pointer">Corporate Training</span></li>
              <li><span className="hover:text-black transition-colors cursor-pointer">Conferences & Summits</span></li>
              <li><span className="hover:text-black transition-colors cursor-pointer">Employee Recognition</span></li>
            </ul>
          </div>

          {/* Links Column 3: Trust & Company */}
          <div>
            <h4 className="text-[11px] font-extrabold text-black uppercase tracking-wider mb-4">Security & Trust</h4>
            <ul className="space-y-2.5 font-medium">
              <li><span className="hover:text-black transition-colors cursor-pointer">Privacy Policy</span></li>
              <li><span className="hover:text-black transition-colors cursor-pointer">Terms of Service</span></li>
              <li><span className="hover:text-black transition-colors cursor-pointer">Razorpay Integration</span></li>
              <li><span className="hover:text-black transition-colors cursor-pointer">Status & Uptime</span></li>
              <li><span className="hover:text-black transition-colors cursor-pointer">Contact Support</span></li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-8 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-400 gap-4 font-medium">
          <p>© 2026 CertiForge Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-6 text-neutral-500">
            <span>Server: Mumbai (ap-south-1)</span>
            <span>99.98% Generation Uptime</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
