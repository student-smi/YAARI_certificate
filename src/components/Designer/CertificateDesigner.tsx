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
  Check,
  Building2,
  Calendar,
  GraduationCap,
  Clock,
  ShieldCheck,
  Layers,
  Globe,
  FileBadge,
  CheckCircle2,
  Image as ImageIcon,
  FileText,
  Users,
  CheckSquare,
  Info,
  ExternalLink,
  Plus,
  Upload,
  Move,
  Maximize2,
  ChevronUp,
  ChevronDown,
  Layout,
  AlignCenterHorizontal,
  AlignCenterVertical
} from 'lucide-react';
import { Template, TemplateElement, ElementType } from '../../types';
import { generateCertificatePreviewDataUrl } from '../../services/pdfGenerator';
import { StorageService } from '../../services/storageService';
import { 
  CORE_CERTIFICATE_ELEMENTS, 
  OPTIONAL_STUDENT_COURSE_ELEMENTS, 
  SIGNATORY_DEFINITIONS,
  FieldDefinition,
  SignatoryDefinition
} from '../../data/certificateFields';
import { SignaturePadModal } from './SignaturePadModal';
import { SaveTemplateModal } from './SaveTemplateModal';

interface CertificateDesignerProps {
  initialTemplate: Template;
  onBack: () => void;
  onSaveTemplate: (updated: Template) => void;
  onNavigateToTemplates?: () => void;
  onNavigateToWizard?: (templateId: string) => void;
}

type ResizeHandle = 'nw' | 'ne' | 'se' | 'sw' | 'e' | 'w';

interface ResizeState {
  handle: ResizeHandle;
  startX: number;
  startY: number;
  initialX: number;
  initialY: number;
  initialWidth: number;
  initialHeight: number;
  initialFontSize?: number;
}

