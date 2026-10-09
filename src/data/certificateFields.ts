import { Type, Sparkles, Award, QrCode, Building2, Calendar, FileText, CheckCircle2, UserCheck, ShieldCheck, Clock, MapPin, Hash, GraduationCap, Layers, Globe, FileBadge } from 'lucide-react';

export interface FieldDefinition {
  key: string;
  label: string;
  category: 'core' | 'optional_student_course' | 'signatory';
  requirement: 'Required' | 'Optional; strongly recommended' | 'Recommended' | 'Optional';
  purpose: string;
  example: string;
  defaultText: string;
  matchPatterns: string[];
}

export const CORE_CERTIFICATE_ELEMENTS: FieldDefinition[] = [
  {
    key: 'organization',
    label: 'Issuing Organization Name',
    category: 'core',
    requirement: 'Required',
    purpose: 'Institute, company, university, or academy',
    example: 'Global Leadership Institute',
    defaultText: '{{organization}}',
    matchPatterns: ['organization', 'issuing organization', 'company', 'institute', 'university', 'academy', 'institution', 'college', 'school']
  },
  {
    key: 'logo',
    label: 'Organization Logo',
    category: 'core',
    requirement: 'Optional; strongly recommended',
    purpose: 'Uploaded logo of the issuing body',
    example: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=150',
    defaultText: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=150',
    matchPatterns: ['logo', 'organization logo', 'badge logo']
  },
  {
    key: 'title',
    label: 'Certificate Title',
    category: 'core',
    requirement: 'Required',
    purpose: 'Certificate of Completion / Achievement / Participation',
    example: 'CERTIFICATE OF COMPLETION',
    defaultText: 'CERTIFICATE OF COMPLETION',
    matchPatterns: ['certificate title', 'title', 'heading', 'cert title', 'award type']
  },
  {
    key: 'certificate_id',
    label: 'Certificate Number',
    category: 'core',
    requirement: 'Required',
    purpose: 'Unique identifier, e.g. CF-2026-000123 (auto-generated)',
    example: 'CF-2026-000123',
    defaultText: 'Certificate No: {{certificate_id}}',
    matchPatterns: ['certificate id', 'certificate number', 'cert id', 'cert no', 'serial no', 'credential id', 'cf-']
  },
  {
    key: 'name',
    label: 'Student / Recipient Name',
    category: 'core',
    requirement: 'Required',
    purpose: 'Name printed prominently on certificate',
    example: 'Ananya Sharma',
    defaultText: '{{name}}',
    matchPatterns: ['name', 'full name', 'student name', 'recipient name', 'candidate name', 'participant', 'attendee', 'student']
  },
  {
    key: 'course',
    label: 'Course / Program / Achievement',
    category: 'core',
    requirement: 'Required',
    purpose: 'Title of the course, workshop, or milestone completed',
    example: 'Digital Marketing Masterclass',
    defaultText: '{{course}}',
    matchPatterns: ['course', 'course name', 'program', 'achievement', 'workshop', 'topic', 'training', 'event', 'track']
  },
  {
    key: 'statement',
    label: 'Certification Statement',
    category: 'core',
    requirement: 'Required',
    purpose: 'Formal statement confirming completion',
    example: 'This certifies that {{name}} has successfully completed the prescribed curriculum and demonstrated mastery in {{course}}.',
    defaultText: 'This certifies that {{name}} has successfully completed {{course}}.',
    matchPatterns: ['statement', 'certification statement', 'description', 'certifies that']
  },
  {
    key: 'issue_date',
    label: 'Issue Date',
    category: 'core',
    requirement: 'Required',
    purpose: 'Date the certificate was formally issued',
    example: 'October 15, 2026',
    defaultText: 'Issued on: {{issue_date}}',
    matchPatterns: ['issue date', 'issued on', 'date issued', 'awarded on', 'awarded date', 'issue_date', 'date']
  },
  {
    key: 'completion_date',
    label: 'Completion Date',
    category: 'core',
    requirement: 'Required',
    purpose: 'Date the course was completed (kept separate from issue date)',
    example: 'September 30, 2026',
    defaultText: 'Course completed on: {{completion_date}}',
    matchPatterns: ['completion date', 'course completion date', 'completed on', 'course end date', 'end date', 'completion_date']
  },
  {
    key: 'qr',
    label: 'Verification QR Code',
    category: 'core',
    requirement: 'Recommended',
    purpose: 'Scannable code opening certificate verification page',
    example: 'https://certiforge.io/verify/{{certificate_id}}',
    defaultText: 'https://certiforge.io/verify/{{certificate_id}}',
    matchPatterns: ['qr', 'qr code', 'verification qr']
  },
  {
    key: 'verification_url',
    label: 'Verification URL',
    category: 'core',
    requirement: 'Recommended',
    purpose: 'Direct link users can open or type manually',
    example: 'verify.certiforge.io/{{certificate_id}}',
    defaultText: 'Verify at: certiforge.io/verify/{{certificate_id}}',
    matchPatterns: ['verification url', 'verify url', 'validation link', 'url']
  }
];

