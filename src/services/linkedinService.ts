/**
 * LinkedIn Official Certification and Viral Sharing Service
 * Implements LinkedIn's official "Add to Profile" certification URL protocol:
 * https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME...
 */

export interface LinkedInCertificationParams {
  name: string;              // Name of certification / course
  organizationName: string;  // Issuing Organization
  issueDate?: string;        // Date of issue (e.g. "October 15, 2026" or "2026-10-15")
  certId?: string;           // Unique Credential ID (e.g. "CERT-2026-00001")
  certUrl?: string;          // Direct verification link
}

/**
 * Extracts 4-digit year and 1-12 month integer from diverse date formats
 */
export function parseDateForLinkedIn(dateStr?: string): { year?: number; month?: number } {
  if (!dateStr) {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  }

  const clean = dateStr.trim();

  // Try standard Date parsing
  const parsed = new Date(clean);
  if (!isNaN(parsed.getTime())) {
    return {
      year: parsed.getFullYear(),
      month: parsed.getMonth() + 1
    };
  }

  // Regex for 4 digit year
  const yearMatch = clean.match(/\b(20\d{2}|19\d{2})\b/);
  const year = yearMatch ? parseInt(yearMatch[1], 10) : new Date().getFullYear();

  // Month lookup
  const monthNames = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];
  const lower = clean.toLowerCase();
  let month: number | undefined;

  for (let i = 0; i < monthNames.length; i++) {
    if (lower.includes(monthNames[i]) || lower.includes(monthNames[i].slice(0, 3))) {
      month = i + 1;
      break;
    }
  }

  // Check DD/MM/YYYY or MM/DD/YYYY numeric patterns
  if (!month) {
    const numMatches = clean.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.]\d{2,4}/);
    if (numMatches) {
      const candidate1 = parseInt(numMatches[1], 10);
      const candidate2 = parseInt(numMatches[2], 10);
      if (candidate1 <= 12) month = candidate1;
      else if (candidate2 <= 12) month = candidate2;
    }
  }

  return { year, month: month || 1 };
}

/**
 * Generates the official LinkedIn "Add to Profile" 1-Click Certification URL
 */
export function generateLinkedInAddCertificationUrl(params: LinkedInCertificationParams): string {
  const baseUrl = 'https://www.linkedin.com/profile/add';
  const queryParams = new URLSearchParams();

  queryParams.append('startTask', 'CERTIFICATION_NAME');
  queryParams.append('name', params.name || 'Professional Certificate');
  queryParams.append('organizationName', params.organizationName || 'CertiForge Verified Issuer');

  const { year, month } = parseDateForLinkedIn(params.issueDate);
  if (year) queryParams.append('issueYear', year.toString());
  if (month) queryParams.append('issueMonth', month.toString());

  if (params.certId) {
    queryParams.append('certId', params.certId);
  }

  if (params.certUrl) {
    queryParams.append('certUrl', params.certUrl);
  }

  return `${baseUrl}?${queryParams.toString()}`;
}

/**
 * Generates LinkedIn Feed Post Share URL
 */
export function generateLinkedInShareFeedUrl(certUrl: string): string {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certUrl)}`;
}

/**
 * Generates ready-to-use celebration post text for the recipient to copy and share on LinkedIn feed
 */
export function generateLinkedInPostText(params: {
  recipientName: string;
  courseName: string;
  organizationName: string;
  certId: string;
  verifyUrl: string;
}): string {
  const hashtagCourse = params.courseName
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 20);

  return `🎓 I am thrilled to share that I have earned my official certification in "${params.courseName}" from ${params.organizationName}!

📜 Credential ID: ${params.certId}
🔗 Verify Authenticity: ${params.verifyUrl}

Special thanks to my instructors and mentors for this learning milestone! 🚀

#Certificate #Achievement #${hashtagCourse ? hashtagCourse + ' ' : ''}#ProfessionalDevelopment #CertiForge`;
}
