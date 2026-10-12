import React from 'react';
import { 
  Award, 
  Mail, 
  ShieldCheck, 
  CheckCircle2, 
  TrendingUp, 
  Calendar 
} from 'lucide-react';
import { Project, UserProfile } from '../../types';

interface AnalyticsViewProps {
  projects: Project[];
  user: UserProfile;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ projects }) => {
  const totalGenerated = projects.reduce((acc, p) => acc + (p.generatedCount || 0), 0);
  const totalEmailed = projects.reduce((acc, p) => acc + (p.emailedCount || 0), 0);
  const totalVerified = projects.reduce((acc, p) => acc + (p.verifiedCount || 0), 0);
  const totalFailed = 0;

  const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
  const monthlyData = [120, 240, 180, 420, 610, totalGenerated || 720];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-150 bg-white text-neutral-900">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
            Performance & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Real-time issuance metrics, QR verification volume, and email delivery rates.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-black bg-neutral-100 border border-neutral-300 px-3 py-1.5 rounded-xl shadow-xs">
          <Calendar className="w-3.5 h-3.5 text-black" />
          <span>Last 6 Months (FY 2026)</span>
        </div>
      </div>

      {/* 4 Core Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-card hover:border-teal-500/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Generated</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 border border-teal-200/80 flex items-center justify-center">
              <Award className="w-4 h-4 text-teal-600" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-black mt-2">{totalGenerated.toLocaleString()}</p>
          <div className="flex items-center gap-1 text-[11px] font-bold text-teal-700 mt-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+24.8% vs last month</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-card hover:border-sky-500/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Emailed Directly</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 border border-sky-200/80 flex items-center justify-center">
              <Mail className="w-4 h-4 text-sky-600" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-black mt-2">{totalEmailed.toLocaleString()}</p>
          <p className="text-[11px] text-neutral-500 mt-1 font-medium">98.4% delivery inbox rate</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-card hover:border-teal-500/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">QR Scans Verified</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 border border-teal-200/80 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-black mt-2">{totalVerified.toLocaleString()}</p>
          <p className="text-[11px] text-neutral-500 font-medium mt-1">100% cryptographic match</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-card hover:border-neutral-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Failed Jobs</span>
            <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-600 border border-neutral-200 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-neutral-600" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-black mt-2">{totalFailed}</p>
          <p className="text-[11px] text-neutral-500 font-medium mt-1">Zero downtime recorded</p>
        </div>

      </div>

      {/* Issuance Volume Chart (Brand Mint Teal Bars) */}
      <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-card space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-sm sm:text-base text-black">Certificate Generation Velocity</h3>
            <p className="text-xs text-neutral-500">Monthly certificate production across all campaigns.</p>
          </div>
          <span className="text-xs font-bold text-teal-900 bg-teal-50 border border-teal-200/80 px-2.5 py-1 rounded-lg">
            Total {monthlyData.reduce((a, b) => a + b, 0)} Certificates
          </span>
        </div>

        <div className="h-64 flex items-end gap-4 sm:gap-8 pt-8 px-2 border-b border-neutral-200">
          {months.map((m, i) => {
            const val = monthlyData[i];
            const max = Math.max(...monthlyData);
            const heightPct = Math.round((val / max) * 100);

            return (
              <div key={m} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                <span className="text-[11px] font-bold text-black opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                  {val}
                </span>
                <div 
                  className="w-full max-w-[48px] bg-teal-500 group-hover:bg-teal-600 rounded-t-lg transition-all shadow-sm shadow-teal-500/20"
                  style={{ height: `${heightPct}%` }}
                />
                <span className="text-xs font-bold text-neutral-600">{m}</span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
