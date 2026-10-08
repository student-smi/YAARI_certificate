import { Project, Recipient } from '../types';

export const SAMPLE_RECIPIENTS_RAW = [
  { name: 'Aarav Patel', course: 'Full-Stack Web Development Bootcamp', email: 'aarav.patel@example.com', date: 'October 15, 2026', grade: 'A+' },
  { name: 'Priya Sharma', course: 'Full-Stack Web Development Bootcamp', email: 'priya.sharma@example.com', date: 'October 15, 2026', grade: 'A' },
  { name: 'Rohan Deshmukh', course: 'Full-Stack Web Development Bootcamp', email: 'rohan.d@example.com', date: 'October 15, 2026', grade: 'A+' },
  { name: 'Ananya Iyer', course: 'Full-Stack Web Development Bootcamp', email: 'ananya.iyer@example.com', date: 'October 15, 2026', grade: 'Distinction' },
  { name: 'Vikram Malhotra', course: 'Full-Stack Web Development Bootcamp', email: 'vikram.m@example.com', date: 'October 15, 2026', grade: 'A' },
  { name: 'Sneha Reddy', course: 'Full-Stack Web Development Bootcamp', email: 'sneha.reddy@example.com', date: 'October 15, 2026', grade: 'A+' },
  { name: 'Aditya Verma', course: 'Full-Stack Web Development Bootcamp', email: 'aditya.v@example.com', date: 'October 15, 2026', grade: 'A' },
  { name: 'Neha Kulkarni', course: 'Full-Stack Web Development Bootcamp', email: 'neha.k@example.com', date: 'October 15, 2026', grade: 'Distinction' },
  { name: 'Kabir Mehta', course: 'Full-Stack Web Development Bootcamp', email: 'kabir.mehta@example.com', date: 'October 15, 2026', grade: 'A+' },
  { name: 'Ishita Sen', course: 'Full-Stack Web Development Bootcamp', email: 'ishita.sen@example.com', date: 'October 15, 2026', grade: 'A' },
  { name: 'Karan Kapoor', course: 'Full-Stack Web Development Bootcamp', email: 'karan.k@example.com', date: 'October 15, 2026', grade: 'A+' },
  { name: 'Tanvi Joshi', course: 'Full-Stack Web Development Bootcamp', email: 'tanvi.joshi@example.com', date: 'October 15, 2026', grade: 'Distinction' }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-python-2026',
    name: 'Python Masterclass & Data Science',
    description: 'Annual training program for tech cohorts and university seniors.',
    category: 'Technology & AI',
    status: 'completed',
    templateId: 'tpl-tech-bootcamp',
    recipientsCount: 250,
    generatedCount: 250,
    emailedCount: 242,
    verifiedCount: 89,
    createdAt: '2026-09-12T09:30:00Z',
    updatedAt: '2026-10-02T14:15:00Z',
    prefix: 'CERT-2026-',
    organizationName: 'DevStudio Academy',
    fieldMapping: {
      name: 'Full Name',
      course: 'Course Name',
      date: 'Completion Date',
      email: 'Email Address'
    },
    recipients: SAMPLE_RECIPIENTS_RAW.map((rec, i) => ({
      id: `rec-${i + 1}`,
      certificateId: `CERT-2026-${String(i + 1).padStart(5, '0')}`,
      status: 'generated',
      data: {
        'Full Name': rec.name,
        'Course Name': rec.course,
        'Completion Date': rec.date,
        'Email Address': rec.email,
        'Grade': rec.grade
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
      course: 'Track',
      date: 'Date',
      email: 'Work Email'
    },
    recipients: SAMPLE_RECIPIENTS_RAW.slice(0, 5).map((rec, i) => ({
      id: `rec-exec-${i + 1}`,
      certificateId: `EXEC-2026-${String(i + 1).padStart(5, '0')}`,
      status: 'generated',
      data: {
        'Full Name': rec.name,
        'Track': 'Strategic Business Transformation',
        'Date': 'September 18, 2026',
        'Work Email': rec.email
      }
    }))
  },
  {
    id: 'proj-hackathon-fall',
    name: 'Global Innovation Hackathon',
    description: 'Certificate distribution for 800+ international participants and mentors.',
    category: 'Event & Hackathon',
    status: 'ready',
    templateId: 'tpl-appreciation-honors',
    recipientsCount: 840,
    generatedCount: 0,
    emailedCount: 0,
    verifiedCount: 0,
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: '2026-10-07T12:00:00Z',
    prefix: 'HACK-2026-',
    organizationName: 'Innovation League',
    fieldMapping: {
      name: 'Full Name',
      course: 'Track',
      date: 'Date',
      email: 'Email'
    },
    recipients: SAMPLE_RECIPIENTS_RAW.map((rec, i) => ({
      id: `rec-hack-${i + 1}`,
      certificateId: `HACK-2026-${String(i + 1).padStart(5, '0')}`,
      status: 'valid',
      data: {
        'Full Name': rec.name,
        'Track': 'AI & Sustainable Tech',
        'Date': 'October 05, 2026',
        'Email': rec.email
      }
    }))
  }
];
