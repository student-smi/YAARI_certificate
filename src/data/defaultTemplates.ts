import { Template } from '../types';

export const DEFAULT_TEMPLATES: Template[] = [
  {
    id: 'tpl-corporate-excellence',
    name: 'Executive Corporate Excellence',
    description: 'Prestigious dark navy & metallic gold border suitable for corporate recognition and leadership honors.',
    category: 'corporate',
    orientation: 'landscape',
    width: 842,
    height: 595,
    backgroundStyle: {
      type: 'color',
      color: '#FFFFFF',
      borderStyle: 'gold_double',
      borderColor: '#B45309'
    },
    elements: [
      {
        id: 'el-org-name',
        type: 'text',
        x: 50,
        y: 14,
        width: 80,
        height: 6,
        zIndex: 1,
        content: 'GLOBAL LEADERSHIP INSTITUTE',
        fontSettings: {
          family: 'Plus Jakarta Sans',
          size: 14,
          weight: '700',
          color: '#64748B',
          align: 'center',
          letterSpacing: 4,
          lineHeight: 1.2,
          textTransform: 'uppercase'
        }
      },
      {
        id: 'el-title',
        type: 'text',
        x: 50,
        y: 22,
        width: 90,
        height: 10,
        zIndex: 1,
        content: 'CERTIFICATE OF EXCELLENCE',
        fontSettings: {
          family: 'Cinzel',
          size: 34,
          weight: '700',
          color: '#0F172A',
          align: 'center',
          letterSpacing: 3,
          lineHeight: 1.1
        }
      },
      {
        id: 'el-subtitle',
        type: 'text',
        x: 50,
        y: 32,
        width: 75,
        height: 5,
        zIndex: 1,
        content: 'This certificate is proudly awarded to',
        fontSettings: {
          family: 'Playfair Display',
          size: 16,
          weight: '400',
          color: '#64748B',
          align: 'center',
          letterSpacing: 1,
          lineHeight: 1.2,
          fontStyle: 'italic'
        }
      },
      {
        id: 'el-recipient-name',
        type: 'dynamic_field',
        fieldKey: 'name',
        x: 50,
        y: 42,
        width: 85,
        height: 12,
        zIndex: 2,
        content: '{{name}}',
        fontSettings: {
          family: 'Playfair Display',
          size: 38,
          weight: '700',
          color: '#1E1B4B',
          align: 'center',
          letterSpacing: 1,
          lineHeight: 1.2
        }
      },
      {
        id: 'el-line-sep',
        type: 'line',
        x: 50,
        y: 51,
        width: 50,
        height: 1,
        zIndex: 1,
        content: '',
        backgroundColor: '#D97706',
        borderWidth: 1
      },
      {
        id: 'el-body-text',
        type: 'text',
        x: 50,
        y: 58,
        width: 75,
        height: 10,
        zIndex: 1,
        content: 'for demonstrating exceptional leadership, outstanding business innovation, and dedication during the executive development program in {{course}}.',
        fontSettings: {
          family: 'Plus Jakarta Sans',
          size: 14,
          weight: '400',
          color: '#334155',
          align: 'center',
          letterSpacing: 0.5,
          lineHeight: 1.5
        }
      },
      {
        id: 'el-issue-date',
        type: 'dynamic_field',
        fieldKey: 'issue_date',
        x: 25,
        y: 75,
        width: 25,
        height: 5,
        zIndex: 1,
        content: 'Issued on: {{issue_date}}',
        fontSettings: {
          family: 'Plus Jakarta Sans',
          size: 11,
          weight: '600',
          color: '#334155',
          align: 'center',
          letterSpacing: 0.5,
          lineHeight: 1.2
        }
      },
      {
        id: 'el-completion-date',
        type: 'dynamic_field',
        fieldKey: 'completion_date',
        x: 25,
        y: 81,
        width: 30,
        height: 5,
        zIndex: 1,
        content: 'Course completed: {{completion_date}}',
        fontSettings: {
          family: 'Plus Jakarta Sans',
          size: 10,
          weight: '500',
          color: '#64748B',
          align: 'center',
          letterSpacing: 0.5,
          lineHeight: 1.2
        }
      },
      {
        id: 'el-sign-1',
        type: 'signature',
        x: 75,
        y: 75,
        width: 28,
        height: 8,
        zIndex: 1,
        content: 'Dr. Arthur Sterling',
        fontSettings: {
          family: 'Great Vibes',
          size: 30,
          weight: '400',
          color: '#0F172A',
          align: 'center',
          letterSpacing: 1,
          lineHeight: 1.2
        }
      },
      {
        id: 'el-sign-1-title',
        type: 'text',
        x: 75,
        y: 83,
        width: 25,
        height: 4,
        zIndex: 1,
        content: 'AUTHORIZED ISSUER & DIRECTOR',
        fontSettings: {
          family: 'Plus Jakarta Sans',
          size: 9,
          weight: '700',
          color: '#64748B',
          align: 'center',
          letterSpacing: 1.5,
          lineHeight: 1.2
        }
      },
      {
        id: 'el-qr',
        type: 'qr',
        x: 50,
        y: 78,
        width: 10,
        height: 10,
        zIndex: 2,
        content: 'https://certiforge.io/verify/{{certificate_id}}'
      },
      {
        id: 'el-cert-id',
        type: 'certificate_id',
        fieldKey: 'certificate_id',
        x: 50,
        y: 89,
        width: 40,
        height: 4,
        zIndex: 1,
        content: 'ID: {{certificate_id}}',
        fontSettings: {
          family: 'JetBrains Mono',
          size: 10,
          weight: '600',
          color: '#0F172A',
          align: 'center',
          letterSpacing: 1,
          lineHeight: 1.2
        }
      },
      {
        id: 'el-verify-url',
        type: 'dynamic_field',
        fieldKey: 'verification_url',
        x: 50,
        y: 93,
        width: 45,
        height: 3,
        zIndex: 1,
        content: 'Verify at: certiforge.io/verify/{{certificate_id}}',
        fontSettings: {
          family: 'JetBrains Mono',
          size: 8.5,
          weight: '400',
          color: '#64748B',
          align: 'center',
          letterSpacing: 0.5,
          lineHeight: 1.2
        }
      }
    ],
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-03-01T12:00:00Z'
  },
  {
    id: 'tpl-academic-diploma',
    name: 'Elite Academic Honor Diploma',
    description: 'Classic university parchment styling with serif headings and official institutional credential seal.',
    category: 'academic',
    orientation: 'landscape',
    width: 842,
    height: 595,
    backgroundStyle: {
      type: 'color',
      color: '#FCFBF7',
      borderStyle: 'classic',
      borderColor: '#1E293B'
    },
    elements: [
      {
        id: 'el-acad-seal',
        type: 'seal',
        x: 50,
        y: 12,
        width: 8,
        height: 8,
        zIndex: 2,
        content: 'VERIFIED CREDENTIAL'
      },
      {
        id: 'el-acad-org',
        type: 'text',
        x: 50,
        y: 19,
        width: 80,
        height: 5,
        zIndex: 1,
        content: 'DEPARTMENT OF HIGHER EDUCATION & RESEARCH',
        fontSettings: {
          family: 'Cinzel',
          size: 14,
          weight: '600',
          color: '#475569',
          align: 'center',
          letterSpacing: 3,
          lineHeight: 1.2
        }
      },
      {
        id: 'el-acad-title',
        type: 'text',
        x: 50,
        y: 27,
        width: 85,
        height: 8,
        zIndex: 1,
        content: 'Certificate of Achievement',
        fontSettings: {
          family: 'Playfair Display',
          size: 36,
          weight: '700',
          color: '#0F172A',
          align: 'center',
          letterSpacing: 1,
          lineHeight: 1.1
        }
      },
      {
        id: 'el-acad-certifies',
        type: 'text',
        x: 50,
        y: 36,
        width: 70,
        height: 5,
        zIndex: 1,
        content: 'This is to officially certify that',
        fontSettings: {
          family: 'Cormorant Garamond',
          size: 18,
          weight: '500',
          color: '#64748B',
          align: 'center',
          letterSpacing: 1,
          lineHeight: 1.2,
          fontStyle: 'italic'
        }
      },
      {
        id: 'el-acad-name',
        type: 'dynamic_field',
        fieldKey: 'name',
        x: 50,
        y: 45,
        width: 80,
        height: 10,
        zIndex: 2,
        content: '{{name}}',
        fontSettings: {
          family: 'Playfair Display',
          size: 36,
          weight: '700',
          color: '#0F172A',
          align: 'center',
          letterSpacing: 0.5,
          lineHeight: 1.2
        }
      },
      {
        id: 'el-acad-body',
        type: 'text',
        x: 50,
        y: 56,
        width: 75,
        height: 10,
        zIndex: 1,
        content: 'has successfully fulfilled all curriculum requirements, practical examinations, and project evaluations for the advanced credential in {{course}} with distinguished academic standing.',
        fontSettings: {
          family: 'Inter',
          size: 13,
          weight: '400',
          color: '#334155',
          align: 'center',
          letterSpacing: 0.2,
          lineHeight: 1.6
        }
      },
      {
        id: 'el-acad-date',
        type: 'dynamic_field',
        fieldKey: 'date',
        x: 22,
        y: 77,
        width: 25,
        height: 5,
        zIndex: 1,
        content: 'Conferred: {{date}}',
        fontSettings: {
          family: 'Inter',
          size: 11,
          weight: '500',
          color: '#475569',
          align: 'center',
          letterSpacing: 0.5,
          lineHeight: 1.2
        }
      },
      {
        id: 'el-acad-qr',
        type: 'qr',
        x: 50,
        y: 75,
        width: 9,
        height: 9,
        zIndex: 2,
        content: 'https://certiforge.io/verify/{{certificate_id}}'
      },
      {
        id: 'el-acad-sign',
        type: 'signature',
        x: 78,
        y: 74,
        width: 25,
        height: 7,
        zIndex: 1,
        content: 'Prof. Eleanor Vance',
        fontSettings: {
          family: 'Alex Brush',
          size: 32,
          weight: '400',
          color: '#0F172A',
          align: 'center',
          letterSpacing: 1,
          lineHeight: 1.2
        }
      },
      {
        id: 'el-acad-sign-role',
        type: 'text',
        x: 78,
        y: 82,
        width: 25,
        height: 4,
        zIndex: 1,
        content: 'CHANCELLOR OF THE UNIVERSITY',
        fontSettings: {
          family: 'Cinzel',
          size: 9,
          weight: '600',
          color: '#64748B',
          align: 'center',
          letterSpacing: 2,
          lineHeight: 1.2
        }
      },
      {
        id: 'el-acad-id',
        type: 'certificate_id',
        fieldKey: 'certificate_id',
        x: 50,
        y: 88,
        width: 40,
        height: 4,
        zIndex: 1,
        content: 'Credential ID: {{certificate_id}}',
        fontSettings: {
          family: 'JetBrains Mono',
          size: 10,
          weight: '500',
          color: '#94A3B8',
          align: 'center',
          letterSpacing: 1,
          lineHeight: 1.2
        }
      }
    ],
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-03-05T12:00:00Z'
  },
  {
    id: 'tpl-tech-bootcamp',
    name: 'Modern Tech Bootcamp & Workshop',
    description: 'Sleek dark or emerald modern design with clean typography and fast QR validation for coding bootcamps & hackathons.',
    category: 'workshop',
    orientation: 'landscape',
    width: 842,
    height: 595,
    backgroundStyle: {
      type: 'color',
      color: '#FFFFFF',
      borderStyle: 'modern',
      borderColor: '#4F46E5'
    },
    elements: [
      {
        id: 'el-tech-badge',
        type: 'text',
        x: 50,
        y: 12,
        width: 30,
        height: 5,
        zIndex: 1,
        content: 'DEVSTUDIO ACADEMY // 2026',
        fontSettings: {
          family: 'JetBrains Mono',
          size: 11,
          weight: '600',
          color: '#4F46E5',
          align: 'center',
          letterSpacing: 2,
          lineHeight: 1.2
        }
      },
      {
        id: 'el-tech-title',
        type: 'text',
        x: 50,
        y: 20,
        width: 85,
        height: 8,
        zIndex: 1,
        content: 'CERTIFICATE OF COMPLETION',
        fontSettings: {
          family: 'Plus Jakarta Sans',
          size: 32,
          weight: '800',
          color: '#0F172A',
          align: 'center',
          letterSpacing: 2,
          lineHeight: 1.1
        }
      },
      {
        id: 'el-tech-pres',
        type: 'text',
        x: 50,
        y: 30,
        width: 70,
        height: 4,
        zIndex: 1,
        content: 'PROUDLY PRESENTED TO',
        fontSettings: {
          family: 'Plus Jakarta Sans',
          size: 12,
          weight: '600',
          color: '#94A3B8',
          align: 'center',
          letterSpacing: 3,
          lineHeight: 1.2
        }
      },
      {
        id: 'el-tech-name',
        type: 'dynamic_field',
        fieldKey: 'name',
        x: 50,
        y: 41,
        width: 85,
        height: 12,
        zIndex: 2,
        content: '{{name}}',
        fontSettings: {
          family: 'Plus Jakarta Sans',
          size: 38,
          weight: '800',
          color: '#4F46E5',
          align: 'center',
          letterSpacing: 0.5,
          lineHeight: 1.2
        }
      },
      {
        id: 'el-tech-desc',
        type: 'text',
        x: 50,
        y: 54,
        width: 72,
        height: 10,
        zIndex: 1,
        content: 'for intensive project-based mastery and successfully deploying industry-grade software solutions in {{course}}.',
        fontSettings: {
          family: 'Inter',
          size: 14,
          weight: '400',
          color: '#475569',
          align: 'center',
          letterSpacing: 0.2,
          lineHeight: 1.6
        }
      },
      {
        id: 'el-tech-qr',
        type: 'qr',
        x: 20,
        y: 75,
        width: 10,
        height: 10,
        zIndex: 2,
        content: 'https://certiforge.io/verify/{{certificate_id}}'
      },
      {
        id: 'el-tech-date',
        type: 'dynamic_field',
        fieldKey: 'date',
        x: 50,
        y: 77,
        width: 25,
        height: 5,
        zIndex: 1,
        content: 'Issued: {{date}}',
        fontSettings: {
          family: 'JetBrains Mono',
          size: 11,
          weight: '500',
          color: '#64748B',
          align: 'center',
          letterSpacing: 1,
          lineHeight: 1.2
        }
      },
      {
        id: 'el-tech-sign',
        type: 'signature',
        x: 80,
        y: 73,
        width: 25,
        height: 8,
        zIndex: 1,
        content: 'Marcus Sterling',
        fontSettings: {
          family: 'Great Vibes',
          size: 28,
          weight: '400',
          color: '#0F172A',
          align: 'center',
          letterSpacing: 1,
          lineHeight: 1.2
        }
      },
      {
        id: 'el-tech-lead',
        type: 'text',
        x: 80,
        y: 81,
        width: 25,
        height: 4,
        zIndex: 1,
        content: 'LEAD INSTRUCTOR & ARCHITECT',
        fontSettings: {
          family: 'Plus Jakarta Sans',
          size: 9,
          weight: '700',
          color: '#94A3B8',
          align: 'center',
          letterSpacing: 1.5,
          lineHeight: 1.2
        }
      },
      {
        id: 'el-tech-id',
        type: 'certificate_id',
        fieldKey: 'certificate_id',
        x: 50,
        y: 87,
        width: 40,
        height: 4,
        zIndex: 1,
        content: 'VERIFIED ID: {{certificate_id}}',
        fontSettings: {
          family: 'JetBrains Mono',
          size: 10,
          weight: '600',
          color: '#6366F1',
          align: 'center',
          letterSpacing: 1,
          lineHeight: 1.2
        }
      }
    ],
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-03-01T12:00:00Z'
  },
  {
    id: 'tpl-appreciation-honors',
    name: 'Certificate of Appreciation',
    description: 'Warm gold & slate design dedicated to volunteer contribution, keynote speakers, and conference panelists.',
    category: 'appreciation',
    orientation: 'landscape',
    width: 842,
    height: 595,
    backgroundStyle: {
      type: 'color',
      color: '#FFFFFF',
      borderStyle: 'gold_double',
      borderColor: '#D97706'
    },
    elements: [
      {
        id: 'el-appr-org',
        type: 'text',
        x: 50,
        y: 15,
        width: 80,
        height: 5,
        zIndex: 1,
        content: 'NATIONAL EDUCATION FORUM',
        fontSettings: {
          family: 'Plus Jakarta Sans',
          size: 13,
          weight: '700',
          color: '#92400E',
          align: 'center',
          letterSpacing: 3,
          lineHeight: 1.2
        }
      },
      {
        id: 'el-appr-title',
        type: 'text',
        x: 50,
        y: 24,
        width: 85,
        height: 8,
        zIndex: 1,
        content: 'Certificate of Appreciation',
        fontSettings: {
          family: 'Playfair Display',
          size: 34,
          weight: '700',
          color: '#1E293B',
          align: 'center',
          letterSpacing: 1.5,
          lineHeight: 1.1
        }
      },
      {
        id: 'el-appr-pres',
        type: 'text',
        x: 50,
        y: 33,
        width: 70,
        height: 4,
        zIndex: 1,
        content: 'Gratefully presented with sincere gratitude to',
        fontSettings: {
          family: 'Playfair Display',
          size: 15,
          weight: '400',
          color: '#64748B',
          align: 'center',
          letterSpacing: 0.5,
          lineHeight: 1.2,
          fontStyle: 'italic'
        }
      },
      {
        id: 'el-appr-name',
        type: 'dynamic_field',
        fieldKey: 'name',
        x: 50,
        y: 43,
        width: 85,
        height: 10,
        zIndex: 2,
        content: '{{name}}',
        fontSettings: {
          family: 'Playfair Display',
          size: 36,
          weight: '700',
          color: '#B45309',
          align: 'center',
          letterSpacing: 0.5,
          lineHeight: 1.2
        }
      },
      {
        id: 'el-appr-desc',
        type: 'text',
        x: 50,
        y: 54,
        width: 75,
        height: 10,
        zIndex: 1,
        content: 'for generous contributions, exemplary leadership, and impactful dedication during {{course}}.',
        fontSettings: {
          family: 'Inter',
          size: 14,
          weight: '400',
          color: '#334155',
          align: 'center',
          letterSpacing: 0.2,
          lineHeight: 1.6
        }
      },
      {
        id: 'el-appr-date',
        type: 'dynamic_field',
        fieldKey: 'date',
        x: 25,
        y: 76,
        width: 25,
        height: 5,
        zIndex: 1,
        content: 'Awarded on: {{date}}',
        fontSettings: {
          family: 'Inter',
          size: 11,
          weight: '500',
          color: '#64748B',
          align: 'center',
          letterSpacing: 0.5,
          lineHeight: 1.2
        }
      },
      {
        id: 'el-appr-qr',
        type: 'qr',
        x: 50,
        y: 74,
        width: 9,
        height: 9,
        zIndex: 2,
        content: 'https://certiforge.io/verify/{{certificate_id}}'
      },
      {
        id: 'el-appr-sign',
        type: 'signature',
        x: 75,
        y: 72,
        width: 25,
        height: 8,
        zIndex: 1,
        content: 'Sarah Jenkins',
        fontSettings: {
          family: 'Alex Brush',
          size: 32,
          weight: '400',
          color: '#0F172A',
          align: 'center',
          letterSpacing: 1,
          lineHeight: 1.2
        }
      },
      {
        id: 'el-appr-role',
        type: 'text',
        x: 75,
        y: 80,
        width: 25,
        height: 4,
        zIndex: 1,
        content: 'PROGRAM CHAIRPERSON',
        fontSettings: {
          family: 'Plus Jakarta Sans',
          size: 9,
          weight: '700',
          color: '#94A3B8',
          align: 'center',
          letterSpacing: 2,
          lineHeight: 1.2
        }
      },
      {
        id: 'el-appr-id',
        type: 'certificate_id',
        fieldKey: 'certificate_id',
        x: 50,
        y: 87,
        width: 40,
        height: 4,
        zIndex: 1,
        content: 'CERTIFICATE REF: {{certificate_id}}',
        fontSettings: {
          family: 'JetBrains Mono',
          size: 10,
          weight: '500',
          color: '#94A3B8',
          align: 'center',
          letterSpacing: 1,
          lineHeight: 1.2
        }
      }
    ],
    createdAt: '2026-02-10T10:00:00Z',
    updatedAt: '2026-03-01T12:00:00Z'
  },
  {
    id: 'tpl-portrait-academic',
    name: 'Prestige Academic Honors (Portrait)',
    description: 'Tall vertical university diploma with classic Latinate serifs, double gold borders, and verified institutional seal.',
    category: 'academic',
    orientation: 'portrait',
    width: 595,
    height: 842,
    backgroundStyle: {
      type: 'color',
      color: '#FCFBF7',
      borderStyle: 'classic',
      borderColor: '#B45309'
    },
    elements: [
      {
        id: 'el-p-acad-org',
        type: 'text',
        x: 50,
        y: 11,
        width: 80,
        height: 5,
        zIndex: 1,
        content: 'GLOBAL LEADERSHIP INSTITUTE',
        fontSettings: {
          family: 'Cinzel',
          size: 14,
          weight: '700',
          color: '#B45309',
          align: 'center',
          letterSpacing: 3,
          lineHeight: 1.2
        }
      },
      {
        id: 'el-p-acad-title',
        type: 'text',
        x: 50,
        y: 20,
        width: 85,
        height: 7,
        zIndex: 1,
        content: 'DIPLOMA OF EXCELLENCE',
        fontSettings: {
          family: 'Cinzel',
          size: 24,
          weight: '700',
          color: '#1E293B',
          align: 'center',
          letterSpacing: 2,
          lineHeight: 1.1
        }
      },
      {
        id: 'el-p-acad-pres',
        type: 'text',
        x: 50,
        y: 30,
        width: 80,
        height: 4,
        zIndex: 1,
        content: 'THIS CREDENTIAL IS PROUDLY CONFERRED UPON',
        fontSettings: {
          family: 'Plus Jakarta Sans',
          size: 9,
          weight: '600',
          color: '#64748B',
          align: 'center',
          letterSpacing: 2,
          lineHeight: 1.2
        }
      },
      {
        id: 'el-p-acad-name',
        type: 'dynamic_field',
        fieldKey: 'name',
        x: 50,
        y: 39,
        width: 85,
        height: 9,
        zIndex: 1,
        content: '{{name}}',
        fontSettings: {
          family: 'Playfair Display',
          size: 32,
          weight: '700',
          color: '#0F172A',
          align: 'center',
          letterSpacing: 0.5,
          lineHeight: 1.1
        }
      },
      {
        id: 'el-p-acad-desc',
        type: 'text',
        x: 50,
        y: 49,
        width: 80,
        height: 7,
        zIndex: 1,
        content: 'For successfully completing all rigorous examination modules with distinguished academic honors in',
        fontSettings: {
          family: 'Plus Jakarta Sans',
          size: 11,
          weight: '400',
          color: '#475569',
          align: 'center',
          letterSpacing: 0.5,
          lineHeight: 1.4
        }
      },
      {
        id: 'el-p-acad-course',
        type: 'dynamic_field',
        fieldKey: 'course',
        x: 50,
        y: 58,
        width: 85,
        height: 7,
        zIndex: 1,
        content: '{{course}}',
        fontSettings: {
          family: 'Cinzel',
          size: 18,
          weight: '700',
          color: '#B45309',
          align: 'center',
          letterSpacing: 1.5,
          lineHeight: 1.2
        }
      },
      {
        id: 'el-p-acad-date',
        type: 'dynamic_field',
        fieldKey: 'issue_date',
        x: 50,
        y: 67,
        width: 80,
        height: 4,
        zIndex: 1,
        content: 'Conferred on {{issue_date}}',
        fontSettings: {
          family: 'Plus Jakarta Sans',
          size: 10,
          weight: '600',
          color: '#64748B',
          align: 'center',
          letterSpacing: 1,
          lineHeight: 1.2
        }
      },
      {
        id: 'el-p-acad-sig1',
        type: 'signature',
        x: 28,
        y: 77,
        width: 28,
        height: 7,
        zIndex: 1,
        content: 'Dean of Faculty',
        fontSettings: {
          family: 'Great Vibes',
          size: 24,
          weight: '400',
          color: '#0F172A',
          align: 'center',
          letterSpacing: 1,
          lineHeight: 1.2
        }
      },
      {
        id: 'el-p-acad-sig2',
        type: 'signature',
        x: 72,
        y: 77,
        width: 28,
        height: 7,
        zIndex: 1,
        content: 'Chancellor',
        fontSettings: {
          family: 'Great Vibes',
          size: 24,
          weight: '400',
          color: '#0F172A',
          align: 'center',
          letterSpacing: 1,
          lineHeight: 1.2
        }
      },
      {
        id: 'el-p-acad-qr',
        type: 'qr',
        fieldKey: 'qr',
        x: 50,
        y: 86,
        width: 14,
        height: 10,
        zIndex: 1,
        content: '{{verification_url}}'
      },
      {
        id: 'el-p-acad-id',
        type: 'certificate_id',
        fieldKey: 'certificate_id',
        x: 50,
        y: 94,
        width: 60,
        height: 4,
        zIndex: 1,
        content: 'OFFICIAL ID: {{certificate_id}}',
        fontSettings: {
          family: 'JetBrains Mono',
          size: 9,
          weight: '500',
          color: '#64748B',
          align: 'center',
          letterSpacing: 1,
          lineHeight: 1.2
        }
      }
    ],
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-10T12:00:00Z'
  },
  {
    id: 'tpl-portrait-corporate',
    name: 'Executive Leadership Award (Portrait)',
    description: 'Prestigious vertical layout with deep navy & gold accents for corporate recognition and leadership milestones.',
    category: 'corporate',
    orientation: 'portrait',
    width: 595,
    height: 842,
    backgroundStyle: {
      type: 'color',
      color: '#FFFFFF',
      borderStyle: 'gold_double',
      borderColor: '#0F172A'
    },
    elements: [
      {
        id: 'el-p-corp-org',
        type: 'text',
        x: 50,
        y: 11,
        width: 80,
        height: 5,
        zIndex: 1,
        content: 'ENTERPRISE LEADERSHIP COUNCIL',
        fontSettings: {
          family: 'Plus Jakarta Sans',
          size: 13,
          weight: '800',
          color: '#0F172A',
          align: 'center',
          letterSpacing: 2.5,
          lineHeight: 1.2
        }
      },
      {
        id: 'el-p-corp-title',
        type: 'text',
        x: 50,
        y: 20,
        width: 85,
        height: 7,
        zIndex: 1,
        content: 'EXECUTIVE LEADERSHIP HONORS',
        fontSettings: {
          family: 'Plus Jakarta Sans',
          size: 22,
          weight: '800',
          color: '#0F172A',
          align: 'center',
          letterSpacing: 1.5,
          lineHeight: 1.1
        }
      },
      {
        id: 'el-p-corp-pres',
        type: 'text',
        x: 50,
        y: 30,
        width: 80,
        height: 4,
        zIndex: 1,
        content: 'PRESENTED WITH HIGHEST DISTINCTION TO',
        fontSettings: {
          family: 'Plus Jakarta Sans',
          size: 9,
          weight: '600',
          color: '#64748B',
          align: 'center',
          letterSpacing: 2,
          lineHeight: 1.2
        }
      },
      {
        id: 'el-p-corp-name',
        type: 'dynamic_field',
        fieldKey: 'name',
        x: 50,
        y: 39,
        width: 85,
        height: 9,
        zIndex: 1,
        content: '{{name}}',
        fontSettings: {
          family: 'Playfair Display',
          size: 30,
          weight: '700',
          color: '#0F172A',
          align: 'center',
          letterSpacing: 0.5,
          lineHeight: 1.1
        }
      },
      {
        id: 'el-p-corp-desc',
        type: 'text',
        x: 50,
        y: 50,
        width: 80,
        height: 7,
        zIndex: 1,
        content: 'In recognition of outstanding vision, transformative leadership, and exceptional contributions to',
        fontSettings: {
          family: 'Plus Jakarta Sans',
          size: 11,
          weight: '400',
          color: '#475569',
          align: 'center',
          letterSpacing: 0.5,
          lineHeight: 1.4
        }
      },
      {
        id: 'el-p-corp-course',
        type: 'dynamic_field',
        fieldKey: 'course',
        x: 50,
        y: 59,
        width: 85,
        height: 7,
        zIndex: 1,
        content: '{{course}}',
        fontSettings: {
          family: 'Plus Jakarta Sans',
          size: 17,
          weight: '700',
          color: '#D97706',
          align: 'center',
          letterSpacing: 1,
          lineHeight: 1.2
        }
      },
      {
        id: 'el-p-corp-sig',
        type: 'signature',
        x: 50,
        y: 73,
        width: 35,
        height: 7,
        zIndex: 1,
        content: 'Managing Director',
        fontSettings: {
          family: 'Great Vibes',
          size: 26,
          weight: '400',
          color: '#0F172A',
          align: 'center',
          letterSpacing: 1,
          lineHeight: 1.2
        }
      },
      {
        id: 'el-p-corp-qr',
        type: 'qr',
        fieldKey: 'qr',
        x: 50,
        y: 84,
        width: 14,
        height: 10,
        zIndex: 1,
        content: '{{verification_url}}'
      },
      {
        id: 'el-p-corp-id',
        type: 'certificate_id',
        fieldKey: 'certificate_id',
        x: 50,
        y: 93,
        width: 60,
        height: 4,
        zIndex: 1,
        content: 'CREDENTIAL ID: {{certificate_id}}',
        fontSettings: {
          family: 'JetBrains Mono',
          size: 9,
          weight: '500',
          color: '#64748B',
          align: 'center',
          letterSpacing: 1,
          lineHeight: 1.2
        }
      }
    ],
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-10T12:00:00Z'
  },
  {
    id: 'tpl-portrait-tech',
    name: 'Modern Tech Graduate Diploma (Portrait)',
    description: 'Sleek minimalist vertical diploma with high-contrast tech typography, fast QR validation, and emerald accents.',
    category: 'workshop',
    orientation: 'portrait',
    width: 595,
    height: 842,
    backgroundStyle: {
      type: 'color',
      color: '#FFFFFF',
      borderStyle: 'modern',
      borderColor: '#4F46E5'
    },
    elements: [
      {
        id: 'el-p-tech-org',
        type: 'text',
        x: 50,
        y: 11,
        width: 80,
        height: 5,
        zIndex: 1,
        content: 'ACADEMY OF DIGITAL EXCELLENCE',
        fontSettings: {
          family: 'Plus Jakarta Sans',
          size: 13,
          weight: '800',
          color: '#4F46E5',
          align: 'center',
          letterSpacing: 2.5,
          lineHeight: 1.2
        }
      },
      {
        id: 'el-p-tech-title',
        type: 'text',
        x: 50,
        y: 20,
        width: 85,
        height: 7,
        zIndex: 1,
        content: 'PROFESSIONAL CERTIFICATION',
        fontSettings: {
          family: 'Plus Jakarta Sans',
          size: 22,
          weight: '800',
          color: '#0F172A',
          align: 'center',
          letterSpacing: 1.5,
          lineHeight: 1.1
        }
      },
      {
        id: 'el-p-tech-name',
        type: 'dynamic_field',
        fieldKey: 'name',
        x: 50,
        y: 38,
        width: 85,
        height: 9,
        zIndex: 1,
        content: '{{name}}',
        fontSettings: {
          family: 'Plus Jakarta Sans',
          size: 28,
          weight: '800',
          color: '#0F172A',
          align: 'center',
          letterSpacing: 0.5,
          lineHeight: 1.1
        }
      },
      {
        id: 'el-p-tech-desc',
        type: 'text',
        x: 50,
        y: 49,
        width: 80,
        height: 7,
        zIndex: 1,
        content: 'Has demonstrated full competency and practical mastery in the capstone curriculum for',
        fontSettings: {
          family: 'Plus Jakarta Sans',
          size: 11,
          weight: '500',
          color: '#64748B',
          align: 'center',
          letterSpacing: 0.5,
          lineHeight: 1.4
        }
      },
      {
        id: 'el-p-tech-course',
        type: 'dynamic_field',
        fieldKey: 'course',
        x: 50,
        y: 58,
        width: 85,
        height: 7,
        zIndex: 1,
        content: '{{course}}',
        fontSettings: {
          family: 'Plus Jakarta Sans',
          size: 17,
          weight: '800',
          color: '#4F46E5',
          align: 'center',
          letterSpacing: 1,
          lineHeight: 1.2
        }
      },
      {
        id: 'el-p-tech-sig',
        type: 'signature',
        x: 50,
        y: 72,
        width: 35,
        height: 7,
        zIndex: 1,
        content: 'Lead Instructor',
        fontSettings: {
          family: 'Great Vibes',
          size: 26,
          weight: '400',
          color: '#0F172A',
          align: 'center',
          letterSpacing: 1,
          lineHeight: 1.2
        }
      },
      {
        id: 'el-p-tech-qr',
        type: 'qr',
        fieldKey: 'qr',
        x: 50,
        y: 83,
        width: 14,
        height: 10,
        zIndex: 1,
        content: '{{verification_url}}'
      },
      {
        id: 'el-p-tech-id',
        type: 'certificate_id',
        fieldKey: 'certificate_id',
        x: 50,
        y: 93,
        width: 60,
        height: 4,
        zIndex: 1,
        content: 'CERT HASH: {{certificate_id}}',
        fontSettings: {
          family: 'JetBrains Mono',
          size: 9,
          weight: '600',
          color: '#64748B',
          align: 'center',
          letterSpacing: 1,
          lineHeight: 1.2
        }
      }
    ],
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-10T12:00:00Z'
  },
  {
    id: 'tpl-portrait-appreciation',
    name: 'Certificate of Appreciation (Portrait)',
    description: 'Warm gold & slate vertical tribute certificate for volunteers, speakers, and exceptional service contributions.',
    category: 'appreciation',
    orientation: 'portrait',
    width: 595,
    height: 842,
    backgroundStyle: {
      type: 'color',
      color: '#FFFFFF',
      borderStyle: 'gold_double',
      borderColor: '#D97706'
    },
    elements: [
      {
        id: 'el-p-appr-org',
        type: 'text',
        x: 50,
        y: 11,
        width: 80,
        height: 5,
        zIndex: 1,
        content: 'NATIONAL FOUNDATION OF DISTINCTION',
        fontSettings: {
          family: 'Cinzel',
          size: 13,
          weight: '700',
          color: '#D97706',
          align: 'center',
          letterSpacing: 2.5,
          lineHeight: 1.2
        }
      },
      {
        id: 'el-p-appr-title',
        type: 'text',
        x: 50,
        y: 20,
        width: 85,
        height: 7,
        zIndex: 1,
        content: 'CERTIFICATE OF APPRECIATION',
        fontSettings: {
          family: 'Cinzel',
          size: 22,
          weight: '700',
          color: '#1E293B',
          align: 'center',
          letterSpacing: 1.5,
          lineHeight: 1.1
        }
      },
      {
        id: 'el-p-appr-name',
        type: 'dynamic_field',
        fieldKey: 'name',
        x: 50,
        y: 39,
        width: 85,
        height: 9,
        zIndex: 1,
        content: '{{name}}',
        fontSettings: {
          family: 'Playfair Display',
          size: 30,
          weight: '700',
          color: '#0F172A',
          align: 'center',
          letterSpacing: 0.5,
          lineHeight: 1.1
        }
      },
      {
        id: 'el-p-appr-desc',
        type: 'text',
        x: 50,
        y: 50,
        width: 80,
        height: 7,
        zIndex: 1,
        content: 'In grateful appreciation for invaluable service, inspiring commitment, and outstanding dedication to',
        fontSettings: {
          family: 'Plus Jakarta Sans',
          size: 11,
          weight: '400',
          color: '#475569',
          align: 'center',
          letterSpacing: 0.5,
          lineHeight: 1.4
        }
      },
      {
        id: 'el-p-appr-course',
        type: 'dynamic_field',
        fieldKey: 'course',
        x: 50,
        y: 59,
        width: 85,
        height: 7,
        zIndex: 1,
        content: '{{course}}',
        fontSettings: {
          family: 'Cinzel',
          size: 17,
          weight: '700',
          color: '#D97706',
          align: 'center',
          letterSpacing: 1,
          lineHeight: 1.2
        }
      },
      {
        id: 'el-p-appr-sig',
        type: 'signature',
        x: 50,
        y: 73,
        width: 35,
        height: 7,
        zIndex: 1,
        content: 'Executive Director',
        fontSettings: {
          family: 'Great Vibes',
          size: 26,
          weight: '400',
          color: '#0F172A',
          align: 'center',
          letterSpacing: 1,
          lineHeight: 1.2
        }
      },
      {
        id: 'el-p-appr-qr',
        type: 'qr',
        fieldKey: 'qr',
        x: 50,
        y: 84,
        width: 14,
        height: 10,
        zIndex: 1,
        content: '{{verification_url}}'
      },
      {
        id: 'el-p-appr-id',
        type: 'certificate_id',
        fieldKey: 'certificate_id',
        x: 50,
        y: 93,
        width: 60,
        height: 4,
        zIndex: 1,
        content: 'RECOGNITION REF: {{certificate_id}}',
        fontSettings: {
          family: 'JetBrains Mono',
          size: 9,
          weight: '500',
          color: '#64748B',
          align: 'center',
          letterSpacing: 1,
          lineHeight: 1.2
        }
      }
    ],
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-10T12:00:00Z'
  }
];