export const CertificateDesigner: React.FC<CertificateDesignerProps> = ({
  initialTemplate,
  onBack,
  onSaveTemplate,
  onNavigateToTemplates,
  onNavigateToWizard
}) => {
  const [template, setTemplate] = useState<Template>(initialTemplate);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(
    initialTemplate.elements[0]?.id || null
  );
  const [isAdvancedMode, setIsAdvancedMode] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  // Left sidebar active tab
  const [sidebarTab, setSidebarTab] = useState<'core' | 'optional' | 'signatories' | 'decor'>('core');

  // Modals
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);

  // Hidden File Inputs for PC Uploads
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const signatureFileInputRef = useRef<HTMLInputElement>(null);

  // History for Undo / Redo
  const [history, setHistory] = useState<Template[]>([initialTemplate]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Resizing state (Canva-style handles)
  const [isResizing, setIsResizing] = useState(false);
  const [resizeState, setResizeState] = useState<ResizeState | null>(null);

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

  // Keyboard micro-alignment & shortcut controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (!selectedElementId) return;
      const el = template.elements.find(i => i.id === selectedElementId);
      if (!el || el.isLocked) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        handleDeleteElement(el.id);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        handleDuplicateElement(el);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const step = e.shiftKey ? 2 : 0.5;
        let newX = el.x;
        let newY = el.y;
        if (e.key === 'ArrowUp') newY = Math.max(2, el.y - step);
        if (e.key === 'ArrowDown') newY = Math.min(98, el.y + step);
        if (e.key === 'ArrowLeft') newX = Math.max(2, el.x - step);
        if (e.key === 'ArrowRight') newX = Math.min(98, el.x + step);

        const updatedElements = template.elements.map(item =>
          item.id === selectedElementId ? { ...item, x: newX, y: newY } : item
        );
        setTemplate({ ...template, elements: updatedElements });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, template, historyIndex, history]);

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

  const handleAddElement = (
    type: ElementType, 
    defaultText = 'New Element', 
    fieldKey?: string,
    customProps: Partial<TemplateElement> = {}
  ) => {
    const newEl: TemplateElement = {
      id: `el-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type,
      x: 50,
      y: 50,
      width: type === 'line' ? 40 : type === 'qr' || type === 'logo' ? 12 : 60,
      height: type === 'line' ? 1 : type === 'qr' || type === 'logo' ? 12 : 8,
      zIndex: template.elements.length + 1,
      content: defaultText,
      fieldKey: fieldKey || (type === 'dynamic_field' ? 'name' : undefined),
      fontSettings: {
        family: type === 'signature' ? 'Great Vibes' : 'Plus Jakarta Sans',
        size: type === 'signature' ? 28 : type === 'line' ? 14 : 16,
        weight: type === 'signature' ? '400' : '600',
        color: '#000000',
        align: 'center',
        letterSpacing: 0,
        lineHeight: 1.2
      },
      ...customProps
    };

    const updated = {
      ...template,
      elements: [...template.elements, newEl]
    };
    pushHistory(updated);
    setSelectedElementId(newEl.id);
  };

  // Local PC File Upload Handlers (Logo & Signature)
  const handleLocalImageUpload = (e: React.ChangeEvent<HTMLInputElement>, targetType: 'logo' | 'signature') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;

      if (targetType === 'logo') {
        if (selectedElement && selectedElement.type === 'logo') {
          handleUpdateSelected({ content: dataUrl });
        } else {
          handleAddElement('logo', dataUrl, 'logo', {
            x: 50,
            y: 12,
            width: 14,
            height: 14
          });
        }
      } else {
        if (selectedElement && selectedElement.type === 'signature') {
          handleUpdateSelected({ content: dataUrl });
        } else {
          handleAddElement('signature', dataUrl, 'signature', {
            x: 75,
            y: 76,
            width: 26,
            height: 10
          });
        }
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAddCoreElement = (field: FieldDefinition) => {
    if (field.key === 'logo') {
      handleAddElement('logo', field.defaultText, 'logo', {
        x: 50,
        y: 10,
        width: 12,
        height: 12
      });
    } else if (field.key === 'qr') {
      handleAddElement('qr', field.defaultText, 'qr', {
        x: 85,
        y: 86,
        width: 10,
        height: 10
      });
    } else if (field.key === 'certificate_id') {
      handleAddElement('certificate_id', field.defaultText, 'certificate_id', {
        x: 50,
        y: 92,
        width: 40,
        height: 4,
        fontSettings: {
          family: 'JetBrains Mono',
          size: 11,
          weight: '500',
          color: '#64748B',
          align: 'center',
          letterSpacing: 1,
          lineHeight: 1
        }
      });
    } else if (field.key === 'verification_url') {
      handleAddElement('dynamic_field', field.defaultText, 'verification_url', {
        x: 50,
        y: 95,
        width: 50,
        height: 4,
        fontSettings: {
          family: 'JetBrains Mono',
          size: 9,
          weight: '400',
          color: '#94A3B8',
          align: 'center',
          letterSpacing: 0.5,
          lineHeight: 1
        }
      });
    } else if (field.key === 'title') {
      handleAddElement('text', field.defaultText, 'title', {
        x: 50,
        y: 20,
        width: 80,
        height: 8,
        fontSettings: {
          family: 'Cinzel',
          size: 32,
          weight: '700',
          color: '#0F172A',
          align: 'center',
          letterSpacing: 3,
          lineHeight: 1.1
        }
      });
    } else if (field.key === 'statement') {
      handleAddElement('dynamic_field', field.defaultText, 'statement', {
        x: 50,
        y: 60,
        width: 75,
        height: 10,
        fontSettings: {
          family: 'Plus Jakarta Sans',
          size: 13,
          weight: '400',
          color: '#475569',
          align: 'center',
          letterSpacing: 0.5,
          lineHeight: 1.4
        }
      });
    } else if (field.key === 'issue_date') {
      handleAddElement('dynamic_field', field.defaultText, 'issue_date', {
        x: 25,
        y: 75,
        width: 25,
        height: 6,
        fontSettings: {
          family: 'Plus Jakarta Sans',
          size: 12,
          weight: '500',
          color: '#334155',
          align: 'center',
          letterSpacing: 0.5,
          lineHeight: 1.2
        }
      });
    } else if (field.key === 'completion_date') {
      handleAddElement('dynamic_field', field.defaultText, 'completion_date', {
        x: 25,
        y: 81,
        width: 30,
        height: 6,
        fontSettings: {
          family: 'Plus Jakarta Sans',
          size: 11,
          weight: '500',
          color: '#64748B',
          align: 'center',
          letterSpacing: 0.5,
          lineHeight: 1.2
        }
      });
    } else {
      handleAddElement('dynamic_field', field.defaultText, field.key, {
        fontSettings: {
          family: field.key === 'name' ? 'Playfair Display' : 'Plus Jakarta Sans',
          size: field.key === 'name' ? 36 : 16,
          weight: '700',
          color: field.key === 'name' ? '#1E1B4B' : '#0F172A',
          align: 'center',
          letterSpacing: field.key === 'organization' ? 3 : 1,
          lineHeight: 1.2
        }
      });
    }
  };

  const handleAddOptionalElement = (field: FieldDefinition) => {
    handleAddElement('dynamic_field', field.defaultText, field.key, {
      width: 35,
      height: 5,
      fontSettings: {
        family: 'Plus Jakarta Sans',
        size: 11,
        weight: '600',
        color: '#475569',
        align: 'center',
        letterSpacing: 0.5,
        lineHeight: 1.2
      }
    });
  };

  // Signatory Block Builder
  const handleAddSignatoryBlock = (sig: SignatoryDefinition, posX = 50, posY = 80) => {
    const timestamp = Date.now();
    const sigElement: TemplateElement = {
      id: `sig-${timestamp}`,
      type: 'signature',
      x: posX,
      y: posY - 4,
      width: 28,
      height: 8,
      zIndex: template.elements.length + 1,
      content: sig.defaultName,
      fontSettings: {
        family: 'Great Vibes',
        size: 28,
        weight: '400',
        color: '#0F172A',
        align: 'center',
        letterSpacing: 1,
        lineHeight: 1
      }
    };

    const titleElement: TemplateElement = {
      id: `sig-title-${timestamp}`,
      type: 'text',
      x: posX,
      y: posY + 4,
      width: 28,
      height: 4,
      zIndex: template.elements.length + 2,
      content: sig.defaultTitle.toUpperCase(),
      fontSettings: {
        family: 'Plus Jakarta Sans',
        size: 10,
        weight: '700',
        color: '#64748B',
        align: 'center',
        letterSpacing: 1.5,
        lineHeight: 1.2
      }
    };

    const updated = {
      ...template,
      elements: [...template.elements, sigElement, titleElement]
    };
    pushHistory(updated);
    setSelectedElementId(sigElement.id);
  };

  // Apply Balanced Signatory Layouts (1, 2, or 3 visible blocks)
  const applySignatoryLayout = (count: 1 | 2 | 3) => {
    const filtered = template.elements.filter(
      el => el.type !== 'signature' && !el.id.startsWith('sig-title-')
    );

    const newElements: TemplateElement[] = [];
    const timestamp = Date.now();

    if (count === 1) {
      const sigDef = SIGNATORY_DEFINITIONS[0];
      newElements.push(
        {
          id: `sig-layout-1-${timestamp}`,
          type: 'signature',
          x: 50,
          y: 77,
          width: 28,
          height: 8,
          zIndex: 10,
          content: sigDef.defaultName,
          fontSettings: { family: 'Great Vibes', size: 30, weight: '400', color: '#0F172A', align: 'center', letterSpacing: 1, lineHeight: 1 }
        },
        {
          id: `sig-title-1-${timestamp}`,
          type: 'text',
          x: 50,
          y: 84,
          width: 32,
          height: 4,
          zIndex: 11,
          content: sigDef.defaultTitle.toUpperCase(),
          fontSettings: { family: 'Plus Jakarta Sans', size: 10, weight: '700', color: '#64748B', align: 'center', letterSpacing: 1.5, lineHeight: 1.2 }
        }
      );
    } else if (count === 2) {
      const sig1 = SIGNATORY_DEFINITIONS[0];
      const sig2 = SIGNATORY_DEFINITIONS[1];
      newElements.push(
        {
          id: `sig-layout-1-${timestamp}`,
          type: 'signature',
          x: 30,
          y: 77,
          width: 26,
          height: 8,
          zIndex: 10,
          content: sig1.defaultName,
          fontSettings: { family: 'Great Vibes', size: 28, weight: '400', color: '#0F172A', align: 'center', letterSpacing: 1, lineHeight: 1 }
        },
        {
          id: `sig-title-1-${timestamp}`,
          type: 'text',
          x: 30,
          y: 84,
          width: 30,
          height: 4,
          zIndex: 11,
          content: sig1.defaultTitle.toUpperCase(),
          fontSettings: { family: 'Plus Jakarta Sans', size: 9, weight: '700', color: '#64748B', align: 'center', letterSpacing: 1.5, lineHeight: 1.2 }
        },
        {
          id: `sig-layout-2-${timestamp}`,
          type: 'signature',
          x: 70,
          y: 77,
          width: 26,
          height: 8,
          zIndex: 12,
          content: sig2.defaultName,
          fontSettings: { family: 'Great Vibes', size: 28, weight: '400', color: '#0F172A', align: 'center', letterSpacing: 1, lineHeight: 1 }
        },
        {
          id: `sig-title-2-${timestamp}`,
          type: 'text',
          x: 70,
          y: 84,
          width: 30,
          height: 4,
          zIndex: 13,
          content: sig2.defaultTitle.toUpperCase(),
          fontSettings: { family: 'Plus Jakarta Sans', size: 9, weight: '700', color: '#64748B', align: 'center', letterSpacing: 1.5, lineHeight: 1.2 }
        }
      );
    } else if (count === 3) {
      const sig1 = SIGNATORY_DEFINITIONS[2];
      const sig2 = SIGNATORY_DEFINITIONS[0];
      const sig3 = SIGNATORY_DEFINITIONS[1];
      newElements.push(
        {
          id: `sig-layout-1-${timestamp}`,
          type: 'signature',
          x: 22,
          y: 77,
          width: 24,
          height: 8,
          zIndex: 10,
          content: sig1.defaultName,
          fontSettings: { family: 'Great Vibes', size: 26, weight: '400', color: '#0F172A', align: 'center', letterSpacing: 1, lineHeight: 1 }
        },
        {
          id: `sig-title-1-${timestamp}`,
          type: 'text',
          x: 22,
          y: 84,
          width: 26,
          height: 4,
          zIndex: 11,
          content: sig1.defaultTitle.toUpperCase(),
          fontSettings: { family: 'Plus Jakarta Sans', size: 8.5, weight: '700', color: '#64748B', align: 'center', letterSpacing: 1.2, lineHeight: 1.2 }
        },
        {
          id: `sig-layout-2-${timestamp}`,
          type: 'signature',
          x: 50,
          y: 77,
          width: 24,
          height: 8,
          zIndex: 12,
          content: sig2.defaultName,
          fontSettings: { family: 'Great Vibes', size: 26, weight: '400', color: '#0F172A', align: 'center', letterSpacing: 1, lineHeight: 1 }
        },
        {
          id: `sig-title-2-${timestamp}`,
          type: 'text',
          x: 50,
          y: 84,
          width: 26,
          height: 4,
          zIndex: 13,
          content: sig2.defaultTitle.toUpperCase(),
          fontSettings: { family: 'Plus Jakarta Sans', size: 8.5, weight: '700', color: '#64748B', align: 'center', letterSpacing: 1.2, lineHeight: 1.2 }
        },
        {
          id: `sig-layout-3-${timestamp}`,
          type: 'signature',
          x: 78,
          y: 77,
          width: 24,
          height: 8,
          zIndex: 14,
          content: sig3.defaultName,
          fontSettings: { family: 'Great Vibes', size: 26, weight: '400', color: '#0F172A', align: 'center', letterSpacing: 1, lineHeight: 1 }
        },
        {
          id: `sig-title-3-${timestamp}`,
          type: 'text',
          x: 78,
          y: 84,
          width: 26,
          height: 4,
          zIndex: 15,
          content: sig3.defaultTitle.toUpperCase(),
          fontSettings: { family: 'Plus Jakarta Sans', size: 8.5, weight: '700', color: '#64748B', align: 'center', letterSpacing: 1.2, lineHeight: 1.2 }
        }
      );
    }

    const updated = {
      ...template,
      elements: [...filtered, ...newElements]
    };
    pushHistory(updated);
    setSelectedElementId(newElements[0]?.id || null);
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

  const handleLayerOrder = (direction: 'up' | 'down' | 'front' | 'back') => {
    if (!selectedElement) return;
    let newZ = selectedElement.zIndex || 1;
    if (direction === 'up') newZ = newZ + 1;
    if (direction === 'down') newZ = Math.max(1, newZ - 1);
    if (direction === 'front') newZ = Math.max(...template.elements.map(e => e.zIndex || 1)) + 1;
    if (direction === 'back') newZ = 1;
    handleUpdateSelected({ zIndex: newZ });
  };

  // Canva-Style Quick Alignment
  const handleQuickAlign = (type: 'center-h' | 'center-v' | 'left' | 'right' | 'top' | 'bottom') => {
    if (!selectedElement) return;
    if (type === 'center-h') handleUpdateSelected({ x: 50 });
    if (type === 'center-v') handleUpdateSelected({ y: 50 });
    if (type === 'left') handleUpdateSelected({ x: Math.round(selectedElement.width / 2) + 5 });
    if (type === 'right') handleUpdateSelected({ x: 95 - Math.round(selectedElement.width / 2) });
    if (type === 'top') handleUpdateSelected({ y: 15 });
    if (type === 'bottom') handleUpdateSelected({ y: 85 });
  };

  // Canva-Style Resize Start Handler
  const handleResizeStart = (e: React.MouseEvent, elId: string, handle: ResizeHandle) => {
    e.stopPropagation();
    e.preventDefault();
    const el = template.elements.find(i => i.id === elId);
    if (!el || el.isLocked) return;

    setSelectedElementId(elId);
    setIsResizing(true);
    setResizeState({
      handle,
      startX: e.clientX,
      startY: e.clientY,
      initialX: el.x,
      initialY: el.y,
      initialWidth: el.width,
      initialHeight: el.height,
      initialFontSize: el.fontSettings?.size
    });
  };

  // Canva-Style Mouse Dragging Start
  const handleMouseDown = (e: React.MouseEvent, elId: string) => {
    if (!canvasRef.current || isResizing) return;
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

  // Canva-Style Unified Mouse Move Handler (Drag + Resize)
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current || !selectedElementId) return;
    const rect = canvasRef.current.getBoundingClientRect();

    // 1. Resizing Handle Dragging
    if (isResizing && resizeState) {
      const deltaXPercent = ((e.clientX - resizeState.startX) / rect.width) * 100;
      const deltaYPercent = ((e.clientY - resizeState.startY) / rect.height) * 100;
      const { handle, initialX, initialY, initialWidth, initialHeight, initialFontSize } = resizeState;

      let newWidth = initialWidth;
      let newHeight = initialHeight;
      let newX = initialX;
      let newY = initialY;

      if (handle === 'e') {
        newWidth = Math.max(4, Math.min(96, initialWidth + deltaXPercent));
      } else if (handle === 'w') {
        newWidth = Math.max(4, Math.min(96, initialWidth - deltaXPercent));
        newX = initialX + deltaXPercent / 2;
      } else if (handle === 'se') {
        newWidth = Math.max(4, Math.min(96, initialWidth + deltaXPercent));
        newHeight = Math.max(2, Math.min(96, initialHeight + deltaYPercent));
      } else if (handle === 'sw') {
        newWidth = Math.max(4, Math.min(96, initialWidth - deltaXPercent));
        newHeight = Math.max(2, Math.min(96, initialHeight + deltaYPercent));
        newX = initialX + deltaXPercent / 2;
      } else if (handle === 'ne') {
        newWidth = Math.max(4, Math.min(96, initialWidth + deltaXPercent));
        newHeight = Math.max(2, Math.min(96, initialHeight - deltaYPercent));
        newY = initialY + deltaYPercent / 2;
      } else if (handle === 'nw') {
        newWidth = Math.max(4, Math.min(96, initialWidth - deltaXPercent));
        newHeight = Math.max(2, Math.min(96, initialHeight - deltaYPercent));
        newX = initialX + deltaXPercent / 2;
        newY = initialY + deltaYPercent / 2;
      }

      // Calculate proportional font size if text/signature
      let newFontSettings = selectedElement?.fontSettings;
      if (initialFontSize && ['text', 'dynamic_field', 'signature'].includes(selectedElement?.type || '')) {
        const scaleRatio = newWidth / initialWidth;
        const scaledSize = Math.max(8, Math.min(100, Math.round(initialFontSize * scaleRatio)));
        newFontSettings = newFontSettings ? { ...newFontSettings, size: scaledSize } : undefined;
      }

      const updatedElements = template.elements.map(el => {
        if (el.id === selectedElementId) {
          return {
            ...el,
            x: Math.round(newX * 10) / 10,
            y: Math.round(newY * 10) / 10,
            width: Math.round(newWidth * 10) / 10,
            height: Math.round(newHeight * 10) / 10,
            fontSettings: newFontSettings
          };
        }
        return el;
      });

      setTemplate({ ...template, elements: updatedElements });
      return;
    }

    // 2. Element Dragging Position
    if (isDragging) {
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
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      pushHistory(template);
    }
    if (isResizing) {
      setIsResizing(false);
      setResizeState(null);
      pushHistory(template);
    }
  };

  const handleOpenLivePreview = async () => {
    const url = await generateCertificatePreviewDataUrl({
      template,
      recipientData: {
        'name': 'Ananya Sharma',
        'course': 'Digital Marketing Masterclass',
        'issue_date': 'October 15, 2026',
        'completion_date': 'September 30, 2026',
        'organization': 'Global Leadership Institute',
        'student_id': 'STU-2026-8941',
        'course_duration': '12 Weeks (120 Hours)',
        'grade': 'A+ (96%)',
        'achievement_level': 'Distinction',
        'batch': 'Cohort 2026-B',
        'mode_of_learning': 'Online Interactive',
        'email': 'ananya.s@institution.edu'
      },
      certificateId: 'CF-2026-000123'
    });
    setTestPreviewUrl(url);
    setTestModalOpen(true);
  };

  const currentFieldDef = [...CORE_CERTIFICATE_ELEMENTS, ...OPTIONAL_STUDENT_COURSE_ELEMENTS].find(
    f => f.key === selectedElement?.fieldKey
  );

  return (
    <div 
      className="flex flex-col h-[calc(100vh-4rem)] bg-neutral-100 overflow-hidden select-none text-neutral-900"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      
      {/* HIDDEN FILE INPUTS FOR DIRECT PC UPLOAD */}
      <input
        type="file"
        ref={logoFileInputRef}
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        onChange={(e) => handleLocalImageUpload(e, 'logo')}
        className="hidden"
      />
      <input
        type="file"
        ref={signatureFileInputRef}
        accept="image/png,image/jpeg,image/webp"
        onChange={(e) => handleLocalImageUpload(e, 'signature')}
        className="hidden"
      />

      {/* 1. TOP TOOLBAR */}
      <div className="h-14 bg-white border-b border-neutral-200 px-4 sm:px-6 flex items-center justify-between z-20 shrink-0">
        
        {/* Left: Navigation & Meta */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg border border-neutral-200 hover:border-black text-black hover:bg-neutral-50 transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={template.name}
                onChange={(e) => setTemplate({ ...template, name: e.target.value })}
                className="font-black text-sm text-black bg-transparent border-b border-transparent hover:border-neutral-300 focus:border-black focus:outline-none transition-colors"
              />
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 border border-neutral-200">
                {template.orientation}
              </span>
            </div>
            <p className="text-[10px] text-neutral-400 font-medium">
              Status: {saveStatus === 'saved' ? 'Saved' : saveStatus === 'saving' ? 'Saving...' : 'Unsaved changes'}
            </p>
          </div>
        </div>

        {/* Center: Controls */}
        <div className="flex items-center gap-2">
          
          <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg border border-neutral-200 text-xs">
            <button
              onClick={() => setIsAdvancedMode(!isAdvancedMode)}
              className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                isAdvancedMode ? 'bg-black text-white shadow-xs' : 'text-neutral-600 hover:text-black'
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
              title="Undo (Ctrl+Z)"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-1.5 rounded-lg text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Redo (Ctrl+Y)"
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

        {/* Right: Preview & Save CTAs */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenLivePreview}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 text-black text-xs font-bold shadow-xs"
          >
            <Eye className="w-3.5 h-3.5 text-neutral-600" />
            <span>Test Preview</span>
          </button>
          <button
            onClick={() => setSaveModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-black hover:bg-neutral-800 text-white text-xs font-bold shadow-xs active:scale-95 transition-transform"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{template.isCustom ? 'Save Changes' : 'Save Template'}</span>
          </button>
        </div>

      </div>

      {/* 2. MAIN 3-COLUMN WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT PANEL: CATEGORIZED PALETTE */}
        <div className="w-80 bg-white border-r border-neutral-200 flex flex-col shrink-0">
          
          {/* Palette Navigation Tabs */}
          <div className="p-2 border-b border-neutral-200 bg-neutral-50 grid grid-cols-4 gap-1 text-[11px] font-bold">
            <button
              onClick={() => setSidebarTab('core')}
              className={`py-1.5 px-1 rounded-md text-center transition-all ${
                sidebarTab === 'core' 
                  ? 'bg-black text-white shadow-xs' 
                  : 'text-neutral-600 hover:bg-neutral-200/60'
              }`}
            >
              1. Core
            </button>
            <button
              onClick={() => setSidebarTab('optional')}
              className={`py-1.5 px-1 rounded-md text-center transition-all ${
                sidebarTab === 'optional' 
                  ? 'bg-black text-white shadow-xs' 
                  : 'text-neutral-600 hover:bg-neutral-200/60'
              }`}
            >
              2. Optional
            </button>
            <button
              onClick={() => setSidebarTab('signatories')}
              className={`py-1.5 px-1 rounded-md text-center transition-all ${
                sidebarTab === 'signatories' 
                  ? 'bg-black text-white shadow-xs' 
                  : 'text-neutral-600 hover:bg-neutral-200/60'
              }`}
            >
              3. Signatures
            </button>
            <button
              onClick={() => setSidebarTab('decor')}
              className={`py-1.5 px-1 rounded-md text-center transition-all ${
                sidebarTab === 'decor' 
                  ? 'bg-black text-white shadow-xs' 
                  : 'text-neutral-600 hover:bg-neutral-200/60'
              }`}
            >
              4. Borders
            </button>
          </div>

          {/* Quick Local Upload Banner (Canva-Level Quick Upload) */}
          <div className="px-3 pt-3 pb-2 border-b border-neutral-100 bg-neutral-50/50 flex items-center justify-between gap-2">
            <button
              onClick={() => logoFileInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-lg text-xs font-bold text-black shadow-xs transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Logo</span>
            </button>

            <button
              onClick={() => setSignatureModalOpen(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-black hover:bg-neutral-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Draw Signature</span>
            </button>
          </div>

          {/* Tab Content Body */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-4">
            
            {/* TAB 1: CORE ELEMENTS */}
            {sidebarTab === 'core' && (
              <div className="space-y-3">
                <div className="border-b border-neutral-100 pb-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-black uppercase tracking-wide">
                      Standard Elements
                    </h3>
                    <span className="text-[10px] font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                      Required & Rec.
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Essential certificate elements according to official credential standards.
                  </p>
                </div>

                <div className="space-y-1.5">
                  {CORE_CERTIFICATE_ELEMENTS.map((field) => (
                    <div
                      key={field.key}
                      className="p-2 rounded-xl border border-neutral-200 hover:border-black bg-white hover:bg-neutral-50/70 transition-all flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {field.key === 'logo' ? <ImageIcon className="w-3.5 h-3.5 text-black" /> :
                           field.key === 'qr' ? <QrCode className="w-3.5 h-3.5 text-black" /> :
                           field.key === 'issue_date' || field.key === 'completion_date' ? <Calendar className="w-3.5 h-3.5 text-black" /> :
                           field.key === 'organization' ? <Building2 className="w-3.5 h-3.5 text-black" /> :
                           field.key === 'certificate_id' ? <FileBadge className="w-3.5 h-3.5 text-black" /> :
                           field.key === 'name' ? <GraduationCap className="w-3.5 h-3.5 text-black" /> :
                           <Type className="w-3.5 h-3.5 text-black" />}
                          <span className="text-xs font-bold text-black">{field.label}</span>
                        </div>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          field.requirement.startsWith('Required') 
                            ? 'bg-black text-white' 
                            : 'bg-neutral-100 text-neutral-700 border border-neutral-200'
                        }`}>
                          {field.requirement.startsWith('Required') ? 'Required' : 'Recommended'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-neutral-500 font-medium">
                        <span className="line-clamp-1">{field.purpose}</span>
                        <div className="flex items-center gap-1">
                          {field.key === 'logo' && (
                            <button
                              onClick={() => logoFileInputRef.current?.click()}
                              className="px-2 py-0.5 rounded bg-neutral-100 hover:bg-neutral-200 text-black font-bold border border-neutral-300 transition-colors"
                              title="Upload custom logo from PC"
                            >
                              Upload
                            </button>
                          )}
                          <button
                            onClick={() => handleAddCoreElement(field)}
                            className="px-2 py-0.5 rounded bg-neutral-100 hover:bg-black hover:text-white text-black font-bold border border-neutral-200 shrink-0 transition-colors"
                          >
                            + Add
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-medium">
                  <strong>Standard Rule:</strong> Keep issue date and completion date separate: a certificate may be issued after the course ends.
                </div>
              </div>
            )}

            {/* TAB 2: OPTIONAL STUDENT AND COURSE DETAILS */}
            {sidebarTab === 'optional' && (
              <div className="space-y-3">
                <div className="border-b border-neutral-100 pb-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-black uppercase tracking-wide">
                      Student & Course Details
                    </h3>
                    <span className="text-[10px] font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                      Optional Fields
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Include only when useful for assessed cohorts, renewals, or accredited programs.
                  </p>
                </div>

                <div className="space-y-1.5">
                  {OPTIONAL_STUDENT_COURSE_ELEMENTS.map((field) => (
                    <div
                      key={field.key}
                      className="p-2 rounded-xl border border-neutral-200 hover:border-black bg-white hover:bg-neutral-50/70 transition-all flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-black">{field.label}</span>
                        <code className="text-[9px] text-neutral-400 font-mono">
                          {`{{${field.key}}}`}
                        </code>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-neutral-500 font-medium">
                        <span className="line-clamp-1">{field.purpose}</span>
                        <button
                          onClick={() => handleAddOptionalElement(field)}
                          className="px-2 py-0.5 rounded bg-neutral-100 hover:bg-black hover:text-white text-black font-bold border border-neutral-200 shrink-0 transition-colors"
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-2.5 rounded-xl bg-neutral-100 border border-neutral-300 text-neutral-700 text-[11px]">
                  <strong>Privacy Note:</strong> Keep student email, phone, and contact details in the internal student record; they usually do not need to appear on the certificate itself.
                </div>
              </div>
            )}

            {/* TAB 3: SIGNATORIES (SUPPORT MULTIPLE, REQUIRE ONLY SELECTED ONES) */}
            {sidebarTab === 'signatories' && (
              <div className="space-y-4">
                <div className="border-b border-neutral-100 pb-2">
                  <h3 className="text-xs font-black text-black uppercase tracking-wide">
                    Signatory Blocks
                  </h3>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Support multiple signatories (0 to 3 visible signature blocks). A practical default is one signatory.
                  </p>
                </div>

                {/* Digital Signature Studio Launch Button */}
                <div className="p-3 rounded-2xl border-2 border-dashed border-black bg-neutral-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-black">Interactive Signature Pad</span>
                    <Sparkles className="w-3.5 h-3.5 text-black" />
                  </div>
                  <p className="text-[11px] text-neutral-600">
                    Draw your actual handwritten signature or type in formal cursive scripts.
                  </p>
                  <button
                    onClick={() => setSignatureModalOpen(true)}
                    className="w-full py-2 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>Open Drawing & Calligraphy Studio</span>
                  </button>
                </div>

                {/* Quick Multi-Signatory Layout Presets */}
                <div>
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 block mb-1.5">
                    Auto-Balanced Layout Presets
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => applySignatoryLayout(1)}
                      className="p-2 rounded-xl border border-neutral-200 hover:border-black text-center font-bold text-xs bg-white hover:bg-neutral-50 flex flex-col items-center gap-1"
                    >
                      <span className="w-4 h-4 rounded-full bg-black text-white text-[10px] flex items-center justify-center">1</span>
                      <span className="text-[10px]">Single</span>
                    </button>
                    <button
                      onClick={() => applySignatoryLayout(2)}
                      className="p-2 rounded-xl border border-neutral-200 hover:border-black text-center font-bold text-xs bg-white hover:bg-neutral-50 flex flex-col items-center gap-1"
                    >
                      <span className="w-4 h-4 rounded-full bg-black text-white text-[10px] flex items-center justify-center">2</span>
                      <span className="text-[10px]">Dual</span>
                    </button>
                    <button
                      onClick={() => applySignatoryLayout(3)}
                      className="p-2 rounded-xl border border-neutral-200 hover:border-black text-center font-bold text-xs bg-white hover:bg-neutral-50 flex flex-col items-center gap-1"
                    >
                      <span className="w-4 h-4 rounded-full bg-black text-white text-[10px] flex items-center justify-center">3</span>
                      <span className="text-[10px]">Triple</span>
                    </button>
                  </div>
                </div>

                {/* Individual Signatory Roles */}
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 block">
                    Available Signatory Roles
                  </label>

                  {SIGNATORY_DEFINITIONS.map((sig) => (
                    <div
                      key={sig.id}
                      className="p-2.5 rounded-xl border border-neutral-200 bg-white hover:border-black transition-all space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <PenTool className="w-3.5 h-3.5 text-black" />
                          <span className="text-xs font-bold text-black">{sig.titleLabel}</span>
                        </div>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          sig.defaultStatus === 'Enabled' 
                            ? 'bg-black text-white' 
                            : 'bg-neutral-100 text-neutral-600'
                        }`}>
                          {sig.defaultStatus}
                        </span>
                      </div>

                      <p className="text-[10px] text-neutral-500">
                        {sig.typicalUse}
                      </p>

                      <div className="pt-1 flex items-center justify-between border-t border-neutral-100">
                        <div className="text-[10px] text-neutral-600">
                          <strong>{sig.defaultName}</strong> • {sig.defaultTitle}
                        </div>
                        <button
                          onClick={() => handleAddSignatoryBlock(sig)}
                          className="px-2.5 py-0.5 bg-neutral-100 hover:bg-black hover:text-white text-black font-bold text-[10px] rounded border border-neutral-200 transition-colors"
                        >
                          + Insert
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: DECOR & BORDERS */}
            {sidebarTab === 'decor' && (
              <div className="space-y-4">
                <div className="border-b border-neutral-100 pb-2">
                  <h3 className="text-xs font-black text-black uppercase tracking-wide">
                    Accents & Borders
                  </h3>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Frame your certificate with prestigious double borders, official crest seals, and divider lines.
                  </p>
                </div>

                {/* Border Styles */}
                {/* Certificate Border Styles & Color */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
                      Certificate Border Style
                    </h4>
                    {template.backgroundStyle.borderStyle && template.backgroundStyle.borderStyle !== 'none' && (
                      <button
                        onClick={() => setTemplate({
                          ...template,
                          backgroundStyle: { ...template.backgroundStyle, borderStyle: 'none' }
                        })}
                        className="text-[10px] font-bold text-red-600 hover:underline"
                      >
                        Remove Border
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    {([
                      { id: 'none', label: 'None (Clean)' },
                      { id: 'classic', label: 'Classic' },
                      { id: 'gold_double', label: 'Gold Double' },
                      { id: 'modern', label: 'Modern Bar' },
                      { id: 'minimal', label: 'Minimal Thin' }
                    ] as const).map((b) => (
                      <button
                        key={b.id}
                        onClick={() => setTemplate({
                          ...template,
                          backgroundStyle: { ...template.backgroundStyle, borderStyle: b.id }
                        })}
                        className={`p-2 rounded-xl text-[10px] font-bold border text-center transition-all ${
                          (template.backgroundStyle.borderStyle || 'classic') === b.id
                            ? 'border-black bg-black text-white shadow-xs'
                            : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>

                  {/* Modern Accent Bar Color Picker */}
                  {template.backgroundStyle.borderStyle === 'modern' && (
                    <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-black">Top Accent Bar Color</span>
                        <span className="text-[9px] font-mono text-neutral-500">
                          {template.backgroundStyle.borderColor || '#4F46E5'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {[
                          { name: 'Black', hex: '#000000' },
                          { name: 'Navy', hex: '#0F172A' },
                          { name: 'Royal', hex: '#2563EB' },
                          { name: 'Indigo', hex: '#4F46E5' },
                          { name: 'Gold', hex: '#D97706' },
                          { name: 'Emerald', hex: '#059669' },
                          { name: 'Crimson', hex: '#E11D48' }
                        ].map(c => (
                          <button
                            key={c.hex}
                            title={c.name}
                            onClick={() => setTemplate({
                              ...template,
                              backgroundStyle: { ...template.backgroundStyle, borderColor: c.hex }
                            })}
                            style={{ backgroundColor: c.hex }}
                            className={`w-5 h-5 rounded-full border transition-transform ${
                              (template.backgroundStyle.borderColor || '#4F46E5') === c.hex
                                ? 'scale-125 border-black ring-2 ring-black/20'
                                : 'border-black/10 hover:scale-110'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Decorative Elements */}
                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
                    Graphic Elements
                  </h4>

                  <button
                    onClick={() => handleAddElement('seal', 'OFFICIAL', undefined, { width: 12, height: 12, x: 50, y: 50 })}
                    className="w-full p-2.5 rounded-xl border border-neutral-200 hover:border-black text-left text-xs font-bold text-neutral-800 hover:bg-neutral-50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-black" />
                      <span>Official Gold Crest Seal</span>
                    </div>
                    <span className="text-[10px] font-bold text-neutral-400">+ Add</span>
                  </button>

                  <button
                    onClick={() => handleAddElement('line', '', undefined, { width: 50, height: 1, backgroundColor: '#D97706', x: 50, y: 50 })}
                    className="w-full p-2.5 rounded-xl border border-neutral-200 hover:border-black text-left text-xs font-bold text-neutral-800 hover:bg-neutral-50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Minus className="w-4 h-4 text-black" />
                      <span>Decorative Divider Line</span>
                    </div>
                    <span className="text-[10px] font-bold text-neutral-400">+ Add</span>
                  </button>

                  <button
                    onClick={() => handleAddElement('text', 'YOUR CUSTOM TEXT BLOCK', undefined, { width: 50, height: 6, x: 50, y: 50 })}
                    className="w-full p-2.5 rounded-xl border border-neutral-200 hover:border-black text-left text-xs font-bold text-neutral-800 hover:bg-neutral-50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Type className="w-4 h-4 text-black" />
                      <span>Custom Text Block</span>
                    </div>
                    <span className="text-[10px] font-bold text-neutral-400">+ Add</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* CENTER: CERTIFICATE CANVAS (CANVA-LEVEL WORKSPACE) */}
        <div 
          className="flex-1 bg-neutral-100 p-6 flex items-center justify-center overflow-auto relative"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
              const reader = new FileReader();
              reader.onload = (ev) => {
                const dataUrl = ev.target?.result as string;
                if (dataUrl) {
                  handleAddElement('logo', dataUrl, 'logo', { width: 14, height: 14, x: 50, y: 20 });
                }
              };
              reader.readAsDataURL(file);
            }
          }}
        >
          
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
              className={`relative shadow-2xl rounded-xs transition-all select-none overflow-hidden ${
                showGrid ? 'canvas-grid-dots' : ''
              } ${
                template.backgroundStyle.borderStyle === 'gold_double' ? 'cert-gold-border' :
                template.backgroundStyle.borderStyle === 'classic' ? 'border-[12px] border-black' :
                template.backgroundStyle.borderStyle === 'modern' ? 'border border-neutral-300' :
                template.backgroundStyle.borderStyle === 'minimal' ? 'border-2 border-neutral-300' :
                ''
              }`}
            >
              {/* Modern Top Accent Bar Preview */}
              {template.backgroundStyle.borderStyle === 'modern' && (
                <div 
                  style={{ backgroundColor: template.backgroundStyle.borderColor || '#4F46E5' }}
                  className="absolute top-0 left-0 right-0 h-3 z-0 pointer-events-none" 
                />
              )}
              
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

                const elWidthPx = (el.width / 100) * template.width;
                const elHeightPx = (el.height / 100) * template.height;

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
                    {/* CANVA-STYLE INTERACTIVE BOUNDING BOX WITH 6 RESIZE HANDLES */}
                    {isSelected && !el.isLocked && (
                      <div className="absolute inset-0 pointer-events-none ring-2 ring-black">
                        
                        {/* Top-Left Corner Handle */}
                        <div
                          onMouseDown={(e) => handleResizeStart(e, el.id, 'nw')}
                          className="pointer-events-auto absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-black rounded-xs cursor-nwse-resize shadow-xs hover:scale-125 transition-transform"
                        />

                        {/* Top-Right Corner Handle */}
                        <div
                          onMouseDown={(e) => handleResizeStart(e, el.id, 'ne')}
                          className="pointer-events-auto absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-black rounded-xs cursor-nesw-resize shadow-xs hover:scale-125 transition-transform"
                        />

                        {/* Bottom-Right Corner Handle */}
                        <div
                          onMouseDown={(e) => handleResizeStart(e, el.id, 'se')}
                          className="pointer-events-auto absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-black rounded-xs cursor-nwse-resize shadow-xs hover:scale-125 transition-transform"
                        />

                        {/* Bottom-Left Corner Handle */}
                        <div
                          onMouseDown={(e) => handleResizeStart(e, el.id, 'sw')}
                          className="pointer-events-auto absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-black rounded-xs cursor-nesw-resize shadow-xs hover:scale-125 transition-transform"
                        />

                        {/* Right Edge Handle */}
                        <div
                          onMouseDown={(e) => handleResizeStart(e, el.id, 'e')}
                          className="pointer-events-auto absolute top-1/2 -right-1.5 -translate-y-1/2 w-2 h-4 bg-white border-2 border-black rounded-xs cursor-ew-resize shadow-xs hover:scale-125 transition-transform"
                        />

                        {/* Left Edge Handle */}
                        <div
                          onMouseDown={(e) => handleResizeStart(e, el.id, 'w')}
                          className="pointer-events-auto absolute top-1/2 -left-1.5 -translate-y-1/2 w-2 h-4 bg-white border-2 border-black rounded-xs cursor-ew-resize shadow-xs hover:scale-125 transition-transform"
                        />

                        {/* Floating Dimension Tag (Canva Style) */}
                        {isResizing && (
                          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] font-mono px-1.5 py-0.5 rounded shadow-md whitespace-nowrap pointer-events-none">
                            {Math.round(elWidthPx)} × {Math.round(elHeightPx)} px
                          </div>
                        )}
                      </div>
                    )}

                    {/* Canvas Element Body */}
                    {el.type === 'line' ? (
                      <div 
                        style={{ 
                          width: `${elWidthPx}px`, 
                          height: `${el.borderWidth || 2}px`, 
                          backgroundColor: el.backgroundColor || '#000000' 
                        }} 
                      />
                    ) : el.type === 'qr' ? (
                      <div 
                        style={{ width: `${elWidthPx}px`, height: `${elWidthPx}px` }}
                        className="border border-black rounded bg-white p-1 flex items-center justify-center shadow-xs"
                      >
                        <QrCode className="w-full h-full text-black" />
                      </div>
                    ) : el.type === 'logo' || el.type === 'image' ? (
                      <div 
                        style={{
                          width: `${elWidthPx}px`,
                          height: `${elHeightPx}px`
                        }}
                        className="flex items-center justify-center border border-dashed border-neutral-300 rounded bg-white/80 p-1 overflow-hidden"
                      >
                        {el.content && (el.content.startsWith('http') || el.content.startsWith('data:')) ? (
                          <img src={el.content} alt="Logo" className="w-full h-full object-contain" />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-neutral-400">
                            <Building2 className="w-5 h-5 mb-0.5" />
                            <span className="text-[9px] font-bold">Logo</span>
                          </div>
                        )}
                      </div>
                    ) : el.type === 'signature' && el.content.startsWith('data:image/') ? (
                      <div 
                        style={{
                          width: `${elWidthPx}px`,
                          height: `${elHeightPx}px`
                        }}
                        className="flex items-center justify-center"
                      >
                        <img src={el.content} alt="Signature" className="max-w-full max-h-full object-contain" />
                      </div>
                    ) : el.type === 'seal' ? (
                      <div 
                        style={{ width: `${elWidthPx}px`, height: `${elWidthPx}px` }}
                        className="rounded-full border-2 border-amber-600 bg-amber-50 flex flex-col items-center justify-center text-center p-1 text-amber-900 font-extrabold text-[8px] uppercase tracking-wider shadow-sm"
                      >
                        <span>★ OFFICIAL ★</span>
                        <span className="text-[6px] tracking-normal">VERIFIED</span>
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
                          maxWidth: `${elWidthPx}px`,
                          whiteSpace: 'pre-wrap'
                        }}
                        className="px-2 py-0.5 relative group"
                      >
                        {el.type === 'dynamic_field' && el.fieldKey && (
                          <span className="absolute -top-3.5 left-0 text-[8px] font-mono font-bold bg-neutral-900 text-white px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            {`{{${el.fieldKey}}}`}
                          </span>
                        )}
                        {el.content}
                      </div>
                    )}
                  </div>
                );
              })}

            </div>
          </div>

        </div>

        {/* RIGHT PANEL: PROPERTIES PANEL & QUICK ALIGNMENT (CANVA-LEVEL) */}
        <div className="w-80 bg-white border-l border-neutral-200 p-4 overflow-y-auto shrink-0 space-y-5">
          {selectedElement ? (
            <div className="space-y-4">
              
              {/* Header & Lock/Delete */}
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 block">
                    Properties
                  </span>
                  <span className="text-xs font-bold text-black capitalize">
                    {selectedElement.type.replace('_', ' ')}
                  </span>
                </div>

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
                    title="Duplicate (Ctrl+D)"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDeleteElement(selectedElement.id)}
                    className="p-1.5 rounded-lg text-neutral-500 hover:text-red-600 hover:bg-red-50"
                    title="Delete (Backspace)"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Canva Quick-Alignment Bar */}
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 block mb-1.5">
                  Canvas Alignment
                </span>
                <div className="grid grid-cols-4 gap-1">
                  <button
                    onClick={() => handleQuickAlign('center-h')}
                    className="p-1.5 rounded-lg border border-neutral-200 hover:border-black text-[10px] font-bold text-neutral-700 hover:bg-neutral-50 flex items-center justify-center gap-1"
                    title="Center Horizontally"
                  >
                    <AlignCenterHorizontal className="w-3 h-3" />
                    <span>Center</span>
                  </button>

                  <button
                    onClick={() => handleQuickAlign('center-v')}
                    className="p-1.5 rounded-lg border border-neutral-200 hover:border-black text-[10px] font-bold text-neutral-700 hover:bg-neutral-50 flex items-center justify-center gap-1"
                    title="Center Vertically"
                  >
                    <AlignCenterVertical className="w-3 h-3" />
                    <span>Middle</span>
                  </button>

                  <button
                    onClick={() => handleLayerOrder('front')}
                    className="p-1.5 rounded-lg border border-neutral-200 hover:border-black text-[10px] font-bold text-neutral-700 hover:bg-neutral-50 flex items-center justify-center"
                    title="Bring to Front"
                  >
                    To Front
                  </button>

                  <button
                    onClick={() => handleLayerOrder('back')}
                    className="p-1.5 rounded-lg border border-neutral-200 hover:border-black text-[10px] font-bold text-neutral-700 hover:bg-neutral-50 flex items-center justify-center"
                    title="Send to Back"
                  >
                    To Back
                  </button>
                </div>
              </div>

              {/* Specification Info Card if Field */}
              {currentFieldDef && (
                <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-black">{currentFieldDef.label}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      currentFieldDef.requirement.startsWith('Required')
                        ? 'bg-black text-white'
                        : 'bg-neutral-200 text-neutral-800'
                    }`}>
                      {currentFieldDef.requirement}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500">{currentFieldDef.purpose}</p>
                </div>
              )}

              {/* Logo / Image URL or Local PC Upload */}
              {(selectedElement.type === 'logo' || selectedElement.type === 'image') && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-black">
                      Logo Source
                    </label>
                    <button
                      onClick={() => logoFileInputRef.current?.click()}
                      className="text-[10px] font-bold text-black flex items-center gap-1 hover:underline"
                    >
                      <Upload className="w-3 h-3" />
                      <span>Upload from PC</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={selectedElement.content.startsWith('data:') ? 'Local file uploaded' : selectedElement.content}
                    onChange={(e) => handleUpdateSelected({ content: e.target.value })}
                    placeholder="https://... image URL"
                    className="w-full px-2.5 py-1.5 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:border-black font-medium"
                  />
                  
                  {/* Preset logo picker */}
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                      Quick Logo Presets
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => handleUpdateSelected({ content: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=150' })}
                        className="p-1.5 rounded-lg border border-neutral-200 hover:border-black text-[10px] font-semibold text-left truncate"
                      >
                        Academia Crest
                      </button>
                      <button
                        onClick={() => handleUpdateSelected({ content: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150' })}
                        className="p-1.5 rounded-lg border border-neutral-200 hover:border-black text-[10px] font-semibold text-left truncate"
                      >
                        Tech Modern
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Signature Source or Draw Signature */}
              {selectedElement.type === 'signature' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-black">
                      Signature Style
                    </label>
                    <button
                      onClick={() => setSignatureModalOpen(true)}
                      className="text-[10px] font-bold text-black flex items-center gap-1 hover:underline"
                    >
                      <PenTool className="w-3 h-3" />
                      <span>Draw New</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Dynamic Field Mapping Key */}
              {selectedElement.type === 'dynamic_field' && (
                <div>
                  <label className="block text-xs font-bold text-black mb-1">
                    Linked Field Key
                  </label>
                  <select
                    value={selectedElement.fieldKey || ''}
                    onChange={(e) => {
                      const newKey = e.target.value;
                      const fieldMatch = [...CORE_CERTIFICATE_ELEMENTS, ...OPTIONAL_STUDENT_COURSE_ELEMENTS].find(f => f.key === newKey);
                      handleUpdateSelected({
                        fieldKey: newKey,
                        content: fieldMatch ? fieldMatch.defaultText : `{{${newKey}}}`
                      });
                    }}
                    className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                  >
                    <optgroup label="Standard Core Elements">
                      {CORE_CERTIFICATE_ELEMENTS.map(f => (
                        <option key={f.key} value={f.key}>{f.label} ({f.requirement})</option>
                      ))}
                    </optgroup>
                    <optgroup label="Optional Student & Course Details">
                      {OPTIONAL_STUDENT_COURSE_ELEMENTS.map(f => (
                        <option key={f.key} value={f.key}>{f.label}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              )}

              {/* Text Content Input */}
              {(selectedElement.type === 'text' || selectedElement.type === 'dynamic_field' || (selectedElement.type === 'signature' && !selectedElement.content.startsWith('data:')) || selectedElement.type === 'certificate_id') && (
                <div>
                  <label className="block text-xs font-bold text-black mb-1">
                    Display Content / Template Text
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
                <div className="space-y-3 pt-1 border-t border-neutral-100">
                  <div>
                    <label className="block text-xs font-bold text-black mb-1">Font Family</label>
                    <select
                      value={selectedElement.fontSettings.family}
                      onChange={(e) => handleUpdateFont({ family: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs font-semibold bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                    >
                      <option value="Plus Jakarta Sans">Plus Jakarta Sans (Modern Clean)</option>
                      <option value="Inter">Inter (Neutral Sans)</option>
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
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">Color</label>
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

              {/* Dimensions & Advanced Coordinates */}
              <div className="space-y-3 pt-3 border-t border-neutral-200">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 block">
                  Dimensions & Position
                </span>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[11px] text-neutral-600 font-bold">Width (%)</label>
                    <input
                      type="number"
                      min={2}
                      max={100}
                      value={Math.round(selectedElement.width)}
                      onChange={(e) => handleUpdateSelected({ width: Number(e.target.value) })}
                      className="w-full px-2 py-1 border border-neutral-300 rounded-lg mt-0.5 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-neutral-600 font-bold">Height (%)</label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={Math.round(selectedElement.height)}
                      onChange={(e) => handleUpdateSelected({ height: Number(e.target.value) })}
                      className="w-full px-2 py-1 border border-neutral-300 rounded-lg mt-0.5 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-neutral-600 font-bold">X Position (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={Math.round(selectedElement.x)}
                      onChange={(e) => handleUpdateSelected({ x: Number(e.target.value) })}
                      className="w-full px-2 py-1 border border-neutral-300 rounded-lg mt-0.5 font-mono font-bold"
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
                      className="w-full px-2 py-1 border border-neutral-300 rounded-lg mt-0.5 font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-neutral-700 font-bold">Layer Order (Z-Index)</span>
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

            </div>
          ) : (
            <div className="py-12 text-center space-y-2">
              <Sliders className="w-8 h-8 text-neutral-300 mx-auto" />
              <p className="text-xs text-neutral-500 font-medium">Select any element on the canvas to configure its properties.</p>
            </div>
          )}
        </div>

      </div>

      {/* DIGITAL SIGNATURE DRAWING & CALLIGRAPHY MODAL */}
      <SignaturePadModal
        isOpen={signatureModalOpen}
        onClose={() => setSignatureModalOpen(false)}
        onInsertSignature={(dataUrl, name) => {
          if (selectedElement && selectedElement.type === 'signature') {
            handleUpdateSelected({ content: dataUrl });
          } else {
            const existingSig = template.elements.find(el => el.type === 'signature');
            if (existingSig) {
              const updatedElements = template.elements.map(el =>
                el.id === existingSig.id ? { ...el, content: dataUrl } : el
              );
              pushHistory({ ...template, elements: updatedElements });
              setSelectedElementId(existingSig.id);
            } else {
              handleAddElement('signature', dataUrl, 'signature', {
                x: 75,
                y: 76,
                width: 26,
                height: 10
              });
            }
          }
        }}
      />

      {/* LIVE TEST MODAL */}
      {testModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="max-w-4xl w-full bg-white rounded-2xl shadow-elevated p-6 space-y-4 border border-neutral-200">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-black">Live High-Res Certificate Render</h3>
                <p className="text-xs text-neutral-500">Rendered with separate issue and completion dates, student ID, and signatures.</p>
              </div>
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

      {/* SAVE TEMPLATE DIALOG & CONFIRMATION MODAL */}
      <SaveTemplateModal
        isOpen={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        currentTemplate={template}
        onConfirmSave={(savedTemplate) => {
          setTemplate(savedTemplate);
          StorageService.saveTemplate(savedTemplate);
          onSaveTemplate(savedTemplate);
          setSaveStatus('saved');
        }}
        onNavigateToTemplates={onNavigateToTemplates}
        onNavigateToWizard={onNavigateToWizard}
      />

    </div>
  );
};