export const OPTIONAL_STUDENT_COURSE_ELEMENTS: FieldDefinition[] = [
  {
    key: 'student_id',
    label: 'Student ID / Enrollment Number',
    category: 'optional_student_course',
    requirement: 'Optional',
    purpose: 'Matching certificates to official student records',
    example: 'STU-2026-8941',
    defaultText: 'Student ID: {{student_id}}',
    matchPatterns: ['student id', 'enrollment number', 'enrollment no', 'registration no', 'roll no', 'reg no', 'id number', 'student_id']
  },
  {
    key: 'start_date',
    label: 'Joining / Start Date',
    category: 'optional_student_course',
    requirement: 'Optional',
    purpose: 'Showing the training period duration',
    example: 'July 1, 2026',
    defaultText: 'Commenced: {{start_date}}',
    matchPatterns: ['joining date', 'start date', 'admission date', 'commenced on', 'start_date']
  },
  {
    key: 'course_duration',
    label: 'Course Duration',
    category: 'optional_student_course',
    requirement: 'Optional',
    purpose: 'Duration e.g. "12 weeks" or "120 learning hours"',
    example: '12 Weeks (120 Hours)',
    defaultText: 'Duration: {{course_duration}}',
    matchPatterns: ['course duration', 'duration', 'learning hours', 'training hours', 'hours', 'weeks', 'course_duration']
  },
  {
    key: 'grade',
    label: 'Grade / Score / Percentage',
    category: 'optional_student_course',
    requirement: 'Optional',
    purpose: 'Assessed courses performance metrics',
    example: 'Grade: A+ (94%)',
    defaultText: 'Grade: {{grade}}',
    matchPatterns: ['grade', 'score', 'percentage', 'marks', 'performance', 'result']
  },
  {
    key: 'achievement_level',
    label: 'Achievement Level',
    category: 'optional_student_course',
    requirement: 'Optional',
    purpose: 'Distinction, merit, beginner, advanced',
    example: 'With Distinction',
    defaultText: 'Level: {{achievement_level}}',
    matchPatterns: ['achievement level', 'achievement', 'distinction', 'merit', 'level', 'achievement_level']
  },
  {
    key: 'batch',
    label: 'Batch / Cohort',
    category: 'optional_student_course',
    requirement: 'Optional',
    purpose: 'Managing multiple student groups',
    example: 'Cohort 2026-B',
    defaultText: 'Batch: {{batch}}',
    matchPatterns: ['batch', 'cohort', 'class', 'group', 'intake']
  },
  {
    key: 'specialization',
    label: 'Specialization / Modules',
    category: 'optional_student_course',
    requirement: 'Optional',
    purpose: 'Describing what the student studied',
    example: 'Major: Distributed Cloud Systems',
    defaultText: 'Specialization: {{specialization}}',
    matchPatterns: ['specialization', 'module', 'modules', 'major', 'track', 'concentration']
  },
  {
    key: 'learning_mode',
    label: 'Mode of Learning',
    category: 'optional_student_course',
    requirement: 'Optional',
    purpose: 'Online, offline, or hybrid mode',
    example: 'Online Interactive',
    defaultText: 'Mode: {{learning_mode}}',
    matchPatterns: ['mode of learning', 'mode', 'learning mode', 'delivery mode', 'learning_mode']
  },
  {
    key: 'training_location',
    label: 'Training Location',
    category: 'optional_student_course',
    requirement: 'Optional',
    purpose: 'Campus, city, or learning center',
    example: 'San Francisco Campus',
    defaultText: 'Campus: {{training_location}}',
    matchPatterns: ['training location', 'location', 'campus', 'center', 'city', 'training_location']
  },
  {
    key: 'accreditation',
    label: 'Accreditation Details',
    category: 'optional_student_course',
    requirement: 'Optional',
    purpose: 'Only when the issuer has valid accreditation',
    example: 'Accredited by ISO 9001:2015 & ANSI/IACET',
    defaultText: 'Accreditation: {{accreditation}}',
    matchPatterns: ['accreditation details', 'accreditation', 'accredited by', 'affiliated to']
  },
  {
    key: 'expiry_date',
    label: 'Expiry Date',
    category: 'optional_student_course',
    requirement: 'Optional',
    purpose: 'Certifications that require renewal',
    example: 'Valid Until: October 2029',
    defaultText: 'Expires on: {{expiry_date}}',
    matchPatterns: ['expiry date', 'valid until', 'expiration date', 'expires on', 'expiry_date']
  },
  {
    key: 'credits',
    label: 'Credits / CPD Hours',
    category: 'optional_student_course',
    requirement: 'Optional',
    purpose: 'Programs that award recognized learning credits',
    example: '15.0 CPD Credits',
    defaultText: 'Credits: {{credits}}',
    matchPatterns: ['credits', 'cpd hours', 'credit hours', 'ceu', 'cpd']
  }
];

