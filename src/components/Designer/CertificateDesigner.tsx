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
  AlignCenterVertical,
  Palette,
  RefreshCw,
  X,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { Template, TemplateElement, ElementType, UserProfile } from '../../types';
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

interface BackgroundPresetItem {
  id: string;
  name: string;
  category: string;
  description: string;
  color: string;
  gradient?: string;
  borderStyle: 'classic' | 'modern' | 'gold_double' | 'minimal' | 'none';
  borderColor?: string;
  patternType?: 'none' | 'guilloche' | 'dots' | 'geometric';
  badge: string;
}

const BACKGROUND_PRESETS: BackgroundPresetItem[] = [
  {
    id: 'gold-crest',
    name: 'Executive Gold Crest',
    category: 'Luxury',
    description: 'Gold double border on ivory parchment with guilloche waves',
    color: '#FFFCF5',
    borderStyle: 'gold_double',
    borderColor: '#B45309',
    patternType: 'guilloche',
    badge: 'LUXURY'
  },
  {
    id: 'diplomatic-navy',
    name: 'Diplomatic Royal Navy',
    category: 'Corporate',
    description: 'Crisp pearl white with double navy borders for official charters',
    color: '#FFFFFF',
    borderStyle: 'classic',
    borderColor: '#0F172A',
    patternType: 'none',
    badge: 'POPULAR'
  },
  {
    id: 'vintage-parchment',
    name: 'Academic Parchment',
    category: 'Academic',
    description: 'Warm cream vintage diploma feel with ornate framing',
    color: '#FEF3C7',
    borderStyle: 'classic',
    borderColor: '#78350F',
    patternType: 'guilloche',
    badge: 'DIPLOMA'
  },
  {
    id: 'obsidian-dark',
    name: 'Obsidian Dark Luxe',
    category: 'Modern',
    description: 'Premium dark obsidian with metallic gold accent bar',
    color: '#090D16',
    borderStyle: 'modern',
    borderColor: '#D97706',
    patternType: 'dots',
    badge: 'DARK'
  },
  {
    id: 'emerald-tech',
    name: 'Emerald Innovation',
    category: 'Modern',
    description: 'Clean high-tech emerald bar with subtle matrix lattice',
    color: '#F0FDF4',
    borderStyle: 'modern',
    borderColor: '#059669',
    patternType: 'dots',
    badge: 'TECH'
  },
  {
    id: 'midnight-gradient',
    name: 'Midnight Sapphire',
    category: 'Gradient',
    description: 'Deep modern sapphire to midnight gradient backdrop',
    color: '#0A0F1D',
    gradient: 'linear-gradient(135deg, #0A0F1D 0%, #1E1B4B 50%, #0F172A 100%)',
    borderStyle: 'none',
    patternType: 'none',
    badge: 'GRADIENT'
  },
  {
    id: 'champagne-glow',
    name: 'Champagne Amber',
    category: 'Gradient',
    description: 'Soft champagne amber gradient for luxury celebrations',
    color: '#FFFBEB',
    gradient: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 50%, #FFFBEB 100%)',
    borderStyle: 'none',
    patternType: 'none',
    badge: 'WARM'
  },
  {
    id: 'minimal-studio',
    name: 'Minimal Pure Studio',
    category: 'Clean',
    description: 'Pure clean white canvas with minimal precision hairline',
    color: '#FFFFFF',
    borderStyle: 'minimal',
    borderColor: '#CBD5E1',
    patternType: 'none',
    badge: 'MINIMAL'
  }
];

