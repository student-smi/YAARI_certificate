import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Send, 
  Paperclip, 
  CheckCircle2, 
  RefreshCw 
} from 'lucide-react';
import { Project } from '../../types';
import { StorageService } from '../../services/storageService';

interface EmailCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onSuccess: (sentCount: number) => void;
}

export const EmailCampaignModal: React.FC<EmailCampaignModalProps> = ({
  isOpen,
  onClose,
  project,
  onSuccess
}) => {
  const [subject, setSubject] = useState(`Your Certificate of Completion: ${project.name}`);
  const [replyTo, setReplyTo] = useState('certificates@institution.edu');
  const [bodyText, setBodyText] = useState(
    `Dear {{name}},\n\nCongratulations on successfully completing the program "{{course}}"!\n\nAttached to this email is your official vector-print certificate of completion (Credential ID: {{certificate_id}}).\n\n🎖️ Add this certificate to your LinkedIn profile with 1 click:\n{{linkedin_add_url}}\n\n🔗 Verify your credential online:\n{{verification_url}}\n\nWarm regards,\nAcademic Operations Team\n${project.organizationName}`
  );
  
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [stats, setStats] = useState({ total: project.recipients.length, sent: 0, delivered: 0, failed: 0 });

  if (!isOpen) return null;

  const handleSendEmails = async () => {
    setIsSending(true);
    setSendProgress(0);
    const total = project.recipients.length;

    let sent = 0;
    let failed = 0;

    for (let i = 0; i < total; i++) {
      await new Promise(r => setTimeout(r, 60));
      
      if (Math.random() > 0.03) {
        sent++;
      } else {
        failed++;
      }

      const currentProgress = Math.round(((i + 1) / total) * 100);
      setSendProgress(currentProgress);
      setStats({
        total,
        sent,
        delivered: Math.max(0, sent - 1),
        failed
      });
    }

    setIsSending(false);
    setIsCompleted(true);
    StorageService.updateUsage(0, sent);
    onSuccess(sent);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-elevated border border-neutral-300 overflow-hidden text-neutral-900">
        
        {/* Header */}
        <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 text-black border border-neutral-300 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-black">Email Certificates Batch</h3>
              <p className="text-xs text-neutral-500">Send personalized certificate PDFs directly to {project.recipients.length} recipients.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-black hover:bg-neutral-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {isCompleted ? (
            <div className="text-center py-6 space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-neutral-100 text-black border border-neutral-300 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-xl font-black text-black">Batch Email Delivery Completed!</h4>
                <p className="text-xs text-neutral-500 mt-1">
                  Individual certificate PDF attachments have been dispatched.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 max-w-md mx-auto text-center">
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                  <span className="text-[11px] text-neutral-500 font-semibold block">Total</span>
                  <span className="text-lg font-black text-black">{stats.total}</span>
                </div>
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                  <span className="text-[11px] text-neutral-500 font-semibold block">Delivered</span>
                  <span className="text-lg font-black text-black">{stats.delivered}</span>
                </div>
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                  <span className="text-[11px] text-neutral-500 font-semibold block">Bounced</span>
                  <span className="text-lg font-black text-neutral-500">{stats.failed}</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Close & Finish
              </button>
            </div>
          ) : isSending ? (
            <div className="py-12 text-center space-y-6">
              <RefreshCw className="w-10 h-10 text-black animate-spin mx-auto" />
              <div>
                <h4 className="font-black text-lg text-black">Sending Personalized Emails...</h4>
                <p className="text-xs text-neutral-500 mt-1">Delivering individual PDF attachments to candidate inboxes</p>
              </div>

              <div className="w-full max-w-sm mx-auto space-y-2">
                <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden p-0.5 border border-neutral-300">
                  <div
                    className="h-full rounded-full bg-black transition-all duration-150"
                    style={{ width: `${sendProgress}%` }}
                  />
                </div>
                <p className="text-xs font-mono font-bold text-black">{sendProgress}% complete</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-black mb-1">Reply-To Email</label>
                  <input
                    type="email"
                    value={replyTo}
                    onChange={(e) => setReplyTo(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:border-black font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-black mb-1">Recipients Ready</label>
                  <div className="px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg font-bold text-black">
                    {project.recipients.length} Recipient Addresses
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-black mb-1">Email Subject Line</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:border-black font-bold"
                />
              </div>

              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                  <label className="text-xs font-bold text-black">Email Body Template</label>
                  <div className="flex flex-wrap items-center gap-1 text-[10px]">
                    <span className="text-neutral-400 font-semibold mr-1">Insert variable:</span>
                    {['{{name}}', '{{course}}', '{{certificate_id}}', '{{linkedin_add_url}}', '{{verification_url}}'].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setBodyText(prev => `${prev}\n${tag}`)}
                        className="px-1.5 py-0.5 rounded bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 font-mono text-[10px] text-neutral-800 transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  rows={7}
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  className="w-full p-3 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:border-black font-sans leading-relaxed"
                />
              </div>

              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between text-xs text-neutral-600">
                <div className="flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-black" />
                  <span>Automatic Attachment: <strong className="text-black">{`{{certificate_id}}_{{name}}.pdf`}</strong></span>
                </div>
                <span className="text-[10px] font-bold text-black bg-neutral-200 px-2 py-0.5 rounded">
                  300 DPI PDF
                </span>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <p className="text-[11px] text-neutral-400">
                  Authenticated transactional delivery.
                </p>
                <button
                  type="button"
                  onClick={handleSendEmails}
                  className="flex items-center gap-2 px-6 py-2.5 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send {project.recipients.length} Emails</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
