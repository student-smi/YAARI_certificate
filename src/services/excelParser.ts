import * as XLSX from 'xlsx';
import { Recipient } from '../types';

export interface ParseResult {
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
  validRowsCount: number;
  errorRowsCount: number;
  errors: { rowIndex: number; field: string; message: string }[];
}

export const parseSpreadsheetFile = async (file: File): Promise<ParseResult> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON with raw string format
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '', raw: false });

        if (!rawJson || rawJson.length === 0) {
          throw new Error('The uploaded spreadsheet contains no data or rows.');
        }

        // Extract headers from keys of the first row
        const headers = Object.keys(rawJson[0]).filter(k => k.trim() !== '');

        const errors: { rowIndex: number; field: string; message: string }[] = [];
        const rows: Record<string, string>[] = [];
        const seenIds = new Set<string>();

        rawJson.forEach((row, index) => {
          const rowNum = index + 1;
          const cleanRow: Record<string, string> = {};
          let hasAnyValue = false;

          headers.forEach(h => {
            const val = String(row[h] || '').trim();
            cleanRow[h] = val;
            if (val) hasAnyValue = true;
          });

          // Skip completely empty rows
          if (!hasAnyValue) {
            return;
          }

          // Validation heuristics
          const lowerKeys = Object.keys(cleanRow).map(k => k.toLowerCase());
          
          // Check for missing name
          const nameKey = Object.keys(cleanRow).find(k => 
            k.toLowerCase().includes('name') || k.toLowerCase().includes('recipient') || k.toLowerCase().includes('student')
          );
          if (nameKey && !cleanRow[nameKey]) {
            errors.push({ rowIndex: rowNum, field: nameKey, message: 'Recipient name is empty' });
          }

          // Check email format if email column exists
          const emailKey = Object.keys(cleanRow).find(k => k.toLowerCase().includes('email') || k.toLowerCase().includes('mail'));
          if (emailKey && cleanRow[emailKey]) {
            const emailVal = cleanRow[emailKey];
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailVal)) {
              errors.push({ rowIndex: rowNum, field: emailKey, message: `Invalid email address format "${emailVal}"` });
            }
          }

          // Check duplicate ID if ID column exists
          const idKey = Object.keys(cleanRow).find(k => k.toLowerCase().includes('id') || k.toLowerCase().includes('cert'));
          if (idKey && cleanRow[idKey]) {
            const idVal = cleanRow[idKey];
            if (seenIds.has(idVal)) {
              errors.push({ rowIndex: rowNum, field: idKey, message: `Duplicate certificate ID "${idVal}"` });
            } else {
              seenIds.add(idVal);
            }
          }

          rows.push(cleanRow);
        });

        resolve({
          headers,
          rows,
          totalRows: rows.length,
          validRowsCount: rows.length - new Set(errors.map(e => e.rowIndex)).size,
          errorRowsCount: new Set(errors.map(e => e.rowIndex)).size,
          errors
        });
      } catch (err: any) {
        reject(new Error(err.message || 'Unable to parse spreadsheet. Please ensure the file is a valid .xlsx or .csv format.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('File reading failed. Please try again.'));
    };

    reader.readAsArrayBuffer(file);
  });
};

import { CORE_CERTIFICATE_ELEMENTS, OPTIONAL_STUDENT_COURSE_ELEMENTS } from '../data/certificateFields';

/**
 * Heuristic auto-mapping between certificate fields and spreadsheet column headers
 */
