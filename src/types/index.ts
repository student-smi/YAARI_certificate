export type CertificateStatus = 'draft' | 'data_uploaded' | 'ready' | 'processing' | 'completed' | 'failed';

export type TemplateCategory = 
  | 'academic' 
  | 'corporate' 
  | 'workshop' 
  | 'course' 
  | 'event' 
  | 'achievement' 
  | 'appreciation' 
  | 'participation'
  | 'custom';

export type ElementType = 
  | 'text' 
  | 'dynamic_field' 
  | 'image' 
  | 'logo' 
  | 'signature' 
  | 'shape' 
  | 'line' 
  | 'qr' 
  | 'certificate_id' 
  | 'seal';

export interface FontSettings {
  family: string;
  size: number;
  weight: '300' | '400' | '500' | '600' | '700' | '800';
  color: string;
  align: 'left' | 'center' | 'right';
  letterSpacing: number; // in px
  lineHeight: number; // ratio e.g. 1.2
  fontStyle?: 'normal' | 'italic';
  textTransform?: 'none' | 'uppercase' | 'capitalize';
}

export interface TemplateElement {
  id: string;
  type: ElementType;
  x: number; // in percentage of width (0-100) or px
  y: number; // in percentage of height (0-100) or px
  width: number;
  height: number;
  rotation?: number; // degrees
  zIndex: number;
  isLocked?: boolean;
  content: string; // text content or image URL
  fieldKey?: string; // e.g. 'name', 'course', 'date', 'certificate_id', 'organization'
  fontSettings?: FontSettings;
  opacity?: number;
  borderRadius?: number;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  shapeType?: 'rectangle' | 'circle' | 'badge' | 'line';
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  orientation: 'landscape' | 'portrait';
  width: number; // standard A4 landscape 842 x 595 (or scaled standard 800 x 565)
  height: number;
  backgroundStyle: {
    type: 'color' | 'gradient' | 'image' | 'pattern';
    color: string;
    gradient?: string;
    imageUrl?: string;
    borderStyle?: 'classic' | 'modern' | 'gold_double' | 'minimal' | 'vintage_ornate' | 'none';
    borderColor?: string;
    imageFit?: 'cover' | 'contain' | 'stretch';
    imageOpacity?: number;
    patternType?: 'none' | 'guilloche' | 'dots' | 'geometric';
  };
  elements: TemplateElement[];
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
  isCustom?: boolean;
  userId?: string;
}

export interface Recipient {
  id: string;
  data: Record<string, string>; // e.g. { name: "Ananya Sharma", course: "Full Stack Mastery", email: "ananya@example.com", ... }
  certificateId: string;
  status: 'valid' | 'invalid' | 'generated' | 'sent';
  validationError?: string;
  generatedPdfBlob?: Blob;
  pdfUrl?: string;
}

export interface Project {
  id: string;
  userId?: string;
  name: string;
  description?: string;
  category: string;
  status: CertificateStatus;
  templateId: string;
  recipientsCount: number;
  generatedCount: number;
  emailedCount: number;
  verifiedCount: number;
  createdAt: string;
  updatedAt: string;
  fieldMapping: Record<string, string>; // certificate field -> excel column
  recipients: Recipient[];
  prefix: string; // e.g. "CERT-2026-"
  organizationName: string;
}

export interface GenerationJob {
  id: string;
  projectId: string;
  total: number;
  processed: number;
  status: 'idle' | 'in_progress' | 'completed' | 'failed';
  startedAt?: string;
  completedAt?: string;
  zipBlobUrl?: string;
  combinedPdfUrl?: string;
  logs: string[];
}

export interface EmailLog {
  id: string;
  recipientEmail: string;
  recipientName: string;
  certificateId: string;
  status: 'queued' | 'sent' | 'delivered' | 'bounced';
  sentAt: string;
}

export interface PlanLimit {
  maxCertificatesPerMonth: number;
  maxProjects: number;
  maxTemplates: number;
  storageGB: number;
  maxEmailCredits: number;
  hasApiAccess: boolean;
  hasWhiteLabel: boolean;
  teamSeats: number;
}

export interface PricingPlan {
  id: 'free' | 'starter' | 'pro' | 'business';
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  yearlyTotal?: number;
  isCustomQuote?: boolean;
  currency: string;
  tagline: string;
  isPopular?: boolean;
  badgeText?: string;
  buttonText?: string;
  limits: PlanLimit;
  features: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  organizationName: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  avatar?: string;
  plan: 'free' | 'starter' | 'pro' | 'business';
  isYearlyBilling?: boolean;
  usage: {
    certificatesGenerated: number;
    certificatesLimit: number;
    storageUsedMB: number;
    storageLimitMB: number;
    emailCreditsUsed: number;
    emailCreditsLimit: number;
  };
  branding: {
    logoUrl?: string;
    primaryColor: string;
    issuerName: string;
    customDomain?: string;
    whiteLabelVerification: boolean;
  };
}

export interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: string;
  lastUsedAt?: string;
}
