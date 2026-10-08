import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  FileSpreadsheet, 
  Download, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  Play, 
  Mail, 
  ExternalLink, 
  RefreshCw, 
  Shuffle, 
  FolderArchive 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Project, Template, Recipient } from '../../types';
import { parseSpreadsheetFile, downloadSampleExcel, suggestFieldMappings, ParseResult } from '../../services/excelParser';
import { generateCertificatePreviewDataUrl, generateCertificatePdfBlob, batchGenerateCertificates } from '../../services/pdfGenerator';
import { packageCertificatesToZip, downloadBlobFile } from '../../services/zipPackager';
import { StorageService } from '../../services/storageService';
import { SAMPLE_RECIPIENTS_RAW } from '../../data/sampleData';

interface ProjectWizardProps {
  project: Project;
  templates: Template[];
  onBack: () => void;
  onUpdateProject: (updated: Project) => void;
  onOpenDesigner: (templateId: string) => void;
  onOpenEmailModal: (project: Project) => void;
}

export const ProjectWizard: React.FC<ProjectWizardProps> = ({
  project,
  templates,
  onBack,
  onUpdateProject,
  onOpenDesigner,
  onOpenEmailModal
}) => {
  // Steps: 1. Template & Setup | 2. Upload Data | 3. Map Fields | 4. Live Preview | 5. Generation | 6. Export & Deliver
  const [currentStep, setCurrentStep] = useState<number>(project.status === 'completed' ? 6 : 1);
  const [currentProject, setCurrentProject] = useState<Project>(project);

  // Upload state
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Preview state
  const [selectedRecipientIndex, setSelectedRecipientIndex] = useState(0);
  const [previewDataUrl, setPreviewDataUrl] = useState<string>('');
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  // Generation state
  const [genProgress, setGenProgress] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const [currentProcessingName, setCurrentProcessingName] = useState('');
  const [generatedPdfMap, setGeneratedPdfMap] = useState<Map<string, { blob: Blob; filename: string }> | null>(null);
  const [isZipping, setIsZipping] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Selected template
  const activeTemplate = templates.find(t => t.id === currentProject.templateId) || templates[0];

  // Certificate dynamic fields required by active template
  const templateRequiredFields = React.useMemo(() => {
    const fields = new Set<string>();
    activeTemplate.elements.forEach(el => {
      if (el.type === 'dynamic_field' && el.fieldKey) {
        fields.add(el.fieldKey);
      }
      const matches = el.content.match(/\{\{([a-zA-Z0-9_]+)\}\}/g);
      if (matches) {
        matches.forEach(m => fields.add(m.replace(/[{}]/g, '')));
      }
    });
    if (fields.size === 0) {
      fields.add('name');
      fields.add('course');
      fields.add('date');
    }
    return Array.from(fields);
  }, [activeTemplate]);

  useEffect(() => {
    if (currentStep === 4 && currentProject.recipients.length > 0) {
      generateCurrentPreview();
    }
  }, [currentStep, selectedRecipientIndex, currentProject.fieldMapping, currentProject.templateId]);

  const generateCurrentPreview = async () => {
    const rec = currentProject.recipients[selectedRecipientIndex] || currentProject.recipients[0];
    if (!rec) return;

    setIsLoadingPreview(true);
    try {
      const url = await generateCertificatePreviewDataUrl({
        template: activeTemplate,
        recipientData: rec.data,
        certificateId: rec.certificateId || `${currentProject.prefix}0001`,
        fieldMapping: currentProject.fieldMapping
      });
      setPreviewDataUrl(url);
    } catch (err) {
      console.error('Preview generation failed', err);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploadError(null);

    try {
      const result: ParseResult = await parseSpreadsheetFile(file);
      const suggested = suggestFieldMappings(templateRequiredFields, result.headers);

      const recipients: Recipient[] = result.rows.map((row, idx) => {
        const certId = row['Certificate ID'] || row['ID'] || `${currentProject.prefix}${String(idx + 1).padStart(5, '0')}`;
        return {
          id: `rec-${idx + 1}`,
          data: row,
          certificateId: certId,
          status: 'valid'
        };
      });

      const updated: Project = {
        ...currentProject,
        recipientsCount: recipients.length,
        recipients,
        fieldMapping: suggested,
        status: 'data_uploaded'
      };

      setCurrentProject(updated);
      onUpdateProject(updated);
      StorageService.saveProject(updated);
      setCurrentStep(3);
    } catch (err: any) {
      setUploadError(err.message || 'Unable to parse file. Please verify format.');
    }
  };

  const handleLoadSampleRecipients = () => {
    const headers = ['Full Name', 'Course Name', 'Completion Date', 'Email Address', 'Grade'];
    const rows = SAMPLE_RECIPIENTS_RAW.map(r => ({
      'Full Name': r.name,
      'Course Name': r.course,
      'Completion Date': r.date,
      'Email Address': r.email,
      'Grade': r.grade
    }));

    const suggested = suggestFieldMappings(templateRequiredFields, headers);

    const recipients: Recipient[] = rows.map((row, idx) => ({
      id: `rec-demo-${idx + 1}`,
      data: row,
      certificateId: `${currentProject.prefix}${String(idx + 1).padStart(5, '0')}`,
      status: 'valid'
    }));

    const updated: Project = {
      ...currentProject,
      recipientsCount: recipients.length,
      recipients,
      fieldMapping: suggested,
      status: 'data_uploaded'
    };

    setCurrentProject(updated);
    onUpdateProject(updated);
    StorageService.saveProject(updated);
    setCurrentStep(3);
  };

  const handleStartGeneration = async () => {
    setCurrentStep(5);
    setGenProgress(0);
    setProcessedCount(0);

    const total = currentProject.recipients.length;

    try {
      const generated = await batchGenerateCertificates(
        activeTemplate,
        currentProject.recipients,
        currentProject.fieldMapping,
        (processed, tot, currentName) => {
          setProcessedCount(processed);
          setCurrentProcessingName(currentName);
          setGenProgress(Math.round((processed / tot) * 100));
        }
      );

      setGeneratedPdfMap(generated);

      const updated: Project = {
        ...currentProject,
        generatedCount: total,
        status: 'completed'
      };

      setCurrentProject(updated);
      onUpdateProject(updated);
      StorageService.saveProject(updated);
      StorageService.updateUsage(total, 0);

      // Async sync to Cloudflare D1 Edge database
      const syncItems = updated.recipients.map(r => ({
        certificateId: r.certificateId || r.id,
        projectId: updated.id,
        recipientName: r.data[updated.fieldMapping['name'] || 'name'] || r.data['Full Name'] || r.data['Name'] || 'Recipient',
        recipientEmail: r.data[updated.fieldMapping['email'] || 'email'] || r.data['Email'] || '',
        courseName: r.data[updated.fieldMapping['course'] || 'course'] || r.data['Course Name'] || updated.name,
        organizationName: updated.organizationName || 'CertiForge Institution',
        issueDate: r.data[updated.fieldMapping['date'] || 'date'] || r.data['Completion Date'] || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      }));
      StorageService.syncCertificatesToCloudflare(syncItems);

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      setCurrentStep(6);
    } catch (err) {
      console.error('Batch generation error:', err);
    }
  };

  const handleDownloadZip = async () => {
    if (!generatedPdfMap || generatedPdfMap.size === 0) {
      handleStartGeneration();
      return;
    }

    setIsZipping(true);
    try {
      const zipBlob = await packageCertificatesToZip(
        generatedPdfMap,
        currentProject.name,
        (pct) => setGenProgress(pct)
      );
      downloadBlobFile(zipBlob, `${currentProject.name.toLowerCase().replace(/\s+/g, '_')}_certificates.zip`);
    } catch (err) {
      console.error('ZIP generation failed', err);
    } finally {
      setIsZipping(false);
    }
  };

  const handleDownloadSinglePdf = async () => {
    const rec = currentProject.recipients[selectedRecipientIndex] || currentProject.recipients[0];
    if (!rec) return;

    const blob = await generateCertificatePdfBlob({
      template: activeTemplate,
      recipientData: rec.data,
      certificateId: rec.certificateId,
      fieldMapping: currentProject.fieldMapping
    });

    const recName = rec.data[currentProject.fieldMapping['name'] || 'name'] || 'Recipient';
    downloadBlobFile(blob, `${rec.certificateId}_${recName.replace(/\s+/g, '_')}.pdf`);
  };

  const stepsList = [
    { num: 1, label: 'Template' },
    { num: 2, label: 'Upload Data' },
    { num: 3, label: 'Map Fields' },
    { num: 4, label: 'Live Preview' },
    { num: 5, label: 'Bulk Generate' },
    { num: 6, label: 'Download & Deliver' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200 bg-white text-neutral-900">
      
      {/* Top Breadcrumb & Step Navigation Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl text-neutral-500 hover:text-black hover:bg-neutral-100 transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-black bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                CAMPAIGN WIZARD
              </span>
              <span className="text-neutral-300">•</span>
              <span className="text-xs text-neutral-500 font-mono">Prefix: {currentProject.prefix}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-black mt-0.5">{currentProject.name}</h1>
          </div>
        </div>

        {/* Step Progress Pills (80% White, 20% Black) */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {stepsList.map((s) => {
            const isCompleted = currentStep > s.num;
            const isCurrent = currentStep === s.num;

            return (
              <button
                key={s.num}
                onClick={() => {
                  if (currentStep > s.num || (s.num <= 4 && currentProject.recipients.length > 0)) {
                    setCurrentStep(s.num);
                  }
                }}
                disabled={currentStep < s.num && currentProject.recipients.length === 0}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  isCurrent
                    ? 'bg-black text-white shadow-xs'
                    : isCompleted
                    ? 'bg-neutral-100 text-black border border-neutral-300 hover:bg-neutral-200'
                    : 'bg-neutral-50 text-neutral-400 cursor-not-allowed border border-neutral-200'
                }`}
              >
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                  isCurrent ? 'bg-white/20 text-white' : isCompleted ? 'bg-black text-white' : 'bg-neutral-200 text-neutral-600'
                }`}>
                  {isCompleted ? <Check className="w-2.5 h-2.5" /> : s.num}
                </span>
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 1: CHOOSE TEMPLATE & PROJECT DETAILS */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-black">1. Select Certificate Template</h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Choose the foundation layout for this campaign. You can also customize it in the Drag & Drop Studio.
              </p>
            </div>
            <button
              onClick={() => onOpenDesigner(activeTemplate.id)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold text-black bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-black" />
              <span>Customize in Studio</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {templates.map((tpl) => {
              const isSelected = tpl.id === currentProject.templateId;

              return (
                <div
                  key={tpl.id}
                  onClick={() => {
                    const upd = { ...currentProject, templateId: tpl.id };
                    setCurrentProject(upd);
                    onUpdateProject(upd);
                    StorageService.saveProject(upd);
                  }}
                  className={`rounded-2xl border p-4 cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-2 border-black bg-neutral-50/50 shadow-elevated'
                      : 'border-neutral-200 hover:border-neutral-400 bg-white hover:shadow-card'
                  }`}
                >
                  <div>
                    {/* Simulated visual card */}
                    <div className="aspect-[1.414/1] rounded-lg border border-neutral-300 bg-white p-4 flex flex-col items-center justify-center text-center relative overflow-hidden mb-3">
                      <div className="text-[8px] font-bold tracking-widest text-neutral-400 uppercase">
                        {tpl.category}
                      </div>
                      <div className="font-serif font-bold text-xs text-black mt-1 line-clamp-1">
                        {tpl.name}
                      </div>
                      <div className="w-16 h-0.5 bg-black my-1" />
                      <div className="text-[9px] text-neutral-500 font-serif italic">
                        Recipient Full Name
                      </div>
                      <div className="absolute bottom-2 left-2 text-[7px] text-neutral-400 font-mono">
                        QR Verified
                      </div>
                    </div>

                    <h4 className="font-bold text-sm text-black">{tpl.name}</h4>
                    <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{tpl.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-black bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded">
                      {tpl.orientation}
                    </span>
                    {isSelected ? (
                      <span className="text-xs font-bold text-black flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Selected
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-neutral-400">Select</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-6 border-t border-neutral-200 flex justify-end">
            <button
              onClick={() => setCurrentStep(2)}
              className="flex items-center gap-2 px-6 py-2.5 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
            >
              <span>Next: Upload Recipient Data</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: EXCEL / CSV IMPORT */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-black">2. Upload Recipient Data</h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Import recipients from Microsoft Excel (.xlsx, .xls) or Comma-Separated Values (.csv).
              </p>
            </div>
            
            <button
              onClick={downloadSampleExcel}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-black bg-white hover:bg-neutral-50 border border-neutral-300 shadow-xs transition-all"
            >
              <Download className="w-3.5 h-3.5 text-black" />
              <span>Download Sample Excel</span>
            </button>
          </div>

          {/* Drag & drop upload box */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileUpload(e.dataTransfer.files[0]);
              }
            }}
            className="border-2 border-dashed border-neutral-300 hover:border-black rounded-2xl p-10 text-center cursor-pointer transition-all bg-white group shadow-xs"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />

            <div className="w-14 h-14 rounded-2xl bg-neutral-100 group-hover:bg-neutral-200 text-black flex items-center justify-center mx-auto mb-3 border border-neutral-200 transition-colors">
              <FileSpreadsheet className="w-7 h-7 text-black" />
            </div>

            <h3 className="font-bold text-base text-black mb-1">
              Drop your Excel or CSV file here
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-4">
              Supports .xlsx, .xls, and .csv files up to 25,000 rows. No manual row limits.
            </p>

            <button
              type="button"
              className="px-4 py-2 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              Browse Files
            </button>
          </div>

          {/* Instant sample button for easy testing */}
          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-neutral-700">
              <Sparkles className="w-4 h-4 text-black shrink-0" />
              <span>Don't have a spreadsheet ready? Load pre-configured sample recipients with 1 click.</span>
            </div>
            <button
              onClick={handleLoadSampleRecipients}
              className="px-4 py-1.5 bg-white hover:bg-neutral-50 border border-neutral-300 text-black font-bold rounded-lg shadow-xs transition-all shrink-0"
            >
              Load 12 Sample Recipients
            </button>
          </div>

          {uploadError && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          <div className="pt-6 border-t border-neutral-200 flex justify-between">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-5 py-2.5 border border-neutral-300 text-black font-semibold text-xs rounded-xl hover:bg-neutral-50 transition-colors"
            >
              Back
            </button>
            {currentProject.recipients.length > 0 && (
              <button
                onClick={() => setCurrentStep(3)}
                className="flex items-center gap-2 px-6 py-2.5 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
              >
                <span>Continue with {currentProject.recipients.length} Recipients</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* STEP 3: VISUAL FIELD MAPPING */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-base font-bold text-black">3. Map Data Fields</h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Connect the certificate placeholders with the matching columns from your spreadsheet.
            </p>
          </div>

          {/* Validation Banner */}
          <div className="p-4 rounded-xl bg-neutral-100 border border-neutral-300 text-black flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-black" />
              <span>
                Ready to generate <strong>{currentProject.recipients.length} certificates</strong>.
              </span>
            </div>
            <span className="text-neutral-700">
              Template: {activeTemplate.name}
            </span>
          </div>

          {/* Mapping Grid */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-card p-6 space-y-4">
            <h3 className="font-bold text-xs text-black uppercase tracking-wider border-b border-neutral-100 pb-3">
              Certificate Fields ➔ Spreadsheet Columns
            </h3>

            <div className="space-y-3">
              {templateRequiredFields.map((fieldKey) => {
                const currentVal = currentProject.fieldMapping[fieldKey] || '';
                const availableCols = currentProject.recipients[0] ? Object.keys(currentProject.recipients[0].data) : ['Full Name', 'Course Name', 'Completion Date', 'Email Address'];

                return (
                  <div key={fieldKey} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-black text-white font-mono text-[11px] font-bold flex items-center justify-center">
                        T
                      </div>
                      <div>
                        <span className="text-xs font-bold text-black capitalize">
                          {fieldKey.replace(/_/g, ' ')}
                        </span>
                        <code className="ml-2 text-[10px] text-neutral-600 font-mono">
                          {`{{${fieldKey}}}`}
                        </code>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:w-72">
                      <span className="text-xs text-neutral-400">maps to</span>
                      <select
                        value={currentVal}
                        onChange={(e) => {
                          const updatedMapping = {
                            ...currentProject.fieldMapping,
                            [fieldKey]: e.target.value
                          };
                          const updatedProj = { ...currentProject, fieldMapping: updatedMapping };
                          setCurrentProject(updatedProj);
                          onUpdateProject(updatedProj);
                          StorageService.saveProject(updatedProj);
                        }}
                        className="w-full px-3 py-1.5 text-xs font-bold bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                      >
                        <option value="">-- Choose Column --</option>
                        {availableCols.map((col) => (
                          <option key={col} value={col}>
                            {col}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-6 border-t border-neutral-200 flex justify-between">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-5 py-2.5 border border-neutral-300 text-black font-semibold text-xs rounded-xl hover:bg-neutral-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              className="flex items-center gap-2 px-6 py-2.5 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
            >
              <span>Next: Live Recipient Preview</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: LIVE PREVIEW */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-black">4. Live Certificate Preview</h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Verify exactly how personalized certificates will render before running the bulk generator.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const rand = Math.floor(Math.random() * currentProject.recipients.length);
                  setSelectedRecipientIndex(rand);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-300 bg-white text-xs font-bold text-black hover:bg-neutral-50 shadow-xs"
              >
                <Shuffle className="w-3.5 h-3.5 text-neutral-500" />
                <span>Random Record</span>
              </button>

              <select
                value={selectedRecipientIndex}
                onChange={(e) => setSelectedRecipientIndex(Number(e.target.value))}
                className="px-3 py-1.5 rounded-lg border border-neutral-300 bg-white text-xs font-bold text-black focus:outline-none"
              >
                {currentProject.recipients.map((r, i) => {
                  const rName = r.data[currentProject.fieldMapping['name'] || 'name'] || `Recipient #${i + 1}`;
                  return (
                    <option key={r.id} value={i}>
                      Record {i + 1}: {rName}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="p-4 sm:p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-elevated text-center flex flex-col items-center justify-center">
            {isLoadingPreview ? (
              <div className="py-24 space-y-3">
                <RefreshCw className="w-8 h-8 text-white animate-spin mx-auto" />
                <p className="text-xs text-neutral-400">Rendering high-resolution vector preview...</p>
              </div>
            ) : previewDataUrl ? (
              <div className="max-w-4xl w-full shadow-2xl rounded-lg overflow-hidden border border-neutral-700">
                <img
                  src={previewDataUrl}
                  alt="Certificate Live Preview"
                  className="w-full h-auto object-contain block bg-white"
                />
              </div>
            ) : (
              <div className="py-20 text-neutral-400 text-xs">Preview unavailable</div>
            )}

            <div className="mt-4 flex items-center justify-between w-full max-w-4xl text-xs text-neutral-400 px-2 font-medium">
              <span>Previewing Recipient {selectedRecipientIndex + 1} of {currentProject.recipients.length}</span>
              <button
                onClick={handleDownloadSinglePdf}
                className="text-white hover:underline font-bold flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Sample Single PDF</span>
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-neutral-200 flex justify-between">
            <button
              onClick={() => setCurrentStep(3)}
              className="px-5 py-2.5 border border-neutral-300 text-black font-semibold text-xs rounded-xl hover:bg-neutral-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleStartGeneration}
              className="flex items-center gap-2 px-7 py-3 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Looks Good — Generate {currentProject.recipients.length} Certificates</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: BULK GENERATION ENGINE */}
      {currentStep === 5 && (
        <div className="max-w-2xl mx-auto py-12 text-center space-y-8">
          <div className="w-16 h-16 rounded-2xl bg-neutral-100 text-black border border-neutral-200 flex items-center justify-center mx-auto shadow-xs">
            <RefreshCw className="w-8 h-8 animate-spin text-black" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-black tracking-tight">
              Generating Certificates...
            </h2>
            <p className="text-xs text-neutral-500">
              Processing <strong className="text-black">{currentProcessingName || 'batch items'}</strong>
            </p>
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <div className="w-full h-3 rounded-full bg-neutral-100 overflow-hidden p-0.5 border border-neutral-300">
              <div 
                className="h-full rounded-full bg-black transition-all duration-150"
                style={{ width: `${genProgress}%` }}
              />
            </div>

            <div className="flex justify-between text-xs font-bold text-black font-mono">
              <span>{processedCount} / {currentProject.recipients.length} complete</span>
              <span>{genProgress}%</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 max-w-md mx-auto text-left text-xs text-neutral-600 space-y-1 font-mono">
            <p>✓ Initialized 300 DPI vector rendering pipeline</p>
            <p>✓ Injected cryptographic QR verification payloads</p>
            <p className="text-black font-bold">➔ Rendering PDF batch asynchronously without server lock</p>
          </div>
        </div>
      )}

      {/* STEP 6: OUTPUT & DELIVERY */}
      {currentStep === 6 && (
        <div className="space-y-8">
          <div className="p-6 sm:p-8 rounded-3xl bg-neutral-100 border border-neutral-300 text-black flex flex-col sm:flex-row items-center justify-between gap-6 shadow-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center shrink-0 shadow-xs">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-black">
                  {currentProject.generatedCount || currentProject.recipients.length} Certificates Generated Successfully!
                </h2>
                <p className="text-xs sm:text-sm text-neutral-600 mt-0.5 font-medium">
                  All certificates have been rendered in print-ready vector quality with QR verification links.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleDownloadZip}
                disabled={isZipping}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
              >
                <FolderArchive className="w-4 h-4" />
                <span>{isZipping ? 'Compressing ZIP...' : 'Download ZIP Archive'}</span>
              </button>

              <button
                onClick={() => onOpenEmailModal(currentProject)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-white hover:bg-neutral-50 border border-neutral-300 text-black font-bold text-xs rounded-xl shadow-xs transition-all"
              >
                <Mail className="w-4 h-4 text-black" />
                <span>Email Certificates</span>
              </button>
            </div>
          </div>

          {/* Generated Certificates List */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-black">Generated Certificate Batch</h3>
                <p className="text-xs text-neutral-500">Each recipient has a unique Certificate ID and public verification link.</p>
              </div>
              <button
                onClick={handleDownloadSinglePdf}
                className="text-xs font-bold text-black hover:underline flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Sample PDF</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-neutral-50 text-neutral-500 font-extrabold uppercase tracking-wider border-b border-neutral-200">
                  <tr>
                    <th className="py-3 px-4">Certificate ID</th>
                    <th className="py-3 px-4">Recipient Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-medium">
                  {currentProject.recipients.map((rec) => {
                    const name = rec.data[currentProject.fieldMapping['name'] || 'name'] || rec.data['Full Name'] || 'Recipient';
                    const email = rec.data[currentProject.fieldMapping['email'] || 'email'] || rec.data['Email Address'] || '—';

                    return (
                      <tr key={rec.id} className="hover:bg-neutral-50/70">
                        <td className="py-3 px-4 font-mono font-bold text-black">
                          {rec.certificateId}
                        </td>
                        <td className="py-3 px-4 font-bold text-black">
                          {name}
                        </td>
                        <td className="py-3 px-4 text-neutral-500">
                          {email}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-black bg-neutral-100 border border-neutral-300 px-2 py-0.5 rounded-full">
                            <Check className="w-3 h-3 text-black" /> Ready
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <a
                            href={`#verify/${rec.certificateId}`}
                            onClick={(e) => {
                              e.preventDefault();
                              window.location.hash = `verify/${rec.certificateId}`;
                              window.dispatchEvent(new HashChangeEvent('hashchange'));
                            }}
                            className="inline-flex items-center gap-1 text-xs font-bold text-black hover:underline"
                          >
                            <span>Verify Online</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-4 flex justify-between">
            <button
              onClick={onBack}
              className="px-5 py-2.5 border border-neutral-300 text-black font-semibold text-xs rounded-xl hover:bg-neutral-50 transition-colors"
            >
              Return to Dashboard
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              className="px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-black font-bold text-xs rounded-xl transition-colors"
            >
              Modify Design / Re-preview
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
