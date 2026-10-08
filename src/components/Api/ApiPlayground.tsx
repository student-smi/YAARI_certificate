import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Plus, 
  Trash2, 
  Terminal,
  Zap
} from 'lucide-react';
import { ApiKeyItem } from '../../types';
import { StorageService } from '../../services/storageService';

export const ApiPlayground: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>(StorageService.getApiKeys());
  const [newKeyName, setNewKeyName] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'curl' | 'javascript' | 'python'>('curl');

  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName) return;
    StorageService.addApiKey(newKeyName);
    setApiKeys(StorageService.getApiKeys());
    setNewKeyName('');
  };

  const handleRevoke = (id: string) => {
    StorageService.revokeApiKey(id);
    setApiKeys(StorageService.getApiKeys());
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const sampleSnippet = {
    curl: `curl -X POST https://api.certiforge.io/v1/certificates/generate \\
  -H "Authorization: Bearer cfg_live_9a7fe3b1..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "template_id": "tpl-corporate-excellence",
    "recipient": {
      "name": "Ananya Sharma",
      "course": "Full-Stack AI Architecture",
      "date": "October 15, 2026",
      "email": "ananya.s@institution.edu"
    },
    "auto_email": true
  }'`,
    javascript: `import { CertiForgeClient } from '@certiforge/sdk';

const client = new CertiForgeClient({
  apiKey: process.env.CERTIFORGE_API_KEY
});

const certificate = await client.certificates.generate({
  templateId: 'tpl-corporate-excellence',
  recipient: {
    name: 'Ananya Sharma',
    course: 'Full-Stack AI Architecture',
    date: 'October 15, 2026'
  }
});

console.log('PDF URL:', certificate.pdfUrl);
console.log('Verification URL:', certificate.verificationUrl);`,
    python: `from certiforge import CertiForge

client = CertiForge(api_key="cfg_live_9a7fe3b1...")

cert = client.certificates.generate(
    template_id="tpl-corporate-excellence",
    recipient={
        "name": "Ananya Sharma",
        "course": "Full-Stack AI Architecture",
        "date": "October 15, 2026",
        "email": "ananya.s@institution.edu"
    }
)

print(f"Generated Certificate ID: {cert.id}")
print(f"Download PDF: {cert.download_url}")`
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-150 bg-white text-neutral-900">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
            Developer API & Integration Keys
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Programmatically trigger certificate generation directly from your LMS, HR portal, or backend.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-black bg-neutral-100 px-3 py-1.5 rounded-xl border border-neutral-300">
          <Zap className="w-3.5 h-3.5 text-black" />
          <span>REST API v1 Live</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left: API Keys Manager */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-card p-6 space-y-5">
            <div>
              <h3 className="font-extrabold text-sm text-black">Your API Keys</h3>
              <p className="text-xs text-neutral-500 mt-0.5">Authenticate REST requests using the Bearer Authorization header.</p>
            </div>

            <form onSubmit={handleCreateKey} className="flex gap-2">
              <input
                type="text"
                placeholder="Key name (e.g. Canvas LMS Integration)"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="flex-1 px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:border-black font-medium"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Generate Key</span>
              </button>
            </form>

            <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-xl overflow-hidden">
              {apiKeys.map((key) => (
                <div key={key.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-neutral-50">
                  <div>
                    <p className="font-bold text-black">{key.name}</p>
                    <code className="text-[11px] font-mono text-neutral-500">{key.keyPrefix}</code>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => copyToClipboard(key.keyPrefix, key.id)}
                      className="p-1.5 text-neutral-500 hover:text-black hover:bg-neutral-100 rounded-lg"
                      title="Copy Prefix"
                    >
                      {copiedKey === key.id ? <Check className="w-3.5 h-3.5 text-black font-bold" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleRevoke(key.id)}
                      className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-neutral-100 rounded-lg"
                      title="Revoke Key"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Endpoints Quick Ref */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-card p-6 space-y-4">
            <h3 className="font-bold text-xs text-black uppercase tracking-wider">Supported REST Endpoints</h3>
            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-black mr-2 bg-neutral-200 px-1.5 py-0.5 rounded text-[10px]">POST</span>
                  <span className="text-black font-semibold">/api/v1/certificates/generate</span>
                </div>
                <span className="text-[10px] text-neutral-500">Generate PDF</span>
              </div>

              <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-black mr-2 bg-neutral-200 px-1.5 py-0.5 rounded text-[10px]">GET</span>
                  <span className="text-black font-semibold">/api/v1/verification/{'{id}'}</span>
                </div>
                <span className="text-[10px] text-neutral-500">Query Status</span>
              </div>

              <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-black mr-2 bg-neutral-200 px-1.5 py-0.5 rounded text-[10px]">POST</span>
                  <span className="text-black font-semibold">/api/v1/recipients/import</span>
                </div>
                <span className="text-[10px] text-neutral-500">Batch Ingest</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Code Snippets Playground (20% Pitch Black Accent Frame) */}
        <div className="bg-black rounded-3xl border border-neutral-800 text-white p-6 flex flex-col justify-between shadow-elevated">
          <div>
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-white" />
                <span className="text-xs font-bold text-white">Interactive Code Example</span>
              </div>

              <div className="flex items-center p-0.5 bg-neutral-900 rounded-lg text-xs font-bold border border-neutral-800">
                {(['curl', 'javascript', 'python'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLanguage(lang)}
                    className={`px-2.5 py-1 rounded-md capitalize transition-all ${
                      selectedLanguage === lang ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <pre className="font-mono text-xs text-neutral-300 overflow-x-auto p-2 leading-relaxed">
              <code>{sampleSnippet[selectedLanguage]}</code>
            </pre>
          </div>

          <div className="pt-6 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
            <span>Response: 200 OK (application/pdf, JSON metadata)</span>
            <button
              onClick={() => copyToClipboard(sampleSnippet[selectedLanguage], 'snippet')}
              className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 rounded-lg flex items-center gap-1.5 font-bold transition-colors"
            >
              {copiedKey === 'snippet' ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy Code</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