export interface SignatoryDefinition {
  id: string;
  role: 'authorized_issuer' | 'trainer' | 'principal' | 'exam_controller' | 'partner_rep';
  titleLabel: string;
  typicalUse: string;
  defaultStatus: 'Enabled' | 'Optional';
  defaultName: string;
  defaultTitle: string;
}

export const SIGNATORY_DEFINITIONS: SignatoryDefinition[] = [
  {
    id: 'sig-authorized-issuer',
    role: 'authorized_issuer',
    titleLabel: 'Authorized issuer / director',
    typicalUse: 'Confirms issuance by the organization',
    defaultStatus: 'Enabled',
    defaultName: 'Dr. Arthur Sterling',
    defaultTitle: 'Executive Director'
  },
  {
    id: 'sig-trainer',
    role: 'trainer',
    titleLabel: 'Trainer / instructor',
    typicalUse: 'Confirms course delivery',
    defaultStatus: 'Optional',
    defaultName: 'Prof. Sarah Jenkins',
    defaultTitle: 'Lead Instructor & Mentor'
  },
  {
    id: 'sig-principal',
    role: 'principal',
    titleLabel: 'Principal / academic head',
    typicalUse: 'Academic approval',
    defaultStatus: 'Optional',
    defaultName: 'Dean Robert Vance',
    defaultTitle: 'Principal & Head of Academics'
  },
  {
    id: 'sig-exam-controller',
    role: 'exam_controller',
    titleLabel: 'Examination controller / assessor',
    typicalUse: 'Confirms assessment results',
    defaultStatus: 'Optional',
    defaultName: 'Elena Rostova',
    defaultTitle: 'Controller of Examinations'
  },
  {
    id: 'sig-partner-rep',
    role: 'partner_rep',
    titleLabel: 'Partner organization representative',
    typicalUse: 'Jointly issued programs',
    defaultStatus: 'Optional',
    defaultName: 'Marcus Aurel',
    defaultTitle: 'Partner Alliance Representative'
  }
];
