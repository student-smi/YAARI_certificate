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
  FolderArchive,
  Copy,
  Share2,
  Sliders
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Project, Template, Recipient } from '../../types';
import { parseSpreadsheetFile, downloadSampleExcel, suggestFieldMappings, ParseResult } from '../../services/excelParser';
import { generateCertificatePreviewDataUrl, generateCertificatePdfBlob, batchGenerateCertificates } from '../../services/pdfGenerator';
import { packageCertificatesToZip, downloadBlobFile } from '../../services/zipPackager';
import { StorageService } from '../../services/storageService';
import { SAMPLE_RECIPIENTS_RAW } from '../../data/sampleData';
import { CORE_CERTIFICATE_ELEMENTS, OPTIONAL_STUDENT_COURSE_ELEMENTS } from '../../data/certificateFields';
import { generateLinkedInAddCertificationUrl } from '../../services/linkedinService';
import { LinkedInEditorModal, LinkedInEditableParams } from '../Verification/LinkedInEditorModal';

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
  const [copiedLinkedinId, setCopiedLinkedinId] = useState<string | null>(null);

  // Per-recipient or batch LinkedIn URL customizer state
  const [editingLinkedInRecipient, setEditingLinkedInRecipient] = useState<{
    id: string;
    name: string;
    organizationName: string;
    issueDate?: string;
    issueYear?: string | number;
    issueMonth?: string | number;
    certId: string;
    certUrl: string;
  } | null>(null);
  const [customRecipientLinkedInMap, setCustomRecipientLinkedInMap] = useState<Record<string, LinkedInEditableParams>>({});

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
      fields.add('issue_date');
      fields.add('completion_date');
    }
    // Also include any fields previously saved in project fieldMapping
    Object.keys(currentProject.fieldMapping).forEach(k => fields.add(k));
    return Array.from(fields);
  }, [activeTemplate, currentProject.fieldMapping]);

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
    const headers = [
      'Full Name', 
      'Student ID', 
      'Course Name', 
      'Issue Date', 
      'Completion Date', 
      'Course Duration', 
      'Grade', 
      'Achievement Level', 
      'Batch', 
      'Email Address'
    ];
    const rows = SAMPLE_RECIPIENTS_RAW.map(r => ({
      'Full Name': r.name,
      'Student ID': r.studentId,
      'Course Name': r.course,
      'Issue Date': r.issueDate,
      'Completion Date': r.completionDate,
      'Course Duration': r.duration,
      'Grade': r.grade,
      'Achievement Level': r.achievementLevel,
      'Batch': r.batch,
      'Email Address': r.email
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
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="font-bold text-xs text-black uppercase tracking-wider">
                Certificate Fields ➔ Spreadsheet Columns
              </h3>
              <span className="text-[10px] text-neutral-400 font-medium">
                Auto-mapped using credential heuristics
              </span>
            </div>

            <div className="space-y-3">
              {templateRequiredFields.map((fieldKey) => {
                const currentVal = currentProject.fieldMapping[fieldKey] || '';
                const availableCols = currentProject.recipients[0] ? Object.keys(currentProject.recipients[0].data) : ['Full Name', 'Course Name', 'Completion Date', 'Issue Date', 'Email Address'];
                const fieldMeta = [...CORE_CERTIFICATE_ELEMENTS, ...OPTIONAL_STUDENT_COURSE_ELEMENTS].find(f => f.key === fieldKey);

                return (
                  <div key={fieldKey} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-black capitalize">
                          {fieldMeta ? fieldMeta.label : fieldKey.replace(/_/g, ' ')}
                        </span>
                        <code className="text-[10px] text-neutral-500 font-mono">
                          {`{{${fieldKey}}}`}
                        </code>
                        {fieldMeta && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            fieldMeta.requirement.startsWith('Required') 
                              ? 'bg-black text-white' 
                              : 'bg-neutral-200 text-neutral-800'
                          }`}>
                            {fieldMeta.requirement.startsWith('Required') ? 'Required' : 'Optional'}
                          </span>
                        )}
                      </div>
                      {fieldMeta && (
                        <p className="text-[10px] text-neutral-500">{fieldMeta.purpose}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 sm:w-72 shrink-0">
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

            {/* Quick add optional field selector */}
            <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
              <span className="text-xs text-neutral-500 font-medium">Want to map another optional column?</span>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    const newKey = e.target.value;
                    const updatedMapping = {
                      ...currentProject.fieldMapping,
                      [newKey]: currentProject.fieldMapping[newKey] || ''
                    };
                    const updatedProj = { ...currentProject, fieldMapping: updatedMapping };
                    setCurrentProject(updatedProj);
                    onUpdateProject(updatedProj);
                    StorageService.saveProject(updatedProj);
                    e.target.value = '';
                  }
                }}
                className="px-2.5 py-1 text-xs font-bold bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded-lg text-black cursor-pointer"
                defaultValue=""
              >
                <option value="" disabled>+ Map Additional Field...</option>
                <optgroup label="Standard Elements">
                  {CORE_CERTIFICATE_ELEMENTS.filter(f => !templateRequiredFields.includes(f.key)).map(f => (
                    <option key={f.key} value={f.key}>{f.label}</option>
                  ))}
                </optgroup>
                <optgroup label="Optional Student & Course Details">
                  {OPTIONAL_STUDENT_COURSE_ELEMENTS.filter(f => !templateRequiredFields.includes(f.key)).map(f => (
                    <option key={f.key} value={f.key}>{f.label}</option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs">
              <strong>Best Practice:</strong> Keep issue date and completion date separate — a certificate may be issued days or weeks after the course ends.
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

          {/* 🎖️ VIRAL LINKEDIN "ADD TO PROFILE" INTEGRATION CARD */}
          <div className="p-6 rounded-2xl bg-white border border-neutral-300 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#0A66C2] text-white flex items-center justify-center shrink-0 shadow-xs">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.65 1.65 0 0 0-1.66 1.66 1.66 1.66 0 0 0 1.66 1.66 1.66 1.66 0 0 0 1.66-1.66 1.65 1.65 0 0 0-1.66-1.66z"/>
                </svg>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm text-black">LinkedIn 1-Click "Add to Profile" Enabled</h3>
                  <span className="text-[10px] font-extrabold bg-[#E8F3FD] text-[#0A66C2] px-2 py-0.5 rounded-md border border-[#B2D5F8]">
                    Viral Organic Traffic
                  </span>
                </div>
                <p className="text-xs text-neutral-500 max-w-xl">
                  Every recipient receives a pre-filled LinkedIn certification link. With 1-click, your Certificate Name, Issuing Organization, Issue Date, and Verification URL are saved to their official profile.
                </p>
              </div>
            </div>

            {currentProject.recipients[0] && (
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <a
                  href={generateLinkedInAddCertificationUrl({
                    name: customRecipientLinkedInMap[currentProject.recipients[0].id]?.name || currentProject.recipients[0].data[currentProject.fieldMapping['course'] || 'course'] || currentProject.recipients[0].data['Course Name'] || currentProject.name,
                    organizationName: customRecipientLinkedInMap[currentProject.recipients[0].id]?.organizationName || currentProject.organizationName || 'CertiForge Verified Issuer',
                    issueDate: currentProject.recipients[0].data[currentProject.fieldMapping['issue_date'] || 'issue_date'] || currentProject.recipients[0].data['Date'],
                    issueYear: customRecipientLinkedInMap[currentProject.recipients[0].id]?.issueYear,
                    issueMonth: customRecipientLinkedInMap[currentProject.recipients[0].id]?.issueMonth,
                    certId: customRecipientLinkedInMap[currentProject.recipients[0].id]?.certId || currentProject.recipients[0].certificateId,
                    certUrl: customRecipientLinkedInMap[currentProject.recipients[0].id]?.certUrl || `${window.location.origin}/#verify/${currentProject.recipients[0].certificateId}`
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-[#0A66C2] hover:bg-[#084e96] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 shrink-0"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.65 1.65 0 0 0-1.66 1.66 1.66 1.66 0 0 0 1.66 1.66 1.66 1.66 0 0 0 1.66-1.66 1.65 1.65 0 0 0-1.66-1.66z"/>
                  </svg>
                  <span>Test Sample Button</span>
                  <ExternalLink className="w-3 h-3 opacity-80" />
                </a>

                <button
                  type="button"
                  onClick={() => {
                    const firstRec = currentProject.recipients[0];
                    const customRec = customRecipientLinkedInMap[firstRec.id];
                    setEditingLinkedInRecipient({
                      id: firstRec.id,
                      name: customRec?.name || firstRec.data[currentProject.fieldMapping['course'] || 'course'] || firstRec.data['Course Name'] || currentProject.name,
                      organizationName: customRec?.organizationName || currentProject.organizationName || 'CertiForge Verified Issuer',
                      issueDate: firstRec.data[currentProject.fieldMapping['issue_date'] || 'issue_date'] || firstRec.data['Date'],
                      issueYear: customRec?.issueYear,
                      issueMonth: customRec?.issueMonth,
                      certId: customRec?.certId || firstRec.certificateId,
                      certUrl: customRec?.certUrl || `${window.location.origin}/#verify/${firstRec.certificateId}`
                    });
                  }}
                  className="px-3.5 py-2.5 bg-white hover:bg-neutral-100 border border-neutral-300 text-black font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Sliders className="w-3.5 h-3.5 text-neutral-600" />
                  <span>Customize Parameters</span>
                </button>
              </div>
            )}
          </div>

          {/* Generated Certificates List */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-black">Generated Certificate Batch</h3>
                <p className="text-xs text-neutral-500">Each recipient has a unique Certificate ID, public verification link, and customizable LinkedIn 1-click link.</p>
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
                    <th className="py-3 px-4">Verification</th>
                    <th className="py-3 px-4 text-right">LinkedIn 1-Click</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-medium">
                  {currentProject.recipients.map((rec) => {
                    const customRec = customRecipientLinkedInMap[rec.id];
                    const name = rec.data[currentProject.fieldMapping['name'] || 'name'] || rec.data['Full Name'] || 'Recipient';
                    const email = rec.data[currentProject.fieldMapping['email'] || 'email'] || rec.data['Email Address'] || '—';
                    const course = customRec?.name || rec.data[currentProject.fieldMapping['course'] || 'course'] || rec.data['Course Name'] || currentProject.name;
                    const org = customRec?.organizationName || currentProject.organizationName || 'CertiForge Verified Issuer';
                    const certId = customRec?.certId || rec.certificateId;
                    const certUrl = customRec?.certUrl || `${window.location.origin}/#verify/${rec.certificateId}`;
                    const issueDate = rec.data[currentProject.fieldMapping['issue_date'] || 'issue_date'] || rec.data['Date'];

                    const recLinkedInUrl = generateLinkedInAddCertificationUrl({
                      name: course,
                      organizationName: org,
                      issueDate,
                      issueYear: customRec?.issueYear,
                      issueMonth: customRec?.issueMonth,
                      certId,
                      certUrl
                    });

                    return (
                      <tr key={rec.id} className="hover:bg-neutral-50/70">
                        <td className="py-3 px-4 font-mono font-bold text-black">
                          {certId}
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
                        <td className="py-3 px-4">
                          <a
                            href={`#verify/${certId}`}
                            onClick={(e) => {
                              e.preventDefault();
                              window.location.hash = `verify/${certId}`;
                              window.dispatchEvent(new HashChangeEvent('hashchange'));
                            }}
                            className="inline-flex items-center gap-1 text-xs font-bold text-black hover:underline"
                          >
                            <span>Verify Online</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <a
                              href={recLinkedInUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0A66C2] hover:bg-[#084e96] text-white text-[11px] font-bold transition-colors shadow-xs"
                              title="Open recipient LinkedIn Add to Profile dialog"
                            >
                              <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.65 1.65 0 0 0-1.66 1.66 1.66 1.66 0 0 0 1.66 1.66 1.66 1.66 0 0 0 1.66-1.66 1.65 1.65 0 0 0-1.66-1.66z"/>
                              </svg>
                              <span>Add</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingLinkedInRecipient({
                                  id: rec.id,
                                  name: course,
                                  organizationName: org,
                                  issueDate,
                                  issueYear: customRec?.issueYear,
                                  issueMonth: customRec?.issueMonth,
                                  certId,
                                  certUrl
                                });
                              }}
                              className={`p-1.5 rounded-lg border transition-colors ${
                                customRec 
                                  ? 'border-amber-300 bg-amber-50 text-amber-900 font-bold' 
                                  : 'border-neutral-300 hover:bg-neutral-100 text-neutral-600 hover:text-black'
                              }`}
                              title="Customize LinkedIn parameters for this recipient"
                            >
                              <Sliders className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(recLinkedInUrl);
                                setCopiedLinkedinId(rec.id);
                                setTimeout(() => setCopiedLinkedinId(null), 2000);
                              }}
                              className="p-1.5 rounded-lg border border-neutral-300 hover:bg-neutral-100 text-neutral-600 hover:text-black transition-colors"
                              title="Copy 1-Click LinkedIn URL"
                            >
                              {copiedLinkedinId === rec.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
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

      {/* LinkedIn URL Parameter Customizer Modal */}
      {editingLinkedInRecipient && (
        <LinkedInEditorModal
          isOpen={!!editingLinkedInRecipient}
          onClose={() => setEditingLinkedInRecipient(null)}
          initialParams={{
            name: editingLinkedInRecipient.name,
            organizationName: editingLinkedInRecipient.organizationName,
            issueDate: editingLinkedInRecipient.issueDate,
            issueYear: editingLinkedInRecipient.issueYear,
            issueMonth: editingLinkedInRecipient.issueMonth,
            certId: editingLinkedInRecipient.certId,
            certUrl: editingLinkedInRecipient.certUrl
          }}
          onSave={(updatedParams) => {
            setCustomRecipientLinkedInMap((prev) => ({
              ...prev,
              [editingLinkedInRecipient.id]: updatedParams
            }));
          }}
        />
      )}

    </div>
  );
};
