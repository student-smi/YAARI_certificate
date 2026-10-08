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

/**
 * Heuristic auto-mapping between certificate fields and spreadsheet column headers
 */
export const suggestFieldMappings = (
  templateFields: string[], 
  availableHeaders: string[]
): Record<string, string> => {
  const mapping: Record<string, string> = {};

  const matchMap: Record<string, string[]> = {
    name: ['name', 'full name', 'student name', 'recipient name', 'candidate name', 'participant', 'attendee'],
    course: ['course', 'course name', 'program', 'workshop', 'topic', 'training', 'event', 'track'],
    date: ['date', 'issue date', 'completion date', 'conferred date', 'awarded on', 'awarded date'],
    email: ['email', 'email address', 'recipient email', 'mail', 'work email'],
    certificate_id: ['certificate id', 'cert id', 'id', 'credential id', 'serial no', 'roll no'],
    organization: ['organization', 'company', 'institute', 'department', 'college', 'school'],
    grade: ['grade', 'score', 'marks', 'performance', 'percentage', 'result']
  };

  templateFields.forEach(field => {
    const targets = matchMap[field.toLowerCase()] || [field.toLowerCase()];
    
    // Find best header match
    const found = availableHeaders.find(h => {
      const hClean = h.toLowerCase().trim();
      return targets.some(t => hClean === t || hClean.includes(t) || t.includes(hClean));
    });

    if (found) {
      mapping[field] = found;
    } else {
      // Default fallback if identical
      const exact = availableHeaders.find(h => h.toLowerCase() === field.toLowerCase());
      if (exact) mapping[field] = exact;
    }
  });

  return mapping;
};

/**
 * Download sample Excel spreadsheet
 */
export const downloadSampleExcel = () => {
  const sampleData = [
    {
      'Full Name': 'Aarav Sharma',
      'Course Name': 'Advanced Full-Stack AI Engineering',
      'Completion Date': 'October 15, 2026',
      'Email Address': 'aarav.sharma@example.com',
      'Grade': 'Distinction',
      'Organization': 'Tech Academy Global'
    },
    {
      'Full Name': 'Priya Deshmukh',
      'Course Name': 'Advanced Full-Stack AI Engineering',
      'Completion Date': 'October 15, 2026',
      'Email Address': 'priya.d@example.com',
      'Grade': 'A+',
      'Organization': 'Tech Academy Global'
    },
    {
      'Full Name': 'Rohan Patel',
      'Course Name': 'Advanced Full-Stack AI Engineering',
      'Completion Date': 'October 15, 2026',
      'Email Address': 'rohan.patel@example.com',
      'Grade': 'A',
      'Organization': 'Tech Academy Global'
    },
    {
      'Full Name': 'Ananya Iyer',
      'Course Name': 'Advanced Full-Stack AI Engineering',
      'Completion Date': 'October 15, 2026',
      'Email Address': 'ananya.iyer@example.com',
      'Grade': 'Distinction',
      'Organization': 'Tech Academy Global'
    },
    {
      'Full Name': 'Kabir Mehta',
      'Course Name': 'Advanced Full-Stack AI Engineering',
      'Completion Date': 'October 15, 2026',
      'Email Address': 'kabir.mehta@example.com',
      'Grade': 'A+',
      'Organization': 'Tech Academy Global'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Recipients');
  
  // Auto-width columns
  const wscols = [
    { wch: 22 },
    { wch: 38 },
    { wch: 20 },
    { wch: 30 },
    { wch: 15 },
    { wch: 25 }
  ];
  worksheet['!cols'] = wscols;

  XLSX.writeFile(workbook, 'certiforge_sample_recipients.xlsx');
};
