import React, { useState } from 'react';
import { 
  Building2, 
  GraduationCap, 
  Briefcase, 
  Calendar, 
  BookOpen, 
  Sparkles,
  ArrowRight,
  FileSpreadsheet,
  LayoutTemplate,
  PlusCircle
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  userName: string;
  onComplete: (useCase: string, initialAction: 'create' | 'import' | 'templates') => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  userName,
  onComplete
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedUseCase, setSelectedUseCase] = useState('Training Institute');

  if (!isOpen) return null;

  const useCases = [
    { id: 'School', label: 'School', icon: GraduationCap },
    { id: 'College', label: 'College / University', icon: Building2 },
    { id: 'Training Institute', label: 'Training Institute', icon: BookOpen },
    { id: 'Company', label: 'Company / Corporate', icon: Briefcase },
    { id: 'Events', label: 'Events & Conferences', icon: Calendar },
    { id: 'Courses', label: 'Online Courses', icon: Sparkles },
    { id: 'Other', label: 'Other Organization', icon: Building2 },
  ];

  const initialActions = [
    {
      id: 'create' as const,
      title: 'Create a certificate project',
      desc: 'Start fresh with our step-by-step certificate campaign wizard.',
      icon: PlusCircle
    },
    {
      id: 'templates' as const,
      title: 'Explore templates',
      desc: 'Browse our curated collection of luxury academic and corporate templates.',
      icon: LayoutTemplate
    },
    {
      id: 'import' as const,
      title: 'Import recipient data',
      desc: 'Jump straight into mapping your Excel or CSV spreadsheet.',
      icon: FileSpreadsheet
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-elevated border border-neutral-300 overflow-hidden text-neutral-900 p-8">
        
        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-black bg-neutral-100 border border-neutral-300 px-2 py-0.5 rounded">Step {step} of 2</span>
            <h3 className="text-xl font-black text-black mt-1">
              Welcome, {userName.split(' ')[0]}!
            </h3>
          </div>
          <div className="flex gap-1.5">
            <div className={`w-8 h-1.5 rounded-full ${step >= 1 ? 'bg-black' : 'bg-neutral-200'}`} />
            <div className={`w-8 h-1.5 rounded-full ${step >= 2 ? 'bg-black' : 'bg-neutral-200'}`} />
          </div>
        </div>

        {step === 1 ? (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-bold text-black">
                What are you creating certificates for?
              </h4>
              <p className="text-xs text-neutral-500 mt-0.5 font-medium">
                We'll tailor your template recommendations and field defaults based on your domain.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {useCases.map((item) => {
                const Icon = item.icon;
                const isSelected = selectedUseCase === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedUseCase(item.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between h-24 ${
                      isSelected
                        ? 'border-2 border-black bg-neutral-50 shadow-xs'
                        : 'border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-black' : 'text-neutral-400'}`} />
                    <span className={`text-xs font-bold ${isSelected ? 'text-black' : 'text-neutral-700'}`}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center gap-2 px-6 py-2.5 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-bold text-black">
                What would you like to do first?
              </h4>
              <p className="text-xs text-neutral-500 mt-0.5 font-medium">
                Pick a starting point to begin issuing certificates right away.
              </p>
            </div>

            <div className="space-y-3">
              {initialActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => onComplete(selectedUseCase, action.id)}
                    className="w-full p-4 rounded-xl border border-neutral-200 hover:border-black hover:bg-neutral-50 text-left transition-all flex items-center gap-4 group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-neutral-100 group-hover:bg-black group-hover:text-white text-black flex items-center justify-center shrink-0 transition-colors border border-neutral-200">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-bold text-xs text-black">
                        {action.title}
                      </h5>
                      <p className="text-[11px] text-neutral-500 mt-0.5 font-medium">{action.desc}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-black transition-colors" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