interface CertificateDesignerProps {
  initialTemplate: Template;
  onBack: () => void;
  onSaveTemplate: (updated: Template) => void;
  onNavigateToTemplates?: () => void;
  onNavigateToWizard?: (templateId: string) => void;
  user?: UserProfile;
  onOpenBilling?: () => void;
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
  onNavigateToWizard,
  user,
  onOpenBilling
}) => {
  const isCreditsExhausted = user?.usage ? (user.usage.certificatesGenerated >= user.usage.certificatesLimit) : false;
  const [template, setTemplate] = useState<Template>(initialTemplate);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(
    initialTemplate.elements[0]?.id || null
  );
  const [isAdvancedMode, setIsAdvancedMode] = useState<boolean>(false);
  
  // Dynamic scale calculation: on laptop screens, portrait mode (842px) fits cleanly at 62-65%, landscape (595px) fits at 85%
  const getOptimalZoom = (orientation: 'landscape' | 'portrait') => {
    return orientation === 'portrait' ? 62 : 85;
  };

  const [zoomLevel, setZoomLevel] = useState<number>(() => 
    initialTemplate.orientation === 'portrait' ? 62 : 85
  );
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  // Left sidebar active tab
  const [sidebarTab, setSidebarTab] = useState<'core' | 'optional' | 'signatories' | 'decor' | 'background'>('core');

  // Modals
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Hidden File Inputs for PC Uploads
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const signatureFileInputRef = useRef<HTMLInputElement>(null);
  const bgFileInputRef = useRef<HTMLInputElement>(null);

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
        const img = new Image();
        img.onload = () => {
          const naturalW = img.naturalWidth || 100;
          const naturalH = img.naturalHeight || 100;
          const aspect = naturalW / naturalH; // width / height

          const cWidth = template.width || 842;
          const cHeight = template.height || 595;
          const canvasAspect = cWidth / cHeight; // e.g. 1.415

          // Choose optimal bounding box dimensions matching the logo's aspect ratio
          let targetHeightPercent = 8;
          let targetWidthPercent = Math.round((targetHeightPercent / canvasAspect) * aspect * 10) / 10;

          // If logo is very wide banner (aspect > 3), cap width at 45% and adjust height
          if (targetWidthPercent > 45) {
            targetWidthPercent = 45;
            targetHeightPercent = Math.round((targetWidthPercent * canvasAspect / aspect) * 10) / 10;
          }
          if (targetWidthPercent < 10) {
            targetWidthPercent = 10;
            targetHeightPercent = Math.round((targetWidthPercent * canvasAspect / aspect) * 10) / 10;
          }
          if (targetHeightPercent > 18) {
            targetHeightPercent = 18;
            targetWidthPercent = Math.round((targetHeightPercent / canvasAspect) * aspect * 10) / 10;
          }

          const existingLogo = template.elements.find(el => el.type === 'logo' || el.fieldKey === 'logo');
          if (selectedElement && (selectedElement.type === 'logo' || selectedElement.fieldKey === 'logo')) {
            handleUpdateSelected({
              content: dataUrl,
              width: targetWidthPercent,
              height: targetHeightPercent
            });
          } else if (existingLogo) {
            const updated = template.elements.map(el =>
              el.id === existingLogo.id ? { 
                ...el, 
                content: dataUrl, 
                width: targetWidthPercent, 
                height: targetHeightPercent 
              } : el
            );
            pushHistory({ ...template, elements: updated });
            setSelectedElementId(existingLogo.id);
          } else {
            handleAddElement('logo', dataUrl, 'logo', {
              x: 50,
              y: 10,
              width: targetWidthPercent,
              height: targetHeightPercent
            });
          }
        };
        img.src = dataUrl;
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

  const handleSetOrientation = (orientation: 'landscape' | 'portrait') => {
    if (template.orientation === orientation) return;
    const isTargetPortrait = orientation === 'portrait';
    const newWidth = isTargetPortrait ? 595 : 842;
    const newHeight = isTargetPortrait ? 842 : 595;
    const updated: Template = {
      ...template,
      orientation,
      width: newWidth,
      height: newHeight
    };
    setTemplate(updated);
    pushHistory(updated);
    setZoomLevel(getOptimalZoom(orientation));
  };

  const handleBackgroundUpload = (file: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) {
        const updated: Template = {
          ...template,
          backgroundStyle: {
            ...template.backgroundStyle,
            type: 'image',
            imageUrl: dataUrl,
            imageFit: template.backgroundStyle.imageFit || 'cover',
            imageOpacity: template.backgroundStyle.imageOpacity ?? 1,
            borderStyle: 'none' // Auto-clean border so it doesn't clash with institute design
          }
        };
        setTemplate(updated);
        pushHistory(updated);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveBackground = () => {
    const updated: Template = {
      ...template,
      backgroundStyle: {
        ...template.backgroundStyle,
        imageUrl: undefined,
        type: template.backgroundStyle.gradient ? 'gradient' : 'color'
      }
    };
    setTemplate(updated);
    pushHistory(updated);
  };

  const handleApplyBackgroundPreset = (preset: BackgroundPresetItem) => {
    const updated: Template = {
      ...template,
      backgroundStyle: {
        ...template.backgroundStyle,
        color: preset.color,
        gradient: preset.gradient,
        borderStyle: preset.borderStyle,
        borderColor: preset.borderColor,
        patternType: preset.patternType,
        imageUrl: undefined,
        type: preset.gradient ? 'gradient' : 'color'
      }
    };
    setTemplate(updated);
    pushHistory(updated);
  };

  const handleAddCoreElement = (field: FieldDefinition) => {
    // If element already exists on canvas, select it instead of creating a duplicate!
    const existingElement = template.elements.find(el => 
      (field.key === 'logo' && (el.type === 'logo' || el.fieldKey === 'logo')) ||
      (el.fieldKey === field.key) ||
      (field.key === 'title' && (el.id === 'el-title' || el.fieldKey === 'title')) ||
      (field.key === 'organization' && (el.id === 'el-org-name' || el.fieldKey === 'organization')) ||
      (field.key === 'certificate_id' && (el.type === 'certificate_id' || el.fieldKey === 'certificate_id')) ||
      (field.key === 'qr' && (el.type === 'qr' || el.fieldKey === 'qr'))
    );

    if (existingElement) {
      setSelectedElementId(existingElement.id);
      return;
    }

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

      const isImageOrLogo = selectedElement?.type === 'logo' || selectedElement?.type === 'image' || selectedElement?.type === 'signature';
      const initialAspect = (initialWidth * rect.width) / (initialHeight * rect.height || 1);

      if (handle === 'e') {
        newWidth = Math.max(4, Math.min(96, initialWidth + deltaXPercent));
      } else if (handle === 'w') {
        newWidth = Math.max(4, Math.min(96, initialWidth - deltaXPercent));
        newX = initialX + deltaXPercent / 2;
      } else if (handle === 'se') {
        newWidth = Math.max(4, Math.min(96, initialWidth + deltaXPercent));
        if (isImageOrLogo && initialAspect > 0) {
          const newHeightPx = (newWidth / 100 * rect.width) / initialAspect;
          newHeight = Math.max(2, Math.min(96, (newHeightPx / rect.height) * 100));
        } else {
          newHeight = Math.max(2, Math.min(96, initialHeight + deltaYPercent));
        }
      } else if (handle === 'sw') {
        newWidth = Math.max(4, Math.min(96, initialWidth - deltaXPercent));
        if (isImageOrLogo && initialAspect > 0) {
          const newHeightPx = (newWidth / 100 * rect.width) / initialAspect;
          newHeight = Math.max(2, Math.min(96, (newHeightPx / rect.height) * 100));
        } else {
          newHeight = Math.max(2, Math.min(96, initialHeight + deltaYPercent));
        }
        newX = initialX + deltaXPercent / 2;
      } else if (handle === 'ne') {
        newWidth = Math.max(4, Math.min(96, initialWidth + deltaXPercent));
        if (isImageOrLogo && initialAspect > 0) {
          const newHeightPx = (newWidth / 100 * rect.width) / initialAspect;
          newHeight = Math.max(2, Math.min(96, (newHeightPx / rect.height) * 100));
          newY = initialY - (newHeight - initialHeight) / 2;
        } else {
          newHeight = Math.max(2, Math.min(96, initialHeight - deltaYPercent));
          newY = initialY + deltaYPercent / 2;
        }
      } else if (handle === 'nw') {
        newWidth = Math.max(4, Math.min(96, initialWidth - deltaXPercent));
        if (isImageOrLogo && initialAspect > 0) {
          const newHeightPx = (newWidth / 100 * rect.width) / initialAspect;
          newHeight = Math.max(2, Math.min(96, (newHeightPx / rect.height) * 100));
          newY = initialY - (newHeight - initialHeight) / 2;
        } else {
          newHeight = Math.max(2, Math.min(96, initialHeight - deltaYPercent));
          newY = initialY + deltaYPercent / 2;
        }
        newX = initialX + deltaXPercent / 2;
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
      <input
        type="file"
        ref={bgFileInputRef}
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleBackgroundUpload(file);
          e.target.value = '';
        }}
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
              <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg border border-neutral-200 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => handleSetOrientation('landscape')}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition-all ${
                    template.orientation === 'landscape'
                      ? 'bg-black text-white shadow-xs'
                      : 'text-neutral-600 hover:text-black'
                  }`}
                  title="A4 Landscape (842 x 595 px)"
                >
                  <Layout className="w-3 h-3" />
                  <span>Landscape</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSetOrientation('portrait')}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition-all ${
                    template.orientation === 'portrait'
                      ? 'bg-black text-white shadow-xs'
                      : 'text-neutral-600 hover:text-black'
                  }`}
                  title="A4 Portrait (595 x 842 px)"
                >
                  <FileText className="w-3 h-3" />
                  <span>Portrait</span>
                </button>
              </div>
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

          {/* Zoom controls with Auto-Fit */}
          <div className="flex items-center gap-1 text-xs text-neutral-700 bg-neutral-100 px-1 py-0.5 rounded-lg border border-neutral-200">
            <button
              onClick={() => setZoomLevel(Math.max(40, zoomLevel - 10))}
              className="p-1 rounded-md hover:bg-neutral-200 text-neutral-700 cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="w-9 text-center font-mono font-bold text-black text-xs">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel(Math.min(150, zoomLevel + 10))}
              className="p-1 rounded-md hover:bg-neutral-200 text-neutral-700 cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(getOptimalZoom(template.orientation))}
              className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-white border border-neutral-300 hover:bg-neutral-50 text-black shadow-2xs cursor-pointer ml-1"
              title="Fit to Screen (Auto-scale so entire certificate is visible)"
            >
              Fit
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
          {isCreditsExhausted && onOpenBilling && (
            <button
              type="button"
              onClick={onOpenBilling}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-xs animate-pulse transition-all cursor-pointer"
              title="Certificate credits khatam ho gaye hain. Plan upgrade karne ke liye click karein."
            >
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>0 Credits — Upgrade Plan</span>
              <Zap className="w-3 h-3 shrink-0" />
            </button>
          )}

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
              onClick={() => setSidebarTab('background')}
              className={`py-1.5 px-1 rounded-md text-center transition-all ${
                sidebarTab === 'background' || sidebarTab === 'decor'
                  ? 'bg-black text-white shadow-xs' 
                  : 'text-neutral-600 hover:bg-neutral-200/60'
              }`}
            >
              4. Background
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
                          {(() => {
                            const isAdded = template.elements.some(el => 
                              (field.key === 'logo' && (el.type === 'logo' || el.fieldKey === 'logo')) ||
                              (el.fieldKey === field.key) ||
                              (field.key === 'title' && (el.id === 'el-title' || el.fieldKey === 'title')) ||
                              (field.key === 'organization' && (el.id === 'el-org-name' || el.fieldKey === 'organization')) ||
                              (field.key === 'certificate_id' && (el.type === 'certificate_id' || el.fieldKey === 'certificate_id')) ||
                              (field.key === 'qr' && (el.type === 'qr' || el.fieldKey === 'qr'))
                            );
                            return (
                              <button
                                onClick={() => handleAddCoreElement(field)}
                                className={`px-2 py-0.5 rounded font-bold border shrink-0 transition-colors ${
                                  isAdded
                                    ? 'bg-neutral-200 hover:bg-black hover:text-white text-neutral-800 border-neutral-300'
                                    : 'bg-neutral-100 hover:bg-black hover:text-white text-black border-neutral-200'
                                }`}
                                title={isAdded ? 'Select this element on canvas' : 'Add to canvas'}
                              >
                                {isAdded ? 'Select' : '+ Add'}
                              </button>
                            );
                          })()}
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

            {/* TAB 4: BACKGROUND STUDIO (CUSTOM INSTITUTE BG, PRESETS, ORIENTATION, BORDERS) */}
            {(sidebarTab === 'background' || sidebarTab === 'decor') && (
              <div className="space-y-5">
                <div className="border-b border-neutral-100 pb-2">
                  <h3 className="text-xs font-black text-black uppercase tracking-wide flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-black" />
                    <span>Background & Orientation</span>
                  </h3>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Upload your institute's ready-made certificate design or choose from luxury presets.
                  </p>
                </div>

                {/* 1. Canvas Orientation: Landscape vs Portrait */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
                      Certificate Orientation
                    </h4>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600">
                      A4 Standard
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleSetOrientation('landscape')}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        template.orientation === 'landscape'
                          ? 'border-black bg-neutral-900 text-white shadow-xs'
                          : 'border-neutral-200 hover:border-neutral-300 bg-white text-neutral-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Layout className="w-4 h-4 shrink-0" />
                        <span className="text-xs font-bold">Landscape</span>
                      </div>
                      <p className={`text-[10px] ${template.orientation === 'landscape' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                        842 × 595 px (Classic Diploma)
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSetOrientation('portrait')}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        template.orientation === 'portrait'
                          ? 'border-black bg-neutral-900 text-white shadow-xs'
                          : 'border-neutral-200 hover:border-neutral-300 bg-white text-neutral-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-4 h-4 shrink-0" />
                        <span className="text-xs font-bold">Portrait</span>
                      </div>
                      <p className={`text-[10px] ${template.orientation === 'portrait' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                        595 × 842 px (Vertical Award)
                      </p>
                    </button>
                  </div>
                </div>

                {/* 2. Institute Custom Background Upload */}
                <div className="space-y-2.5 p-3 rounded-2xl bg-neutral-50 border border-neutral-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5 text-black" />
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-black">
                        Institute Custom Background
                      </h4>
                    </div>
                    {template.backgroundStyle.imageUrl && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <Check className="w-2.5 h-2.5" />
                        Active BG
                      </span>
                    )}
                  </div>

                  {template.backgroundStyle.imageUrl ? (
                    <div className="space-y-3">
                      {/* Active Background Thumbnail & Actions */}
                      <div className="relative rounded-xl overflow-hidden border border-neutral-300 bg-white shadow-xs">
                        <div 
                          className="h-28 w-full bg-contain bg-center bg-no-repeat"
                          style={{
                            backgroundImage: `url(${template.backgroundStyle.imageUrl})`,
                            backgroundColor: '#F8FAFC'
                          }}
                        />
                        <div className="p-2 bg-white/95 border-t border-neutral-200 flex items-center justify-between gap-1.5">
                          <button
                            type="button"
                            onClick={() => bgFileInputRef.current?.click()}
                            className="flex-1 py-1.5 px-2 bg-neutral-100 hover:bg-neutral-200 text-black text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Replace File</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleRemoveBackground}
                            className="py-1.5 px-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                            title="Remove uploaded background"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>

                      {/* Image Fit Mode */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-neutral-600">Image Fit Mode</span>
                        <div className="grid grid-cols-3 gap-1">
                          {(['cover', 'contain', 'stretch'] as const).map(fit => (
                            <button
                              key={fit}
                              type="button"
                              onClick={() => {
                                const updated = {
                                  ...template,
                                  backgroundStyle: { ...template.backgroundStyle, imageFit: fit }
                                };
                                setTemplate(updated);
                                pushHistory(updated);
                              }}
                              className={`py-1 px-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-center transition-all ${
                                (template.backgroundStyle.imageFit || 'cover') === fit
                                  ? 'bg-black text-white shadow-xs'
                                  : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                              }`}
                            >
                              {fit}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Opacity Slider */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-neutral-600">Background Opacity</span>
                          <span className="font-mono font-bold text-black">
                            {Math.round((template.backgroundStyle.imageOpacity ?? 1) * 100)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          step="5"
                          value={Math.round((template.backgroundStyle.imageOpacity ?? 1) * 100)}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10) / 100;
                            const updated = {
                              ...template,
                              backgroundStyle: { ...template.backgroundStyle, imageOpacity: val }
                            };
                            setTemplate(updated);
                          }}
                          onMouseUp={() => pushHistory(template)}
                          className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-black"
                        />
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={() => bgFileInputRef.current?.click()}
                      className="border-2 border-dashed border-neutral-300 hover:border-black rounded-xl p-4 text-center cursor-pointer bg-white transition-all group"
                    >
                      <div className="w-10 h-10 rounded-full bg-neutral-100 group-hover:bg-black group-hover:text-white text-neutral-600 mx-auto flex items-center justify-center transition-colors mb-2">
                        <Upload className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-black group-hover:underline">
                        Upload Institute Background
                      </p>
                      <p className="text-[10px] text-neutral-500 mt-1 leading-relaxed">
                        PNG, JPG, SVG stationery or Canva design. Certificate text &amp; QR will sit on top.
                      </p>
                      <span className="inline-block mt-2 px-2.5 py-1 bg-neutral-100 group-hover:bg-neutral-200 rounded-md text-[10px] font-bold text-neutral-800">
                        Browse File from PC
                      </span>
                    </div>
                  )}
                </div>

                {/* 3. Ready-Made Background Presets */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
                      Ready-Made BG Presets
                    </h4>
                    <span className="text-[9px] text-neutral-500 font-medium">8 Styles</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {BACKGROUND_PRESETS.map((preset) => {
                      const isActive = 
                        !template.backgroundStyle.imageUrl && 
                        template.backgroundStyle.color === preset.color && 
                        template.backgroundStyle.borderStyle === preset.borderStyle;

                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handleApplyBackgroundPreset(preset)}
                          className={`p-2 rounded-xl border text-left transition-all flex flex-col justify-between ${
                            isActive
                              ? 'border-black ring-2 ring-black bg-neutral-50 shadow-xs'
                              : 'border-neutral-200 hover:border-neutral-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span 
                              className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                              style={{ 
                                backgroundColor: preset.color,
                                backgroundImage: preset.gradient 
                              }}
                            />
                            <span className="text-[8px] font-extrabold uppercase px-1 py-0.2 rounded bg-neutral-100 text-neutral-600">
                              {preset.badge}
                            </span>
                          </div>
                          <div>
                            <div className="text-[11px] font-bold text-black line-clamp-1">
                              {preset.name}
                            </div>
                            <p className="text-[9px] text-neutral-500 mt-0.5 line-clamp-1">
                              {preset.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Solid Colors & Swatches */}
                <div className="space-y-2 p-3 rounded-2xl bg-neutral-50 border border-neutral-200">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-black">
                      Background Color &amp; Tint
                    </h4>
                    <span className="text-[9px] font-mono font-bold text-neutral-600">
                      {template.backgroundStyle.color || '#FFFFFF'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[
                      { name: 'Pure White', hex: '#FFFFFF' },
                      { name: 'Warm Ivory', hex: '#FFFBEB' },
                      { name: 'Academic Cream', hex: '#FEF3C7' },
                      { name: 'Soft Linen', hex: '#F8FAFC' },
                      { name: 'Pale Mint', hex: '#F0FDF4' },
                      { name: 'Midnight Dark', hex: '#090D16' },
                      { name: 'Navy Deep', hex: '#0F172A' },
                    ].map(c => (
                      <button
                        key={c.hex}
                        type="button"
                        title={c.name}
                        onClick={() => {
                          const updated = {
                            ...template,
                            backgroundStyle: {
                              ...template.backgroundStyle,
                              color: c.hex,
                              gradient: undefined
                            }
                          };
                          setTemplate(updated);
                          pushHistory(updated);
                        }}
                        style={{ backgroundColor: c.hex }}
                        className={`w-6 h-6 rounded-lg border transition-transform ${
                          template.backgroundStyle.color === c.hex && !template.backgroundStyle.gradient
                            ? 'scale-110 border-black ring-2 ring-black/30'
                            : 'border-neutral-300 hover:scale-105'
                        }`}
                      />
                    ))}
                    <input
                      type="color"
                      value={template.backgroundStyle.color || '#FFFFFF'}
                      onChange={(e) => {
                        const updated = {
                          ...template,
                          backgroundStyle: {
                            ...template.backgroundStyle,
                            color: e.target.value,
                            gradient: undefined
                          }
                        };
                        setTemplate(updated);
                      }}
                      onBlur={() => pushHistory(template)}
                      title="Custom Hex Picker"
                      className="w-6 h-6 rounded-lg border border-neutral-300 cursor-pointer p-0 bg-transparent"
                    />
                  </div>
                </div>

                {/* 5. Border Styles */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
                      Certificate Border Framing
                    </h4>
                    {template.backgroundStyle.borderStyle && template.backgroundStyle.borderStyle !== 'none' && (
                      <button
                        type="button"
                        onClick={() => {
                          const updated = {
                            ...template,
                            backgroundStyle: { ...template.backgroundStyle, borderStyle: 'none' as const }
                          };
                          setTemplate(updated);
                          pushHistory(updated);
                        }}
                        className="text-[10px] font-bold text-red-600 hover:underline"
                      >
                        Remove Border
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    {([
                      { id: 'none', label: 'None (Clean)' },
                      { id: 'classic', label: 'Classic Navy' },
                      { id: 'gold_double', label: 'Gold Double' },
                      { id: 'modern', label: 'Modern Bar' },
                      { id: 'minimal', label: 'Minimal Thin' }
                    ] as const).map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => {
                          const updated = {
                            ...template,
                            backgroundStyle: { ...template.backgroundStyle, borderStyle: b.id }
                          };
                          setTemplate(updated);
                          pushHistory(updated);
                        }}
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
                            type="button"
                            title={c.name}
                            onClick={() => {
                              const updated = {
                                ...template,
                                backgroundStyle: { ...template.backgroundStyle, borderColor: c.hex }
                              };
                              setTemplate(updated);
                              pushHistory(updated);
                            }}
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

                {/* 6. Security Patterns */}
                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
                    Security Texture Overlays
                  </h4>
                  <div className="grid grid-cols-3 gap-1.5">
                    {([
                      { id: 'none', label: 'None' },
                      { id: 'guilloche', label: 'Guilloche Waves' },
                      { id: 'dots', label: 'Micro Lattice' }
                    ] as const).map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          const updated = {
                            ...template,
                            backgroundStyle: { ...template.backgroundStyle, patternType: p.id }
                          };
                          setTemplate(updated);
                          pushHistory(updated);
                        }}
                        className={`p-2 rounded-xl text-[10px] font-bold border text-center transition-all ${
                          (template.backgroundStyle.patternType || 'none') === p.id
                            ? 'border-black bg-black text-white shadow-xs'
                            : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 7. Decorative Seal / Divider Elements */}
                <div className="space-y-1.5 pt-2 border-t border-neutral-100">
                  <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
                    Graphic Elements
                  </h4>

                  <button
                    type="button"
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
                    type="button"
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
                    type="button"
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
          className="flex-1 bg-neutral-200/60 p-6 sm:p-8 flex items-center justify-center overflow-auto relative min-h-0"
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
          {/* Sized Layout Bounding Wrapper: matches scaled visual size for perfect centering and smooth scrolling */}
          <div 
            style={{ 
              width: `${Math.round(template.width * (zoomLevel / 100))}px`,
              height: `${Math.round(template.height * (zoomLevel / 100))}px`,
            }}
            className="relative transition-all duration-150 m-auto shrink-0 shadow-2xl rounded-xs"
          >
            {/* Scaled Certificate Board */}
            <div 
              style={{ 
                transform: `scale(${zoomLevel / 100})`, 
                transformOrigin: 'top left',
                width: `${template.width}px`,
                height: `${template.height}px`,
              }}
              className="absolute top-0 left-0 transition-transform duration-150"
            >
              {/* The Certificate Canvas Board */}
              <div
                ref={canvasRef}
                style={{
                  width: `${template.width}px`,
                  height: `${template.height}px`,
                  backgroundColor: template.backgroundStyle.color || '#FFFFFF',
                  backgroundImage: template.backgroundStyle.gradient || undefined,
                }}
                className={`w-full h-full relative rounded-xs select-none overflow-hidden ${
                  showGrid ? 'canvas-grid-dots' : ''
                } ${
                  template.backgroundStyle.borderStyle === 'gold_double' ? 'cert-gold-border' :
                  template.backgroundStyle.borderStyle === 'classic' ? 'border-[12px] border-black' :
                  template.backgroundStyle.borderStyle === 'modern' ? 'border border-neutral-300' :
                  template.backgroundStyle.borderStyle === 'minimal' ? 'border-2 border-neutral-300' :
                  ''
                }`}
              >
              {/* Custom Institute Background Image Layer */}
              {template.backgroundStyle.imageUrl && (
                <div 
                  className="absolute inset-0 pointer-events-none z-0"
                  style={{
                    backgroundImage: `url(${template.backgroundStyle.imageUrl})`,
                    backgroundSize: template.backgroundStyle.imageFit === 'stretch' 
                      ? '100% 100%' 
                      : template.backgroundStyle.imageFit === 'contain' 
                        ? 'contain' 
                        : 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    opacity: template.backgroundStyle.imageOpacity ?? 1
                  }}
                />
              )}

              {/* Security Pattern Texture Overlay */}
              {template.backgroundStyle.patternType === 'guilloche' && (
                <div 
                  className="absolute inset-0 pointer-events-none z-0 opacity-15"
                  style={{
                    backgroundImage: `repeating-radial-gradient(circle at 50% 50%, transparent, transparent 15px, rgba(180, 83, 9, 0.25) 16px, transparent 17px)`
                  }}
                />
              )}
              {template.backgroundStyle.patternType === 'dots' && (
                <div 
                  className="absolute inset-0 pointer-events-none z-0 opacity-20"
                  style={{
                    backgroundImage: `radial-gradient(rgba(100, 116, 139, 0.4) 1px, transparent 1px)`,
                    backgroundSize: '20px 20px'
                  }}
                />
              )}

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
                        className={`flex items-center justify-center overflow-hidden ${
                          el.content && (el.content.startsWith('http') || el.content.startsWith('data:'))
                            ? 'bg-transparent'
                            : 'border border-dashed border-neutral-300 rounded bg-white/80 p-1'
                        }`}
                      >
                        {el.content && (el.content.startsWith('http') || el.content.startsWith('data:')) ? (
                          <img 
                            src={el.content} 
                            alt="Logo" 
                            draggable={false}
                            className="max-w-full max-h-full w-full h-full object-contain pointer-events-none select-none" 
                          />
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
                        <img 
                          src={el.content} 
                          alt="Signature" 
                          draggable={false}
                          className="max-w-full max-h-full object-contain pointer-events-none select-none" 
                        />
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
                          width: `${elWidthPx}px`,
                          maxWidth: `${elWidthPx}px`,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          boxSizing: 'border-box'
                        }}
                        className="relative group select-none"
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

                  {selectedElement.content && (
                    <button
                      type="button"
                      onClick={() => {
                        const img = new Image();
                        img.onload = () => {
                          const naturalW = img.naturalWidth || 100;
                          const naturalH = img.naturalHeight || 100;
                          const aspect = naturalW / naturalH;
                          const cWidth = template.width || 842;
                          const cHeight = template.height || 595;
                          const canvasAspect = cWidth / cHeight;
                          let targetHeightPercent = selectedElement.height || 8;
                          let targetWidthPercent = Math.round((targetHeightPercent / canvasAspect) * aspect * 10) / 10;
                          if (targetWidthPercent > 50) {
                            targetWidthPercent = 50;
                            targetHeightPercent = Math.round((targetWidthPercent * canvasAspect / aspect) * 10) / 10;
                          }
                          handleUpdateSelected({ width: targetWidthPercent, height: targetHeightPercent });
                        };
                        img.src = selectedElement.content;
                      }}
                      className="w-full py-2 px-3 bg-neutral-100 hover:bg-neutral-200 text-black text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors border border-neutral-200 shadow-2xs"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>📐 Auto-Fit to Logo Proportions</span>
                    </button>
                  )}
                  
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

            <div className="border border-neutral-200 rounded-lg overflow-hidden bg-neutral-100 p-4 flex items-center justify-center max-h-[72vh]">
              {testPreviewUrl ? (
                <img 
                  src={testPreviewUrl} 
                  alt="Test certificate render" 
                  className="max-h-[68vh] w-auto max-w-full shadow-2xl block rounded object-contain border border-neutral-300" 
                />
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
          setSaveModalOpen(false);
          setToastMessage(`✓ Template "${savedTemplate.name}" saved successfully!`);
          setTimeout(() => setToastMessage(null), 3000);
        }}
        onNavigateToTemplates={onNavigateToTemplates}
        onNavigateToWizard={onNavigateToWizard}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-black text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
};
