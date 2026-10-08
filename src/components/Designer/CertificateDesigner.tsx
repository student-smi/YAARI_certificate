import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Undo, 
  Redo, 
  ZoomIn, 
  ZoomOut, 
  Grid, 
  Type, 
  Sparkles, 
  PenTool, 
  QrCode, 
  Award, 
  Minus, 
  Trash2, 
  Copy, 
  Lock, 
  Unlock, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Sliders, 
  Check 
} from 'lucide-react';
import { Template, TemplateElement, ElementType } from '../../types';
import { generateCertificatePreviewDataUrl } from '../../services/pdfGenerator';
import { StorageService } from '../../services/storageService';

interface CertificateDesignerProps {
  initialTemplate: Template;
  onBack: () => void;
  onSaveTemplate: (updated: Template) => void;
}

export const CertificateDesigner: React.FC<CertificateDesignerProps> = ({
  initialTemplate,
  onBack,
  onSaveTemplate
}) => {
  const [template, setTemplate] = useState<Template>(initialTemplate);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(
    initialTemplate.elements[0]?.id || null
  );
  const [isAdvancedMode, setIsAdvancedMode] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  // History for Undo / Redo
  const [history, setHistory] = useState<Template[]>([initialTemplate]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  // Live Test Modal
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testPreviewUrl, setTestPreviewUrl] = useState('');

  // Selected element helper
  const selectedElement = template.elements.find(el => el.id === selectedElementId);

  // Autosave trigger with debounce
  useEffect(() => {
    setSaveStatus('unsaved');
    const timer = setTimeout(() => {
      setSaveStatus('saving');
      StorageService.saveTemplate(template);
      onSaveTemplate(template);
      setTimeout(() => setSaveStatus('saved'), 400);
    }, 800);

    return () => clearTimeout(timer);
  }, [template]);

  const pushHistory = (newTemplate: Template) => {
    const updated = history.slice(0, historyIndex + 1);
    updated.push(newTemplate);
    setHistory(updated);
    setHistoryIndex(updated.length - 1);
    setTemplate(newTemplate);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setTemplate(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setTemplate(history[historyIndex + 1]);
    }
  };

  const handleAddElement = (type: ElementType, defaultText = 'New Element', fieldKey?: string) => {
    const newEl: TemplateElement = {
      id: `el-${Date.now()}`,
      type,
      x: 50,
      y: 50,
      width: type === 'line' ? 40 : type === 'qr' ? 10 : 60,
      height: type === 'line' ? 1 : type === 'qr' ? 10 : 8,
      zIndex: template.elements.length + 1,
      content: defaultText,
      fieldKey: fieldKey || (type === 'dynamic_field' ? 'name' : undefined),
      fontSettings: {
        family: type === 'signature' ? 'Great Vibes' : 'Plus Jakarta Sans',
        size: type === 'signature' ? 28 : 18,
        weight: '600',
        color: '#000000',
        align: 'center',
        letterSpacing: 0,
        lineHeight: 1.2
      }
    };

    const updated = {
      ...template,
      elements: [...template.elements, newEl]
    };
    pushHistory(updated);
    setSelectedElementId(newEl.id);
  };

  const handleUpdateSelected = (props: Partial<TemplateElement>) => {
    if (!selectedElementId) return;

    const updatedElements = template.elements.map(el => {
      if (el.id === selectedElementId) {
        return { ...el, ...props };
      }
      return el;
    });

    const updated = { ...template, elements: updatedElements };
    pushHistory(updated);
  };

  const handleUpdateFont = (props: Partial<TemplateElement['fontSettings']>) => {
    if (!selectedElement || !selectedElement.fontSettings) return;

    handleUpdateSelected({
      fontSettings: {
        ...selectedElement.fontSettings,
        ...props
      }
    });
  };

  const handleDeleteElement = (id: string) => {
    const filtered = template.elements.filter(el => el.id !== id);
    const updated = { ...template, elements: filtered };
    pushHistory(updated);
    setSelectedElementId(filtered[0]?.id || null);
  };

  const handleDuplicateElement = (el: TemplateElement) => {
    const dup: TemplateElement = {
      ...el,
      id: `el-${Date.now()}`,
      x: Math.min(90, el.x + 4),
      y: Math.min(90, el.y + 4),
      zIndex: template.elements.length + 1
    };
    const updated = { ...template, elements: [...template.elements, dup] };
    pushHistory(updated);
    setSelectedElementId(dup.id);
  };

  const handleLayerOrder = (direction: 'up' | 'down') => {
    if (!selectedElement) return;
    const delta = direction === 'up' ? 1 : -1;
    handleUpdateSelected({ zIndex: Math.max(1, (selectedElement.zIndex || 1) + delta) });
  };

  const handleMouseDown = (e: React.MouseEvent, elId: string) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const el = template.elements.find(item => item.id === elId);
    if (!el || el.isLocked) return;

    setSelectedElementId(elId);
    setIsDragging(true);

    const clientXPercent = ((e.clientX - rect.left) / rect.width) * 100;
    const clientYPercent = ((e.clientY - rect.top) / rect.height) * 100;
    setDragOffset({
      x: clientXPercent - el.x,
      y: clientYPercent - el.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedElementId || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();

    let newXPercent = ((e.clientX - rect.left) / rect.width) * 100 - dragOffset.x;
    let newYPercent = ((e.clientY - rect.top) / rect.height) * 100 - dragOffset.y;

    if (showGrid) {
      newXPercent = Math.round(newXPercent / 2) * 2;
      newYPercent = Math.round(newYPercent / 2) * 2;
    }

    newXPercent = Math.max(5, Math.min(95, newXPercent));
    newYPercent = Math.max(5, Math.min(95, newYPercent));

    const updatedElements = template.elements.map(el => {
      if (el.id === selectedElementId) {
        return { ...el, x: newXPercent, y: newYPercent };
      }
      return el;
    });

    setTemplate({ ...template, elements: updatedElements });
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      pushHistory(template);
    }
  };

  const handleOpenLivePreview = async () => {
    const url = await generateCertificatePreviewDataUrl({
      template,
      recipientData: {
        'name': 'Ananya Sharma',
        'course': 'Full-Stack Architecture & AI Mastery',
        'date': 'October 15, 2026',
        'email': 'ananya.s@institution.edu'
      },
      certificateId: 'CERT-2026-DEMO'
    });
    setTestPreviewUrl(url);
    setTestModalOpen(true);
  };

  return (
    <div 
      className="flex flex-col h-[calc(100vh-4rem)] bg-neutral-100 overflow-hidden select-none text-neutral-900"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      
      {/* 1. TOP TOOLBAR (80% White, 20% Black) */}
      <div className="h-14 bg-white border-b border-neutral-200 px-4 flex items-center justify-between shrink-0 z-30">
        
        {/* Left: Back & Template Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg text-neutral-600 hover:text-black hover:bg-neutral-100 transition-colors"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={template.name}
              onChange={(e) => setTemplate({ ...template, name: e.target.value })}
              className="font-bold text-xs sm:text-sm text-black bg-transparent hover:bg-neutral-50 px-1.5 py-0.5 rounded border border-transparent hover:border-neutral-300 focus:outline-none focus:border-black"
            />
            <span className="text-[11px] font-semibold text-neutral-400 flex items-center gap-1">
              {saveStatus === 'saved' && <><Check className="w-3 h-3 text-black" /> Saved</>}
              {saveStatus === 'saving' && <span className="text-black">Saving...</span>}
              {saveStatus === 'unsaved' && <span className="text-neutral-400">Unsaved</span>}
            </span>
          </div>
        </div>

        {/* Center: Controls (Undo, Redo, Zoom, Grid, Simple/Advanced mode) */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          
          {/* Mode Switch (Simple vs Advanced) */}
          <div className="flex items-center p-0.5 bg-neutral-100 rounded-lg text-xs font-bold text-neutral-700 border border-neutral-200">
            <button
              onClick={() => setIsAdvancedMode(false)}
              className={`px-3 py-1 rounded-md transition-all ${
                !isAdvancedMode ? 'bg-black text-white shadow-xs' : 'hover:text-black'
              }`}
            >
              Simple Mode
            </button>
            <button
              onClick={() => setIsAdvancedMode(true)}
              className={`px-3 py-1 rounded-md transition-all ${
                isAdvancedMode ? 'bg-black text-white shadow-xs' : 'hover:text-black'
              }`}
            >
              Advanced Mode
            </button>
          </div>

          <div className="h-4 w-px bg-neutral-200 hidden sm:block" />

          {/* Undo / Redo */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="p-1.5 rounded-lg text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Undo"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-1.5 rounded-lg text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Redo"
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>

          <div className="h-4 w-px bg-neutral-200 hidden sm:block" />

          {/* Zoom controls */}
          <div className="flex items-center gap-1 text-xs text-neutral-700">
            <button
              onClick={() => setZoomLevel(Math.max(60, zoomLevel - 10))}
              className="p-1.5 rounded-lg hover:bg-neutral-100"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="w-10 text-center font-mono font-bold text-black">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel(Math.min(140, zoomLevel + 10))}
              className="p-1.5 rounded-lg hover:bg-neutral-100"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Grid toggle */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              showGrid ? 'bg-black text-white' : 'text-neutral-500 hover:bg-neutral-100'
            }`}
            title="Toggle Snap Grid"
          >
            <Grid className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Preview CTA */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenLivePreview}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 text-black text-xs font-bold shadow-xs"
          >
            <Eye className="w-3.5 h-3.5 text-neutral-600" />
            <span>Test Preview</span>
          </button>
          <button
            onClick={() => {
              StorageService.saveTemplate(template);
              onSaveTemplate(template);
              setSaveStatus('saved');
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-black hover:bg-neutral-800 text-white text-xs font-bold shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Template</span>
          </button>
        </div>

      </div>

      {/* 2. MAIN 3-COLUMN WORKSPACE (80% White Surfaces, 20% Black) */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT PANEL: ELEMENTS PALETTE */}
        <div className="w-64 bg-white border-r border-neutral-200 p-4 overflow-y-auto shrink-0 space-y-5">
          <div>
            <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 mb-1.5">
              Dynamic Fields
            </h3>
            <p className="text-[11px] text-neutral-500 mb-2.5">
              Replaced automatically from Excel data.
            </p>
            <div className="grid grid-cols-1 gap-1.5">
              {[
                { label: 'Recipient Name', key: 'name', icon: Type, defaultText: '{{name}}' },
                { label: 'Course / Program', key: 'course', icon: Sparkles, defaultText: '{{course}}' },
                { label: 'Issue Date', key: 'date', icon: Type, defaultText: '{{date}}' },
                { label: 'Certificate ID', key: 'certificate_id', icon: Award, defaultText: '{{certificate_id}}' },
                { label: 'Organization', key: 'organization', icon: Type, defaultText: '{{organization}}' },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleAddElement('dynamic_field', item.defaultText, item.key)}
                  className="w-full text-left p-2 rounded-lg border border-neutral-200 hover:border-black hover:bg-neutral-50 flex items-center justify-between text-xs font-bold text-neutral-800 group transition-all"
                >
                  <div className="flex items-center gap-2">
                    <item.icon className="w-3.5 h-3.5 text-black" />
                    <span>{item.label}</span>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-mono group-hover:text-black">
                    +{`{{${item.key}}}`}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 mb-1.5">
              Static Elements
            </h3>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => handleAddElement('text', 'CERTIFICATE OF EXCELLENCE')}
                className="p-2.5 rounded-lg border border-neutral-200 hover:border-black text-left text-xs font-bold text-neutral-800 hover:bg-neutral-50 flex flex-col gap-1.5"
              >
                <Type className="w-4 h-4 text-black" />
                <span>Text Block</span>
              </button>

              <button
                onClick={() => handleAddElement('signature', 'Arthur Sterling')}
                className="p-2.5 rounded-lg border border-neutral-200 hover:border-black text-left text-xs font-bold text-neutral-800 hover:bg-neutral-50 flex flex-col gap-1.5"
              >
                <PenTool className="w-4 h-4 text-black" />
                <span>Signature</span>
              </button>

              <button
                onClick={() => handleAddElement('qr', 'https://certiforge.io/verify/{{certificate_id}}')}
                className="p-2.5 rounded-lg border border-neutral-200 hover:border-black text-left text-xs font-bold text-neutral-800 hover:bg-neutral-50 flex flex-col gap-1.5"
              >
                <QrCode className="w-4 h-4 text-black" />
                <span>QR Code</span>
              </button>

              <button
                onClick={() => handleAddElement('seal', 'OFFICIAL')}
                className="p-2.5 rounded-lg border border-neutral-200 hover:border-black text-left text-xs font-bold text-neutral-800 hover:bg-neutral-50 flex flex-col gap-1.5"
              >
                <Award className="w-4 h-4 text-black" />
                <span>Gold Seal</span>
              </button>

              <button
                onClick={() => handleAddElement('line', '')}
                className="col-span-2 p-2 rounded-lg border border-neutral-200 hover:border-black text-left text-xs font-bold text-neutral-800 hover:bg-neutral-50 flex items-center gap-2"
              >
                <Minus className="w-4 h-4 text-black" />
                <span>Divider Line</span>
              </button>
            </div>
          </div>

          {/* Border Styles */}
          <div>
            <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 mb-1.5">
              Border Style
            </h3>
            <div className="grid grid-cols-3 gap-1">
              {(['classic', 'gold_double', 'modern'] as const).map((b) => (
                <button
                  key={b}
                  onClick={() => setTemplate({
                    ...template,
                    backgroundStyle: { ...template.backgroundStyle, borderStyle: b }
                  })}
                  className={`p-1.5 rounded-lg text-[10px] font-bold border text-center capitalize transition-all ${
                    template.backgroundStyle.borderStyle === b
                      ? 'border-black bg-black text-white'
                      : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                  }`}
                >
                  {b.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CENTER: CERTIFICATE CANVAS */}
        <div className="flex-1 bg-neutral-100 p-6 flex items-center justify-center overflow-auto relative">
          
          <div 
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center center' }}
            className="transition-transform duration-100"
          >
            {/* The Certificate Canvas Board */}
            <div
              ref={canvasRef}
              style={{
                width: `${template.width}px`,
                height: `${template.height}px`,
                backgroundColor: template.backgroundStyle.color || '#FFFFFF',
              }}
              className={`relative shadow-2xl rounded-sm transition-all select-none overflow-hidden ${
                showGrid ? 'canvas-grid-dots' : ''
              } ${
                template.backgroundStyle.borderStyle === 'gold_double' ? 'cert-gold-border' :
                template.backgroundStyle.borderStyle === 'classic' ? 'border-[12px] border-black' :
                'border-2 border-neutral-400'
              }`}
            >
              
              {/* Elements on Canvas */}
              {template.elements.map((el) => {
                const isSelected = el.id === selectedElementId;
                const fs = el.fontSettings || {
                  family: 'Plus Jakarta Sans',
                  size: 16,
                  weight: '400',
                  color: '#000000',
                  align: 'center',
                  letterSpacing: 0,
                  lineHeight: 1.2
                };

                return (
                  <div
                    key={el.id}
                    onMouseDown={(e) => handleMouseDown(e, el.id)}
                    style={{
                      position: 'absolute',
                      left: `${el.x}%`,
                      top: `${el.y}%`,
                      transform: 'translate(-50%, -50%)',
                      zIndex: el.zIndex,
                      opacity: el.opacity ?? 1,
                      cursor: el.isLocked ? 'default' : isDragging && isSelected ? 'grabbing' : 'grab'
                    }}
                    className={`transition-shadow ${
                      isSelected ? 'ring-2 ring-black ring-offset-2 rounded-xs' : 'hover:ring-1 hover:ring-neutral-400'
                    }`}
                  >
                    {el.type === 'line' ? (
                      <div 
                        style={{ 
                          width: `${(el.width / 100) * template.width}px`, 
                          height: '2px', 
                          backgroundColor: el.backgroundColor || '#000000' 
                        }} 
                      />
                    ) : el.type === 'qr' ? (
                      <div className="w-16 h-16 border border-black rounded bg-white p-1 flex items-center justify-center shadow-xs">
                        <QrCode className="w-full h-full text-black" />
                      </div>
                    ) : el.type === 'seal' ? (
                      <div className="w-16 h-16 rounded-full border-2 border-black bg-white flex items-center justify-center text-center p-1 text-black font-extrabold text-[8px] uppercase tracking-wider shadow-sm">
                        ★ OFFICIAL ★
                      </div>
                    ) : (
                      <div
                        style={{
                          fontFamily: fs.family,
                          fontSize: `${fs.size}px`,
                          fontWeight: fs.weight,
                          color: fs.color,
                          textAlign: fs.align,
                          letterSpacing: `${fs.letterSpacing}px`,
                          lineHeight: fs.lineHeight,
                          fontStyle: fs.fontStyle || 'normal',
                          textTransform: fs.textTransform || 'none',
                          maxWidth: `${(el.width / 100) * template.width}px`,
                          whiteSpace: 'pre-wrap'
                        }}
                        className="px-2 py-0.5"
                      >
                        {el.content}
                      </div>
                    )}
                  </div>
                );
              })}

            </div>
          </div>

        </div>

        {/* RIGHT PANEL: PROPERTIES PANEL */}
        <div className="w-72 bg-white border-l border-neutral-200 p-4 overflow-y-auto shrink-0 space-y-6">
          {selectedElement ? (
            <div className="space-y-5">
              
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
                  Element Properties
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleUpdateSelected({ isLocked: !selectedElement.isLocked })}
                    className={`p-1.5 rounded-lg text-xs ${
                      selectedElement.isLocked ? 'text-black bg-neutral-200' : 'text-neutral-400 hover:bg-neutral-100'
                    }`}
                    title={selectedElement.isLocked ? 'Unlock' : 'Lock'}
                  >
                    {selectedElement.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => handleDuplicateElement(selectedElement)}
                    className="p-1.5 rounded-lg text-neutral-500 hover:text-black hover:bg-neutral-100"
                    title="Duplicate"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDeleteElement(selectedElement.id)}
                    className="p-1.5 rounded-lg text-neutral-500 hover:text-red-600 hover:bg-red-50"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Text / Dynamic Content Input */}
              {(selectedElement.type === 'text' || selectedElement.type === 'dynamic_field' || selectedElement.type === 'signature') && (
                <div>
                  <label className="block text-xs font-bold text-black mb-1">
                    Text Content
                  </label>
                  <textarea
                    rows={2}
                    value={selectedElement.content}
                    onChange={(e) => handleUpdateSelected({ content: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:border-black font-medium"
                  />
                </div>
              )}

              {/* Typography controls */}
              {selectedElement.fontSettings && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-black mb-1">Font Family</label>
                    <select
                      value={selectedElement.fontSettings.family}
                      onChange={(e) => handleUpdateFont({ family: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs font-semibold bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                    >
                      <option value="Plus Jakarta Sans">Plus Jakarta Sans (Modern Clean)</option>
                      <option value="Inter">Inter (SaaS Neutral)</option>
                      <option value="Playfair Display">Playfair Display (Luxury Serif)</option>
                      <option value="Cinzel">Cinzel (Diplomatic Title)</option>
                      <option value="Great Vibes">Great Vibes (Signature Script)</option>
                      <option value="Alex Brush">Alex Brush (Calligraphy)</option>
                      <option value="JetBrains Mono">JetBrains Mono (Monospace ID)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-700 mb-1">Size (px)</label>
                      <input
                        type="number"
                        min={8}
                        max={120}
                        value={selectedElement.fontSettings.size}
                        onChange={(e) => handleUpdateFont({ size: Number(e.target.value) })}
                        className="w-full px-2.5 py-1 text-xs border border-neutral-300 rounded-lg font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-700 mb-1">Weight</label>
                      <select
                        value={selectedElement.fontSettings.weight}
                        onChange={(e) => handleUpdateFont({ weight: e.target.value as any })}
                        className="w-full px-2 py-1 text-xs font-bold bg-white border border-neutral-300 rounded-lg"
                      >
                        <option value="300">Light</option>
                        <option value="400">Normal</option>
                        <option value="600">SemiBold</option>
                        <option value="700">Bold</option>
                        <option value="800">ExtraBold</option>
                      </select>
                    </div>
                  </div>

                  {/* Alignment */}
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">Alignment</label>
                    <div className="flex border border-neutral-300 rounded-lg overflow-hidden">
                      {(['left', 'center', 'right'] as const).map((al) => (
                        <button
                          key={al}
                          onClick={() => handleUpdateFont({ align: al })}
                          className={`flex-1 py-1 flex items-center justify-center text-xs transition-colors ${
                            selectedElement.fontSettings?.align === al ? 'bg-black text-white' : 'hover:bg-neutral-100 text-neutral-700'
                          }`}
                        >
                          {al === 'left' ? <AlignLeft className="w-3.5 h-3.5" /> : al === 'center' ? <AlignCenter className="w-3.5 h-3.5" /> : <AlignRight className="w-3.5 h-3.5" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Picker */}
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">Text Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={selectedElement.fontSettings.color}
                        onChange={(e) => handleUpdateFont({ color: e.target.value })}
                        className="w-8 h-8 rounded border border-neutral-300 cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={selectedElement.fontSettings.color}
                        onChange={(e) => handleUpdateFont({ color: e.target.value })}
                        className="flex-1 px-2.5 py-1 text-xs border border-neutral-300 rounded-lg font-mono uppercase font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Advanced Mode: Positioning & Layering */}
              {isAdvancedMode && (
                <div className="space-y-3 pt-3 border-t border-neutral-200">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
                    Advanced Coordinates
                  </span>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-[11px] text-neutral-600 font-bold">X Position (%)</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={Math.round(selectedElement.x)}
                        onChange={(e) => handleUpdateSelected({ x: Number(e.target.value) })}
                        className="w-full px-2 py-1 border border-neutral-300 rounded-lg mt-0.5 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-neutral-600 font-bold">Y Position (%)</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={Math.round(selectedElement.y)}
                        onChange={(e) => handleUpdateSelected({ y: Number(e.target.value) })}
                        className="w-full px-2 py-1 border border-neutral-300 rounded-lg mt-0.5 font-mono"
                      />
                    </div>
                  </div>

                  {/* Layer Z-Index */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-neutral-700 font-bold">Layer Order (Z)</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleLayerOrder('down')}
                        className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 rounded text-black text-xs font-bold"
                      >
                        Backward
                      </button>
                      <button
                        onClick={() => handleLayerOrder('up')}
                        className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 rounded text-black text-xs font-bold"
                      >
                        Forward
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="py-12 text-center space-y-2">
              <Sliders className="w-8 h-8 text-neutral-300 mx-auto" />
              <p className="text-xs text-neutral-500 font-medium">Select any element on the canvas to configure its properties.</p>
            </div>
          )}
        </div>

      </div>

      {/* LIVE TEST MODAL */}
      {testModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="max-w-4xl w-full bg-white rounded-2xl shadow-elevated p-6 space-y-4 border border-neutral-200">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="font-bold text-sm text-black">Live Test Certificate Render</h3>
              <button
                onClick={() => setTestModalOpen(false)}
                className="text-xs font-bold text-black px-3 py-1 bg-neutral-100 rounded-lg hover:bg-neutral-200"
              >
                Close Preview
              </button>
            </div>

            <div className="border border-neutral-200 rounded-lg overflow-hidden bg-neutral-50 p-4 text-center">
              {testPreviewUrl ? (
                <img src={testPreviewUrl} alt="Test certificate render" className="w-full h-auto shadow-md block rounded" />
              ) : (
                <div className="py-12 text-xs text-neutral-500 font-medium">Rendering vector preview...</div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