export const suggestFieldMappings = (
  templateFields: string[], 
  availableHeaders: string[]
): Record<string, string> => {
  const mapping: Record<string, string> = {};

  // Build match map from our centralized certificate specification
  const matchMap: Record<string, string[]> = {};
  [...CORE_CERTIFICATE_ELEMENTS, ...OPTIONAL_STUDENT_COURSE_ELEMENTS].forEach(f => {
    matchMap[f.key] = f.matchPatterns;
  });

  // Additional aliases & fallbacks
  matchMap['email'] = ['email', 'email address', 'recipient email', 'mail', 'work email'];
  matchMap['phone'] = ['phone', 'contact', 'mobile', 'cell'];
  matchMap['date'] = ['issue date', 'completion date', 'date', 'awarded on'];

  templateFields.forEach(field => {
    const fLower = field.toLowerCase();
    const targets = matchMap[fLower] || [fLower];
    
    // Find best header match
    const found = availableHeaders.find(h => {
      const hClean = h.toLowerCase().trim();
      return targets.some(t => hClean === t || hClean.includes(t) || t.includes(hClean));
    });

    if (found) {
      mapping[field] = found;
    } else {
      // Default fallback if identical
      const exact = availableHeaders.find(h => h.toLowerCase() === fLower);
      if (exact) mapping[field] = exact;
    }
  });

  return mapping;
};

/**
 * Download sample Excel spreadsheet with core and optional certificate fields
 */
export const downloadSampleExcel = () => {
  const sampleData = [
    {
      'Full Name': 'Ananya Sharma',
      'Student ID': 'STU-2026-8941',
      'Course Name': 'Digital Marketing Masterclass',
      'Issuing Organization': 'Global Institute of Marketing',
      'Issue Date': 'October 15, 2026',
      'Completion Date': 'September 30, 2026',
      'Course Duration': '12 Weeks (120 Hours)',
      'Grade': 'A+ (96%)',
      'Achievement Level': 'Distinction',
      'Batch': 'Cohort 2026-B',
      'Mode of Learning': 'Online Interactive',
      'Training Location': 'Digital Campus',
      'Email Address': 'ananya.sharma@example.com'
    },
    {
      'Full Name': 'Rohan Patel',
      'Student ID': 'STU-2026-8942',
      'Course Name': 'Digital Marketing Masterclass',
      'Issuing Organization': 'Global Institute of Marketing',
      'Issue Date': 'October 15, 2026',
      'Completion Date': 'September 30, 2026',
      'Course Duration': '12 Weeks (120 Hours)',
      'Grade': 'A (89%)',
      'Achievement Level': 'Merit',
      'Batch': 'Cohort 2026-B',
      'Mode of Learning': 'Hybrid',
      'Training Location': 'Metro Center',
      'Email Address': 'rohan.patel@example.com'
    },
    {
      'Full Name': 'Priya Deshmukh',
      'Student ID': 'STU-2026-8943',
      'Course Name': 'Digital Marketing Masterclass',
      'Issuing Organization': 'Global Institute of Marketing',
      'Issue Date': 'October 15, 2026',
      'Completion Date': 'September 30, 2026',
      'Course Duration': '12 Weeks (120 Hours)',
      'Grade': 'A+ (94%)',
      'Achievement Level': 'Distinction',
      'Batch': 'Cohort 2026-B',
      'Mode of Learning': 'Online Interactive',
      'Training Location': 'Digital Campus',
      'Email Address': 'priya.d@example.com'
    },
    {
      'Full Name': 'Kabir Mehta',
      'Student ID': 'STU-2026-8944',
      'Course Name': 'Digital Marketing Masterclass',
      'Issuing Organization': 'Global Institute of Marketing',
      'Issue Date': 'October 15, 2026',
      'Completion Date': 'September 30, 2026',
      'Course Duration': '12 Weeks (120 Hours)',
      'Grade': 'B+ (84%)',
      'Achievement Level': 'Advanced',
      'Batch': 'Cohort 2026-B',
      'Mode of Learning': 'Online Interactive',
      'Training Location': 'Digital Campus',
      'Email Address': 'kabir.mehta@example.com'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Recipients');
  
  // Auto-width columns
  const wscols = [
    { wch: 20 },
    { wch: 16 },
    { wch: 34 },
    { wch: 30 },
    { wch: 18 },
    { wch: 20 },
    { wch: 24 },
    { wch: 14 },
    { wch: 20 },
    { wch: 16 },
    { wch: 20 },
    { wch: 18 },
    { wch: 28 }
  ];
  worksheet['!cols'] = wscols;

  XLSX.writeFile(workbook, 'certicraft_sample_recipients.xlsx');
};