export const PRICING_PLANS = [
  {
    id: 'free',
    name: 'Free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    yearlyTotal: 0,
    currency: '₹',
    tagline: 'Ideal for small workshops and testing the platform.',
    isPopular: false,
    buttonText: 'Start free',
    limits: {
      maxCertificatesPerMonth: 25,
      maxProjects: 3,
      maxTemplates: 3,
      storageGB: 1,
      maxEmailCredits: 0,
      hasApiAccess: false,
      hasWhiteLabel: false,
      teamSeats: 1
    },
    features: [
      '25 certificates / month',
      'Ready-to-use certificate templates',
      'Excel & CSV recipient import',
      'Print-ready PDF & ZIP downloads',
      'Public verification pages (CertiCraft branding)'
    ]
  },
  {
    id: 'starter',
    name: 'Professional',
    monthlyPrice: 799,
    yearlyPrice: 649,
    yearlyTotal: 7788,
    currency: '₹',
    tagline: 'For educators, trainers, and growing institutes.',
    isPopular: false,
    buttonText: 'Choose Professional',
    limits: {
      maxCertificatesPerMonth: 500,
      maxProjects: 15,
      maxTemplates: 10,
      storageGB: 5,
      maxEmailCredits: 500,
      hasApiAccess: false,
      hasWhiteLabel: true,
      teamSeats: 1
    },
    features: [
      'Everything in Free, plus:',
      '500 certificates / month',
      '500 automated email sends / month',
      'Removal of CertiCraft branding',
      'Custom certificate ID prefixes',
      'Print-ready PDF vector export'
    ]
  },
  {
    id: 'pro',
    name: 'Institute',
    monthlyPrice: 1999,
    yearlyPrice: 1599,
    yearlyTotal: 19188,
    currency: '₹',
    tagline: 'Best for universities, bootcamps, and mid-sized enterprises.',
    isPopular: true,
    badgeText: 'Recommended',
    buttonText: 'Choose Institute',
    limits: {
      maxCertificatesPerMonth: 3000,
      maxProjects: 50,
      maxTemplates: 30,
      storageGB: 20,
      maxEmailCredits: 3000,
      hasApiAccess: false,
      hasWhiteLabel: true,
      teamSeats: 5
    },
    features: [
      'Everything in Professional, plus:',
      '3,000 certificates / month',
      '3,000 automated email sends / month',
      '5 team collaboration members',
      'Verification page with your institute branding',
      'Priority support (stated business hours)'
    ]
  },
  {
    id: 'business',
    name: 'Enterprise',
    monthlyPrice: 0,
    yearlyPrice: 0,
    yearlyTotal: 0,
    isCustomQuote: true,
    currency: '₹',
    tagline: 'For high-scale examination boards and large organizations.',
    isPopular: false,
    buttonText: 'Contact sales',
    limits: {
      maxCertificatesPerMonth: 10000,
      maxProjects: 9999,
      maxTemplates: 9999,
      storageGB: 100,
      maxEmailCredits: 10000,
      hasApiAccess: true,
      hasWhiteLabel: true,
      teamSeats: 25
    },
    features: [
      'Everything in Institute, plus:',
      'Volume agreed in writing',
      'Custom domain (e.g. certs.yourbrand.edu)',
      'REST API & Webhooks access',
      'Tailored onboarding & staff training',
      'Support terms & SLA agreed in contract'
    ]
  }
];

export const WORKSHOP_EVENT_PACK = {
  name: 'Workshop & Event Pack',
  price: 499,
  currency: '₹',
  certificates: 100,
  emailSends: 100,
  tagline: 'Prepaid single batch for workshops, conferences, and events. No recurring subscription.',
  features: [
    '100 certificates credit (valid for 1 year)',
    '100 automated email sends included',
    'Removal of CertiCraft branding',
    'Print-ready vector PDF & bulk ZIP export',
    'Dedicated verification page retention'
  ]
};

