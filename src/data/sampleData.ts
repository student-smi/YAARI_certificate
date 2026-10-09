import { Project, Recipient } from '../types';

export const SAMPLE_RECIPIENTS_RAW = [
  { 
    name: 'Ananya Sharma', 
    studentId: 'STU-2026-8941',
    course: 'Digital Marketing Masterclass', 
    email: 'ananya.sharma@example.com', 
    issueDate: 'October 15, 2026', 
    completionDate: 'September 30, 2026',
    duration: '12 Weeks (120 Hours)',
    grade: 'A+ (96%)',
    achievementLevel: 'Distinction',
    batch: 'Cohort 2026-B',
    learningMode: 'Online Interactive',
    location: 'Digital Campus'
  },
  { 
    name: 'Rohan Patel', 
    studentId: 'STU-2026-8942',
    course: 'Digital Marketing Masterclass', 
    email: 'rohan.patel@example.com', 
    issueDate: 'October 15, 2026', 
    completionDate: 'September 30, 2026',
    duration: '12 Weeks (120 Hours)',
    grade: 'A (89%)',
    achievementLevel: 'Merit',
    batch: 'Cohort 2026-B',
    learningMode: 'Hybrid',
    location: 'Metro Learning Center'
  },
  { 
    name: 'Priya Deshmukh', 
    studentId: 'STU-2026-8943',
    course: 'Digital Marketing Masterclass', 
    email: 'priya.d@example.com', 
    issueDate: 'October 15, 2026', 
    completionDate: 'September 30, 2026',
    duration: '12 Weeks (120 Hours)',
    grade: 'A+ (94%)',
    achievementLevel: 'Distinction',
    batch: 'Cohort 2026-B',
    learningMode: 'Online Interactive',
    location: 'Digital Campus'
  },
  { 
    name: 'Kabir Mehta', 
    studentId: 'STU-2026-8944',
    course: 'Digital Marketing Masterclass', 
    email: 'kabir.mehta@example.com', 
    issueDate: 'October 15, 2026', 
    completionDate: 'September 30, 2026',
    duration: '12 Weeks (120 Hours)',
    grade: 'B+ (84%)',
    achievementLevel: 'Advanced',
    batch: 'Cohort 2026-B',
    learningMode: 'Online Interactive',
    location: 'Digital Campus'
  },
  { 
    name: 'Vikram Malhotra', 
    studentId: 'STU-2026-8945',
    course: 'Digital Marketing Masterclass', 
    email: 'vikram.m@example.com', 
    issueDate: 'October 15, 2026', 
    completionDate: 'September 30, 2026',
    duration: '12 Weeks (120 Hours)',
    grade: 'A (90%)',
    achievementLevel: 'Merit',
    batch: 'Cohort 2026-B',
    learningMode: 'Hybrid',
    location: 'Metro Learning Center'
  },
  { 
    name: 'Sneha Reddy', 
    studentId: 'STU-2026-8946',
    course: 'Digital Marketing Masterclass', 
    email: 'sneha.reddy@example.com', 
    issueDate: 'October 15, 2026', 
    completionDate: 'September 30, 2026',
    duration: '12 Weeks (120 Hours)',
    grade: 'A+ (95%)',
    achievementLevel: 'Distinction',
    batch: 'Cohort 2026-B',
    learningMode: 'Online Interactive',
    location: 'Digital Campus'
  }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-python-2026',
    name: 'Digital Marketing Masterclass',
    description: 'Comprehensive program certifying digital strategy and execution proficiency.',
    category: 'Technology & Marketing',
    status: 'completed',
    templateId: 'tpl-corporate-excellence',
    recipientsCount: 250,
    generatedCount: 250,
    emailedCount: 242,
    verifiedCount: 89,
    createdAt: '2026-09-12T09:30:00Z',
    updatedAt: '2026-10-02T14:15:00Z',
    prefix: 'CF-2026-',
    organizationName: 'Global Leadership Institute',
    fieldMapping: {
      name: 'Full Name',
      student_id: 'Student ID',
      course: 'Course Name',
      issue_date: 'Issue Date',
      completion_date: 'Completion Date',
      course_duration: 'Course Duration',
      grade: 'Grade',
      achievement_level: 'Achievement Level',
      batch: 'Batch',
      learning_mode: 'Mode of Learning',
      email: 'Email Address'
    },
    recipients: SAMPLE_RECIPIENTS_RAW.map((rec, i) => ({
      id: `rec-${i + 1}`,
      certificateId: `CF-2026-${String(i + 1).padStart(6, '0')}`,
      status: 'generated',
      data: {
        'Full Name': rec.name,
        'Student ID': rec.studentId,
        'Course Name': rec.course,
        'Issue Date': rec.issueDate,
        'Completion Date': rec.completionDate,
        'Course Duration': rec.duration,
        'Grade': rec.grade,
        'Achievement Level': rec.achievementLevel,
        'Batch': rec.batch,
        'Mode of Learning': rec.learningMode,
        'Email Address': rec.email
      }
    }))
  },
  {
    id: 'proj-leadership-corp',
    name: 'Executive Leadership Summit 2026',
    description: 'Corporate development program for senior executives and managers.',
    category: 'Corporate',
    status: 'completed',
    templateId: 'tpl-corporate-excellence',
    recipientsCount: 120,
    generatedCount: 120,
    emailedCount: 118,
    verifiedCount: 45,
    createdAt: '2026-08-15T11:00:00Z',
    updatedAt: '2026-09-20T16:00:00Z',
    prefix: 'EXEC-2026-',
    organizationName: 'Global Leadership Institute',
    fieldMapping: {
      name: 'Full Name',
      student_id: 'Student ID',
      course: 'Course Name',
      issue_date: 'Issue Date',
      completion_date: 'Completion Date',
      email: 'Email Address'
    },
    recipients: SAMPLE_RECIPIENTS_RAW.slice(0, 4).map((rec, i) => ({
      id: `rec-exec-${i + 1}`,
      certificateId: `EXEC-2026-${String(i + 1).padStart(6, '0')}`,
      status: 'generated',
      data: {
        'Full Name': rec.name,
        'Student ID': rec.studentId,
        'Course Name': 'Strategic Business Transformation',
        'Issue Date': 'September 20, 2026',
        'Completion Date': 'September 15, 2026',
        'Email Address': rec.email
      }
    }))
  }
];
